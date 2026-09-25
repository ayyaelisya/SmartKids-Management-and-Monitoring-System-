<?php

namespace App\Http\Controllers;

use App\Models\Package;
use App\Models\Student;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Validation\Rule;
use Illuminate\Validation\ValidationException;
use Inertia\Inertia;

class StudentController extends Controller
{
    // Display student management page
    public function index(Request $request)
    {
        $query = Student::with('package');

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

        $students = $query
            ->latest()
            ->get()
            ->map(function ($student) {
                $student->profile_image_url = $student->profile_photo_path
                    ? asset('storage/' . $student->profile_photo_path)
                    : null;

                return $student;
            });

        $packages = Package::where('status', 'active')
            ->orderBy('age_group')
            ->orderBy('monthly_fee')
            ->get();

        return Inertia::render('StudentProfiles', [
            'students' => $students,
            'packages' => $packages,
            'filters' => $request->only([
                'search',
                'class_filter',
            ]),
        ]);
    }

    // Register new student
    public function store(Request $request)
    {
        $validated = $request->validate([
            'profile_image' => 'nullable|image|mimes:jpg,jpeg,png,webp|max:2048',

            'full_name' => 'required|string|max:255',
            'ic_number' => 'nullable|string|unique:students,ic_number',
            'mykid_number' => 'nullable|string|unique:students,mykid_number',
            'date_of_birth' => 'nullable|date',
            'age' => 'nullable|integer',
            'birth_place' => 'nullable|string|max:255',
            'gender' => 'required|in:Boy,Girl,male,female',
            'favourite_food' => 'nullable|string|max:255',
            'birth_order' => 'nullable|integer',
            'total_siblings' => 'nullable|integer',

            'class_name' => 'required|string',
            'age_category' => 'nullable|string',
            'package_id' => 'required|exists:packages,package_id',

            'guardian_name' => 'nullable|string|max:255',
            'guardian_phone' => 'nullable|string',
            'guardian_relationship' => 'nullable|string',

            'father_name' => 'nullable|string|max:255',
            'father_ic_number' => 'nullable|string',
            'father_nationality' => 'nullable|string',
            'father_race' => 'nullable|string',
            'father_occupation' => 'nullable|string',
            'father_phone' => 'nullable|string',

            'mother_name' => 'nullable|string|max:255',
            'mother_ic_number' => 'nullable|string',
            'mother_nationality' => 'nullable|string',
            'mother_race' => 'nullable|string',
            'mother_occupation' => 'nullable|string',
            'mother_phone' => 'nullable|string',

            'home_address' => 'nullable|string',
            'email' => 'nullable|email',

            'emergency_contact_name' => 'nullable|string|max:255',
            'emergency_contact_phone' => 'nullable|string',
            'emergency_contact_relationship' => 'nullable|string',

            'selected_service' => 'nullable|string',
            'referral_source' => 'nullable|string',

            'allergies' => 'nullable|string',
            'medical_notes' => 'nullable|string',
        ]);

        // Isi medan guardian sebelum menyimpan fail gambar atau rekod.
        $validated = $this->syncPrimaryGuardian($validated);

        if ($request->hasFile('profile_image')) {
            $validated['profile_photo_path'] = $request
                ->file('profile_image')
                ->store('students/avatars', 'public');
        }

        $package = Package::findOrFail($validated['package_id']);

        $validated['selected_service'] = $package->package_name;
        $validated['age_category'] = $package->age_group;
        $validated['is_active'] = true;
        $validated['exit_reason'] = null;
        Student::create($validated);

        return redirect()
            ->back()
            ->with('success', 'Student successfully registered!');
    }

