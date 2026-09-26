import { Head, Link, router, useForm } from '@inertiajs/react';
import { useState } from 'react';
import {
    ArrowLeft, Baby, Camera, CheckCircle2, ChevronRight, Eye, EyeOff,
    Heart, KeyRound, LockKeyhole, Mail, MapPin, Save, ShieldCheck, UserRound,
} from 'lucide-react';
import AuthenticatedLayoutParent from '@/Layouts/AuthenticatedLayoutParent';

const inputClass = 'mt-2 block w-full min-w-0 rounded-xl border border-[#E8DFC9] bg-[#FFFEFB] px-4 py-3 text-sm text-[#3C3528] outline-none focus:border-[#D6A62B] focus:ring-2 focus:ring-amber-100';

function Field({ label, name, value, onChange, error, type = 'text', autoComplete }) {
    return (
        <label className="block min-w-0 text-xs font-bold uppercase tracking-wide text-[#756B59]">
            {label}
            <input name={name} type={type} value={value} onChange={(e) => onChange(name, e.target.value)} autoComplete={autoComplete} className={inputClass} />
            {error && <span className="mt-1 block text-xs font-medium normal-case text-rose-600">{error}</span>}
        </label>
    );
}

export default function ParentEdit({ profile, pendingEmail, statusMessage }) {
    const account = useForm({
        full_name: profile.full_name ?? '',
        email: profile.email ?? '',
        phone_number: profile.phone_number ?? '',
        address: profile.address ?? '',
        relationship: profile.relationship ?? 'guardian',
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
        <AuthenticatedLayoutParent activeNavId="profile" pageTitle="My Profile" pageSubtitle="Parent Portal">
            <Head title="Parent Profile · Tinta Tots Clubhouse" />
            <div className="mx-auto w-full max-w-[1050px] min-w-0 space-y-5 pb-8 sm:space-y-6">
                <div>
                    <Link href="/parent/dashboard" className="inline-flex items-center gap-2 text-xs font-bold text-[#A67C17] hover:underline"><ArrowLeft size={15} /> Back to home</Link>
                    <h1 className="mt-2 text-2xl font-black text-[#342F25] sm:text-3xl">My Account</h1>
                    <p className="mt-1 text-sm text-[#817866]">Your contact details and account security in one place.</p>
                </div>

                <div className="relative overflow-hidden rounded-[26px] border border-[#ECD68F] bg-gradient-to-r from-[#F8D76A] to-[#F9E8AA] p-5 shadow-sm sm:p-7">
                    <div className="absolute -right-8 -top-14 h-40 w-40 rounded-full bg-white/30" />
                    <div className="relative flex flex-wrap items-center gap-4">
                        <div className="flex h-20 w-20 shrink-0 items-center justify-center overflow-hidden rounded-2xl border-4 border-white bg-amber-100 text-3xl font-black text-amber-800 shadow-sm">
                            {photoPreview || profile.profile_photo_url
                                ? <img src={photoPreview || profile.profile_photo_url} alt="Parent profile" className="h-full w-full object-cover" />
                                : (profile.full_name || 'P').charAt(0).toUpperCase()}
                        </div>
                        <div className="min-w-0 flex-1">
                            <p className="text-[11px] font-extrabold uppercase tracking-widest text-[#876718]">Tinta Tots Clubhouse · Parent Portal</p>
                            <h2 className="mt-1 truncate text-xl font-black text-[#342F25] sm:text-2xl">{profile.full_name}</h2>
                            <p className="mt-1 break-all text-sm text-[#62583F]">{profile.email}</p>
                        </div>
                        <span className="rounded-full bg-white/70 px-3 py-1.5 text-xs font-bold capitalize text-[#72561A]">{profile.status} parent</span>
                    </div>
                </div>

                <form onSubmit={(e) => {
                    e.preventDefault();
                    photoForm.post('/profile/photo', {
                        forceFormData: true,
                        preserveScroll: true,
                        onSuccess: () => { photoForm.reset(); setPhotoPreview(null); },
                    });
                }} className="flex flex-wrap items-center gap-3 rounded-2xl border border-[#F0DEAD] bg-white p-4 shadow-sm">
                    <Camera size={19} className="text-amber-700" />
                    <label className="min-w-0 flex-1 text-xs font-bold text-[#756B59]">Profile picture · JPG, PNG or WebP, max 2 MB
                        <input type="file" accept="image/jpeg,image/png,image/webp" className="mt-2 block w-full text-xs" onChange={(e) => {
                            const file = e.target.files?.[0] || null;
                            photoForm.setData('photo', file);
                            setPhotoPreview(file ? URL.createObjectURL(file) : null);
                        }} />
                    </label>
                    <button type="submit" disabled={!photoForm.data.photo || photoForm.processing} className="rounded-xl bg-[#B38519] px-4 py-2.5 text-xs font-bold text-white disabled:opacity-50">Upload photo</button>
                    {photoForm.errors.photo && <p className="w-full text-xs text-rose-600">{photoForm.errors.photo}</p>}
                </form>

                <Link href="/parent/children" className="flex items-center gap-3 rounded-2xl border border-[#F0DEAD] bg-white p-4 shadow-sm transition hover:border-amber-400 hover:bg-amber-50 sm:p-5">
                    <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-amber-100 text-amber-700"><Baby size={22} /></span>
                    <span className="min-w-0 flex-1"><strong className="block text-sm text-[#342F25]">My Children</strong><span className="mt-0.5 block text-xs text-[#817866]">View and update your child's details</span></span>
                    <ChevronRight size={18} className="shrink-0 text-amber-700" />
                </Link>

                {pendingEmail && (
                    <section className="rounded-2xl border border-amber-300 bg-white p-5 shadow-sm sm:p-6">
                        <h2 className="flex items-center gap-2 text-base font-bold text-[#342F25]"><Mail size={18} className="text-amber-700" /> Verify new email</h2>
                        <p className="mt-2 text-sm text-[#756B59]">Enter the six-digit code sent to <strong>{pendingEmail}</strong>. Your old email remains active until verification.</p>
                        {statusMessage && <p className="mt-2 text-sm text-emerald-700">{statusMessage}</p>}
                        <form onSubmit={(e) => { e.preventDefault(); verification.post('/profile/verify-email', { preserveScroll: true }); }} className="mt-4 flex flex-wrap items-end gap-3">
                            <label className="text-xs font-bold text-[#756B59]">Verification code
                                <input inputMode="numeric" maxLength={6} value={verification.data.verification_code} onChange={(e) => verification.setData('verification_code', e.target.value)} className={`${inputClass} w-44`} />
                            </label>
                            <button disabled={verification.processing} className="rounded-xl bg-[#B38519] px-5 py-3 text-sm font-bold text-white disabled:opacity-50">Verify email</button>
                        </form>
                        {verification.errors.verification_code && <p className="mt-2 text-xs text-rose-600">{verification.errors.verification_code}</p>}
                        <button type="button" onClick={() => router.delete('/profile/pending-email')} className="mt-4 text-xs font-semibold text-[#756B59] underline">Cancel email change</button>
                    </section>
                )}

                <div className="grid min-w-0 grid-cols-1 items-start gap-6 lg:grid-cols-[minmax(0,1fr)_280px]">
                    <div className="min-w-0 space-y-6">
                        <section className="rounded-[22px] border border-[#F0E7D1] bg-white p-5 shadow-sm sm:p-7">
                            <div className="mb-6 flex items-start gap-3 border-b border-[#F4EEDB] pb-5">
                                <div className="rounded-xl bg-amber-100 p-2.5 text-amber-700"><UserRound size={20} /></div>
                                <div><h3 className="text-lg font-extrabold text-[#342F25]">My details</h3><p className="text-sm text-[#817866]">Keep your contact information up to date.</p></div>
                            </div>
                            <form onSubmit={(e) => { e.preventDefault(); account.patch('/profile', { preserveScroll: true }); }} className="space-y-5">
                                {field('Full name', 'full_name', 'text', 'name')}
                                <div className="grid gap-5 sm:grid-cols-2">
                                    {field('Phone number', 'phone_number', 'tel', 'tel')}
                                    <label className="block text-xs font-bold uppercase tracking-wide text-[#756B59]">Relationship
                                        <select value={account.data.relationship} onChange={(e) => account.setData('relationship', e.target.value)} className={inputClass}>
                                            <option value="father">Father</option>
                                            <option value="mother">Mother</option>
                                            <option value="guardian">Guardian</option>
                                        </select>
                                        {account.errors.relationship && <span className="mt-1 block text-xs text-rose-600">{account.errors.relationship}</span>}
                                    </label>
                                </div>
                                {field('Email address', 'email', 'email', 'email')}
                                <p className="flex items-start gap-2 text-xs text-[#817866]"><ShieldCheck size={15} className="shrink-0" /> Changing your email requires a verification code sent to the new address.</p>
                                {field('Home address', 'address')}
                                <div className="flex flex-wrap items-center gap-3 border-t border-[#F4EEDB] pt-5">
                                    <button disabled={account.processing} className="inline-flex items-center gap-2 rounded-xl bg-[#B38519] px-5 py-3 text-sm font-bold text-white hover:bg-[#926B0F] disabled:opacity-50"><Save size={16} /> Save my details</button>
                                    {account.recentlySuccessful && <span className="text-sm font-semibold text-emerald-700">Saved successfully.</span>}
                                </div>
                            </form>
                        </section>

                        <section className="rounded-[22px] border border-[#F0E7D1] bg-white p-5 shadow-sm sm:p-7">
                            <div className="mb-6 flex items-start gap-3 border-b border-[#F4EEDB] pb-5">
                                <div className="rounded-xl bg-amber-100 p-2.5 text-amber-700"><LockKeyhole size={20} /></div>
                                <div><h3 className="text-lg font-extrabold text-[#342F25]">Password & security</h3><p className="text-sm text-[#817866]">Update the password for your parent account.</p></div>
                            </div>
                            <form onSubmit={(e) => { e.preventDefault(); password.put('/password', { preserveScroll: true, onSuccess: () => password.reset() }); }} className="space-y-5">
                                {[
                                    ['Current password', 'current_password', 'current-password'],
                                    ['New password', 'password', 'new-password'],
                                    ['Confirm new password', 'password_confirmation', 'new-password'],
                                ].map(([label, name, autoComplete]) => (
                                    <Field key={name} label={label} name={name} type={showPasswords ? 'text' : 'password'} value={password.data[name]} onChange={password.setData} error={password.errors[name]} autoComplete={autoComplete} />
                                ))}
                                <button type="button" onClick={() => setShowPasswords((value) => !value)} className="inline-flex items-center gap-2 text-xs font-bold text-[#A67C17]">{showPasswords ? <EyeOff size={16} /> : <Eye size={16} />}{showPasswords ? 'Hide passwords' : 'Show passwords'}</button>
                                <div className="flex flex-wrap items-center gap-3 border-t border-[#F4EEDB] pt-5">
                                    <button type="submit" disabled={password.processing} style={{ backgroundColor: '#342F25', color: '#ffffff', minHeight: 46 }} className="inline-flex items-center gap-2 rounded-xl px-5 py-3 text-sm font-bold shadow-sm disabled:opacity-50"><KeyRound size={16} /> {password.processing ? 'Updating...' : 'Update password'}</button>
                                    {password.recentlySuccessful && <span className="text-sm font-semibold text-emerald-700">Password updated.</span>}
                                </div>
                            </form>
                        </section>
                    </div>

                    <aside className="min-w-0 space-y-5">
                        <section className="rounded-[22px] border border-[#F0E7D1] bg-white p-5 shadow-sm">
                            <p className="text-[11px] font-extrabold uppercase tracking-widest text-[#A67C17]">Our centre</p>
                            <div className="mt-4 flex items-center gap-3"><img src="/images/logo.jpg" alt="Tinta Tots Clubhouse" className="h-14 w-14 rounded-xl border border-amber-100 object-contain p-1" /><strong className="text-sm text-[#342F25]">Tinta Tots Clubhouse</strong></div>
                            <div className="mt-4 space-y-3 border-t border-[#F4EEDB] pt-4 text-sm text-[#756B59]">
                                <p className="flex items-start gap-2"><MapPin size={17} className="shrink-0 text-amber-700" /> Labu, Negeri Sembilan</p>
                                <p>Monday – Friday · 7:00 AM – 6:00 PM</p>
                            </div>
                        </section>
                        <div className="flex items-start gap-2 rounded-2xl bg-[#FFF0C9] p-4 text-xs leading-5 text-[#725B20]"><Heart size={17} className="shrink-0" /> Changes to your child's information are made in My Children.</div>
                        <div className="flex items-center gap-2 px-1 text-xs text-[#817866]"><CheckCircle2 size={16} /> Your account is {profile.status}.</div>
                    </aside>
                </div>
            </div>
        </AuthenticatedLayoutParent>
    );
}
