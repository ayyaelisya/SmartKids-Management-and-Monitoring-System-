<?php

namespace App\Http\Controllers;

use App\Models\Student;
use Carbon\Carbon;
use Inertia\Inertia;
use Inertia\Response;

class TeacherClassController extends Controller
{
    public function index(): Response
    {
        $today = Carbon::now('Asia/Kuala_Lumpur')->toDateString();

        $students = Student::query()
            ->where('is_active', 1)
            ->with([
                'attendances' => function ($query) use ($today) {
                    $query->whereDate('date', $today);
                },
            ])
            ->orderBy('class_name')
            ->orderBy('full_name')
            ->get();

        $classes = $students
            ->groupBy(fn ($student) => $student->class_name ?: 'Unassigned Class')
            ->map(function ($classStudents, $className) {
                $studentList = $classStudents->map(function ($student) {
                    $attendance = $student->attendances->first();

                    return [
                        'id' => $student->student_id,
                        'name' => $student->full_name,
                        'gender' => $student->gender,
                        'date_of_birth' => $student->date_of_birth
                            ? Carbon::parse($student->date_of_birth)
                                ->format('d M Y')
                            : null,
                        'profile_photo_url' => $student->profile_photo_path
                            ? asset('storage/' . $student->profile_photo_path)
                            : null,
                        'guardian_name' => $student->guardian_name,
                        'guardian_phone' => $student->guardian_phone,
                        'allergies' => $student->allergies,
                        'attendance_status' => $attendance?->status,
                    ];
                })->values();

                return [
                    'name' => $className,
                    'student_count' => $studentList->count(),
                    'present_count' => $studentList
                        ->filter(fn ($student) => in_array(
                            $student['attendance_status'],
                            ['Present', 'Checked Out', 'Late', 'Late Arrival'],
                            true
                        ))
                        ->count(),
                    'absent_count' => $studentList
                        ->where('attendance_status', 'Absent')
                        ->count(),
                    'students' => $studentList,
                ];
            })
            ->values();

        return Inertia::render('Teacher/MyClasses', [
            'classes' => $classes,
            'today' => Carbon::parse($today)->format('d M Y'),
        ]);
    }
}
