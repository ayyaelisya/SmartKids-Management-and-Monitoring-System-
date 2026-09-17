import React, { useState, useEffect, useCallback } from 'react';
import { Head, useForm, usePage, router } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';

export default function StaffAccounts({ accounts = [], students = [] }) {
    // =========================
    // MODAL STATES
    // =========================
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isApprovalModalOpen, setIsApprovalModalOpen] = useState(false);

    const [selectedParent, setSelectedParent] = useState(null);
    const [selectedStudentIds, setSelectedStudentIds] = useState([]);

    const [approvalProcessing, setApprovalProcessing] = useState(false);
    const [approvalError, setApprovalError] = useState('');

    // =========================
    // FILTER / SEARCH
    // =========================
    const [filterRole, setFilterRole] = useState('all');
    const [searchQuery, setSearchQuery] = useState('');

    // =========================
    // ADD ACCOUNT FORM
    // =========================
    const {
        data,
        setData,
        post,
        processing,
        reset,
        errors,
        clearErrors,
    } = useForm({
        full_name: '',
        email: '',
        phone_number: '',
        password: '',
        role: 'teacher',
        relationship: 'father',
        qualification: '',
        address: '',
    });

    // =========================
    // GET USER / PARENT ID
    // =========================
    const getParentId = (account) => {
        return (
            account?.parent?.id ||
            account?.parent?.parent_id ||
            account?.parent_id ||
            account?.user_id ||
            account?.id
        );
    };

    // =========================
    // CLOSE ADD ACCOUNT MODAL
    // =========================
    const closeModal = useCallback(() => {
        setIsModalOpen(false);
        reset();
        clearErrors();
    }, [reset, clearErrors]);

    const openModal = () => {
        reset();
        clearErrors();
        setIsModalOpen(true);
    };

    // =========================
    // ROLE CHANGE
    // =========================
    const handleRoleChange = (e) => {
        const newRole = e.target.value;

        setData((prev) => ({
            ...prev,
            role: newRole,
            qualification: newRole === 'teacher' ? prev.qualification : '',
            relationship: newRole === 'parent' ? 'father' : '',
        }));
    };

    // =========================
    // ADD ACCOUNT SUBMIT
    // =========================
    const handleSubmit = (e) => {
        e.preventDefault();

        post('/staff-accounts', {
            preserveScroll: true,
            onSuccess: () => {
                closeModal();
                alert('Account saved successfully!');
            },
            onError: (err) => {
                const firstErr = Object.values(err)[0];
                alert('Failed to save: ' + (firstErr || 'Please check the form input.'));
            },
        });
    };

    // =========================
    // OPEN APPROVAL MODAL
    // =========================
    const openApprovalModal = (account) => {
        setSelectedParent(account);
        setSelectedStudentIds([]);
        setApprovalError('');
        setIsApprovalModalOpen(true);
    };

    // =========================
    // CLOSE APPROVAL MODAL
    // =========================
    const closeApprovalModal = () => {
        if (approvalProcessing) return;

        setIsApprovalModalOpen(false);
        setSelectedParent(null);
        setSelectedStudentIds([]);
        setApprovalError('');
    };

    // =========================
    // CHECKBOX STUDENT SELECTION
    // =========================
    const handleStudentSelection = (studentId) => {
        setSelectedStudentIds((previous) => {
            if (previous.includes(studentId)) {
                return previous.filter((id) => id !== studentId);
            }
            return [...previous, studentId];
        });
    };

    // =========================
    // APPROVE & LINK
    // =========================
    const handleApproveAndLink = () => {
        if (!selectedParent) {
            setApprovalError('Parent information could not be identified.');
            return;
        }

        if (selectedStudentIds.length === 0) {
            setApprovalError('Please select at least one student.');
            return;
        }

        const parentId = getParentId(selectedParent);

        if (!parentId) {
            setApprovalError('Parent ID could not be identified.');
            return;
        }

        setApprovalProcessing(true);
        setApprovalError('');

        router.post(
            '/staff-accounts/approve-parent',
            {
                parent_id: parentId,
                student_ids: selectedStudentIds,
            },
            {
                preserveScroll: true,
                onSuccess: () => {
                    setApprovalProcessing(false);
                    setIsApprovalModalOpen(false);
                    setSelectedParent(null);
                    setSelectedStudentIds([]);
                    alert('Parent registration approved and student(s) linked successfully!');
                },
                onError: (errors) => {
                    setApprovalProcessing(false);
                    const firstError = Object.values(errors)[0];
                    setApprovalError(firstError || 'Failed to approve parent registration.');
                },
                onFinish: () => {
                    setApprovalProcessing(false);
                },
            }
        );
    };

    // =========================
    // REJECT PARENT
    // =========================
    const handleRejectParent = () => {
        if (!selectedParent) return;

        const parentId = getParentId(selectedParent);

        if (!parentId) {
            setApprovalError('Parent ID could not be identified.');
            return;
        }

        if (!window.confirm('Are you sure you want to reject this parent registration?')) {
            return;
        }

        setApprovalProcessing(true);
        setApprovalError('');

        router.post(
            '/staff-accounts/reject-parent',
            { parent_id: parentId },
            {
                preserveScroll: true,
                onSuccess: () => {
                    setApprovalProcessing(false);
                    setIsApprovalModalOpen(false);
                    setSelectedParent(null);
                    setSelectedStudentIds([]);
                    alert('Parent registration rejected successfully.');
                },
                onError: (errors) => {
                    setApprovalProcessing(false);
                    const firstError = Object.values(errors)[0];
                    setApprovalError(firstError || 'Failed to reject parent registration.');
                },
                onFinish: () => {
                    setApprovalProcessing(false);
                },
            }
        );
    };

    // =========================
    // ESCAPE KEY MODAL CLOSING
    // =========================
    useEffect(() => {
        const handleKeyDown = (e) => {
            if (e.key !== 'Escape') return;

            if (isApprovalModalOpen) {
                closeApprovalModal();
            } else if (isModalOpen) {
                closeModal();
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [isModalOpen, isApprovalModalOpen, closeModal]);

    // =========================
    // FILTER ACCOUNTS
    // =========================
    const filteredAccounts = (accounts || []).filter((account) => {
        const matchesRole =
            filterRole === 'all' ||
            account.role === filterRole ||
            (filterRole === 'teacher' && account.role === 'staff');

        const name = (account.full_name || '').toLowerCase();
        const email = (account.email || '').toLowerCase();
        const phone = (account.phone_number || '').toLowerCase();
        const query = searchQuery.toLowerCase();

        return matchesRole && (name.includes(query) || email.includes(query) || phone.includes(query));
    });

    // =========================
    // HELPERS
    // =========================
    const getStatus = (account) => {
        return (account.status || account.user?.status || 'active').toLowerCase();
    };

    const getStudentId = (student) => {
        return student.student_id || student.id;
    };

    return (
        <AuthenticatedLayout activeNavId="users">
            <Head title="Staff Accounts - SmartKids Admin" />

            <div className="space-y-6">
                {/* PAGE HEADER */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white/70 backdrop-blur-md p-6 rounded-3xl border border-white/60 shadow-xs">
                    <div>
                        <span className="text-[10px] font-black text-[#6C63FF] uppercase tracking-widest">
                            SKMMS Portal
                        </span>
                        <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight mt-0.5">
                            Account Management
                        </h1>
                        <p className="text-xs sm:text-sm text-slate-500 font-medium mt-1">
                            Register and manage Staff, Teacher, and Parent accounts.
                        </p>
                    </div>

                    <button
                        type="button"
                        onClick={openModal}
                        className="px-5 py-2.5 bg-[#6C63FF] hover:bg-[#5A52D5] text-white font-bold text-xs rounded-2xl transition-all shadow-md hover:shadow-indigo-500/20 active:scale-95 flex items-center justify-center gap-2 cursor-pointer"
                    >
                        <span className="text-base leading-none">+</span>
                        Add New Account
                    </button>
                </div>

                {/* FILTER / SEARCH */}
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
                    <div className="flex gap-2 border-b border-slate-200/80 pb-3 overflow-x-auto">
                        {['all', 'admin', 'teacher', 'parent'].map((role) => (
                            <button
                                key={role}
                                type="button"
                                onClick={() => setFilterRole(role)}
                                className={`px-4 py-2 rounded-xl text-xs font-bold capitalize transition-all whitespace-nowrap cursor-pointer ${
                                    filterRole === role
                                        ? 'bg-[#524987] text-white shadow-md'
                                        : 'bg-white/80 text-slate-600 hover:bg-white border border-slate-200/60'
                                }`}
                            >
                                {role === 'all'
                                    ? 'All Accounts'
                                    : role === 'teacher'
                                    ? 'Teacher / Staff'
                                    : role === 'parent'
                                    ? 'Parents'
                                    : 'Admin'}
                            </button>
                        ))}
                    </div>

                    <div className="relative">
                        <input
                            type="text"
                            placeholder="Search accounts..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full sm:w-64 px-4 py-2 text-xs border border-slate-200/80 bg-white/80 rounded-xl focus:outline-hidden focus:border-[#6C63FF] font-semibold text-slate-900 placeholder:text-slate-400 shadow-xs"
                        />
                    </div>
                </div>

                {/* ACCOUNT TABLE */}
                <div className="bg-white/80 backdrop-blur-md rounded-3xl border border-white/60 shadow-xs overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-xs border-collapse">
                            <thead className="bg-slate-50/80 border-b border-slate-200/60 text-[10px] text-slate-500 font-extrabold uppercase tracking-wider">
                                <tr>
                                    <th className="px-6 py-4">Full Name</th>
                                    <th className="px-6 py-4">Email / Phone</th>
                                    <th className="px-6 py-4">Role</th>
                                    <th className="px-6 py-4">Additional Info</th>
                                    <th className="px-6 py-4">Status</th>
                                    <th className="px-6 py-4">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 font-medium text-slate-800">
                                {filteredAccounts.length > 0 ? (
                                    filteredAccounts.map((account) => {
                                        const status = getStatus(account);
                                        const key = account.id || account.user_id || account.email;

                                        return (
                                            <tr key={key} className="hover:bg-slate-50/60 transition-colors">
                                                <td className="px-6 py-4 font-bold text-slate-900">
                                                    {account.full_name || 'N/A'}
                                                </td>
                                                <td className="px-6 py-4 text-slate-600">
                                                    <div className="font-semibold">{account.email || '-'}</div>
                                                    <div className="text-[11px] text-slate-400 font-normal">
                                                        {account.phone_number || '-'}
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <span
                                                        className={`inline-block px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                                                            account.role === 'admin'
                                                                ? 'bg-purple-100 text-purple-700 border border-purple-200'
                                                                : account.role === 'teacher' || account.role === 'staff'
                                                                ? 'bg-sky-100 text-sky-700 border border-sky-200'
                                                                : 'bg-amber-100 text-amber-700 border border-amber-200'
                                                        }`}
                                                    >
                                                        {account.role}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 text-slate-600 text-xs">
                                                    {(account.role === 'teacher' || account.role === 'staff') && (
                                                        <div>
                                                            <span className="text-slate-400">Qualification:</span>{' '}
                                                            {account.teacher?.qualification || 'N/A'}
                                                        </div>
                                                    )}
                                                    {account.role === 'parent' && (
                                                        <div className="capitalize font-semibold text-slate-800">
                                                            <span className="text-slate-400 font-normal">Relationship:</span>{' '}
                                                            {account.parent?.relationship || 'N/A'}
                                                        </div>
                                                    )}
                                                    {account.role === 'admin' && <div>Full Access</div>}
                                                </td>
                                                <td className="px-6 py-4">
                                                    {status === 'pending' ? (
                                                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-amber-50 text-amber-700 border border-amber-200">
                                                            <span className="w-2 h-2 rounded-full bg-amber-500" />
                                                            Pending
                                                        </span>
                                                    ) : status === 'rejected' ? (
                                                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-rose-50 text-rose-700 border border-rose-200">
                                                            <span className="w-2 h-2 rounded-full bg-rose-500" />
                                                            Rejected
                                                        </span>
                                                    ) : (
                                                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-emerald-50 text-emerald-700 border border-emerald-200">
                                                            <span className="w-2 h-2 rounded-full bg-emerald-500" />
                                                            Active
                                                        </span>
                                                    )}
                                                </td>
                                                <td className="px-6 py-4">
                                                    {account.role === 'parent' && status === 'pending' ? (
                                                        <button
                                                            type="button"
                                                            onClick={() => openApprovalModal(account)}
                                                            className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold uppercase tracking-wider transition-all shadow-xs cursor-pointer active:scale-95"
                                                        >
                                                            Approve
                                                        </button>
                                                    ) : (
                                                        <button
                                                            type="button"
                                                            className="px-4 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 rounded-xl text-xs font-bold uppercase tracking-wider transition-all cursor-pointer active:scale-95"
                                                        >
                                                            View
                                                        </button>
                                                    )}
                                                </td>
                                            </tr>
                                        );
                                    })
                                ) : (
                                    <tr>
                                        <td
                                            colSpan={6}
                                            className="px-6 py-12 text-center text-slate-400 text-xs font-semibold"
                                        >
                                            No accounts found. Click "+ Add New Account" to register.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            {/* ADD NEW ACCOUNT MODAL */}
            {isModalOpen && (
                <div
                    className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4 z-50"
                    onClick={closeModal}
                >
                    <div
                        className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl border border-slate-100 space-y-4 max-h-[90vh] overflow-y-auto"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="flex justify-between items-center border-b border-slate-100 pb-3">
                            <h2 className="text-lg font-extrabold text-slate-900">Register New Account</h2>
                            <button
                                type="button"
                                onClick={closeModal}
                                className="text-slate-400 hover:text-slate-900 text-xl font-bold cursor-pointer"
                            >
                                ✕
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label htmlFor="role" className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                                    Account Role
                                </label>
                                <select
                                    id="role"
                                    value={data.role}
                                    onChange={handleRoleChange}
                                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50/50 text-xs font-semibold text-slate-900 focus:outline-hidden focus:border-[#6C63FF]"
                                >
                                    <option value="teacher">Teacher / Staff</option>
                                    <option value="parent">Parent / Guardian</option>
                                    <option value="admin">Admin</option>
                                </select>
                                {errors.role && <p className="text-rose-600 text-xs mt-1 font-semibold">{errors.role}</p>}
                            </div>

                            <div>
                                <label htmlFor="full_name" className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                                    Full Name
                                </label>
                                <input
                                    id="full_name"
                                    type="text"
                                    value={data.full_name}
                                    onChange={(e) => setData('full_name', e.target.value)}
                                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50/50 text-xs font-semibold text-slate-900 focus:outline-hidden focus:border-[#6C63FF]"
                                    placeholder="e.g., Jane Doe"
                                    required
                                />
                                {errors.full_name && <p className="text-rose-600 text-xs mt-1 font-semibold">{errors.full_name}</p>}
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                <div>
                                    <label htmlFor="email" className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                                        Email
                                    </label>
                                    <input
                                        id="email"
                                        type="email"
                                        value={data.email}
                                        onChange={(e) => setData('email', e.target.value)}
                                        className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50/50 text-xs font-semibold text-slate-900 focus:outline-hidden focus:border-[#6C63FF]"
                                        placeholder="name@email.com"
                                        required
                                    />
                                    {errors.email && <p className="text-rose-600 text-xs mt-1 font-semibold">{errors.email}</p>}
                                </div>

                                <div>
                                    <label htmlFor="phone_number" className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                                        Phone Number
                                    </label>
                                    <input
                                        id="phone_number"
                                        type="text"
                                        value={data.phone_number}
                                        onChange={(e) => setData('phone_number', e.target.value)}
                                        className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50/50 text-xs font-semibold text-slate-900 focus:outline-hidden focus:border-[#6C63FF]"
                                        placeholder="0123456789"
                                    />
                                    {errors.phone_number && <p className="text-rose-600 text-xs mt-1 font-semibold">{errors.phone_number}</p>}
                                </div>
                            </div>

                            <div>
                                <label htmlFor="password" className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                                    Password
                                </label>
                                <input
                                    id="password"
                                    type="password"
                                    value={data.password}
                                    onChange={(e) => setData('password', e.target.value)}
                                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50/50 text-xs font-semibold text-slate-900 focus:outline-hidden focus:border-[#6C63FF]"
                                    placeholder="••••••••"
                                    required
                                />
                                {errors.password && <p className="text-rose-600 text-xs mt-1 font-semibold">{errors.password}</p>}
                            </div>

                            {data.role === 'parent' && (
                                <div>
                                    <label htmlFor="relationship" className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                                        Relationship
                                    </label>
                                    <select
                                        id="relationship"
                                        value={data.relationship}
                                        onChange={(e) => setData('relationship', e.target.value)}
                                        className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50/50 text-xs font-semibold text-slate-900 focus:outline-hidden focus:border-[#6C63FF]"
                                    >
                                        <option value="father">Father</option>
                                        <option value="mother">Mother</option>
                                        <option value="guardian">Guardian</option>
                                    </select>
                                    {errors.relationship && <p className="text-rose-600 text-xs mt-1 font-semibold">{errors.relationship}</p>}
                                </div>
                            )}

                            {data.role === 'teacher' && (
                                <div>
                                    <label htmlFor="qualification" className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                                        Academic Qualification
                                    </label>
                                    <input
                                        id="qualification"
                                        type="text"
                                        value={data.qualification}
                                        onChange={(e) => setData('qualification', e.target.value)}
                                        className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50/50 text-xs font-semibold text-slate-900 focus:outline-hidden focus:border-[#6C63FF]"
                                        placeholder="e.g., Diploma in Early Childhood Education"
                                    />
                                    {errors.qualification && <p className="text-rose-600 text-xs mt-1 font-semibold">{errors.qualification}</p>}
                                </div>
                            )}

                            <div>
                                <label htmlFor="address" className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                                    Residential Address
                                </label>
                                <textarea
                                    id="address"
                                    value={data.address}
                                    onChange={(e) => setData('address', e.target.value)}
                                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50/50 text-xs font-semibold text-slate-900 focus:outline-hidden focus:border-[#6C63FF]"
                                    rows="2"
                                    placeholder="Home address..."
                                />
                                {errors.address && <p className="text-rose-600 text-xs mt-1 font-semibold">{errors.address}</p>}
                            </div>

                            <div className="flex justify-end gap-3 pt-3 border-t border-slate-100">
                                <button
                                    type="button"
                                    onClick={closeModal}
                                    className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-xs uppercase tracking-wider transition-all cursor-pointer"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={processing}
                                    className="px-5 py-2 bg-[#6C63FF] hover:bg-[#5A52D5] text-white font-bold rounded-xl text-xs uppercase tracking-wider shadow-sm transition-all cursor-pointer disabled:opacity-50"
                                >
                                    {processing ? 'Saving...' : 'Save Account'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* APPROVE PARENT MODAL */}
            {isApprovalModalOpen && selectedParent && (
                <div
                    className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4 z-50"
                    onClick={closeApprovalModal}
                >
                    <div
                        className="bg-white rounded-3xl max-w-2xl w-full shadow-2xl border border-slate-100 overflow-hidden"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="px-6 sm:px-8 pt-6 pb-4">
                            <div className="flex items-start justify-between gap-4">
                                <div>
                                    <h2 className="text-xl font-extrabold text-slate-900">
                                        Review & Approve Parent Registration
                                    </h2>
                                    <p className="text-xs text-slate-500 font-medium mt-1">
                                        Verify identity and explicitly link to student(s)
                                    </p>
                                </div>
                                <button
                                    type="button"
                                    onClick={closeApprovalModal}
                                    disabled={approvalProcessing}
                                    className="w-9 h-9 flex items-center justify-center rounded-full text-slate-400 hover:bg-slate-100 hover:text-slate-900 text-2xl transition-all disabled:opacity-50 cursor-pointer"
                                >
                                    ×
                                </button>
                            </div>
                            <div className="border-b border-slate-100 mt-5" />
                        </div>

                        <div className="px-6 sm:px-8 pb-6 space-y-5 max-h-[65vh] overflow-y-auto">
                            <div className="bg-slate-50 border border-slate-200/80 rounded-2xl p-5">
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-2 text-xs font-medium">
                                    <div>
                                        <span className="text-slate-400">Parent Name:</span>{' '}
                                        <span className="text-slate-900 font-bold">{selectedParent.full_name}</span>
                                    </div>
                                    <div>
                                        <span className="text-slate-400">NRIC:</span>{' '}
                                        <span className="text-slate-900 font-bold">
                                            {selectedParent.nric ||
                                                selectedParent.ic_number ||
                                                selectedParent.parent?.nric ||
                                                selectedParent.parent?.ic_number ||
                                                'Not provided'}
                                        </span>
                                    </div>
                                    <div>
                                        <span className="text-slate-400">Phone:</span>{' '}
                                        <span className="text-slate-900 font-bold">
                                            {selectedParent.phone_number || 'Not provided'}
                                        </span>
                                    </div>
                                    <div>
                                        <span className="text-slate-400">Email:</span>{' '}
                                        <span className="text-slate-900 font-bold break-all">{selectedParent.email}</span>
                                    </div>
                                    <div>
                                        <span className="text-slate-400">Relationship:</span>{' '}
                                        <span className="text-slate-900 font-bold capitalize">
                                            {selectedParent.parent?.relationship || 'Not provided'}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            <div>
                                <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                                    Select Student(s) to Link to this Parent:
                                </h3>
                                <p className="text-[11px] text-slate-400 font-normal mt-0.5">
                                    Select one or more children that this parent is authorised to access.
                                </p>
                            </div>

                            <div className="border border-slate-200/80 rounded-2xl overflow-hidden bg-white">
                                <div className="max-h-64 overflow-y-auto p-2 space-y-2">
                                    {students.length > 0 ? (
                                        students.map((student) => {
                                            const studentId = getStudentId(student);
                                            const isSelected = selectedStudentIds.includes(studentId);

                                            return (
                                                <label
                                                    key={studentId}
                                                    className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-all ${
                                                        isSelected
                                                            ? 'border-emerald-500 bg-emerald-50/50'
                                                            : 'border-slate-100 bg-slate-50/50 hover:bg-slate-100/60'
                                                    }`}
                                                >
                                                    <input
                                                        type="checkbox"
                                                        checked={isSelected}
                                                        onChange={() => handleStudentSelection(studentId)}
                                                        disabled={approvalProcessing}
                                                        className="w-4 h-4 accent-emerald-600"
                                                    />
                                                    <div className="w-11 h-11 rounded-full overflow-hidden bg-slate-200 border border-slate-300 shrink-0">
                                                        {student.profile_image || student.photo ? (
                                                            <img
                                                                src={student.profile_image || student.photo}
                                                                alt={student.full_name || 'Student'}
                                                                className="w-full h-full object-cover"
                                                            />
                                                        ) : (
                                                            <div className="w-full h-full flex items-center justify-center text-lg">
                                                                🧒
                                                            </div>
                                                        )}
                                                    </div>

                                                    <div className="min-w-0 flex-1">
                                                        <p className="font-bold text-xs text-slate-900 truncate">
                                                            {student.full_name}
                                                        </p>
                                                        <p className="text-[11px] text-slate-400 font-medium mt-0.5">
                                                            {studentId}
                                                            {' • '}
                                                            {student.age ? `${student.age} years` : 'Age not available'}
                                                            {' • '}
                                                            {student.class_name ||
                                                                student.class?.name ||
                                                                student.classroom?.name ||
                                                                'Class not assigned'}
                                                        </p>
                                                    </div>

                                                    {isSelected && (
                                                        <div className="w-6 h-6 rounded-full bg-emerald-600 text-white flex items-center justify-center text-xs font-bold">
                                                            ✓
                                                        </div>
                                                    )}
                                                </label>
                                            );
                                        })
                                    ) : (
                                        <div className="py-10 text-center text-xs text-slate-400 font-medium">
                                            No students available to link.
                                        </div>
                                    )}
                                </div>
                            </div>

                            {approvalError && (
                                <div className="bg-rose-50 border border-rose-200 text-rose-700 rounded-xl px-4 py-3 text-xs font-semibold">
                                    {approvalError}
                                </div>
                            )}
                        </div>

                        <div className="border-t border-slate-100 px-6 sm:px-8 py-4 flex flex-col sm:flex-row items-center justify-between gap-3">
                            <button
                                type="button"
                                onClick={handleRejectParent}
                                disabled={approvalProcessing}
                                className="text-rose-600 hover:text-rose-700 font-bold text-xs uppercase tracking-wider transition-all disabled:opacity-50 cursor-pointer"
                            >
                                Reject Registration
                            </button>

                            <div className="flex items-center gap-3 sm:ml-auto">
                                <button
                                    type="button"
                                    onClick={closeApprovalModal}
                                    disabled={approvalProcessing}
                                    className="px-5 py-2.5 text-slate-600 hover:bg-slate-100 font-bold rounded-xl text-xs uppercase tracking-wider transition-all disabled:opacity-50 cursor-pointer"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="button"
                                    onClick={handleApproveAndLink}
                                    disabled={selectedStudentIds.length === 0 || approvalProcessing}
                                    className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs uppercase tracking-wider shadow-xs transition-all disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
                                >
                                    {approvalProcessing
                                        ? 'Processing...'
                                        : `Approve & Link (${selectedStudentIds.length} ${
                                              selectedStudentIds.length === 1 ? 'Child' : 'Children'
                                          })`}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </AuthenticatedLayout>
    );
}
