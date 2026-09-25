<?php

namespace App\Http\Controllers;

use App\Models\Conversation;
use App\Models\Message;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\Rule;
use Inertia\Inertia;

class MessagingController extends Controller
{
    /**
     * Display messaging page for parent or teacher.
     */
    public function index(Request $request)
    {
        $user = Auth::user();

        if (! in_array($user->role, ['parent', 'teacher'], true)) {
            abort(403);
        }

        $conversationQuery = Conversation::query()
            ->with([
                'parent:user_id,full_name,email',
                'teacher:user_id,full_name,email',
                'student:student_id,full_name,class_name',
                'latestMessage.sender:user_id,full_name,role',
            ])
            ->withCount([
                'messages as unread_count' => function ($query) use ($user) {
                    $query
                        ->where('sender_id', '!=', $user->user_id)
                        ->whereNull('read_at');
                },
            ]);

        if ($user->role === 'parent') {
            $conversationQuery->where(
                'parent_id',
                $user->user_id
            );
        } else {
            $conversationQuery->where(
                'teacher_id',
                $user->user_id
            );
        }

        $conversations = $conversationQuery
            ->orderByDesc('last_message_at')
            ->orderByDesc('updated_at')
            ->get();

        $selectedConversation = null;
        $selectedConversationId = $request->input(
            'conversation_id'
        );

        if ($selectedConversationId) {
            $selectedConversation = $conversations->firstWhere(
                'id',
                (int) $selectedConversationId
            );
        }

        if (! $selectedConversation) {
            $selectedConversation = $conversations->first();
        }

        if ($selectedConversation) {
            $this->authorizeParticipant(
                $selectedConversation,
                $user
            );

            // Mark messages sent by the other user as read.
            $selectedConversation
                ->messages()
                ->where(
                    'sender_id',
                    '!=',
                    $user->user_id
                )
                ->whereNull('read_at')
                ->update([
                    'read_at' => now(),
                ]);

            $selectedConversation->unread_count = 0;

            $selectedConversation->load([
                'messages.sender:user_id,full_name,role',
            ]);
        }

        $children = collect();
        $teachers = collect();
        $parentStudentList = collect();

        if ($user->role === 'parent') {
            $parentProfile = $user->parent;

            if ($parentProfile) {
                $children = $parentProfile
                    ->students()
                    ->where('is_active', 1)
                    ->get([
                        'students.student_id',
                        'students.full_name',
                        'students.class_name',
                    ]);

                $teachers = User::query()
                    ->where('role', 'teacher')
                    ->orderBy('full_name')
                    ->get([
                        'user_id',
                        'full_name',
                        'email',
                    ]);
            }
        } else {
            $parentStudentList = DB::table('parent_student')
                ->join('parents', 'parents.parent_id', '=', 'parent_student.parent_id')
                ->join('users', 'users.user_id', '=', 'parents.user_id')
                ->join('students', 'students.student_id', '=', 'parent_student.student_id')
                ->where('users.role', 'parent')
                ->where('users.status', 'active')
                ->where('students.is_active', 1)
                ->select('users.user_id as parent_id', 'users.email as parent_email',
                    'students.student_id', 'students.full_name as student_name')
                ->orderBy('students.full_name')
                ->orderBy('users.email')
                ->distinct()
                ->get();
        }

        $page = $user->role === 'parent'
            ? 'Parent/Messages'
            : 'Teacher/Messages';

        return Inertia::render($page, [
            'conversations' => $conversations
                ->map(function ($conversation) use ($user) {
                    return $this->formatConversation(
                        $conversation,
                        $user
                    );
                })
                ->values(),

            'selectedConversation' =>
                $selectedConversation
                    ? $this->formatSelectedConversation(
                        $selectedConversation,
                        $user
                    )
                    : null,

            'childrenList' => $children
                ->map(function ($student) {
                    return [
                        'id' => $student->student_id,
                        'name' => $student->full_name,
                        'class_name' => $student->class_name,
                    ];
                })
                ->values(),

            'teachersList' => $teachers
                ->map(function ($teacher) {
                    return [
                        'id' => $teacher->user_id,
                        'name' => $teacher->full_name,
                        'email' => $teacher->email,
                    ];
                })
                ->values(),
            'parentStudentList' => $parentStudentList,
        ]);
    }

