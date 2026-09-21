<?php

namespace App\Http\Controllers;

use App\Models\Attendance;
use App\Models\LatePickup;
use App\Models\Student;
use App\Services\LatePickupService;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;

class TeacherAttendanceController extends Controller
{
    // Display teacher attendance management
    public function index(Request $request)
    {
        $date = $request->input(
            'date',
            Carbon::now('Asia/Kuala_Lumpur')->toDateString()
        );

        $user = Auth::user();

        $teacherClass = $user->assigned_class
            ?? 'Butterfly Class';

        // Retrieve students with package and attendance
        $students = Student::where('is_active', 1)
            ->with([
                'package',
                'attendances' => function ($query) use ($date) {
                    $query->where('date', $date);
                }
            ])
            ->get()
            ->map(function ($student) {
                $attendance = $student->attendances->first();

                return [
                    'id' => $student->student_id,
                    'name' => $student->full_name
                        ?? 'Unknown Student',

                    'mykid' => $student->mykid_number
                        ?? $student->ic_number
                        ?? '',

                    'class_name' => $student->class_name,

                    'qr_code_token' => $student->qr_code_token
                        ?? $student->mykid_number
                        ?? (string) $student->student_id,

                    'status' => $attendance
                        ? $attendance->status
                        : 'Absent',

                    'check_in_time' =>
                        $attendance &&
                        $attendance->check_in_time
                            ? Carbon::parse(
                                $attendance->check_in_time
                            )->format('h:i A')
                            : null,

                    'check_out_time' =>
                        $attendance &&
                        $attendance->check_out_time
                            ? Carbon::parse(
                                $attendance->check_out_time
                            )->format('h:i A')
                            : null,

                    'method' => $attendance->method
                        ?? 'Manual',

                    'remarks' => $attendance->remarks
                        ?? null,

                    // Package information
                    'package' => $student->package
                        ? [
                            'package_id' =>
                                $student->package->package_id,

                            'package_name' =>
                                $student->package->package_name,

                            'age_group' =>
                                $student->package->age_group,

                            'monthly_fee' =>
                                $student->package->monthly_fee,

                            'start_time' =>
                                $student->package->start_time,

                            'end_time' =>
                                $student->package->end_time,
                        ]
                        : null,
                ];
            });

        // Retrieve recent attendance scans
        $recentScans = Attendance::with('student')
            ->where('date', $date)
            ->where(function ($query) {
                $query
                    ->whereNotNull('check_in_time')
                    ->orWhereNotNull('check_out_time');
            })
            ->latest('updated_at')
            ->take(10)
            ->get()
            ->map(function ($attendance) {
                $scanTime = $attendance->check_out_time
                    ?? $attendance->check_in_time;

                return [
                    'id' => $attendance->id,
                    'student_id' => $attendance->student_id,

                    'name' => $attendance->student->full_name
                        ?? 'Unknown Student',

                    'time' => $scanTime
                        ? Carbon::parse($scanTime)
                            ->format('h:i A')
                        : '-',

                    'status' => $attendance->status,

                    'type' => $attendance->check_out_time
                        ? 'Check Out'
                        : 'Check In',

                    'is_verified' => true,
                ];
            });

        // Retrieve late pickup records
        $pickupRecords = LatePickup::with([
            'student.package',
            'attendance'
        ])
            ->whereHas(
                'attendance',
                function ($query) use ($date) {
                    $query->where('date', $date);
                }
            )
            ->get()
            ->map(function ($pickup) {
                return [
                    'student_name' =>
                        $pickup->student->full_name
                        ?? 'Unknown',

                    'package_name' =>
                        $pickup->student?->package?->package_name
                        ?? '-',

                    'expected_pickup_time' =>
                        $pickup->student?->package?->end_time,

                    'actual_pickup_time' =>
                        $pickup->attendance?->check_out_time
                            ? Carbon::parse(
                                $pickup->attendance->check_out_time
                            )->format('h:i A')
                            : '-',

                    'late_duration' =>
                        $pickup->late_minutes . ' mins',

                    'late_minutes' =>
                        $pickup->late_minutes,

                    'late_fee' =>
                        number_format(
                            $pickup->calculated_fee,
                            2
                        ),

                    'is_late' => true,
                ];
            });

        return Inertia::render(
            'Teacher/AttendanceManagement',
            [
                'students' => $students,
                'selectedDate' => $date,
                'teacherClass' => $teacherClass,
                'expectedArrivalTime' => '07:00',
                'recentScans' => $recentScans,
                'pickupRecords' => $pickupRecords,
                'latePickupRate' => 0.10,
            ]
        );
    }

    // Update attendance using QR or manual method
    public function update(
        Request $request,
        LatePickupService $latePickupService
    ) {
        $request->validate([
            'student_id' => 'required',
            'date' => 'nullable|string',

            'status' => [
                'required',
                'in:Present,Late,Late Arrival,Absent,Checked Out'
            ],

            'method' => 'nullable|string',
            'check_in_time' => 'nullable|string',

            'action' => [
                'nullable',
                'in:check_in,check_out'
            ],
        ]);

        // Find student using ID or QR token
        $student = Student::with('package')
            ->where(
                'student_id',
                $request->student_id
            )
            ->orWhere(
                'qr_code_token',
                $request->student_id
            )
            ->first();

        if (!$student) {
            return redirect()
                ->back()
                ->withErrors([
                    'student_id' =>
                        'Student record not found.'
                ]);
        }

        $now = Carbon::now(
            'Asia/Kuala_Lumpur'
        );

        $today = $request->date
            ? Carbon::parse(
                $request->date
            )->toDateString()
            : $now->toDateString();

        $currentTime = $now->toTimeString();

        // Normalize status
        $status = $request->status === 'Late Arrival'
            ? 'Late'
            : $request->status;

        $attendance = Attendance::firstOrNew([
            'student_id' => $student->student_id,
            'date' => $today,
        ]);

        $attendance->status = $status;
        $attendance->method =
            $request->method ?? 'Manual';

        $attendance->recorded_by =
            Auth::id();

        // Record check-in
        if (
            in_array($status, ['Present', 'Late']) &&
            !$attendance->check_in_time
        ) {
            $attendance->check_in_time =
                $currentTime;
        }

        // Record check-out
        if (
            $status === 'Checked Out' ||
            $request->action === 'check_out'
        ) {
            if (!$attendance->check_in_time) {
                $attendance->check_in_time =
                    $currentTime;
            }

            $attendance->check_out_time =
                $currentTime;

            $attendance->status =
                'Checked Out';

            $attendance->save();

            // Calculate late pickup from package end time
            $latePickupService->processCheckout(
                $attendance,
                $currentTime
            );
        } else {
            $attendance->save();
        }

        return redirect()
            ->back()
            ->with(
                'success',
                'Attendance record updated successfully.'
            );
    }

    // Manual attendance update
    public function updateManual(Request $request)
    {
        return app()->call(
            [$this, 'update'],
            ['request' => $request]
        );
    }

    // QR attendance update
    public function scanQrCode(Request $request)
    {
        $request->validate([
            'student_id' => 'required',
            'action' => 'required|in:check_in,check_out',
        ]);

        $request->merge([
            'status' =>
                $request->action === 'check_in'
                    ? 'Present'
                    : 'Checked Out',

            'method' => 'QR Scan',
        ]);

        return app()->call(
            [$this, 'update'],
            ['request' => $request]
        );
    }
}
