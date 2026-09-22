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
        'remarks',
        'recorded_by',

        // Parent absence submission
        'absence_reason',
        'absence_attachment',
        'absence_status',
    ];

    protected $casts = [
        'date' => 'date',
    ];

    /**
     * Student who owns this attendance record.
     */
    public function student(): BelongsTo
    {
        return $this->belongsTo(
            Student::class,
            'student_id',
            'student_id'
        );
    }

    /**
     * User who recorded the attendance.
     */
    public function recorder(): BelongsTo
    {
        return $this->belongsTo(
            User::class,
            'recorded_by',
            'user_id'
        );
    }

    /**
     * Late pickup record connected to this attendance.
     */
    public function latePickup(): HasOne
    {
        return $this->hasOne(
            LatePickup::class,
            'attendance_id',
            'id'
        );
    }
}
