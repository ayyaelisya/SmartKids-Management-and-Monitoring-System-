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

    public function parent()
    {
        return $this->hasOne(ParentsModel::class, 'user_id', 'user_id');
    }

    public function students()
    {
        return $this->belongsToMany(
            Student::class,
            'parent_student',
            'parent_id',    // Foreign key pada jadual parent_student
            'student_id',   // Foreign key pada jadual parent_student
            'user_id',      // Local key pada jadual users
            'student_id'    // Related key pada jadual students
        );
    }

    public function teacher()
    {
        return $this->hasOne(Teacher::class, 'user_id', 'user_id');
    }

    public function admin()
    {
        return $this->hasOne(Admin::class, 'user_id', 'user_id');
    }
}
