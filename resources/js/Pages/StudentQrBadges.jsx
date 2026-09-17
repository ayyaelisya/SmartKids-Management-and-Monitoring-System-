import React, { useState } from 'react';
import { Head } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Search, Printer, Download } from 'lucide-react';
import QRCode from 'react-qr-code';

export default function StudentQrBadges({ students = [] }) {
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedClass, setSelectedClass] = useState('All');
    const [printingStudentId, setPrintingStudentId] = useState(null);

    const filteredStudents = students.filter(student => {
        const studentName = student.full_name || student.name || '';
        const matchesSearch = studentName.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesClass = selectedClass === 'All' || student.class_name === selectedClass;
        return matchesSearch && matchesClass;
    });

    const handlePrintAll = () => {
        setPrintingStudentId(null);
        setTimeout(() => {
            window.print();
        }, 100);
    };

    const handlePrintSingle = (studentId) => {
        setPrintingStudentId(studentId);
        setTimeout(() => {
            window.print();
        }, 100);
    };

    return (
        <AuthenticatedLayout activeNavId="attendance">
            <Head title="Smart Kids - Student QR Badges" />

            {/* GAYA CETAKAN PENUH SKRIN (A4 FULL PAGE) */}
            <style>{`
                @media print {
                    @page {
                        size: A4 portrait;
                        margin: 0;
                    }

                    body * {
                        visibility: hidden;
                    }

                    .print-area, .print-area * {
                        visibility: visible;
                    }

                    .print-area {
                        position: fixed;
                        inset: 0;
                        width: 100vw;
                        height: 100vh;
                        display: flex !important;
                        align-items: center;
                        justify-content: center;
                        padding: 2rem;
                        box-sizing: border-box;
                        background: #ffffff;
                    }

                    /* Besarkan Kad untuk Penuh Skrin */
                    .print-card {
                        width: 85% !important;
                        max-width: 500px !important;
                        height: 80% !important;
                        max-height: 750px !important;
                        border: 4px solid #6C63A8 !important;
                        border-radius: 40px !important;
                        padding: 3rem 2rem !important;
                        display: flex !important;
                        flex-direction: column !important;
                        justify-content: space-between !important;
                        align-items: center !important;
                        box-shadow: none !important;
                    }

                    /* Besarkan Saiz QR Code */
                    .print-card svg {
                        width: 260px !important;
                        height: 260px !important;
                    }

                    /* Besarkan Saiz Teks */
                    .print-card h3 {
                        font-size: 2rem !important;
                        line-height: 2.25rem !important;
                    }

                    .print-card p {
                        font-size: 1.25rem !important;
                    }

                    .no-print {
                        display: none !important;
                    }
                }
            `}</style>

            <div className="max-w-7xl mx-auto space-y-6 font-sans text-[#2D3142]">

                {/* HEADER SECTION */}
                <div className="no-print flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-3xl shadow-sm border border-slate-100">
                    <div>
                        <h1 className="text-2xl sm:text-3xl font-extrabold text-[#2D3142] tracking-tight">
                            Student QR Badges
                        </h1>
                        <p className="text-sm font-medium text-[#6B7280] mt-1">
                            Generate and print QR code ID badges for student attendance check-in.
                        </p>
                    </div>

                    <button
                        onClick={handlePrintAll}
                        className="flex items-center gap-2 bg-[#6C63A8] text-white px-5 py-2.5 rounded-2xl font-bold text-xs hover:bg-[#5b5391] transition-all shadow-md self-start md:self-auto cursor-pointer"
                    >
                        <Printer className="w-4 h-4" />
                        Print All Badges
                    </button>
                </div>

                {/* SEARCH BAR */}
                <div className="no-print bg-white p-4 rounded-3xl shadow-sm border border-slate-100 flex flex-col sm:flex-row gap-3 items-center justify-between">
                    <div className="relative w-full sm:w-80">
                        <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                        <input
                            type="text"
                            placeholder="Search student name..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 bg-[#F7F6FC] border-none rounded-2xl text-xs font-medium text-[#2D3142] focus:outline-none focus:ring-2 focus:ring-[#6C63A8]"
                        />
                    </div>
                </div>

                {/* QR BADGES GRID */}
                <div className="print-area grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                    {filteredStudents.length === 0 ? (
                        <div className="col-span-full bg-white p-12 text-center text-slate-400 rounded-3xl border border-slate-100 no-print">
                            No students found for QR badge generation.
                        </div>
                    ) : (
                        filteredStudents.map((student, idx) => {
                            const displayName = student.full_name || student.name || 'Student';
                            const studentIdKey = student.student_id || student.id || idx;
                            // After (Encodes token explicitly or falls back to ID):
                            const qrValue = student.qr_code_token || String(studentIdKey);
                            const isHiddenFromPrint = printingStudentId !== null && printingStudentId !== studentIdKey;

                            return (
                                <div
                                    key={studentIdKey}
                                    className={`print-card bg-white p-6 rounded-3xl border border-slate-100 shadow-sm flex flex-col items-center text-center space-y-4 hover:shadow-md transition-shadow relative overflow-hidden ${
                                        isHiddenFromPrint ? 'no-print' : ''
                                    }`}
                                >
                                    <div className="w-full bg-[#6C63A8] text-white py-1.5 rounded-xl text-[10px] font-black uppercase tracking-wider">
                                        Smart Kids ID
                                    </div>

                                    <div className="w-16 h-16 rounded-2xl bg-[#EAE8F6] text-[#6C63A8] font-extrabold flex items-center justify-center text-xl shadow-inner">
                                        {displayName.charAt(0).toUpperCase()}
                                    </div>

                                    <div>
                                        <h3 className="font-extrabold text-[#2D3142] text-sm leading-snug">{displayName}</h3>
                                        <p className="text-xs font-bold text-[#6C63A8] mt-0.5">{student.class_name || 'Class N/A'}</p>
                                        <p className="text-[10px] text-slate-400 mt-0.5">ID: {studentIdKey}</p>
                                    </div>

                                    {/* QR Code */}
                                    <div className="p-3 bg-white rounded-2xl border border-slate-200 flex items-center justify-center shadow-inner">
                                        <QRCode
                                            value={qrValue}
                                            size={112}
                                            level="H"
                                        />
                                    </div>

                                    {/* Butang Print Individu */}
                                    <button
                                        onClick={() => handlePrintSingle(studentIdKey)}
                                        className="no-print flex items-center gap-1.5 text-[11px] font-bold text-[#6C63A8] hover:underline pt-2 cursor-pointer"
                                    >
                                        <Download className="w-3.5 h-3.5" />
                                        Print Badge
                                    </button>
                                </div>
                            );
                        })
                    )}
                </div>

            </div>
        </AuthenticatedLayout>
    );
}
