<?php

namespace Database\Seeders;

use App\Models\Package;
use Illuminate\Database\Seeder;

class PackageSeeder extends Seeder
{
    public function run(): void
    {
        $packages = [
            // Ages 10-23 months
            [
                'package_name' => 'Basic',
                'age_group' => '10-23 months',
                'monthly_fee' => 400.00,
                'start_time' => '08:00:00',
                'end_time' => '12:00:00',
                'description' => '4 hours with breakfast included.',
                'status' => 'active',
            ],
            [
                'package_name' => 'Plus',
                'age_group' => '10-23 months',
                'monthly_fee' => 500.00,
                'start_time' => '07:00:00',
                'end_time' => '13:00:00',
                'description' => '6 hours with 2 meals and 1 bath time included.',
                'status' => 'active',
            ],
            [
                'package_name' => 'Premium',
                'age_group' => '10-23 months',
                'monthly_fee' => 700.00,
                'start_time' => '07:00:00',
                'end_time' => '18:00:00',
                'description' => '11 hours with 3 meals and 2 bath times included.',
                'status' => 'active',
            ],

            // Ages 2-4 years
            [
                'package_name' => 'Basic',
                'age_group' => '2-4 years',
                'monthly_fee' => 300.00,
                'start_time' => '08:00:00',
                'end_time' => '12:00:00',
                'description' => '4 hours with breakfast included.',
                'status' => 'active',
            ],
            [
                'package_name' => 'Plus',
                'age_group' => '2-4 years',
                'monthly_fee' => 400.00,
                'start_time' => '07:00:00',
                'end_time' => '13:00:00',
                'description' => '6 hours with 2 meals and 1 bath time included.',
                'status' => 'active',
            ],
            [
                'package_name' => 'Premium',
                'age_group' => '2-4 years',
                'monthly_fee' => 600.00,
                'start_time' => '07:00:00',
                'end_time' => '18:00:00',
                'description' => '11 hours with 3 meals and 2 bath times included.',
                'status' => 'active',
            ],
        ];

        foreach ($packages as $package) {
            Package::updateOrCreate(
                [
                    'package_name' => $package['package_name'],
                    'age_group' => $package['age_group'],
                ],
                $package
            );
        }
    }
}
