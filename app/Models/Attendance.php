<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasOne;

class Attendance extends Model
{
    protected $fillable = [
        'student_id',
        'date',
        'check_in_time',
        'check_out_time',
        'status',
        'method',
        'recorded_by',
    ];

    // Student attendance owner
    public function student(): BelongsTo
    {
        return $this->belongsTo(
            Student::class,
            'student_id',
            'student_id'
        );
    }

    // User who recorded attendance
    public function recorder(): BelongsTo
    {
        return $this->belongsTo(
            User::class,
            'recorded_by',
            'user_id'
        );
    }

    // Late pickup record
    public function latePickup(): HasOne
    {
        return $this->hasOne(
            LatePickup::class,
            'attendance_id',
            'id'
        );
    }
}
