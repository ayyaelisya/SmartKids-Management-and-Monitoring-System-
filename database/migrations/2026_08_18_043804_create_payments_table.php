<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('payments', function (Blueprint $table) {
            $table->id();
            $table->foreignId('monthly_fee_id')->constrained('monthly_fees')->onDelete('cascade');
            $table->decimal('amount', 8, 2);
            $table->string('payment_method');
            $table->string('reference_number')->nullable();
            $table->timestamp('paid_at');

            // Explicitly reference user_id on users table
            $table->unsignedBigInteger('recorded_by');
            $table->foreign('recorded_by')->references('user_id')->on('users')->onDelete('cascade');

            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('payments');
    }
};
