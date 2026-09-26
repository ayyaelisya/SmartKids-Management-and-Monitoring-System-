import { Link } from '@inertiajs/react';

export const authInput =
    'mt-1.5 block w-full rounded-2xl border border-[#D9E9DE] bg-white/90 px-4 py-3 text-sm text-[#244E42] placeholder:text-[#91A99A] shadow-sm outline-none transition focus:border-[#5EAE83] focus:ring-4 focus:ring-[#CDEDD7]';

export const authButton =
    'w-full rounded-2xl bg-[#2F7359] px-5 py-3.5 text-sm font-extrabold text-white shadow-lg shadow-[#276447]/20 transition hover:bg-[#245E48] focus:outline-none focus:ring-4 focus:ring-[#BCE7CD] disabled:cursor-wait disabled:opacity-60';

export default function AuthScene({ title, children, wide = false }) {
    return (
        <div className="relative isolate flex min-h-screen items-center justify-center overflow-hidden bg-[#DDF2E5] px-4 py-10 font-sans text-[#244E42] sm:px-6">
            <div className="pointer-events-none absolute inset-0 -z-10" aria-hidden="true">
                <div className="absolute inset-0 bg-gradient-to-b from-[#EAF8F1] via-[#D1EEDF] to-[#AFDEC7]" />
                <div className="absolute -top-20 right-[10%] h-72 w-72 rounded-full bg-[#FFF1BC]/70 blur-3xl" />
                <div className="absolute left-[-12%] top-[20%] h-80 w-80 rounded-full bg-[#F8D9E7]/60 blur-3xl" />
                <svg className="absolute bottom-0 h-[62%] w-full" viewBox="0 0 1440 650" preserveAspectRatio="none" fill="none">
                    <path d="M0 350C180 280 275 337 434 248C600 158 769 252 895 195C1131 87 1296 224 1440 140V650H0V350Z" fill="#B8E1CF" />
                    <path d="M0 430C200 353 337 422 546 337C731 263 818 367 1014 265C1168 184 1304 255 1440 235V650H0V430Z" fill="#92D0AF" />
                    <path d="M0 535C204 458 381 530 550 465C747 389 936 486 1120 394C1236 337 1362 390 1440 355V650H0V535Z" fill="#66AE86" />
                    <path d="M0 588C181 546 329 592 466 557C733 488 822 563 1042 507C1181 471 1318 505 1440 451V650H0V588Z" fill="#3B8063" />
                </svg>
                <div className="absolute bottom-[-130px] left-[15%] h-72 w-72 rounded-full bg-[#EFC7DA]/35 blur-3xl" />
            </div>

            <main className={`w-full ${wide ? 'max-w-[740px]' : 'max-w-[440px]'} rounded-[30px] border border-white/75 bg-white/80 p-6 shadow-[0_24px_80px_rgba(28,87,60,0.18)] backdrop-blur-xl sm:p-9`}>
                <Link href="/" className="mx-auto flex w-fit items-center gap-3">
                    <img src="/images/logo.jpg" alt="Tinta Tots Clubhouse logo" className="h-14 w-14 rounded-2xl bg-white object-contain p-1 shadow-sm" />
                    <span className="text-lg font-black leading-tight">Tinta Tots<span className="block text-[11px] font-extrabold tracking-[0.22em] text-[#D76696]">CLUBHOUSE</span></span>
                </Link>
                <h1 className="mt-7 text-center text-3xl font-black tracking-tight sm:text-4xl">{title}</h1>
                {children}
            </main>
        </div>
    );
}
