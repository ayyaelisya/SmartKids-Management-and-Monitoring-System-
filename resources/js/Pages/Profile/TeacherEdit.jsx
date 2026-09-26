import { Head, Link, router, useForm } from '@inertiajs/react';
import { useState } from 'react';
import {
    ArrowLeft, BookOpen, Camera, CheckCircle2, Eye, EyeOff,
    KeyRound, LockKeyhole, Mail, MapPin, Save, School, ShieldCheck, UserRound,
} from 'lucide-react';
import AuthenticatedLayoutTeacher from '@/Layouts/AuthenticatedLayoutTeacher';

const inputClass = 'mt-2 block w-full min-w-0 rounded-xl border border-[#D5E5D9] bg-white px-4 py-3 text-sm text-[#26382B] outline-none focus:border-[#527A5D] focus:ring-2 focus:ring-[#527A5D]/15';

function Field({ label, name, value, onChange, error, type = 'text', autoComplete }) {
    return (
        <label className="block min-w-0 text-xs font-bold uppercase tracking-wide text-[#5A6E5F]">
            {label}
            <input name={name} type={type} value={value} onChange={(e) => onChange(name, e.target.value)} autoComplete={autoComplete} className={inputClass} />
            {error && <span className="mt-1 block text-xs font-medium normal-case text-rose-600">{error}</span>}
        </label>
    );
}

