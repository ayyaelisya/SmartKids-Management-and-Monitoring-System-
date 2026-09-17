<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('fee_settings', function (Blueprint $table) {
            $table->id();
            $table->string('name')->default('Standard Late Pickup Fee');
            $table->time('official_closing_time')->default('18:00:00');
            $table->integer('grace_period_minutes')->default(0);
            $table->decimal('fee_per_unit', 8, 2)->default(10.00);
            $table->enum('unit_type', ['minute', '15_min', '30_min', 'hour'])->default('15_min');
            $table->date('effective_date');
            $table->boolean('is_active')->default(true);
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('fee_settings');
    }
};

