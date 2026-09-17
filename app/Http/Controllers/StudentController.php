<?php

namespace App\Http\Controllers;

use App\Models\Student;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Validation\Rule;
use Illuminate\Support\Facades\Storage;

class StudentController extends Controller
{
    public function index(Request $request)
    {
        $query = Student::query();

        if ($request->search) {
            $query->where(function ($q) use ($request) {
                $q->where('full_name', 'like', '%' . $request->search . '%')
                  ->orWhere('ic_number', 'like', '%' . $request->search . '%')
                  ->orWhere('mykid_number', 'like', '%' . $request->search . '%')
                  ->orWhere('guardian_name', 'like', '%' . $request->search . '%')
                  ->orWhere('father_name', 'like', '%' . $request->search . '%')
                  ->orWhere('mother_name', 'like', '%' . $request->search . '%');
            });
        }

        if ($request->class_filter) {
            $query->where('class_name', $request->class_filter);
        }

        $students = $query->latest()->get()->map(function ($student) {
            $student->profile_image_url = $student->profile_photo_path
                ? asset('storage/' . $student->profile_photo_path)
                : null;
            return $student;
        });

        return Inertia::render('StudentProfiles', [
            'students' => $students,
            'filters'  => $request->only(['search', 'class_filter']),
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            // Image Upload
            'profile_image'                  => 'nullable|image|mimes:jpg,jpeg,png,webp|max:2048',

            // Student Information
            'full_name'                      => 'required|string|max:255',
            'ic_number'                      => 'nullable|string|unique:students,ic_number',
            'mykid_number'                   => 'nullable|string|unique:students,mykid_number',
            'date_of_birth'                  => 'nullable|date',
            'age'                            => 'nullable|integer',
            'birth_place'                    => 'nullable|string|max:255',
            'gender'                         => 'required|in:Boy,Girl,male,female',
            'favourite_food'                 => 'nullable|string|max:255',
            'birth_order'                    => 'nullable|integer',
            'total_siblings'                 => 'nullable|integer',

            // Kindergarten Information
            'class_name'                     => 'required|string',
            'age_category'                   => 'nullable|string',

            // Primary Guardian Information
            'guardian_name'                  => 'nullable|string|max:255',
            'guardian_phone'                 => 'nullable|string',
            'guardian_relationship'          => 'nullable|string',

            // Father's Information
            'father_name'                    => 'nullable|string|max:255',
            'father_ic_number'               => 'nullable|string',
            'father_nationality'             => 'nullable|string',
            'father_race'                    => 'nullable|string',
            'father_occupation'              => 'nullable|string',
            'father_phone'                   => 'nullable|string',

            // Mother's Information
            'mother_name'                    => 'nullable|string|max:255',
            'mother_ic_number'               => 'nullable|string',
            'mother_nationality'             => 'nullable|string',
            'mother_race'                    => 'nullable|string',
            'mother_occupation'              => 'nullable|string',
            'mother_phone'                   => 'nullable|string',

            // Contact Information
            'home_address'                   => 'nullable|string',
            'email'                          => 'nullable|email',

            // Emergency Contact
            'emergency_contact_name'         => 'nullable|string|max:255',
            'emergency_contact_phone'        => 'nullable|string',
            'emergency_contact_relationship' => 'nullable|string',

            // Registration Information
            'selected_service'               => 'nullable|string',
            'referral_source'                => 'nullable|string',

            // Medical Information
            'allergies'                      => 'nullable|string',
            'medical_notes'                  => 'nullable|string',
        ]);

        if ($request->hasFile('profile_image')) {
            $path = $request->file('profile_image')->store('students/avatars', 'public');
            $validated['profile_photo_path'] = $path;
        }

        Student::create($validated);

        return redirect()->back()->with('success', 'Student successfully registered!');
    }

    public function update(Request $request, Student $student)
    {
        $validated = $request->validate([
            // Image Upload
            'profile_image'                  => 'nullable|image|mimes:jpg,jpeg,png,webp|max:2048',

            // Student Information
            'full_name'                      => 'required|string|max:255',
            'ic_number'                      => ['nullable', 'string', Rule::unique('students', 'ic_number')->ignore($student->student_id, 'student_id')],
            'mykid_number'                   => ['nullable', 'string', Rule::unique('students', 'mykid_number')->ignore($student->student_id, 'student_id')],
            'date_of_birth'                  => 'nullable|date',
            'age'                            => 'nullable|integer',
            'birth_place'                    => 'nullable|string|max:255',
            'gender'                         => 'required|in:Boy,Girl,male,female',
            'favourite_food'                 => 'nullable|string|max:255',
            'birth_order'                    => 'nullable|integer',
            'total_siblings'                 => 'nullable|integer',

            // Kindergarten Information
            'class_name'                     => 'required|string',
            'age_category'                   => 'nullable|string',

            // Primary Guardian Information
            'guardian_name'                  => 'nullable|string|max:255',
            'guardian_phone'                 => 'nullable|string',
            'guardian_relationship'          => 'nullable|string',

            // Father's Information
            'father_name'                    => 'nullable|string|max:255',
            'father_ic_number'               => 'nullable|string',
            'father_nationality'             => 'nullable|string',
            'father_race'                    => 'nullable|string',
            'father_occupation'              => 'nullable|string',
            'father_phone'                   => 'nullable|string',

            // Mother's Information
            'mother_name'                    => 'nullable|string|max:255',
            'mother_ic_number'               => 'nullable|string',
            'mother_nationality'             => 'nullable|string',
            'mother_race'                    => 'nullable|string',
            'mother_occupation'              => 'nullable|string',
            'mother_phone'                   => 'nullable|string',

            // Contact Information
            'home_address'                   => 'nullable|string',
            'email'                          => 'nullable|email',

            // Emergency Contact
            'emergency_contact_name'         => 'nullable|string|max:255',
            'emergency_contact_phone'        => 'nullable|string',
            'emergency_contact_relationship' => 'nullable|string',

            // Registration Information
            'selected_service'               => 'nullable|string',
            'referral_source'                => 'nullable|string',

            // Medical Information
            'allergies'                      => 'nullable|string',
            'medical_notes'                  => 'nullable|string',
        ]);

        if ($request->hasFile('profile_image')) {
            if ($student->profile_photo_path && Storage::disk('public')->exists($student->profile_photo_path)) {
                Storage::disk('public')->delete($student->profile_photo_path);
            }

            $path = $request->file('profile_image')->store('students/avatars', 'public');
            $validated['profile_photo_path'] = $path;
        }

        $student->update($validated);

        return redirect()->back()->with('success', 'Student record updated successfully!');
    }

    public function destroy(Student $student)
    {
        if ($student->profile_photo_path && Storage::disk('public')->exists($student->profile_photo_path)) {
            Storage::disk('public')->delete($student->profile_photo_path);
        }

        $student->delete();

        return redirect()->back()->with('success', 'Student record deleted successfully!');
    }
}
