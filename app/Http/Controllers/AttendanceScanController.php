<?php

namespace App\Http\Controllers;

use App\Models\Attendance;
use App\Models\Student;
use App\Services\LatePickupService;
use Carbon\Carbon;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;

class AttendanceScanController extends Controller
{
    protected LatePickupService $latePickupService;

    public function __construct(LatePickupService $latePickupService)
    {
        $this->latePickupService = $latePickupService;
    }

    public function index()
    {
        $today = Carbon::now('Asia/Kuala_Lumpur')->toDateString();
        $recentAttendances = Attendance::with('student')
            ->where('date', $today)
            ->latest('updated_at')
            ->take(10)
            ->get();

        return Inertia::render('Teacher/ScanQR', [
            'recentAttendances' => $recentAttendances
        ]);
    }

    public function scan(Request $request): JsonResponse
    {
        $request->validate([
            'qr_code' => 'required|string',
        ]);

        $student = Student::where('qr_code', $request->qr_code)->first();

        if (!$student) {
            return response()->json([
                'success' => false,
                'message' => 'Scan Failed: Invalid Student QR Code.'
            ], 404);
        }

        $now = Carbon::now('Asia/Kuala_Lumpur');
        $today = $now->toDateString();
        $currentTime = $now->toTimeString();

        $attendance = Attendance::where('student_id', $student->id)
            ->where('date', $today)
            ->first();

        if (!$attendance) {
            // Check-In Logic
            $status = $now->format('H:i:s') > '08:00:00' ? 'Late Arrival' : 'Present';

            $attendance = Attendance::create([
                'student_id' => $student->id,
                'date' => $today,
                'check_in_time' => $currentTime,
                'status' => $status,
                'recorded_by' => Auth::id(),
            ]);

            return response()->json([
                'success' => true,
                'action' => 'Check In',
                'student_name' => $student->name,
                'time' => $now->format('g:i A'),
                'status' => $status,
                'message' => 'Check-in recorded successfully.'
            ]);
        }

        if ($attendance->check_out_time !== null) {
            return response()->json([
                'success' => false,
                'message' => 'Student has already checked out for today.'
            ], 422);
        }

        // Check-Out Logic
        $attendance->check_out_time = $currentTime;
        
        $latePickup = $this->latePickupService->processCheckout($attendance, $currentTime);

        if ($latePickup) {
            $attendance->status = 'Checked Out';
            $attendance->save();

            return response()->json([
                'success' => true,
                'action' => 'Check Out',
                'student_name' => $student->name,
                'time' => $now->format('g:i A'),
                'status' => 'Late Pickup',
                'late_duration' => $latePickup->late_minutes . ' minutes',
                'late_fee' => 'RM ' . number_format($latePickup->calculated_fee, 2),
                'message' => 'Check-out recorded with Late Pickup fee.'
            ]);
        }

        $attendance->status = 'Checked Out';
        $attendance->save();

        return response()->json([
            'success' => true,
            'action' => 'Check Out',
            'student_name' => $student->name,
            'time' => $now->format('g:i A'),
            'status' => 'Checked Out',
            'message' => 'Check-out recorded successfully.'
        ]);
    }
}