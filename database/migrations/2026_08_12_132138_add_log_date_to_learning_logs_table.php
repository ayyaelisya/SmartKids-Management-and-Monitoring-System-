<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('learning_logs', function (Blueprint $table) {
            // Tambah kolum log_date
            $table->date('log_date')->nullable()->after('time');
        });
    }

    public function down(): void
    {
        Schema::table('learning_logs', function (Blueprint $table) {
            $table->dropColumn('log_date');
        });
    }
};
