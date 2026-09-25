<?php

namespace App\Http\Controllers;

use App\Models\Student;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Inertia\Inertia;

class AdminStudentQrController extends Controller
{
    /**
     * Display student QR badges and generate missing QR tokens in database.
     */
    public function index()
    {
        // Fetch all active students
        $students = Student::where('is_active', 1)->get();

        // Iterate and generate/save token if missing
        $students->transform(function ($student) {
            if (empty($student->qr_code_token)) {
                // Generate a unique token format (e.g., STD-8A2B9C1D)
                $token = 'STD-' . Str::upper(Str::random(8));

                // Ensure token uniqueness
                while (Student::where('qr_code_token', $token)->exists()) {
                    $token = 'STD-' . Str::upper(Str::random(8));
                }

                // Save to database
                $student->qr_code_token = $token;
                $student->save();
            }

return [
    'student_id' => $student->student_id,
    'full_name' => $student->full_name,
    'name' => $student->full_name,
    'mykid' => $student->mykid_number ?? $student->ic_number ?? '',
    'class_name' => $student->class_name,
    'qr_code_token' => $student->qr_code_token,

    'profile_image_url' => $student->profile_photo_path
        ? asset('storage/' . $student->profile_photo_path)
        : null,
];
        });

return Inertia::render('StudentQrBadges', [
    'students' => $students,
    'logoUrl'  => asset('images/logo.jpg'),
]);
    }
}
