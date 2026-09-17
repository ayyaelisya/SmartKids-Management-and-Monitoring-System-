<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Student extends Model
{
    use HasFactory;

    protected $table = 'students';
    protected $primaryKey = 'student_id';

    protected $fillable = [
        // Profile Image
        'profile_photo_path',

        // Student Information
        'full_name',
        'ic_number',
        'date_of_birth',
        'age',
        'birth_place',
        'gender',
        'mykid_number',
        'qr_code_token',
        'favourite_food',
        'birth_order',
        'total_siblings',

        // Kindergarten Information
        'class_name',
        'age_category',

        // Primary Guardian Information
        'guardian_name',
        'guardian_phone',
        'guardian_relationship',

        // Father's Information
        'father_name',
        'father_ic_number',
        'father_nationality',
        'father_race',
        'father_occupation',
        'father_phone',

        // Mother's Information
        'mother_name',
        'mother_ic_number',
        'mother_nationality',
        'mother_race',
        'mother_occupation',
        'mother_phone',

        // Contact Information
        'home_address',
        'email',

        // Emergency Contact
        'emergency_contact_name',
        'emergency_contact_phone',
        'emergency_contact_relationship',

        // Registration Information
        'selected_service',
        'referral_source',

        // Medical Information
        'allergies',
        'medical_notes',
    ];

    /**
     * Relationship with Attendance records
     */
    public function attendances()
    {
        return $this->hasMany(
            Attendance::class,
            'student_id',
            'student_id'
        );
    }

    /**
     * Relationship with Parent records
     */
    public function parents()
    {
        return $this->belongsToMany(
            ParentsModel::class,
            'parent_student', // Pivot table
            'student_id',     // Foreign key on parent_student
            'parent_id',      // Foreign key on parents
            'student_id',     // Local key on students
            'parent_id'       // Related key on parents
        );
    }
}
