<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class FeeItem extends Model
{
    protected $fillable = [
        'monthly_fee_id',
        'description',
        'amount',
        'type',
    ];

    public function monthlyFee(): BelongsTo
    {
        return $this->belongsTo(MonthlyFee::class);
    }
}
