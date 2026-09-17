<?php

namespace App\Http\Controllers;

use App\Models\FeeItem;
use App\Models\FeeSetting;
use App\Models\LatePickup;
use App\Models\MonthlyFee;
use App\Models\Payment;
use App\Models\Student;
use Carbon\Carbon;
use Barryvdh\DomPDF\Facade\Pdf;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;

class AdminFeeController extends Controller
{
    public function index(Request $request)
    {
        $query = MonthlyFee::with(['student', 'payments']);

        // Penapisan berdasarkan bulan dan tahun
        if ($request->filled('month') && $request->month !== 'All') {
            $query->where('billing_month', 'like', "%{$request->month}%");
        }

        if ($request->filled('year')) {
            $query->where('billing_month', 'like', "%{$request->year}%");
        }

        // Penapisan berdasarkan status
        if ($request->filled('status') && $request->status !== 'All') {
            $query->where('payment_status', $request->status);
        }

        // Ambil semua data carian untuk pengiraan summary
        $allFilteredFees = (clone $query)->get();

        // Kira jumlah ringkasan untuk kad statistik UI
        $summary = [
            'totalFees' => (float) $allFilteredFees->sum('total_amount'),
            'totalPaid' => (float) $allFilteredFees->sum('amount_paid'),
            'totalPending' => (float) $allFilteredFees->whereIn('payment_status', ['Unpaid', 'Pending'])->sum('balance'),
            'totalOverdue' => (float) $allFilteredFees->where('payment_status', 'Overdue')->sum('balance'),
        ];

        $paginatedFees = $query->latest()->paginate(15)->through(function ($fee) {
            $lastPayment = $fee->payments->last() ?? Payment::where('monthly_fee_id', $fee->id)->latest()->first();

            // Jika status Paid tetapi tiada rekod di table payments (kes callback ToyyibPay terus ke monthly_fees)
            $isPaid = $fee->payment_status === 'Paid';

            return [
                'id' => $fee->id,
                'invoice_ref' => $fee->invoice_ref ?? ('INV-' . str_pad($fee->id, 5, '0', STR_PAD_LEFT)),
                'student_id' => $fee->student_id,
                'student_name' => $fee->student->full_name ?? ($fee->student->name ?? 'N/A'),
                'parent_name' => $fee->student->father_name ?? ($fee->student->mother_name ?? ($fee->student->guardian_name ?? 'N/A')),
                'class_name' => $fee->student->class_name ?? ($fee->student->classroom ?? 'N/A'),
                'fee_type' => 'Monthly Fee',
                'base_fee' => (float) ($fee->base_fee ?? 0),
                'late_pickup_fee' => (float) ($fee->late_pickup_fee ?? 0),
                'fpx_fee' => (float) ($fee->fpx_fee ?? 0),
                'total_amount' => (float) $fee->total_amount,
                'amount_paid' => (float) $fee->amount_paid,
                'balance' => (float) $fee->balance,
                'due_date' => $fee->due_date ? Carbon::parse($fee->due_date)->format('Y-m-d') : '-',
                'billing_month' => $fee->billing_month,

                // Paparan Maklumat Bayaran dengan Fallback
                'payment_date' => $lastPayment?->paid_at
                    ? Carbon::parse($lastPayment->paid_at)->format('Y-m-d H:i')
                    : ($isPaid ? Carbon::parse($fee->updated_at)->format('Y-m-d H:i') : '-'),

                'payment_method' => $lastPayment?->payment_method
                    ?? ($isPaid ? 'ToyyibPay (FPX)' : '-'),

                'transaction_id' => $lastPayment?->reference_number
                    ?? ($isPaid ? 'TYB-' . $fee->id . '-' . Carbon::parse($fee->updated_at)->timestamp : '-'),

                'remarks' => $lastPayment?->remarks
                    ?? ($isPaid ? 'Paid via ToyyibPay Online Payment' : '-'),

                'status' => $fee->payment_status ?? 'Unpaid',
            ];
        });

        $settings = FeeSetting::where('is_active', true)->first();

        // Mengambil data senarai pelajar
        $students = Student::select('student_id as id', 'full_name as name', 'class_name')->get();

        // Data sokongan untuk Tab UI Late Pickups
        $latePickups = LatePickup::with('student')->latest()->take(20)->get()->map(function ($lp) {
            return [
                'id' => $lp->id,
                'student_name' => $lp->student->full_name ?? 'N/A',
                'class_name' => $lp->student->class_name ?? '-',
                'expected_time' => $lp->expected_time ?? '-',
                'actual_time' => $lp->actual_time ?? '-',
                'late_duration' => $lp->duration_minutes ? "{$lp->duration_minutes} mins" : '-',
                'fee' => (float) ($lp->calculated_fee ?? 0),
                'status' => $lp->is_billed ? 'Paid' : 'Unpaid',
            ];
        });

        return Inertia::render('FeeManagement', [
            'monthlyFees' => $paginatedFees,
            'summary' => $summary,
            'settings' => $settings,
            'students' => $students,
            'latePickups' => $latePickups,
            'filters' => $request->only(['month', 'year', 'status'])
        ]);
    }

