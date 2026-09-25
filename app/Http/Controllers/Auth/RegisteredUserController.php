<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Mail;
use Illuminate\Validation\Rules;
use Inertia\Inertia;
use Inertia\Response;

class RegisteredUserController extends Controller
{
    public function create(Request $request): Response
    {
        $pending = $request->session()->get('pending_parent_registration');

        return Inertia::render('Auth/Register', [
            'verificationEmail' => $pending['email'] ?? null,
            'status' => session('status'),
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'full_name'    => 'required|string|max:255',
            'email'        => 'required|string|lowercase|email|max:255|unique:users,email',
            'phone_number' => 'required|string|max:20',
            'relationship' => 'required|in:Father,Mother,Guardian',
            'address'      => 'required|string|max:500',
            'child_name'   => 'required|string|max:255',
            'child_ic'     => 'required|string|max:20',
            'password'     => ['required', 'confirmed', Rules\Password::defaults()],
        ]);

        $code = (string) random_int(100000, 999999);

        // Hantar e-mel dahulu. Jika gagal, tiada akaun dicipta.
        Mail::raw(
            "Your SmartKids verification code is: {$code}\n\n"
            . "This code expires in 10 minutes. Do not share it.",
            function ($message) use ($validated) {
                $message
                    ->to($validated['email'])
                    ->subject('SmartKids Email Verification Code');
            }
        );

        // Simpan sementara dalam sesi. Password disimpan sebagai hash.
        $request->session()->put('pending_parent_registration', [
            'full_name' => $validated['full_name'],
            'email' => $validated['email'],
            'phone_number' => $validated['phone_number'],
            'relationship' => $validated['relationship'],
            'address' => $validated['address'],
            'child_name' => $validated['child_name'],
            'child_ic' => $validated['child_ic'],
            'password_hash' => Hash::make($validated['password']),
            'code_hash' => Hash::make($code),
            'expires_at' => now()->addMinutes(10)->timestamp,
            'attempts' => 0,
            'last_sent_at' => now()->timestamp,
        ]);

        return redirect()->route('register');
    }
}
