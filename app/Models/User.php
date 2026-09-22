<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;

class User extends Authenticatable
{
    use HasFactory, Notifiable;

    protected $primaryKey = 'user_id';

    protected $fillable = [
        'full_name',
        'email',
        'phone_number',
        'password',
        'role',
        'status',
    ];

    protected $hidden = [
        'password',
        'remember_token',
    ];

    protected $casts = [
        'password' => 'hashed',
    ];

    /**
     * Parent profile connected to this user.
     */
    public function parent()
    {
        return $this->hasOne(
            ParentsModel::class,
            'user_id',
            'user_id'
        );
    }

    /**
     * Teacher profile connected to this user.
     */
    public function teacher()
    {
        return $this->hasOne(
            Teacher::class,
            'user_id',
            'user_id'
        );
    }

    /**
     * Admin profile connected to this user.
     */
    public function admin()
    {
        return $this->hasOne(
            Admin::class,
            'user_id',
            'user_id'
        );
    }

    /**
 * Conversations where this user is the parent.
 */
public function parentConversations()
{
    return $this->hasMany(
        Conversation::class,
        'parent_id',
        'user_id'
    );
}

/**
 * Conversations where this user is the teacher.
 */
public function teacherConversations()
{
    return $this->hasMany(
        Conversation::class,
        'teacher_id',
        'user_id'
    );
}

/**
 * Messages sent by this user.
 */
public function sentMessages()
{
    return $this->hasMany(
        Message::class,
        'sender_id',
        'user_id'
    );
}
}
