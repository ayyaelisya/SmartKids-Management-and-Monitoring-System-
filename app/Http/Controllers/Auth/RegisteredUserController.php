<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Models\ParentsModel;
use Illuminate\Auth\Events\Registered;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\Rules;
use Inertia\Inertia;
use Inertia\Response;

class RegisteredUserController extends Controller
{
    // Display parent registration form
    public function create(): Response
    {
        return Inertia::render('Auth/Register');
    }

    // Register a new parent account
    public function store(Request $request): RedirectResponse
    {
        $request->validate([
            'full_name'    => 'required|string|max:255',
            'email'        => 'required|string|lowercase|email|max:255|unique:users,email',
            'phone_number' => 'required|string|max:20',
            'relationship' => 'required|in:Father,Mother,Guardian',
            'address'      => 'required|string|max:500',
            'child_name'   => 'required|string|max:255',
            'child_ic'     => 'required|string|max:20',
            'password'     => ['required', 'confirmed', Rules\Password::defaults()],
        ]);

        DB::transaction(function () use ($request) {

            // Create parent user account
            $user = User::create([
                'full_name'    => $request->full_name,
                'email'        => $request->email,
                'phone_number' => $request->phone_number,
                'password'     => Hash::make($request->password),
                'role'         => 'parent',
                'status'       => 'pending',
            ]);

            // Save parent and child reference information
            ParentsModel::create([
                'user_id'      => $user->user_id,
                'relationship' => $request->relationship,
                'address'      => $request->address,
                'child_name'   => $request->child_name,
                'child_ic'     => $request->child_ic,
            ]);

            event(new Registered($user));
        });

        return redirect()
            ->route('login')
            ->with(
                'status',
                'Registration successful! Your account is pending admin approval.'
            );
    }
}
