<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('attendances', function (Blueprint $table) {
            $table->text('absence_reason')->nullable()->after('status');
            $table->string('absence_attachment')->nullable()->after('absence_reason');
            $table->enum('absence_status', ['Pending', 'Approved', 'Rejected'])->nullable()->after('absence_attachment');
        });
    }

    public function down(): void
    {
        Schema::table('attendances', function (Blueprint $table) {
            $table->dropColumn(['absence_reason', 'absence_attachment', 'absence_status']);
        });
    }
};
