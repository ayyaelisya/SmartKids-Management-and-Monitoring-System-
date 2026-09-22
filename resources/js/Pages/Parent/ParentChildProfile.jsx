import React, { useState, useEffect } from 'react';
import { Head, useForm } from '@inertiajs/react';
import AuthenticatedLayoutParent from '@/Layouts/AuthenticatedLayoutParent';

export default function ParentChildProfile({ childrenList = [] }) {
    const [selectedChildId, setSelectedChildId] = useState(
        childrenList.length > 0 ? childrenList[0]?.id : null
    );

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

    return (
        <AuthenticatedLayoutParent activeNavId="children" pageTitle="Child Profile & Edit" pageSubtitle="My Children Information">
            <Head title="My Children - Parent Portal" />

            <main className="w-full">

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
        </AuthenticatedLayoutParent>
    );
}
