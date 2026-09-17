<?php

namespace App\Http\Controllers;

use App\Models\Student;
use App\Models\User;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Carbon\Carbon;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

class DashboardController extends Controller
{
    public function index()
    {
        $today = Carbon::today();
        $startOfMonth = Carbon::now()->startOfMonth();

        // 1. Student Metrics
        $totalStudents = Student::count();
        $totalClasses = Student::whereNotNull('class_name')
            ->distinct()
            ->count('class_name');

        // 2. Teacher & Staff Metrics
        $totalTeachers = Schema::hasColumn('users', 'role')
            ? User::whereIn('role', ['teacher', 'educator'])->count()
            : User::count();

        $totalStaff = User::count();

        // 3. Attendance Metrics
        $presentCount = 0;
        $absentCount = 0;
        $latePickupCount = 0;
        $latePickupRecords = [];

        if (Schema::hasTable('attendances')) {
            $todayAttendances = DB::table('attendances')->whereDate('date', $today);

            $presentCount = (clone $todayAttendances)->where('status', 'present')->count();
            $absentCount = (clone $todayAttendances)->where('status', 'absent')->count();

            // Semakan kolum is_late_pickup
            if (Schema::hasColumn('attendances', 'is_late_pickup')) {
                $latePickupCount = (clone $todayAttendances)->where('is_late_pickup', true)->count();

                $latePickupRecords = DB::table('attendances')
                    ->join('students', 'attendances.student_id', '=', 'students.id')
                    ->whereDate('attendances.date', $today)
                    ->where('attendances.is_late_pickup', true)
                    ->select(
                        'students.name as student_name',
                        'attendances.expected_pickup_time',
                        'attendances.actual_pickup_time',
                        'attendances.late_duration_minutes'
                    )
                    ->limit(5)
                    ->get()
                    ->map(function ($item) {
                        return [
                            'student_name' => $item->student_name,
                            'expected_pickup' => $item->expected_pickup_time ? Carbon::parse($item->expected_pickup_time)->format('g:i A') : '6:00 PM',
                            'actual_pickup' => $item->actual_pickup_time ? Carbon::parse($item->actual_pickup_time)->format('g:i A') : '6:20 PM',
                            'late_duration' => ($item->late_duration_minutes ?? 20) . ' mins',
                            'status' => 'Late Pickup'
                        ];
                    });
            }
        }

        $attendancePercentage = $totalStudents > 0
            ? round(($presentCount / $totalStudents) * 100, 1)
            : 0;

        // 4. Fee & Invoices Metrics
        $monthlyCollection = 0;
        $outstandingFees = 0;
        $unpaidAccountsCount = 0;
        $feeBreakdown = [
            'paid' => 0,
            'pending' => 0,
            'overdue' => 0,
        ];

        if (Schema::hasTable('invoices')) {
            $monthlyCollection = DB::table('invoices')
                ->where('status', 'paid')
                ->whereDate('paid_at', '>=', $startOfMonth)
                ->sum('amount');

            $outstandingFees = DB::table('invoices')
                ->whereIn('status', ['unpaid', 'overdue'])
                ->sum('amount');

            $unpaidAccountsCount = DB::table('invoices')
                ->whereIn('status', ['unpaid', 'overdue'])
                ->distinct('student_id')
                ->count('student_id');

            $feeBreakdown['paid'] = DB::table('invoices')->where('status', 'paid')->sum('amount');
            $feeBreakdown['pending'] = DB::table('invoices')->where('status', 'unpaid')->sum('amount');
            $feeBreakdown['overdue'] = DB::table('invoices')->where('status', 'overdue')->sum('amount');
        }

        // 5. Recent Activities Log
        $recentActivities = [];
        if (Schema::hasTable('activity_logs')) {
            $recentActivities = DB::table('activity_logs')
                ->latest()
                ->limit(6)
                ->get(['id', 'icon', 'description', 'created_at']);
        }

        // 6. Recent Announcements
        $announcements = [];
        if (Schema::hasTable('announcements')) {
            $announcements = DB::table('announcements')
                ->latest()
                ->limit(3)
                ->get()
                ->map(function ($a) {
                    return [
                        'id' => $a->id,
                        'title' => $a->title,
                        'description' => $a->content ?? $a->description,
                        'date' => Carbon::parse($a->created_at)->format('M d, Y'),
                        'status' => $a->status ?? 'Published'
                    ];
                });
        }

        return Inertia::render('Dashboard', [
            'stats' => [
                'totalStudents'        => $totalStudents,
                'totalClasses'         => $totalClasses,
                'totalTeachers'        => $totalTeachers,
                'totalStaff'           => $totalStaff,
                'presentToday'         => $presentCount,
                'absentToday'          => $absentCount,
                'attendancePercentage' => $attendancePercentage,
                'latePickupsCount'     => $latePickupCount,
                'monthlyCollection'    => number_format($monthlyCollection, 2),
                'outstandingFees'      => number_format($outstandingFees, 2),
                'unpaidAccountsCount'  => $unpaidAccountsCount,
            ],
            'attendanceDetails' => [
                'present' => $presentCount,
                'absent' => $absentCount,
                'latePickup' => $latePickupCount,
            ],
            'latePickupAlerts' => $latePickupRecords,
            'feeOverview' => [
                'paid' => $feeBreakdown['paid'],
                'pending' => $feeBreakdown['pending'],
                'overdue' => $feeBreakdown['overdue'],
                'monthlyTotal' => number_format($monthlyCollection, 2),
            ],
            'recentActivities' => $recentActivities,
            'announcements' => $announcements,
        ]);
    }
}
