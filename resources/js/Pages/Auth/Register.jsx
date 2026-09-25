import { useState } from 'react';
import InputError from '@/Components/InputError';
import InputLabel from '@/Components/InputLabel';
import TextInput from '@/Components/TextInput';
import { Head, Link, router, useForm } from '@inertiajs/react';

function EyeIcon({ hidden }) {
    return hidden ? (
        <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="h-5 w-5"
            aria-hidden="true"
        >
            <path d="M2 2l20 20" />
            <path d="M10.6 10.6a2 2 0 002.8 2.8" />
            <path d="M9.9 5.2A10.7 10.7 0 0112 5c5 0 9.3 3.1 11 7a11.7 11.7 0 01-3 4.2" />
            <path d="M6.6 6.6A11.8 11.8 0 001 12c1.7 3.9 6 7 11 7a10.8 10.8 0 005.4-1.4" />
        </svg>
    ) : (
        <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="h-5 w-5"
            aria-hidden="true"
        >
            <path d="M2 12s3.6-7 10-7 10 7 10 7-3.6 7-10 7S2 12 2 12z" />
            <circle cx="12" cy="12" r="3" />
        </svg>
    );
}

export default function Register({ verificationEmail = null, status = null }) {
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmation, setShowConfirmation] = useState(false);
    const [resending, setResending] = useState(false);
    const [resendMessage, setResendMessage] = useState('');

    const {
        data,
        setData,
        post,
        processing,
        errors,
        reset,
    } = useForm({
        full_name: '',
        email: '',
        phone_number: '',
        relationship: 'Father',
        address: '',
        child_name: '',
        child_ic: '',
        password: '',
        password_confirmation: '',
    });

    const {
        data: otpData,
        setData: setOtpData,
        post: postOtp,
        processing: verifying,
        errors: otpErrors,
    } = useForm({
        code: '',
    });

    const submit = (event) => {
        event.preventDefault();

        post(route('register'), {
            onFinish: () => reset('password', 'password_confirmation'),
        });
    };

    const verifyCode = (event) => {
        event.preventDefault();

        postOtp(route('verification.code.verify'), {
            preserveScroll: true,
        });
    };

    const resendCode = () => {
        setResendMessage('');

        router.post(
            route('verification.code.resend'),
            {},
            {
                preserveScroll: true,
                onStart: () => setResending(true),
                onSuccess: () => {
                    setOtpData('code', '');
                    setResendMessage('A new code has been sent. Check your inbox or spam folder.');
                },
                onFinish: () => setResending(false),
            },
        );
    };

    return (
        <div className="min-h-screen bg-slate-50 flex flex-col lg:flex-row font-sans">
            <Head title="Parent Registration - Tinta Tots Clubhouse" />

            {/* LEFT HERO PANEL */}
            <div className="hidden lg:flex lg:w-5/12 xl:w-1/2 bg-slate-900 text-white p-12 flex-col justify-between relative overflow-hidden shrink-0">
                <div className="absolute -top-24 -left-24 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
                <div className="absolute -bottom-24 -right-24 w-96 h-96 bg-amber-400/10 rounded-full blur-3xl pointer-events-none" />
                <div className="absolute inset-0 bg-[radial-gradient(#334155_1px,transparent_1px)] [background-size:24px_24px] opacity-25 pointer-events-none" />

                <div className="relative z-10 flex items-center gap-3">
                    <img
                        src="/images/logo.jpg"
                        alt="Tinta Tots Logo"
                        className="w-12 h-12 rounded-2xl object-cover border-2 border-amber-400/30 shadow-lg"
                    />
                    <div>
                        <h2 className="text-base font-black tracking-tight text-white leading-tight">
                            Tinta Tots Clubhouse
                        </h2>
                        <p className="text-[10px] font-bold text-amber-400 uppercase tracking-wider">
                            Smart Kids Management
                        </p>
                    </div>
                </div>

                <div className="relative z-10 max-w-md my-auto py-12">
                    <div className="w-12 h-12 rounded-2xl bg-amber-400/20 border border-amber-400/30 flex items-center justify-center text-2xl mb-6 shadow-inner">
                        👨‍👩‍👧
                    </div>
                    <h1 className="text-4xl xl:text-5xl font-black text-white leading-tight tracking-tight mb-4">
                        Join <br />
                        <span className="text-amber-400">Tinta Tots!</span> 👋
                    </h1>
                    <p className="text-slate-300 text-sm leading-relaxed font-medium">
                        Register your parent account to monitor your child's learning journey,
                        attendance, daily logs, and stay connected with our clubhouse admins.
                    </p>
                </div>

                <div className="relative z-10 text-xs text-slate-500 font-medium">
                    © {new Date().getFullYear()} Tinta Tots Clubhouse. All rights reserved.
                </div>
            </div>

            {/* RIGHT FORM PANEL */}
            <div className="flex-1 flex flex-col justify-center items-center p-6 sm:p-10 lg:p-12 bg-slate-50/50 min-h-screen overflow-y-auto">
                <div className="w-full max-w-2xl bg-white p-6 sm:p-10 rounded-3xl border border-slate-200/80 shadow-xl shadow-slate-200/50 space-y-6 relative z-10 my-auto">
                    <div className="flex lg:hidden items-center gap-3 pb-4 border-b border-slate-100">
                        <img
                            src="/images/logo.jpg"
                            alt="Tinta Tots Logo"
                            className="w-11 h-11 rounded-2xl object-cover border border-slate-200 shadow-sm"
                        />
                        <div>
                            <h2 className="text-base font-black text-slate-900 leading-tight">
                                Tinta Tots Clubhouse
                            </h2>
                            <p className="text-[10px] font-bold text-amber-600 uppercase tracking-wider">
                                Smart Kids Management
                            </p>
                        </div>
                    </div>

                    <div>
                        <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
                            Parent Registration
                        </h2>
                        <p className="text-xs sm:text-sm text-slate-500 mt-1 font-medium">
                            Already registered?{' '}
                            <Link
                                href={route('login')}
                                className="font-bold text-amber-600 hover:text-amber-700 underline transition-colors"
                            >
                                Log in here
                            </Link>
                        </p>
                    </div>

                    <form onSubmit={submit} className="space-y-6">
                        {/* PARENT DETAILS */}
                        <div className="space-y-4">
                            <div className="flex items-center gap-2 pb-1.5 border-b border-slate-100">
                                <span className="text-sm">👤</span>
                                <h3 className="text-xs font-bold text-amber-600 uppercase tracking-wider">
                                    1. Parent Details
                                </h3>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div>
                                    <InputLabel
                                        htmlFor="full_name"
                                        value="Full Name"
                                        className="text-slate-700 font-bold text-xs uppercase tracking-wider mb-1"
                                    />
                                    <TextInput
                                        id="full_name"
                                        name="full_name"
                                        value={data.full_name}
                                        placeholder="e.g. Ahmad Bin Mohamad"
                                        className="w-full px-4 py-2.5 rounded-xl bg-slate-50/50 border border-slate-200 text-sm focus:border-amber-500 focus:ring-amber-500/20 transition-all text-slate-800 placeholder:text-slate-400"
                                        isFocused={true}
                                        onChange={(e) => setData('full_name', e.target.value)}
                                        required
                                    />
                                    <InputError message={errors.full_name} className="mt-1" />
                                </div>

                                <div>
                                    <InputLabel
                                        htmlFor="email"
                                        value="Email Address"
                                        className="text-slate-700 font-bold text-xs uppercase tracking-wider mb-1"
                                    />
                                    <TextInput
                                        id="email"
                                        type="email"
                                        name="email"
                                        value={data.email}
                                        placeholder="parent@example.com"
                                        className="w-full px-4 py-2.5 rounded-xl bg-slate-50/50 border border-slate-200 text-sm focus:border-amber-500 focus:ring-amber-500/20 transition-all text-slate-800 placeholder:text-slate-400"
                                        onChange={(e) => setData('email', e.target.value)}
                                        required
                                    />
                                    <InputError message={errors.email} className="mt-1" />
                                </div>

                                <div>
                                    <InputLabel
                                        htmlFor="relationship"
                                        value="Relationship (Role)"
                                        className="text-slate-700 font-bold text-xs uppercase tracking-wider mb-1"
                                    />
                                    <select
                                        id="relationship"
                                        name="relationship"
                                        value={data.relationship}
                                        onChange={(e) => setData('relationship', e.target.value)}
                                        className="w-full px-4 py-2.5 rounded-xl bg-slate-50/50 border border-slate-200 text-sm focus:border-amber-500 focus:ring-amber-500/20 transition-all text-slate-800"
                                    >
                                        <option value="Father">Father</option>
                                        <option value="Mother">Mother</option>
                                        <option value="Guardian">Guardian</option>
                                    </select>
                                    <InputError message={errors.relationship} className="mt-1" />
                                </div>

                                <div>
                                    <InputLabel
                                        htmlFor="phone_number"
                                        value="Phone Number"
                                        className="text-slate-700 font-bold text-xs uppercase tracking-wider mb-1"
                                    />
                                    <TextInput
                                        id="phone_number"
                                        name="phone_number"
                                        value={data.phone_number}
                                        placeholder="e.g. 0123456789"
                                        className="w-full px-4 py-2.5 rounded-xl bg-slate-50/50 border border-slate-200 text-sm focus:border-amber-500 focus:ring-amber-500/20 transition-all text-slate-800 placeholder:text-slate-400"
                                        onChange={(e) => setData('phone_number', e.target.value)}
                                        required
                                    />
                                    <InputError message={errors.phone_number} className="mt-1" />
                                </div>

                                <div className="sm:col-span-2">
                                    <InputLabel
                                        htmlFor="address"
                                        value="Home Address"
                                        className="text-slate-700 font-bold text-xs uppercase tracking-wider mb-1"
                                    />
                                    <textarea
                                        id="address"
                                        name="address"
                                        rows="2"
                                        value={data.address}
                                        placeholder="Full home address..."
                                        className="w-full px-4 py-2.5 rounded-xl bg-slate-50/50 border border-slate-200 text-sm focus:border-amber-500 focus:ring-amber-500/20 transition-all text-slate-800 placeholder:text-slate-400 resize-none"
                                        onChange={(e) => setData('address', e.target.value)}
                                        required
                                    />
                                    <InputError message={errors.address} className="mt-1" />
                                </div>
                            </div>
                        </div>

                        {/* CHILD DETAILS */}
                        <div className="space-y-4">
                            <div className="flex items-center gap-2 pb-1.5 border-b border-slate-100">
                                <span className="text-sm">🎒</span>
                                <h3 className="text-xs font-bold text-amber-600 uppercase tracking-wider">
                                    2. Child Details
                                </h3>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div>
                                    <InputLabel
                                        htmlFor="child_name"
                                        value="Child Full Name"
                                        className="text-slate-700 font-bold text-xs uppercase tracking-wider mb-1"
                                    />
                                    <TextInput
                                        id="child_name"
                                        name="child_name"
                                        value={data.child_name}
                                        placeholder="e.g. Ali Bin Ahmad"
                                        className="w-full px-4 py-2.5 rounded-xl bg-slate-50/50 border border-slate-200 text-sm focus:border-amber-500 focus:ring-500/20 transition-all text-slate-800 placeholder:text-slate-400"
                                        onChange={(e) => setData('child_name', e.target.value)}
                                        required
                                    />
                                    <InputError message={errors.child_name} className="mt-1" />
                                </div>

                                <div>
                                    <InputLabel
                                        htmlFor="child_ic"
                                        value="Child NRIC / MyKid"
                                        className="text-slate-700 font-bold text-xs uppercase tracking-wider mb-1"
                                    />
                                    <TextInput
                                        id="child_ic"
                                        name="child_ic"
                                        value={data.child_ic}
                                        placeholder="e.g. 150101101234"
                                        className="w-full px-4 py-2.5 rounded-xl bg-slate-50/50 border border-slate-200 text-sm focus:border-amber-500 focus:ring-amber-500/20 transition-all text-slate-800 placeholder:text-slate-400"
                                        onChange={(e) => setData('child_ic', e.target.value)}
                                        required
                                    />
                                    <InputError message={errors.child_ic} className="mt-1" />
                                </div>
                            </div>
                        </div>

                        {/* PASSWORD */}
                        <div className="space-y-4">
                            <div className="flex items-center gap-2 pb-1.5 border-b border-slate-100">
                                <span className="text-sm">🔐</span>
                                <h3 className="text-xs font-bold text-amber-600 uppercase tracking-wider">
                                    3. Account Password
                                </h3>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div>
                                    <InputLabel
                                        htmlFor="password"
                                        value="Password"
                                        className="text-slate-700 font-bold text-xs uppercase tracking-wider mb-1"
                                    />
                                    <div className="relative">
                                        <TextInput
                                            id="password"
                                            type={showPassword ? 'text' : 'password'}
                                            name="password"
                                            value={data.password}
                                            placeholder="Min. 8 characters"
                                            className="w-full pr-12 px-4 py-2.5 rounded-xl bg-slate-50/50 border border-slate-200 text-sm focus:border-amber-500 focus:ring-amber-500/20 transition-all text-slate-800 placeholder:text-slate-400"
                                            onChange={(e) => setData('password', e.target.value)}
                                            required
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowPassword((value) => !value)}
                                            aria-label={showPassword ? 'Hide password' : 'Show password'}
                                            aria-pressed={showPassword}
                                            className="absolute inset-y-0 right-3 flex items-center text-slate-500 hover:text-amber-700"
                                        >
                                            <EyeIcon hidden={showPassword} />
                                        </button>
                                    </div>
                                    <InputError message={errors.password} className="mt-1" />
                                </div>

                                <div>
                                    <InputLabel
                                        htmlFor="password_confirmation"
                                        value="Confirm Password"
                                        className="text-slate-700 font-bold text-xs uppercase tracking-wider mb-1"
                                    />
                                    <div className="relative">
                                        <TextInput
                                            id="password_confirmation"
                                            type={showConfirmation ? 'text' : 'password'}
                                            name="password_confirmation"
                                            value={data.password_confirmation}
                                            placeholder="Repeat password"
                                            className="w-full pr-12 px-4 py-2.5 rounded-xl bg-slate-50/50 border border-slate-200 text-sm focus:border-amber-500 focus:ring-amber-500/20 transition-all text-slate-800 placeholder:text-slate-400"
                                            onChange={(e) => setData('password_confirmation', e.target.value)}
                                            required
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowConfirmation((value) => !value)}
                                            aria-label={showConfirmation ? 'Hide confirmation' : 'Show confirmation'}
                                            aria-pressed={showConfirmation}
                                            className="absolute inset-y-0 right-3 flex items-center text-slate-500 hover:text-amber-700"
                                        >
                                            <EyeIcon hidden={showConfirmation} />
                                        </button>
                                    </div>
                                    <InputError message={errors.password_confirmation} className="mt-1" />
                                </div>
                            </div>
                        </div>

                        <div className="pt-2">
                            <button
                                type="submit"
                                disabled={processing || Boolean(verificationEmail)}
                                className="w-full py-3.5 px-4 bg-amber-400 hover:bg-amber-500 active:scale-[0.99] text-amber-950 font-black rounded-xl shadow-md shadow-amber-400/20 transition-all text-sm disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer"
                            >
                                <span>{processing ? 'Submitting...' : 'Submit Registration'}</span>
                                <span>→</span>
                            </button>
                        </div>
                    </form>

                    <div className="pt-2 border-t border-slate-100 text-center lg:hidden">
                        <p className="text-[11px] text-slate-400 font-medium">
                            © {new Date().getFullYear()} Tinta Tots Clubhouse. Smart Kids System.
                        </p>
                    </div>
                </div>
            </div>

            {/* OTP POPUP */}
            {verificationEmail && (
                <div
                    className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 p-4"
                    role="presentation"
                >
                    <div
                        role="dialog"
                        aria-modal="true"
                        aria-labelledby="otp-title"
                        className="w-full max-w-md rounded-3xl bg-white p-6 sm:p-8 shadow-2xl"
                    >
                        <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-100 text-2xl">
                            ✉️
                        </div>

                        <h2 id="otp-title" className="text-2xl font-black text-slate-900">
                            Verify Your Email
                        </h2>

                        <p className="mt-2 text-sm leading-relaxed text-slate-600">
                            We sent a 6-digit code to{' '}
                            <strong className="break-all text-slate-900">
                                {verificationEmail}
                            </strong>
                            . Enter the code within 10 minutes.
                        </p>

                        {status && (
                            <p className="mt-4 rounded-xl bg-green-50 p-3 text-sm text-green-700">
                                {status}
                            </p>
                        )}

                        {resendMessage && (
                            <p className="mt-4 rounded-xl bg-green-50 p-3 text-sm text-green-700">
                                {resendMessage}
                            </p>
                        )}

                        <form onSubmit={verifyCode} className="mt-6 space-y-4">
                            <div>
                                <InputLabel htmlFor="verification_code" value="Verification Code" />
                                <TextInput
                                    id="verification_code"
                                    type="text"
                                    inputMode="numeric"
                                    autoComplete="one-time-code"
                                    maxLength={6}
                                    value={otpData.code}
                                    onChange={(e) =>
                                        setOtpData(
                                            'code',
                                            e.target.value.replace(/\D/g, '').slice(0, 6),
                                        )
                                    }
                                    placeholder="Enter 6-digit code"
                                    className="mt-1 block w-full rounded-xl border-slate-200 text-center text-2xl tracking-[0.35em] focus:border-amber-500 focus:ring-amber-500"
                                    required
                                />
                                <InputError message={otpErrors.code} className="mt-2" />
                            </div>

                            <button
                                type="submit"
                                disabled={verifying || otpData.code.length !== 6}
                                className="w-full rounded-xl bg-amber-400 px-4 py-3 font-bold text-amber-950 hover:bg-amber-500 disabled:opacity-50"
                            >
                                {verifying ? 'Verifying...' : 'Verify Email'}
                            </button>
                        </form>

                        <div className="mt-5 text-center">
                            <button
                                type="button"
                                onClick={resendCode}
                                disabled={resending}
                                className="text-sm font-bold text-amber-700 hover:underline disabled:opacity-50"
                            >
                                {resending ? 'Sending...' : 'Resend code'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
