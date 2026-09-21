<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class MonthlyFee extends Model
{
    protected $fillable = [
        'invoice_ref',
        'student_id',
        'billing_month',
        'base_fee',
        'late_pickup_fee',
        'other_charges',
        'total_amount',
        'amount_paid',
        'balance',
        'payment_status',
        'due_date',
    ];

    protected $casts = [
        'base_fee' => 'decimal:2',
        'late_pickup_fee' => 'decimal:2',
        'other_charges' => 'decimal:2',
        'total_amount' => 'decimal:2',
        'amount_paid' => 'decimal:2',
        'balance' => 'decimal:2',
        'due_date' => 'date',
    ];

    // Get student for this monthly fee
    public function student(): BelongsTo
    {
        return $this->belongsTo(
            Student::class,
            'student_id',
            'student_id'
        );
    }

    // Get fee items for this monthly fee
    public function feeItems(): HasMany
    {
        return $this->hasMany(
            FeeItem::class,
            'monthly_fee_id',
            'id'
        );
    }

    // Alias for fee items
    public function items(): HasMany
    {
        return $this->feeItems();
    }

    // Get payment records for this monthly fee
    public function payments(): HasMany
    {
        return $this->hasMany(
            Payment::class,
            'monthly_fee_id',
            'id'
        );
    }

    // Recalculate invoice totals and payment status
    public function recalculateTotals(): void
    {
        $this->total_amount =
            (float) $this->base_fee +
            (float) $this->late_pickup_fee +
            (float) $this->other_charges;

        $this->balance = max(
            0,
            (float) $this->total_amount -
            (float) $this->amount_paid
        );

        if (
            $this->balance <= 0 &&
            $this->total_amount > 0
        ) {
            $this->payment_status = 'Paid';
        } elseif ($this->amount_paid > 0) {
            $this->payment_status = 'Partially Paid';
        } elseif (
            $this->due_date &&
            now()->startOfDay()->greaterThan(
                $this->due_date->copy()->startOfDay()
            ) &&
            $this->balance > 0
        ) {
            $this->payment_status = 'Overdue';
        } else {
            $this->payment_status = 'Unpaid';
        }

        $this->save();
    }
}
