<?php

use Illuminate\Support\Facades\Route;
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
use App\Http\Controllers\AnnouncementController;
use App\Http\Controllers\MessagingController;


// Public / Guest Routes

Route::get('/', function () {
    return redirect()->route('login');
});


// ToyyibPay Webhook Callback
// This route must stay outside auth middleware because ToyyibPay calls it directly

Route::post(
    '/toyyibpay/callback',
    [PaymentController::class, 'callback']
)->name('toyyibpay.callback');


// Protected Routes

Route::middleware(['auth'])->group(function () {

    // =====================================================
    // ADMIN ROUTES
    // =====================================================

    Route::middleware(['role:admin'])->group(function () {

        // Admin Dashboard

        Route::get(
            '/dashboard',
            [DashboardController::class, 'index']
        )->name('dashboard');


        // Student Management

        Route::resource(
            'students',
            StudentController::class
        );


        // Account Management

        Route::get(
            '/staff-accounts',
            [AccountController::class, 'index']
        )->name('staff-accounts.index');

        Route::post(
            '/staff-accounts',
            [AccountController::class, 'store']
        )->name('staff-accounts.store');

        Route::post(
            '/staff-accounts/link-student',
            [AccountController::class, 'linkStudent']
        )->name('staff-accounts.link-student');

        // Approve parent and link child

        Route::post(
            '/staff-accounts/approve-parent',
            [AccountController::class, 'approveParent']
        )->name('staff-accounts.approve-parent');

        // Reject parent registration

        Route::post(
            '/staff-accounts/reject-parent',
            [AccountController::class, 'rejectParent']
        )->name('staff-accounts.reject-parent');


        // Attendance Management

        Route::get(
            '/attendance',
            [AdminAttendanceController::class, 'index']
        )->name('attendance.index');

        Route::patch(
            '/attendance/{attendance}/absence-status',
            [
                AdminAttendanceController::class,
                'updateAbsenceStatus',
            ]
        )->name(
            'attendance.absence-status'
        );

        // Student QR Management

        Route::get(
            '/student-qr-badges',
            [AdminStudentQrController::class, 'index']
        )->name('student.qr-badges');


        // Fee Management

        Route::get(
            '/admin/fees',
            [AdminFeeController::class, 'index']
        )->name('admin.fees.index');

        // Generate monthly bills
        // Monthly fee is taken automatically from student's package

        Route::post(
            '/admin/fees/generate-monthly',
            [AdminFeeController::class, 'generateMonthlyFees']
        )->name('admin.fees.generate-monthly');

        // Record manual payment

        Route::post(
            '/admin/fees/record-payment',
            [AdminFeeController::class, 'recordPayment']
        )->name('admin.fees.record-payment');

        // Record payment for a specific monthly invoice

        Route::post(
            '/admin/fees/{monthlyFee}/record-payment',
            [AdminFeeController::class, 'recordPayment']
        )->name('admin.fees.record-payment-specific');

        // Update fee settings

        Route::post(
            '/admin/fees/settings',
            [AdminFeeController::class, 'updateFeeSettings']
        )->name('admin.fees.settings');

        // Download payment receipt

        Route::get(
            '/admin/fees/receipt/{monthlyFee}',
            [AdminFeeController::class, 'downloadReceipt']
        )->name('admin.fees.receipt');

        // Announcement Management

Route::get(
    '/admin/announcements',
    [AnnouncementController::class, 'adminIndex']
)->name('admin.announcements.index');

Route::post(
    '/admin/announcements',
    [AnnouncementController::class, 'store']
)->name('admin.announcements.store');

Route::put(
    '/admin/announcements/{announcement}',
    [AnnouncementController::class, 'update']
)->name('admin.announcements.update');

Route::delete(
    '/admin/announcements/{announcement}',
    [AnnouncementController::class, 'destroy']
)->name('admin.announcements.destroy');
    });


    // =====================================================
    // TEACHER ROUTES
    // =====================================================

    Route::middleware(['role:teacher'])
        ->prefix('teacher')
        ->name('teacher.')
        ->group(function () {

            // Teacher Dashboard

            Route::get('/dashboard', function () {
                return Inertia::render('Teacher/TeacherDashboard');
            })->name('dashboard');


            // Learning Log

            Route::get(
                '/learning-log',
                [LearningLogController::class, 'index']
            )->name('learning-log');

            Route::post(
                '/learning-log',
                [LearningLogController::class, 'store']
            )->name('learning-log.store');

            Route::put(
                '/learning-log/{id}',
                [LearningLogController::class, 'update']
            )->name('learning-log.update');

            Route::delete(
                '/learning-log/{id}',
                [LearningLogController::class, 'destroy']
            )->name('learning-log.destroy');


            // Teacher Attendance

            Route::get(
                '/attendance',
                [TeacherAttendanceController::class, 'index']
            )->name('attendance.index');

            Route::post(
                '/attendance/scan',
                [TeacherAttendanceController::class, 'scanQrCode']
            )->name('attendance.scan');

            Route::post(
                '/attendance/update',
                [TeacherAttendanceController::class, 'updateManual']
            )->name('attendance.update');

            Route::patch(
                '/attendance/{attendance}/absence-status',
                [
                    TeacherAttendanceController::class,
                    'updateAbsenceStatus',
                ]
            )->name(
                'attendance.absence-status'
            );

            // Announcements

            Route::get(
                '/announcements',
                [AnnouncementController::class, 'teacherIndex']
            )->name('announcements.index');

            Route::post(
                '/announcements',
                [AnnouncementController::class, 'store']
            )->name('announcements.store');

            Route::put(
                '/announcements/{announcement}',
                [AnnouncementController::class, 'update']
            )->name('announcements.update');

            Route::delete(
                '/announcements/{announcement}',
                [AnnouncementController::class, 'destroy']
            )->name('announcements.destroy');

            // Teacher Messaging

            Route::get(
                '/messages',
                [MessagingController::class, 'index']
            )->name('messages.index');

            Route::post(
                '/messages/{conversation}/send',
                [MessagingController::class, 'sendMessage']
            )->name('messages.send');

            Route::patch(
                '/messages/{conversation}/read',
                [MessagingController::class, 'markAsRead']
            )->name('messages.read');

            Route::post(
                '/messages/conversations',
                [MessagingController::class, 'storeTeacherConversation']
            )->name('messages.conversations.store');
        });


    // =====================================================
    // PARENT ROUTES
    // =====================================================

    Route::middleware(['role:parent'])
        ->prefix('parent')
        ->name('parent.')
        ->group(function () {

            // Parent Dashboard

            Route::get(
                '/dashboard',
                [ParentDashboardController::class, 'index']
            )->name('dashboard');


            // My Children

            Route::get(
                '/children',
                [ParentChildController::class, 'childProfile']
            )->name('children');

            Route::post(
                '/children/{id}/update',
                [ParentChildController::class, 'updateChildProfile']
            )->name('children.update');


            // Child Learning Progress

            Route::get(
                '/learning-log',
                [ParentLearningController::class, 'index']
            )->name('learning-log');

            Route::post(
                '/learning-log/{id}/like',
                [ParentLearningController::class, 'toggleLike']
            )->name('learning-log.like');


            // Parent Fee Management

            Route::get(
                '/fees',
                [ParentFeeController::class, 'index']
            )->name('fees');


            // ToyyibPay Payment

            Route::post(
                '/fees/checkout',
                [PaymentController::class, 'checkout']
            )->name('fees.checkout');

            Route::get(
                '/fees/return',
                [PaymentController::class, 'returnUrl']
            )->name('fees.return');

            // Download payment receipt

            Route::get(
                '/fees/{monthlyFee}/receipt',
                [ParentFeeController::class, 'downloadReceipt']
            )->name('fees.receipt');


            // Parent Attendance

            Route::get(
                '/attendance',
                [ParentAttendanceController::class, 'index']
            )->name('attendance.index');

            Route::post(
                '/attendance/absence',
                [ParentAttendanceController::class, 'submitAbsenceReason']
            )->name('attendance.absence.submit');

            // Announcements

            Route::get(
                '/announcements',
                [AnnouncementController::class, 'parentIndex']
            )->name('announcements.index');

            // Parent Messaging

            Route::get(
                '/messages',
                [MessagingController::class, 'index']
            )->name('messages.index');

            Route::post(
                '/messages/conversations',
                [MessagingController::class, 'storeConversation']
            )->name('messages.conversation.store');

            Route::post(
                '/messages/{conversation}/send',
                [MessagingController::class, 'sendMessage']
            )->name('messages.send');

            Route::patch(
                '/messages/{conversation}/read',
                [MessagingController::class, 'markAsRead']
            )->name('messages.read');
        });
});


// Laravel Breeze Authentication Routes

if (file_exists(__DIR__ . '/auth.php')) {
    require __DIR__ . '/auth.php';
}
