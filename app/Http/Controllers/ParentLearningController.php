<?php

namespace App\Http\Controllers;

use App\Models\LearningLog;
use App\Models\Student;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class ParentLearningController extends Controller
{
    public function index(Request $request)
    {
        $authUser = Auth::user();

        if (!$authUser) {
            return redirect()->route('login');
        }

        $userId = $authUser->user_id ?? $authUser->id;

        // 1. Cari parent_id daripada jadual parents
        $parentRecord = DB::table('parents')->where('user_id', $userId)->first();
        $parentId = $parentRecord ? ($parentRecord->parent_id ?? $parentRecord->id) : $userId;

        // 2. Ambil senarai student_id
        $studentIds = DB::table('parent_student')
            ->where('parent_id', $parentId)
            ->orWhere('parent_id', $userId)
            ->pluck('student_id')
            ->unique()
            ->filter()
            ->toArray();

        // 3. Tarik data pelajar
        $students = Student::whereIn('student_id', $studentIds)->get();

        // 4. Formatkan senarai anak
        $childrenList = $students->map(function ($student) {
            return [
                'id' => (string) $student->student_id,
                'name' => $student->full_name ?? 'Child',
                'class' => $student->class_name ?? 'Playgroup',
                'age' => !empty($student->date_of_birth)
                    ? Carbon::parse($student->date_of_birth)->age . ' Years Old'
                    : 'N/A',
                'avatar' => isset($student->avatar) && $student->avatar
                    ? (str_starts_with($student->avatar, 'http') ? $student->avatar : asset(ltrim($student->avatar, '/')))
                    : null,
            ];
        });

        // Tarikh pilihan (Lalai: Hari ini)
        $selectedDate = $request->input('date', Carbon::today()->format('Y-m-d'));

        // 5. Tarik log pembelajaran mengikut tarikh & susunan terkini (latest)
        $initialLogs = collect();
        if (!empty($studentIds)) {
            $initialLogs = LearningLog::whereIn('student_id', $studentIds)
                ->where(function ($query) use ($selectedDate) {
                    $query->whereDate('log_date', $selectedDate)
                          ->orWhere(function ($q) use ($selectedDate) {
                              $q->whereNull('log_date')
                                ->whereDate('created_at', $selectedDate);
                          });
                })
                ->orderBy('created_at', 'desc')
                ->orderBy('id', 'desc')
                ->get()
                ->map(function ($log) {
                    $imageUrl = null;
                    if (!empty($log->image)) {
                        $imageUrl = str_starts_with($log->image, 'http')
                            ? $log->image
                            : asset(ltrim($log->image, '/'));
                    }

                    $rawDate = $log->log_date ?? $log->created_at;
                    $formattedDate = $rawDate ? Carbon::parse($rawDate)->format('Y-m-d') : date('Y-m-d');

                    $activityData = $log->activity_data;
                    if (is_string($activityData)) {
                        $activityData = json_decode($activityData, true) ?? [];
                    }

                    return [
                        'id' => $log->id,
                        'child_id' => (string) $log->student_id,
                        'teacher_name' => $log->teacher_name ?? 'Teacher',
                        'category' => $log->category ?? 'General',
                        'time' => $log->time ?? ($log->created_at ? Carbon::parse($log->created_at)->format('h:i A') : ''),
                        'log_date' => $formattedDate,
                        'text' => $log->text ?? '',
                        'activity_data' => $activityData,
                        'image' => $imageUrl,
                        'likes' => (int) ($log->likes ?? 0),
                        'isLikedByParent' => false,
                    ];
                });
        }

        return Inertia::render('Parent/ParentLearningLog', [
            'childrenList' => $childrenList,
            'initialLogs' => $initialLogs,
            'selectedDate' => $selectedDate,
            'currentUser' => [
                'name' => $authUser->full_name ?? $authUser->name ?? 'Parent / Guardian',
                'email' => $authUser->email ?? '',
            ]
        ]);
    }

    public function toggleLike($id)
    {
        $log = LearningLog::findOrFail($id);
        $log->increment('likes');

        return redirect()->back();
    }
}
