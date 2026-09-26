<?php

namespace App\Services;

use App\Models\Attendance;
use App\Models\LatePickup;
use Carbon\Carbon;

class LatePickupService
{
    private float $ratePerMinute = 0.10;

    public function processCheckout(
        Attendance $attendance,
        string $checkoutTime
    ): ?LatePickup {
        $attendance->loadMissing('student.package');

        $student = $attendance->student;
        $package = $student?->package;

        if (!$student || !$package || !$package->end_time) {
            return null;
        }

        // Attendance model casts date to Carbon. Format it as a date
        // before combining it with the package and checkout times.
        $attendanceDate = $attendance->date->format('Y-m-d');

        $expectedPickup = Carbon::createFromFormat(
            'Y-m-d H:i:s',
            $attendanceDate . ' ' . $package->end_time,
            'Asia/Kuala_Lumpur'
        );

        $actualPickup = Carbon::createFromFormat(
            'Y-m-d H:i:s',
            $attendanceDate . ' ' . $checkoutTime,
            'Asia/Kuala_Lumpur'
        );

        if ($actualPickup->lessThanOrEqualTo($expectedPickup)) {
            LatePickup::where('attendance_id', $attendance->id)
                ->where('is_billed', false)
                ->delete();

            return null;
        }

        $lateSeconds = $expectedPickup->diffInSeconds($actualPickup);
        $lateMinutes = (int) floor($lateSeconds / 60);

        if ($lateMinutes <= 0) {
            return null;
        }

        $lateFee = round(
            $lateMinutes * $this->ratePerMinute,
            2
        );

        return LatePickup::updateOrCreate(
            [
                'attendance_id' => $attendance->id,
            ],
            [
                'student_id' => $attendance->student_id,
                'late_minutes' => $lateMinutes,
                'calculated_fee' => $lateFee,
                'is_billed' => false,
            ]
        );
    }
}
