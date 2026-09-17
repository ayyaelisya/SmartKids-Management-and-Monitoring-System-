<?php

namespace App\Http\Controllers;

use App\Models\Student;
use Illuminate\Http\Request;
use Inertia\Inertia;

class ParentChildController extends Controller
{
    public function childProfile(Request $request)
    {
        $parent = $request->user();

        // 1. Ambil semua data anak di bawah ibu bapa ini
        $children = $parent->students()
            ->get()
            ->map(function ($child) {
                return [
                    // Critical Details (Read-Only di Frontend)
                    'id'                     => $child->student_id,
                    'full_name'              => $child->full_name,
                    'ic_number'              => $child->ic_number,
                    'mykid_number'           => $child->mykid_number,
                    'date_of_birth'          => $child->date_of_birth,
                    'gender'                 => $child->gender,
                    'class_name'             => $child->class_name ?? 'Unassigned',
                    'qr_code_token'          => $child->qr_code_token,

                    // Gambar Profil
                    'profile_photo_path'     => $child->profile_photo_path ? asset('storage/' . $child->profile_photo_path) : null,

                    // Maklumat Peribadi & Keluarga (Boleh Didefinisikan)
                    'birth_place'            => $child->birth_place,
                    'favourite_food'         => $child->favourite_food,
                    'birth_order'            => $child->birth_order,
                    'total_siblings'         => $child->total_siblings,

                    // Maklumat Kontak
                    'home_address'           => $child->home_address,
                    'email'                  => $child->email,

                    // Maklumat Penjaga & Ibu Bapa
                    'guardian_name'          => $child->guardian_name,
                    'guardian_phone'         => $child->guardian_phone,
                    'guardian_relationship'  => $child->guardian_relationship,

                    'father_name'            => $child->father_name,
                    'father_ic_number'       => $child->father_ic_number,
                    'father_nationality'     => $child->father_nationality,
                    'father_race'            => $child->father_race,
                    'father_occupation'      => $child->father_occupation,
                    'father_phone'           => $child->father_phone,

                    'mother_name'            => $child->mother_name,
                    'mother_ic_number'       => $child->mother_ic_number,
                    'mother_nationality'     => $child->mother_nationality,
                    'mother_race'            => $child->mother_race,
                    'mother_occupation'      => $child->mother_occupation,
                    'mother_phone'           => $child->mother_phone,

                    // Kontak Kecemasan
                    'emergency_contact_name'         => $child->emergency_contact_name,
                    'emergency_contact_phone'        => $child->emergency_contact_phone,
                    'emergency_contact_relationship' => $child->emergency_contact_relationship,

                    // Kesihatan & Rekod
                    'allergies'              => $child->allergies,
                    'medical_notes'          => $child->medical_notes,
                    'is_active'              => $child->is_active,

                    'selected_service'       => $child->selected_service,
                    'referral_source'        => $child->referral_source,
                ];
            });

        return Inertia::render('Parent/ParentChildProfile', [
            'childrenList' => $children,
        ]);
    }

    public function updateChildProfile(Request $request, int $id)
    {
        $parent = $request->user();

        // Sahkan anak adalah milik ibu bapa yang sedang log masuk
        $student = $parent->students()->where('students.student_id', $id)->firstOrFail();

        // Validasi medan yang dibenarkan untuk dikemas kini sahaja
        $validated = $request->validate([
            'profile_photo'                  => 'nullable|image|mimes:jpeg,jpg,png|max:2048',
            'birth_place'                    => 'nullable|string|max:255',
            'favourite_food'                 => 'nullable|string|max:255',
            'birth_order'                    => 'nullable|integer',
            'total_siblings'                 => 'nullable|integer',
            'home_address'                   => 'nullable|string|max:500',
            'email'                          => 'nullable|email|max:255',
            'father_occupation'              => 'nullable|string|max:255',
            'father_phone'                   => 'nullable|string|max:20',
            'mother_occupation'              => 'nullable|string|max:255',
            'mother_phone'                   => 'nullable|string|max:20',
            'emergency_contact_name'         => 'nullable|string|max:255',
            'emergency_contact_phone'        => 'nullable|string|max:20',
            'emergency_contact_relationship' => 'nullable|string|max:100',
            'allergies'                      => 'nullable|string|max:1000',
            'medical_notes'                  => 'nullable|string|max:1000',
        ]);

        // Pengendalian Muat Naik Gambar Profil
        if ($request->hasFile('profile_photo')) {
            $path = $request->file('profile_photo')->store('student_photos', 'public');
            $validated['profile_photo_path'] = $path;
        }

        unset($validated['profile_photo']);

        // Kemaskini rekod pelajar dalam database
        $student->update($validated);

        return redirect()->back()->with('success', 'Child details updated successfully.');
    }
}
