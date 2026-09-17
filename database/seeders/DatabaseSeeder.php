<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\User;
use Illuminate\Support\Facades\Hash;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        // Akaun Admin
        User::updateOrCreate(
            ['email' => 'admin@smartkids.com'],
            [
                'full_name'    => 'System Admin',
                'phone_number' => '0123456789',
                'password'     => Hash::make('Admin123!'),
                'role'         => 'admin',
                'status'       => 'active',
            ]
        );

        // Akaun Guru
        User::updateOrCreate(
            ['email' => 'siti@gmail.com'],
            [
                'full_name'    => 'Siti',
                'phone_number' => '0193135061',
                'password'     => Hash::make('Teacher123!'),
                'role'         => 'teacher',
                'status'       => 'active',
            ]
        );

        // Akaun Ibu Bapa
        User::updateOrCreate(
            ['email' => 'alya@gmail.com'],
            [
                'full_name'    => 'Alya',
                'phone_number' => '0123456789',
                'password'     => Hash::make('Parent123!'),
                'role'         => 'parent',
                'status'       => 'active',
            ]
        );
    }
}
