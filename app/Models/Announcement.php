<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Announcement extends Model
{
    use HasFactory;

    protected $fillable = [
        'title',
        'content',
        'target_audience',
        'priority',
        'status',
        'published_at',
        'created_by',
    ];

    protected $casts = [
        'published_at' => 'datetime',
    ];

    // User who created the announcement
    public function creator()
    {
        return $this->belongsTo(
            User::class,
            'created_by',
            'user_id'
        );
    }
}
