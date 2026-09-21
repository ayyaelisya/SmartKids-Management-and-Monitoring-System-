<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Package extends Model
{
    use HasFactory;

    protected $primaryKey = 'package_id';

    protected $fillable = [
        'package_name',
        'age_group',
        'monthly_fee',
        'start_time',
        'end_time',
        'description',
        'status',
    ];

    protected $casts = [
        'monthly_fee' => 'decimal:2',
    ];

    // Students assigned to this package
    public function students()
    {
        return $this->hasMany(
            Student::class,
            'package_id',
            'package_id'
        );
    }
}
