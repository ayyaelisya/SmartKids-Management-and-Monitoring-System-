import React, { useState } from 'react';
import { Head, Link, usePage } from '@inertiajs/react';
import { CreditCard, CheckCircle2, Clock, Receipt, User } from 'lucide-react';
import axios from 'axios';

export default function ParentFeeManagement({ fees = [] }) {
    const { auth } = usePage().props ? { auth: usePage().props.auth } : { auth: {} };
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [loadingId, setLoadingId] = useState(null);

    const navItems = [
        { name: 'Home', icon: '🏠', href: '/parent/dashboard', active: false },
        { name: 'My Children', icon: '👶', href: '/parent/children', active: false },
        { name: 'Learning Logs', icon: '📖', href: '/parent/learning-log', active: false },
        { name: 'Attendance History', icon: '📅', href: '/parent/attendance', active: false },
        { name: 'Invoices & Fees', icon: '💳', href: '/parent/fees', active: true },
        { name: 'Announcements', icon: '📢', href: '/parent/announcements', active: false },
    ];

    const handleCheckout = async (feeId) => {
        setLoadingId(feeId);

        try {
            const response = await axios.post('/parent/fees/checkout', {
                fee_id: feeId
            });

            // Redirect pengguna ke pautan pembayaran ToyyibPay
            if (response.data && response.data.payment_url) {
                window.location.href = response.data.payment_url;
            } else {
                alert('Gagal mendapatkan pautan pembayaran.');
                setLoadingId(null);
            }
        } catch (error) {
            console.error('Checkout Error:', error.response?.data || error);

            const errorMessage = error.response?.data?.error
                || error.response?.data?.message
                || 'Berlaku ralat semasa menghubungi sistem pembayaran.';

            alert(errorMessage);
            setLoadingId(null);
        }
    };

    return (
        <div className="min-h-screen bg-slate-50 text-slate-800 flex flex-col md:flex-row font-sans relative">
            <Head title="Fee Management - Smart Kids" />

            {/* Mobile Navigation Header */}
            <div className="md:hidden bg-white border-b border-slate-200 px-4 py-3 flex items-center justify-between sticky top-0 z-30 shadow-sm">
                <div className="flex items-center gap-3">
                    <img src="/images/logo.jpg" alt="Logo" className="w-9 h-9 rounded-xl object-cover" onError={(e) => { e.target.style.display = 'none'; }} />
                    <div>
                        <h2 className="text-sm font-black text-slate-900 leading-none">Parent Portal</h2>
                        <span className="text-[10px] text-amber-600 font-bold uppercase">Smart Kids</span>
                    </div>
                </div>
                <button
                    onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                    className="p-2 text-slate-600 hover:text-slate-900 focus:outline-none"
                >
                    <span className="text-xl">{isMobileMenuOpen ? '✕' : '☰'}</span>
                </button>
            </div>

            {/* Sidebar Navigation */}
            <aside
                className={`fixed inset-y-0 left-0 z-40 w-72 bg-white border-r border-slate-200 p-5 flex flex-col justify-between transition-transform duration-300 transform md:relative md:translate-x-0 md:w-80 shrink-0 shadow-lg md:shadow-none ${
                    isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
                }`}
            >
                <div>
                    <div className="hidden md:flex bg-slate-100/80 border border-slate-200 rounded-2xl p-4 mb-6 items-center gap-3">
                        <img src="/images/logo.jpg" alt="Logo" className="w-12 h-12 rounded-xl object-cover shadow-md shrink-0" onError={(e) => { e.target.style.display = 'none'; }} />
                        <div className="min-w-0">
                            <h2 className="text-base font-black text-slate-900 leading-tight">Smart Kids</h2>
                            <p className="text-[10px] text-emerald-600 font-bold tracking-wider uppercase mt-0.5">Parent Portal</p>
                        </div>
                    </div>

                    <nav className="space-y-1.5">
                        {navItems.map((item) => (
                            <Link
                                key={item.name}
                                href={item.href}
                                onClick={() => setIsMobileMenuOpen(false)}
                                className={`w-full flex items-center gap-3.5 px-4 py-2.5 rounded-2xl font-bold text-sm transition-all ${
                                    item.active
                                        ? 'bg-amber-400 text-amber-950 shadow-md shadow-amber-400/20'
                                        : 'text-slate-600 hover:text-amber-600 hover:bg-slate-100/80'
                                }`}
                            >
                                <span className="text-base">{item.icon}</span>
                                <span>{item.name}</span>
                            </Link>
                        ))}
                    </nav>
                </div>

                <div className="pt-6 border-t border-slate-200 mt-6">
                    <Link href="/logout" method="post" as="button" className="w-full flex items-center gap-3.5 px-4 py-2.5 rounded-xl font-bold text-sm text-rose-600 hover:bg-rose-50 transition-all text-left">
                        <span>🚪</span> <span>Logout</span>
                    </Link>
                </div>
            </aside>

            {/* Mobile Overlay */}
            {isMobileMenuOpen && <div onClick={() => setIsMobileMenuOpen(false)} className="fixed inset-0 bg-slate-900/40 z-30 md:hidden" />}

            {/* Main Content Area */}
            <main className="flex-1 flex flex-col min-w-0 bg-slate-50">
                <header className="hidden md:flex h-20 bg-white border-b border-slate-200 px-8 items-center justify-between sticky top-0 z-20 shadow-sm">
                    <div>
                        <span className="text-xs font-bold text-amber-600 uppercase tracking-wider">Payment & Invoices</span>
                        <h1 className="text-lg font-black text-slate-900">Fee Management</h1>
                    </div>
                    <div className="flex items-center gap-3 bg-slate-100 px-3.5 py-1.5 rounded-xl border border-slate-200">
                        <div className="w-8 h-8 rounded-lg bg-emerald-400 text-emerald-950 font-bold flex items-center justify-center text-xs">
                            {auth?.user?.name ? auth.user.name.charAt(0).toUpperCase() : 'P'}
                        </div>
                        <p className="text-xs font-bold text-slate-800">{auth?.user?.name || 'Parent Account'}</p>
                    </div>
                </header>

                <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full space-y-6">
                    <div className="bg-amber-400 text-amber-950 p-6 rounded-3xl shadow-sm border border-amber-300 relative overflow-hidden">
                        <div className="relative z-10 space-y-1">
                            <h2 className="text-xl font-black">Monthly Tuition Fees</h2>
                            <p className="text-xs font-medium text-amber-900">
                                View outstanding invoices and pay online securely via FPX / Online Banking.
                            </p>
                        </div>
                    </div>

                    {/* Fees List */}
                    {fees.length === 0 ? (
                        <div className="bg-white p-8 rounded-3xl border border-slate-200 text-center space-y-3">
                            <Receipt className="w-12 h-12 text-slate-300 mx-auto" />
                            <h3 className="text-sm font-bold text-slate-700">No Fee Records Found</h3>
                            <p className="text-xs text-slate-400">There are currently no monthly fees issued for your account.</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {fees.map((fee) => {
                                const isPaid = fee.payment_status?.toLowerCase() === 'paid';
                                return (
                                    <div key={fee.id} className="bg-white rounded-3xl border border-slate-200 p-5 shadow-sm space-y-4 flex flex-col justify-between">
                                        <div className="space-y-3">
                                            {/* Top Info */}
                                            <div className="flex justify-between items-start">
                                                <div>
                                                    <span className="text-[10px] font-bold text-amber-600 uppercase tracking-wider">
                                                        Billing Month: {fee.billing_month || '-'}
                                                    </span>
                                                    <h3 className="text-base font-black text-slate-900 mt-0.5">Yuran Bulanan</h3>
                                                </div>
                                                <span className={`text-[10px] font-bold px-2.5 py-1 rounded-xl uppercase flex items-center gap-1 ${
                                                    isPaid ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                                                }`}>
                                                    {isPaid ? <CheckCircle2 className="w-3 h-3" /> : <Clock className="w-3 h-3" />}
                                                    {fee.payment_status || 'unpaid'}
                                                </span>
                                            </div>

                                            {/* Child Details */}
                                            <div className="bg-slate-50 p-3 rounded-2xl border border-slate-100 space-y-1 text-xs">
                                                <div className="flex items-center gap-2 text-slate-600">
                                                    <User className="w-3.5 h-3.5 text-slate-400" />
                                                    <span className="font-bold text-slate-800">{fee.student?.name || 'Student'}</span>
                                                </div>
                                                {fee.due_date && (
                                                    <p className="text-[11px] text-slate-500 pl-5">Tarikh Luput: {fee.due_date}</p>
                                                )}
                                            </div>

                                            {/* Breakdown Charge */}
                                            <div className="text-xs space-y-1 text-slate-600 bg-slate-50/50 p-3 rounded-xl border border-slate-100">
                                                <div className="flex justify-between">
                                                    <span>Yuran Asas:</span>
                                                    <span className="font-semibold">RM {parseFloat(fee.base_fee || 0).toFixed(2)}</span>
                                                </div>
                                                {parseFloat(fee.late_pickup_fee || 0) > 0 && (
                                                    <div className="flex justify-between text-rose-600">
                                                        <span>Caj Lewat Ambil:</span>
                                                        <span className="font-semibold">RM {parseFloat(fee.late_pickup_fee).toFixed(2)}</span>
                                                    </div>
                                                )}
                                                {parseFloat(fee.other_charges || 0) > 0 && (
                                                    <div className="flex justify-between">
                                                        <span>Caj-caj Lain:</span>
                                                        <span className="font-semibold">RM {parseFloat(fee.other_charges).toFixed(2)}</span>
                                                    </div>
                                                )}
                                            </div>

                                            {/* Total Amount */}
                                            <div className="pt-2 border-t border-slate-100 flex justify-between items-baseline">
                                                <span className="text-xs font-bold text-slate-400">Jumlah Perlu Dibayar:</span>
                                                <span className="text-xl font-black text-slate-900">
                                                    RM {parseFloat(fee.total_amount || 0).toFixed(2)}
                                                </span>
                                            </div>
                                        </div>

                                        {/* Action Button */}
                                        <div>
                                            {isPaid ? (
                                                <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-2xl text-center text-xs font-bold text-emerald-700 flex items-center justify-center gap-2">
                                                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                                                    Telah Dijelaskan
                                                </div>
                                            ) : (
                                                <button
                                                    type="button"
                                                    onClick={() => handleCheckout(fee.id)}
                                                    disabled={loadingId === fee.id}
                                                    className="w-full bg-amber-400 hover:bg-amber-500 text-amber-950 font-bold py-3 px-4 rounded-2xl shadow-md shadow-amber-400/20 transition-all flex items-center justify-center gap-2 text-xs disabled:opacity-50 cursor-pointer"
                                                >
                                                    <CreditCard className="w-4 h-4" />
                                                    {loadingId === fee.id ? 'Mengubah ke ToyyibPay...' : 'Bayar Sekarang'}
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
}
