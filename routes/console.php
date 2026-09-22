<?php

use Illuminate\Foundation\Inspiring;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\Schedule;

Artisan::command('inspire', function () {
    $this->comment(
        Inspiring::quote()
    );
})->purpose('Display an inspiring quote');


// Every weekday at 8:05 AM, active students without an attendance record
// will automatically be marked as absent.


Schedule::command('attendance:mark-absent')
    ->weekdays()
    ->dailyAt('08:05')
    ->timezone('Asia/Kuala_Lumpur')
    ->withoutOverlapping();