    /** Open a conversation for a student and their linked parent. */
    public function storeTeacherConversation(Request $request)
    {
        $user = Auth::user();
        if ($user->role !== 'teacher') {
            abort(403);
        }

        $validated = $request->validate([
            'parent_id' => ['required', 'integer', Rule::exists('users', 'user_id')],
            'student_id' => ['required', 'integer', Rule::exists('students', 'student_id')],
        ]);

        $linked = DB::table('parent_student')
            ->join('parents', 'parents.parent_id', '=', 'parent_student.parent_id')
            ->join('users', 'users.user_id', '=', 'parents.user_id')
            ->join('students', 'students.student_id', '=', 'parent_student.student_id')
            ->where('users.user_id', $validated['parent_id'])
            ->where('users.role', 'parent')
            ->where('users.status', 'active')
            ->where('students.student_id', $validated['student_id'])
            ->where('students.is_active', 1)
            ->exists();

        if (! $linked) {
            return back()->withErrors(['parent_id' => 'Select a parent linked to this student.']);
        }

        $conversation = Conversation::firstOrCreate([
            'parent_id' => $validated['parent_id'],
            'teacher_id' => $user->user_id,
            'student_id' => $validated['student_id'],
        ]);

        return redirect()->route('teacher.messages.index', [
            'conversation_id' => $conversation->id,
        ])->with('success', 'Conversation opened successfully.');
    }

    /**
     * Parent starts a conversation with a teacher.
     */
    public function storeConversation(Request $request)
    {
        $user = Auth::user();

        if ($user->role !== 'parent') {
            abort(403);
        }

        $validated = $request->validate([
            'student_id' => [
                'required',
                'integer',
                Rule::exists(
                    'students',
                    'student_id'
                ),
            ],
            'teacher_id' => [
                'required',
                'integer',
                Rule::exists(
                    'users',
                    'user_id'
                ),
            ],
        ]);

        $parentProfile = $user->parent;

        if (! $parentProfile) {
            return back()->withErrors([
                'student_id' =>
                    'Parent profile was not found.',
            ]);
        }

        $student = $parentProfile
            ->students()
            ->where(
                'students.student_id',
                $validated['student_id']
            )
            ->first();

        if (! $student) {
            abort(403);
        }

        $teacher = User::query()
            ->where(
                'user_id',
                $validated['teacher_id']
            )
            ->where('role', 'teacher')
            ->first();

        if (! $teacher) {
            return back()->withErrors([
                'teacher_id' =>
                    'Teacher account was not found.',
            ]);
        }

        $conversation = Conversation::firstOrCreate([
            'parent_id' => $user->user_id,
            'teacher_id' => $teacher->user_id,
            'student_id' => $student->student_id,
        ]);

        return redirect()
            ->route(
                'parent.messages.index',
                [
                    'conversation_id' =>
                        $conversation->id,
                ]
            )
            ->with(
                'success',
                'Conversation opened successfully.'
            );
    }

    /**
     * Send a message.
     */
    public function sendMessage(
        Request $request,
        Conversation $conversation
    ) {
        $user = Auth::user();

        $this->authorizeParticipant(
            $conversation,
            $user
        );

        $validated = $request->validate([
            'message' => [
                'nullable',
                'string',
                'max:5000',
                'required_without:attachment',
            ],
            'attachment' => [
                'nullable',
                'file',
                'mimes:jpg,jpeg,png,pdf,doc,docx',
                'max:5120',
                'required_without:message',
            ],
        ]);

        $attachmentPath = null;
        $attachmentName = null;

        if ($request->hasFile('attachment')) {
            $file = $request->file('attachment');

            $attachmentPath = $file->store(
                'message-attachments',
                'public'
            );

            $attachmentName =
                $file->getClientOriginalName();
        }

        DB::transaction(function () use (
            $conversation,
            $user,
            $validated,
            $attachmentPath,
            $attachmentName
        ) {
            Message::create([
                'conversation_id' =>
                    $conversation->id,

                'sender_id' =>
                    $user->user_id,

                'message' =>
                    $validated['message'] ?? null,

                'attachment_path' =>
                    $attachmentPath,

                'attachment_name' =>
                    $attachmentName,

                'read_at' => null,
            ]);

            $conversation->update([
                'last_message_at' => now(),
            ]);
        });

        return back()->with(
            'success',
            'Message sent successfully.'
        );
    }

