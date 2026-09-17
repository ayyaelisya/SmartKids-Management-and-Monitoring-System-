<?php

use Illuminate\Support\Facades\Route;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\StudentController;
use App\Http\Controllers\AccountController;
use App\Http\Controllers\ParentLearningController;
use App\Http\Controllers\ParentDashboardController;
use App\Http\Controllers\ParentChildController;
use App\Http\Controllers\ParentFeeController;
use App\Http\Controllers\LearningLogController;
use App\Http\Controllers\AdminFeeController;
use App\Http\Controllers\TeacherAttendanceController;
use App\Http\Controllers\AdminAttendanceController;
use App\Http\Controllers\PaymentController;
use App\Http\Controllers\AdminStudentQrController;
use App\Http\Controllers\ParentAttendanceController;

/*
|--------------------------------------------------------------------------
| Public / Guest Routes
|--------------------------------------------------------------------------
*/

Route::get('/', function () {
    return redirect()->route('login');
});

// ToyyibPay Webhook Callback (Server-to-Server, Mesti di luar middleware 'auth')
Route::post('/toyyibpay/callback', [PaymentController::class, 'callback'])->name('toyyibpay.callback');

/*
|--------------------------------------------------------------------------
| Protected Routes
|--------------------------------------------------------------------------
*/
Route::middleware(['auth'])->group(function () {

    // 1. Admin / Main Dashboard
    Route::get('/dashboard', [DashboardController::class, 'index'])->name('dashboard');

    // 2. Student Management Routes
    Route::resource('students', StudentController::class);

    // 3. Staff & Account Management Routes
    Route::get('/staff-accounts', [AccountController::class, 'index'])->name('staff-accounts.index');
    Route::post('/staff-accounts', [AccountController::class, 'store'])->name('staff-accounts.store');
    Route::post('/staff-accounts/link-student', [AccountController::class, 'linkStudent'])->name('staff-accounts.link-student');

    // 4. Admin Overall Attendance Monitoring
    Route::get('/attendance', [AdminAttendanceController::class, 'index'])->name('attendance.index');

    // Student QR Badges Route (Uses Controller to auto-generate & store missing QR tokens)
    Route::get('/student-qr-badges', [AdminStudentQrController::class, 'index'])->name('student.qr-badges');

    // Admin Fee & Financial Management
    Route::get('/fees', [AdminFeeController::class, 'index'])->name('fees.index');
    Route::post('/fees/generate', [AdminFeeController::class, 'generateMonthlyFees'])->name('fees.generate');
    Route::post('/fees/{monthlyFee}/payment', [AdminFeeController::class, 'recordPayment'])->name('fees.payment');
    Route::post('/fees/settings', [AdminFeeController::class, 'updateFeeSettings'])->name('fees.settings');

    // Receipt Download Routes
    Route::get('/admin/fees/receipt/{monthlyFee}', [AdminFeeController::class, 'downloadReceipt'])->name('admin.fees.receipt');
    Route::get('/fees/receipt/{monthlyFee}', [AdminFeeController::class, 'downloadReceipt'])->name('fees.receipt');

    // 5. Teacher Portal Routes
    Route::prefix('teacher')->name('teacher.')->group(function () {
        Route::get('/dashboard', function () {
            return Inertia::render('Teacher/TeacherDashboard');
        })->name('dashboard');

        // Teacher Learning Log
        Route::get('/learning-log', [LearningLogController::class, 'index'])->name('learning-log');
        Route::post('/learning-log', [LearningLogController::class, 'store'])->name('learning-log.store');
        Route::put('/learning-log/{id}', [LearningLogController::class, 'update'])->name('learning-log.update');
        Route::delete('/learning-log/{id}', [LearningLogController::class, 'destroy'])->name('learning-log.destroy');

        // Teacher Attendance Routes
        Route::get('/attendance', [TeacherAttendanceController::class, 'index'])->name('attendance.index');
        Route::post('/attendance/scan', [TeacherAttendanceController::class, 'scanQrCode'])->name('attendance.scan');
        Route::post('/attendance/update', [TeacherAttendanceController::class, 'updateManual'])->name('attendance.update');
    });

    // 6. Parent Portal Routes
    Route::prefix('parent')->name('parent.')->group(function () {
        Route::get('/dashboard', [ParentDashboardController::class, 'index'])->name('dashboard');

        // My Children Route
        Route::get('/children', [ParentChildController::class, 'childProfile'])->name('children');
        Route::post('/children/{id}/update', [ParentChildController::class, 'updateChildProfile'])->name('parent.children.update');

        // Learning Logs
        Route::get('/learning-log', [ParentLearningController::class, 'index'])->name('learning-log');
        Route::post('/learning-log/{id}/like', [ParentLearningController::class, 'toggleLike'])->name('learning-log.like');

        // Fee Management (Guna ParentFeeController)
        Route::get('/fees', [ParentFeeController::class, 'index'])->name('fees');

        // Checkout & Return Redirect URL
        Route::post('/fees/checkout', [PaymentController::class, 'checkout'])->name('fees.checkout');
        Route::get('/fees/return', [PaymentController::class, 'returnUrl'])->name('fees.return');

        Route::get('/attendance', [ParentAttendanceController::class, 'index'])->name('attendance.index');
        Route::post('/attendance/absence', [ParentAttendanceController::class, 'submitAbsenceReason'])->name('attendance.absence.submit');
    });

});

/*
|--------------------------------------------------------------------------
| Laravel Breeze Authentication Routes
|--------------------------------------------------------------------------
*/
if (file_exists(__DIR__.'/auth.php')) {
    require __DIR__.'/auth.php';
}
