<?php

namespace App\Http\Controllers;

use App\Http\Requests\ProfileUpdateRequest;
use App\Models\User;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\Redirect;
use Illuminate\Support\Facades\Storage;
use Illuminate\Validation\ValidationException;
use Inertia\Inertia;
use Inertia\Response;

class ProfileController extends Controller
{
    /**
     * Display the user's profile form.
     */
    public function edit(Request $request): Response
    {
        $user = $request->user();

        if ($user->role === 'teacher') {
            $user->load('teacher');
        } elseif ($user->role === 'parent') {
            $user->load('parent');
        }

        $page = match ($user->role) {
            'teacher' => 'Profile/TeacherEdit',
            'parent' => 'Profile/ParentEdit',
            default => 'Profile/Edit',
        };

        return Inertia::render($page, [
            'pendingEmail' => $request->session()->get('pending_profile_email.email'),
            'statusMessage' => session('status'),
            'profile' => [
                'full_name' => $user->full_name,
                'email' => $user->email,
                'phone_number' => $user->phone_number,
                'profile_photo_url' => $user->profile_photo_path
                    ? asset('storage/' . $user->profile_photo_path)
                    : null,
                'role' => $user->role,
                'status' => $user->status,
                'qualification' => $user->role === 'teacher'
                    ? $user->teacher?->qualification
                    : null,
                'address' => $user->role === 'teacher'
                    ? $user->teacher?->address
                    : $user->parent?->address,
                'relationship' => $user->role === 'parent'
                    ? $user->parent?->relationship
                    : null,
            ],
        ]);
    }

    /**
     * Update the user's profile information.
     */
    public function update(ProfileUpdateRequest $request): RedirectResponse
    {
        $validated = $request->validated();
        $user = $request->user();

        if ($validated['email'] !== $user->email) {
            if (
                $request->session()->get('pending_profile_email.last_sent_at')
                && now()->timestamp - $request->session()->get('pending_profile_email.last_sent_at') < 60
            ) {
                throw ValidationException::withMessages([
                    'email' => 'Please wait one minute before requesting another code.',
                ]);
            }

            $code = (string) random_int(100000, 999999);

            // Send first. The login email is not changed if delivery fails.
            try {
                Mail::raw(
                    "Your SmartKids email verification code is: {$code}\n\nThis code expires in 10 minutes.",
                    function ($message) use ($validated) {
                        $message->to($validated['email'])
                            ->subject('Verify your SmartKids email change');
                    }
                );
            } catch (\Throwable $exception) {
                report($exception);
                throw ValidationException::withMessages([
                    'email' => 'Verification email could not be sent. Check the mail settings and try again.',
                ]);
            }

            $request->session()->put('pending_profile_email', [
                'user_id' => $user->user_id,
                'current_email' => $user->email,
                'email' => $validated['email'],
                'data' => $validated,
                'code_hash' => Hash::make($code),
                'expires_at' => now()->addMinutes(10)->timestamp,
                'last_sent_at' => now()->timestamp,
                'attempts' => 0,
            ]);

            return Redirect::route('profile.edit')
                ->with('status', 'A verification code was sent to the new email. Your old email remains active until verification.');
        }

        DB::transaction(fn () => $this->saveProfile($user, $validated, false));

        return Redirect::route('profile.edit')->with('success', 'Profile updated successfully.');
    }

    public function verifyEmail(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'verification_code' => ['required', 'digits:6'],
        ]);

        $pending = $request->session()->get('pending_profile_email');
        $user = $request->user();

        if (!$pending || $pending['user_id'] !== $user->user_id) {
            return Redirect::route('profile.edit')->withErrors([
                'verification_code' => 'Request a new verification code first.',
            ]);
        }

        if (now()->timestamp > $pending['expires_at'] || $pending['attempts'] >= 5) {
            $request->session()->forget('pending_profile_email');
            return Redirect::route('profile.edit')->withErrors([
                'verification_code' => 'Code expired or too many attempts. Save the email again to request a new code.',
            ]);
        }

        if (!Hash::check($validated['verification_code'], $pending['code_hash'])) {
            $pending['attempts']++;
            $request->session()->put('pending_profile_email', $pending);
            return Redirect::route('profile.edit')->withErrors([
                'verification_code' => 'Incorrect verification code.',
            ]);
        }

        if ($user->email !== $pending['current_email']) {
            $request->session()->forget('pending_profile_email');
            return Redirect::route('profile.edit')->withErrors([
                'email' => 'Your account email changed. Start the request again.',
            ]);
        }

        // Recheck uniqueness because another account may have used this email meanwhile.
        if (User::where('email', $pending['email'])
            ->where('user_id', '!=', $user->user_id)->exists()) {
            throw ValidationException::withMessages([
                'verification_code' => 'This email is already used by another account.',
            ]);
        }

        DB::transaction(fn () => $this->saveProfile($user, $pending['data'], true));
        $request->session()->forget('pending_profile_email');

        return Redirect::route('profile.edit')->with('success', 'New email verified and profile updated.');
    }

    public function cancelEmail(Request $request): RedirectResponse
    {
        $request->session()->forget('pending_profile_email');
        return Redirect::route('profile.edit');
    }

    public function updatePhoto(Request $request): RedirectResponse
    {
        abort_unless(in_array($request->user()->role, ['teacher', 'parent'], true), 403);

        $request->validate([
            'photo' => ['required', 'image', 'mimes:jpg,jpeg,png,webp', 'max:2048'],
        ]);

        $user = $request->user();
        $oldPath = $user->profile_photo_path;
        $newPath = $request->file('photo')->store('profile_photos', 'public');

        try {
            $user->forceFill(['profile_photo_path' => $newPath])->save();
        } catch (\Throwable $exception) {
            Storage::disk('public')->delete($newPath);
            throw $exception;
        }

        if ($oldPath) {
            Storage::disk('public')->delete($oldPath);
        }

        return Redirect::route('profile.edit')->with('success', 'Profile picture updated.');
    }

    private function saveProfile(User $user, array $validated, bool $verifiedEmail): void
    {
        $user->fill([
            'full_name' => $validated['full_name'],
            'email' => $validated['email'],
            'phone_number' => $validated['phone_number'] ?? null,
        ]);

        if ($verifiedEmail) {
            $user->email_verified_at = now();
        }

        $user->save();

        if ($user->role === 'teacher' && $user->teacher) {
            $user->teacher->update([
                'full_name' => $validated['full_name'],
                'qualification' => $validated['qualification'] ?? null,
                'address' => $validated['address'] ?? null,
            ]);
        }

        if ($user->role === 'parent' && $user->parent) {
            $user->parent->update([
                'relationship' => $validated['relationship'],
                'address' => $validated['address'] ?? null,
            ]);
        }
    }
}
