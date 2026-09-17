<?php

namespace App\Http\Controllers;

use App\Models\MonthlyFee;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class PaymentController extends Controller
{
    public function checkout(Request $request)
    {
        $request->validate([
            'fee_id' => 'required|exists:monthly_fees,id',
        ]);

        $fee = MonthlyFee::with('student')->findOrFail($request->fee_id);
        $user = Auth::user();

        if (strtolower($fee->payment_status) === 'paid') {
            return response()->json(['error' => 'Yuran ini telah pun dijelaskan.'], 400);
        }

        // Ambil nilai daripada config / env
        $secretKey = config('services.toyyibpay.secret_key', env('TOYYIBPAY_USER_SECRET_KEY'));
        $categoryCode = config('services.toyyibpay.category_code', env('TOYYIBPAY_CATEGORY_CODE'));
        $baseUrl = config('services.toyyibpay.url', env('TOYYIBPAY_URL', 'https://dev.toyyibpay.com'));

        if (empty($secretKey) || empty($categoryCode)) {
            Log::error('ToyyibPay Config Missing: Secret Key atau Category Code tidak dijumpai.');
            return response()->json(['error' => 'Konfigurasi ToyyibPay belum lengkap dalam .env.'], 500);
        }

        $payload = [
            'userSecretKey' => $secretKey,
            'categoryCode' => $categoryCode,
            'billName' => 'Yuran Bulanan ' . ($fee->billing_month ?? ''),
            'billDescription' => 'Pembayaran yuran bagi ' . ($fee->student->full_name ?? 'Pelajar'),
            'billPriceSetting' => 1,
            'billPayorInfo' => 1,
            'billAmount' => (float)($fee->balance > 0 ? $fee->balance : $fee->total_amount) * 100, // Amaun dalam sen
            'billReturnUrl' => route('parent.fees.return'),
            'billCallbackUrl' => route('toyyibpay.callback'),
            'billExternalReferenceNo' => (string)$fee->id,
            'billTo' => $user->full_name ?? $user->name,
            'billEmail' => $user->email ?? 'parent@smartkids.com',
            'billPhone' => $user->phone_number ?? $user->phone ?? '0123456789',
            'billPaymentChannel' => '0',
            'billDisplayContent' => 1,
            'billChargeToCustomer' => 1,
        ];

        try {
            $response = Http::asForm()->post($baseUrl . '/index.php/api/createBill', $payload);

            if ($response->successful() && isset($response->json()[0]['BillCode'])) {
                $billCode = $response->json()[0]['BillCode'];

                // Pulangkan pautan URL pembayaran
                return response()->json([
                    'payment_url' => $baseUrl . '/' . $billCode
                ]);
            }

            Log::error('ToyyibPay API Error Response: ', $response->json() ?? [$response->body()]);
            return response()->json(['error' => 'Gagal membina bil ToyyibPay. Sila semak semula log sistem.'], 400);

        } catch (\Exception $e) {
            Log::error('ToyyibPay Exception: ' . $e->getMessage());
            return response()->json(['error' => 'Berlaku ralat sistem semasa memproses pembayaran.'], 500);
        }
    }

    public function returnUrl(Request $request)
    {
        $statusId = $request->query('status_id');
        $feeId = $request->query('order_id');

        if ($statusId == 1) {
            $fee = MonthlyFee::find($feeId);
            if ($fee && strtolower($fee->payment_status) !== 'paid') {
                $fee->update([
                    'payment_status' => 'Paid',
                    'amount_paid' => $fee->total_amount,
                    'balance' => 0,
                ]);
            }

            return redirect()->route('parent.fees')->with('success', 'Pembayaran yuran berjaya!');
        }

        return redirect()->route('parent.fees')->with('error', 'Pembayaran tidak berjaya atau dibatalkan.');
    }

    public function callback(Request $request)
    {
        $status = $request->input('status');
        $feeId = $request->input('order_id');

        if ($status == 1) {
            $fee = MonthlyFee::find($feeId);
            if ($fee && strtolower($fee->payment_status) !== 'paid') {
                $fee->update([
                    'payment_status' => 'Paid',
                    'amount_paid' => $fee->total_amount,
                    'balance' => 0,
                ]);
            }
        }

        return response()->json(['status' => 'OK']);
    }
}
