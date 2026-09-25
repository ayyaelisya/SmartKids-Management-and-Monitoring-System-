<?php

namespace App\Http\Controllers;

use App\Models\Attendance;
use App\Models\LatePickup;
use App\Models\Student;
use App\Services\LatePickupService;
use Carbon\Carbon;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Inertia\Response;

class TeacherAttendanceController extends Controller
{
    /**
     * Display teacher attendance management.
     */
    public function index(Request $request): Response
    {
        $date = $request->input(
            'date',
            Carbon::now('Asia/Kuala_Lumpur')->toDateString()
        );

        $user = Auth::user();
        $teacherClass = $user->assigned_class ?? 'Butterfly Class';

        $students = Student::query()
            ->where('is_active', 1)
            ->with([
                'package',
                'attendances' => function ($query) use ($date) {
                    $query->whereDate('date', $date);
                },
            ])
            ->get()
            ->map(function (Student $student) {
                $attendance = $student->attendances->first();

                return [
                    'id' => $student->student_id,
                    'name' => $student->full_name ?? 'Unknown Student',
                    'mykid' => $student->mykid_number
                        ?? $student->ic_number
                        ?? '',
                    'class_name' => $student->class_name,
                    'qr_code_token' => $student->qr_code_token
                        ?? $student->mykid_number
                        ?? (string) $student->student_id,

                    // Null means attendance has not been marked yet.
                    // Only an existing attendance row may have status Absent.
                    'status' => $attendance?->status,
                    'check_in_time' => $attendance?->check_in_time
                        ? Carbon::parse($attendance->check_in_time)->format('h:i A')
                        : null,
                    'check_out_time' => $attendance?->check_out_time
                        ? Carbon::parse($attendance->check_out_time)->format('h:i A')
                        : null,
                    'method' => $attendance?->method,
                    'attendance_id' => $attendance?->id,
                    'absence_reason' => $attendance?->absence_reason,
                    'absence_attachment' => $this->getAttachmentUrl(
                        $attendance?->absence_attachment
                    ),
                    'absence_status' => $attendance?->absence_status,

                    'package' => $student->package
                        ? [
                            'package_id' => $student->package->package_id,
                            'package_name' => $student->package->package_name,
                            'age_group' => $student->package->age_group,
                            'monthly_fee' => $student->package->monthly_fee,
                            'start_time' => $student->package->start_time,
                            'end_time' => $student->package->end_time,
                        ]
                        : null,
                ];
            });

        $recentScans = Attendance::query()
            ->with('student')
            ->whereDate('date', $date)
            ->where(function ($query) {
                $query->whereNotNull('check_in_time')
                    ->orWhereNotNull('check_out_time');
            })
            ->latest('updated_at')
            ->take(10)
            ->get()
            ->map(function (Attendance $attendance) {
                $scanTime = $attendance->check_out_time
                    ?? $attendance->check_in_time;

                return [
                    'id' => $attendance->id,
                    'student_id' => $attendance->student_id,
                    'name' => $attendance->student?->full_name
                        ?? 'Unknown Student',
                    'time' => $scanTime
                        ? Carbon::parse($scanTime)->format('h:i A')
                        : '-',
                    'status' => $attendance->status,
                    'type' => $attendance->check_out_time
                        ? 'Check Out'
                        : 'Check In',
                    'is_verified' => true,
                ];
            });

        $pickupRecords = LatePickup::query()
            ->with(['student.package', 'attendance'])
            ->whereHas('attendance', function ($query) use ($date) {
                $query->whereDate('date', $date);
            })
            ->get()
            ->map(function (LatePickup $pickup) {
                return [
                    'id' => $pickup->id,
                    'student_name' => $pickup->student?->full_name
                        ?? 'Unknown',
                    'package_name' => $pickup->student?->package?->package_name
                        ?? '-',
                    'expected_pickup_time' =>
                        $pickup->student?->package?->end_time,
                    'actual_pickup_time' => $pickup->attendance?->check_out_time
                        ? Carbon::parse(
                            $pickup->attendance->check_out_time
                        )->format('h:i A')
                        : '-',
                    'late_duration' => $pickup->late_minutes . ' mins',
                    'late_minutes' => $pickup->late_minutes,
                    'late_fee' => number_format(
                        (float) $pickup->calculated_fee,
                        2,
                        '.',
                        ''
                    ),
                    'is_late' => true,
                ];
            });

        return Inertia::render('Teacher/AttendanceManagement', [
            'students' => $students,
            'selectedDate' => $date,
            'teacherClass' => $teacherClass,
            'expectedArrivalTime' => '07:00',
            'recentScans' => $recentScans,
            'pickupRecords' => $pickupRecords,
            'latePickupRate' => 0.10,
        ]);
    }

