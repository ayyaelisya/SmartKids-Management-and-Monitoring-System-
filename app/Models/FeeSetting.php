<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class FeeSetting extends Model
{
    protected $fillable = [
        'name',
        'official_closing_time',
        'grace_period_minutes',
        'fee_per_unit',
        'unit_type',
        'effective_date',
        'is_active',
    ];

    protected $casts = [
        'effective_date' => 'date',
        'is_active' => 'boolean',
        'fee_per_unit' => 'decimal:2',
    ];
}
