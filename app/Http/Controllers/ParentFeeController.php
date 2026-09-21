<?php

namespace App\Http\Controllers;

use App\Models\MonthlyFee;
use App\Models\ParentsModel;
use Barryvdh\DomPDF\Facade\Pdf;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;

class ParentFeeController extends Controller
{
    public function index(Request $request)
    {
        $user = Auth::user();

        // Get the parent profile and linked children
        $parent = ParentsModel::where('user_id', $user->user_id)
            ->with('students')
            ->first();

        if (!$parent) {
            abort(403, 'Parent profile was not found.');
        }

        $studentIds = $parent->students
            ->pluck('student_id')
            ->toArray();

        // Only show invoices belonging to the parent's linked children
        $query = MonthlyFee::with([
            'student',
            'items',
            'payments',
        ])->whereIn('student_id', $studentIds);

        if ($request->filled('month')) {
            $query->where(
                'billing_month',
                'like',
                "%{$request->month}%"
            );
        }

        if ($request->filled('year')) {
            $query->where(
                'billing_month',
                'like',
                "%{$request->year}%"
            );
        }

        $fees = $query
            ->latest()
            ->get()
            ->map(function ($fee) {
                $lastPayment = $fee->payments
                    ->sortByDesc('paid_at')
                    ->first();

                return [
                    'id' => $fee->id,

                    'invoice_ref' => $fee->invoice_ref
                        ?? (
                            'INV-' .
                            str_pad(
                                $fee->id,
                                5,
                                '0',
                                STR_PAD_LEFT
                            )
                        ),

                    'student_id' => $fee->student_id,

                    'student' => $fee->student,

                    'student_name' =>
                        $fee->student->full_name ?? 'N/A',

                    'billing_month' =>
                        $fee->billing_month,

                    'base_fee' =>
                        (float) $fee->base_fee,

                    'late_pickup_fee' =>
                        (float) $fee->late_pickup_fee,

                    'other_charges' =>
                        (float) ($fee->other_charges ?? 0),

                    'total_amount' =>
                        (float) $fee->total_amount,

                    'amount_paid' =>
                        (float) $fee->amount_paid,

                    'balance' =>
                        (float) $fee->balance,

                    'due_date' =>
                        $fee->due_date,

                    'payment_status' =>
                        $fee->payment_status,

                    'status' =>
                        $fee->payment_status,

                    'fee_items' =>
                        $fee->items,

                    'payments' =>
                        $fee->payments,

                    'payment_method' =>
                        $lastPayment?->payment_method,

                    'transaction_id' =>
                        $lastPayment?->reference_number,

                    'payment_date' =>
                        $lastPayment?->paid_at,
                ];
            });

        return Inertia::render(
            'Parent/ParentFeeManagement',
            [
                'fees' => $fees,
                'filters' => $request->only([
                    'month',
                    'year',
                ]),
            ]
        );
    }

    public function downloadReceipt(MonthlyFee $monthlyFee)
    {
        $user = Auth::user();

        // Get the parent profile and linked children
        $parent = ParentsModel::where('user_id', $user->user_id)
            ->with('students')
            ->first();

        if (!$parent) {
            abort(403, 'Parent profile was not found.');
        }

        $studentIds = $parent->students
            ->pluck('student_id')
            ->toArray();

        // Prevent parents from accessing another child's receipt
        if (!in_array(
            $monthlyFee->student_id,
            $studentIds
        )) {
            abort(
                403,
                'You are not allowed to access this receipt.'
            );
        }

        // Receipt is only available after full payment
        if (
            strtolower($monthlyFee->payment_status)
            !== 'paid'
        ) {
            return redirect()
                ->route('parent.fees')
                ->with(
                    'error',
                    'Receipt is only available for fully paid invoices.'
                );
        }

        $monthlyFee->load([
            'student',
            'payments',
        ]);

        $lastPayment = $monthlyFee
            ->payments
            ->sortByDesc('paid_at')
            ->first();

        if (!$lastPayment) {
            return redirect()
                ->route('parent.fees')
                ->with(
                    'error',
                    'Payment record was not found for this invoice.'
                );
        }

        // Use the linked parent account name
        $parentName =
            $user->full_name
            ?? $user->name
            ?? $monthlyFee->student->guardian_name
            ?? 'Parent/Guardian';

        $data = [
            'invoiceRef' =>
                $monthlyFee->invoice_ref
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
                $monthlyFee->student->full_name
                ?? 'N/A',

            'parentName' =>
                $parentName,

            'className' =>
                $monthlyFee->student->class_name
                ?? 'N/A',

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

            'paymentDate' =>
                $lastPayment->paid_at
                    ? Carbon::parse(
                        $lastPayment->paid_at
                    )->format('d M, Y')
                    : '-',

            'paymentMethod' =>
                $lastPayment->payment_method
                ?? '-',

            'transactionId' =>
                $lastPayment->reference_number
                ?? '-',
        ];

        // Reuse the same receipt template as Admin
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
