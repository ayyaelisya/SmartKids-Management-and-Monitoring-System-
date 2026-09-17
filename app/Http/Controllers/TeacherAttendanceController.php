<?php

namespace App\Http\Controllers;

use App\Models\Attendance;
use App\Models\LatePickup;
use App\Models\Student;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;

class TeacherAttendanceController extends Controller
{
    /**
     * Display the teacher attendance management dashboard.
     */
    public function index(Request $request)
    {
        $date = $request->input('date', Carbon::now('Asia/Kuala_Lumpur')->toDateString());
        $user = Auth::user();
        $teacherClass = $user->assigned_class ?? 'Butterfly Class';

        // Retrieve students with today's attendance record
        $students = Student::where('is_active', 1)
            ->with(['attendances' => function ($query) use ($date) {
                $query->where('date', $date);
            }])
            ->get()
            ->map(function ($student) {
                $attendance = $student->attendances->first();
                return [
                    'id'            => $student->student_id,
                    'name'          => $student->full_name ?? 'Unknown Student',
                    'mykid'         => $student->mykid_number ?? $student->ic_number ?? '',
                    'class_name'    => $student->class_name,
                    'qr_code_token' => $student->qr_code_token ?? $student->mykid_number ?? (string)$student->student_id,
                    'status'        => $attendance ? $attendance->status : 'Absent',
                    'check_in_time' => $attendance && $attendance->check_in_time
                        ? Carbon::parse($attendance->check_in_time)->format('h:i A')
                        : null,
                    'check_out_time' => $attendance && $attendance->check_out_time
                        ? Carbon::parse($attendance->check_out_time)->format('h:i A')
                        : null,
                    'method'        => $attendance->method ?? 'Manual',
                    'remarks'       => $attendance->remarks ?? null,
                ];
            });

        // Retrieve recent scans feed for today
        $recentScans = Attendance::with('student')
            ->where('date', $date)
            ->where(function($q) {
                $q->whereNotNull('check_in_time')
                  ->orWhereNotNull('check_out_time');
            })
            ->latest('updated_at')
            ->take(10)
            ->get()
            ->map(function ($att) {
                $scanTime = $att->check_out_time ?? $att->check_in_time;

                return [
                    'id'          => $att->id,
                    'student_id'  => $att->student_id,
                    'name'        => $att->student->full_name ?? 'Unknown Student',
                    'time'        => $scanTime ? Carbon::parse($scanTime)->format('h:i A') : '-',
                    'status'      => $att->status,
                    'type'        => $att->check_out_time ? 'Check Out' : 'Check In',
                    'is_verified' => true,
                ];
            });

        // Retrieve late pickup records for today
        $pickupRecords = LatePickup::with('student')
            ->whereHas('attendance', function ($q) use ($date) {
                $q->where('date', $date);
            })
            ->get()
            ->map(function ($pickup) {
                return [
                    'student_name'       => $pickup->student->full_name ?? 'Unknown',
                    'actual_pickup_time' => $pickup->created_at ? $pickup->created_at->format('h:i A') : '-',
                    'late_duration'      => $pickup->late_minutes . ' mins',
                    'is_late'            => true,
                ];
            });

        return Inertia::render('Teacher/AttendanceManagement', [
            'students'            => $students,
            'selectedDate'        => $date,
            'teacherClass'        => $teacherClass,
            'expectedArrivalTime' => '07:00',
            'recentScans'         => $recentScans,
            'pickupRecords'       => $pickupRecords,
        ]);
    }

    /**
     * Unified Attendance Update Endpoint (Supports QR & Manual Updates)
     */
    public function update(Request $request)
    {
        $request->validate([
            'student_id'    => 'required',
            'date'          => 'nullable|string',
            'status'        => 'required|in:Present,Late,Late Arrival,Absent,Checked Out',
            'method'        => 'nullable|string',
            'check_in_time' => 'nullable|string',
            'action'        => 'nullable|in:check_in,check_out',
        ]);

        // Support lookup via student_id or qr_code_token
        $student = Student::where('student_id', $request->student_id)
            ->orWhere('qr_code_token', $request->student_id)
            ->first();

        if (!$student) {
            return redirect()->back()->withErrors(['student_id' => 'Student record not found.']);
        }

        $now = Carbon::now('Asia/Kuala_Lumpur');
        $today = $request->date ? Carbon::parse($request->date)->toDateString() : $now->toDateString();
        $currentTime = $now->toTimeString();

        // Normalize status names
        $status = $request->status === 'Late Arrival' ? 'Late' : $request->status;

        // Use firstOrNew to prevent creating record before attribute setting
        $attendance = Attendance::firstOrNew([
            'student_id' => $student->student_id,
            'date'       => $today,
        ]);

        $attendance->status = $status;
        $attendance->method = $request->method ?? 'Manual';
        $attendance->recorded_by = Auth::id();

        if (in_array($status, ['Present', 'Late']) && !$attendance->check_in_time) {
            $attendance->check_in_time = $currentTime;
        }

        if ($status === 'Checked Out' || $request->action === 'check_out') {
            if (!$attendance->check_in_time) {
                $attendance->check_in_time = $currentTime;
            }
            $attendance->check_out_time = $currentTime;
            $attendance->save();

            $this->calculateLatePickupFee($attendance, $now);
        } else {
            $attendance->save();
        }

        return redirect()->back()->with('success', 'Attendance record updated successfully.');
    }

    /**
     * Alias method for routes expecting updateManual
     */
    public function updateManual(Request $request)
    {
        return $this->update($request);
    }

    /**
     * Legacy handler for QR code scanning
     */
    public function scanQrCode(Request $request)
    {
        $request->validate([
            'student_id' => 'required',
            'action'     => 'required|in:check_in,check_out',
        ]);

        $request->merge([
            'status' => $request->action === 'check_in' ? 'Present' : 'Checked Out',
            'method' => 'QR Scan',
        ]);

        return $this->update($request);
    }

    /**
     * Calculate late pickup penalty after 5:00 PM (RM10 flat rate)
     */
    private function calculateLatePickupFee(Attendance $attendance, Carbon $checkOutDateTime)
    {
        $closingTime = Carbon::parse($attendance->date . ' 17:00:00', 'Asia/Kuala_Lumpur');

        if ($checkOutDateTime->greaterThan($closingTime)) {
            $lateMinutes = $closingTime->diffInMinutes($checkOutDateTime);

            LatePickup::updateOrCreate(
                [
                    'attendance_id' => $attendance->id,
                    'student_id'    => $attendance->student_id,
                ],
                [
                    'late_minutes'   => $lateMinutes,
                    'calculated_fee' => 10.00,
                    'is_billed'      => false,
                ]
            );
        }
    }
}
