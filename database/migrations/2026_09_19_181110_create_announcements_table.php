<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('announcements', function (Blueprint $table) {
            $table->id();

            $table->string('title');
            $table->text('content');

            $table->enum('target_audience', [
                'All',
                'Teachers',
                'Parents'
            ])->default('All');

            $table->enum('priority', [
                'Normal',
                'Important',
                'Urgent'
            ])->default('Normal');

            $table->enum('status', [
                'Draft',
                'Published'
            ])->default('Draft');

            $table->timestamp('published_at')->nullable();

            $table->unsignedBigInteger('created_by');

            $table->timestamps();

            $table->foreign('created_by')
                ->references('user_id')
                ->on('users')
                ->cascadeOnUpdate()
                ->restrictOnDelete();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('announcements');
    }
};
