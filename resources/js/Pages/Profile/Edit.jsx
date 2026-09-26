import { Head, Link, router, useForm } from '@inertiajs/react';
import { useState } from 'react';
import {
    ArrowLeft, CalendarDays, CheckCircle2, Clock3, Eye, EyeOff,
    KeyRound, LockKeyhole, LogOut, Mail, MapPin, Save, ShieldCheck,
    UserRound, UsersRound,
} from 'lucide-react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import AuthenticatedLayoutTeacher from '@/Layouts/AuthenticatedLayoutTeacher';
import AuthenticatedLayoutParent from '@/Layouts/AuthenticatedLayoutParent';

const inputClass = 'mt-1.5 block w-full min-w-0 rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 shadow-sm outline-none transition placeholder:text-slate-400 focus:border-violet-400 focus:ring-2 focus:ring-violet-100';
const labelClass = 'block min-w-0 text-xs font-bold uppercase tracking-wide text-slate-600';

function FormField({ label, name, value, onChange, error, type = 'text', autoComplete }) {
    return (
        <label className={labelClass}>
            {label}
            <input
                name={name}
                type={type}
                value={value}
                autoComplete={autoComplete}
                onChange={(event) => onChange(name, event.target.value)}
                className={inputClass}
            />
            {error && <span className="mt-1 block text-xs font-medium normal-case tracking-normal text-rose-600">{error}</span>}
        </label>
    );
}

function SectionHeading({ icon: Icon, title, description }) {
    return (
        <div className="mb-6 flex items-start gap-3 border-b border-slate-100 pb-5">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-violet-50 text-violet-700">
                <Icon size={19} />
            </div>
            <div className="min-w-0">
                <h2 className="text-base font-extrabold text-slate-900 sm:text-lg">{title}</h2>
                <p className="mt-0.5 text-xs leading-5 text-slate-500 sm:text-sm">{description}</p>
            </div>
        </div>
    );
}

