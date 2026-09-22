<?php

namespace App\Http\Controllers;

use App\Models\Attendance;
use App\Models\Student;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use Inertia\Inertia;

class AdminAttendanceController extends Controller
{
    /**
     * Display attendance monitoring for admin.
     */
    public function index(Request $request)
    {
        $validated = $request->validate([
            'date' => [
                'nullable',
                'date_format:Y-m-d',
            ],
        ]);

        $selectedDate = $validated['date']
            ?? Carbon::now(
                'Asia/Kuala_Lumpur'
            )->toDateString();

        $students = Student::query()
            ->with([
                'attendances' => function (
                    $query
                ) use ($selectedDate) {
                    $query
                        ->whereDate(
                            'date',
                            $selectedDate
                        )
                        ->with('latePickup');
                },
            ])
            ->orderBy('full_name')
            ->get()
            ->map(function ($student) {
                $attendance = $student
                    ->attendances
                    ->first();

                $latePickup =
                    $attendance?->latePickup;

                return [
                    'id' => $student->student_id,

                    'name' =>
                        $student->full_name
                        ?? 'Unknown Student',

                    'class_name' =>
                        $student->class_name
                        ?? 'Unassigned',

                    'attendance_id' =>
                        $attendance?->id,

                    'check_in_time' =>
                        $attendance?->check_in_time
                            ? Carbon::parse(
                                $attendance
                                    ->check_in_time
                            )->format('h:i A')
                            : null,

                    'check_out_time' =>
                        $attendance?->check_out_time
                            ? Carbon::parse(
                                $attendance
                                    ->check_out_time
                            )->format('h:i A')
                            : null,

                    'status' =>
                        $attendance?->status
                        ?? 'Absent',

                    'method' =>
                        $attendance?->method,

                    /*
                     * Parent absence submission
                     */
                    'absence_reason' =>
                        $attendance
                            ?->absence_reason,

                    'absence_attachment' =>
                        $this->getAttachmentUrl(
                            $attendance
                                ?->absence_attachment
                        ),

                    'absence_status' =>
                        $attendance
                            ?->absence_status,

                    /*
                     * Late pickup
                     */
                    'is_late_pickup' =>
                        (bool) $latePickup,

                    'late_minutes' =>
                        $latePickup
                            ?->late_minutes
                        ?? 0,

                    'late_fee' =>
                        (float) (
                            $latePickup
                                ?->calculated_fee
                            ?? 0
                        ),
                ];
            });

        $classes = Student::query()
            ->whereNotNull('class_name')
            ->where('class_name', '!=', '')
            ->distinct()
            ->orderBy('class_name')
            ->pluck('class_name')
            ->values()
            ->toArray();

        return Inertia::render(
            'Attendance',
            [
                'students' => $students,

                'selectedDate' =>
                    $selectedDate,

                'classes' => $classes,
            ]
        );
    }

    /**
     * Approve or reject a parent's absence submission.
     */
    public function updateAbsenceStatus(
        Request $request,
        Attendance $attendance
    ) {
        $validated = $request->validate([
            'absence_status' => [
                'required',
                Rule::in([
                    'Approved',
                    'Rejected',
                ]),
            ],
        ]);

        /*
         * Approval is only available when a parent
         * has submitted an absence reason.
         */
        if (! $attendance->absence_reason) {
            return redirect()
                ->back()
                ->withErrors([
                    'absence_status' =>
                        'No absence reason has been submitted for this attendance record.',
                ]);
        }

        /*
         * Only an absent attendance record should
         * have its absence submission reviewed.
         */
        if ($attendance->status !== 'Absent') {
            return redirect()
                ->back()
                ->withErrors([
                    'absence_status' =>
                        'Only an absent attendance record can be reviewed.',
                ]);
        }

        $attendance->update([
            'absence_status' =>
                $validated['absence_status'],
        ]);

        $message =
            $validated['absence_status']
            === 'Approved'
                ? 'Absence submission approved successfully.'
                : 'Absence submission rejected successfully.';

        return redirect()
            ->back()
            ->with('success', $message);
    }

    /**
     * Generate the public URL for an attachment.
     */
    private function getAttachmentUrl(
        ?string $attachment
    ): ?string {
        if (! $attachment) {
            return null;
        }

        if (
            str_starts_with(
                $attachment,
                'http://'
            )
            || str_starts_with(
                $attachment,
                'https://'
            )
        ) {
            return $attachment;
        }

        $cleanPath = ltrim(
            str_replace(
                '/storage/',
                '',
                $attachment
            ),
            '/'
        );

        return asset(
            'storage/' . $cleanPath
        );
    }
}
