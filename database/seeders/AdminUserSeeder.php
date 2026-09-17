<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\User;
use App\Models\Admin;
use Illuminate\Support\Facades\Hash;

class AdminUserSeeder extends Seeder
{
    public function run(): void
    {
        $user = User::create([
            'full_name'    => 'System Admin',
            'email'        => 'admin@smartkids.com',
            'phone_number' => '0123456789',
            'password'     => Hash::make('password123'),
            'role'         => 'admin',
            'status'       => 'active',
        ]);

        Admin::create([
            'user_id' => $user->user_id,
        ]);
    }
}
