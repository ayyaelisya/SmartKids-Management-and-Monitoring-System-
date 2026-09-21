<?php

namespace App\Http\Controllers;

use App\Models\Announcement;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;

class AnnouncementController extends Controller
{
    // Admin announcement management
    public function adminIndex()
    {
        $announcements = Announcement::with('creator:user_id,full_name,role')
            ->latest()
            ->get();

        return Inertia::render('AnnouncementManagement', [
            'announcements' => $announcements,
        ]);
    }

    // Teacher announcement management
    public function teacherIndex()
    {
        $user = Auth::user();

        $announcements = Announcement::with('creator:user_id,full_name,role')
            ->where(function ($query) use ($user) {
                $query->where('status', 'Published')
                    ->whereIn('target_audience', ['All', 'Teachers'])
                    ->orWhere('created_by', $user->user_id);
            })
            ->latest()
            ->get();

        return Inertia::render('Teacher/Announcements', [
            'announcements' => $announcements,
        ]);
    }

    // Parent can only view published announcements
    public function parentIndex()
    {
        $announcements = Announcement::with('creator:user_id,full_name,role')
            ->where('status', 'Published')
            ->whereIn('target_audience', ['All', 'Parents'])
            ->orderByDesc('published_at')
            ->get();

        return Inertia::render('Parent/Announcements', [
            'announcements' => $announcements,
        ]);
    }

    // Admin or teacher can create announcement
    public function store(Request $request)
    {
        $user = Auth::user();

        if (!in_array($user->role, ['admin', 'teacher'])) {
            abort(403);
        }

        $validated = $request->validate([
            'title' => ['required', 'string', 'max:255'],
            'content' => ['required', 'string'],
            'target_audience' => [
                'required',
                'in:All,Teachers,Parents',
            ],
            'priority' => [
                'required',
                'in:Normal,Important,Urgent',
            ],
            'status' => [
                'required',
                'in:Draft,Published',
            ],
        ]);

        // Teacher announcements are intended for parents
        if ($user->role === 'teacher') {
            $validated['target_audience'] = 'Parents';
        }

        $validated['created_by'] = $user->user_id;

        $validated['published_at'] =
            $validated['status'] === 'Published'
                ? now()
                : null;

        Announcement::create($validated);

        return back()->with(
            'success',
            $validated['status'] === 'Published'
                ? 'Announcement published successfully.'
                : 'Announcement saved as draft.'
        );
    }

    // Admin can edit any announcement
    // Teacher can only edit their own announcement
    public function update(Request $request, Announcement $announcement)
    {
        $user = Auth::user();

        if (
            $user->role !== 'admin' &&
            !(
                $user->role === 'teacher' &&
                $announcement->created_by === $user->user_id
            )
        ) {
            abort(403);
        }

        $validated = $request->validate([
            'title' => ['required', 'string', 'max:255'],
            'content' => ['required', 'string'],
            'target_audience' => [
                'required',
                'in:All,Teachers,Parents',
            ],
            'priority' => [
                'required',
                'in:Normal,Important,Urgent',
            ],
            'status' => [
                'required',
                'in:Draft,Published',
            ],
        ]);

        // Teacher announcements remain parent announcements
        if ($user->role === 'teacher') {
            $validated['target_audience'] = 'Parents';
        }

        if ($validated['status'] === 'Published') {
            if (
                $announcement->status !== 'Published' ||
                !$announcement->published_at
            ) {
                $validated['published_at'] = now();
            }
        } else {
            $validated['published_at'] = null;
        }

        $announcement->update($validated);

        return back()->with(
            'success',
            'Announcement updated successfully.'
        );
    }

    // Admin can delete any announcement
    // Teacher can only delete their own announcement
    public function destroy(Announcement $announcement)
    {
        $user = Auth::user();

        if (
            $user->role !== 'admin' &&
            !(
                $user->role === 'teacher' &&
                $announcement->created_by === $user->user_id
            )
        ) {
            abort(403);
        }

        $announcement->delete();

        return back()->with(
            'success',
            'Announcement deleted successfully.'
        );
    }
}