    /**
     * Mark messages in a conversation as read.
     */
    public function markAsRead(
        Conversation $conversation
    ) {
        $user = Auth::user();

        $this->authorizeParticipant(
            $conversation,
            $user
        );

        $conversation
            ->messages()
            ->where(
                'sender_id',
                '!=',
                $user->user_id
            )
            ->whereNull('read_at')
            ->update([
                'read_at' => now(),
            ]);

        return back();
    }

    /**
     * Ensure only conversation participants
     * can access the conversation.
     */
    private function authorizeParticipant(
        Conversation $conversation,
        User $user
    ): void {
        $isParent =
            $user->role === 'parent' &&
            (int) $conversation->parent_id ===
                (int) $user->user_id;

        $isTeacher =
            $user->role === 'teacher' &&
            (int) $conversation->teacher_id ===
                (int) $user->user_id;

        if (! $isParent && ! $isTeacher) {
            abort(403);
        }
    }

    /**
     * Format conversation for the sidebar list.
     */
    private function formatConversation(
        Conversation $conversation,
        User $user
    ): array {
        $otherUser =
            $user->role === 'parent'
                ? $conversation->teacher
                : $conversation->parent;

        return [
            'id' => $conversation->id,

            'student' => [
                'id' =>
                    $conversation->student?->student_id,

                'name' =>
                    $conversation->student?->full_name
                    ?? 'Unknown Student',

                'class_name' =>
                    $conversation->student?->class_name,
            ],

            'other_user' => [
                'id' => $otherUser?->user_id,
                'name' =>
                    $otherUser?->full_name
                    ?? 'Unknown User',
                'role' => $otherUser?->role,
                'email' => $otherUser?->email,
            ],

            'latest_message' =>
                $conversation->latestMessage?->message
                ?? (
                    $conversation
                        ->latestMessage
                        ?->attachment_name
                    ? 'Attachment'
                    : 'No messages yet'
                ),

            'last_message_at' =>
                $conversation->last_message_at
                    ?->toISOString(),

            'unread_count' =>
                (int) $conversation->unread_count,
        ];
    }

    /**
     * Format the selected conversation and messages.
     */
    private function formatSelectedConversation(
        Conversation $conversation,
        User $user
    ): array {
        $otherUser =
            $user->role === 'parent'
                ? $conversation->teacher
                : $conversation->parent;

        return [
            'id' => $conversation->id,

            'student' => [
                'id' =>
                    $conversation->student?->student_id,

                'name' =>
                    $conversation->student?->full_name
                    ?? 'Unknown Student',

                'class_name' =>
                    $conversation->student?->class_name,
            ],

            'other_user' => [
                'id' => $otherUser?->user_id,
                'name' =>
                    $otherUser?->full_name
                    ?? 'Unknown User',
                'role' => $otherUser?->role,
                'email' => $otherUser?->email,
            ],

            'messages' => $conversation->messages
                ->map(function ($message) use ($user) {
                    return [
                        'id' => $message->id,

                        'message' =>
                            $message->message,

                        'attachment_name' =>
                            $message->attachment_name,

                        'attachment_url' =>
                            $message->attachment_path
                                ? asset(
                                    'storage/' .
                                    $message->attachment_path
                                )
                                : null,

                        'sender_name' =>
                            $message->sender?->full_name
                            ?? 'Unknown User',

                        'sender_role' =>
                            $message->sender?->role,

                        'is_mine' =>
                            (int) $message->sender_id ===
                            (int) $user->user_id,

                        'is_read' =>
                            $message->read_at !== null,

                        'sent_at' =>
                            $message->created_at
                                ?->toISOString(),
                    ];
                })
                ->values(),
        ];
    }
}
