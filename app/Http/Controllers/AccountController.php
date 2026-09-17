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
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Inertia\Inertia;

class AccountController extends Controller
{
    public function index()
    {
        $accounts = User::with(['teacher', 'parent.students', 'admin'])
            ->latest()
            ->get();

        $students = Student::select('student_id', 'full_name', 'ic_number')
            ->orderBy('full_name', 'asc')
            ->get();

        return Inertia::render('StaffAccounts', [
            'accounts' => $accounts,
            'students' => $students,
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'full_name'     => 'required|string|max:255',
            'email'        => 'required|string|email|max:255|unique:users,email',
            'phone_number'  => 'nullable|string|max:20',
            'password'      => 'required|string|min:6',
            'role'          => 'required|in:admin,teacher,parent',
            'relationship'  => 'nullable|required_if:role,parent|in:father,mother,guardian',
            'student_id'    => 'nullable|exists:students,student_id',
            'qualification' => 'nullable|string|max:255',
            'address'       => 'nullable|string',
        ]);

        DB::transaction(function () use ($validated) {
            $user = User::create([
                'full_name'    => $validated['full_name'],
                'email'        => $validated['email'],
                'phone_number' => $validated['phone_number'] ?? null,
                'password'     => Hash::make($validated['password']),
                'role'         => $validated['role'],
                'status'       => 'active',
            ]);

            $userId = $user->id ?? $user->user_id;

            if ($validated['role'] === 'teacher') {
                Teacher::create([
                    'user_id'       => $userId,
                    'full_name'     => $validated['full_name'],
                    'qualification' => $validated['qualification'] ?? null,
                    'address'       => $validated['address'] ?? null,
                    'status'        => 'active',
                    'hire_date'     => now(),
                ]);
            } elseif ($validated['role'] === 'parent') {
                $parent = ParentsModel::create([
                    'user_id'      => $userId,
                    'relationship' => $validated['relationship'] ?? 'guardian',
                    'address'      => $validated['address'] ?? null,
                ]);

                // Link student if provided during account creation
                if (!empty($validated['student_id'])) {
                    $this->attachStudentToParent($parent, $validated['student_id']);
                }
            } elseif ($validated['role'] === 'admin') {
                Admin::create([
                    'user_id'   => $userId,
                    'full_name' => $validated['full_name'],
                ]);
            }
        });

        return redirect()->back()->with('success', 'Account created successfully!');
    }

    /**
     * Link an existing student to a parent account.
     */
    public function linkStudent(Request $request)
    {
        $validated = $request->validate([
            'parent_id'  => 'required',
            'student_id' => 'required|exists:students,student_id',
        ]);

        // Look up ParentsModel record by primary key or user_id
        $parent = ParentsModel::find($validated['parent_id'])
            ?? ParentsModel::where('parent_id', $validated['parent_id'])->first()
            ?? ParentsModel::where('user_id', $validated['parent_id'])->first();

        // Auto-create ParentsModel record if User exists with 'parent' role but missing profile row
        if (!$parent) {
            $user = User::find($validated['parent_id'])
                ?? User::where('user_id', $validated['parent_id'])->first();

            if ($user && $user->role === 'parent') {
                $parent = ParentsModel::create([
                    'user_id'      => $user->id ?? $user->user_id,
                    'relationship' => 'guardian',
                ]);
            }
        }

        if (!$parent) {
            return redirect()->back()->withErrors([
                'parent_id' => 'Parent profile record not found for this account.'
            ]);
        }

        $this->attachStudentToParent($parent, $validated['student_id']);

        return redirect()->back()->with('success', 'Student linked successfully!');
    }

    /**
     * Helper method to attach student safely according to relationship type (BelongsToMany vs HasMany).
     */
    private function attachStudentToParent(ParentsModel $parent, int|string $studentId): void
    {
        if (method_exists($parent, 'students')) {
            $relation = $parent->students();

            // If relation is Many-to-Many (pivot table)
            if ($relation instanceof BelongsToMany) {
                $parent->students()->syncWithoutDetaching([$studentId]);
                return;
            }
        }

        // Fallback for One-to-Many (direct foreign key on students table)
        $parentId = $parent->id ?? $parent->parent_id;
        Student::where('student_id', $studentId)->update(['parent_id' => $parentId]);
    }
}
