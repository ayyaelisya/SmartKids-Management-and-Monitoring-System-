<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class LearningLog extends Model
{
    use HasFactory;

    protected $fillable = [
        'student_id',
        'teacher_name',
        'category',
        'time',
        'date', // atau 'date' mengikut struktur DB anda
        'activity_data',
        'text',
        'image',
        'likes',
    ];

    // TAMBAH INI: Menukar data JSON kepada Array secara automatik
    protected $casts = [
        'activity_data' => 'array',
    ];

    public function student()
    {
        return $this->belongsTo(Student::class);
    }
}