export default function TeacherEdit({ profile, pendingEmail, statusMessage }) {
    const account = useForm({
        full_name: profile.full_name ?? '',
        email: profile.email ?? '',
        phone_number: profile.phone_number ?? '',
        qualification: profile.qualification ?? '',
        address: profile.address ?? '',
    });
    const verification = useForm({ verification_code: '' });
    const password = useForm({ current_password: '', password: '', password_confirmation: '' });
    const photoForm = useForm({ photo: null });
    const [photoPreview, setPhotoPreview] = useState(null);
    const [showPasswords, setShowPasswords] = useState(false);

    const field = (label, name, type = 'text', autoComplete) => (
        <Field label={label} name={name} type={type} value={account.data[name]} onChange={account.setData} error={account.errors[name]} autoComplete={autoComplete} />
    );

    return (
        <AuthenticatedLayoutTeacher activeNavId="profile">
            <Head title="Teacher Profile · Tinta Tots Clubhouse" />
            <div className="mx-auto w-full max-w-[1120px] min-w-0 space-y-6 pb-8">
                <div>
                    <Link href="/teacher/dashboard" className="inline-flex items-center gap-2 text-xs font-bold text-[#527A5D] hover:underline"><ArrowLeft size={15} /> Teacher dashboard</Link>
                    <h1 className="mt-2 text-2xl font-black text-[#26382B] sm:text-3xl">My Teacher Profile</h1>
                    <p className="mt-1 text-sm text-[#6B7D70]">Your teaching information and account settings.</p>
                </div>

                <div className="relative overflow-hidden rounded-[26px] bg-[#527A5D] p-5 text-white shadow-lg sm:p-7">
                    <div className="absolute -right-10 -top-12 h-40 w-40 rounded-full bg-white/10" />
                    <div className="relative flex flex-wrap items-center gap-4">
                        <div className="flex h-20 w-20 shrink-0 items-center justify-center overflow-hidden rounded-2xl border-4 border-white bg-[#8DB799] text-3xl font-black text-white shadow-md">
                            {photoPreview || profile.profile_photo_url
                                ? <img src={photoPreview || profile.profile_photo_url} alt="Teacher profile" className="h-full w-full object-cover" />
                                : profile.full_name?.charAt(0).toUpperCase()}
                        </div>
                        <div className="min-w-0 flex-1">
                            <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-[#CDE7D1]">Tinta Tots Clubhouse · Educator</p>
                            <h2 className="mt-1 truncate text-xl font-extrabold sm:text-2xl">{profile.full_name}</h2>
                            <p className="mt-1 break-all text-sm text-white/80">{profile.email}</p>
                        </div>
                        <span className="rounded-full border border-white/30 bg-white/15 px-3 py-1.5 text-xs font-bold capitalize">{profile.status} teacher</span>
                    </div>
                </div>

                <form
                    onSubmit={(e) => {
                        e.preventDefault();
                        photoForm.post('/profile/photo', {
                            forceFormData: true,
                            preserveScroll: true,
                            onSuccess: () => { photoForm.reset(); setPhotoPreview(null); },
                        });
                    }}
                    className="flex flex-wrap items-center gap-3 rounded-2xl border border-[#E2ECE4] bg-white p-4 shadow-sm"
                >
                    <Camera size={19} className="text-[#527A5D]" />
                    <div className="min-w-0 flex-1">
                        <p className="text-sm font-bold text-[#26382B]">Teacher profile picture</p>
                        <p className="text-xs text-[#6B7D70]">JPG, PNG or WebP · maximum 2 MB</p>
                    </div>
                    <input
                        type="file"
                        accept="image/jpeg,image/png,image/webp"
                        aria-label="Choose teacher profile picture"
                        onChange={(e) => {
                            const file = e.target.files?.[0] ?? null;
                            photoForm.setData('photo', file);
                            setPhotoPreview(file ? URL.createObjectURL(file) : null);
                        }}
                        className="w-full max-w-[220px] text-xs text-[#5A6E5F] file:mr-3 file:rounded-lg file:border-0 file:bg-[#E8F2E9] file:px-3 file:py-2 file:font-bold file:text-[#527A5D]"
                    />
                    <button type="submit" disabled={!photoForm.data.photo || photoForm.processing} className="rounded-xl bg-[#527A5D] px-4 py-2.5 text-xs font-bold text-white disabled:opacity-50">Upload photo</button>
                    {photoForm.errors.photo && <p className="w-full text-xs text-rose-600">{photoForm.errors.photo}</p>}
                </form>

                {pendingEmail && (
                    <section className="rounded-2xl border border-amber-200 bg-amber-50 p-5 sm:p-6">
                        <h2 className="flex items-center gap-2 text-base font-bold text-slate-900"><Mail size={18} /> Verify new email</h2>
                        <p className="mt-2 text-sm text-slate-600">Enter the six-digit code sent to <strong>{pendingEmail}</strong>. Your current email remains active until verification.</p>
                        {statusMessage && <p className="mt-2 text-sm text-emerald-700">{statusMessage}</p>}
                        <form onSubmit={(e) => { e.preventDefault(); verification.post('/profile/verify-email', { preserveScroll: true }); }} className="mt-4 flex flex-wrap items-end gap-3">
                            <label className="text-xs font-bold text-slate-600">Verification code
                                <input inputMode="numeric" maxLength={6} value={verification.data.verification_code} onChange={(e) => verification.setData('verification_code', e.target.value)} className={`${inputClass} w-44`} />
                            </label>
                            <button disabled={verification.processing} className="rounded-xl bg-[#527A5D] px-5 py-3 text-sm font-bold text-white disabled:opacity-50">Verify email</button>
                        </form>
                        {verification.errors.verification_code && <p className="mt-2 text-xs text-rose-600">{verification.errors.verification_code}</p>}
                        <button type="button" onClick={() => router.delete('/profile/pending-email')} className="mt-4 text-xs font-semibold text-slate-600 underline">Cancel email change</button>
                    </section>
                )}

                <div className="grid min-w-0 grid-cols-1 items-start gap-6 lg:grid-cols-[minmax(0,1fr)_290px]">
                    <div className="min-w-0 space-y-6">
                        <section className="rounded-[22px] border border-[#E2ECE4] bg-white p-5 shadow-sm sm:p-7">
                            <div className="mb-6 flex items-start gap-3 border-b border-[#E9F0EA] pb-5">
                                <div className="rounded-xl bg-[#E8F2E9] p-2.5 text-[#527A5D]"><UserRound size={20} /></div>
                                <div><h3 className="text-lg font-extrabold text-[#26382B]">Personal & teaching details</h3><p className="text-sm text-[#6B7D70]">Update how your details appear in the teacher portal.</p></div>
                            </div>
                            <form onSubmit={(e) => { e.preventDefault(); account.patch('/profile', { preserveScroll: true }); }} className="space-y-5">
                                <div className="grid gap-5 sm:grid-cols-2">
                                    {field('Full name', 'full_name', 'text', 'name')}
                                    {field('Phone number', 'phone_number', 'tel', 'tel')}
                                </div>
                                {field('Email address', 'email', 'email', 'email')}
                                <p className="flex items-start gap-2 text-xs text-[#6B7D70]"><ShieldCheck size={15} className="shrink-0" /> A code will be sent to a new email address before it becomes your login email.</p>
                                <div className="grid gap-5 sm:grid-cols-2">
                                    {field('Qualification', 'qualification')}
                                    {field('Address', 'address')}
                                </div>
                                <div className="flex flex-wrap items-center gap-3 border-t border-[#E9F0EA] pt-5">
                                    <button disabled={account.processing} className="inline-flex items-center gap-2 rounded-xl bg-[#527A5D] px-5 py-3 text-sm font-bold text-white hover:bg-[#42684D] disabled:opacity-50"><Save size={16} /> Save profile</button>
                                    {account.recentlySuccessful && <span className="text-sm font-semibold text-emerald-700">Saved successfully.</span>}
                                </div>
                            </form>
                        </section>

                        <section className="rounded-[22px] border border-[#E2ECE4] bg-white p-5 shadow-sm sm:p-7">
                            <div className="mb-6 flex items-start gap-3 border-b border-[#E9F0EA] pb-5">
                                <div className="rounded-xl bg-[#E8F2E9] p-2.5 text-[#527A5D]"><LockKeyhole size={20} /></div>
                                <div><h3 className="text-lg font-extrabold text-[#26382B]">Password & security</h3><p className="text-sm text-[#6B7D70]">Protect access to student information.</p></div>
                            </div>
                            <form onSubmit={(e) => { e.preventDefault(); password.put('/password', { preserveScroll: true, onSuccess: () => password.reset() }); }} className="space-y-5">
                                {[
                                    ['Current password', 'current_password', 'current-password'],
                                    ['New password', 'password', 'new-password'],
                                    ['Confirm new password', 'password_confirmation', 'new-password'],
                                ].map(([label, name, autoComplete]) => (
                                    <Field key={name} label={label} name={name} type={showPasswords ? 'text' : 'password'} value={password.data[name]} onChange={password.setData} error={password.errors[name]} autoComplete={autoComplete} />
                                ))}
                                <button type="button" onClick={() => setShowPasswords((value) => !value)} className="inline-flex items-center gap-2 text-xs font-bold text-[#527A5D]">{showPasswords ? <EyeOff size={16} /> : <Eye size={16} />}{showPasswords ? 'Hide passwords' : 'Show passwords'}</button>
                                <div className="flex flex-wrap items-center gap-3 border-t border-[#E9F0EA] pt-5">
                                    <button type="submit" disabled={password.processing} style={{ backgroundColor: '#26382B', color: '#ffffff', minHeight: 46 }} className="inline-flex items-center gap-2 rounded-xl px-5 py-3 text-sm font-bold shadow-sm disabled:opacity-50"><KeyRound size={16} /> {password.processing ? 'Updating...' : 'Update password'}</button>
                                    {password.recentlySuccessful && <span className="text-sm font-semibold text-emerald-700">Password updated.</span>}
                                </div>
                            </form>
                        </section>
                    </div>

                    <aside className="min-w-0 space-y-6">
                        <section className="rounded-[22px] border border-[#E2ECE4] bg-white p-5 shadow-sm">
                            <p className="text-[11px] font-extrabold uppercase tracking-widest text-[#527A5D]">Your centre</p>
                            <h3 className="mt-3 text-lg font-extrabold text-[#26382B]">Tinta Tots Clubhouse</h3>
                            <div className="mt-4 space-y-3 text-sm text-[#5A6E5F]">
                                <p className="flex items-start gap-2"><MapPin size={17} className="shrink-0 text-[#527A5D]" /> Labu, Negeri Sembilan</p>
                                <p className="flex items-start gap-2"><School size={17} className="shrink-0 text-[#527A5D]" /> Weekdays, 7:00 AM – 6:00 PM</p>
                            </div>
                        </section>
                        <Link href="/teacher/classes" className="flex items-center gap-3 rounded-[22px] bg-[#E8F2E9] p-5 text-sm font-bold text-[#355B3F] hover:bg-[#DDEBDD]"><BookOpen size={20} /> Go to My Classes</Link>
                        <div className="flex items-center gap-2 rounded-xl px-1 text-xs text-[#6B7D70]"><CheckCircle2 size={16} /> Your role is managed by the administrator.</div>
                    </aside>
                </div>
            </div>
        </AuthenticatedLayoutTeacher>
    );
}
