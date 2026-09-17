<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
public function up(): void
{
    Schema::table('students', function (Blueprint $table) {
        // Appends to the end of the table (or use ->after('id') or ->after('name'))
        $table->string('qr_code_token')->nullable()->unique();
    });
}

    public function down(): void
    {
        Schema::table('students', function (Blueprint $table) {
            $table->dropColumn('qr_code_token');
        });
    }
};
