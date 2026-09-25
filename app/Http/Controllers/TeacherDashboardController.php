<?php

namespace App\Http\Controllers;

use App\Models\Announcement;
use App\Models\Attendance;
use App\Models\LearningLog;
use App\Models\Student;
use Carbon\Carbon;
use Inertia\Inertia;
use Inertia\Response;

class TeacherDashboardController extends Controller
{
    public function index(): Response
    {
        $today = Carbon::now('Asia/Kuala_Lumpur')->toDateString();

        // Sistem sekarang belum menyimpan kelas yang ditugaskan
        // kepada setiap guru, jadi gunakan semua murid aktif.
        $students = Student::query()
            ->where('is_active', 1)
            ->orderBy('full_name')
            ->get(['student_id', 'full_name', 'class_name']);

        $attendanceByStudent = Attendance::query()
            ->whereDate('date', $today)
            ->whereIn('student_id', $students->pluck('student_id'))
            ->get()
            ->keyBy('student_id');

        $studentList = $students->map(function ($student) use ($attendanceByStudent) {
            $attendance = $attendanceByStudent->get($student->student_id);

            return [
                'id' => $student->student_id,
                'name' => $student->full_name,
                'class_name' => $student->class_name,
                'status' => $attendance?->status,
                'check_in_time' => $attendance?->check_in_time,
            ];
        })->values();

        $studentIds = $students->pluck('student_id');

        $todayLogs = LearningLog::query()
            ->whereIn('student_id', $studentIds)
            ->whereDate('log_date', $today)
            ->with('student:student_id,full_name')
            ->latest()
            ->get();

        $updatedStudentCount = $todayLogs
            ->pluck('student_id')
            ->unique()
            ->count();

        $announcements = Announcement::query()
            ->where('status', 'Published')
            ->whereIn('target_audience', ['All', 'Teachers'])
            ->latest('published_at')
            ->take(4)
            ->get(['id', 'title', 'content', 'published_at'])
            ->map(fn ($announcement) => [
                'id' => $announcement->id,
                'title' => $announcement->title,
                'content' => $announcement->content,
                'date' => $announcement->published_at
                    ? Carbon::parse($announcement->published_at)
                        ->timezone('Asia/Kuala_Lumpur')
                        ->format('d M Y, h:i A')
                    : '',
            ]);

        return Inertia::render('Teacher/TeacherDashboard', [
            'today' => Carbon::parse($today)->format('l, d F Y'),
            'students' => $studentList,
            'updatedStudentCount' => $updatedStudentCount,
            'activities' => $todayLogs->take(5)->map(fn ($log) => [
                'id' => $log->id,
                'title' => $log->category ?: 'Learning Activity',
                'student_name' => $log->student?->full_name ?? 'Student',
                'time' => $log->time ?: '',
            ])->values(),
            'announcements' => $announcements,
        ]);
    }
}
