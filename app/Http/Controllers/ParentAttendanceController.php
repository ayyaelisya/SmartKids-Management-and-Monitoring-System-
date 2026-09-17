<?php

namespace App\Http\Controllers;

use App\Models\Attendance;
use App\Models\Student;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;

class ParentAttendanceController extends Controller
{
    public function index(Request $request)
    {
        /** @var \App\Models\User $user */
        $user = Auth::user();

        // 1. Dapatkan anak-anak yang berhubung dengan akaun ibu bapa menggunakan Eloquent Relationship
        $studentsQuery = $user->students();

        // Backup fallback jika perhubungan pivot menggunakan parent_id dari jadual parents
        if ($studentsQuery->count() === 0 && $user->parent) {
            $studentsQuery = Student::whereIn('student_id', function ($query) use ($user) {
                $query->select('student_id')
                    ->from('parent_student')
                    ->where('parent_id', $user->parent->parent_id);
            });
        }

        $students = $studentsQuery->get();

        // Petakan senarai anak ke format 'childrenList' mengikut kehendak komponen React
        $childrenList = $students->map(function ($s) {
            return [
                'id'    => (string) ($s->student_id ?? $s->id),
                'name'  => $s->full_name ?? $s->name,
                'class' => $s->class_name ?? $s->class ?? 'N/A',
            ];
        })->values();

        $selectedMonth = $request->input('month', Carbon::now()->format('Y-m'));

        if ($childrenList->isEmpty()) {
            return Inertia::render('Parent/AttendanceHistory', [
                'childrenList'      => [],
                'selectedStudentId' => '',
                'selectedMonth'     => $selectedMonth,
                'attendances'       => [],
                'stats'             => [
                    'present'        => 0,
                    'late'           => 0,
                    'absent'         => 0,
                    'attendanceRate' => 0,
                ],
            ]);
        }

        // 2. Tentukan anak yang dipilih
        $selectedStudentId = (string) $request->input('student_id', $childrenList->first()['id']);

        // 3. Tapis mengikut bulan & julat tarikh
        $startDate = Carbon::parse($selectedMonth)->startOfMonth()->toDateString();
        $endDate   = Carbon::parse($selectedMonth)->endOfMonth()->toDateString();

        // 4. Ambil rekod kehadiran
        $attendances = Attendance::where('student_id', $selectedStudentId)
            ->whereBetween('date', [$startDate, $endDate])
            ->orderBy('date', 'desc')
            ->get()
            ->map(function ($att) {
                return [
                    'id'                 => $att->id,
                    'date'               => Carbon::parse($att->date)->format('Y-m-d'),
                    'formatted_date'     => Carbon::parse($att->date)->format('d M Y (D)'),
                    'status'             => $att->status ?? 'Absent',
                    'check_in_time'      => $att->check_in_time ? Carbon::parse($att->check_in_time)->format('h:i A') : '-',
                    'check_out_time'     => $att->check_out_time ? Carbon::parse($att->check_out_time)->format('h:i A') : '-',
                    'absence_reason'     => $att->absence_reason,
                    'absence_attachment' => $att->absence_attachment ? asset('storage/' . str_replace('/storage/', '', $att->absence_attachment)) : null,
                    'absence_status'     => $att->absence_status ?? 'Pending',
                ];
            });

        // 5. Pengiraan Statistik Kehadiran
        $totalDays    = $attendances->count();
        $presentCount = $attendances->whereIn('status', ['Present', 'Checked Out'])->count();
        $lateCount    = $attendances->where('status', 'Late')->count();
        $absentCount  = $attendances->where('status', 'Absent')->count();

        $attendanceRate = $totalDays > 0
            ? round((($presentCount + $lateCount) / $totalDays) * 100)
            : 0;

        return Inertia::render('Parent/AttendanceHistory', [
            'childrenList'      => $childrenList,
            'selectedStudentId' => $selectedStudentId,
            'selectedMonth'     => $selectedMonth,
            'attendances'       => $attendances,
            'stats'             => [
                'present'        => $presentCount,
                'late'           => $lateCount,
                'absent'         => $absentCount,
                'attendanceRate' => $attendanceRate,
            ],
        ]);
    }

    public function submitAbsenceReason(Request $request)
    {
        $request->validate([
            'student_id' => 'required',
            'date'       => 'required|date',
            'reason'     => 'required|string|max:500',
            'attachment' => 'nullable|file|mimes:jpg,jpeg,png,pdf|max:2048',
        ]);

        $filePath = null;
        if ($request->hasFile('attachment')) {
            $filePath = $request->file('attachment')->store('absence_attachments', 'public');
        }

        Attendance::updateOrCreate(
            [
                'student_id' => $request->student_id,
                'date'       => $request->date,
            ],
            [
                'status'             => 'Absent',
                'absence_reason'     => $request->reason,
                'absence_attachment' => $filePath,
                'absence_status'     => 'Pending',
            ]
        );

        return redirect()->back()->with('success', 'Sebab ketidakhadiran berjaya dihantar.');
    }
}
