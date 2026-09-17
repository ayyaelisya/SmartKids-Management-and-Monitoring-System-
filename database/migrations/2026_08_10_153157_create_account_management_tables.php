<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void {
        // 1. Jadual Users (Primary Key: user_id)
        if (!Schema::hasTable('users')) {
            Schema::create('users', function (Blueprint $table) {
                $table->id('user_id');
                $table->string('full_name');
                $table->string('email')->unique();
                $table->string('phone_number')->nullable();
                $table->string('password');
                $table->enum('role', ['admin', 'teacher', 'parent']);
                $table->string('status')->default('active');
                $table->rememberToken();
                $table->timestamps();
            });
        }

        // 2. Jadual Teachers
        if (!Schema::hasTable('teachers')) {
            Schema::create('teachers', function (Blueprint $table) {
                $table->id();
                $table->foreignId('user_id')->constrained('users', 'user_id')->onDelete('cascade');
                $table->string('full_name');
                $table->text('address')->nullable();
                $table->string('qualification')->nullable();
                $table->string('status')->default('active');
                $table->date('hire_date')->nullable();
                $table->timestamps();
            });
        }

        // 3. Jadual Parents (Primary Key: parent_id)
        if (!Schema::hasTable('parents')) {
            Schema::create('parents', function (Blueprint $table) {
                $table->id('parent_id'); // Ditukar supaya menghasilkan kolum 'parent_id'
                $table->foreignId('user_id')->constrained('users', 'user_id')->onDelete('cascade');
                $table->enum('relationship', ['father', 'mother', 'guardian'])->default('guardian');
                $table->text('address')->nullable();
                $table->timestamps();
            });
        }

        // 4. Jadual Admins
        if (!Schema::hasTable('admins')) {
            Schema::create('admins', function (Blueprint $table) {
                $table->id();
                $table->foreignId('user_id')->constrained('users', 'user_id')->onDelete('cascade');
                $table->timestamps();
            });
        }
    }

    public function down(): void {
        Schema::dropIfExists('admins');
        Schema::dropIfExists('parents');
        Schema::dropIfExists('teachers');
        Schema::dropIfExists('users');
    }
};
