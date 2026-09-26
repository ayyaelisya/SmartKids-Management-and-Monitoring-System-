import { useState } from 'react';
import { Head, Link, router, useForm } from '@inertiajs/react';
import InputError from '@/Components/InputError';
import AuthScene, { authButton, authInput } from '@/Layouts/AuthScene';

function Field({ label, name, value, onChange, error, type = 'text', placeholder = '', children }) {
    return (
        <div>
            <label htmlFor={name} className="text-sm font-bold">{label}</label>
            {children || <input id={name} name={name} type={type} value={value} onChange={onChange} placeholder={placeholder} required className={authInput} />}
            <InputError message={error} className="mt-2" />
        </div>
    );
}

export default function Register({ verificationEmail = null, status = null }) {
    const [showPassword, setShowPassword] = useState(false);
    const [resending, setResending] = useState(false);
    const [resendMessage, setResendMessage] = useState('');
    const { data, setData, post, processing, errors, reset } = useForm({
        full_name: '', email: '', phone_number: '', relationship: 'Father', address: '',
        child_name: '', child_ic: '', password: '', password_confirmation: '',
    });
    const { data: otpData, setData: setOtpData, post: postOtp, processing: verifying, errors: otpErrors } = useForm({ code: '' });

    const submit = (event) => {
        event.preventDefault();
        post(route('register'), { onFinish: () => reset('password', 'password_confirmation') });
    };
    const verifyCode = (event) => {
        event.preventDefault();
        postOtp(route('verification.code.verify'), { preserveScroll: true });
    };
    const resendCode = () => {
        setResendMessage('');
        router.post(route('verification.code.resend'), {}, {
            preserveScroll: true,
            onStart: () => setResending(true),
            onSuccess: () => {
                setOtpData('code', '');
                setResendMessage('A new code has been sent. Check your inbox or spam folder.');
            },
            onFinish: () => setResending(false),
        });
    };
    const change = (name) => (event) => setData(name, event.target.value);

    return (
        <AuthScene title="Parent registration" wide>
            <Head title="Register · Tinta Tots Clubhouse" />
            <form onSubmit={submit} className="mt-7 space-y-6">
                <section>
                    <h2 className="mb-4 border-b border-[#D8EADD] pb-2 text-sm font-extrabold text-[#2F7359]">Parent details</h2>
                    <div className="grid gap-4 sm:grid-cols-2">
                        <Field label="Full name" name="full_name" value={data.full_name} onChange={change('full_name')} error={errors.full_name} />
                        <Field label="Email address" name="email" type="email" value={data.email} onChange={change('email')} error={errors.email} placeholder="name@example.com" />
                        <Field label="Phone number" name="phone_number" type="tel" value={data.phone_number} onChange={change('phone_number')} error={errors.phone_number} />
                        <Field label="Relationship" name="relationship" error={errors.relationship}>
                            <select id="relationship" name="relationship" value={data.relationship} onChange={change('relationship')} className={authInput}>
                                <option value="Father">Father</option><option value="Mother">Mother</option><option value="Guardian">Guardian</option>
                            </select>
                        </Field>
                        <div className="sm:col-span-2">
                            <Field label="Home address" name="address" error={errors.address}>
                                <textarea id="address" name="address" rows={2} value={data.address} onChange={change('address')} required className={authInput} />
                            </Field>
                        </div>
                    </div>
                </section>
                <section>
                    <h2 className="mb-4 border-b border-[#D8EADD] pb-2 text-sm font-extrabold text-[#2F7359]">Child details</h2>
                    <div className="grid gap-4 sm:grid-cols-2">
                        <Field label="Child full name" name="child_name" value={data.child_name} onChange={change('child_name')} error={errors.child_name} />
                        <Field label="Child NRIC / MyKid" name="child_ic" value={data.child_ic} onChange={change('child_ic')} error={errors.child_ic} />
                    </div>
                </section>
                <section>
                    <h2 className="mb-4 border-b border-[#D8EADD] pb-2 text-sm font-extrabold text-[#2F7359]">Create password</h2>
                    <div className="grid gap-4 sm:grid-cols-2">
                        <Field label="Password" name="password" error={errors.password}>
                            <input id="password" name="password" type={showPassword ? 'text' : 'password'} value={data.password} onChange={change('password')} minLength={8} autoComplete="new-password" required className={authInput} />
                        </Field>
                        <Field label="Confirm password" name="password_confirmation" error={errors.password_confirmation}>
                            <input id="password_confirmation" name="password_confirmation" type={showPassword ? 'text' : 'password'} value={data.password_confirmation} onChange={change('password_confirmation')} minLength={8} autoComplete="new-password" required className={authInput} />
                        </Field>
                    </div>
                    <label className="mt-3 inline-flex items-center gap-2 text-sm text-[#506B5A]"><input type="checkbox" checked={showPassword} onChange={(event) => setShowPassword(event.target.checked)} className="rounded border-[#B7D3BE] text-[#2F7359]" />Show passwords</label>
                </section>
                <button type="submit" disabled={processing || Boolean(verificationEmail)} className={authButton}>{processing ? 'Submitting…' : 'Create account'}</button>
            </form>
            <p className="mt-5 text-center text-sm text-[#5C7567]">Already registered? <Link href={route('login')} className="font-bold text-[#B64E7B] hover:underline">Login</Link></p>

            {verificationEmail && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#163D2B]/60 p-4 backdrop-blur-sm">
                    <div role="dialog" aria-modal="true" aria-labelledby="otp-title" className="w-full max-w-md rounded-[28px] border border-white bg-[#F9FDF9] p-6 shadow-2xl sm:p-8">
                        <h2 id="otp-title" className="text-2xl font-black">Verify your email</h2>
                        <p className="mt-3 text-sm text-[#5C7567]">Enter the 6-digit code sent to <strong className="break-all text-[#244E42]">{verificationEmail}</strong> within 10 minutes.</p>
                        {status && <p role="status" className="mt-4 rounded-xl bg-[#E6F5E9] p-3 text-sm text-[#276447]">{status}</p>}
                        {resendMessage && <p role="status" className="mt-4 rounded-xl bg-[#E6F5E9] p-3 text-sm text-[#276447]">{resendMessage}</p>}
                        <form onSubmit={verifyCode} className="mt-6 space-y-4">
                            <Field label="Verification code" name="verification_code" error={otpErrors.code}>
                                <input id="verification_code" type="text" inputMode="numeric" autoComplete="one-time-code" maxLength={6} value={otpData.code} onChange={(event) => setOtpData('code', event.target.value.replace(/\D/g, '').slice(0, 6))} required className={`${authInput} text-center text-xl tracking-[0.3em]`} />
                            </Field>
                            <button type="submit" disabled={verifying || otpData.code.length !== 6} className={authButton}>{verifying ? 'Verifying…' : 'Verify email'}</button>
                        </form>
                        <button type="button" onClick={resendCode} disabled={resending} className="mt-5 w-full text-center text-sm font-bold text-[#2F7359] hover:underline disabled:opacity-50">{resending ? 'Sending…' : 'Resend code'}</button>
                    </div>
                </div>
            )}
        </AuthScene>
    );
}