    // Update student
    public function update(Request $request, Student $student)
    {
        $validated = $request->validate([
            'profile_image' => 'nullable|image|mimes:jpg,jpeg,png,webp|max:2048',

            'full_name' => 'required|string|max:255',
'student_status' => 'required|in:Active,Withdrawn,Graduated',
            'ic_number' => [
                'nullable',
                'string',
                Rule::unique('students', 'ic_number')
                    ->ignore($student->student_id, 'student_id'),
            ],

            'mykid_number' => [
                'nullable',
                'string',
                Rule::unique('students', 'mykid_number')
                    ->ignore($student->student_id, 'student_id'),
            ],

            'date_of_birth' => 'nullable|date',
            'age' => 'nullable|integer',
            'birth_place' => 'nullable|string|max:255',
            'gender' => 'required|in:Boy,Girl,male,female',
            'favourite_food' => 'nullable|string|max:255',
            'birth_order' => 'nullable|integer',
            'total_siblings' => 'nullable|integer',

            'class_name' => 'required|string',
            'age_category' => 'nullable|string',
            'package_id' => 'required|exists:packages,package_id',

            'guardian_name' => 'nullable|string|max:255',
            'guardian_phone' => 'nullable|string',
            'guardian_relationship' => 'nullable|string',

            'father_name' => 'nullable|string|max:255',
            'father_ic_number' => 'nullable|string',
            'father_nationality' => 'nullable|string',
            'father_race' => 'nullable|string',
            'father_occupation' => 'nullable|string',
            'father_phone' => 'nullable|string',

            'mother_name' => 'nullable|string|max:255',
            'mother_ic_number' => 'nullable|string',
            'mother_nationality' => 'nullable|string',
            'mother_race' => 'nullable|string',
            'mother_occupation' => 'nullable|string',
            'mother_phone' => 'nullable|string',

            'home_address' => 'nullable|string',
            'email' => 'nullable|email',

            'emergency_contact_name' => 'nullable|string|max:255',
            'emergency_contact_phone' => 'nullable|string',
            'emergency_contact_relationship' => 'nullable|string',

            'selected_service' => 'nullable|string',
            'referral_source' => 'nullable|string',

            'allergies' => 'nullable|string',
            'medical_notes' => 'nullable|string',
        ]);

        $validated = $this->syncPrimaryGuardian($validated, $student);

        if ($request->hasFile('profile_image')) {
            if (
                $student->profile_photo_path &&
                Storage::disk('public')->exists($student->profile_photo_path)
            ) {
                Storage::disk('public')->delete(
                    $student->profile_photo_path
                );
            }

            $validated['profile_photo_path'] = $request
                ->file('profile_image')
                ->store('students/avatars', 'public');
        }

        $package = Package::findOrFail($validated['package_id']);

        $validated['selected_service'] = $package->package_name;
        $validated['age_category'] = $package->age_group;
        $status = $validated['student_status'];
        unset($validated['student_status']);

        $validated['is_active'] = $status === 'Active';
        $validated['exit_reason'] = $status === 'Active'
            ? null
            : $status;
        $student->update($validated);

        return redirect()
            ->back()
            ->with('success', 'Student record updated successfully!');
    }

    // Delete student
    public function destroy(Student $student)
    {
        if (
            $student->profile_photo_path &&
            Storage::disk('public')->exists($student->profile_photo_path)
        ) {
            Storage::disk('public')->delete(
                $student->profile_photo_path
            );
        }

        $student->delete();

        return redirect()
            ->back()
            ->with('success', 'Student record deleted successfully!');
    }

    /**
     * The form groups primary guardian details under Father/Mother.
     * The students table also requires separate guardian columns.
     */
    private function syncPrimaryGuardian(
        array $validated,
        ?Student $student = null
    ): array {
        $relationship = strtolower(trim(
            $validated['guardian_relationship']
                ?? $student?->guardian_relationship
                ?? ''
        ));

        if ($relationship === 'father') {
            $validated['guardian_name'] =
                $validated['father_name']
                ?? $student?->father_name;

            $validated['guardian_phone'] =
                $validated['father_phone']
                ?? $student?->father_phone;
        } elseif ($relationship === 'mother') {
            $validated['guardian_name'] =
                $validated['mother_name']
                ?? $student?->mother_name;

            $validated['guardian_phone'] =
                $validated['mother_phone']
                ?? $student?->mother_phone;
        } else {
            $validated['guardian_name'] =
                $validated['guardian_name']
                ?? $student?->guardian_name;

            $validated['guardian_phone'] =
                $validated['guardian_phone']
                ?? $student?->guardian_phone;
        }

        if (
            blank($validated['guardian_name']) ||
            blank($validated['guardian_phone'])
        ) {
            throw ValidationException::withMessages([
                'guardian_name' =>
                    'Please provide the name and phone number of the selected primary guardian.',
            ]);
        }

        return $validated;
    }
}
