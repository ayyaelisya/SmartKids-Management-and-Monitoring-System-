<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Inertia\Inertia;
use App\Models\Student;
use Carbon\Carbon;

class AdminAttendanceController extends Controller
{
    /**
     * Papar halaman utama pemantauan kehadiran untuk Admin
     */
    public function index(Request $request)
    {
        // 1. Dapatkan tarikh carian (format Y-m-d)
        $selectedDate = $request->input('date', Carbon::today()->format('Y-m-d'));

        // 2. Ambil semua pelajar dengan Eager Loading (Cepat & Elak N+1 Query)
        $students = Student::with(['attendances' => function ($query) use ($selectedDate) {
            $query->whereDate('date', $selectedDate)->with('latePickup');
        }])->get()->map(function ($student) {

            // Ambil rekod attendance untuk tarikh yang difilter
            $attendance = $student->attendances->first();
            $latePickup = $attendance?->latePickup;

            return [
                'id'             => $student->id,
                'name'           => $student->full_name ?? $student->name ?? 'Unknown Student',
                'class_name'     => $student->class_name ?? 'Unassigned',
                'check_in_time'  => $attendance?->check_in_time ? Carbon::parse($attendance->check_in_time)->format('h:i A') : null,
                'check_out_time' => $attendance?->check_out_time ? Carbon::parse($attendance->check_out_time)->format('h:i A') : null,
                'status'         => $attendance?->status ?? 'Absent',
                'is_late_pickup' => $latePickup ? true : false,
                'late_minutes'   => $latePickup?->late_minutes ?? 0,
                'late_fee'       => $latePickup?->calculated_fee ?? 0,
            ];
        });

        // 3. Senarai kelas unik (Menggunakan kolum class_name sahaja)
        $classes = Student::whereNotNull('class_name')
            ->distinct()
            ->pluck('class_name')
            ->toArray();

        if (empty($classes)) {
            $classes = ['Playgroup A', 'Kindy A', 'Kindy B'];
        }

        // 4. Hantar data ke React (Tukar 'Attendance' jika lokasi fail berbeza)
        return Inertia::render('Attendance', [
            'students'     => $students,
            'selectedDate' => $selectedDate,
            'classes'      => $classes,
        ]);
    }
}
