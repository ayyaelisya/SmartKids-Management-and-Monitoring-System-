<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class MonthlyFee extends Model
{
    protected $fillable = [
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

    public function student(): BelongsTo
    {
        return $this->belongsTo(Student::class, 'student_id', 'student_id');
    }

    // Ubah / Tambah fungsi ini supaya sepadan dengan controller
    public function feeItems(): HasMany
    {
        return $this->hasMany(FeeItem::class, 'monthly_fee_id');
    }

    public function items(): HasMany
    {
        return $this->feeItems();
    }

    public function payments(): HasMany
    {
        return $this->hasMany(Payment::class, 'monthly_fee_id');
    }

    public function recalculateTotals(): void
    {
        $this->total_amount = $this->base_fee + $this->late_pickup_fee + $this->other_charges;
        $this->balance = max(0, $this->total_amount - $this->amount_paid);

        if ($this->balance <= 0 && $this->total_amount > 0) {
            $this->payment_status = 'Paid';
        } elseif ($this->amount_paid > 0) {
            $this->payment_status = 'Partially Paid';
        } elseif (now()->format('Y-m-d') > $this->due_date && $this->balance > 0) {
            $this->payment_status = 'Overdue';
        } else {
            $this->payment_status = 'Unpaid';
        }

        $this->save();
    }
}
