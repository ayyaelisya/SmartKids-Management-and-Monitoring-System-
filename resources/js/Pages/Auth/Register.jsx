import { useEffect } from 'react';
import InputError from '@/Components/InputError';
import InputLabel from '@/Components/InputLabel';
import TextInput from '@/Components/TextInput';
import { Head, Link, useForm } from '@inertiajs/react';

export default function Register() {
    const { data, setData, post, processing, errors, reset } = useForm({
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

    useEffect(() => {
        return () => {
            reset('password', 'password_confirmation');
        };
    }, []);

    const submit = (e) => {
        e.preventDefault();
        post(route('register'));
    };

    return (
        <div className="min-h-screen bg-slate-50 flex flex-col lg:flex-row font-sans">
            <Head title="Parent Registration - Tinta Tots Clubhouse" />

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
                        👨‍👩‍👧
                    </div>
                    <h1 className="text-4xl xl:text-5xl font-black text-white leading-tight tracking-tight mb-4">
                        Join <br />
                        <span className="text-amber-400">Tinta Tots!</span> 👋
                    </h1>
                    <p className="text-slate-300 text-sm leading-relaxed font-medium">
                        Register your parent account to monitor your child's learning journey, attendance, daily logs, and stay connected with our clubhouse admins.
                    </p>
                </div>

                {/* Footer Copyright */}
                <div className="relative z-10 text-xs text-slate-500 font-medium">
                    © {new Date().getFullYear()} Tinta Tots Clubhouse. All rights reserved.
                </div>
            </div>

            {/* RIGHT FORM PANEL (Mobile & Desktop) */}
            <div className="flex-1 flex flex-col justify-center items-center p-6 sm:p-10 lg:p-12 bg-slate-50/50 min-h-screen overflow-y-auto">

                {/* Form Card Wrapper */}
                <div className="w-full max-w-2xl bg-white p-6 sm:p-10 rounded-3xl border border-slate-200/80 shadow-xl shadow-slate-200/50 space-y-6 relative z-10 my-auto">

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

                    {/* Registration Form */}
                    <form onSubmit={submit} className="space-y-6">

                        {/* SECTION 1: Parent Details */}
                        <div className="space-y-4">
                            <div className="flex items-center gap-2 pb-1.5 border-b border-slate-100">
                                <span className="text-sm">👤</span>
                                <h3 className="text-xs font-bold text-amber-600 uppercase tracking-wider">
                                    1. Parent Details
                                </h3>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                {/* Full Name */}
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

                                {/* Email */}
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

                                {/* Relationship */}
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

                                {/* Phone Number */}
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

                                {/* Address */}
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
                                    ></textarea>
                                    <InputError message={errors.address} className="mt-1" />
                                </div>
                            </div>
                        </div>

                        {/* SECTION 2: Student Reference */}
                        <div className="space-y-4">
                            <div className="flex items-center gap-2 pb-1.5 border-b border-slate-100">
                                <span className="text-sm">🎒</span>
                                <h3 className="text-xs font-bold text-amber-600 uppercase tracking-wider">
                                    2. Child Details
                                </h3>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                {/* Child Name */}
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
                                        className="w-full px-4 py-2.5 rounded-xl bg-slate-50/50 border border-slate-200 text-sm focus:border-amber-500 focus:ring-amber-500/20 transition-all text-slate-800 placeholder:text-slate-400"
                                        onChange={(e) => setData('child_name', e.target.value)}
                                        required
                                    />
                                    <InputError message={errors.child_name} className="mt-1" />
                                </div>

                                {/* Child IC Number */}
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

                        {/* SECTION 3: Password */}
                        <div className="space-y-4">
                            <div className="flex items-center gap-2 pb-1.5 border-b border-slate-100">
                                <span className="text-sm">🔐</span>
                                <h3 className="text-xs font-bold text-amber-600 uppercase tracking-wider">
                                    3. Account Password
                                </h3>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                {/* Password */}
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
                                        placeholder="Min. 8 characters"
                                        className="w-full px-4 py-2.5 rounded-xl bg-slate-50/50 border border-slate-200 text-sm focus:border-amber-500 focus:ring-amber-500/20 transition-all text-slate-800 placeholder:text-slate-400"
                                        onChange={(e) => setData('password', e.target.value)}
                                        required
                                    />
                                    <InputError message={errors.password} className="mt-1" />
                                </div>

                                {/* Confirm Password */}
                                <div>
                                    <InputLabel
                                        htmlFor="password_confirmation"
                                        value="Confirm Password"
                                        className="text-slate-700 font-bold text-xs uppercase tracking-wider mb-1"
                                    />
                                    <TextInput
                                        id="password_confirmation"
                                        type="password"
                                        name="password_confirmation"
                                        value={data.password_confirmation}
                                        placeholder="Repeat password"
                                        className="w-full px-4 py-2.5 rounded-xl bg-slate-50/50 border border-slate-200 text-sm focus:border-amber-500 focus:ring-amber-500/20 transition-all text-slate-800 placeholder:text-slate-400"
                                        onChange={(e) => setData('password_confirmation', e.target.value)}
                                        required
                                    />
                                    <InputError message={errors.password_confirmation} className="mt-1" />
                                </div>
                            </div>
                        </div>

                        {/* Submit Button */}
                        <div className="pt-2">
                            <button
                                type="submit"
                                disabled={processing}
                                className="w-full py-3.5 px-4 bg-amber-400 hover:bg-amber-500 active:scale-[0.99] text-amber-950 font-black rounded-xl shadow-md shadow-amber-400/20 transition-all text-sm disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer"
                            >
                                <span>Submit Registration</span>
                                <span>→</span>
                            </button>
                        </div>
                    </form>

                    {/* Mobile Footer */}
                    <div className="pt-2 border-t border-slate-100 text-center lg:hidden">
                        <p className="text-[11px] text-slate-400 font-medium">
                            © {new Date().getFullYear()} Tinta Tots Clubhouse. Smart Kids System.
                        </p>
                    </div>

                </div>
            </div>
        </div>
    );
}
