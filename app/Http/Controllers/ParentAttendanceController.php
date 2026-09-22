<?php

namespace App\Http\Controllers;

use App\Models\Attendance;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;

class ParentAttendanceController extends Controller
{
    /**
     * Display attendance belonging to the parent's children.
     */
    public function index(Request $request)
    {
        $request->validate([
            'month' => 'nullable|date_format:Y-m',
            'student_id' => 'nullable|integer',
        ]);

        $user = $request->user();
        $parent = $user->parent;

        if (! $parent) {
            abort(403, 'Parent profile was not found.');
        }

        // Only retrieve children linked to this parent.
        $students = $parent->students()
            ->select([
                'students.student_id',
                'students.full_name',
                'students.class_name',
            ])
            ->orderBy('students.full_name')
            ->get();

        $childrenList = $students
            ->map(function ($student) {
                return [
                    'id' => (string) $student->student_id,
                    'name' => $student->full_name,
                    'class' =>
                        $student->class_name ?? 'N/A',
                ];
            })
            ->values();

        $selectedMonth = $request->input(
            'month',
            Carbon::now('Asia/Kuala_Lumpur')
                ->format('Y-m')
        );

        // Show an empty page if the parent has no linked child.
        if ($childrenList->isEmpty()) {
            return Inertia::render(
                'Parent/AttendanceHistory',
                [
                    'childrenList' => [],
                    'selectedStudentId' => '',
                    'selectedMonth' => $selectedMonth,
                    'attendances' => [],
                    'stats' => [
                        'present' => 0,
                        'late' => 0,
                        'absent' => 0,
                        'attendanceRate' => 0,
                    ],
                ]
            );
        }

        $requestedStudentId = $request->input(
            'student_id'
        );

        /*
         * Confirm that the requested student belongs to
         * the currently authenticated parent.
         */
        $selectedStudent = $requestedStudentId
            ? $students->firstWhere(
                'student_id',
                (int) $requestedStudentId
            )
            : $students->first();

        if (! $selectedStudent) {
            abort(
                403,
                'You are not allowed to view this student.'
            );
        }

        $selectedStudentId =
            $selectedStudent->student_id;

        $month = Carbon::createFromFormat(
            'Y-m',
            $selectedMonth,
            'Asia/Kuala_Lumpur'
        );

        $startDate = $month
            ->copy()
            ->startOfMonth()
            ->toDateString();

        $endDate = $month
            ->copy()
            ->endOfMonth()
            ->toDateString();

        $attendances = Attendance::where(
            'student_id',
            $selectedStudentId
        )
            ->whereBetween(
                'date',
                [$startDate, $endDate]
            )
            ->orderBy('date', 'desc')
            ->get()
            ->map(function ($attendance) {
                return [
                    'id' => $attendance->id,

                    'date' => Carbon::parse(
                        $attendance->date
                    )->format('Y-m-d'),

                    'formatted_date' => Carbon::parse(
                        $attendance->date
                    )->format('d M Y (D)'),

                    'status' =>
                        $attendance->status ?? 'Absent',

                    'check_in_time' =>
                        $attendance->check_in_time
                            ? Carbon::parse(
                                $attendance->check_in_time
                            )->format('h:i A')
                            : '-',

                    'check_out_time' =>
                        $attendance->check_out_time
                            ? Carbon::parse(
                                $attendance->check_out_time
                            )->format('h:i A')
                            : '-',

                    'absence_reason' =>
                        $attendance->absence_reason,

                    'absence_attachment' =>
                        $attendance->absence_attachment
                            ? asset(
                                'storage/' .
                                ltrim(
                                    str_replace(
                                        '/storage/',
                                        '',
                                        $attendance
                                            ->absence_attachment
                                    ),
                                    '/'
                                )
                            )
                            : null,

                    'absence_status' =>
                        $attendance->absence_status
                            ?? 'Pending',
                ];
            });

        $totalDays = $attendances->count();

        $presentCount = $attendances
            ->whereIn(
                'status',
                ['Present', 'Checked Out']
            )
            ->count();

        $lateCount = $attendances
            ->whereIn(
                'status',
                ['Late', 'Late Arrival']
            )
            ->count();

        $absentCount = $attendances
            ->where('status', 'Absent')
            ->count();

        $attendanceRate = $totalDays > 0
            ? round(
                (
                    ($presentCount + $lateCount) /
                    $totalDays
                ) * 100
            )
            : 0;

        return Inertia::render(
            'Parent/AttendanceHistory',
            [
                'childrenList' => $childrenList,

                'selectedStudentId' =>
                    (string) $selectedStudentId,

                'selectedMonth' => $selectedMonth,
                'attendances' => $attendances,

                'stats' => [
                    'present' => $presentCount,
                    'late' => $lateCount,
                    'absent' => $absentCount,
                    'attendanceRate' =>
                        $attendanceRate,
                ],
            ]
        );
    }

    /**
     * Submit an absence reason for the parent's child.
     */
    public function submitAbsenceReason(
        Request $request
    ) {
        $validated = $request->validate([
            'student_id' => [
                'required',
                'integer',
                'exists:students,student_id',
            ],

            'date' => [
                'required',
                'date',
            ],

            'reason' => [
                'required',
                'string',
                'max:500',
            ],

            'attachment' => [
                'nullable',
                'file',
                'mimes:jpg,jpeg,png,pdf',
                'max:2048',
            ],
        ]);

        $user = $request->user();
        $parent = $user->parent;

        if (! $parent) {
            abort(403, 'Parent profile was not found.');
        }

        /*
         * Security check: confirm that the student is
         * linked to the authenticated parent.
         */
        $student = $parent->students()
            ->where(
                'students.student_id',
                $validated['student_id']
            )
            ->first();

        if (! $student) {
            abort(
                403,
                'You are not allowed to submit an absence for this student.'
            );
        }

        $attendance = Attendance::where(
            'student_id',
            $student->student_id
        )
            ->whereDate('date', $validated['date'])
            ->first();

        /*
         * Do not allow a parent to replace an attendance
         * record already recorded by a teacher.
         */
        if (
            $attendance &&
            in_array(
                $attendance->status,
                [
                    'Present',
                    'Late',
                    'Late Arrival',
                    'Checked Out',
                ],
                true
            )
        ) {
            return redirect()
                ->back()
                ->withErrors([
                    'date' =>
                        'Attendance has already been recorded for this date.',
                ]);
        }

        $absenceData = [
            'status' => 'Absent',
            'absence_reason' =>
                $validated['reason'],

            'absence_status' => 'Pending',
        ];

        if ($request->hasFile('attachment')) {
            /*
             * Delete the previous attachment when
             * replacing it with a new file.
             */
            if (
                $attendance &&
                $attendance->absence_attachment
            ) {
                $oldPath = str_replace(
                    '/storage/',
                    '',
                    $attendance->absence_attachment
                );

                if (
                    Storage::disk('public')
                        ->exists($oldPath)
                ) {
                    Storage::disk('public')
                        ->delete($oldPath);
                }
            }

            $absenceData['absence_attachment'] =
                $request
                    ->file('attachment')
                    ->store(
                        'absence_attachments',
                        'public'
                    );
        }

        Attendance::updateOrCreate(
            [
                'student_id' =>
                    $student->student_id,

                'date' => $validated['date'],
            ],
            $absenceData
        );

        return redirect()
            ->back()
            ->with(
                'success',
                'Absence reason submitted successfully.'
            );
    }
}
