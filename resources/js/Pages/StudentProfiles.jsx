import React, { useState, useMemo } from 'react';
import { Head, useForm, router } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import {
  Users, UserCheck, UserPlus, UserX, Search,
  Eye, Edit3, Camera, X
} from 'lucide-react';

export default function StudentProfiles(props) {
    const { students = [], filters = {} } = props;

    // MODAL & TABS MANAGEMENT STATE
    const [isAddEditModalOpen, setIsAddEditModalOpen] = useState(false);
    const [isViewProfileOpen, setIsViewProfileOpen] = useState(false);

    const [editingStudent, setEditingStudent] = useState(null);
    const [viewingStudent, setViewingStudent] = useState(null);
    const [activeTab, setActiveTab] = useState('personal');
    const [imagePreview, setImagePreview] = useState(null);

    // FILTER & SEARCH STATE
    const [search, setSearch] = useState(filters?.search || '');
    const [selectedClassFilter, setSelectedClassFilter] = useState(filters?.class_filter || '');
    const [selectedStatusFilter, setSelectedStatusFilter] = useState('');
    const [sortBy, setSortBy] = useState('name');

    // INERTIA FORM FOR ADD / EDIT
    const { data, setData, post, processing, errors, reset, clearErrors } = useForm({
        id: '',
        profile_image: null,

        // Student Information
        full_name: '',
        ic_number: '',
        mykid_number: '',
        date_of_birth: '',
        birth_place: '',
        gender: 'Boy',
        favourite_food: '',
        birth_order: '',
        total_siblings: '',

        // Kindergarten Information
        class_name: '2 Years',
        status: 'Active',

        // Primary Guardian Information
        guardian_name: '',
        guardian_phone: '',
        guardian_relationship: 'Father',

        // Father's Information
        father_name: '',
        father_ic_number: '',
        father_nationality: 'Malaysian',
        father_race: '',
        father_occupation: '',
        father_phone: '',

        // Mother's Information
        mother_name: '',
        mother_ic_number: '',
        mother_nationality: 'Malaysian',
        mother_race: '',
        mother_occupation: '',
        mother_phone: '',

        // Contact Information
        home_address: '',
        email: '',

        // Emergency Contact
        emergency_contact_name: '',
        emergency_contact_phone: '',
        emergency_contact_relationship: '',

        // Registration Information
        selected_service: 'Full Day',
        referral_source: '',

        // Medical Information
        allergies: '',
        medical_notes: '',
    });

    // STATISTICAL SUMMARY CARDS
    const stats = useMemo(() => {
        return {
            total: students.length,
            active: students.filter(s => s.status === 'Active' || !s.status).length,
            newStudents: students.filter(s => {
                if (!s.created_at) return false;
                const createdDate = new Date(s.created_at);
                const thirtyDaysAgo = new Date();
                thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
                return createdDate >= thirtyDaysAgo;
            }).length,
            inactive: students.filter(s => s.status === 'Inactive' || s.status === 'Withdrawn' || s.status === 'Graduated').length,
        };
    }, [students]);

    // SEARCH & FILTER HANDLER
    const filteredStudents = useMemo(() => {
        return students.filter((s) => {
            const matchesSearch =
                (s.full_name || '').toLowerCase().includes(search.toLowerCase()) ||
                (s.student_id || '').toLowerCase().includes(search.toLowerCase()) ||
                (s.ic_number || '').toLowerCase().includes(search.toLowerCase());

            const matchesClass = selectedClassFilter ? s.class_name === selectedClassFilter : true;
            const matchesStatus = selectedStatusFilter ? (s.status || 'Active') === selectedStatusFilter : true;

            return matchesSearch && matchesClass && matchesStatus;
        }).sort((a, b) => {
            if (sortBy === 'name') return (a.full_name || '').localeCompare(b.full_name || '');
            if (sortBy === 'enrollment') return new Date(b.created_at || 0) - new Date(a.created_at || 0);
            return 0;
        });
    }, [students, search, selectedClassFilter, selectedStatusFilter, sortBy]);

    // IMAGE HANDLER
    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setData('profile_image', file);
            setImagePreview(URL.createObjectURL(file));
        }
    };

    // OPEN ADD / EDIT MODAL
    const handleOpenCreateModal = () => {
        setEditingStudent(null);
        setImagePreview(null);
        reset();
        clearErrors();
        setIsAddEditModalOpen(true);
    };

    const handleOpenEditModal = (student) => {
        setEditingStudent(student);
        setImagePreview(student.profile_image_url || null);
        clearErrors();
        setData({
            id: student.student_id || student.id,
            profile_image: null,
            full_name: student.full_name || '',
            ic_number: student.ic_number || '',
            mykid_number: student.mykid_number || '',
            date_of_birth: student.date_of_birth || '',
            birth_place: student.birth_place || '',
            gender: student.gender || 'Boy',
            favourite_food: student.favourite_food || '',
            birth_order: student.birth_order || '',
            total_siblings: student.total_siblings || '',

            class_name: student.class_name || '2 Years',
            status: student.status || 'Active',

            guardian_name: student.guardian_name || '',
            guardian_phone: student.guardian_phone || '',
            guardian_relationship: student.guardian_relationship || 'Father',

            father_name: student.father_name || '',
            father_ic_number: student.father_ic_number || '',
            father_nationality: student.father_nationality || 'Malaysian',
            father_race: student.father_race || '',
            father_occupation: student.father_occupation || '',
            father_phone: student.father_phone || '',

            mother_name: student.mother_name || '',
            mother_ic_number: student.mother_ic_number || '',
            mother_nationality: student.mother_nationality || 'Malaysian',
            mother_race: student.mother_race || '',
            mother_occupation: student.mother_occupation || '',
            mother_phone: student.mother_phone || '',

            home_address: student.home_address || '',
            email: student.email || '',

            emergency_contact_name: student.emergency_contact_name || '',
            emergency_contact_phone: student.emergency_contact_phone || '',
            emergency_contact_relationship: student.emergency_contact_relationship || '',

            selected_service: student.selected_service || 'Full Day',
            referral_source: student.referral_source || '',

            allergies: student.allergies || '',
            medical_notes: student.medical_notes || '',
        });
        setIsAddEditModalOpen(true);
    };

    const handleOpenViewProfile = (student) => {
        setViewingStudent(student);
        setActiveTab('personal');
        setIsViewProfileOpen(true);
    };

    // SUBMIT ADD / EDIT
    const handleSubmitAddEdit = (e) => {
        e.preventDefault();
        if (editingStudent) {
            router.post(`/students/${editingStudent.student_id || editingStudent.id}`, {
                _method: 'put',
                ...data
            }, {
                onSuccess: () => setIsAddEditModalOpen(false)
            });
        } else {
            post('/students', {
                onSuccess: () => setIsAddEditModalOpen(false)
            });
        }
    };

    return (
        <AuthenticatedLayout activeNavId="students">
            <Head title="SKMMS - Student Management" />

            <div className="min-h-screen bg-[#EAE7F6] p-4 sm:p-6 lg:p-8 space-y-6">

                {/* HEADER */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl shadow-sm border border-[#E2DFEE]">
                    <div>
                        <h1 className="text-xl font-black text-[#2D3142] tracking-tight">Student Management</h1>
                        <p className="text-[11px] font-medium text-[#6B7280] mt-0.5">
                            Comprehensive management of kindergarten student profiles and parent registrations.
                        </p>
                    </div>

                    <button
                        type="button"
                        onClick={handleOpenCreateModal}
                        className="px-4 py-2.5 bg-[#6C63A8] hover:bg-[#514A82] text-white font-extrabold text-[11px] rounded-xl transition-all shadow-xs flex items-center justify-center gap-2 active:scale-95 shrink-0"
                    >
                        <UserPlus className="w-3.5 h-3.5" />
                        <span>Enrol New Student</span>
                    </button>
                </div>

                {/* STATISTICS */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div className="bg-white p-4 rounded-2xl shadow-sm border border-[#E2DFEE] flex items-center gap-3">
                        <div className="p-2.5 rounded-xl bg-[#6C63A8]/10 text-[#6C63A8]"><Users className="w-5 h-5" /></div>
                        <div>
                            <span className="text-[10px] font-bold text-[#6B7280] uppercase tracking-wider">Total Students</span>
                            <p className="text-xl font-black text-[#2D3142]">{stats.total}</p>
                        </div>
                    </div>
                    <div className="bg-white p-4 rounded-2xl shadow-sm border border-[#E2DFEE] flex items-center gap-3">
                        <div className="p-2.5 rounded-xl bg-[#6FCF97]/20 text-[#219653]"><UserCheck className="w-5 h-5" /></div>
                        <div>
                            <span className="text-[10px] font-bold text-[#6B7280] uppercase tracking-wider">Active</span>
                            <p className="text-xl font-black text-[#2D3142]">{stats.active}</p>
                        </div>
                    </div>
                    <div className="bg-white p-4 rounded-2xl shadow-sm border border-[#E2DFEE] flex items-center gap-3">
                        <div className="p-2.5 rounded-xl bg-[#F4A261]/20 text-[#D97706]"><UserPlus className="w-5 h-5" /></div>
                        <div>
                            <span className="text-[10px] font-bold text-[#6B7280] uppercase tracking-wider">New (30 Days)</span>
                            <p className="text-xl font-black text-[#2D3142]">{stats.newStudents}</p>
                        </div>
                    </div>
                    <div className="bg-white p-4 rounded-2xl shadow-sm border border-[#E2DFEE] flex items-center gap-3">
                        <div className="p-2.5 rounded-xl bg-[#E76F6F]/15 text-[#E76F6F]"><UserX className="w-5 h-5" /></div>
                        <div>
                            <span className="text-[10px] font-bold text-[#6B7280] uppercase tracking-wider">Inactive</span>
                            <p className="text-xl font-black text-[#2D3142]">{stats.inactive}</p>
                        </div>
                    </div>
                </div>

                {/* TABLE LIST */}
                <div className="bg-white rounded-2xl shadow-sm border border-[#E2DFEE] overflow-hidden">
                    <div className="p-4 border-b border-[#E2DFEE]">
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                            <div className="relative">
                                <Search className="w-3.5 h-3.5 text-[#6B7280] absolute left-3 top-3" />
                                <input
                                    type="text"
                                    placeholder="Search Name, MyKid, IC..."
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                    className="w-full pl-9 pr-3 py-2 bg-[#F7F6FC] border border-[#E2DFEE] rounded-xl text-[11px] font-medium text-[#2D3142] focus:outline-hidden focus:border-[#6C63A8]"
                                />
                            </div>
                            <select
                                value={selectedClassFilter}
                                onChange={(e) => setSelectedClassFilter(e.target.value)}
                                className="py-2 px-3 bg-[#F7F6FC] border border-[#E2DFEE] rounded-xl text-[11px] font-medium text-[#2D3142] focus:outline-hidden focus:border-[#6C63A8]"
                            >
                                <option value="">All Classes</option>
                                <option value="Tots Club">Tots Club</option>
                                <option value="2 Years">2 Years</option>
                                <option value="3 Years">3 Years</option>
                                <option value="4 Years">4 Years</option>
                            </select>
                        </div>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-[11px]">
                            <thead className="bg-[#F7F6FC] text-[#6B7280] font-bold uppercase tracking-wider border-b border-[#E2DFEE]">
                                <tr>
                                    <th className="py-3 px-5">Student</th>
                                    <th className="py-3 px-5">MyKid / IC</th>
                                    <th className="py-3 px-5">Class</th>
                                    <th className="py-3 px-5">Primary Guardian</th>
                                    <th className="py-3 px-5 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-[#E2DFEE] font-medium text-[#2D3142]">
                                {filteredStudents.map((std) => (
                                    <tr key={std.student_id || std.id} className="hover:bg-[#F7F6FC]">
                                        <td className="py-3 px-5">
                                            <div className="flex items-center gap-2.5">
                                                {std.profile_image_url ? (
                                                    <img src={std.profile_image_url} alt="Profile" className="w-8 h-8 rounded-xl object-cover" />
                                                ) : (
                                                    <div className="w-8 h-8 rounded-xl bg-[#6C63A8]/10 text-[#6C63A8] font-black flex items-center justify-center text-xs">
                                                        {std.full_name ? std.full_name.charAt(0).toUpperCase() : 'S'}
                                                    </div>
                                                )}
                                                <div>
                                                    <p className="font-bold text-[#2D3142]">{std.full_name}</p>
                                                    <p className="text-[10px] text-[#6B7280]">{std.gender} • {std.selected_service}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="py-3 px-5 font-semibold">{std.mykid_number || std.ic_number || 'N/A'}</td>
                                        <td className="py-3 px-5 font-semibold text-[#6C63A8]">{std.class_name}</td>
                                        <td className="py-3 px-5">
                                            <p className="font-semibold">{std.guardian_name || std.father_name || std.mother_name || 'N/A'}</p>
                                            <p className="text-[10px] text-[#6B7280]">{std.guardian_phone || std.father_phone || std.mother_phone}</p>
                                        </td>
                                        <td className="py-3 px-5 text-right">
                                            <div className="flex items-center justify-end gap-1">
                                                <button onClick={() => handleOpenViewProfile(std)} className="p-1.5 rounded-lg bg-[#F7F6FC] text-[#6C63A8] hover:bg-[#6C63A8]/10"><Eye className="w-3.5 h-3.5" /></button>
                                                <button onClick={() => handleOpenEditModal(std)} className="p-1.5 rounded-lg bg-[#F7F6FC] text-[#2D3142] hover:bg-[#2D3142]/10"><Edit3 className="w-3.5 h-3.5" /></button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

            </div>

            {/* VIEW PROFILE MODAL */}
            {isViewProfileOpen && viewingStudent && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-xs p-4">
                    <div className="bg-white rounded-2xl max-w-3xl w-full max-h-[85vh] flex flex-col overflow-hidden shadow-xl">
                        <div className="p-5 bg-[#6C63A8] text-white flex items-center justify-between shrink-0">
                            <div className="flex items-center gap-3">
                                {viewingStudent.profile_image_url ? (
                                    <img src={viewingStudent.profile_image_url} className="w-12 h-12 rounded-xl object-cover border border-white" />
                                ) : (
                                    <div className="w-12 h-12 rounded-xl bg-white/20 text-white font-black flex items-center justify-center text-lg border border-white/20">
                                        {viewingStudent.full_name ? viewingStudent.full_name.charAt(0).toUpperCase() : 'S'}
                                    </div>
                                )}
                                <div>
                                    <h2 className="text-base font-extrabold">{viewingStudent.full_name}</h2>
                                    <p className="text-[11px] text-white/80 mt-0.5">
                                        Class: {viewingStudent.class_name} • Service: {viewingStudent.selected_service}
                                    </p>
                                </div>
                            </div>
                            <button onClick={() => setIsViewProfileOpen(false)} className="p-1.5 rounded-xl bg-white/10 text-white hover:bg-white/20"><X className="w-4 h-4" /></button>
                        </div>

                        <div className="flex items-center border-b border-[#E2DFEE] bg-[#F7F6FC] px-5 gap-2 overflow-x-auto shrink-0">
                            {[
                                { id: 'personal', label: 'Student Information' },
                                { id: 'parents', label: 'Parents & Guardians' },
                                { id: 'contact', label: 'Address & Emergency' },
                                { id: 'medical', label: 'Health & Allergies' },
                            ].map((tab) => (
                                <button
                                    key={tab.id}
                                    onClick={() => setActiveTab(tab.id)}
                                    className={`py-3 px-3 text-[11px] font-bold border-b-2 whitespace-nowrap ${
                                        activeTab === tab.id ? 'border-[#6C63A8] text-[#6C63A8]' : 'border-transparent text-[#6B7280]'
                                    }`}
                                >
                                    {tab.label}
                                </button>
                            ))}
                        </div>

                        <div className="p-5 overflow-y-auto space-y-3 flex-1 text-[11px]">
                            {activeTab === 'personal' && (
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                    <div className="p-2.5 bg-[#F7F6FC] rounded-xl"><span className="text-[#6B7280]">MyKid No.:</span> <p className="font-bold">{viewingStudent.mykid_number || 'N/A'}</p></div>
                                    <div className="p-2.5 bg-[#F7F6FC] rounded-xl"><span className="text-[#6B7280]">IC No.:</span> <p className="font-bold">{viewingStudent.ic_number || 'N/A'}</p></div>
                                    <div className="p-2.5 bg-[#F7F6FC] rounded-xl"><span className="text-[#6B7280]">Date of Birth:</span> <p className="font-bold">{viewingStudent.date_of_birth || 'N/A'}</p></div>
                                    <div className="p-2.5 bg-[#F7F6FC] rounded-xl"><span className="text-[#6B7280]">Place of Birth:</span> <p className="font-bold">{viewingStudent.birth_place || 'N/A'}</p></div>
                                    <div className="p-2.5 bg-[#F7F6FC] rounded-xl"><span className="text-[#6B7280]">Gender:</span> <p className="font-bold">{viewingStudent.gender}</p></div>
                                    <div className="p-2.5 bg-[#F7F6FC] rounded-xl"><span className="text-[#6B7280]">Favourite Food:</span> <p className="font-bold">{viewingStudent.favourite_food || 'N/A'}</p></div>
                                    <div className="p-2.5 bg-[#F7F6FC] rounded-xl"><span className="text-[#6B7280]">Child Order:</span> <p className="font-bold">{viewingStudent.birth_order || 'N/A'} of {viewingStudent.total_siblings || 'N/A'} siblings</p></div>
                                </div>
                            )}

                            {activeTab === 'parents' && (
                                <div className="space-y-3">
                                    <div className="p-3 rounded-xl border border-[#E2DFEE]">
                                        <h4 className="font-bold text-[#6C63A8] mb-1">Primary Guardian</h4>
                                        <p><strong>Name:</strong> {viewingStudent.guardian_name || 'N/A'}</p>
                                        <p><strong>Phone No.:</strong> {viewingStudent.guardian_phone || 'N/A'}</p>
                                        <p><strong>Relationship:</strong> {viewingStudent.guardian_relationship || 'N/A'}</p>
                                    </div>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                        <div className="p-3 rounded-xl bg-[#F7F6FC] space-y-0.5">
                                            <h4 className="font-bold text-[#2D3142] mb-1">Father's Information</h4>
                                            <p>Name: {viewingStudent.father_name || 'N/A'}</p>
                                            <p>IC: {viewingStudent.father_ic_number || 'N/A'}</p>
                                            <p>Phone: {viewingStudent.father_phone || 'N/A'}</p>
                                            <p>Occupation: {viewingStudent.father_occupation || 'N/A'}</p>
                                            <p>Race/Nationality: {viewingStudent.father_race} / {viewingStudent.father_nationality}</p>
                                        </div>
                                        <div className="p-3 rounded-xl bg-[#F7F6FC] space-y-0.5">
                                            <h4 className="font-bold text-[#2D3142] mb-1">Mother's Information</h4>
                                            <p>Name: {viewingStudent.mother_name || 'N/A'}</p>
                                            <p>IC: {viewingStudent.mother_ic_number || 'N/A'}</p>
                                            <p>Phone: {viewingStudent.mother_phone || 'N/A'}</p>
                                            <p>Occupation: {viewingStudent.mother_occupation || 'N/A'}</p>
                                            <p>Race/Nationality: {viewingStudent.mother_race} / {viewingStudent.mother_nationality}</p>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {activeTab === 'contact' && (
                                <div className="space-y-3">
                                    <div className="p-3 rounded-xl bg-[#F7F6FC] space-y-0.5">
                                        <h4 className="font-bold">Home Address & Email</h4>
                                        <p><strong>Email:</strong> {viewingStudent.email || 'N/A'}</p>
                                        <p><strong>Address:</strong> {viewingStudent.home_address || 'N/A'}</p>
                                    </div>
                                    <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 space-y-0.5 text-amber-900">
                                        <h4 className="font-bold">Emergency Contact</h4>
                                        <p><strong>Contact Name:</strong> {viewingStudent.emergency_contact_name || 'N/A'}</p>
                                        <p><strong>Phone No.:</strong> {viewingStudent.emergency_contact_phone || 'N/A'}</p>
                                        <p><strong>Relationship:</strong> {viewingStudent.emergency_contact_relationship || 'N/A'}</p>
                                    </div>
                                </div>
                            )}

                            {activeTab === 'medical' && (
                                <div className="space-y-3">
                                    <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-900">
                                        <h4 className="font-bold mb-0.5">Allergies</h4>
                                        <p>{viewingStudent.allergies || 'No allergies recorded.'}</p>
                                    </div>
                                    <div className="p-3 rounded-xl bg-[#F7F6FC]">
                                        <h4 className="font-bold mb-0.5">Medical & Health Notes</h4>
                                        <p>{viewingStudent.medical_notes || 'No specific medical notes.'}</p>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* ADD / EDIT STUDENT MODAL */}
            {isAddEditModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-xs p-4">
                    <div className="bg-white rounded-2xl max-w-3xl w-full max-h-[85vh] flex flex-col overflow-hidden shadow-xl">
                        <div className="p-4 bg-[#6C63A8] text-white flex justify-between items-center shrink-0">
                            <h3 className="text-sm font-extrabold">
                                {editingStudent ? 'Update Student Profile' : 'New Student Registration Form'}
                            </h3>
                            <button onClick={() => setIsAddEditModalOpen(false)} className="text-white/80 hover:text-white">
                                <X className="w-4 h-4" />
                            </button>
                        </div>

                        <form onSubmit={handleSubmitAddEdit} className="p-5 overflow-y-auto space-y-5 text-[11px] flex-1">

                            {/* PROFILE PICTURE */}
                            <div className="flex flex-col items-center justify-center border border-dashed border-[#E2DFEE] rounded-xl p-3 bg-[#F7F6FC]">
                                <div className="relative w-16 h-16 rounded-xl overflow-hidden bg-slate-200 mb-2 border border-white shadow-xs">
                                    {imagePreview ? (
                                        <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
                                    ) : (
                                        <div className="w-full h-full flex flex-col items-center justify-center text-slate-400">
                                            <Camera className="w-5 h-5" />
                                        </div>
                                    )}
                                </div>
                                <label className="cursor-pointer px-3 py-1.5 bg-[#6C63A8] text-white rounded-lg font-bold text-[10px] hover:bg-[#514A82]">
                                    Upload Profile Picture
                                    <input type="file" accept="image/*" onChange={handleImageChange} className="hidden" />
                                </label>
                            </div>

                            {/* 1. STUDENT INFORMATION */}
                            <div>
                                <h4 className="font-extrabold text-[#6C63A8] uppercase text-[10px] tracking-wider mb-2 pb-1 border-b">1. STUDENT PERSONAL INFORMATION</h4>
                                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                                    <div className="sm:col-span-2">
                                        <label className="block font-semibold mb-1 text-[#2D3142]">Full Name *</label>
                                        <input type="text" value={data.full_name} onChange={e => setData('full_name', e.target.value)} required className="w-full p-2 text-[11px] rounded-lg border border-[#E2DFEE] focus:outline-hidden focus:border-[#6C63A8]" />
                                    </div>
                                    <div>
                                        <label className="block font-semibold mb-1 text-[#2D3142]">Gender</label>
                                        <select value={data.gender} onChange={e => setData('gender', e.target.value)} className="w-full p-2 text-[11px] rounded-lg border border-[#E2DFEE] focus:outline-hidden focus:border-[#6C63A8]">
                                            <option value="Boy">Boy</option>
                                            <option value="Girl">Girl</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block font-semibold mb-1 text-[#2D3142]">IC / MyKid No.</label>
                                        <input type="text" value={data.ic_number} onChange={e => setData('ic_number', e.target.value)} className="w-full p-2 text-[11px] rounded-lg border border-[#E2DFEE] focus:outline-hidden focus:border-[#6C63A8]" />
                                    </div>
                                    <div>
                                        <label className="block font-semibold mb-1 text-[#2D3142]">Specific MyKid No.</label>
                                        <input type="text" value={data.mykid_number} onChange={e => setData('mykid_number', e.target.value)} className="w-full p-2 text-[11px] rounded-lg border border-[#E2DFEE] focus:outline-hidden focus:border-[#6C63A8]" />
                                    </div>
                                    <div>
                                        <label className="block font-semibold mb-1 text-[#2D3142]">Date of Birth</label>
                                        <input type="date" value={data.date_of_birth} onChange={e => setData('date_of_birth', e.target.value)} className="w-full p-2 text-[11px] rounded-lg border border-[#E2DFEE] focus:outline-hidden focus:border-[#6C63A8]" />
                                    </div>
                                    <div>
                                        <label className="block font-semibold mb-1 text-[#2D3142]">Place of Birth</label>
                                        <input type="text" value={data.birth_place} onChange={e => setData('birth_place', e.target.value)} className="w-full p-2 text-[11px] rounded-lg border border-[#E2DFEE] focus:outline-hidden focus:border-[#6C63A8]" />
                                    </div>
                                    <div>
                                        <label className="block font-semibold mb-1 text-[#2D3142]">Child Order</label>
                                        <input type="number" value={data.birth_order} onChange={e => setData('birth_order', e.target.value)} className="w-full p-2 text-[11px] rounded-lg border border-[#E2DFEE] focus:outline-hidden focus:border-[#6C63A8]" />
                                    </div>
                                    <div>
                                        <label className="block font-semibold mb-1 text-[#2D3142]">Total Siblings</label>
                                        <input type="number" value={data.total_siblings} onChange={e => setData('total_siblings', e.target.value)} className="w-full p-2 text-[11px] rounded-lg border border-[#E2DFEE] focus:outline-hidden focus:border-[#6C63A8]" />
                                    </div>
                                    <div className="sm:col-span-3">
                                        <label className="block font-semibold mb-1 text-[#2D3142]">Favourite Food</label>
                                        <input type="text" value={data.favourite_food} onChange={e => setData('favourite_food', e.target.value)} className="w-full p-2 text-[11px] rounded-lg border border-[#E2DFEE] focus:outline-hidden focus:border-[#6C63A8]" />
                                    </div>
                                </div>
                            </div>

                            {/* 2. KINDERGARTEN & PACKAGE DETAILS */}
                            <div>
                                <h4 className="font-extrabold text-[#6C63A8] uppercase text-[10px] tracking-wider mb-2 pb-1 border-b">2. PACKAGE & SERVICE DETAILS</h4>
                                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                                    <div>
                                        <label className="block font-semibold mb-1 text-[#2D3142]">Class Name *</label>
                                        <select value={data.class_name} onChange={e => setData('class_name', e.target.value)} className="w-full p-2 text-[11px] rounded-lg border border-[#E2DFEE] focus:outline-hidden focus:border-[#6C63A8]">
                                            <option value="Tots Club">Tots Club</option>
                                            <option value="2 Years">2 Years</option>
                                            <option value="3 Years">3 Years</option>
                                            <option value="4 Years">4 Years</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block font-semibold mb-1 text-[#2D3142]">Age Category *</label>
                                        <select value={data.age_category || ''} onChange={e => setData('age_category', e.target.value)} className="w-full p-2 text-[11px] rounded-lg border border-[#E2DFEE] focus:outline-hidden focus:border-[#6C63A8]">
                                            <option value="Ages 10 - 23 Months">Ages 10 - 23 Months</option>
                                            <option value="Ages 2 - 3 Years">Ages 2 - 3 Years</option>
                                            <option value="Ages 4 - 6 Years">Ages 4 - 6 Years</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block font-semibold mb-1 text-[#2D3142]">Package Selection *</label>
                                        <select value={data.selected_service} onChange={e => setData('selected_service', e.target.value)} className="w-full p-2 text-[11px] rounded-lg border border-[#E2DFEE] focus:outline-hidden focus:border-[#6C63A8]">
                                            <option value="Half Day">Half Day (RM350)</option>
                                            <option value="Full Day">Full Day (RM450)</option>
                                            <option value="Plus Package">Plus Package (RM500)</option>
                                        </select>
                                    </div>
                                </div>
                            </div>

                            {/* 3. FATHER & GUARDIAN */}
                            <div>
                                <h4 className="font-extrabold text-[#6C63A8] uppercase text-[10px] tracking-wider mb-2 pb-1 border-b">3. FATHER & PRIMARY GUARDIAN DETAILS</h4>
                                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                                    <div>
                                        <label className="block font-semibold mb-1 text-[#2D3142]">Father's Name</label>
                                        <input type="text" value={data.father_name} onChange={e => setData('father_name', e.target.value)} className="w-full p-2 text-[11px] rounded-lg border border-[#E2DFEE] focus:outline-hidden focus:border-[#6C63A8]" />
                                    </div>
                                    <div>
                                        <label className="block font-semibold mb-1 text-[#2D3142]">Father's IC</label>
                                        <input type="text" value={data.father_ic_number} onChange={e => setData('father_ic_number', e.target.value)} className="w-full p-2 text-[11px] rounded-lg border border-[#E2DFEE] focus:outline-hidden focus:border-[#6C63A8]" />
                                    </div>
                                    <div>
                                        <label className="block font-semibold mb-1 text-[#2D3142]">Father's Phone</label>
                                        <input type="text" value={data.father_phone} onChange={e => setData('father_phone', e.target.value)} className="w-full p-2 text-[11px] rounded-lg border border-[#E2DFEE] focus:outline-hidden focus:border-[#6C63A8]" />
                                    </div>
                                    <div>
                                        <label className="block font-semibold mb-1 text-[#2D3142]">Father's Occupation</label>
                                        <input type="text" value={data.father_occupation} onChange={e => setData('father_occupation', e.target.value)} className="w-full p-2 text-[11px] rounded-lg border border-[#E2DFEE] focus:outline-hidden focus:border-[#6C63A8]" />
                                    </div>
                                    <div>
                                        <label className="block font-semibold mb-1 text-[#2D3142]">Father's Race</label>
                                        <input type="text" value={data.father_race} onChange={e => setData('father_race', e.target.value)} className="w-full p-2 text-[11px] rounded-lg border border-[#E2DFEE] focus:outline-hidden focus:border-[#6C63A8]" />
                                    </div>
                                    <div>
                                        <label className="block font-semibold mb-1 text-[#2D3142]">Father's Nationality</label>
                                        <input type="text" value={data.father_nationality} onChange={e => setData('father_nationality', e.target.value)} className="w-full p-2 text-[11px] rounded-lg border border-[#E2DFEE] focus:outline-hidden focus:border-[#6C63A8]" />
                                    </div>
                                </div>
                            </div>

                            {/* 4. MOTHER DETAILS */}
                            <div>
                                <h4 className="font-extrabold text-[#6C63A8] uppercase text-[10px] tracking-wider mb-2 pb-1 border-b">4. MOTHER DETAILS</h4>
                                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                                    <div>
                                        <label className="block font-semibold mb-1 text-[#2D3142]">Mother's Name</label>
                                        <input type="text" value={data.mother_name} onChange={e => setData('mother_name', e.target.value)} className="w-full p-2 text-[11px] rounded-lg border border-[#E2DFEE] focus:outline-hidden focus:border-[#6C63A8]" />
                                    </div>
                                    <div>
                                        <label className="block font-semibold mb-1 text-[#2D3142]">Mother's IC</label>
                                        <input type="text" value={data.mother_ic_number} onChange={e => setData('mother_ic_number', e.target.value)} className="w-full p-2 text-[11px] rounded-lg border border-[#E2DFEE] focus:outline-hidden focus:border-[#6C63A8]" />
                                    </div>
                                    <div>
                                        <label className="block font-semibold mb-1 text-[#2D3142]">Mother's Phone</label>
                                        <input type="text" value={data.mother_phone} onChange={e => setData('mother_phone', e.target.value)} className="w-full p-2 text-[11px] rounded-lg border border-[#E2DFEE] focus:outline-hidden focus:border-[#6C63A8]" />
                                    </div>
                                </div>
                            </div>

                            {/* ACTION BUTTONS */}
                            <div className="flex justify-end gap-2 pt-3 border-t border-[#E2DFEE] shrink-0">
                                <button type="button" onClick={() => setIsAddEditModalOpen(false)} className="px-3 py-1.5 bg-slate-100 rounded-lg font-bold text-[#2D3142]">Cancel</button>
                                <button type="submit" disabled={processing} className="px-5 py-1.5 bg-[#6C63A8] text-white rounded-lg font-bold hover:bg-[#514A82]">Save Record</button>
                            </div>

                        </form>
                    </div>
                </div>
            )}

        </AuthenticatedLayout>
    );
}
