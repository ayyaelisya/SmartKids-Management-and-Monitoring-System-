<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('students', function (Blueprint $table) {
            $table->unsignedBigInteger('package_id')
                ->nullable()
                ->after('class_name');

            $table->foreign('package_id')
                ->references('package_id')
                ->on('packages')
                ->nullOnDelete();
        });
    }

    public function down(): void
    {
        Schema::table('students', function (Blueprint $table) {
            $table->dropForeign(['package_id']);
            $table->dropColumn('package_id');
        });
    }
};
