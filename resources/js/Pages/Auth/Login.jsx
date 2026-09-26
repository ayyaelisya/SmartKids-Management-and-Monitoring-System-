import { useState } from 'react';
import { Head, Link, useForm } from '@inertiajs/react';
import InputError from '@/Components/InputError';
import AuthScene, { authButton, authInput } from '@/Layouts/AuthScene';

export default function Login({ status, canResetPassword }) {
    const [showPassword, setShowPassword] = useState(false);
    const { data, setData, post, processing, errors, reset } = useForm({ email: '', password: '', remember: false });

    const submit = (event) => {
        event.preventDefault();
        post(route('login'), { onFinish: () => reset('password') });
    };

    return (
        <AuthScene title="Welcome back">
            <Head title="Login · Tinta Tots Clubhouse" />
            {status && <p role="status" className="mt-6 rounded-xl bg-[#E6F5E9] p-3 text-sm font-semibold text-[#276447]">{status}</p>}
            <form onSubmit={submit} className="mt-7 space-y-5">
                <div>
                    <label htmlFor="email" className="text-sm font-bold">Email address</label>
                    <input id="email" name="email" type="email" value={data.email} onChange={(event) => setData('email', event.target.value)} autoComplete="username" placeholder="name@example.com" required autoFocus className={authInput} />
                    <InputError message={errors.email} className="mt-2" />
                </div>
                <div>
                    <label htmlFor="password" className="text-sm font-bold">Password</label>
                    <div className="relative">
                        <input id="password" name="password" type={showPassword ? 'text' : 'password'} value={data.password} onChange={(event) => setData('password', event.target.value)} autoComplete="current-password" placeholder="Enter your password" required className={`${authInput} pr-20`} />
                        <button type="button" onClick={() => setShowPassword(!showPassword)} aria-label={showPassword ? 'Hide password' : 'Show password'} className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-bold text-[#35775A]">{showPassword ? 'Hide' : 'Show'}</button>
                    </div>
                    <InputError message={errors.password} className="mt-2" />
                </div>
                <div className="flex flex-wrap items-center justify-between gap-3 text-sm">
                    <label className="inline-flex items-center gap-2 text-[#506B5A]"><input type="checkbox" checked={data.remember} onChange={(event) => setData('remember', event.target.checked)} className="rounded border-[#B7D3BE] text-[#2F7359] focus:ring-[#8CCBA2]" />Remember me</label>
                    {canResetPassword && <Link href={route('password.request')} className="font-bold text-[#2F7359] hover:underline">Forgot password?</Link>}
                </div>
                <button type="submit" disabled={processing} className={authButton}>{processing ? 'Signing in…' : 'Login'}</button>
            </form>
            <p className="mt-6 text-center text-sm text-[#5C7567]">New parent? <Link href={route('register')} className="font-bold text-[#B64E7B] hover:underline">Create an account</Link></p>
        </AuthScene>
    );
}
