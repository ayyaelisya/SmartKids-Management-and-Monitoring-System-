import React, { useState, useEffect } from 'react';
import { Head, Link, usePage, useForm } from '@inertiajs/react';

export default function ParentChildProfile({ childrenList = [] }) {
    const { auth } = usePage().props ? { auth: usePage().props.auth } : { auth: {} };
    const [selectedChildId, setSelectedChildId] = useState(
        childrenList.length > 0 ? childrenList[0]?.id : null
    );
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [photoPreview, setPhotoPreview] = useState(null);

    const activeChild = childrenList.find((c) => String(c.id) === String(selectedChildId)) || childrenList[0];

    // Inisialisasi Borang Inertia
    const { data, setData, post, processing, errors, reset } = useForm({
        profile_photo: null,
        birth_place: '',
        favourite_food: '',
        birth_order: '',
        total_siblings: '',
        home_address: '',
        email: '',
        father_occupation: '',
        father_phone: '',
        mother_occupation: '',
        mother_phone: '',
        emergency_contact_name: '',
        emergency_contact_phone: '',
        emergency_contact_relationship: '',
        allergies: '',
        medical_notes: '',
    });

    useEffect(() => {
        if (activeChild) {
            setData({
                profile_photo: null,
                birth_place: activeChild.birth_place || '',
                favourite_food: activeChild.favourite_food || '',
                birth_order: activeChild.birth_order || '',
                total_siblings: activeChild.total_siblings || '',
                home_address: activeChild.home_address || '',
                email: activeChild.email || '',
                father_occupation: activeChild.father_occupation || '',
                father_phone: activeChild.father_phone || '',
                mother_occupation: activeChild.mother_occupation || '',
                mother_phone: activeChild.mother_phone || '',
                emergency_contact_name: activeChild.emergency_contact_name || '',
                emergency_contact_phone: activeChild.emergency_contact_phone || '',
                emergency_contact_relationship: activeChild.emergency_contact_relationship || '',
                allergies: activeChild.allergies || '',
                medical_notes: activeChild.medical_notes || '',
            });
            setPhotoPreview(activeChild.profile_photo_path);
        }
    }, [selectedChildId, childrenList]);

    const handlePhotoChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setData('profile_photo', file);
            setPhotoPreview(URL.createObjectURL(file));
        }
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        post(`/parent/children/${activeChild.id}/update`, {
            forceFormData: true,
            preserveScroll: true,
        });
    };

    const navItems = [
        { name: 'Home', icon: '🏠', href: '/parent/dashboard', active: false },
        { name: 'My Children', icon: '👶', href: '/parent/children', active: true },
        { name: 'Learning Logs', icon: '📖', href: '/parent/learning-log', active: false },
        { name: 'Attendance History', icon: '📅', href: '/parent/attendance', active: false },
        { name: 'Invoices & Fees', icon: '💳', href: '/parent/invoices', active: false },
        { name: 'Announcements', icon: '📢', href: '/parent/announcements', active: false },
    ];

    return (
        <div className="min-h-screen bg-slate-50 text-slate-800 flex flex-col md:flex-row font-sans relative">
            <Head title="My Children - Parent Portal" />

            {/* Mobile Header & Sidebar */}
            <div className="md:hidden bg-white border-b border-slate-200 px-4 py-3 flex items-center justify-between sticky top-0 z-30 shadow-sm">
                <div className="flex items-center gap-3">
                    <img src="/images/logo.jpg" alt="Logo" className="w-9 h-9 rounded-xl object-cover" onError={(e) => { e.target.style.display = 'none'; }} />
                    <div>
                        <h2 className="text-sm font-black text-slate-900 leading-none">Parent Portal</h2>
                        <span className="text-[10px] text-amber-600 font-bold uppercase">Smart Kids</span>
                    </div>
                </div>
                <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className="p-2 text-slate-600 hover:text-slate-900 focus:outline-none">
                    <span className="text-xl">{isMobileMenuOpen ? '✕' : '☰'}</span>
                </button>
            </div>

            <aside className={`fixed inset-y-0 left-0 z-40 w-72 bg-white border-r border-slate-200 p-5 flex flex-col justify-between transition-transform duration-300 transform md:relative md:translate-x-0 md:w-80 shrink-0 shadow-lg md:shadow-none ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}`}>
                <div>
                    <div className="hidden md:flex bg-slate-100/80 border border-slate-200 rounded-2xl p-4 mb-6 items-center gap-3">
                        <img src="/images/logo.jpg" alt="Logo" className="w-12 h-12 rounded-xl object-cover shadow-md shrink-0" onError={(e) => { e.target.style.display = 'none'; }} />
                        <div>
                            <h2 className="text-base font-black text-slate-900 leading-tight">Smart Kids</h2>
                            <p className="text-[10px] text-emerald-600 font-bold tracking-wider uppercase mt-0.5">Parent Portal</p>
                        </div>
                    </div>
                    <nav className="space-y-1.5">
                        {navItems.map((item) => (
                            <Link key={item.name} href={item.href} onClick={() => setIsMobileMenuOpen(false)} className={`w-full flex items-center gap-3.5 px-4 py-2.5 rounded-2xl font-bold text-sm transition-all ${item.active ? 'bg-amber-400 text-amber-950 shadow-md shadow-amber-400/20' : 'text-slate-600 hover:text-amber-600 hover:bg-slate-100/80'}`}>
                                <span className="text-base">{item.icon}</span>
                                <span>{item.name}</span>
                            </Link>
                        ))}
                    </nav>
                </div>
                <div className="pt-6 border-t border-slate-200 mt-6">
                    <Link href="/logout" method="post" as="button" className="w-full flex items-center gap-3.5 px-4 py-2.5 rounded-xl font-bold text-sm text-rose-600 hover:bg-rose-50 transition-all text-left">
                        <span>🚪</span> <span>Logout</span>
                    </Link>
                </div>
            </aside>

            {isMobileMenuOpen && <div onClick={() => setIsMobileMenuOpen(false)} className="fixed inset-0 bg-slate-900/40 z-30 md:hidden" />}

            {/* Main Area */}
            <main className="flex-1 flex flex-col min-w-0 bg-slate-50">
                <header className="hidden md:flex h-20 bg-white border-b border-slate-200 px-8 items-center justify-between sticky top-0 z-20 shadow-sm">
                    <div>
                        <span className="text-xs font-bold text-amber-600 uppercase tracking-wider">My Children Information</span>
                        <h1 className="text-lg font-black text-slate-900">Child Profile & Edit</h1>
                    </div>
                </header>

                <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full space-y-6">
                    {childrenList.length > 1 && (
                        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                            <label htmlFor="child-select" className="text-xs font-black text-slate-700 uppercase tracking-wider flex items-center gap-2">
                                <span>👶</span> Select Child:
                            </label>
                            <select id="child-select" value={selectedChildId || ''} onChange={(e) => setSelectedChildId(e.target.value)} className="bg-slate-50 border border-slate-200 text-slate-900 text-xs font-bold rounded-xl px-4 py-2.5 outline-none cursor-pointer min-w-[240px]">
                                {childrenList.map((child) => (
                                    <option key={child.id} value={child.id}>
                                        {child.full_name} ({child.class_name})
                                    </option>
                                ))}
                            </select>
                        </div>
                    )}

                    {!activeChild ? (
                        <div className="bg-white rounded-2xl p-8 text-center border border-slate-200 shadow-sm">
                            <p className="text-slate-400 font-bold text-xs">No child records found.</p>
                        </div>
                    ) : (
                        <form onSubmit={handleSubmit} className="space-y-6">
                            {/* Profile Header & Photo Upload */}
                            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 flex flex-col sm:flex-row items-center gap-6">
                                <div className="relative group">
                                    <div className="w-28 h-28 rounded-full overflow-hidden bg-amber-400 text-amber-950 font-black flex items-center justify-center text-4xl shadow-md ring-4 ring-amber-100 shrink-0">
                                        {photoPreview ? (
                                            <img src={photoPreview} alt="Profile" className="w-full h-full object-cover" />
                                        ) : (
                                            activeChild.full_name ? activeChild.full_name.charAt(0).toUpperCase() : '👶'
                                        )}
                                    </div>
                                    <label htmlFor="photo_upload" className="absolute bottom-0 right-0 bg-slate-900 text-white p-2 rounded-full cursor-pointer hover:bg-amber-500 transition-colors shadow-md">
                                        📷
                                        <input type="file" id="photo_upload" accept="image/*" className="hidden" onChange={handlePhotoChange} />
                                    </label>
                                </div>
                                <div className="text-center sm:text-left space-y-1 flex-1">
                                    <h2 className="text-2xl font-black text-slate-900">{activeChild.full_name}</h2>
                                    <p className="text-xs font-bold text-amber-600">{activeChild.class_name}</p>
                                    <p className="text-[11px] text-slate-400 font-medium">Upload a profile photo to personalize your child's portal profile.</p>
                                </div>
                                <button type="submit" disabled={processing} className="bg-amber-400 hover:bg-amber-500 text-amber-950 font-black px-6 py-3 rounded-xl shadow-md transition-all disabled:opacity-50 text-xs">
                                    {processing ? 'Saving Changes...' : 'Save Profile Changes'}
                                </button>
                            </div>

                            {/* SECTION 1: CRITICAL DETAILS (READ ONLY) */}
                            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                                <div className="bg-slate-100 px-5 py-3 border-b border-slate-200">
                                    <h3 className="text-xs font-black text-slate-700 uppercase tracking-wider flex items-center gap-2">
                                        🔒 Official Registration Info (Read-Only)
                                    </h3>
                                </div>
                                <div className="p-5 grid grid-cols-1 md:grid-cols-3 gap-4">
                                    <div>
                                        <label className="text-[11px] font-bold text-slate-400">Full Name</label>
                                        <input type="text" value={activeChild.full_name || ''} disabled className="w-full mt-1 bg-slate-100 border border-slate-200 text-slate-600 text-xs font-bold rounded-xl px-3 py-2 cursor-not-allowed" />
                                    </div>
                                    <div>
                                        <label className="text-[11px] font-bold text-slate-400">IC Number</label>
                                        <input type="text" value={activeChild.ic_number || ''} disabled className="w-full mt-1 bg-slate-100 border border-slate-200 text-slate-600 text-xs font-bold rounded-xl px-3 py-2 cursor-not-allowed" />
                                    </div>
                                    <div>
                                        <label className="text-[11px] font-bold text-slate-400">MyKid Number</label>
                                        <input type="text" value={activeChild.mykid_number || ''} disabled className="w-full mt-1 bg-slate-100 border border-slate-200 text-slate-600 text-xs font-bold rounded-xl px-3 py-2 cursor-not-allowed" />
                                    </div>
                                    <div>
                                        <label className="text-[11px] font-bold text-slate-400">Date of Birth</label>
                                        <input type="text" value={activeChild.date_of_birth || ''} disabled className="w-full mt-1 bg-slate-100 border border-slate-200 text-slate-600 text-xs font-bold rounded-xl px-3 py-2 cursor-not-allowed" />
                                    </div>
                                    <div>
                                        <label className="text-[11px] font-bold text-slate-400">Gender</label>
                                        <input type="text" value={activeChild.gender || ''} disabled className="w-full mt-1 bg-slate-100 border border-slate-200 text-slate-600 text-xs font-bold rounded-xl px-3 py-2 cursor-not-allowed capitalize" />
                                    </div>
                                    <div>
                                        <label className="text-[11px] font-bold text-slate-400">Class Name</label>
                                        <input type="text" value={activeChild.class_name || ''} disabled className="w-full mt-1 bg-slate-100 border border-slate-200 text-slate-600 text-xs font-bold rounded-xl px-3 py-2 cursor-not-allowed" />
                                    </div>
                                </div>
                            </div>

                            {/* SECTION 2: EDITABLE PERSONAL & CONTACT INFO */}
                            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                                <div className="bg-amber-400 px-5 py-3">
                                    <h3 className="text-xs font-black text-amber-950 uppercase tracking-wider flex items-center gap-2">
                                        ✏️ Editable Personal & Contact Info
                                    </h3>
                                </div>
                                <div className="p-5 grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="text-[11px] font-bold text-slate-600">Birth Place</label>
                                        <input type="text" value={data.birth_place} onChange={(e) => setData('birth_place', e.target.value)} className="w-full mt-1 bg-slate-50 border border-slate-200 text-xs font-bold rounded-xl px-3 py-2 focus:ring-amber-400 outline-none" />
                                    </div>
                                    <div>
                                        <label className="text-[11px] font-bold text-slate-600">Favourite Food</label>
                                        <input type="text" value={data.favourite_food} onChange={(e) => setData('favourite_food', e.target.value)} className="w-full mt-1 bg-slate-50 border border-slate-200 text-xs font-bold rounded-xl px-3 py-2 focus:ring-amber-400 outline-none" />
                                    </div>
                                    <div>
                                        <label className="text-[11px] font-bold text-slate-600">Birth Order</label>
                                        <input type="number" value={data.birth_order} onChange={(e) => setData('birth_order', e.target.value)} className="w-full mt-1 bg-slate-50 border border-slate-200 text-xs font-bold rounded-xl px-3 py-2 focus:ring-amber-400 outline-none" />
                                    </div>
                                    <div>
                                        <label className="text-[11px] font-bold text-slate-600">Total Siblings</label>
                                        <input type="number" value={data.total_siblings} onChange={(e) => setData('total_siblings', e.target.value)} className="w-full mt-1 bg-slate-50 border border-slate-200 text-xs font-bold rounded-xl px-3 py-2 focus:ring-amber-400 outline-none" />
                                    </div>
                                    <div className="md:col-span-2">
                                        <label className="text-[11px] font-bold text-slate-600">Home Address</label>
                                        <textarea rows="2" value={data.home_address} onChange={(e) => setData('home_address', e.target.value)} className="w-full mt-1 bg-slate-50 border border-slate-200 text-xs font-bold rounded-xl px-3 py-2 focus:ring-amber-400 outline-none" />
                                    </div>
                                </div>
                            </div>

                            {/* SECTION 3: PARENTS & EMERGENCY CONTACTS */}
                            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                                <div className="bg-slate-900 px-5 py-3">
                                    <h3 className="text-xs font-black text-white uppercase tracking-wider flex items-center gap-2">
                                        👨‍👩‍👧 Family & Emergency Contact Details
                                    </h3>
                                </div>
                                <div className="p-5 grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="text-[11px] font-bold text-slate-600">Father Occupation</label>
                                        <input type="text" value={data.father_occupation} onChange={(e) => setData('father_occupation', e.target.value)} className="w-full mt-1 bg-slate-50 border border-slate-200 text-xs font-bold rounded-xl px-3 py-2 focus:ring-amber-400 outline-none" />
                                    </div>
                                    <div>
                                        <label className="text-[11px] font-bold text-slate-600">Father Phone Number</label>
                                        <input type="text" value={data.father_phone} onChange={(e) => setData('father_phone', e.target.value)} className="w-full mt-1 bg-slate-50 border border-slate-200 text-xs font-bold rounded-xl px-3 py-2 focus:ring-amber-400 outline-none" />
                                    </div>
                                    <div>
                                        <label className="text-[11px] font-bold text-slate-600">Mother Occupation</label>
                                        <input type="text" value={data.mother_occupation} onChange={(e) => setData('mother_occupation', e.target.value)} className="w-full mt-1 bg-slate-50 border border-slate-200 text-xs font-bold rounded-xl px-3 py-2 focus:ring-amber-400 outline-none" />
                                    </div>
                                    <div>
                                        <label className="text-[11px] font-bold text-slate-600">Mother Phone Number</label>
                                        <input type="text" value={data.mother_phone} onChange={(e) => setData('mother_phone', e.target.value)} className="w-full mt-1 bg-slate-50 border border-slate-200 text-xs font-bold rounded-xl px-3 py-2 focus:ring-amber-400 outline-none" />
                                    </div>
                                    <div>
                                        <label className="text-[11px] font-bold text-slate-600">Emergency Contact Name</label>
                                        <input type="text" value={data.emergency_contact_name} onChange={(e) => setData('emergency_contact_name', e.target.value)} className="w-full mt-1 bg-slate-50 border border-slate-200 text-xs font-bold rounded-xl px-3 py-2 focus:ring-amber-400 outline-none" />
                                    </div>
                                    <div>
                                        <label className="text-[11px] font-bold text-slate-600">Emergency Phone</label>
                                        <input type="text" value={data.emergency_contact_phone} onChange={(e) => setData('emergency_contact_phone', e.target.value)} className="w-full mt-1 bg-slate-50 border border-slate-200 text-xs font-bold rounded-xl px-3 py-2 focus:ring-amber-400 outline-none" />
                                    </div>
                                </div>
                            </div>

                            {/* SECTION 4: MEDICAL NOTES */}
                            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                                <div className="bg-emerald-600 px-5 py-3">
                                    <h3 className="text-xs font-black text-white uppercase tracking-wider flex items-center gap-2">
                                        🩺 Medical & Health Notes
                                    </h3>
                                </div>
                                <div className="p-5 grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="text-[11px] font-bold text-slate-600">Allergies</label>
                                        <textarea rows="3" value={data.allergies} onChange={(e) => setData('allergies', e.target.value)} className="w-full mt-1 bg-slate-50 border border-slate-200 text-xs font-bold rounded-xl px-3 py-2 focus:ring-amber-400 outline-none" placeholder="State any food/drug allergies..." />
                                    </div>
                                    <div>
                                        <label className="text-[11px] font-bold text-slate-600">Medical Notes</label>
                                        <textarea rows="3" value={data.medical_notes} onChange={(e) => setData('medical_notes', e.target.value)} className="w-full mt-1 bg-slate-50 border border-slate-200 text-xs font-bold rounded-xl px-3 py-2 focus:ring-amber-400 outline-none" placeholder="Any additional medical details..." />
                                    </div>
                                </div>
                            </div>

                            <div className="flex justify-end">
                                <button type="submit" disabled={processing} className="bg-amber-400 hover:bg-amber-500 text-amber-950 font-black px-8 py-3 rounded-xl shadow-md transition-all text-xs">
                                    {processing ? 'Saving...' : 'Save All Changes'}
                                </button>
                            </div>
                        </form>
                    )}
                </div>
            </main>
        </div>
    );
}
