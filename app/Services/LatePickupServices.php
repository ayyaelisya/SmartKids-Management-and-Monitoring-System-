<?php

namespace App\Services;

use App\Models\Attendance;
use App\Models\FeeSetting;
use App\Models\LatePickup;
use Carbon\Carbon;

class LatePickupService
{
    public function processCheckout(Attendance $attendance, string $checkoutTimeStr): ?LatePickup
    {
        $setting = FeeSetting::where('is_active', true)->first();
        if (!$setting) {
            return null;
        }

        $officialTime = Carbon::createFromTimeString($setting->official_closing_time, 'Asia/Kuala_Lumpur');
        $actualCheckout = Carbon::createFromTimeString($checkoutTimeStr, 'Asia/Kuala_Lumpur');

        if ($actualCheckout->greaterThan($officialTime)) {
            $diffMinutes = $officialTime::parse($officialTime)->diffInMinutes($actualCheckout);

            $billableMinutes = $diffMinutes - $setting->grace_period_minutes;

            if ($billableMinutes > 0) {
                $fee = 0;
                switch ($setting->unit_type) {
                    case 'minute':
                        $fee = $billableMinutes * $setting->fee_per_unit;
                        break;
                    case '15_min':
                        $fee = ceil($billableMinutes / 15) * $setting->fee_per_unit;
                        break;
                    case '30_min':
                        $fee = ceil($billableMinutes / 30) * $setting->fee_per_unit;
                        break;
                    case 'hour':
                        $fee = ceil($billableMinutes / 60) * $setting->fee_per_unit;
                        break;
                }

                return LatePickup::updateOrCreate(
                    ['attendance_id' => $attendance->id],
                    [
                        'student_id' => $attendance->student_id,
                        'late_minutes' => $diffMinutes,
                        'calculated_fee' => $fee,
                        'is_billed' => false
                    ]
                );
            }
        }

        return null;
    }
}
