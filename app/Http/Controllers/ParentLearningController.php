<?php

namespace App\Http\Controllers;

use App\Models\LearningLog;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Inertia\Inertia;

class ParentLearningController extends Controller
{
    public function index(Request $request)
    {
        $request->validate([
            'date' => ['nullable', 'date_format:Y-m-d'],
        ]);

        $user = $request->user();
        $parent = $user->parent;

        if (!$parent) {
            abort(403, 'Parent profile was not found.');
        }

        // Hanya anak yang dipautkan kepada parent ini.
        $students = $parent->students()->get();
        $studentIds = $students->pluck('student_id')->all();

        $childrenList = $students->map(function ($student) {
            return [
                'id' => (string) $student->student_id,
                'name' => $student->full_name ?? 'Child',
                'class' => $student->class_name ?? 'Playgroup',
                'age' => $student->date_of_birth
                    ? Carbon::parse($student->date_of_birth)->age . ' Years Old'
                    : 'N/A',
                'avatar' => $student->profile_photo_path
                    ? asset('storage/' . $student->profile_photo_path)
                    : null,
            ];
        })->values();

        $selectedDate = $request->input(
            'date',
            Carbon::today('Asia/Kuala_Lumpur')->format('Y-m-d')
        );

        $initialLogs = LearningLog::query()
            ->whereIn('student_id', $studentIds)
            ->where(function ($query) use ($selectedDate) {
                $query->whereDate('log_date', $selectedDate)
                    ->orWhere(function ($query) use ($selectedDate) {
                        $query->whereNull('log_date')
                            ->whereDate('created_at', $selectedDate);
                    });
            })
            ->orderByDesc('created_at')
            ->orderByDesc('id')
            ->get()
            ->map(function ($log) {
                $imageUrl = null;

                if ($log->image) {
                    $imageUrl = str_starts_with($log->image, 'http')
                        ? $log->image
                        : asset(ltrim($log->image, '/'));
                }

                $rawDate = $log->log_date ?? $log->created_at;

                $activityData = $log->activity_data;
                if (is_string($activityData)) {
                    $activityData = json_decode($activityData, true) ?? [];
                }

                return [
                    'id' => $log->id,
                    'child_id' => (string) $log->student_id,
                    'teacher_name' => $log->teacher_name ?? 'Teacher',
                    'category' => $log->category ?? 'General',
                    'time' => $log->time
                        ?? ($log->created_at
                            ? Carbon::parse($log->created_at)->format('h:i A')
                            : ''),
                    'log_date' => $rawDate
                        ? Carbon::parse($rawDate)->format('Y-m-d')
                        : null,
                    'text' => $log->text ?? '',
                    'activity_data' => $activityData,
                    'image' => $imageUrl,
                    'likes' => (int) ($log->likes ?? 0),
                    'isLikedByParent' => false,
                ];
            })
            ->values();

        return Inertia::render('Parent/ParentLearningLog', [
            'childrenList' => $childrenList,
            'initialLogs' => $initialLogs,
            'selectedDate' => $selectedDate,
            'currentUser' => [
                'name' => $user->full_name ?? 'Parent / Guardian',
                'email' => $user->email ?? '',
            ],
        ]);
    }

    public function toggleLike(Request $request, $id)
    {
        $parent = $request->user()->parent;

        if (!$parent) {
            abort(403);
        }

        $studentIds = $parent->students()
            ->pluck('students.student_id');

        $log = LearningLog::query()
            ->whereIn('student_id', $studentIds)
            ->findOrFail($id);

        $log->increment('likes');

        return back();
    }
}
