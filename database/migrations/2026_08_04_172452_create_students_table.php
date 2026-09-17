<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('students', function (Blueprint $table) {
    $table->id('student_id');
    $table->string('full_name');
    $table->string('ic_number');
    $table->date('date_of_birth');
    $table->string('gender');
    $table->string('class_name');
    $table->string('guardian_name');
    $table->string('guardian_phone');
    $table->string('guardian_relationship');

    // Tambah ->nullable() di sini:
    $table->string('allergies')->nullable();
    $table->text('medical_notes')->nullable();

    $table->timestamps();
});
    }

    public function down(): void
    {
        Schema::dropIfExists('students');
    }
};
