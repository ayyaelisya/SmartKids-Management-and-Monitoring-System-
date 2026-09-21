<?php

namespace App\Services;

use App\Models\Attendance;
use App\Models\LatePickup;
use Carbon\Carbon;

class LatePickupService
{
    private float $ratePerMinute = 0.10;

    // Calculate late pickup only from actual check-out time
    public function processCheckout(
        Attendance $attendance,
        string $checkoutTime
    ): ?LatePickup {
        $attendance->loadMissing('student.package');

        $student = $attendance->student;
        $package = $student?->package;

        // Student must have a package with an end time
        if (!$student || !$package || !$package->end_time) {
            return null;
        }

        // Expected pickup time comes from the student's package
        $expectedPickup = Carbon::createFromFormat(
            'Y-m-d H:i:s',
            $attendance->date . ' ' . $package->end_time,
            'Asia/Kuala_Lumpur'
        );

        // Actual pickup time comes ONLY from check-out time
        $actualPickup = Carbon::createFromFormat(
            'Y-m-d H:i:s',
            $attendance->date . ' ' . $checkoutTime,
            'Asia/Kuala_Lumpur'
        );

        // No late pickup if child checks out on time or earlier
        if ($actualPickup->lessThanOrEqualTo($expectedPickup)) {
            LatePickup::where('attendance_id', $attendance->id)
                ->where('is_billed', false)
                ->delete();

            return null;
        }

        // Calculate full late minutes from package end time to check-out time
        $lateSeconds = $expectedPickup->diffInSeconds(
            $actualPickup
        );

        $lateMinutes = (int) floor($lateSeconds / 60);

        // Charge RM0.10 for every full late minute
        $lateFee = round(
            $lateMinutes * $this->ratePerMinute,
            2
        );

        // Do not create a charge if less than one full minute late
        if ($lateMinutes <= 0) {
            return null;
        }

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
