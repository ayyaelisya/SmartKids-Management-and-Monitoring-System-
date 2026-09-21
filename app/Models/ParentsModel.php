<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class ParentsModel extends Model
{
    use HasFactory;

    protected $table = 'parents';
    protected $primaryKey = 'parent_id';

    protected $fillable = [
        'user_id',
        'relationship',
        'address',
        'child_name',
        'child_ic',
    ];

    // Parent user account
    public function user()
    {
        return $this->belongsTo(User::class, 'user_id', 'user_id');
    }

    // Students linked to this parent
    public function students()
    {
        return $this->belongsToMany(
            Student::class,
            'parent_student',
            'parent_id',
            'student_id',
            'parent_id',
            'student_id'
        );
    }
}
