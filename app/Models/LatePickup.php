<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class LatePickup extends Model
{
    protected $fillable = [
        'attendance_id',
        'student_id',
        'late_minutes',
        'calculated_fee',
        'is_billed',
    ];

    protected $casts = [
        'late_minutes' => 'integer',
        'calculated_fee' => 'decimal:2',
        'is_billed' => 'boolean',
    ];

    // Get attendance record for this late pickup
    public function attendance(): BelongsTo
    {
        return $this->belongsTo(
            Attendance::class,
            'attendance_id',
            'id'
        );
    }

    // Get student for this late pickup
    public function student(): BelongsTo
    {
        return $this->belongsTo(
            Student::class,
            'student_id',
            'student_id'
        );
    }
}
