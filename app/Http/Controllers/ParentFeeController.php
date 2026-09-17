<?php

namespace App\Http\Controllers;

use App\Models\MonthlyFee;
use App\Models\Student;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class ParentFeeController extends Controller
{
    public function index(Request $request)
    {
        $user = Auth::user();

        // 1. Ambil student_id anak-anak berpandukan parent_id (user_id) dalam jadual parent_student
        // Sekiranya tiada pautan di parent_student, ia akan secara automatik menyemak No Telefon & Email sebagai backup
        $studentIds = DB::table('parent_student')
            ->where('parent_id', $user->user_id ?? $user->id)
            ->pluck('student_id')
            ->toArray();

        if (empty($studentIds)) {
            $studentIds = Student::query()
                ->when($user->phone_number ?? null, function ($q, $phone) {
                    $q->orWhere('father_phone', $phone)
                      ->orWhere('mother_phone', $phone)
                      ->orWhere('guardian_phone', $phone);
                })
                ->when($user->email ?? null, function ($q, $email) {
                    $q->orWhere('email', $email);
                })
                ->pluck('student_id')
                ->toArray();
        }

// Tukar kueri eager-loading:
$query = MonthlyFee::with(['student', 'items', 'payments'])
    ->whereIn('student_id', $studentIds);

        if ($request->filled('year')) {
            $query->where('billing_month', 'like', "%{$request->year}%");
        }

        $fees = $query->latest()->get()->map(function ($fee) {
            return [
                'id' => $fee->id,
                'student_id' => $fee->student_id,
                'student' => $fee->student,
                'student_name' => $fee->student->full_name ?? 'N/A',
                'billing_month' => $fee->billing_month,
                'base_fee' => (float) $fee->base_fee,
                'late_pickup_fee' => (float) $fee->late_pickup_fee,
                'other_charges' => (float) $fee->other_charges,
                'total_amount' => (float) $fee->total_amount,
                'amount_paid' => (float) $fee->amount_paid,
                'balance' => (float) $fee->balance,
                'due_date' => $fee->due_date,
                'payment_status' => $fee->payment_status,
                'status' => $fee->payment_status,
                'fee_items' => $fee->feeItems,
                'payments' => $fee->payments,
            ];
        });

        return Inertia::render('Parent/ParentFeeManagement', [
            'fees' => $fees,
            'filters' => $request->only(['month', 'year'])
        ]);
    }
}
