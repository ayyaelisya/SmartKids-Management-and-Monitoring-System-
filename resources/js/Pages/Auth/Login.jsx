import { useEffect } from 'react';
import Checkbox from '@/Components/Checkbox';
import InputError from '@/Components/InputError';
import InputLabel from '@/Components/InputLabel';
import TextInput from '@/Components/TextInput';
import { Head, Link, useForm } from '@inertiajs/react';

export default function Login({ status, canResetPassword }) {
    const { data, setData, post, processing, errors, reset } = useForm({
        email: '',
        password: '',
        remember: false,
    });

    useEffect(() => {
        return () => {
            reset('password');
        };
    }, []);

    const submit = (e) => {
        e.preventDefault();
        post(route('login'));
    };

    return (
        <div className="min-h-screen bg-slate-50 flex flex-col lg:flex-row font-sans">
            <Head title="Log In - Tinta Tots Clubhouse" />

            {/* LEFT HERO PANEL (Desktop: Left Column | Mobile: Hidden) */}
            <div className="hidden lg:flex lg:w-5/12 xl:w-1/2 bg-slate-900 text-white p-12 flex-col justify-between relative overflow-hidden shrink-0">
                {/* Background Glows & Accent Grid */}
                <div className="absolute -top-24 -left-24 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
                <div className="absolute -bottom-24 -right-24 w-96 h-96 bg-amber-400/10 rounded-full blur-3xl pointer-events-none" />
                <div className="absolute inset-0 bg-[radial-gradient(#334155_1px,transparent_1px)] [background-size:24px_24px] opacity-25 pointer-events-none" />

                {/* Top Logo Header */}
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

                {/* Center Hero Banner */}
                <div className="relative z-10 max-w-md my-auto py-12">
                    <div className="w-12 h-12 rounded-2xl bg-amber-400/20 border border-amber-400/30 flex items-center justify-center text-2xl mb-6 shadow-inner">
                        🎨
                    </div>
                    <h1 className="text-4xl xl:text-5xl font-black text-white leading-tight tracking-tight mb-4">
                        Hello <br />
                        <span className="text-amber-400">Tinta Tots!</span> 👋
                    </h1>
                    <p className="text-slate-300 text-sm leading-relaxed font-medium">
                        Welcome to the Smart Kids Portal. Streamlining preschool administration, student attendance, learning logs, and parent updates in one place.
                    </p>
                </div>

                {/* Footer Copyright */}
                <div className="relative z-10 text-xs text-slate-500 font-medium">
                    © {new Date().getFullYear()} Tinta Tots Clubhouse. All rights reserved.
                </div>
            </div>

            {/* RIGHT FORM PANEL (Mobile & Desktop) */}
            <div className="flex-1 flex flex-col justify-center items-center p-6 sm:p-12 lg:p-16 bg-slate-50/50 min-h-screen lg:min-h-0">

                {/* Form Card Wrapper with Border and Elevation */}
                <div className="w-full max-w-md bg-white p-8 sm:p-10 rounded-3xl border border-slate-200/80 shadow-xl shadow-slate-200/50 space-y-8 relative z-10">

                    {/* Mobile Branding Header */}
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

                    {/* Section Heading */}
                    <div>
                        <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
                            Welcome Back!
                        </h2>
                        <p className="text-xs sm:text-sm text-slate-500 mt-1 font-medium">
                            Don't have an account?{' '}
                            <Link
                                href={route('register')}
                                className="font-bold text-amber-600 hover:text-amber-700 underline transition-colors"
                            >
                                Register as a Parent
                            </Link>
                        </p>
                    </div>

                    {/* Session Status */}
                    {status && (
                        <div className="p-3.5 rounded-xl text-xs font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200">
                            {status}
                        </div>
                    )}

                    {/* Login Form */}
                    <form onSubmit={submit} className="space-y-5">
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
                                placeholder="name@example.com"
                                className="w-full px-4 py-3 rounded-xl bg-slate-50/50 border border-slate-200 text-sm focus:border-amber-500 focus:ring-amber-500/20 transition-all text-slate-800 placeholder:text-slate-400"
                                autoComplete="username"
                                isFocused={true}
                                onChange={(e) => setData('email', e.target.value)}
                            />
                            <InputError message={errors.email} className="mt-1.5" />
                        </div>

                        <div>
                            <InputLabel
                                htmlFor="password"
                                value="Password"
                                className="text-slate-700 font-bold text-xs uppercase tracking-wider mb-1"
                            />
                            <TextInput
                                id="password"
                                type="password"
                                name="password"
                                value={data.password}
                                placeholder="••••••••"
                                className="w-full px-4 py-3 rounded-xl bg-slate-50/50 border border-slate-200 text-sm focus:border-amber-500 focus:ring-amber-500/20 transition-all text-slate-800 placeholder:text-slate-400"
                                autoComplete="current-password"
                                onChange={(e) => setData('password', e.target.value)}
                            />
                            <InputError message={errors.password} className="mt-1.5" />
                        </div>

                        <div className="flex items-center justify-between text-xs">
                            <label className="flex items-center cursor-pointer select-none">
                                <Checkbox
                                    name="remember"
                                    checked={data.remember}
                                    onChange={(e) => setData('remember', e.target.checked)}
                                    className="rounded border-slate-300 text-amber-500 focus:ring-amber-400"
                                />
                                <span className="ms-2 text-slate-600 font-semibold">Remember me</span>
                            </label>

                            {canResetPassword && (
                                <Link
                                    href={route('password.request')}
                                    className="font-bold text-slate-500 hover:text-slate-800 transition-colors"
                                >
                                    Forgot password?
                                </Link>
                            )}
                        </div>

                        <div className="pt-2">
                            <button
                                type="submit"
                                disabled={processing}
                                className="w-full py-3.5 px-4 bg-amber-400 hover:bg-amber-500 active:scale-[0.99] text-amber-950 font-black rounded-xl shadow-md shadow-amber-400/20 transition-all text-sm disabled:opacity-50 flex items-center justify-center gap-2"
                            >
                                <span>Login Now</span>
                                <span>→</span>
                            </button>
                        </div>
                    </form>

                    {/* Mobile Footer */}
                    <div className="pt-4 border-t border-slate-100 text-center lg:hidden">
                        <p className="text-[11px] text-slate-400 font-medium">
                            © {new Date().getFullYear()} Tinta Tots Clubhouse. Smart Kids System.
                        </p>
                    </div>

                </div>
            </div>
        </div>
    );
}
