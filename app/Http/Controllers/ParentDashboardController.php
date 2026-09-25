<?php

namespace App\Http\Controllers;

use App\Models\Student;
use Carbon\Carbon;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;

class ParentDashboardController extends Controller
{
    public function index()
    {
        $authUser = Auth::user();

        if (!$authUser) {
            return redirect()->route('login');
        }

        $userId = $authUser->user_id ?? $authUser->id;

        $parentRecord = DB::table('parents')
            ->where('user_id', $userId)
            ->first();

        // parent_student.parent_id merujuk kepada parents.parent_id.
        // Jangan gunakan user_id sebagai alternatif kerana nombor ID
        // tersebut mungkin milik rekod parent yang lain.
        $parentId = $parentRecord
            ? ($parentRecord->parent_id ?? $parentRecord->id)
            : null;

        $studentIds = $parentId
            ? DB::table('parent_student')
                ->where('parent_id', $parentId)
                ->pluck('student_id')
                ->unique()
                ->values()
                ->all()
            : [];

        $students = Student::query()
            ->whereIn('student_id', $studentIds)
            ->orderBy('full_name')
            ->get();

        $today = Carbon::today()->toDateString();

        $childrenList = $students->map(function ($student) use ($today) {
            $attendance = DB::table('attendances')
                ->where('student_id', $student->student_id)
                ->whereDate('date', $today)
                ->orderByDesc('created_at')
                ->first();

            $checkInTime = $attendance?->check_in_time
                ? Carbon::parse($attendance->check_in_time)->format('h:i A')
                : null;

            $unpaidAmount = DB::table('monthly_fees')
                ->where('student_id', $student->student_id)
                ->whereIn('payment_status', [
                    'Unpaid',
                    'Overdue',
                    'Partially Paid',
                ])
                ->sum('balance');

            // Medan sebenar dalam Student ialah profile_photo_path.
            $profilePhotoUrl = $this->publicFileUrl(
                $student->profile_photo_path
            );

            // Jika sistem menyimpan imej QR pada salah satu medan ini,
            // URL akan dihantar kepada dashboard. Jika tiada, butang
            // "View attendance QR" tidak akan dipaparkan.
            $qrCodeUrl = $this->publicFileUrl(
                $student->qr_code_path
                    ?? $student->qr_path
                    ?? null
            );

            return [
                'id' => (string) $student->student_id,
                'name' => $student->full_name ?: 'Child',
                'class' => $student->class_name ?: 'Not assigned',

                // Jangan paparkan "Teacher" seolah-olah ia nama sebenar.
                'teacher' => $student->teacher_name ?: null,

                'profile_photo_url' => $profilePhotoUrl,

                'qr_code_token' => $student->qr_code_token,
                'attendance' => [
                    'status' => $attendance?->status
                        ?: 'Not Checked In',
                    'time' => $checkInTime,
                ],

                'fee' => [
                    'unpaid_amount' => number_format(
                        (float) $unpaidAmount,
                        2
                    ),
                    'is_unpaid' => $unpaidAmount > 0,
                ],

                // Aktifkan apabila struktur LearningLog telah disemak.
                'latest_log' => null,
            ];
        });

        $announcements = DB::table('announcements')
            ->where('status', 'Published')
            ->whereIn('target_audience', ['All', 'Parents'])
            ->orderByDesc('published_at')
            ->limit(3)
            ->get()
            ->map(fn ($announcement) => [
                'id' => $announcement->announcement_id
                    ?? $announcement->id,
                'title' => $announcement->title,
                'content' => $announcement->content,
                'date' => $announcement->published_at
                    ? Carbon::parse(
                        $announcement->published_at
                    )->format('d M Y')
                    : '',
            ]);

        return Inertia::render('Parent/ParentDashboard', [
            'childrenList' => $childrenList,
            'announcements' => $announcements,
        ]);
    }

    private function publicFileUrl(?string $path): ?string
    {
        if (!$path) {
            return null;
        }

        if (
            str_starts_with($path, 'http://') ||
            str_starts_with($path, 'https://') ||
            str_starts_with($path, 'data:')
        ) {
            return $path;
        }

        if (str_starts_with($path, '/')) {
            return url($path);
        }

        $path = preg_replace('#^(public/|storage/)#', '', $path);

        return asset(Storage::url($path));
    }
}
