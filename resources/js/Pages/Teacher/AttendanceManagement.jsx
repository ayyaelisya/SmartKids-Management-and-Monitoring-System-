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
    User,
    ShieldCheck,
    Upload,
    FileImage,
    LogIn,
    LogOut,
} from 'lucide-react';

export default function AttendanceManagement({
    students = [],
    selectedDate = new Date().toISOString().split('T')[0],
    teacherClass = 'Butterfly Class',
    expectedArrivalTime = '07:00',
    recentScans = [],
    pickupRecords = [],
}) {
    const { auth } = usePage().props;
    const teacherName = auth?.user?.name || 'Teacher';

    // UI States
    const [activeTab, setActiveTab] = useState('scan');
    const [scanMode, setScanMode] = useState('camera'); // 'camera' or 'upload'
    const [scanTypeTab, setScanTypeTab] = useState('checkin'); // 'checkin' or 'checkout'
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedStatusFilter, setSelectedStatusFilter] = useState('All');
    const [selectedMethodFilter, setSelectedMethodFilter] = useState('All');

    // Persistent Ref to keep current mode across re-renders
    const activeScanTypeRef = useRef('checkin');

    const handleTabChange = (type) => {
        setScanTypeTab(type);
        activeScanTypeRef.current = type;
    };

    // Camera & Scanner States
    const [isCameraActive, setIsCameraActive] = useState(false);
    const [cameraError, setCameraError] = useState(null);
    const [scanResult, setScanResult] = useState(null);
    const [uploadError, setUploadError] = useState(null);
    const qrScannerRef = useRef(null);
    const fileInputRef = useRef(null);

    // Date Change Handler
    const handleDateChange = (e) => {
        const newDate = e.target.value;
        router.get(
            '/teacher/attendance',
            { date: newDate },
            { preserveState: true, preserveScroll: true }
        );
    };

    // Summary Calculations
    const totalStudents = students.length;
    const presentCount = students.filter((s) => s?.status === 'Present').length;
    const lateCount = students.filter((s) => s?.status === 'Late').length;
    const absentCount = students.filter((s) => s?.status === 'Absent' || !s?.status).length;
    const recordedCount = presentCount + lateCount;
    const progressPercentage = totalStudents > 0 ? Math.round((recordedCount / totalStudents) * 100) : 0;

    // Filtered Lists
    const filteredStudents = students.filter((student) => {
        const name = student?.name || '';
        const mykid = student?.mykid || '';

        const matchesSearch =
            name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            mykid.toLowerCase().includes(searchQuery.toLowerCase());

        const matchesStatus = selectedStatusFilter === 'All' || student?.status === selectedStatusFilter;
        const matchesMethod = selectedMethodFilter === 'All' || student?.method === selectedMethodFilter;

        return matchesSearch && matchesStatus && matchesMethod;
    });

    const filteredPickups = pickupRecords.filter((record) => {
        const studentName = record?.student_name || '';
        const guardianName = record?.guardian_name || '';
        return (
            studentName.toLowerCase().includes(searchQuery.toLowerCase()) ||
            guardianName.toLowerCase().includes(searchQuery.toLowerCase())
        );
    });

    // Scanner Lifecycle for Camera Mode
    useEffect(() => {
        let html5QrcodeScanner = null;

        if (isCameraActive && scanMode === 'camera') {
            html5QrcodeScanner = new Html5Qrcode('qr-reader');
            qrScannerRef.current = html5QrcodeScanner;

            const config = { fps: 10, qrbox: { width: 250, height: 250 } };

            html5QrcodeScanner
                .start({ facingMode: 'environment' }, config, onQrCodeSuccess, () => {})
                .catch(() => {
                    setCameraError('Unable to access camera. Please use file upload or manual marking.');
                    setIsCameraActive(false);
                });
        }

        return () => {
            if (qrScannerRef.current) {
                if (qrScannerRef.current.isScanning) {
                    qrScannerRef.current.stop().catch(() => {});
                }
                qrScannerRef.current = null;
            }
        };
    }, [isCameraActive, scanMode]);

    const stopCamera = () => {
        if (qrScannerRef.current && qrScannerRef.current.isScanning) {
            qrScannerRef.current
                .stop()
                .then(() => setIsCameraActive(false))
                .catch(() => setIsCameraActive(false));
        } else {
            setIsCameraActive(false);
        }
    };

    const calculateLateDuration = (checkInTimeStr, expectedTimeStr) => {
        if (!checkInTimeStr || !expectedTimeStr) return null;
        const [checkH, checkM] = checkInTimeStr.split(':').map(Number);
        const [expH, expM] = expectedTimeStr.split(':').map(Number);
        const diffMins = checkH * 60 + checkM - (expH * 60 + expM);
        if (diffMins <= 0) return null;

        const hours = Math.floor(diffMins / 60);
        const mins = diffMins % 60;
        return `${hours > 0 ? `${hours}h ` : ''}${mins} mins`;
    };

    const onQrCodeSuccess = (decodedText) => {
        if (qrScannerRef.current && qrScannerRef.current.isScanning) {
            qrScannerRef.current.pause();
        }

        const currentMode = activeScanTypeRef.current; // Get latest mode from ref

        let payload = {};
        try {
            payload = JSON.parse(decodedText);
        } catch {
            payload = { student_id: decodedText };
        }

        const scannedStudent = students.find(
            (s) => String(s.id) === String(payload.student_id) || String(s.qr_code_token) === String(payload.student_id)
        );

        if (!scannedStudent) {
            setScanResult({ type: 'invalid', message: 'QR Code not found or invalid student.' });
            if (qrScannerRef.current && qrScannerRef.current.isPaused) {
                setTimeout(() => qrScannerRef.current.resume(), 1500);
            }
            return;
        }

        const now = new Date();
        const currentTimeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false });
        const displayTimeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true });

        // --- CHECK OUT PROCESS ---
        if (currentMode === 'checkout') {
            if (scannedStudent.status !== 'Present' && scannedStudent.status !== 'Late') {
                setScanResult({
                    type: 'invalid',
                    message: `${scannedStudent.name} has not checked in yet.`,
                });
                if (qrScannerRef.current && qrScannerRef.current.isPaused) {
                    setTimeout(() => qrScannerRef.current.resume(), 1500);
                }
                return;
            }

            if (scannedStudent.check_out_time) {
                setScanResult({
                    type: 'invalid',
                    message: `${scannedStudent.name} already checked out at ${scannedStudent.check_out_time}.`,
                });
                if (qrScannerRef.current && qrScannerRef.current.isPaused) {
                    setTimeout(() => qrScannerRef.current.resume(), 1500);
                }
                return;
            }

            router.post(
                '/teacher/attendance/update',
                {
                    student_id: scannedStudent.id,
                    date: selectedDate,
                    status: 'Checked Out',
                    action: 'check_out',
                    method: scanMode === 'camera' ? 'QR Camera' : 'QR Upload',
                },
                {
                    preserveScroll: true,
                    onSuccess: () => {
                        setScanResult({
                            type: 'success',
                            student: scannedStudent,
                            status: 'Checked Out',
                            checkInTime: displayTimeStr,
                        });
                        if (qrScannerRef.current && qrScannerRef.current.isPaused) {
                            setTimeout(() => qrScannerRef.current.resume(), 1500);
                        }
                    },
                    onError: (err) => {
                        setScanResult({ type: 'invalid', message: 'Failed to update checkout in database.' });
                        if (qrScannerRef.current && qrScannerRef.current.isPaused) {
                            setTimeout(() => qrScannerRef.current.resume(), 1500);
                        }
                    }
                }
            );
            return;
        }

        // --- CHECK IN PROCESS ---
        if (scannedStudent.status === 'Present' || scannedStudent.status === 'Late') {
            setScanResult({
                type: 'duplicate',
                student: scannedStudent,
                checkInTime: scannedStudent.check_in_time || displayTimeStr,
                status: scannedStudent.status,
            });
            if (qrScannerRef.current && qrScannerRef.current.isPaused) {
                setTimeout(() => qrScannerRef.current.resume(), 1500);
            }
            return;
        }

        const lateDuration = calculateLateDuration(currentTimeStr, expectedArrivalTime);
        const finalStatus = lateDuration ? 'Late' : 'Present';

        router.post(
            '/teacher/attendance/update',
            {
                student_id: scannedStudent.id,
                date: selectedDate,
                status: finalStatus,
                action: 'check_in',
                method: scanMode === 'camera' ? 'QR Camera' : 'QR Upload',
            },
            {
                preserveScroll: true,
                onSuccess: () => {
                    setScanResult({
                        type: finalStatus === 'Late' ? 'late' : 'success',
                        student: scannedStudent,
                        status: finalStatus,
                        checkInTime: displayTimeStr,
                        expectedTime: expectedArrivalTime,
                        lateDuration: lateDuration,
                    });
                    if (qrScannerRef.current && qrScannerRef.current.isPaused) {
                        setTimeout(() => qrScannerRef.current.resume(), 1500);
                    }
                },
                onError: (err) => {
                    setScanResult({ type: 'invalid', message: 'Failed to update check-in in database.' });
                    if (qrScannerRef.current && qrScannerRef.current.isPaused) {
                        setTimeout(() => qrScannerRef.current.resume(), 1500);
                    }
                }
            }
        );
    };

    // File Upload Handler for QR Image Scanning
    const handleFileUpload = async (e) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setUploadError(null);
        const html5Qrcode = new Html5Qrcode('qr-upload-reader');

        try {
            const result = await html5Qrcode.scanFileV2(file, true);
            if (result && result.decodedText) {
                onQrCodeSuccess(result.decodedText);
            }
        } catch (err) {
            setUploadError('Could not read a valid QR code from this image. Please try another image.');
        } finally {
            html5Qrcode.clear();
            if (fileInputRef.current) fileInputRef.current.value = '';
        }
    };

    const handleManualStatusUpdate = (studentId, status) => {
        router.post(
            '/teacher/attendance/update',
            {
                student_id: studentId,
                date: selectedDate,
                status: status,
                action: 'check_in',
                method: 'Manual',
            },
            { preserveScroll: true }
        );
    };

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
            { preserveScroll: true }
        );
    };

    return (
        <AuthenticatedLayoutTeacher activeNavId="attendance">
            <Head title="Attendance Management - Teacher Portal" />

            <div id="qr-upload-reader" className="hidden"></div>

            <div className="space-y-6 pb-12">
                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-[#E4E6E2] shadow-xs">
                    <div>
                        <div className="flex items-center gap-2">
                            <h1 className="text-2xl font-extrabold text-[#26332A] tracking-tight">Attendance Management</h1>
                            <span className="px-2.5 py-0.5 rounded-full bg-[#7FAF8A]/15 text-[#527A5D] font-black text-xs">Live</span>
                        </div>
                        <p className="text-xs text-[#68736B] font-medium mt-1">Record and monitor daily student attendance.</p>
                    </div>

                    <div className="flex items-center gap-3 bg-[#F8F7F2] px-4 py-2.5 rounded-xl border border-[#E4E6E2]">
                        <div className="w-9 h-9 rounded-xl bg-[#527A5D] text-white flex items-center justify-center font-bold text-xs shrink-0">
                            {teacherName.charAt(0)}
                        </div>
                        <div className="flex flex-col">
                            <p className="text-xs font-bold text-[#26332A]">{teacherName} · <span className="text-[#527A5D]">{teacherClass}</span></p>
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

                {/* Nav Tabs */}
                <div className="flex flex-wrap items-center gap-2 bg-white p-2.5 rounded-2xl border border-[#E4E6E2]">
                    <button
                        onClick={() => setActiveTab('scan')}
                        className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all ${
                            activeTab === 'scan' ? 'bg-[#527A5D] text-white shadow-md' : 'text-[#68736B] hover:bg-[#F8F7F2]'
                        }`}
                    >
                        <QrCode className="w-4 h-4" /> Scan QR
                    </button>
                    <button
                        onClick={() => setActiveTab('manual')}
                        className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all ${
                            activeTab === 'manual' ? 'bg-[#527A5D] text-white shadow-md' : 'text-[#68736B] hover:bg-[#F8F7F2]'
                        }`}
                    >
                        <List className="w-4 h-4" /> Mark Manually
                    </button>
                    <button
                        onClick={() => setActiveTab('pickup')}
                        className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all ${
                            activeTab === 'pickup' ? 'bg-[#527A5D] text-white shadow-md' : 'text-[#68736B] hover:bg-[#F8F7F2]'
                        }`}
                    >
                        <PickupIcon className="w-4 h-4" /> Pickup Records
                    </button>
                </div>

                {/* Summary Metrics */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="bg-white p-4 rounded-2xl border border-[#E4E6E2] shadow-xs flex items-center justify-between">
                        <div>
                            <span className="text-[10px] font-black uppercase text-[#68736B]">Total Students</span>
                            <span className="text-2xl font-black text-[#26332A] mt-1 block">{totalStudents}</span>
                        </div>
                        <UserCheck className="w-5 h-5 text-[#527A5D]" />
                    </div>
                    <div className="bg-white p-4 rounded-2xl border border-[#E4E6E2] shadow-xs flex items-center justify-between">
                        <div>
                            <span className="text-[10px] font-black uppercase text-[#72A77D]">Present</span>
                            <span className="text-2xl font-black text-[#72A77D] mt-1 block">{presentCount}</span>
                        </div>
                        <CheckCircle2 className="w-5 h-5 text-[#72A77D]" />
                    </div>
                    <div className="bg-white p-4 rounded-2xl border border-[#E4E6E2] shadow-xs flex items-center justify-between">
                        <div>
                            <span className="text-[10px] font-black uppercase text-[#E8B85C]">Late</span>
                            <span className="text-2xl font-black text-[#E8B85C] mt-1 block">{lateCount}</span>
                        </div>
                        <Clock className="w-5 h-5 text-[#E8B85C]" />
                    </div>
                    <div className="bg-white p-4 rounded-2xl border border-[#E4E6E2] shadow-xs flex items-center justify-between">
                        <div>
                            <span className="text-[10px] font-black uppercase text-[#D97B73]">Absent</span>
                            <span className="text-2xl font-black text-[#D97B73] mt-1 block">{absentCount}</span>
                        </div>
                        <XCircle className="w-5 h-5 text-[#D97B73]" />
                    </div>
                </div>

                {/* Progress Bar */}
                <div className="bg-white p-4 rounded-2xl border border-[#E4E6E2] shadow-xs space-y-2">
                    <div className="flex items-center justify-between text-xs font-bold text-[#26332A]">
                        <span>Today's Attendance Progress</span>
                        <span>{recordedCount} / {totalStudents} ({progressPercentage}%)</span>
                    </div>
                    <div className="w-full bg-[#F8F7F2] h-2.5 rounded-full overflow-hidden border border-[#E4E6E2]">
                        <div className="bg-[#527A5D] h-full transition-all duration-500" style={{ width: `${progressPercentage}%` }} />
                    </div>
                </div>

                {/* TAB 1: QR SCANNER */}
                {activeTab === 'scan' && (
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                        {/* QR Scanner Panel */}
                        <div className="lg:col-span-6 bg-white p-6 rounded-2xl border border-[#E4E6E2] shadow-xs space-y-5">
                            <div className="flex items-center justify-between border-b border-[#E4E6E2] pb-3">
                                <div className="flex items-center gap-2">
                                    <QrCode className="w-5 h-5 text-[#527A5D]" />
                                    <h2 className="text-base font-extrabold text-[#26332A]">Scan Student QR</h2>
                                </div>

                                <div className="flex items-center gap-1 bg-[#F8F7F2] p-1 rounded-xl border border-[#E4E6E2]">
                                    <button
                                        onClick={() => {
                                            stopCamera();
                                            setScanMode('camera');
                                        }}
                                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                                            scanMode === 'camera' ? 'bg-[#527A5D] text-white' : 'text-[#68736B]'
                                        }`}
                                    >
                                        <Camera className="w-3.5 h-3.5" /> Camera
                                    </button>
                                    <button
                                        onClick={() => {
                                            stopCamera();
                                            setScanMode('upload');
                                        }}
                                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                                            scanMode === 'upload' ? 'bg-[#527A5D] text-white' : 'text-[#68736B]'
                                        }`}
                                    >
                                        <Upload className="w-3.5 h-3.5" /> Upload Image
                                    </button>
                                </div>
                            </div>

                            {scanMode === 'camera' && (
                                <>
                                    <div className="relative bg-[#26332A] rounded-2xl p-4 flex flex-col items-center justify-center min-h-[300px]">
                                        {isCameraActive ? (
                                            <div id="qr-reader" className="w-full max-w-sm rounded-xl overflow-hidden border-2 border-[#7FAF8A]" />
                                        ) : (
                                            <div className="text-center space-y-3 py-8">
                                                <Camera className="w-10 h-10 text-[#7FAF8A] mx-auto" />
                                                <p className="text-xs text-white/80 font-medium max-w-xs">
                                                    Position student QR code within frame to scan automatically.
                                                </p>
                                            </div>
                                        )}
                                    </div>

                                    {cameraError && <p className="text-xs text-[#D97B73] font-bold">{cameraError}</p>}

                                    <button
                                        onClick={isCameraActive ? stopCamera : () => setIsCameraActive(true)}
                                        className={`w-full py-3 text-white font-extrabold text-xs uppercase rounded-xl transition-all ${
                                            isCameraActive ? 'bg-[#D97B73]' : 'bg-[#527A5D]'
                                        }`}
                                    >
                                        {isCameraActive ? 'Stop Camera' : 'Start Camera'}
                                    </button>
                                </>
                            )}

                            {scanMode === 'upload' && (
                                <div className="space-y-4">
                                    <div
                                        onClick={() => fileInputRef.current?.click()}
                                        className="border-2 border-dashed border-[#7FAF8A] bg-[#F8F7F2] rounded-2xl p-8 flex flex-col items-center justify-center cursor-pointer hover:bg-[#7FAF8A]/10 transition-all text-center min-h-[300px]"
                                    >
                                        <FileImage className="w-12 h-12 text-[#527A5D] mb-3" />
                                        <p className="text-sm font-extrabold text-[#26332A]">Click or drop image to upload QR code</p>
                                        <p className="text-xs text-[#68736B] font-medium mt-1">Supports PNG, JPG, JPEG, WEBP formats</p>
                                        <input
                                            ref={fileInputRef}
                                            type="file"
                                            accept="image/*"
                                            onChange={handleFileUpload}
                                            className="hidden"
                                        />
                                    </div>

                                    {uploadError && <p className="text-xs text-[#D97B73] font-bold text-center">{uploadError}</p>}
                                </div>
                            )}

                            {scanResult && (
                                <div
                                    className={`p-4 rounded-xl border text-xs font-bold ${
                                        scanResult.type === 'success'
                                            ? 'bg-[#72A77D]/15 border-[#72A77D] text-[#26332A]'
                                            : scanResult.type === 'late'
                                            ? 'bg-[#E8B85C]/15 border-[#E8B85C] text-[#26332A]'
                                            : 'bg-[#D97B73]/15 border-[#D97B73] text-[#26332A]'
                                    }`}
                                >
                                    {scanResult.type === 'invalid' && <p>{scanResult.message}</p>}
                                    {scanResult.type === 'duplicate' && (
                                        <p>
                                            {scanResult.student?.name} has already checked in as {scanResult.status} at {scanResult.checkInTime}.
                                        </p>
                                    )}
                                    {(scanResult.type === 'success' || scanResult.type === 'late') && (
                                        <p>
                                            Recorded {scanResult.student?.name} as {scanResult.status} at {scanResult.checkInTime}.
                                            {scanResult.lateDuration ? ` (${scanResult.lateDuration} late)` : ''}
                                        </p>
                                    )}
                                </div>
                            )}
                        </div>

                        {/* Verification List Panel */}
                        <div className="lg:col-span-6 bg-white p-6 rounded-2xl border border-[#E4E6E2] shadow-xs space-y-4">
                            <div className="flex items-center justify-between border-b border-[#E4E6E2] pb-3">
                                <div className="flex items-center gap-2">
                                    <button
                                        onClick={() => handleTabChange('checkin')}
                                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-extrabold text-xs transition-all ${
                                            scanTypeTab === 'checkin'
                                                ? 'bg-[#527A5D] text-white shadow-xs'
                                                : 'bg-[#F8F7F2] text-[#68736B] hover:text-[#26332A]'
                                        }`}
                                    >
                                        <LogIn className="w-3.5 h-3.5" /> Check-In List
                                    </button>
                                    <button
                                        onClick={() => handleTabChange('checkout')}
                                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-extrabold text-xs transition-all ${
                                            scanTypeTab === 'checkout'
                                                ? 'bg-[#527A5D] text-white shadow-xs'
                                                : 'bg-[#F8F7F2] text-[#68736B] hover:text-[#26332A]'
                                        }`}
                                    >
                                        <LogOut className="w-3.5 h-3.5" /> Check-Out List
                                    </button>
                                </div>

                                <span className="text-[10px] font-black uppercase text-[#68736B]">
                                    {students.length} Students
                                </span>
                            </div>

                            <div className="space-y-2.5 max-h-[420px] overflow-y-auto pr-1">
                                {students.length === 0 ? (
                                    <p className="text-xs text-[#68736B] italic py-8 text-center">No students registered in this class.</p>
                                ) : (
                                    students.map((student) => {
                                        const isCheckedIn = student.status === 'Present' || student.status === 'Late';
                                        const isCheckedOut = Boolean(student.check_out_time);

                                        return (
                                            <div
                                                key={student.id}
                                                className="flex items-center justify-between p-3.5 bg-[#F8F7F2] rounded-xl border border-[#E4E6E2] text-xs transition-all hover:border-[#7FAF8A]"
                                            >
                                                <div className="space-y-0.5">
                                                    <p className="font-extrabold text-[#26332A]">{student.name}</p>
                                                    <div className="flex items-center gap-2 text-[10px] text-[#68736B] font-semibold">
                                                        <span>
                                                            {scanTypeTab === 'checkin'
                                                                ? `Check-In: ${student.check_in_time || 'Not recorded'}`
                                                                : `Check-Out: ${student.check_out_time || 'Not recorded'}`}
                                                        </span>
                                                        {student.method && (
                                                            <span className="px-1.5 py-0.2 rounded bg-white border border-[#E4E6E2]">
                                                                {student.method}
                                                            </span>
                                                        )}
                                                    </div>
                                                </div>

                                                {scanTypeTab === 'checkin' && (
                                                    <div>
                                                        {isCheckedIn ? (
                                                            <div className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-[#72A77D]/15 text-[#72A77D] font-extrabold text-xs">
                                                                <CheckCircle2 className="w-3.5 h-3.5" />
                                                                <span>Verified</span>
                                                            </div>
                                                        ) : (
                                                            <button
                                                                onClick={() => handleManualStatusUpdate(student.id, 'Present')}
                                                                className="px-3 py-1.5 bg-[#527A5D] hover:bg-[#3D5C46] text-white font-extrabold text-xs rounded-xl shadow-xs transition-all"
                                                            >
                                                                Verify
                                                            </button>
                                                        )}
                                                    </div>
                                                )}

                                                {scanTypeTab === 'checkout' && (
                                                    <div>
                                                        {isCheckedOut ? (
                                                            <div className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-[#527A5D]/15 text-[#527A5D] font-extrabold text-xs">
                                                                <CheckCircle2 className="w-3.5 h-3.5" />
                                                                <span>Verified Out</span>
                                                            </div>
                                                        ) : (
                                                            <button
                                                                onClick={() => handleManualCheckout(student.id)}
                                                                disabled={!isCheckedIn}
                                                                className={`px-3 py-1.5 font-extrabold text-xs rounded-xl transition-all shadow-xs ${
                                                                    isCheckedIn
                                                                        ? 'bg-[#D97B73] hover:bg-[#B85C54] text-white'
                                                                        : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                                                                }`}
                                                            >
                                                                Verify Out
                                                            </button>
                                                        )}
                                                    </div>
                                                )}
                                            </div>
                                        );
                                    })
                                )}
                            </div>
                        </div>
                    </div>
                )}

                {/* SEARCH & FILTERS BAR */}
                {(activeTab === 'manual' || activeTab === 'pickup') && (
                    <div className="bg-white p-4 rounded-2xl border border-[#E4E6E2] shadow-xs flex flex-col md:flex-row items-center gap-3">
                        <div className="relative flex-1 w-full">
                            <Search className="w-4 h-4 absolute left-3.5 top-3 text-[#68736B]" />
                            <input
                                type="text"
                                placeholder={activeTab === 'manual' ? "Search student by name or MyKid..." : "Search student or guardian name..."}
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full pl-10 pr-4 py-2 bg-[#F8F7F2] border border-[#E4E6E2] rounded-xl text-xs font-medium"
                            />
                        </div>
                        {activeTab === 'manual' && (
                            <div className="flex items-center gap-2 w-full md:w-auto">
                                <select
                                    value={selectedStatusFilter}
                                    onChange={(e) => setSelectedStatusFilter(e.target.value)}
                                    className="px-3 py-2 bg-[#F8F7F2] border border-[#E4E6E2] rounded-xl text-xs font-bold"
                                >
                                    <option value="All">All Statuses</option>
                                    <option value="Present">Present</option>
                                    <option value="Late">Late</option>
                                    <option value="Absent">Absent</option>
                                </select>
                            </div>
                        )}
                    </div>
                )}

                {/* TAB 2: MARK MANUALLY */}
                {activeTab === 'manual' && (
                    <div className="bg-white rounded-2xl border border-[#E4E6E2] shadow-xs overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="w-full text-left text-xs">
                                <thead className="bg-[#F8F7F2] text-[#68736B] font-extrabold uppercase border-b border-[#E4E6E2]">
                                    <tr>
                                        <th className="py-3 px-4">Student</th>
                                        <th className="py-3 px-4">Status</th>
                                        <th className="py-3 px-4">Check-In</th>
                                        <th className="py-3 px-4">Check-Out</th>
                                        <th className="py-3 px-4 text-right">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-[#E4E6E2]">
                                    {filteredStudents.length === 0 ? (
                                        <tr>
                                            <td colSpan="5" className="py-8 text-center text-[#68736B] italic">No students found.</td>
                                        </tr>
                                    ) : (
                                        filteredStudents.map((student) => (
                                            <tr key={student.id} className="hover:bg-[#F8F7F2]/60">
                                                <td className="py-3 px-4 font-bold text-[#26332A]">
                                                    {student.name}
                                                    <span className="block text-[10px] text-[#68736B]">MyKid: {student.mykid || 'N/A'}</span>
                                                </td>
                                                <td className="py-3 px-4">
                                                    <span
                                                        className={`px-2.5 py-1 rounded-full font-black text-[10px] ${
                                                            student.status === 'Present'
                                                                ? 'bg-[#72A77D]/15 text-[#72A77D]'
                                                                : student.status === 'Late'
                                                                ? 'bg-[#E8B85C]/15 text-[#E8B85C]'
                                                                : 'bg-[#D97B73]/15 text-[#D97B73]'
                                                        }`}
                                                    >
                                                        {student.status || 'Absent'}
                                                    </span>
                                                </td>
                                                <td className="py-3 px-4 font-semibold">{student.check_in_time || '-'}</td>
                                                <td className="py-3 px-4 font-semibold">{student.check_out_time || '-'}</td>
                                                <td className="py-3 px-4 text-right space-x-1">
                                                    {student.status && student.status !== 'Absent' && !student.check_out_time ? (
                                                        <button
                                                            onClick={() => handleManualCheckout(student.id)}
                                                            className="px-2.5 py-1 bg-[#D97B73]/15 text-[#D97B73] hover:bg-[#D97B73] hover:text-white rounded-lg font-bold text-[10px] transition-all"
                                                        >
                                                            Check Out
                                                        </button>
                                                    ) : (
                                                        <>
                                                            <button
                                                                onClick={() => handleManualStatusUpdate(student.id, 'Present')}
                                                                className="px-2 py-1 bg-[#72A77D]/10 text-[#72A77D] hover:bg-[#72A77D] hover:text-white rounded-lg font-bold text-[10px] transition-all"
                                                            >
                                                                Present
                                                            </button>
                                                            <button
                                                                onClick={() => handleManualStatusUpdate(student.id, 'Late')}
                                                                className="px-2 py-1 bg-[#E8B85C]/10 text-[#E8B85C] hover:bg-[#E8B85C] hover:text-white rounded-lg font-bold text-[10px] transition-all"
                                                            >
                                                                Late
                                                            </button>
                                                            <button
                                                                onClick={() => handleManualStatusUpdate(student.id, 'Absent')}
                                                                className="px-2 py-1 bg-[#D97B73]/10 text-[#D97B73] hover:bg-[#D97B73] hover:text-white rounded-lg font-bold text-[10px] transition-all"
                                                            >
                                                                Absent
                                                            </button>
                                                        </>
                                                    )}
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}

                {/* TAB 3: PICKUP RECORDS */}
                {activeTab === 'pickup' && (
                    <div className="bg-white rounded-2xl border border-[#E4E6E2] shadow-xs overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="w-full text-left text-xs">
                                <thead className="bg-[#F8F7F2] text-[#68736B] font-extrabold uppercase border-b border-[#E4E6E2]">
                                    <tr>
                                        <th className="py-3 px-4">Student</th>
                                        <th className="py-3 px-4">Actual Pickup Time</th>
                                        <th className="py-3 px-4">Late Duration</th>
                                        <th className="py-3 px-4">Status</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-[#E4E6E2]">
                                    {filteredPickups.length === 0 ? (
                                        <tr>
                                            <td colSpan="4" className="py-8 text-center text-[#68736B] italic">No pickup records found for this date.</td>
                                        </tr>
                                    ) : (
                                        filteredPickups.map((pickup, idx) => (
                                            <tr key={idx} className="hover:bg-[#F8F7F2]/60">
                                                <td className="py-3 px-4 font-bold text-[#26332A]">
                                                    {pickup.student_name}
                                                </td>
                                                <td className="py-3 px-4 font-semibold text-[#26332A]">
                                                    {pickup.actual_pickup_time || '-'}
                                                </td>
                                                <td className="py-3 px-4 font-semibold text-[#D97B73]">
                                                    {pickup.late_duration || '-'}
                                                </td>
                                                <td className="py-3 px-4">
                                                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full font-extrabold text-[10px] bg-[#D97B73]/10 text-[#D97B73]">
                                                        <ShieldCheck className="w-3 h-3" />
                                                        Late Pickup Fee Billed
                                                    </span>
                                                </td>
                                            </tr>
                                        ))
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
