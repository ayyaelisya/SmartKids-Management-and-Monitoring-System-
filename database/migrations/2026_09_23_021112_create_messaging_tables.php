<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        /*
        |--------------------------------------------------------------------------
        | Conversations
        |--------------------------------------------------------------------------
        |
        | Satu conversation menghubungkan:
        | - Seorang parent
        | - Seorang teacher
        | - Seorang student
        |
        */

        Schema::create('conversations', function (Blueprint $table) {
            $table->id();

            $table->unsignedBigInteger('parent_id');
            $table->unsignedBigInteger('teacher_id');
            $table->unsignedBigInteger('student_id');

            $table->timestamp('last_message_at')->nullable();

            $table->timestamps();

            $table->foreign('parent_id')
                ->references('user_id')
                ->on('users')
                ->cascadeOnUpdate()
                ->cascadeOnDelete();

            $table->foreign('teacher_id')
                ->references('user_id')
                ->on('users')
                ->cascadeOnUpdate()
                ->cascadeOnDelete();

            $table->foreign('student_id')
                ->references('student_id')
                ->on('students')
                ->cascadeOnUpdate()
                ->cascadeOnDelete();

            /*
             * Elakkan conversation yang sama dibuat berulang kali.
             */
            $table->unique(
                ['parent_id', 'teacher_id', 'student_id'],
                'conversation_participants_unique'
            );

            $table->index('parent_id');
            $table->index('teacher_id');
            $table->index('student_id');
            $table->index('last_message_at');
        });

        /*
        |--------------------------------------------------------------------------
        | Messages
        |--------------------------------------------------------------------------
        */

        Schema::create('messages', function (Blueprint $table) {
            $table->id();

            $table->unsignedBigInteger('conversation_id');
            $table->unsignedBigInteger('sender_id');

            $table->text('message')->nullable();

            /*
             * Disediakan untuk attachment pada masa akan datang.
             */
            $table->string('attachment_path')->nullable();
            $table->string('attachment_name')->nullable();

            /*
             * Null bermaksud mesej belum dibaca.
             */
            $table->timestamp('read_at')->nullable();

            $table->timestamps();

            $table->foreign('conversation_id')
                ->references('id')
                ->on('conversations')
                ->cascadeOnUpdate()
                ->cascadeOnDelete();

            $table->foreign('sender_id')
                ->references('user_id')
                ->on('users')
                ->cascadeOnUpdate()
                ->cascadeOnDelete();

            $table->index('conversation_id');
            $table->index('sender_id');
            $table->index('read_at');
            $table->index('created_at');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('messages');
        Schema::dropIfExists('conversations');
    }
};
