<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Payment extends Model
{
    protected $fillable = [
        'monthly_fee_id',
        'amount',
        'payment_method',
        'reference_number',
        'paid_at',
        'recorded_by',
    ];

    public function monthlyFee(): BelongsTo
    {
        return $this->belongsTo(MonthlyFee::class);
    }

    public function recorder(): BelongsTo
    {
        return $this->belongsTo(User::class, 'recorded_by');
    }
}