export default function Edit({ profile, pendingEmail, statusMessage }) {
    const form = useForm({
        full_name: profile.full_name ?? '',
        email: profile.email ?? '',
        phone_number: profile.phone_number ?? '',
        qualification: profile.qualification ?? '',
        address: profile.address ?? '',
        relationship: profile.relationship ?? 'guardian',
    });
    const verification = useForm({ verification_code: '' });
    const password = useForm({
        current_password: '',
        password: '',
        password_confirmation: '',
    });
    const [showPasswords, setShowPasswords] = useState(false);

    const homeUrl = profile.role === 'teacher'
        ? '/teacher/dashboard'
        : profile.role === 'parent'
            ? '/parent/dashboard'
            : '/dashboard';

    const field = (label, name, type = 'text', autoComplete) => (
        <FormField
            label={label}
            name={name}
            type={type}
            value={form.data[name]}
            onChange={form.setData}
            error={form.errors[name]}
            autoComplete={autoComplete}
        />
    );

    const submitProfile = (event) => {
        event.preventDefault();
        form.patch('/profile', { preserveScroll: true });
    };

    const submitPassword = (event) => {
        event.preventDefault();
        password.put('/password', {
            preserveScroll: true,
            onSuccess: () => password.reset(),
        });
    };

    const content = (
        <>
            <Head title="My Profile · Tinta Tots Clubhouse" />

            <div className="mx-auto w-full max-w-[1240px] min-w-0 space-y-6 pb-8">
                <div className="flex flex-wrap items-center justify-between gap-3">
                    <div className="min-w-0">
                        <Link href={homeUrl} className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-violet-700">
                            <ArrowLeft size={15} /> Back to dashboard
                        </Link>
                        <h1 className="mt-2 text-2xl font-black tracking-tight text-slate-900 sm:text-3xl">My Profile & Settings</h1>
                        <p className="mt-1 text-sm text-slate-500">Manage your account and view centre information.</p>
                    </div>
                    <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1.5 text-xs font-bold capitalize text-emerald-700">
                        <CheckCircle2 size={15} /> {profile.status} account
                    </span>
                </div>

                <div className="relative overflow-hidden rounded-[26px] bg-gradient-to-r from-[#484075] via-[#645A9A] to-[#8377B4] p-5 text-white shadow-lg shadow-violet-200/50 sm:p-7">
                    <div className="absolute -right-12 -top-16 h-48 w-48 rounded-full bg-white/10" />
                    <div className="absolute bottom-0 right-24 h-24 w-24 rounded-full bg-white/5" />
                    <div className="relative flex flex-col gap-5 sm:flex-row sm:items-center">
                        <div className="flex h-[82px] w-[82px] shrink-0 items-center justify-center rounded-2xl border border-white/50 bg-white p-2 shadow-md">
                            <img src="/images/logo.jpg" alt="Tinta Tots Clubhouse logo" className="h-full w-full rounded-xl object-contain" />
                        </div>
                        <div className="min-w-0 flex-1">
                            <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-white/70">Tinta Tots Clubhouse</p>
                            <h2 className="mt-1 truncate text-xl font-extrabold sm:text-2xl">{profile.full_name}</h2>
                            <p className="mt-1 break-all text-sm text-white/80">{profile.email}</p>
                        </div>
                        <span className="w-fit rounded-full border border-white/30 bg-white/15 px-3 py-1.5 text-xs font-bold capitalize backdrop-blur-sm">
                            {profile.role} portal
                        </span>
                    </div>
                </div>

                {pendingEmail && (
                    <section className="rounded-2xl border border-amber-200 bg-amber-50 p-5 shadow-sm sm:p-6">
                        <SectionHeading icon={Mail} title="Verify your new email" description={`We sent a six-digit code to ${pendingEmail}. Your previous email remains active until verification.`} />
                        {statusMessage && <p className="mb-4 text-sm font-medium text-emerald-700">{statusMessage}</p>}
                        <form
                            onSubmit={(event) => {
                                event.preventDefault();
                                verification.post('/profile/verify-email', { preserveScroll: true });
                            }}
                            className="flex flex-wrap items-end gap-3"
                        >
                            <label className={labelClass}>
                                Verification code
                                <input
                                    inputMode="numeric"
                                    maxLength={6}
                                    value={verification.data.verification_code}
                                    onChange={(event) => verification.setData('verification_code', event.target.value)}
                                    className={`${inputClass} w-44`}
                                />
                            </label>
                            <button type="submit" disabled={verification.processing} className="rounded-xl bg-[#514688] px-5 py-3 text-sm font-bold text-white hover:bg-[#403670] disabled:opacity-50">Verify email</button>
                        </form>
                        {verification.errors.verification_code && <p className="mt-2 text-xs text-rose-600">{verification.errors.verification_code}</p>}
                        <button type="button" onClick={() => router.delete('/profile/pending-email')} className="mt-4 text-xs font-semibold text-slate-600 underline hover:text-slate-900">Cancel email change</button>
                    </section>
                )}

                <div className="grid min-w-0 grid-cols-1 items-start gap-6 lg:grid-cols-[minmax(0,1fr)_300px]">
                    <div className="min-w-0 space-y-6">
                        <section id="personal-details" className="rounded-[22px] border border-slate-100 bg-white p-5 shadow-sm sm:p-7">
                            <SectionHeading icon={UserRound} title="Personal information" description="Keep your name and contact details up to date." />
                            <form onSubmit={submitProfile} className="space-y-5">
                                <div className="grid gap-5 sm:grid-cols-2">
                                    {field('Full name', 'full_name', 'text', 'name')}
                                    {field('Phone number', 'phone_number', 'tel', 'tel')}
                                </div>
                                <div>
                                    {field('Email address', 'email', 'email', 'email')}
                                    <p className="mt-1.5 flex items-start gap-1.5 text-xs leading-5 text-slate-500">
                                        <ShieldCheck size={14} className="mt-0.5 shrink-0" /> Changing this email requires a code sent to the new address.
                                    </p>
                                </div>

                                {profile.role === 'teacher' && (
                                    <div className="grid gap-5 sm:grid-cols-2">
                                        {field('Qualification', 'qualification')}
                                        {field('Address', 'address')}
                                    </div>
                                )}

                                {profile.role === 'parent' && (
                                    <div className="grid gap-5 sm:grid-cols-2">
                                        <label className={labelClass}>
                                            Relationship
                                            <select value={form.data.relationship} onChange={(event) => form.setData('relationship', event.target.value)} className={inputClass}>
                                                <option value="father">Father</option>
                                                <option value="mother">Mother</option>
                                                <option value="guardian">Guardian</option>
                                            </select>
                                            {form.errors.relationship && <span className="mt-1 block text-xs text-rose-600">{form.errors.relationship}</span>}
                                        </label>
                                        {field('Address', 'address')}
                                    </div>
                                )}

                                <div className="flex flex-wrap items-center gap-3 border-t border-slate-100 pt-5">
                                    <button type="submit" disabled={form.processing} className="inline-flex items-center gap-2 rounded-xl bg-[#514688] px-5 py-3 text-sm font-bold text-white shadow-sm hover:bg-[#403670] disabled:opacity-50">
                                        <Save size={16} /> {form.processing ? 'Saving...' : 'Save changes'}
                                    </button>
                                    {form.recentlySuccessful && <span className="text-sm font-semibold text-emerald-700">Saved successfully.</span>}
                                </div>
                            </form>
                        </section>

                        <section id="security" className="rounded-[22px] border border-slate-100 bg-white p-5 shadow-sm sm:p-7">
                            <SectionHeading icon={LockKeyhole} title="Password & security" description="Use a password that you do not use for other accounts." />
                            <form onSubmit={submitPassword} className="space-y-5">
                                {[
                                    ['Current password', 'current_password', 'current-password'],
                                    ['New password', 'password', 'new-password'],
                                    ['Confirm new password', 'password_confirmation', 'new-password'],
                                ].map(([label, name, autoComplete]) => (
                                    <FormField
                                        key={name}
                                        label={label}
                                        name={name}
                                        type={showPasswords ? 'text' : 'password'}
                                        value={password.data[name]}
                                        onChange={password.setData}
                                        error={password.errors[name]}
                                        autoComplete={autoComplete}
                                    />
                                ))}
                                <button type="button" onClick={() => setShowPasswords((value) => !value)} className="inline-flex items-center gap-2 text-xs font-semibold text-slate-600 hover:text-violet-700">
                                    {showPasswords ? <EyeOff size={16} /> : <Eye size={16} />}
                                    {showPasswords ? 'Hide passwords' : 'Show passwords'}
                                </button>
                                <div className="flex flex-wrap items-center gap-3 border-t border-slate-100 pt-5">
                                    <button type="submit" disabled={password.processing} className="inline-flex items-center gap-2 rounded-xl bg-slate-900 px-5 py-3 text-sm font-bold text-white hover:bg-slate-800 disabled:opacity-50">
                                        <KeyRound size={16} /> Update password
                                    </button>
                                    {password.recentlySuccessful && <span className="text-sm font-semibold text-emerald-700">Password updated.</span>}
                                </div>
                            </form>
                        </section>
                    </div>

                    <aside className="min-w-0 space-y-6">
                        <section id="centre-info" className="rounded-[22px] border border-slate-100 bg-white p-5 shadow-sm sm:p-6">
                            <p className="text-[11px] font-extrabold uppercase tracking-[0.14em] text-violet-700">Your centre</p>
                            <div className="mt-4 flex items-center gap-3">
                                <img src="/images/logo.jpg" alt="Tinta Tots Clubhouse" className="h-14 w-14 shrink-0 rounded-xl border border-slate-100 bg-white object-contain p-1" />
                                <div className="min-w-0">
                                    <h3 className="text-sm font-extrabold text-slate-900">Tinta Tots Clubhouse</h3>
                                    <p className="text-xs text-slate-500">Early childhood centre</p>
                                </div>
                            </div>
                            <div className="mt-5 space-y-4 border-t border-slate-100 pt-5 text-sm">
                                <div className="flex items-start gap-3 text-slate-600"><MapPin size={17} className="mt-0.5 shrink-0 text-violet-600" /><span>Labu, Negeri Sembilan</span></div>
                                <div className="flex items-start gap-3 text-slate-600"><Clock3 size={17} className="mt-0.5 shrink-0 text-violet-600" /><span>Monday – Friday<br /><strong className="text-slate-800">7:00 AM – 6:00 PM</strong></span></div>
                                <div className="flex items-start gap-3 text-slate-600"><UsersRound size={17} className="mt-0.5 shrink-0 text-violet-600" /><span>Admin · Teacher · Parent portal</span></div>
                            </div>
                        </section>

                        <section className="rounded-[22px] border border-slate-100 bg-white p-5 shadow-sm sm:p-6">
                            <p className="text-[11px] font-extrabold uppercase tracking-[0.14em] text-violet-700">Account settings</p>
                            <div className="mt-4 space-y-1">
                                <a href="#personal-details" className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold text-slate-700 hover:bg-violet-50"><UserRound size={17} /> Personal details</a>
                                <a href="#security" className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold text-slate-700 hover:bg-violet-50"><ShieldCheck size={17} /> Password & security</a>
                                <a href="#centre-info" className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold text-slate-700 hover:bg-violet-50"><CalendarDays size={17} /> Centre information</a>
                            </div>
                            <div className="mt-4 border-t border-slate-100 pt-4">
                                <Link href="/logout" method="post" as="button" className="inline-flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm font-semibold text-rose-700 hover:bg-rose-50"><LogOut size={17} /> Sign out</Link>
                            </div>
                        </section>

                        {profile.role === 'parent' && (
                            <Link href="/parent/children" className="flex items-center gap-3 rounded-[22px] border border-amber-200 bg-amber-50 p-5 text-sm font-bold text-amber-900 hover:bg-amber-100">
                                <UsersRound size={20} /> Update your child's details in My Children
                            </Link>
                        )}
                    </aside>
                </div>
            </div>
        </>
    );

    if (profile.role === 'teacher') {
        return <AuthenticatedLayoutTeacher activeNavId="profile">{content}</AuthenticatedLayoutTeacher>;
    }

    if (profile.role === 'parent') {
        return <AuthenticatedLayoutParent activeNavId="profile" pageTitle="My Profile">{content}</AuthenticatedLayoutParent>;
    }

    return <AuthenticatedLayout activeNavId="profile">{content}</AuthenticatedLayout>;
}
