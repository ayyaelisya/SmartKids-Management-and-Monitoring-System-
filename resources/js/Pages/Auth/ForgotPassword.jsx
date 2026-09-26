import { Head, Link, useForm } from '@inertiajs/react';
import InputError from '@/Components/InputError';

export default function ForgotPassword({ status }) {
    const { data, setData, post, processing, errors } = useForm({ email: '' });

    const submit = (event) => {
        event.preventDefault();
        post(route('password.email'));
    };

    return (
        <div className="min-h-screen bg-[#F8FBF6] font-sans text-[#244E42]">
            <Head title="Forgot Password · Tinta Tots Clubhouse" />

            <div className="grid min-h-screen lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)]">
                <aside className="relative hidden overflow-hidden bg-[#EAF6EC] p-10 lg:flex lg:flex-col lg:justify-between xl:p-14">
                    <div className="absolute -right-24 -top-28 h-80 w-80 rounded-full bg-[#FBE6A1]/70" />
                    <div className="absolute -bottom-28 -left-28 h-80 w-80 rounded-full bg-[#C7E9F0]/80" />
                    <div className="absolute bottom-24 right-10 h-24 w-24 rounded-full bg-[#F9C9DD]/70" />

                    <Link href="/" className="relative z-10 inline-flex w-fit items-center gap-3">
                        <img src="/images/logo.jpg" alt="Tinta Tots Clubhouse logo" className="h-14 w-14 rounded-2xl bg-white object-contain p-1 shadow-sm" />
                        <span className="text-lg font-black leading-tight">
                            Tinta Tots
                            <span className="block text-[11px] font-extrabold tracking-[0.24em] text-[#D76696]">CLUBHOUSE</span>
                        </span>
                    </Link>

                    <div className="relative z-10 max-w-lg py-12">
                        <span className="inline-flex rounded-full bg-white/80 px-4 py-2 text-xs font-bold tracking-wide text-[#467B60]">
                            SMART KIDS PORTAL
                        </span>
                        <h1 className="mt-7 text-5xl font-black leading-[1.12] tracking-tight xl:text-6xl">
                            Let’s get you
                            <br />
                            <span className="text-[#DB729E]">back in.</span>
                        </h1>
                        <p className="mt-6 max-w-md text-base leading-8 text-[#5C7567]">
                            Request a secure link and continue sharing in your child’s journey.
                        </p>
                        <div className="mt-10 flex flex-wrap gap-3">
                            <span className="rounded-full bg-white px-4 py-2 text-xs font-bold text-[#4D8064] shadow-sm">✦ Secure access</span>
                            <span className="rounded-full bg-[#FFF0BA] px-4 py-2 text-xs font-bold text-[#806926]">♡ Stay connected</span>
                        </div>
                    </div>

                    <p className="relative z-10 text-xs text-[#70897A]">© {new Date().getFullYear()} Tinta Tots Clubhouse</p>
                </aside>

                <main className="flex min-w-0 flex-col items-center justify-center px-5 py-10 sm:px-10 lg:px-14">
                    <div className="w-full max-w-[480px]">
                        <Link href="/" className="mb-10 inline-flex items-center gap-3 lg:hidden">
                            <img src="/images/logo.jpg" alt="Tinta Tots Clubhouse logo" className="h-12 w-12 rounded-2xl bg-white object-contain p-1 shadow-sm" />
                            <span className="font-black">Tinta Tots Clubhouse</span>
                        </Link>

                        <Link href={route('login')} className="inline-flex items-center gap-2 text-sm font-bold text-[#678675] transition hover:text-[#244E42]">
                            <span aria-hidden="true">←</span> Back to login
                        </Link>

                        <div className="mt-8 flex h-14 w-14 items-center justify-center rounded-2xl bg-[#E3F2E8] text-2xl" aria-hidden="true">✉</div>
                        <h2 className="mt-6 text-3xl font-black tracking-tight sm:text-4xl">Forgot your password?</h2>
                        <p className="mt-3 text-sm leading-7 text-[#6A8071]">
                            Enter the email linked to your account. We’ll send you a link to create a new password.
                        </p>

                        {status && (
                            <p role="status" className="mt-6 rounded-2xl border border-[#CDE8D0] bg-[#EBF8ED] p-4 text-sm font-semibold text-[#356746]">
                                {status}
                            </p>
                        )}

                        <form onSubmit={submit} className="mt-9 space-y-5">
                            <div>
                                <label htmlFor="email" className="text-sm font-bold">Email address</label>
                                <input
                                    id="email"
                                    type="email"
                                    name="email"
                                    value={data.email}
                                    onChange={(event) => setData('email', event.target.value)}
                                    autoComplete="email"
                                    placeholder="name@example.com"
                                    required
                                    autoFocus
                                    className="mt-2 block w-full rounded-2xl border border-[#D9E8DE] bg-[#FAFDF9] px-4 py-3.5 text-sm text-[#244E42] placeholder:text-[#9AAFA3] outline-none transition focus:border-[#67B38B] focus:ring-4 focus:ring-[#DDF4E5]"
                                />
                                <InputError message={errors.email} className="mt-2" />
                            </div>
                            <button
                                type="submit"
                                disabled={processing}
                                className="flex w-full items-center justify-center gap-2 rounded-2xl bg-[#244E42] px-5 py-4 text-sm font-extrabold text-white shadow-lg shadow-[#244E42]/15 transition hover:-translate-y-0.5 hover:bg-[#316C53] disabled:cursor-wait disabled:opacity-60"
                            >
                                {processing ? 'Sending link…' : 'Send reset link'}
                                {!processing && <span aria-hidden="true">→</span>}
                            </button>
                        </form>

                        <p className="mt-8 text-center text-xs leading-6 text-[#829689]">
                            Check your inbox and spam folder. The link expires after 60 minutes.
                        </p>
                    </div>
                </main>
            </div>
        </div>
    );
}
