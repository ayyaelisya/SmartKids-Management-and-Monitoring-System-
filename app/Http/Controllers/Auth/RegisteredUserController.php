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
    /**
     * Paparkan borang pendaftaran ibu bapa.
     */
    public function create(): Response
    {
        return Inertia::render('Auth/Register');
    }

    /**
     * Kendalikan pendaftaran ibu bapa baharu.
     */
    public function store(Request $request): RedirectResponse
    {
        $request->validate([
            'full_name'     => 'required|string|max:255',
            'email'         => 'required|string|lowercase|email|max:255|unique:'.User::class,
            'phone_number'  => 'required|string|max:20',
            'relationship'  => 'required|in:Father,Mother,Guardian',
            'address'       => 'required|string|max:500',
            'child_name'    => 'required|string|max:255',
            'child_ic'      => 'required|string|max:20',
            'password'      => ['required', 'confirmed', Rules\Password::defaults()],
        ]);

        DB::transaction(function () use ($request) {
            // 1. Cipta pengguna akaun (Role: parent, Status: pending)
            $user = User::create([
                'full_name'    => $request->full_name,
                'email'        => $request->email,
                'phone_number' => $request->phone_number,
                'password'     => Hash::make($request->password),
                'role'         => 'parent',
                'status'       => 'pending',
            ]);

            // 2. Cipta rekod maklumat ibu bapa beserta maklumat anak yang diisi
            ParentsModel::create([
                'user_id'      => $user->user_id ?? $user->id,
                'relationship' => $request->relationship,
                'address'      => $request->address,
                'child_name'   => $request->child_name,
                'child_ic'     => $request->child_ic,
            ]);

            event(new Registered($user));
        });

        return redirect()->route('login')->with('status', 'Pendaftaran berjaya! Akaun anda kini dalam proses semakan dan kelulusan oleh pihak Admin.');
    }
}
