<?php

namespace App\Services;

use App\Models\User;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Mail;

class EmailVerificationCodeService
{
    public function send(User $user): void
    {
        $code = (string) random_int(100000, 999999);

        DB::table('email_verification_codes')->updateOrInsert(
            ['user_id' => $user->user_id],
            [
                'code_hash' => Hash::make($code),
                'expires_at' => now()->addMinutes(10),
                'attempts' => 0,
                'last_sent_at' => now(),
                'updated_at' => now(),
                'created_at' => now(),
            ]
        );

        Mail::raw(
            "Your SmartKids email verification code is: {$code}\n\n"
            . "This code expires in 10 minutes. Do not share it with anyone.",
            function ($message) use ($user) {
                $message
                    ->to($user->email)
                    ->subject('SmartKids Email Verification Code');
            }
        );
    }
}
