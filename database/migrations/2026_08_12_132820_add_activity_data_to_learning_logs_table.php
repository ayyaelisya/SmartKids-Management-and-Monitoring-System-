<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('learning_logs', function (Blueprint $table) {
            // Tambah kolum activity_data berjenis JSON
            $table->json('activity_data')->nullable()->after('category');
        });
    }

    public function down(): void
    {
        Schema::table('learning_logs', function (Blueprint $table) {
            $table->dropColumn('activity_data');
        });
    }
};
