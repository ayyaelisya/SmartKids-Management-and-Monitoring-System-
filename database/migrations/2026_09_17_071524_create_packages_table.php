<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('packages', function (Blueprint $table) {
            $table->id('package_id');

            $table->string('package_name');

            // Example: 10-23 months or 2-4 years
            $table->string('age_group');

            $table->decimal('monthly_fee', 8, 2);

            // Student session time
            $table->time('start_time');
            $table->time('end_time');

            $table->text('description')->nullable();

            $table->enum('status', ['active', 'inactive'])
                ->default('active');

            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('packages');
    }
};
