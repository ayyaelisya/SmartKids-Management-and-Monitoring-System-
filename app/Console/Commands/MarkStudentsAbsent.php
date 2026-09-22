<?php

namespace App\Console\Commands;

use App\Models\Attendance;
use App\Models\Student;
use Illuminate\Console\Command;

class MarkStudentsAbsent extends Command
{
    protected $signature =
        'attendance:mark-absent';

    protected $description =
        'Mark students without check-in records as absent after 8:00 AM';

    public function handle(): int
    {
        $today = now('Asia/Kuala_Lumpur')
            ->toDateString();

        $absentCount = 0;

        Student::query()
            ->where('is_active', true)
            ->whereDoesntHave(
                'attendances',
                function ($query) use ($today) {
                    $query->whereDate(
                        'date',
                        $today
                    );
                }
            )
            ->chunkById(
                100,
                function ($students) use (
                    $today,
                    &$absentCount
                ) {
                    foreach ($students as $student) {
                        $attendance =
                            Attendance::firstOrCreate(
                                [
                                    'student_id' =>
                                        $student->student_id,

                                    'date' => $today,
                                ],
                                [
                                    'status' => 'Absent',
                                    'method' => 'Automatic',
                                    'recorded_by' => null,
                                ]
                            );

                        if ($attendance->wasRecentlyCreated) {
                            $absentCount++;
                        }
                    }
                },
                'student_id'
            );

        $this->info(
            "{$absentCount} student(s) marked as absent for {$today}."
        );

        return self::SUCCESS;
    }
}
