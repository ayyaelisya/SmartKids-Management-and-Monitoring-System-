<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Models\Student;
use App\Models\MonthlyFee;
use App\Models\LatePickup;
use App\Models\FeeItem;
use Carbon\Carbon;

class AutoGenerateMonthlyFees extends Command
{
    protected $signature = 'fees:generate-monthly';
    protected $description = 'Jana invois bulanan automatik mengikut pakej murid pada awal bulan';

    public function handle()
    {
        $currentMonth = Carbon::now()->format('F Y'); // Contoh: "August 2026"
        $monthCode = Carbon::now()->format('m');
        $yearCode = Carbon::now()->format('Y');

        $students = Student::all();
        $count = 0;

        foreach ($students as $index => $student) {
            $studentId = $student->student_id;

            $exists = MonthlyFee::where('student_id', $studentId)
                ->where('billing_month', $currentMonth)
                ->exists();

            if (!$exists) {
                // Format Ref: INV-2026-0801, INV-2026-0802
                $invoiceRef = sprintf("INV-%s-%s%02d", $yearCode, $monthCode, $index + 1);

                // Mengambil pakej murid (laluan RM450 jika tiada)
                $baseFee = $student->package_price ?? 450.00;
                $fpxFee = 1.00;

                // Kumpul caj lewat ambil
                $latePickups = LatePickup::where('student_id', $studentId)
                    ->where('is_billed', false)
                    ->get();
                $lateFeeTotal = $latePickups->sum('calculated_fee');

                $totalAmount = $baseFee + $lateFeeTotal + $fpxFee;

                $monthlyFee = MonthlyFee::create([
                    'invoice_ref' => $invoiceRef,
                    'student_id' => $studentId,
                    'billing_month' => $currentMonth,
                    'base_fee' => $baseFee,
                    'late_pickup_fee' => $lateFeeTotal,
                    'fpx_fee' => $fpxFee,
                    'other_charges' => 0.00,
                    'total_amount' => $totalAmount,
                    'amount_paid' => 0.00,
                    'balance' => $totalAmount,
                    'payment_status' => 'Unpaid',
                    'due_date' => Carbon::now()->addDays(7)->toDateString(),
                ]);

                // Simpan breakdown
                FeeItem::create([
                    'monthly_fee_id' => $monthlyFee->id,
                    'description' => 'Standard Tuition Package',
                    'amount' => $baseFee,
                    'type' => 'base'
                ]);

                if ($lateFeeTotal > 0) {
                    FeeItem::create([
                        'monthly_fee_id' => $monthlyFee->id,
                        'description' => 'Late Pickup Fee',
                        'amount' => $lateFeeTotal,
                        'type' => 'late_pickup'
                    ]);
                    LatePickup::whereIn('id', $latePickups->pluck('id'))->update(['is_billed' => true]);
                }

                FeeItem::create([
                    'monthly_fee_id' => $monthlyFee->id,
                    'description' => 'FPX Handling Fee',
                    'amount' => $fpxFee,
                    'type' => 'handling'
                ]);

                $count++;
            }
        }

        $this->info("Invois bulanan berjaya dijana untuk {$count} murid.");
    }
}