    /**
     * Update attendance using QR or manual method.
     */
    public function update(
        Request $request,
        LatePickupService $latePickupService
    ): RedirectResponse {
        $validated = $request->validate([
            'student_id' => ['required'],
            'date' => ['nullable', 'date'],
            'status' => [
                'required',
                Rule::in([
                    'Present',
                    'Late',
                    'Late Arrival',
                    'Absent',
                    'Checked Out',
                ]),
            ],
            'method' => ['nullable', 'string', 'max:100'],
            'check_in_time' => ['nullable', 'date_format:H:i:s'],
            'action' => ['nullable', Rule::in(['check_in', 'check_out'])],
        ]);

        $student = Student::query()
            ->with('package')
            ->where('student_id', $validated['student_id'])
            ->orWhere('qr_code_token', $validated['student_id'])
            ->first();

        if (! $student) {
            return back()->withErrors([
                'student_id' => 'Student record not found.',
            ]);
        }

        $now = Carbon::now('Asia/Kuala_Lumpur');
        $attendanceDate = ! empty($validated['date'])
            ? Carbon::parse($validated['date'])->toDateString()
            : $now->toDateString();
        $currentTime = $now->toTimeString();

        // Arrival time is recorded, but only late pickup affects fees.
        $status = in_array($validated['status'], ['Late', 'Late Arrival'], true)
            ? 'Present'
            : $validated['status'];
        $action = $validated['action'] ?? null;

        $attendance = Attendance::firstOrNew([
            'student_id' => $student->student_id,
            'date' => $attendanceDate,
        ]);

        // A scheduled absence can be corrected when the student arrives.
        // Keep parent-submitted and teacher-entered absences protected.
        if (
            $attendance->exists
            && $attendance->status === 'Absent'
            && $status !== 'Absent'
            && ! (
                $status === 'Present'
                && $attendance->method === 'Automatic'
                && ! $attendance->absence_reason
                && ! $attendance->absence_attachment
            )
        ) {
            return back()->withErrors([
                'attendance' =>
                    'This student has already been marked absent for this date.',
            ]);
        }

        // Check-out is only allowed after a valid check-in.
        if (
            ($status === 'Checked Out' || $action === 'check_out')
            && ! $attendance->check_in_time
        ) {
            return back()->withErrors([
                'attendance' =>
                    'The student must check in before checking out.',
            ]);
        }

        $attendance->method = $validated['method'] ?? 'Manual';
        $attendance->recorded_by = Auth::id();

        if ($status === 'Absent') {
            $attendance->status = 'Absent';
            $attendance->check_in_time = null;
            $attendance->check_out_time = null;
            $attendance->save();

            return back()->with(
                'success',
                'Student marked absent successfully.'
            );
        }

        if ($status === 'Present') {
            $attendance->status = $status;

            if (! $attendance->check_in_time) {
                $attendance->check_in_time =
                    $validated['check_in_time'] ?? $currentTime;
            }

            $attendance->save();

            return back()->with(
                'success',
                'Attendance record updated successfully.'
            );
        }

        $attendance->check_out_time = $currentTime;
        $attendance->status = 'Checked Out';
        $attendance->save();

        $latePickupService->processCheckout(
            $attendance,
            $currentTime
        );

        return back()->with(
            'success',
            'Check-out recorded successfully.'
        );
    }

    /**
     * Manual attendance update.
     */
    public function updateManual(Request $request): RedirectResponse
    {
        return app()->call([$this, 'update'], [
            'request' => $request,
        ]);
    }

    /**
     * QR attendance update.
     */
    public function scanQrCode(Request $request): RedirectResponse
    {
        $request->validate([
            'student_id' => ['required'],
            'action' => ['required', Rule::in(['check_in', 'check_out'])],
            'date' => ['nullable', 'date'],
        ]);

        $request->merge([
            'status' => $request->action === 'check_in'
                ? 'Present'
                : 'Checked Out',
            'method' => 'QR Scan',
        ]);

        return app()->call([$this, 'update'], [
            'request' => $request,
        ]);
    }

    /**
     * Approve or reject a parent's absence submission.
     */
    public function updateAbsenceStatus(
        Request $request,
        Attendance $attendance
    ): RedirectResponse {
        $validated = $request->validate([
            'absence_status' => [
                'required',
                Rule::in(['Approved', 'Rejected']),
            ],
        ]);

        if (! $attendance->absence_reason) {
            return back()->withErrors([
                'absence_status' =>
                    'No absence reason has been submitted.',
            ]);
        }

        if ($attendance->status !== 'Absent') {
            return back()->withErrors([
                'absence_status' =>
                    'Only an absent attendance record can be reviewed.',
            ]);
        }

        $attendance->update([
            'absence_status' => $validated['absence_status'],
        ]);

        $message = $validated['absence_status'] === 'Approved'
            ? 'Absence submission approved successfully.'
            : 'Absence submission rejected successfully.';

        return back()->with('success', $message);
    }

    /**
     * Generate a public attachment URL.
     */
    private function getAttachmentUrl(?string $attachment): ?string
    {
        if (! $attachment) {
            return null;
        }

        if (
            str_starts_with($attachment, 'http://')
            || str_starts_with($attachment, 'https://')
        ) {
            return $attachment;
        }

        $cleanPath = ltrim(
            str_replace('/storage/', '', $attachment),
            '/'
        );

        return asset('storage/' . $cleanPath);
    }
}
