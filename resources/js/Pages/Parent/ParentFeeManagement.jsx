import React, { useState } from 'react';
import { Head } from '@inertiajs/react';
import AuthenticatedLayoutParent from '@/Layouts/AuthenticatedLayoutParent';
import {
    CreditCard,
    CheckCircle2,
    Clock,
    Receipt,
    User,
    Download,
} from 'lucide-react';
import axios from 'axios';

export default function ParentFeeManagement({ fees = [] }) {
    const [loadingId, setLoadingId] = useState(null);
// Format date for display
const formatDate = (date) => {
    if (!date) {
        return '-';
    }

    return new Date(date).toLocaleDateString('en-GB', {
        day: '2-digit',
        month: 'long',
        year: 'numeric',
    });
};
    // Start ToyyibPay checkout
    const handleCheckout = async (feeId) => {
        setLoadingId(feeId);

        try {
            const response = await axios.post(
                '/parent/fees/checkout',
                {
                    fee_id: feeId,
                }
            );

            // Redirect parent to ToyyibPay
            if (response.data?.payment_url) {
                window.location.href = response.data.payment_url;
                return;
            }

            alert('Unable to retrieve the payment link.');
            setLoadingId(null);
        } catch (error) {
            console.error(
                'Checkout Error:',
                error.response?.data || error
            );

            const errorMessage =
                error.response?.data?.error ||
                error.response?.data?.message ||
                'An error occurred while connecting to the payment system.';

            alert(errorMessage);
            setLoadingId(null);
        }
    };

    return (
        <AuthenticatedLayoutParent activeNavId="fees" pageTitle="Invoices & Fees" pageSubtitle="Fee Management">
            <Head title="Fee Management - Smart Kids" />

            <main className="w-full">

                <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full space-y-6">
                    <div className="bg-amber-400 text-amber-950 p-6 rounded-3xl shadow-sm border border-amber-300 relative overflow-hidden">
                        <div className="relative z-10 space-y-1">
                            <h2 className="text-xl font-black">
                                Monthly Tuition Fees
                            </h2>

                            <p className="text-xs font-medium text-amber-900">
                                View your child's monthly invoices,
                                outstanding balances, and make secure
                                online payments through FPX or Online
                                Banking.
                            </p>
                        </div>
                    </div>

                    {fees.length === 0 ? (
                        <div className="bg-white p-8 rounded-3xl border border-slate-200 text-center space-y-3">
                            <Receipt className="w-12 h-12 text-slate-300 mx-auto" />

                            <h3 className="text-sm font-bold text-slate-700">
                                No Fee Records Found
                            </h3>

                            <p className="text-xs text-slate-400">
                                There are currently no monthly fee
                                invoices issued for your account.
                            </p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {fees.map((fee) => {
                                const isPaid =
                                    fee.payment_status
                                        ?.toLowerCase() ===
                                    'paid';

                                const outstandingBalance =
                                    parseFloat(
                                        fee.balance ??
                                            fee.total_amount ??
                                            0
                                    );

                                return (
                                    <div
                                        key={fee.id}
                                        className="bg-white rounded-3xl border border-slate-200 p-5 shadow-sm space-y-4 flex flex-col justify-between"
                                    >
                                        <div className="space-y-3">
                                            <div className="flex justify-between items-start gap-3">
                                                <div>
                                                    <span className="text-[10px] font-bold text-amber-600 uppercase tracking-wider">
                                                        Billing Month:{' '}
                                                        {fee.billing_month ||
                                                            '-'}
                                                    </span>

                                                    <h3 className="text-base font-black text-slate-900 mt-0.5">
                                                        Monthly Tuition
                                                        Fee
                                                    </h3>
                                                </div>

                                                <span
                                                    className={`text-[10px] font-bold px-2.5 py-1 rounded-xl uppercase flex items-center gap-1 ${
                                                        isPaid
                                                            ? 'bg-emerald-100 text-emerald-800'
                                                            : 'bg-amber-100 text-amber-800'
                                                    }`}
                                                >
                                                    {isPaid ? (
                                                        <CheckCircle2 className="w-3 h-3" />
                                                    ) : (
                                                        <Clock className="w-3 h-3" />
                                                    )}

                                                    {fee.payment_status ||
                                                        'Unpaid'}
                                                </span>
                                            </div>

                                            <div className="bg-slate-50 p-3 rounded-2xl border border-slate-100 space-y-1 text-xs">
                                                <div className="flex items-center gap-2 text-slate-600">
                                                    <User className="w-3.5 h-3.5 text-slate-400" />

                                                    <span className="font-bold text-slate-800">
                                                        {fee.student
                                                            ?.name ||
                                                            fee.student
                                                                ?.full_name ||
                                                            'Student'}
                                                    </span>
                                                </div>

                                                {fee.due_date && (
                                                    <p className="text-[11px] text-slate-500 pl-5">
                                                        Due Date: {formatDate(fee.due_date)}
                                                    </p>
                                                )}

                                                {fee.invoice_ref && (
                                                    <p className="text-[11px] text-slate-500 pl-5">
                                                        Invoice
                                                        Reference:{' '}
                                                        {
                                                            fee.invoice_ref
                                                        }
                                                    </p>
                                                )}
                                            </div>

                                            <div className="text-xs space-y-2 text-slate-600 bg-slate-50/50 p-3 rounded-xl border border-slate-100">
                                                <div className="flex justify-between">
                                                    <span>
                                                        Monthly Package
                                                        Fee
                                                    </span>

                                                    <span className="font-semibold">
                                                        RM{' '}
                                                        {parseFloat(
                                                            fee.base_fee ||
                                                                0
                                                        ).toFixed(
                                                            2
                                                        )}
                                                    </span>
                                                </div>

                                                {parseFloat(
                                                    fee.late_pickup_fee ||
                                                        0
                                                ) > 0 && (
                                                    <div className="flex justify-between text-rose-600">
                                                        <span>
                                                            Late Pickup
                                                            Charge
                                                        </span>

                                                        <span className="font-semibold">
                                                            RM{' '}
                                                            {parseFloat(
                                                                fee.late_pickup_fee
                                                            ).toFixed(
                                                                2
                                                            )}
                                                        </span>
                                                    </div>
                                                )}

                                                {parseFloat(
                                                    fee.other_charges ||
                                                        0
                                                ) > 0 && (
                                                    <div className="flex justify-between">
                                                        <span>
                                                            Other
                                                            Charges
                                                        </span>

                                                        <span className="font-semibold">
                                                            RM{' '}
                                                            {parseFloat(
                                                                fee.other_charges
                                                            ).toFixed(
                                                                2
                                                            )}
                                                        </span>
                                                    </div>
                                                )}

                                                <div className="flex justify-between pt-2 border-t border-slate-200">
                                                    <span>
                                                        Total Invoice
                                                        Amount
                                                    </span>

                                                    <span className="font-semibold">
                                                        RM{' '}
                                                        {parseFloat(
                                                            fee.total_amount ||
                                                                0
                                                        ).toFixed(
                                                            2
                                                        )}
                                                    </span>
                                                </div>

                                                {parseFloat(
                                                    fee.amount_paid || 0
                                                ) > 0 && (
                                                    <div className="flex justify-between text-emerald-700">
                                                        <span>
                                                            Amount Paid
                                                        </span>

                                                        <span className="font-semibold">
                                                            RM{' '}
                                                            {parseFloat(
                                                                fee.amount_paid
                                                            ).toFixed(
                                                                2
                                                            )}
                                                        </span>
                                                    </div>
                                                )}
                                            </div>

                                            <div className="pt-2 border-t border-slate-100 flex justify-between items-baseline gap-3">
                                                <span className="text-xs font-bold text-slate-500">
                                                    Outstanding Balance
                                                </span>

                                                <span className="text-xl font-black text-slate-900">
                                                    RM{' '}
                                                    {outstandingBalance.toFixed(
                                                        2
                                                    )}
                                                </span>
                                            </div>
                                        </div>

                                        <div>
                                                {isPaid ? (
                                                    <div className="space-y-2">
                                                        <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-2xl text-center text-xs font-bold text-emerald-700 flex items-center justify-center gap-2">
                                                            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                                                            Payment Completed
                                                        </div>

                                                        <a
                                                            href={`/parent/fees/${fee.id}/receipt`}
                                                            className="w-full bg-slate-900 hover:bg-slate-800 text-white font-bold py-3 px-4 rounded-2xl transition-all flex items-center justify-center gap-2 text-xs"
                                                        >
                                                            <Download className="w-4 h-4" />
                                                            Download Receipt
                                                        </a>
                                                    </div>
                                                ) : (
                                                <button
                                                    type="button"
                                                    onClick={() =>
                                                        handleCheckout(
                                                            fee.id
                                                        )
                                                    }
                                                    disabled={
                                                        loadingId ===
                                                            fee.id ||
                                                        outstandingBalance <=
                                                            0
                                                    }
                                                    className="w-full bg-amber-400 hover:bg-amber-500 text-amber-950 font-bold py-3 px-4 rounded-2xl shadow-md shadow-amber-400/20 transition-all flex items-center justify-center gap-2 text-xs disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                                                >
                                                    <CreditCard className="w-4 h-4" />

                                                    {loadingId ===
                                                    fee.id
                                                        ? 'Redirecting to ToyyibPay...'
                                                        : `Pay RM ${outstandingBalance.toFixed(
                                                              2
                                                          )}`}
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
        </AuthenticatedLayoutParent>
    );
}
