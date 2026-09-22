<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Http\Requests\Auth\LoginRequest;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;
use Inertia\Response;

class AuthenticatedSessionController extends Controller
{
    /**
     * Display the login page.
     */
    public function create(): Response
    {
        return Inertia::render('Auth/Login', [
            'canResetPassword' => Route::has('password.request'),
            'status' => session('status'),
        ]);
    }

    /**
     * Handle the login request.
     */
    public function store(LoginRequest $request): RedirectResponse
    {
        // Check the email and password first.
        $request->authenticate();

        $user = Auth::user();

        // A parent must be approved before accessing the system.
        if (
            $user->role === 'parent' &&
            $user->status !== 'active'
        ) {
            $message = match ($user->status) {
                'pending' =>
                    'Your account is pending admin approval.',

                'rejected' =>
                    'Your registration has been rejected. Please contact the administrator.',

                default =>
                    'Your account is not active. Please contact the administrator.',
            };

            // Remove the temporary authenticated session.
            Auth::guard('web')->logout();

            $request->session()->invalidate();
            $request->session()->regenerateToken();

            return redirect()
                ->route('login')
                ->withErrors([
                    'email' => $message,
                ])
                ->withInput(
                    $request->only('email')
                );
        }

        // Prevent session fixation after successful login.
        $request->session()->regenerate();

        // Redirect according to the user's role.
        return match ($user->role) {
            'admin' =>
                redirect()->route('dashboard'),

            'teacher' =>
                redirect()->route('teacher.dashboard'),

            'parent' =>
                redirect()->route('parent.dashboard'),

            default =>
                redirect()->route('login')
                    ->withErrors([
                        'email' => 'Invalid account role.',
                    ]),
        };
    }

    /**
     * Log the user out.
     */
    public function destroy(Request $request): RedirectResponse
    {
        Auth::guard('web')->logout();

        $request->session()->invalidate();
        $request->session()->regenerateToken();

        return redirect()
            ->route('login');
    }
}
