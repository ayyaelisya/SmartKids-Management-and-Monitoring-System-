<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void {
        if (!Schema::hasTable('parent_student')) {
            Schema::create('parent_student', function (Blueprint $table) {
                $table->id();

                // Nyatakan 'parent_id' secara spesifik untuk jadual parents
                $table->foreignId('parent_id')
                      ->constrained('parents', 'parent_id')
                      ->onDelete('cascade');

                // Nyatakan 'student_id' secara spesifik untuk jadual students
                $table->foreignId('student_id')
                      ->constrained('students', 'student_id')
                      ->onDelete('cascade');

                $table->timestamps();

                $table->unique(['parent_id', 'student_id']);
            });
        }
    }

    public function down(): void {
        Schema::dropIfExists('parent_student');
    }
};
