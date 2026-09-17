<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('learning_logs', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('student_id');
            $table->string('teacher_name')->nullable();
            $table->string('category')->nullable();
            $table->string('time')->nullable();
            $table->text('text');
            $table->string('image')->nullable();
            $table->integer('likes')->default(0);
            $table->timestamps();

            // Pautan foreign key ke jadual students (kolum student_id)
            $table->foreign('student_id')
                  ->references('student_id')
                  ->on('students')
                  ->onDelete('cascade');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('learning_logs');
    }
};