    public function generateMonthlyFees(Request $request)
    {
        $request->validate([
            'billing_month' => 'required|string',
            'base_fee' => 'required|numeric|min:0',
            'due_date' => 'required|date',
        ]);

        $month = $request->billing_month;
        $students = Student::all();
        $createdCount = 0;

        foreach ($students as $student) {
            $studentId = $student->student_id;

            $exists = MonthlyFee::where('student_id', $studentId)
                ->where('billing_month', $month)
                ->exists();

            if (!$exists) {
                // Kumpul caj lewat ambil yang belum dibilkan
                $latePickups = LatePickup::where('student_id', $studentId)
                    ->where('is_billed', false)
                    ->get();

                $lateFeeTotal = $latePickups->sum('calculated_fee');
                $invoiceRef = 'INV-' . date('Ym') . '-' . strtoupper(substr(uniqid(), -4));

                $monthlyFee = MonthlyFee::create([
                    'invoice_ref' => $invoiceRef,
                    'student_id' => $studentId,
                    'billing_month' => $month,
                    'base_fee' => $request->base_fee,
                    'late_pickup_fee' => $lateFeeTotal,
                    'other_charges' => 0.00,
                    'total_amount' => $request->base_fee + $lateFeeTotal,
                    'amount_paid' => 0.00,
                    'balance' => $request->base_fee + $lateFeeTotal,
                    'payment_status' => 'Unpaid',
                    'due_date' => $request->due_date,
                ]);

                // Lampirkan butiran pecahan yuran
                FeeItem::create([
                    'monthly_fee_id' => $monthlyFee->id,
                    'description' => 'Standard Monthly Tuition Fee',
                    'amount' => $request->base_fee,
                    'type' => 'base'
                ]);

                if ($lateFeeTotal > 0) {
                    FeeItem::create([
                        'monthly_fee_id' => $monthlyFee->id,
                        'description' => 'Accumulated Late Pickup Charges',
                        'amount' => $lateFeeTotal,
                        'type' => 'late_pickup'
                    ]);

                    LatePickup::whereIn('id', $latePickups->pluck('id'))->update(['is_billed' => true]);
                }

                $createdCount++;
            }
        }

        return redirect()->back()->with('success', "Generated monthly fees for {$createdCount} active students.");
    }

