<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Message extends Model
{
    use HasFactory;

    protected $fillable = [
        'conversation_id',
        'sender_id',
        'message',
        'attachment_path',
        'attachment_name',
        'read_at',
    ];

    protected $casts = [
        'read_at' => 'datetime',
    ];

    /**
     * Conversation that contains this message.
     */
    public function conversation()
    {
        return $this->belongsTo(
            Conversation::class,
            'conversation_id',
            'id'
        );
    }

    /**
     * User who sent this message.
     */
    public function sender()
    {
        return $this->belongsTo(
            User::class,
            'sender_id',
            'user_id'
        );
    }

    /**
     * Check whether the message has been read.
     */
    public function isRead(): bool
    {
        return $this->read_at !== null;
    }
}
