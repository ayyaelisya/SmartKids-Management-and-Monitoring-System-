<?php

namespace App\Http\Controllers;

use App\Models\Student;
use App\Models\LearningLog;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;

class LearningLogController extends Controller
{
    public function index()
    {
        $students = Student::select('student_id', 'full_name', 'class_name')
            ->get()
            ->map(function ($student) {
                return [
                    'id'    => $student->student_id,
                    'name'  => $student->full_name,
                    'class' => $student->class_name ?? 'Tiada Kelas',
                ];
            });

        $logs = LearningLog::latest()->get()->map(function ($log) {
            // Pastikan activity_data sentiasa dalam bentuk Array
            $actData = $log->activity_data;
            if (is_string($actData)) {
                $actData = json_decode($actData, true) ?? [];
            }

            return [
                'id'            => $log->id,
                'student_id'    => $log->student_id,
                'teacher_name'  => $log->teacher_name,
                'category'      => $log->category,
                'activity_data' => $actData,
                'text'          => $log->text,
                'image'         => $log->image,
                'time'          => $log->time,
                'date'          => $log->log_date ?? ($log->created_at ? $log->created_at->format('Y-m-d') : date('Y-m-d')),
            ];
        });

        return Inertia::render('Teacher/LearningLog', [
            'students' => $students,
            'logs'     => $logs,
        ]);
    }

    public function store(Request $request)
    {
        $request->validate([
            'student_id' => 'required',
            'category'   => 'required|string',
            'date'       => 'required|date',
            'image'      => 'nullable|image|mimes:jpg,jpeg,png,webp|max:5120',
        ]);

        // Nyahkod JSON dari Form
        $activityData = $request->input('activity_data');
        if (is_string($activityData)) {
            $activityData = json_decode($activityData, true);
        }

        $imagePath = null;
        if ($request->hasFile('image')) {
            $path = $request->file('image')->store('learning_logs', 'public');
            $imagePath = '/storage/' . $path;
        }

        LearningLog::create([
            'student_id'    => $request->student_id,
            'teacher_name'  => Auth::user()->full_name ?? 'Teacher',
            'category'      => $request->category,
            'time'          => $activityData['time'] ?? now()->format('H:i'),
            'log_date'      => $request->date,
            'activity_data' => $activityData ?? [],
            'text'          => $activityData['remarks'] ?? '',
            'image'         => $imagePath,
            'likes'         => 0,
        ]);

        return redirect()->back()->with('success', 'Aktiviti berjaya disimpan!');
    }

    public function update(Request $request, $id)
    {
        $log = LearningLog::findOrFail($id);

        $request->validate([
            'category' => 'required|string',
            'date'     => 'required|date',
            'image'    => 'nullable|image|mimes:jpg,jpeg,png,webp|max:5120',
        ]);

        $activityData = $request->input('activity_data');
        if (is_string($activityData)) {
            $activityData = json_decode($activityData, true);
        }

        $data = [
            'category'      => $request->category,
            'log_date'      => $request->date,
            'activity_data' => $activityData ?? [],
            'time'          => $activityData['time'] ?? $log->time,
            'text'          => $activityData['remarks'] ?? '',
        ];

        if ($request->hasFile('image')) {
            $path = $request->file('image')->store('learning_logs', 'public');
            $data['image'] = '/storage/' . $path;
        }

        $log->update($data);

        return redirect()->back()->with('success', 'Log berjaya dikemaskini!');
    }

    public function destroy($id)
    {
        $log = LearningLog::findOrFail($id);

        // Padam gambar fizikal jika wujud
        if ($log->image && str_contains($log->image, '/storage/')) {
            $path = str_replace('/storage/', '', $log->image);
            Storage::disk('public')->delete($path);
        }

        $log->delete();

        return redirect()->back()->with('success', 'Log berjaya dipadam!');
    }
}