    public function recordPayment(Request $request, MonthlyFee $monthlyFee = null)
    {
        $request->validate([
            'student_id' => 'required_without:monthly_fee_id',
            'amount' => 'required|numeric|min:0.01',
            'payment_method' => 'required|string',
            'reference_no' => 'nullable|string',
            'remarks' => 'nullable|string',
        ]);

        // Cari rekod monthlyFee jika disemak berdasarkan student_id dari modal
        if (!$monthlyFee || !$monthlyFee->exists) {
            $monthlyFee = MonthlyFee::where('student_id', $request->student_id)
                ->whereIn('payment_status', ['Unpaid', 'Pending', 'Overdue'])
                ->latest()
                ->first();
        }

        if (!$monthlyFee) {
            return redirect()->back()->withErrors(['student_id' => 'No outstanding fee found for this student.']);
        }

        Payment::create([
            'monthly_fee_id' => $monthlyFee->id,
            'amount' => $request->amount,
            'payment_method' => $request->payment_method,
            'reference_number' => $request->reference_no,
            'remarks' => $request->remarks,
            'paid_at' => Carbon::now('Asia/Kuala_Lumpur'),
            'recorded_by' => Auth::id(),
        ]);

        $monthlyFee->amount_paid += $request->amount;
        $monthlyFee->balance = max(0, $monthlyFee->total_amount - $monthlyFee->amount_paid);

        if ($monthlyFee->balance <= 0) {
            $monthlyFee->payment_status = 'Paid';
        } else {
            $monthlyFee->payment_status = 'Pending';
        }

        $monthlyFee->save();

        return redirect()->back()->with('success', 'Payment recorded successfully.');
    }

    public function updateFeeSettings(Request $request)
    {
        $request->validate([
            'official_closing_time' => 'required',
            'grace_period_minutes' => 'required|integer|min:0',
            'fee_per_unit' => 'required|numeric|min:0',
            'unit_type' => 'required|in:minute,15_min,30_min,hour',
        ]);

        FeeSetting::where('is_active', true)->update(['is_active' => false]);

        FeeSetting::create([
            'name' => 'Standard Fee Rule',
            'official_closing_time' => $request->official_closing_time,
            'grace_period_minutes' => $request->grace_period_minutes,
            'fee_per_unit' => $request->fee_per_unit,
            'unit_type' => $request->unit_type,
            'effective_date' => Carbon::now('Asia/Kuala_Lumpur')->toDateString(),
            'is_active' => true,
        ]);

        return redirect()->back()->with('success', 'Late pickup fee rules updated successfully.');
    }

public function downloadReceipt(MonthlyFee $monthlyFee)
{
    $monthlyFee->load(['student', 'payments']);
    $lastPayment = $monthlyFee->payments->last() ?? Payment::where('monthly_fee_id', $monthlyFee->id)->latest()->first();
    $isPaid = $monthlyFee->payment_status === 'Paid';

    $data = [
        'invoiceRef'     => $monthlyFee->invoice_ref ?? ('INV-' . str_pad($monthlyFee->id, 5, '0', STR_PAD_LEFT)),
        'studentName'    => $monthlyFee->student->full_name ?? ($monthlyFee->student->name ?? 'N/A'),
        'parentName'     => $monthlyFee->student->father_name ?? ($monthlyFee->student->mother_name ?? ($monthlyFee->student->guardian_name ?? 'Parent/Guardian')),
        'className'      => $monthlyFee->student->class_name ?? ($monthlyFee->student->classroom ?? 'N/A'),
        'billingMonth'   => $monthlyFee->billing_month,
        'baseFee'        => (float) $monthlyFee->base_fee,
        'latePickupFee'  => (float) $monthlyFee->late_pickup_fee,
        'totalAmount'    => (float) $monthlyFee->total_amount,
        'amountPaid'     => (float) $monthlyFee->amount_paid,
        'balance'        => (float) $monthlyFee->balance,
        'paymentDate'    => $lastPayment?->paid_at
                            ? Carbon::parse($lastPayment->paid_at)->format('d M, Y')
                            : ($isPaid ? Carbon::parse($monthlyFee->updated_at)->format('d M, Y') : '-'),
        'paymentMethod'  => $lastPayment?->payment_method ?? ($isPaid ? 'ToyyibPay (FPX)' : '-'),
        'transactionId'  => $lastPayment?->reference_number ?? ($isPaid ? 'TYB-' . $monthlyFee->id . '-' . Carbon::parse($monthlyFee->updated_at)->timestamp : '-'),
    ];

    // Penjana PDF Potrait
    $pdf = Pdf::loadView('pdf.receipt', $data)->setPaper('a4', 'portrait');

    return $pdf->download("Receipt-{$data['invoiceRef']}.pdf");
}
}
