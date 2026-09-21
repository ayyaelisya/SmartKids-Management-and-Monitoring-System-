<?php

namespace App\Http\Controllers;

use App\Models\FeeItem;
use App\Models\FeeSetting;
use App\Models\LatePickup;
use App\Models\MonthlyFee;
use App\Models\Payment;
use App\Models\Student;
use Barryvdh\DomPDF\Facade\Pdf;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class AdminFeeController extends Controller
{
    public function index(Request $request)
    {
        $query = MonthlyFee::with(['student', 'payments']);

        if ($request->filled('month') && $request->month !== 'All') {
            $query->where('billing_month', 'like', "%{$request->month}%");
        }

        if ($request->filled('year')) {
            $query->where('billing_month', 'like', "%{$request->year}%");
        }

        if ($request->filled('status') && $request->status !== 'All') {
            $query->where('payment_status', $request->status);
        }

        $allFilteredFees = (clone $query)->get();

        $summary = [
            'totalFees' => (float) $allFilteredFees->sum('total_amount'),
            'totalPaid' => (float) $allFilteredFees->sum('amount_paid'),
            'totalPending' => (float) $allFilteredFees
                ->whereIn('payment_status', ['Unpaid', 'Pending', 'Partially Paid'])
                ->sum('balance'),
            'totalOverdue' => (float) $allFilteredFees
                ->where('payment_status', 'Overdue')
                ->sum('balance'),
        ];

        $paginatedFees = $query
            ->latest()
            ->paginate(15)
            ->through(function ($fee) {
                $lastPayment = $fee->payments->sortByDesc('paid_at')->first();
                $isPaid = $fee->payment_status === 'Paid';

                return [
                    'id' => $fee->id,
                    'invoice_ref' => $fee->invoice_ref
                        ?? ('INV-' . str_pad($fee->id, 5, '0', STR_PAD_LEFT)),
                    'student_id' => $fee->student_id,
                    'student_name' => $fee->student->full_name ?? 'N/A',
                    'parent_name' => $fee->student->father_name
                        ?? $fee->student->mother_name
                        ?? $fee->student->guardian_name
                        ?? 'N/A',
                    'class_name' => $fee->student->class_name ?? 'N/A',
                    'fee_type' => 'Monthly Fee',
                    'base_fee' => (float) ($fee->base_fee ?? 0),
                    'late_pickup_fee' => (float) ($fee->late_pickup_fee ?? 0),
                    'fpx_fee' => (float) ($fee->fpx_fee ?? 0),
                    'total_amount' => (float) $fee->total_amount,
                    'amount_paid' => (float) $fee->amount_paid,
                    'balance' => (float) $fee->balance,
                    'due_date' => $fee->due_date
                        ? Carbon::parse($fee->due_date)->format('Y-m-d')
                        : '-',
                    'billing_month' => $fee->billing_month,
                    'payment_date' => $lastPayment?->paid_at
                        ? Carbon::parse($lastPayment->paid_at)->format('Y-m-d H:i')
                        : ($isPaid ? Carbon::parse($fee->updated_at)->format('Y-m-d H:i') : '-'),
                    'payment_method' => $lastPayment?->payment_method
                        ?? ($isPaid ? 'ToyyibPay (FPX)' : '-'),
                    'transaction_id' => $lastPayment?->reference_number
                        ?? ($isPaid
                            ? 'TYB-' . $fee->id . '-' . Carbon::parse($fee->updated_at)->timestamp
                            : '-'),
                    'remarks' => $lastPayment?->remarks
                        ?? ($isPaid ? 'Paid via ToyyibPay Online Payment' : '-'),
                    'status' => $fee->payment_status ?? 'Unpaid',
                ];
            });

        $settings = FeeSetting::where('is_active', true)->first();

        $students = Student::select(
            'student_id as id',
            'full_name as name',
            'class_name'
        )
            ->where('is_active', 1)
            ->orderBy('full_name')
            ->get();

        $latePickups = LatePickup::with([
            'student.package',
            'attendance',
        ])
            ->latest()
            ->take(20)
            ->get()
            ->map(function ($lp) {
                return [
                    'id' => $lp->id,
                    'student_name' => $lp->student->full_name ?? 'N/A',
                    'class_name' => $lp->student->class_name ?? '-',
                    'expected_time' => $lp->student?->package?->end_time
                        ? Carbon::parse($lp->student->package->end_time)->format('h:i A')
                        : '-',
                    'actual_time' => $lp->attendance?->check_out_time
                        ? Carbon::parse($lp->attendance->check_out_time)->format('h:i A')
                        : '-',
                    'late_duration' => $lp->late_minutes . ' mins',
                    'fee' => (float) ($lp->calculated_fee ?? 0),
                    'status' => $lp->is_billed ? 'Billed' : 'Unbilled',
                ];
            });

        return Inertia::render('FeeManagement', [
            'monthlyFees' => $paginatedFees,
            'summary' => $summary,
            'settings' => $settings,
            'students' => $students,
            'latePickups' => $latePickups,
            'filters' => $request->only(['month', 'year', 'status']),
        ]);
    }

    public function generateMonthlyFees(Request $request)
    {
        $validated = $request->validate([
            'billing_month' => 'required|string|max:30',
            'due_date' => 'required|date',
        ]);

        $month = $validated['billing_month'];

        $students = Student::with('package')
            ->where('is_active', 1)
            ->whereNotNull('package_id')
            ->get();

        $createdCount = 0;
        $skippedCount = 0;

        foreach ($students as $student) {
            if (!$student->package || $student->package->status !== 'active') {
                $skippedCount++;
                continue;
            }

            $exists = MonthlyFee::where('student_id', $student->student_id)
                ->where('billing_month', $month)
                ->exists();

            if ($exists) {
                $skippedCount++;
                continue;
            }

            DB::transaction(function () use (
                $student,
                $month,
                $validated,
                &$createdCount
            ) {
                $baseFee = (float) $student->package->monthly_fee;

                // Only include late pickups from the selected billing month
                $billingDate = Carbon::createFromFormat(
                    'F Y',
                    $month,
                    'Asia/Kuala_Lumpur'
                );

                $latePickups = LatePickup::where('student_id', $student->student_id)
                    ->where('is_billed', false)
                    ->whereHas('attendance', function ($query) use ($billingDate) {
                        $query
                            ->whereYear('date', $billingDate->year)
                            ->whereMonth('date', $billingDate->month);
                    })
                    ->lockForUpdate()
                    ->get();

                $lateFeeTotal = (float) $latePickups->sum('calculated_fee');
                $totalAmount = $baseFee + $lateFeeTotal;

                $invoiceRef =
                    'INV-' .
                    $billingDate->format('Ym') .
                    '-' .
                    strtoupper(substr(uniqid(), -4));

                $monthlyFee = MonthlyFee::create([
                    'invoice_ref' => $invoiceRef,
                    'student_id' => $student->student_id,
                    'billing_month' => $month,
                    'base_fee' => $baseFee,
                    'late_pickup_fee' => $lateFeeTotal,
                    'other_charges' => 0.00,
                    'total_amount' => $totalAmount,
                    'amount_paid' => 0.00,
                    'balance' => $totalAmount,
                    'payment_status' => 'Unpaid',
                    'due_date' => $validated['due_date'],
                ]);

                FeeItem::create([
                    'monthly_fee_id' => $monthlyFee->id,
                    'description' => $student->package->package_name . ' Package Monthly Fee',
                    'amount' => $baseFee,
                    'type' => 'base',
                ]);

                if ($lateFeeTotal > 0) {
                    FeeItem::create([
                        'monthly_fee_id' => $monthlyFee->id,
                        'description' => 'Accumulated Late Pickup Charges',
                        'amount' => $lateFeeTotal,
                        'type' => 'late_pickup',
                    ]);

                    LatePickup::whereIn('id', $latePickups->pluck('id'))
                        ->update(['is_billed' => true]);
                }

                $createdCount++;
            });
        }

        return redirect()->back()->with(
            'success',
            "Generated {$createdCount} monthly bill(s). {$skippedCount} student(s) skipped."
        );
    }

    public function recordPayment(Request $request, MonthlyFee $monthlyFee = null)
    {
        $validated = $request->validate([
            'student_id' => 'required_without:monthly_fee_id',
            'amount' => 'required|numeric|min:0.01',
            'payment_method' => 'required|string|max:100',
            'reference_no' => 'nullable|string|max:255',
            'remarks' => 'nullable|string|max:500',
        ]);

        if (!$monthlyFee || !$monthlyFee->exists) {
            $monthlyFee = MonthlyFee::where('student_id', $validated['student_id'])
                ->whereIn(
                    'payment_status',
                    ['Unpaid', 'Pending', 'Partially Paid', 'Overdue']
                )
                ->latest()
                ->first();
        }

        if (!$monthlyFee) {
            return redirect()->back()->withErrors([
                'student_id' => 'No outstanding fee found for this student.',
            ]);
        }

        $remainingBalance = (float) $monthlyFee->balance;

        if ((float) $validated['amount'] > $remainingBalance) {
            return redirect()->back()->withErrors([
                'amount' => 'Payment amount cannot exceed the outstanding balance.',
            ]);
        }

        DB::transaction(function () use ($validated, $monthlyFee) {
            Payment::create([
                'monthly_fee_id' => $monthlyFee->id,
                'amount' => $validated['amount'],
                'payment_method' => $validated['payment_method'],
                'reference_number' => $validated['reference_no'] ?? null,
                'remarks' => $validated['remarks'] ?? null,
                'paid_at' => Carbon::now('Asia/Kuala_Lumpur'),
                'recorded_by' => Auth::id(),
            ]);

            $monthlyFee->amount_paid =
                (float) $monthlyFee->amount_paid + (float) $validated['amount'];

            $monthlyFee->balance = max(
                0,
                (float) $monthlyFee->total_amount - (float) $monthlyFee->amount_paid
            );

            if ($monthlyFee->balance <= 0) {
                $monthlyFee->payment_status = 'Paid';
            } elseif ($monthlyFee->amount_paid > 0) {
                $monthlyFee->payment_status = 'Partially Paid';
            } else {
                $monthlyFee->payment_status = 'Unpaid';
            }

            $monthlyFee->save();
        });

        return redirect()->back()->with(
            'success',
            'Payment recorded successfully.'
        );
    }

    public function updateFeeSettings(Request $request)
    {
        $validated = $request->validate([
            'official_closing_time' => 'required',
            'grace_period_minutes' => 'required|integer|min:0',
            'fee_per_unit' => 'required|numeric|min:0',
            'unit_type' => 'required|in:minute,15_min,30_min,hour',
        ]);

        FeeSetting::where('is_active', true)
            ->update(['is_active' => false]);

        FeeSetting::create([
            'name' => 'Standard Fee Rule',
            'official_closing_time' => $validated['official_closing_time'],
            'grace_period_minutes' => $validated['grace_period_minutes'],
            'fee_per_unit' => $validated['fee_per_unit'],
            'unit_type' => $validated['unit_type'],
            'effective_date' => Carbon::now('Asia/Kuala_Lumpur')->toDateString(),
            'is_active' => true,
        ]);

        return redirect()->back()->with(
            'success',
            'Late pickup fee rules updated successfully.'
        );
    }

public function downloadReceipt(MonthlyFee $monthlyFee)
{
    // Official receipt is only available for fully paid invoices
    if (strtolower($monthlyFee->payment_status) !== 'paid') {
        return redirect()
            ->route('admin.fees.index')
            ->with(
                'error',
                'Receipt is only available for fully paid invoices.'
            );
    }

    $monthlyFee->load([
        'student',
        'payments',
    ]);

    $lastPayment = $monthlyFee->payments
        ->sortByDesc('paid_at')
        ->first();

    // A paid invoice must have a payment record
    if (!$lastPayment) {
        return redirect()
            ->route('admin.fees.index')
            ->with(
                'error',
                'Payment record was not found for this invoice.'
            );
    }

    $data = [
        'invoiceRef' => $monthlyFee->invoice_ref
            ?? (
                'INV-' .
                str_pad(
                    $monthlyFee->id,
                    5,
                    '0',
                    STR_PAD_LEFT
                )
            ),

        'studentName' =>
            $monthlyFee->student->full_name ?? 'N/A',

        'parentName' =>
            $monthlyFee->student->father_name
            ?? $monthlyFee->student->mother_name
            ?? $monthlyFee->student->guardian_name
            ?? 'Parent/Guardian',

        'className' =>
            $monthlyFee->student->class_name ?? 'N/A',

        'billingMonth' =>
            $monthlyFee->billing_month,

        'baseFee' =>
            (float) $monthlyFee->base_fee,

        'latePickupFee' =>
            (float) $monthlyFee->late_pickup_fee,

        'otherCharges' =>
            (float) ($monthlyFee->other_charges ?? 0),

        'totalAmount' =>
            (float) $monthlyFee->total_amount,

        'amountPaid' =>
            (float) $monthlyFee->amount_paid,

        'balance' =>
            (float) $monthlyFee->balance,

        'paymentDate' => $lastPayment->paid_at
            ? Carbon::parse(
                $lastPayment->paid_at
            )->format('d M, Y')
            : '-',

        'paymentMethod' =>
            $lastPayment->payment_method ?? '-',

        'transactionId' =>
            $lastPayment->reference_number ?? '-',
    ];

    // Generate the same official receipt used by the parent portal
    $pdf = Pdf::loadView(
        'pdf.receipt',
        $data
    )->setPaper(
        'a4',
        'portrait'
    );

    return $pdf->download(
        "Receipt-{$data['invoiceRef']}.pdf"
    );
}
}
