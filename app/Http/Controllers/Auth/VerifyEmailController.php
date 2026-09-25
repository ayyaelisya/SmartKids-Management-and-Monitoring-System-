<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Models\ParentsModel;
use App\Models\User;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\Validator;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Inertia\Response;

class VerifyEmailController extends Controller
{
    public function show(Request $request): RedirectResponse|Response
    {
        $pending = $request->session()->get('pending_parent_registration');

        if (! $pending) {
            return redirect()->route('register');
        }

        return Inertia::render('Auth/Register', [
            'verificationEmail' => $pending['email'],
            'status' => session('status'),
        ]);
    }

    public function verify(Request $request): RedirectResponse
    {
        $pending = $request->session()->get('pending_parent_registration');

        if (! $pending) {
            return redirect()->route('register');
        }

        $validated = $request->validate([
            'code' => ['required', 'digits:6'],
        ]);

        if (now()->timestamp > $pending['expires_at']) {
            return back()->withErrors([
                'code' => 'Code expired. Please request a new code.',
            ]);
        }

        if ($pending['attempts'] >= 5) {
            return back()->withErrors([
                'code' => 'Too many attempts. Please request a new code.',
            ]);
        }

        if (! Hash::check($validated['code'], $pending['code_hash'])) {
            $pending['attempts']++;
            $request->session()->put('pending_parent_registration', $pending);

            return back()->withErrors([
                'code' => 'Incorrect verification code.',
            ]);
        }

        // Semak semula kerana e-mel mungkin didaftarkan oleh orang lain
        // sepanjang tempoh pengguna menunggu OTP.
        Validator::make(
            ['email' => $pending['email']],
            ['email' => ['required', 'email', Rule::unique('users', 'email')]]
        )->validate();

        // Hanya sekarang akaun masuk database.
        DB::transaction(function () use ($pending) {
            $user = User::create([
                'full_name' => $pending['full_name'],
                'email' => $pending['email'],
                'phone_number' => $pending['phone_number'],
                'password' => $pending['password_hash'],
                'role' => 'parent',
                'status' => 'pending',
            ]);

            $user->forceFill([
                'email_verified_at' => now(),
            ])->save();

            ParentsModel::create([
                'user_id' => $user->user_id,
                'relationship' => $pending['relationship'],
                'address' => $pending['address'],
                'child_name' => $pending['child_name'],
                'child_ic' => $pending['child_ic'],
            ]);
        });

        $request->session()->forget('pending_parent_registration');

        return redirect()
            ->route('login')
            ->with(
                'status',
                'Email verified successfully. Your account is pending admin approval.'
            );
    }

    public function resend(Request $request): RedirectResponse
    {
        $pending = $request->session()->get('pending_parent_registration');

        if (! $pending) {
            return redirect()->route('register');
        }

        if (now()->timestamp - $pending['last_sent_at'] < 60) {
            return back()->withErrors([
                'resend' => 'Please wait 60 seconds before requesting another code.',
            ]);
        }

        $code = (string) random_int(100000, 999999);

        // Jika penghantaran gagal, kod lama dalam sesi tidak ditukar.
        Mail::raw(
            "Your new SmartKids verification code is: {$code}\n\n"
            . "This code expires in 10 minutes. Do not share it.",
            function ($message) use ($pending) {
                $message
                    ->to($pending['email'])
                    ->subject('SmartKids Email Verification Code');
            }
        );

        $pending['code_hash'] = Hash::make($code);
        $pending['expires_at'] = now()->addMinutes(10)->timestamp;
        $pending['attempts'] = 0;
        $pending['last_sent_at'] = now()->timestamp;

        $request->session()->put('pending_parent_registration', $pending);

        return back()->with('status', 'A new code has been sent to your email.');
    }
}
