import React, { useState, useEffect, useRef } from 'react';
import { Head, router, usePage } from '@inertiajs/react';
import AuthenticatedLayoutTeacher from '@/Layouts/AuthenticatedLayoutTeacher';
import { Html5Qrcode } from 'html5-qrcode';
import {
    QrCode,
    Camera,
    CheckCircle2,
    Clock,
    XCircle,
    Search,
    Calendar,
    UserCheck,
    List,
    LogOut as PickupIcon,
    Upload,
    FileImage,
    LogIn,
    LogOut,
} from 'lucide-react';

export default function AttendanceManagement({
    students = [],
    selectedDate = new Date().toISOString().split('T')[0],
    teacherClass = 'All Classes',
    recentScans = [],
    pickupRecords = [],
}) {
    const { auth } = usePage().props;

    const teacherName =
        auth?.user?.full_name ||
        auth?.user?.name ||
        'Teacher';

    // UI states
    const [activeTab, setActiveTab] = useState('scan');
    const [scanMode, setScanMode] = useState('camera');
    const [scanTypeTab, setScanTypeTab] = useState('checkin');
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedStatusFilter, setSelectedStatusFilter] =
        useState('All');

    // Keep current check-in/check-out mode during scanner callback
    const activeScanTypeRef = useRef('checkin');

    // Scanner states
    const [isCameraActive, setIsCameraActive] = useState(false);
    const [cameraError, setCameraError] = useState(null);
    const [scanResult, setScanResult] = useState(null);
    const [uploadError, setUploadError] = useState(null);

    const qrScannerRef = useRef(null);
    const fileInputRef = useRef(null);

    const handleTabChange = (type) => {
        setScanTypeTab(type);
        activeScanTypeRef.current = type;
        setScanResult(null);
    };

    // Change attendance date
    const handleDateChange = (e) => {
        const newDate = e.target.value;

        router.get(
            '/teacher/attendance',
            { date: newDate },
            {
                preserveState: true,
                preserveScroll: true,
            }
        );
    };

    // Summary
    const totalStudents = students.length;

    const presentCount = students.filter(
        (student) => student?.status === 'Present'
    ).length;

    const lateCount = students.filter(
        (student) => student?.status === 'Late'
    ).length;

    const absentCount = students.filter(
        (student) =>
            student?.status === 'Absent' ||
            !student?.status
    ).length;

    const recordedCount = presentCount + lateCount;

    const progressPercentage =
        totalStudents > 0
            ? Math.round(
                  (recordedCount / totalStudents) * 100
              )
            : 0;

    // Student filters
    const filteredStudents = students.filter((student) => {
        const name = student?.name || '';
        const mykid = student?.mykid || '';

        const matchesSearch =
            name
                .toLowerCase()
                .includes(searchQuery.toLowerCase()) ||
            mykid
                .toLowerCase()
                .includes(searchQuery.toLowerCase());

        const matchesStatus =
            selectedStatusFilter === 'All' ||
            student?.status === selectedStatusFilter;

        return matchesSearch && matchesStatus;
    });

    // Pickup filters
    const filteredPickups = pickupRecords.filter((record) => {
        const studentName = record?.student_name || '';
        const guardianName = record?.guardian_name || '';

        return (
            studentName
                .toLowerCase()
                .includes(searchQuery.toLowerCase()) ||
            guardianName
                .toLowerCase()
                .includes(searchQuery.toLowerCase())
        );
    });

    // Start and stop QR camera
    useEffect(() => {
        let html5QrcodeScanner = null;

        if (isCameraActive && scanMode === 'camera') {
            html5QrcodeScanner = new Html5Qrcode('qr-reader');

            qrScannerRef.current = html5QrcodeScanner;

            const config = {
                fps: 10,
                qrbox: {
                    width: 250,
                    height: 250,
                },
            };

            html5QrcodeScanner
                .start(
                    { facingMode: 'environment' },
                    config,
                    onQrCodeSuccess,
                    () => {}
                )
                .catch(() => {
                    setCameraError(
                        'Unable to access camera. Please use file upload or manual marking.'
                    );

                    setIsCameraActive(false);
                });
        }

        return () => {
            if (qrScannerRef.current) {
                if (qrScannerRef.current.isScanning) {
                    qrScannerRef.current
                        .stop()
                        .catch(() => {});
                }

                qrScannerRef.current = null;
            }
        };
    }, [isCameraActive, scanMode]);

    const stopCamera = () => {
        if (
            qrScannerRef.current &&
            qrScannerRef.current.isScanning
        ) {
            qrScannerRef.current
                .stop()
                .then(() => {
                    setIsCameraActive(false);
                })
                .catch(() => {
                    setIsCameraActive(false);
                });
        } else {
            setIsCameraActive(false);
        }
    };

    const resumeScanner = () => {
        if (
            qrScannerRef.current &&
            qrScannerRef.current.isPaused
        ) {
            setTimeout(() => {
                try {
                    qrScannerRef.current?.resume();
                } catch {
                    // Scanner may already be stopped
                }
            }, 1500);
        }
    };

    // Handle successful QR scan
    const onQrCodeSuccess = (decodedText) => {
        if (
            qrScannerRef.current &&
            qrScannerRef.current.isScanning
        ) {
            qrScannerRef.current.pause();
        }

        const currentMode = activeScanTypeRef.current;

        let payload = {};

        try {
            payload = JSON.parse(decodedText);
        } catch {
            payload = {
                student_id: decodedText,
            };
        }

        // Match student using student ID or QR token
        const scannedStudent = students.find(
            (student) =>
                String(student.id) ===
                    String(payload.student_id) ||
                String(student.qr_code_token) ===
                    String(payload.student_id)
        );

        if (!scannedStudent) {
            setScanResult({
                type: 'invalid',
                message:
                    'QR Code not found or invalid student.',
            });

            resumeScanner();
            return;
        }

        const now = new Date();

        const displayTimeStr = now.toLocaleTimeString([], {
            hour: '2-digit',
            minute: '2-digit',
            hour12: true,
        });

        // Check-out process
        if (currentMode === 'checkout') {
            const hasCheckedIn =
                Boolean(scannedStudent.check_in_time) ||
                scannedStudent.status === 'Present' ||
                scannedStudent.status === 'Late';

            if (!hasCheckedIn) {
                setScanResult({
                    type: 'invalid',
                    message: `${scannedStudent.name} has not checked in yet.`,
                });

                resumeScanner();
                return;
            }

            if (scannedStudent.check_out_time) {
                setScanResult({
                    type: 'invalid',
                    message: `${scannedStudent.name} already checked out at ${scannedStudent.check_out_time}.`,
                });

                resumeScanner();
                return;
            }

            router.post(
                '/teacher/attendance/update',
                {
                    student_id: scannedStudent.id,
                    date: selectedDate,
                    status: 'Checked Out',
                    action: 'check_out',
                    method:
                        scanMode === 'camera'
                            ? 'QR Camera'
                            : 'QR Upload',
                },
                {
                    preserveScroll: true,

                    onSuccess: () => {
                        setScanResult({
                            type: 'success',
                            action: 'check_out',
                            student: scannedStudent,
                            status: 'Checked Out',
                            checkOutTime: displayTimeStr,
                        });

                        resumeScanner();
                    },

                    onError: () => {
                        setScanResult({
                            type: 'invalid',
                            message:
                                'Failed to update check-out in database.',
                        });

                        resumeScanner();
                    },
                }
            );

            return;
        }

        // Check-in process
        if (
            scannedStudent.status === 'Present' ||
            scannedStudent.status === 'Late'
        ) {
            setScanResult({
                type: 'duplicate',
                student: scannedStudent,
                checkInTime:
                    scannedStudent.check_in_time ||
                    displayTimeStr,
            });

            resumeScanner();
            return;
        }

        router.post(
            '/teacher/attendance/update',
            {
                student_id: scannedStudent.id,
                date: selectedDate,
                status: 'Present',
                action: 'check_in',
                method:
                    scanMode === 'camera'
                        ? 'QR Camera'
                        : 'QR Upload',
            },
            {
                preserveScroll: true,

                onSuccess: () => {
                    setScanResult({
                        type: 'success',
                        action: 'check_in',
                        student: scannedStudent,
                        status: 'Present',
                        checkInTime: displayTimeStr,
                    });

                    resumeScanner();
                },

                onError: () => {
                    setScanResult({
                        type: 'invalid',
                        message:
                            'Failed to update check-in in database.',
                    });

                    resumeScanner();
                },
            }
        );
    };

    // Scan uploaded QR image
    const handleFileUpload = async (e) => {
        const file = e.target.files?.[0];

        if (!file) {
            return;
        }

        setUploadError(null);

        const html5Qrcode = new Html5Qrcode(
            'qr-upload-reader'
        );

        try {
            const result = await html5Qrcode.scanFileV2(
                file,
                true
            );

            if (result?.decodedText) {
                onQrCodeSuccess(result.decodedText);
            }
        } catch {
            setUploadError(
                'Could not read a valid QR code from this image. Please try another image.'
            );
        } finally {
            html5Qrcode.clear();

            if (fileInputRef.current) {
                fileInputRef.current.value = '';
            }
        }
    };

    // Manual check-in/status
    const handleManualStatusUpdate = (
        studentId,
        status
    ) => {
        router.post(
            '/teacher/attendance/update',
            {
                student_id: studentId,
                date: selectedDate,
                status: status,
                action: 'check_in',
                method: 'Manual',
            },
            {
                preserveScroll: true,
            }
        );
    };

    // Manual check-out
    const handleManualCheckout = (studentId) => {
        router.post(
            '/teacher/attendance/update',
            {
                student_id: studentId,
                date: selectedDate,
                status: 'Checked Out',
                action: 'check_out',
                method: 'Manual',
            },
            {
                preserveScroll: true,
            }
        );
    };

    return (
        <AuthenticatedLayoutTeacher activeNavId="attendance">
            <Head title="Attendance Management - Teacher Portal" />

            <div
                id="qr-upload-reader"
                className="hidden"
            ></div>

            <div className="space-y-6 pb-12">
                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-[#E4E6E2] shadow-xs">
                    <div>
                        <div className="flex items-center gap-2">
                            <h1 className="text-2xl font-extrabold text-[#26332A] tracking-tight">
                                Attendance Management
                            </h1>

                            <span className="px-2.5 py-0.5 rounded-full bg-[#7FAF8A]/15 text-[#527A5D] font-black text-xs">
                                Live
                            </span>
                        </div>

                        <p className="text-xs text-[#68736B] font-medium mt-1">
                            Record and monitor daily student
                            attendance.
                        </p>
                    </div>

                    <div className="flex items-center gap-3 bg-[#F8F7F2] px-4 py-2.5 rounded-xl border border-[#E4E6E2]">
                        <div className="w-9 h-9 rounded-xl bg-[#527A5D] text-white flex items-center justify-center font-bold text-xs shrink-0">
                            {teacherName.charAt(0)}
                        </div>

                        <div className="flex flex-col">
                            <p className="text-xs font-bold text-[#26332A]">
                                {teacherName} ·{' '}
                                <span className="text-[#527A5D]">
                                    {teacherClass}
                                </span>
                            </p>

                            <div className="flex items-center gap-1.5 mt-0.5">
                                <Calendar className="w-3.5 h-3.5 text-[#7FAF8A]" />

                                <input
                                    type="date"
                                    value={selectedDate}
                                    onChange={handleDateChange}
                                    className="bg-transparent border-none p-0 text-xs font-semibold text-[#68736B] focus:ring-0 cursor-pointer"
                                />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Navigation */}
                <div className="flex flex-wrap items-center gap-2 bg-white p-2.5 rounded-2xl border border-[#E4E6E2]">
                    <button
                        onClick={() =>
                            setActiveTab('scan')
                        }
                        className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all ${
                            activeTab === 'scan'
                                ? 'bg-[#527A5D] text-white shadow-md'
                                : 'text-[#68736B] hover:bg-[#F8F7F2]'
                        }`}
                    >
                        <QrCode className="w-4 h-4" />
                        Scan QR
                    </button>

                    <button
                        onClick={() =>
                            setActiveTab('manual')
                        }
                        className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all ${
                            activeTab === 'manual'
                                ? 'bg-[#527A5D] text-white shadow-md'
                                : 'text-[#68736B] hover:bg-[#F8F7F2]'
                        }`}
                    >
                        <List className="w-4 h-4" />
                        Mark Manually
                    </button>

                    <button
                        onClick={() =>
                            setActiveTab('pickup')
                        }
                        className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all ${
                            activeTab === 'pickup'
                                ? 'bg-[#527A5D] text-white shadow-md'
                                : 'text-[#68736B] hover:bg-[#F8F7F2]'
                        }`}
                    >
                        <PickupIcon className="w-4 h-4" />
                        Pickup Records
                    </button>
                </div>

                {/* Summary */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="bg-white p-4 rounded-2xl border border-[#E4E6E2] shadow-xs flex items-center justify-between">
                        <div>
                            <span className="text-[10px] font-black uppercase text-[#68736B]">
                                Total Students
                            </span>

                            <span className="text-2xl font-black text-[#26332A] mt-1 block">
                                {totalStudents}
                            </span>
                        </div>

                        <UserCheck className="w-5 h-5 text-[#527A5D]" />
                    </div>

                    <div className="bg-white p-4 rounded-2xl border border-[#E4E6E2] shadow-xs flex items-center justify-between">
                        <div>
                            <span className="text-[10px] font-black uppercase text-[#72A77D]">
                                Present
                            </span>

                            <span className="text-2xl font-black text-[#72A77D] mt-1 block">
                                {presentCount}
                            </span>
                        </div>

                        <CheckCircle2 className="w-5 h-5 text-[#72A77D]" />
                    </div>

                    <div className="bg-white p-4 rounded-2xl border border-[#E4E6E2] shadow-xs flex items-center justify-between">
                        <div>
                            <span className="text-[10px] font-black uppercase text-[#E8B85C]">
                                Late
                            </span>

                            <span className="text-2xl font-black text-[#E8B85C] mt-1 block">
                                {lateCount}
                            </span>
                        </div>

                        <Clock className="w-5 h-5 text-[#E8B85C]" />
                    </div>

                    <div className="bg-white p-4 rounded-2xl border border-[#E4E6E2] shadow-xs flex items-center justify-between">
                        <div>
                            <span className="text-[10px] font-black uppercase text-[#D97B73]">
                                Absent
                            </span>

                            <span className="text-2xl font-black text-[#D97B73] mt-1 block">
                                {absentCount}
                            </span>
                        </div>

                        <XCircle className="w-5 h-5 text-[#D97B73]" />
                    </div>
                </div>

                {/* Progress */}
                <div className="bg-white p-4 rounded-2xl border border-[#E4E6E2] shadow-xs space-y-2">
                    <div className="flex items-center justify-between text-xs font-bold text-[#26332A]">
                        <span>
                            Today's Attendance Progress
                        </span>

                        <span>
                            {recordedCount} / {totalStudents}{' '}
                            ({progressPercentage}%)
                        </span>
                    </div>

                    <div className="w-full bg-[#F8F7F2] h-2.5 rounded-full overflow-hidden border border-[#E4E6E2]">
                        <div
                            className="bg-[#527A5D] h-full transition-all duration-500"
                            style={{
                                width: `${progressPercentage}%`,
                            }}
                        />
                    </div>
                </div>

                {/* QR Scanner */}
                {activeTab === 'scan' && (
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                        <div className="lg:col-span-6 bg-white p-6 rounded-2xl border border-[#E4E6E2] shadow-xs space-y-5">
                            <div className="flex items-center justify-between border-b border-[#E4E6E2] pb-3">
                                <div className="flex items-center gap-2">
                                    <QrCode className="w-5 h-5 text-[#527A5D]" />

                                    <h2 className="text-base font-extrabold text-[#26332A]">
                                        Scan Student QR
                                    </h2>
                                </div>

                                <div className="flex items-center gap-1 bg-[#F8F7F2] p-1 rounded-xl border border-[#E4E6E2]">
                                    <button
                                        onClick={() => {
                                            stopCamera();
                                            setScanMode(
                                                'camera'
                                            );
                                        }}
                                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                                            scanMode ===
                                            'camera'
                                                ? 'bg-[#527A5D] text-white'
                                                : 'text-[#68736B]'
                                        }`}
                                    >
                                        <Camera className="w-3.5 h-3.5" />
                                        Camera
                                    </button>

                                    <button
                                        onClick={() => {
                                            stopCamera();
                                            setScanMode(
                                                'upload'
                                            );
                                        }}
                                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                                            scanMode ===
                                            'upload'
                                                ? 'bg-[#527A5D] text-white'
                                                : 'text-[#68736B]'
                                        }`}
                                    >
                                        <Upload className="w-3.5 h-3.5" />
                                        Upload Image
                                    </button>
                                </div>
                            </div>

                            {scanMode === 'camera' && (
                                <>
                                    <div className="relative bg-[#26332A] rounded-2xl p-4 flex flex-col items-center justify-center min-h-[300px]">
                                        {isCameraActive ? (
                                            <div
                                                id="qr-reader"
                                                className="w-full max-w-sm rounded-xl overflow-hidden border-2 border-[#7FAF8A]"
                                            />
                                        ) : (
                                            <div className="text-center space-y-3 py-8">
                                                <Camera className="w-10 h-10 text-[#7FAF8A] mx-auto" />

                                                <p className="text-xs text-white/80 font-medium max-w-xs">
                                                    Position
                                                    student QR
                                                    code within
                                                    frame to scan
                                                    automatically.
                                                </p>
                                            </div>
                                        )}
                                    </div>

                                    {cameraError && (
                                        <p className="text-xs text-[#D97B73] font-bold">
                                            {cameraError}
                                        </p>
                                    )}

                                    <button
                                        onClick={
                                            isCameraActive
                                                ? stopCamera
                                                : () => {
                                                      setCameraError(
                                                          null
                                                      );
                                                      setIsCameraActive(
                                                          true
                                                      );
                                                  }
                                        }
                                        className={`w-full py-3 text-white font-extrabold text-xs uppercase rounded-xl transition-all ${
                                            isCameraActive
                                                ? 'bg-[#D97B73]'
                                                : 'bg-[#527A5D]'
                                        }`}
                                    >
                                        {isCameraActive
                                            ? 'Stop Camera'
                                            : 'Start Camera'}
                                    </button>
                                </>
                            )}

                            {scanMode === 'upload' && (
                                <div className="space-y-4">
                                    <div
                                        onClick={() =>
                                            fileInputRef.current?.click()
                                        }
                                        className="border-2 border-dashed border-[#7FAF8A] bg-[#F8F7F2] rounded-2xl p-8 flex flex-col items-center justify-center cursor-pointer hover:bg-[#7FAF8A]/10 transition-all text-center min-h-[300px]"
                                    >
                                        <FileImage className="w-12 h-12 text-[#527A5D] mb-3" />

                                        <p className="text-sm font-extrabold text-[#26332A]">
                                            Click or drop
                                            image to upload
                                            QR code
                                        </p>

                                        <p className="text-xs text-[#68736B] font-medium mt-1">
                                            Supports PNG,
                                            JPG, JPEG, WEBP
                                            formats
                                        </p>

                                        <input
                                            ref={
                                                fileInputRef
                                            }
                                            type="file"
                                            accept="image/*"
                                            onChange={
                                                handleFileUpload
                                            }
                                            className="hidden"
                                        />
                                    </div>

                                    {uploadError && (
                                        <p className="text-xs text-[#D97B73] font-bold text-center">
                                            {uploadError}
                                        </p>
                                    )}
                                </div>
                            )}

                            {/* Scanner result */}
                            {scanResult && (
                                <div
                                    className={`p-4 rounded-xl border text-xs font-bold ${
                                        scanResult.type ===
                                        'success'
                                            ? 'bg-[#72A77D]/15 border-[#72A77D] text-[#26332A]'
                                            : 'bg-[#D97B73]/15 border-[#D97B73] text-[#26332A]'
                                    }`}
                                >
                                    {scanResult.type ===
                                        'invalid' && (
                                        <p>
                                            {
                                                scanResult.message
                                            }
                                        </p>
                                    )}

                                    {scanResult.type ===
                                        'duplicate' && (
                                        <p>
                                            {
                                                scanResult
                                                    .student
                                                    ?.name
                                            }{' '}
                                            has already
                                            checked in at{' '}
                                            {
                                                scanResult.checkInTime
                                            }
                                            .
                                        </p>
                                    )}

                                    {scanResult.type ===
                                        'success' &&
                                        scanResult.action ===
                                            'check_in' && (
                                            <p>
                                                Recorded{' '}
                                                {
                                                    scanResult
                                                        .student
                                                        ?.name
                                                }{' '}
                                                at{' '}
                                                {
                                                    scanResult.checkInTime
                                                }
                                                .
                                            </p>
                                        )}

                                    {scanResult.type ===
                                        'success' &&
                                        scanResult.action ===
                                            'check_out' && (
                                            <p>
                                                Recorded{' '}
                                                {
                                                    scanResult
                                                        .student
                                                        ?.name
                                                }{' '}
                                                as Checked
                                                Out at{' '}
                                                {
                                                    scanResult.checkOutTime
                                                }
                                                .
                                            </p>
                                        )}
                                </div>
                            )}
                        </div>

                        {/* Check-in / Check-out list */}
                        <div className="lg:col-span-6 bg-white p-6 rounded-2xl border border-[#E4E6E2] shadow-xs space-y-4">
                            <div className="flex items-center justify-between border-b border-[#E4E6E2] pb-3">
                                <div className="flex items-center gap-2">
                                    <button
                                        onClick={() =>
                                            handleTabChange(
                                                'checkin'
                                            )
                                        }
                                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-extrabold text-xs transition-all ${
                                            scanTypeTab ===
                                            'checkin'
                                                ? 'bg-[#527A5D] text-white shadow-xs'
                                                : 'bg-[#F8F7F2] text-[#68736B]'
                                        }`}
                                    >
                                        <LogIn className="w-3.5 h-3.5" />
                                        Check-In List
                                    </button>

                                    <button
                                        onClick={() =>
                                            handleTabChange(
                                                'checkout'
                                            )
                                        }
                                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-extrabold text-xs transition-all ${
                                            scanTypeTab ===
                                            'checkout'
                                                ? 'bg-[#527A5D] text-white shadow-xs'
                                                : 'bg-[#F8F7F2] text-[#68736B]'
                                        }`}
                                    >
                                        <LogOut className="w-3.5 h-3.5" />
                                        Check-Out List
                                    </button>
                                </div>

                                <span className="text-[10px] font-black uppercase text-[#68736B]">
                                    {students.length}{' '}
                                    Students
                                </span>
                            </div>

                            <div className="space-y-2.5 max-h-[420px] overflow-y-auto pr-1">
                                {students.length === 0 ? (
                                    <p className="text-xs text-[#68736B] italic py-8 text-center">
                                        No students
                                        registered.
                                    </p>
                                ) : (
                                    students.map(
                                        (student) => {
                                            const isCheckedIn =
                                                Boolean(
                                                    student.check_in_time
                                                );

                                            const isCheckedOut =
                                                Boolean(
                                                    student.check_out_time
                                                );

                                            return (
                                                <div
                                                    key={
                                                        student.id
                                                    }
                                                    className="flex items-center justify-between p-3.5 bg-[#F8F7F2] rounded-xl border border-[#E4E6E2] text-xs"
                                                >
                                                    <div className="space-y-0.5">
                                                        <p className="font-extrabold text-[#26332A]">
                                                            {
                                                                student.name
                                                            }
                                                        </p>

                                                        <div className="flex items-center gap-2 text-[10px] text-[#68736B] font-semibold">
                                                            <span>
                                                                {scanTypeTab ===
                                                                'checkin'
                                                                    ? `Check-In: ${
                                                                          student.check_in_time ||
                                                                          'Not recorded'
                                                                      }`
                                                                    : `Check-Out: ${
                                                                          student.check_out_time ||
                                                                          'Not recorded'
                                                                      }`}
                                                            </span>

                                                            {student.method && (
                                                                <span className="px-1.5 py-0.5 rounded bg-white border border-[#E4E6E2]">
                                                                    {
                                                                        student.method
                                                                    }
                                                                </span>
                                                            )}
                                                        </div>
                                                    </div>

                                                    {scanTypeTab ===
                                                        'checkin' && (
                                                        <div>
                                                            {isCheckedIn ? (
                                                                <div className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-[#72A77D]/15 text-[#72A77D] font-extrabold text-xs">
                                                                    <CheckCircle2 className="w-3.5 h-3.5" />
                                                                    Verified
                                                                </div>
                                                            ) : (
                                                                <button
                                                                    onClick={() =>
                                                                        handleManualStatusUpdate(
                                                                            student.id,
                                                                            'Present'
                                                                        )
                                                                    }
                                                                    className="px-3 py-1.5 bg-[#527A5D] text-white font-extrabold text-xs rounded-xl"
                                                                >
                                                                    Verify
                                                                </button>
                                                            )}
                                                        </div>
                                                    )}

                                                    {scanTypeTab ===
                                                        'checkout' && (
                                                        <div>
                                                            {isCheckedOut ? (
                                                                <div className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-[#527A5D]/15 text-[#527A5D] font-extrabold text-xs">
                                                                    <CheckCircle2 className="w-3.5 h-3.5" />
                                                                    Verified
                                                                    Out
                                                                </div>
                                                            ) : (
                                                                <button
                                                                    onClick={() =>
                                                                        handleManualCheckout(
                                                                            student.id
                                                                        )
                                                                    }
                                                                    disabled={
                                                                        !isCheckedIn
                                                                    }
                                                                    className={`px-3 py-1.5 font-extrabold text-xs rounded-xl ${
                                                                        isCheckedIn
                                                                            ? 'bg-[#D97B73] text-white'
                                                                            : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                                                                    }`}
                                                                >
                                                                    Verify
                                                                    Out
                                                                </button>
                                                            )}
                                                        </div>
                                                    )}
                                                </div>
                                            );
                                        }
                                    )
                                )}
                            </div>
                        </div>
                    </div>
                )}

                {/* Search */}
                {(activeTab === 'manual' ||
                    activeTab === 'pickup') && (
                    <div className="bg-white p-4 rounded-2xl border border-[#E4E6E2] shadow-xs flex flex-col md:flex-row items-center gap-3">
                        <div className="relative flex-1 w-full">
                            <Search className="w-4 h-4 absolute left-3.5 top-3 text-[#68736B]" />

                            <input
                                type="text"
                                placeholder={
                                    activeTab === 'manual'
                                        ? 'Search student by name or MyKid...'
                                        : 'Search student...'
                                }
                                value={searchQuery}
                                onChange={(e) =>
                                    setSearchQuery(
                                        e.target.value
                                    )
                                }
                                className="w-full pl-10 pr-4 py-2 bg-[#F8F7F2] border border-[#E4E6E2] rounded-xl text-xs font-medium"
                            />
                        </div>

                        {activeTab === 'manual' && (
                            <select
                                value={
                                    selectedStatusFilter
                                }
                                onChange={(e) =>
                                    setSelectedStatusFilter(
                                        e.target.value
                                    )
                                }
                                className="px-3 py-2 bg-[#F8F7F2] border border-[#E4E6E2] rounded-xl text-xs font-bold"
                            >
                                <option value="All">
                                    All Statuses
                                </option>
                                <option value="Present">
                                    Present
                                </option>
                                <option value="Late">
                                    Late
                                </option>
                                <option value="Absent">
                                    Absent
                                </option>
                            </select>
                        )}
                    </div>
                )}

                {/* Manual attendance */}
                {activeTab === 'manual' && (
                    <div className="bg-white rounded-2xl border border-[#E4E6E2] shadow-xs overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="w-full text-left text-xs">
                                <thead className="bg-[#F8F7F2] text-[#68736B] font-extrabold uppercase border-b border-[#E4E6E2]">
                                    <tr>
                                        <th className="py-3 px-4">
                                            Student
                                        </th>
                                        <th className="py-3 px-4">
                                            Status
                                        </th>
                                        <th className="py-3 px-4">
                                            Check-In
                                        </th>
                                        <th className="py-3 px-4">
                                            Check-Out
                                        </th>
                                        <th className="py-3 px-4 text-right">
                                            Actions
                                        </th>
                                    </tr>
                                </thead>

                                <tbody className="divide-y divide-[#E4E6E2]">
                                    {filteredStudents.length ===
                                    0 ? (
                                        <tr>
                                            <td
                                                colSpan="5"
                                                className="py-8 text-center text-[#68736B] italic"
                                            >
                                                No students
                                                found.
                                            </td>
                                        </tr>
                                    ) : (
                                        filteredStudents.map(
                                            (student) => (
                                                <tr
                                                    key={
                                                        student.id
                                                    }
                                                    className="hover:bg-[#F8F7F2]/60"
                                                >
                                                    <td className="py-3 px-4 font-bold text-[#26332A]">
                                                        {
                                                            student.name
                                                        }

                                                        <span className="block text-[10px] text-[#68736B]">
                                                            MyKid:{' '}
                                                            {student.mykid ||
                                                                'N/A'}
                                                        </span>
                                                    </td>

                                                    <td className="py-3 px-4">
                                                        <span
                                                            className={`px-2.5 py-1 rounded-full font-black text-[10px] ${
                                                                student.status ===
                                                                'Present'
                                                                    ? 'bg-[#72A77D]/15 text-[#72A77D]'
                                                                    : student.status ===
                                                                      'Late'
                                                                    ? 'bg-[#E8B85C]/15 text-[#E8B85C]'
                                                                    : student.status ===
                                                                      'Checked Out'
                                                                    ? 'bg-[#527A5D]/15 text-[#527A5D]'
                                                                    : 'bg-[#D97B73]/15 text-[#D97B73]'
                                                            }`}
                                                        >
                                                            {student.status ||
                                                                'Absent'}
                                                        </span>
                                                    </td>

                                                    <td className="py-3 px-4 font-semibold">
                                                        {student.check_in_time ||
                                                            '-'}
                                                    </td>

                                                    <td className="py-3 px-4 font-semibold">
                                                        {student.check_out_time ||
                                                            '-'}
                                                    </td>

                                                    <td className="py-3 px-4 text-right space-x-1">
                                                        {student.check_in_time &&
                                                        !student.check_out_time ? (
                                                            <button
                                                                onClick={() =>
                                                                    handleManualCheckout(
                                                                        student.id
                                                                    )
                                                                }
                                                                className="px-2.5 py-1 bg-[#D97B73]/15 text-[#D97B73] hover:bg-[#D97B73] hover:text-white rounded-lg font-bold text-[10px]"
                                                            >
                                                                Check
                                                                Out
                                                            </button>
                                                        ) : !student.check_in_time ? (
                                                            <>
                                                                <button
                                                                    onClick={() =>
                                                                        handleManualStatusUpdate(
                                                                            student.id,
                                                                            'Present'
                                                                        )
                                                                    }
                                                                    className="px-2 py-1 bg-[#72A77D]/10 text-[#72A77D] hover:bg-[#72A77D] hover:text-white rounded-lg font-bold text-[10px]"
                                                                >
                                                                    Present
                                                                </button>

                                                                <button
                                                                    onClick={() =>
                                                                        handleManualStatusUpdate(
                                                                            student.id,
                                                                            'Late'
                                                                        )
                                                                    }
                                                                    className="px-2 py-1 bg-[#E8B85C]/10 text-[#E8B85C] hover:bg-[#E8B85C] hover:text-white rounded-lg font-bold text-[10px]"
                                                                >
                                                                    Late
                                                                </button>

                                                                <button
                                                                    onClick={() =>
                                                                        handleManualStatusUpdate(
                                                                            student.id,
                                                                            'Absent'
                                                                        )
                                                                    }
                                                                    className="px-2 py-1 bg-[#D97B73]/10 text-[#D97B73] hover:bg-[#D97B73] hover:text-white rounded-lg font-bold text-[10px]"
                                                                >
                                                                    Absent
                                                                </button>
                                                            </>
                                                        ) : (
                                                            <span className="text-[10px] font-bold text-[#68736B]">
                                                                Completed
                                                            </span>
                                                        )}
                                                    </td>
                                                </tr>
                                            )
                                        )
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}

                {/* Pickup Records */}
                {activeTab === 'pickup' && (
                    <div className="bg-white rounded-2xl border border-[#E4E6E2] shadow-xs overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="w-full text-left text-xs">
                                <thead className="bg-[#F8F7F2] text-[#68736B] font-extrabold uppercase border-b border-[#E4E6E2]">
                                    <tr>
                                        <th className="py-3 px-4">
                                            Student
                                        </th>

                                        <th className="py-3 px-4">
                                            Expected Pickup
                                        </th>

                                        <th className="py-3 px-4">
                                            Actual Pickup
                                        </th>

                                        <th className="py-3 px-4">
                                            Late Pickup
                                        </th>

                                        <th className="py-3 px-4">
                                            Late Fee
                                        </th>
                                    </tr>
                                </thead>

                                <tbody className="divide-y divide-[#E4E6E2]">
                                    {filteredPickups.length ===
                                    0 ? (
                                        <tr>
                                            <td
                                                colSpan="5"
                                                className="py-8 text-center text-[#68736B] italic"
                                            >
                                                No late pickup
                                                records found
                                                for this date.
                                            </td>
                                        </tr>
                                    ) : (
                                        filteredPickups.map(
                                            (
                                                pickup,
                                                index
                                            ) => (
                                                <tr
                                                    key={
                                                        pickup.id ||
                                                        index
                                                    }
                                                    className="hover:bg-[#F8F7F2]/60"
                                                >
                                                    <td className="py-3 px-4 font-bold text-[#26332A]">
                                                        {
                                                            pickup.student_name
                                                        }
                                                    </td>

                                                    <td className="py-3 px-4 font-semibold text-[#26332A]">
                                                        {pickup.expected_pickup_time ||
                                                            '-'}
                                                    </td>

                                                    <td className="py-3 px-4 font-semibold text-[#26332A]">
                                                        {pickup.actual_pickup_time ||
                                                            '-'}
                                                    </td>

                                                    <td className="py-3 px-4">
                                                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full font-extrabold text-[10px] bg-[#D97B73]/10 text-[#D97B73]">
                                                            <Clock className="w-3 h-3" />
                                                            Late
                                                            Pickup:{' '}
                                                            {pickup.late_minutes ||
                                                                0}{' '}
                                                            mins
                                                        </span>
                                                    </td>

                                                    <td className="py-3 px-4 font-extrabold text-[#D97B73]">
                                                        RM{' '}
                                                        {Number(
                                                            pickup.late_fee ||
                                                                0
                                                        ).toFixed(
                                                            2
                                                        )}
                                                    </td>
                                                </tr>
                                            )
                                        )
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}
            </div>
        </AuthenticatedLayoutTeacher>
    );
}
