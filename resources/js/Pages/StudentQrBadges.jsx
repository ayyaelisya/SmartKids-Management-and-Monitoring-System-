import React, { useMemo, useState } from 'react';
import { Head } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Search, Printer, Download, UserRound } from 'lucide-react';
import QRCode from 'react-qr-code';

export default function StudentQrBadges({
    students = [],
    logoUrl = '',
}) {
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedClass, setSelectedClass] = useState('All');
    const [printingStudentId, setPrintingStudentId] = useState(null);

    const classes = useMemo(() => {
        return [
            'All',
            ...new Set(
                students
                    .map((student) => student.class_name)
                    .filter(Boolean)
            ),
        ];
    }, [students]);

    const filteredStudents = useMemo(() => {
        const keyword = searchQuery.trim().toLowerCase();

        return students.filter((student) => {
            const name = student.full_name || student.name || '';
            const id = String(
                student.student_id || student.id || ''
            );

            const matchesSearch =
                name.toLowerCase().includes(keyword) ||
                id.includes(keyword);

            const matchesClass =
                selectedClass === 'All' ||
                student.class_name === selectedClass;

            return matchesSearch && matchesClass;
        });
    }, [students, searchQuery, selectedClass]);

    const handlePrint = (studentId = null) => {
        setPrintingStudentId(studentId);

        // Tunggu React kemas kini kad yang akan dicetak.
        window.setTimeout(() => {
            window.print();
        }, 250);
    };

    return (
        <AuthenticatedLayout activeNavId="attendance">
            <Head title="Tinta Tots Clubhouse - Student QR Cards" />

            <style>{`
                /* PAPARAN BIASA */
                .student-card {
                    position: relative;
                    width: 100%;
                    max-width: 380px;
                    aspect-ratio: 210 / 297;
                    overflow: hidden;
                    border-radius: 20px;
                    background: #fff6de;
                    color: #302951;
                    box-shadow: 0 12px 28px rgba(57, 47, 105, 0.14);
                }

                .student-card-frame {
                    position: absolute;
                    inset: 5%;
                    z-index: 3;
                    border: 2px solid #514192;
                    border-radius: 25px;
                    pointer-events: none;
                }

                .student-card-side-name {
                    writing-mode: vertical-rl;
                    transform: rotate(180deg);
                }

                .student-card-photo {
                    width: 48%;
                    aspect-ratio: 1;
                    overflow: hidden;
                    border: 6px solid #ffffff;
                    border-radius: 50%;
                    background: #e9d3ef;
                    box-shadow: 9px 10px 0 #4b3c8f;
                }

                .student-card-name {
                    display: flex;
                    width: 74%;
                    min-height: 10%;
                    align-items: center;
                    justify-content: center;
                    padding: 3% 5%;
                    border: 2px solid #302951;
                    border-radius: 17px;
                    background: white;
                    box-shadow: 6px 7px 0 #f28c75;
                    text-align: center;
                }

                .student-card-qr {
                    display: flex;
                    width: 28%;
                    aspect-ratio: 1;
                    align-items: center;
                    justify-content: center;
                    padding: 2%;
                    border: 2px solid #302951;
                    border-radius: 15px;
                    background: white;
                    box-shadow: 6px 7px 0 #c6adf5;
                }

                /* CETAKAN SAHAJA */
                @media print {
                    @page {
                        size: A4 portrait;
                        margin: 0;
                    }

                    html,
                    body,
                    #app {
                        width: 210mm !important;
                        margin: 0 !important;
                        padding: 0 !important;
                        background: white !important;
                        -webkit-print-color-adjust: exact !important;
                        print-color-adjust: exact !important;
                    }

                    body * {
                        visibility: hidden !important;
                    }

                    .student-print-area,
                    .student-print-area * {
                        visibility: visible !important;
                    }

                    .student-print-area {
                        position: absolute !important;
                        top: 0 !important;
                        left: 0 !important;
                        display: block !important;
                        width: 210mm !important;
                        margin: 0 !important;
                        padding: 0 !important;
                    }

                    .student-print-page {
                        display: flex !important;
                        width: 210mm !important;
                        height: 297mm !important;
                        max-width: none !important;
                        align-items: center !important;
                        justify-content: center !important;
                        margin: 0 !important;
                        padding: 0 !important;
                        box-sizing: border-box !important;
                        break-inside: avoid !important;
                        page-break-inside: avoid !important;
                    }

                    .student-print-page + .student-print-page {
                        break-before: page !important;
                        page-break-before: always !important;
                    }

                    .student-card {
                        display: block !important;
                        width: 185mm !important;
                        max-width: none !important;
                        height: 262mm !important;
                        flex: none !important;
                        aspect-ratio: auto !important;
                        margin: 0 !important;
                        border-radius: 5mm !important;
                        box-shadow: none !important;
                        overflow: hidden !important;
                    }

                    .student-card-name p {
                        font-size: 24pt !important;
                        line-height: 1.15 !important;
                    }

                    .student-card-class {
                        font-size: 16pt !important;
                    }

                    .student-card-id {
                        font-size: 11pt !important;
                    }

                    .student-card-school {
                        font-size: 22pt !important;
                    }

                    .student-card-subtitle {
                        font-size: 10pt !important;
                    }

                    .student-card-qr {
                        width: 28% !important;
                    }

                    .student-card-bottom-text {
                        font-size: 14pt !important;
                    }

                    .hide-on-print,
                    .hide-on-print *,
                    .no-print,
                    .no-print * {
                        display: none !important;
                        visibility: hidden !important;
                    }
                }
            `}</style>

            <div className="mx-auto max-w-7xl space-y-6 p-4 text-[#302951]">
                {/* HEADER */}
                <div className="no-print flex flex-col justify-between gap-4 rounded-2xl bg-white p-5 shadow-sm sm:flex-row sm:items-center">
                    <div>
                        <h1 className="text-2xl font-extrabold">
                            Student QR Cards
                        </h1>

                        <p className="mt-1 text-sm text-slate-500">
                            Print student identification cards for attendance.
                        </p>
                    </div>

                    <button
                        type="button"
                        onClick={() => handlePrint(null)}
                        disabled={filteredStudents.length === 0}
                        className="flex items-center justify-center gap-2 rounded-xl bg-[#7466C8] px-5 py-3 text-sm font-bold text-white hover:bg-[#514A82] disabled:opacity-50"
                    >
                        <Printer className="h-4 w-4" />
                        Print All Cards
                    </button>
                </div>

                {/* SEARCH AND CLASS FILTER */}
                <div className="no-print flex flex-col gap-3 rounded-2xl bg-white p-4 shadow-sm sm:flex-row sm:justify-between">
                    <div className="relative w-full sm:w-80">
                        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />

                        <input
                            type="text"
                            placeholder="Search student name or ID..."
                            value={searchQuery}
                            onChange={(event) =>
                                setSearchQuery(event.target.value)
                            }
                            className="w-full rounded-xl border border-[#E2DFEE] bg-[#F7F6FC] py-2 pl-9 pr-3 text-sm focus:border-[#7466C8] focus:outline-none"
                        />
                    </div>

                    <select
                        value={selectedClass}
                        onChange={(event) =>
                            setSelectedClass(event.target.value)
                        }
                        className="rounded-xl border border-[#E2DFEE] bg-[#F7F6FC] px-4 py-2 text-sm"
                    >
                        {classes.map((className) => (
                            <option
                                key={className}
                                value={className}
                            >
                                {className === 'All'
                                    ? 'All Classes'
                                    : className}
                            </option>
                        ))}
                    </select>
                </div>

                {filteredStudents.length === 0 ? (
                    <div className="no-print rounded-2xl bg-white p-10 text-center text-slate-500">
                        No active students found.
                    </div>
                ) : (
                    <div className="student-print-area grid grid-cols-1 justify-items-center gap-8 md:grid-cols-2 xl:grid-cols-3">
                        {filteredStudents.map((student) => {
                            const studentId =
                                student.student_id || student.id;

                            const studentName =
                                student.full_name ||
                                student.name ||
                                'Student';

                            const qrValue =
                                student.qr_code_token ||
                                String(studentId);

                            const hiddenForSinglePrint =
                                printingStudentId !== null &&
                                String(printingStudentId) !==
                                    String(studentId);

                            return (
                                <div
                                    key={studentId}
                                    className={`w-full max-w-[380px] ${
                                        hiddenForSinglePrint
                                            ? 'hide-on-print'
                                            : 'student-print-page'
                                    }`}
                                >
                                    <div className="student-card">
                                        {/* BACKGROUND */}
                                        <div className="absolute inset-0 bg-[#FFF6DE]" />

                                        <div className="absolute left-0 top-0 h-[22%] w-full bg-[#7466C8]" />

                                        <div className="absolute -left-[13%] top-[17%] h-[20%] w-[45%] rounded-full bg-[#F6A7BB]" />

                                        <div className="absolute -right-[13%] top-[39%] h-[22%] w-[45%] rounded-full bg-[#F28C75]" />

                                        <div className="absolute bottom-0 left-0 h-[16%] w-full bg-[#7466C8]" />

                                        {/* DECORATION */}
                                        <div className="absolute left-[8%] top-[39%] h-[6%] w-[6%] rotate-12 rounded-lg bg-[#F28C75]" />

                                        <div className="absolute right-[13%] top-[24%] h-[4%] w-[4%] rounded-full bg-white" />

                                        <div className="absolute bottom-[20%] left-[11%] h-[4%] w-[4%] rounded-full bg-[#F6A7BB]" />

                                        <div className="student-card-frame" />

                                        {/* KINDERGARTEN NAME AT THE SIDE */}
                                        <div className="student-card-side-name absolute right-[1.5%] top-[31%] z-10 text-[10px] font-black uppercase tracking-[0.18em] text-[#514192]">
                                            Tinta Tots Clubhouse
                                        </div>

                                        {/* HEADER WITH LOGO */}
                                        <div className="absolute left-[11%] top-[8%] z-10 flex w-[78%] items-center gap-3">
                                            <div className="flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-full border-[3px] border-white bg-white shadow-md">
                                                {logoUrl ? (
                                                    <img
                                                        src={logoUrl}
                                                        alt="Tinta Tots Clubhouse logo"
                                                        className="h-full w-full object-contain"
                                                    />
                                                ) : (
                                                    <span className="text-lg font-black text-[#514192]">
                                                        TT
                                                    </span>
                                                )}
                                            </div>

                                            <div className="min-w-0 text-white">
                                                <p className="student-card-school text-[18px] font-black leading-tight">
                                                    Tinta Tots Clubhouse
                                                </p>

                                                <p className="student-card-subtitle mt-1 text-[9px] font-bold uppercase tracking-[0.15em]">
                                                    Student Identity Card
                                                </p>
                                            </div>
                                        </div>

                                        {/* PROFILE PHOTO */}
                                        <div className="student-card-photo absolute left-1/2 top-[22%] z-10 flex -translate-x-1/2 items-center justify-center">
                                            {student.profile_image_url ? (
                                                <img
                                                    src={
                                                        student.profile_image_url
                                                    }
                                                    alt={`Photo of ${studentName}`}
                                                    className="h-full w-full object-cover"
                                                />
                                            ) : (
                                                <UserRound className="h-1/2 w-1/2 text-[#7466C8]" />
                                            )}
                                        </div>

                                        {/* NAME */}
                                        <div className="student-card-name absolute left-1/2 top-[53%] z-10 -translate-x-1/2">
                                            <p className="break-words text-[17px] font-black leading-tight">
                                                {studentName}
                                            </p>
                                        </div>

                                        {/* CLASS AND ID */}
                                        <div className="absolute left-1/2 top-[66%] z-10 w-[72%] -translate-x-1/2 text-center">
                                            <p className="student-card-class text-[12px] font-extrabold text-[#514192]">
                                                {student.class_name ||
                                                    'Class N/A'}
                                            </p>

                                            <p className="student-card-id mt-1 text-[10px] font-bold text-[#736C8C]">
                                                STUDENT ID: {studentId}
                                            </p>
                                        </div>

                                        {/* QR CODE */}
                                        <div className="student-card-qr absolute left-1/2 top-[70%] z-10 -translate-x-1/2">
                                            <QRCode
                                                value={qrValue}
                                                size={180}
                                                level="H"
                                                style={{
                                                    width: '100%',
                                                    height: '100%',
                                                }}
                                                bgColor="#FFFFFF"
                                                fgColor="#302951"
                                            />
                                        </div>

                                        {/* FOOTER */}
                                        <div className="student-card-bottom-text absolute bottom-[5%] left-0 z-10 w-full text-center text-[11px] font-bold tracking-wide text-white">
                                            Scan QR for attendance
                                        </div>
                                    </div>

                                    <button
                                        type="button"
                                        onClick={() =>
                                            handlePrint(studentId)
                                        }
                                        className="no-print mt-3 flex items-center gap-2 text-sm font-bold text-[#7466C8] hover:underline"
                                    >
                                        <Download className="h-4 w-4" />
                                        Print Card
                                    </button>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        </AuthenticatedLayout>
    );
}
