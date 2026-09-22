<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Conversation extends Model
{
    use HasFactory;

    protected $fillable = [
        'parent_id',
        'teacher_id',
        'student_id',
        'last_message_at',
    ];

    protected $casts = [
        'last_message_at' => 'datetime',
    ];

    /**
     * Parent user involved in this conversation.
     */
    public function parent()
    {
        return $this->belongsTo(
            User::class,
            'parent_id',
            'user_id'
        );
    }

    /**
     * Teacher user involved in this conversation.
     */
    public function teacher()
    {
        return $this->belongsTo(
            User::class,
            'teacher_id',
            'user_id'
        );
    }

    /**
     * Student related to this conversation.
     */
    public function student()
    {
        return $this->belongsTo(
            Student::class,
            'student_id',
            'student_id'
        );
    }

    /**
     * All messages in this conversation.
     */
    public function messages()
    {
        return $this->hasMany(
            Message::class,
            'conversation_id',
            'id'
        )->oldest('created_at');
    }

    /**
     * Most recent message.
     */
    public function latestMessage()
    {
        return $this->hasOne(
            Message::class,
            'conversation_id',
            'id'
        )->latestOfMany();
    }
}
