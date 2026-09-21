<?php

namespace App\Http\Controllers;

use App\Models\User;
use App\Models\Teacher;
use App\Models\ParentsModel;
use App\Models\Admin;
use App\Models\Student;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class AccountController extends Controller
{
    // Display all accounts
    public function index()
    {
        $accounts = User::with([
            'teacher',
            'parent.students',
            'admin'
        ])
            ->latest()
            ->get();

        // Get students for parent linking
        $students = Student::select(
            'student_id',
            'full_name',
            'ic_number',
            'date_of_birth',
            'class_name'
        )
            ->orderBy('full_name')
            ->get();

        return Inertia::render('StaffAccounts', [
            'accounts' => $accounts,
            'students' => $students,
        ]);
    }

    // Create account by admin
    public function store(Request $request)
    {
        $validated = $request->validate([
            'full_name'     => 'required|string|max:255',
            'email'         => 'required|string|email|max:255|unique:users,email',
            'phone_number'  => 'nullable|string|max:20',
            'password'      => 'required|string|min:6',
            'role'          => 'required|in:admin,teacher,parent',
            'relationship'  => 'nullable|required_if:role,parent|in:father,mother,guardian',
            'student_id'    => 'nullable|exists:students,student_id',
            'qualification' => 'nullable|string|max:255',
            'address'       => 'nullable|string|max:500',
        ]);

        DB::transaction(function () use ($validated) {

            // Create user account
            $user = User::create([
                'full_name'    => $validated['full_name'],
                'email'        => $validated['email'],
                'phone_number' => $validated['phone_number'] ?? null,
                'password'     => Hash::make($validated['password']),
                'role'         => $validated['role'],
                'status'       => 'active',
            ]);

            $userId = $user->user_id;

            // Create teacher profile
            if ($validated['role'] === 'teacher') {
                Teacher::create([
                    'user_id'       => $userId,
                    'full_name'     => $validated['full_name'],
                    'qualification' => $validated['qualification'] ?? null,
                    'address'       => $validated['address'] ?? null,
                    'status'        => 'active',
                    'hire_date'     => now(),
                ]);
            }

            // Create parent profile
            if ($validated['role'] === 'parent') {
                $parent = ParentsModel::create([
                    'user_id'      => $userId,
                    'relationship' => $validated['relationship'],
                    'address'      => $validated['address'] ?? null,
                ]);

                // Link student if selected by admin
                if (!empty($validated['student_id'])) {
                    $parent->students()->syncWithoutDetaching([
                        $validated['student_id']
                    ]);
                }
            }

            // Create admin profile
            if ($validated['role'] === 'admin') {
                Admin::create([
                    'user_id'   => $userId,
                    'full_name' => $validated['full_name'],
                ]);
            }
        });

        return redirect()
            ->back()
            ->with('success', 'Account created successfully.');
    }

    // Link student to existing parent
    public function linkStudent(Request $request)
    {
        $validated = $request->validate([
            'parent_id'  => 'required|exists:parents,parent_id',
            'student_id' => 'required|exists:students,student_id',
        ]);

        $parent = ParentsModel::findOrFail($validated['parent_id']);

        // Link student without removing existing links
        $parent->students()->syncWithoutDetaching([
            $validated['student_id']
        ]);

        return redirect()
            ->back()
            ->with('success', 'Student linked successfully.');
    }

    // Approve parent and link child
    public function approveParent(Request $request)
    {
        $validated = $request->validate([
            'parent_id'  => 'required|exists:parents,parent_id',
            'student_id' => 'required|exists:students,student_id',
        ]);

        DB::transaction(function () use ($validated) {

            $parent = ParentsModel::findOrFail(
                $validated['parent_id']
            );

            // Link selected child
            $parent->students()->syncWithoutDetaching([
                $validated['student_id']
            ]);

            // Activate parent account
            User::where('user_id', $parent->user_id)
                ->update([
                    'status' => 'active',
                ]);
        });

        return redirect()
            ->back()
            ->with(
                'success',
                'Parent approved and student linked successfully.'
            );
    }

    // Reject parent registration
    public function rejectParent(Request $request)
    {
        $validated = $request->validate([
            'parent_id' => 'required|exists:parents,parent_id',
        ]);

        $parent = ParentsModel::findOrFail(
            $validated['parent_id']
        );

        // Change account status to rejected
        User::where('user_id', $parent->user_id)
            ->update([
                'status' => 'rejected',
            ]);

        return redirect()
            ->back()
            ->with('success', 'Parent registration rejected.');
    }
}
