<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('monthly_fees', function (Blueprint $table) {
            $table->id();

            // Explicitly reference student_id on the students table
            $table->unsignedBigInteger('student_id');
            $table->foreign('student_id')->references('student_id')->on('students')->onDelete('cascade');

            $table->string('billing_month'); // Format: YYYY-MM
            $table->decimal('base_fee', 8, 2)->default(0.00);
            $table->decimal('late_pickup_fee', 8, 2)->default(0.00);
            $table->decimal('other_charges', 8, 2)->default(0.00);
            $table->decimal('total_amount', 8, 2)->default(0.00);
            $table->decimal('amount_paid', 8, 2)->default(0.00);
            $table->decimal('balance', 8, 2)->default(0.00);
            $table->enum('payment_status', ['Unpaid', 'Partially Paid', 'Paid', 'Overdue'])->default('Unpaid');
            $table->date('due_date');
            $table->timestamps();

            $table->unique(['student_id', 'billing_month']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('monthly_fees');
    }
};
