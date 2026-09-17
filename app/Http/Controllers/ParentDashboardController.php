<?php

namespace App\Http\Controllers;

use App\Models\LearningLog;
use App\Models\Student;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class ParentDashboardController extends Controller
{
    public function index()
    {
        $authUser = Auth::user();

        if (!$authUser) {
            return redirect()->route('login');
        }

        $userId = $authUser->user_id ?? $authUser->id;

        // 1. Cari Rekod Parent
        $parentRecord = DB::table('parents')->where('user_id', $userId)->first();
        $parentId = $parentRecord ? ($parentRecord->parent_id ?? $parentRecord->id) : $userId;

        // 2. Dapatkan Senarai student_id Anak
        $studentIds = DB::table('parent_student')
            ->where('parent_id', $parentId)
            ->orWhere('parent_id', $userId)
            ->pluck('student_id')
            ->unique()
            ->filter()
            ->toArray();

        // 3. Tarik Data Pelajar
        $students = Student::whereIn('student_id', $studentIds)->get();
        $today = Carbon::today()->format('Y-m-d');

        // 4. Formatkan Data Anak
        $childrenList = $students->map(function ($student) use ($today) {

            // Kehadiran Hari Ini
            $attendance = DB::table('attendances')
                ->where('student_id', $student->student_id)
                ->whereDate('date', $today)
                ->first();

            $checkInTime = ($attendance && isset($attendance->check_in_time))
                ? Carbon::parse($attendance->check_in_time)->format('h:i A')
                : null;

            // Hitung Jumlah Yuran Tertunggak (Baki / Balance)
            $unpaidAmount = DB::table('monthly_fees')
                ->where('student_id', $student->student_id)
                ->whereIn('payment_status', ['Unpaid', 'Overdue', 'Partially Paid'])
                ->sum('balance');

            // Log Pembelajaran Terkini Anak (Di-comment jika belum sedia)
            $latestLog = null;
            /*
            $latestLog = LearningLog::where('student_id', $student->student_id)
                ->orderBy('created_at', 'desc')
                ->first();
            */

            return [
                'id' => (string) $student->student_id,
                'name' => $student->full_name ?? $student->name ?? 'Child',
                'class' => $student->class_name ?? 'Playgroup',
                'teacher' => $student->teacher_name ?? 'Teacher',
                'avatar' => isset($student->avatar) && $student->avatar
                    ? (str_starts_with($student->avatar, 'http') ? $student->avatar : asset(ltrim($student->avatar, '/')))
                    : null,
                'attendance' => [
                    'status' => $attendance ? ($attendance->status ?? 'Checked In') : 'Not Checked In',
                    'time' => $checkInTime,
                ],
                'fee' => [
                    'unpaid_amount' => number_format((float) $unpaidAmount, 2),
                    'is_unpaid' => $unpaidAmount > 0,
                ],
                'latest_log' => $latestLog ? [
                    'category' => $latestLog->category ?? 'General',
                    'time' => $latestLog->time ?? ($latestLog->created_at ? Carbon::parse($latestLog->created_at)->format('h:i A') : ''),
                    'text' => $latestLog->text ?? '',
                    'teacher_name' => $latestLog->teacher_name ?? 'Teacher',
                ] : null,
            ];
        });

        // Pengumuman (Kosongkan dulu jika jadual belum ada)
        $announcements = [];

        return Inertia::render('Parent/ParentDashboard', [
            'childrenList' => $childrenList,
            'announcements' => $announcements,
        ]);
    }
}
