<?php

namespace App\Http\Controllers;

use App\Models\MonthlyFee;
use App\Models\ParentsModel;
use App\Models\Payment;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class PaymentController extends Controller
{
    // Create ToyyibPay bill for parent's own child
    public function checkout(Request $request)
    {
        $validated = $request->validate([
            'fee_id' => 'required|exists:monthly_fees,id',
        ]);

        $user = Auth::user();

        $parent = ParentsModel::where('user_id', $user->user_id)
            ->with('students')
            ->first();

        if (!$parent) {
            return response()->json([
                'error' => 'Parent profile was not found.',
            ], 403);
        }

        $studentIds = $parent->students
            ->pluck('student_id')
            ->toArray();

        $fee = MonthlyFee::with('student')
            ->where('id', $validated['fee_id'])
            ->whereIn('student_id', $studentIds)
            ->first();

        if (!$fee) {
            return response()->json([
                'error' => 'You are not allowed to pay this invoice.',
            ], 403);
        }

        if (strtolower($fee->payment_status) === 'paid') {
            return response()->json([
                'error' => 'This fee has already been paid.',
            ], 400);
        }

        $amountToPay = (float) $fee->balance;

        if ($amountToPay <= 0) {
            return response()->json([
                'error' => 'This invoice has no outstanding balance.',
            ], 400);
        }

        $secretKey = config(
            'services.toyyibpay.secret_key',
            env('TOYYIBPAY_USER_SECRET_KEY')
        );

        $categoryCode = config(
            'services.toyyibpay.category_code',
            env('TOYYIBPAY_CATEGORY_CODE')
        );

        $baseUrl = rtrim(
            config(
                'services.toyyibpay.url',
                env('TOYYIBPAY_URL', 'https://dev.toyyibpay.com')
            ),
            '/'
        );

        if (!$secretKey || !$categoryCode) {
            Log::error('ToyyibPay configuration is incomplete.');

            return response()->json([
                'error' => 'ToyyibPay configuration is incomplete.',
            ], 500);
        }

        $payload = [
            'userSecretKey' => $secretKey,
            'categoryCode' => $categoryCode,
            'billName' => 'Monthly Fee ' . $fee->billing_month,
            'billDescription' => 'Fee payment for ' . ($fee->student->full_name ?? 'Student'),
            'billPriceSetting' => 1,
            'billPayorInfo' => 1,
            'billAmount' => (int) round($amountToPay * 100),
            'billReturnUrl' => route('parent.fees.return'),
            'billCallbackUrl' => route('toyyibpay.callback'),
            'billExternalReferenceNo' => (string) $fee->id,
            'billTo' => $user->full_name ?? $user->name ?? 'Parent',
            'billEmail' => $user->email ?? '',
            'billPhone' => $user->phone_number ?? $user->phone ?? '',
            'billPaymentChannel' => '0',
            'billDisplayContent' => 1,
            'billChargeToCustomer' => 1,
        ];

        try {
            $response = Http::asForm()
                ->timeout(30)
                ->post(
                    $baseUrl . '/index.php/api/createBill',
                    $payload
                );

            $data = $response->json();

            if (
                is_array($data) &&
                isset($data[0]['BillCode'])
            ) {
                $billCode = $data[0]['BillCode'];

                return response()->json([
                    'payment_url' => $baseUrl . '/' . $billCode,
                ]);
            }

            Log::error('ToyyibPay createBill failed.', [
                'status' => $response->status(),
                'body' => $response->body(),
            ]);

            return response()->json([
                'error' => 'Unable to create ToyyibPay bill.',
            ], 400);
        } catch (\Throwable $e) {
            Log::error('ToyyibPay checkout exception.', [
                'message' => $e->getMessage(),
            ]);

            return response()->json([
                'error' => 'A system error occurred while preparing payment.',
            ], 500);
        }
    }

 // Handle parent return from ToyyibPay
public function returnUrl(Request $request)
{
    $statusId = (string) $request->query('status_id');
    $billCode = (string) $request->query('billcode');
    $feeId = $request->query('order_id');

    if (!$feeId || !$billCode) {
        return redirect()
            ->route('parent.fees')
            ->with('error', 'Invalid payment response.');
    }

    $user = Auth::user();

    $parent = ParentsModel::where('user_id', $user->user_id)
        ->with('students')
        ->first();

    if (!$parent) {
        abort(403);
    }

    $studentIds = $parent->students
        ->pluck('student_id')
        ->toArray();

    $fee = MonthlyFee::with('student')
        ->where('id', $feeId)
        ->whereIn('student_id', $studentIds)
        ->first();

    if (!$fee) {
        abort(403);
    }

    if ($statusId === '2') {
        return redirect()
            ->route('parent.fees')
            ->with('info', 'Your payment is pending confirmation.');
    }

    if ($statusId !== '1') {
        return redirect()
            ->route('parent.fees')
            ->with('error', 'Payment was unsuccessful or cancelled.');
    }

    $baseUrl = rtrim(
        config(
            'services.toyyibpay.url',
            env('TOYYIBPAY_URL', 'https://dev.toyyibpay.com')
        ),
        '/'
    );

    try {
        // Verify the payment directly with ToyyibPay
        $response = Http::asForm()
            ->timeout(30)
            ->post(
                $baseUrl . '/index.php/api/getBillTransactions',
                [
                    'billCode' => $billCode,
                    'billpaymentStatus' => '1',
                ]
            );

        $transactions = $response->json();

        if (!is_array($transactions) || empty($transactions)) {
            Log::warning('ToyyibPay payment verification failed.', [
                'fee_id' => $fee->id,
                'bill_code' => $billCode,
                'response' => $response->body(),
            ]);

            return redirect()
                ->route('parent.fees')
                ->with(
                    'info',
                    'Payment has not been confirmed yet. Please check again shortly.'
                );
        }

        // Find the successful transaction for this invoice
        $transaction = collect($transactions)->first(function ($item) use ($fee) {
            return isset($item['billpaymentStatus'])
                && (string) $item['billpaymentStatus'] === '1'
                && isset($item['billExternalReferenceNo'])
                && (string) $item['billExternalReferenceNo'] === (string) $fee->id;
        });

        if (!$transaction) {
            Log::warning('No matching ToyyibPay transaction found.', [
                'fee_id' => $fee->id,
                'bill_code' => $billCode,
            ]);

            return redirect()
                ->route('parent.fees')
                ->with('error', 'Unable to verify this payment.');
        }

        $paidAmount = round(
            (float) ($transaction['billpaymentAmount'] ?? 0),
            2
        );

        $expectedAmount = round((float) $fee->balance, 2);

        if ($paidAmount !== $expectedAmount) {
            Log::warning('ToyyibPay verified amount mismatch.', [
                'fee_id' => $fee->id,
                'expected_amount' => $expectedAmount,
                'paid_amount' => $paidAmount,
            ]);

            return redirect()
                ->route('parent.fees')
                ->with('error', 'The verified payment amount does not match the invoice.');
        }

        $referenceNumber =
            $transaction['billpaymentInvoiceNo']
            ?? $billCode;

        DB::transaction(function () use (
            $fee,
            $paidAmount,
            $referenceNumber,
            $transaction
        ) {
            $lockedFee = MonthlyFee::where('id', $fee->id)
                ->lockForUpdate()
                ->firstOrFail();

            // Prevent duplicate payment records
            $existingPayment = Payment::where(
                'reference_number',
                $referenceNumber
            )->first();

            if ($existingPayment) {
                return;
            }

            if (strtolower($lockedFee->payment_status) === 'paid') {
                return;
            }

            $paymentDate = Carbon::now('Asia/Kuala_Lumpur');

            if (!empty($transaction['billPaymentDate'])) {
                try {
                    $paymentDate = Carbon::createFromFormat(
                        'd-m-Y H:i:s',
                        $transaction['billPaymentDate'],
                        'Asia/Kuala_Lumpur'
                    );
                } catch (\Throwable $e) {
                    $paymentDate = Carbon::now('Asia/Kuala_Lumpur');
                }
            }

            Payment::create([
                'monthly_fee_id' => $lockedFee->id,
                'amount' => $paidAmount,
                'payment_method' => 'ToyyibPay FPX',
                'reference_number' => $referenceNumber,
                'paid_at' => $paymentDate,
                'recorded_by' => null,
            ]);

            $lockedFee->amount_paid =
                (float) $lockedFee->amount_paid + $paidAmount;

            $lockedFee->balance = max(
                0,
                (float) $lockedFee->total_amount -
                (float) $lockedFee->amount_paid
            );

            if ($lockedFee->balance <= 0) {
                $lockedFee->payment_status = 'Paid';
            } else {
                $lockedFee->payment_status = 'Partially Paid';
            }

            $lockedFee->save();
        });

return redirect()
    ->route('parent.fees.receipt', [
        'monthlyFee' => $fee->id,
    ]);

    } catch (\Throwable $e) {
        Log::error('ToyyibPay return verification exception.', [
            'fee_id' => $fee->id,
            'bill_code' => $billCode,
            'message' => $e->getMessage(),
        ]);

        return redirect()
            ->route('parent.fees')
            ->with(
                'error',
                'Unable to verify the payment at this time.'
            );
    }
}

    // Receive server-to-server payment status from ToyyibPay
    public function callback(Request $request)
    {
        $secretKey = config(
            'services.toyyibpay.secret_key',
            env('TOYYIBPAY_USER_SECRET_KEY')
        );

        if (!$secretKey) {
            Log::error('ToyyibPay callback rejected: missing secret key.');

            return response()->json([
                'status' => 'ERROR',
            ], 500);
        }

        $status = (string) $request->input('status');
        $feeId = $request->input('order_id');
        $referenceNumber = (string) $request->input('refno');
        $receivedHash = (string) $request->input('hash');
        $receivedAmount = $request->input('amount');

        $expectedHash = md5(
            $secretKey .
            $status .
            $feeId .
            $referenceNumber .
            'ok'
        );

        if (
            !$receivedHash ||
            !hash_equals($expectedHash, $receivedHash)
        ) {
            Log::warning('Invalid ToyyibPay callback hash.', [
                'fee_id' => $feeId,
                'reference_number' => $referenceNumber,
            ]);

            return response()->json([
                'status' => 'INVALID',
            ], 403);
        }

        if ($status !== '1') {
            return response()->json([
                'status' => 'OK',
            ]);
        }

        $fee = MonthlyFee::find($feeId);

        if (!$fee) {
            Log::warning('ToyyibPay callback invoice not found.', [
                'fee_id' => $feeId,
            ]);

            return response()->json([
                'status' => 'NOT_FOUND',
            ], 404);
        }

// Return OK if this transaction was already recorded
$existingPayment = Payment::where(
    'reference_number',
    $referenceNumber
)->first();

if ($existingPayment) {
    return response()->json([
        'status' => 'OK',
    ]);
}

// Return OK if the invoice is already fully paid
if (strtolower($fee->payment_status) === 'paid') {
    return response()->json([
        'status' => 'OK',
    ]);
}

$expectedAmount = round(
    (float) $fee->balance,
    2
);

$callbackAmount = round(
    (float) $receivedAmount,
    2
);

if ($callbackAmount !== $expectedAmount) {
    Log::warning(
        'ToyyibPay callback amount mismatch.',
        [
            'fee_id' => $fee->id,
            'expected_amount' => $expectedAmount,
            'received_amount' => $callbackAmount,
        ]
    );

    return response()->json([
        'status' => 'AMOUNT_MISMATCH',
    ], 422);
}

        DB::transaction(function () use (
            $fee,
            $referenceNumber,
            $callbackAmount,
            $request
        ) {
            $lockedFee = MonthlyFee::where('id', $fee->id)
                ->lockForUpdate()
                ->firstOrFail();

            $existingPayment = Payment::where(
                'reference_number',
                $referenceNumber
            )->first();

            if ($existingPayment) {
                return;
            }

            if ($lockedFee->payment_status === 'Paid') {
                return;
            }

            Payment::create([
                'monthly_fee_id' => $lockedFee->id,
                'amount' => $callbackAmount,
                'payment_method' => 'ToyyibPay FPX',
                'reference_number' => $referenceNumber,
                'paid_at' => $request->input('transaction_time')
                    ? Carbon::parse(
                        $request->input('transaction_time'),
                        'Asia/Kuala_Lumpur'
                    )
                    : Carbon::now('Asia/Kuala_Lumpur'),
                'recorded_by' => null,
            ]);

            $lockedFee->amount_paid =
                (float) $lockedFee->amount_paid + $callbackAmount;

            $lockedFee->balance = max(
                0,
                (float) $lockedFee->total_amount -
                (float) $lockedFee->amount_paid
            );

            if ($lockedFee->balance <= 0) {
                $lockedFee->payment_status = 'Paid';
            } elseif ($lockedFee->amount_paid > 0) {
                $lockedFee->payment_status = 'Partially Paid';
            }

            $lockedFee->save();
        });

        return response()->json([
            'status' => 'OK',
        ]);
    }
}
