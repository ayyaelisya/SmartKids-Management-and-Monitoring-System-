import React, { useState } from 'react';
import { Head, useForm, router } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';

export default function AnnouncementManagement({
    announcements = [],
}) {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingAnnouncement, setEditingAnnouncement] = useState(null);

    const [filterStatus, setFilterStatus] = useState('all');
    const [searchQuery, setSearchQuery] = useState('');

    const {
        data,
        setData,
        post,
        put,
        processing,
        reset,
        errors,
        clearErrors,
    } = useForm({
        title: '',
        content: '',
        target_audience: 'All',
        priority: 'Normal',
        status: 'Draft',
    });

    const openCreateModal = () => {
        setEditingAnnouncement(null);
        clearErrors();

        setData({
            title: '',
            content: '',
            target_audience: 'All',
            priority: 'Normal',
            status: 'Draft',
        });

        setIsModalOpen(true);
    };

    const openEditModal = (announcement) => {
        setEditingAnnouncement(announcement);
        clearErrors();

        setData({
            title: announcement.title || '',
            content: announcement.content || '',
            target_audience:
                announcement.target_audience || 'All',
            priority: announcement.priority || 'Normal',
            status: announcement.status || 'Draft',
        });

        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setEditingAnnouncement(null);
        reset();
        clearErrors();
    };

    const handleSubmit = (e) => {
        e.preventDefault();

        if (editingAnnouncement) {
            put(
                `/admin/announcements/${editingAnnouncement.id}`,
                {
                    preserveScroll: true,

                    onSuccess: () => {
                        closeModal();
                        alert(
                            'Announcement updated successfully!'
                        );
                    },
                }
            );

            return;
        }

        post('/admin/announcements', {
            preserveScroll: true,

            onSuccess: () => {
                closeModal();

                alert(
                    data.status === 'Published'
                        ? 'Announcement published successfully!'
                        : 'Announcement saved as draft!'
                );
            },
        });
    };

    const handleDelete = (announcement) => {
        if (
            !window.confirm(
                `Are you sure you want to delete "${announcement.title}"?`
            )
        ) {
            return;
        }

        router.delete(
            `/admin/announcements/${announcement.id}`,
            {
                preserveScroll: true,

                onSuccess: () => {
                    alert(
                        'Announcement deleted successfully!'
                    );
                },
            }
        );
    };

    const filteredAnnouncements = announcements.filter(
        (announcement) => {
            const matchesStatus =
                filterStatus === 'all' ||
                announcement.status
                    ?.toLowerCase() === filterStatus;

            const query = searchQuery
                .trim()
                .toLowerCase();

            const title = (
                announcement.title || ''
            ).toLowerCase();

            const content = (
                announcement.content || ''
            ).toLowerCase();

            const creator = (
                announcement.creator?.full_name || ''
            ).toLowerCase();

            const matchesSearch =
                title.includes(query) ||
                content.includes(query) ||
                creator.includes(query);

            return matchesStatus && matchesSearch;
        }
    );

    const formatDate = (date) => {
        if (!date) {
            return '-';
        }

        return new Date(date).toLocaleString(
            'en-MY',
            {
                day: '2-digit',
                month: 'short',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
            }
        );
    };

    const getPriorityClass = (priority) => {
        if (priority === 'Urgent') {
            return 'bg-rose-50 text-rose-700 border border-rose-200';
        }

        if (priority === 'Important') {
            return 'bg-amber-50 text-amber-700 border border-amber-200';
        }

        return 'bg-sky-50 text-sky-700 border border-sky-200';
    };

    const getStatusClass = (status) => {
        if (status === 'Published') {
            return 'bg-emerald-50 text-emerald-700 border border-emerald-200';
        }

        return 'bg-slate-100 text-slate-600 border border-slate-200';
    };

    const getAudienceClass = (audience) => {
        if (audience === 'Parents') {
            return 'bg-amber-100 text-amber-700 border border-amber-200';
        }

        if (audience === 'Teachers') {
            return 'bg-sky-100 text-sky-700 border border-sky-200';
        }

        return 'bg-purple-100 text-purple-700 border border-purple-200';
    };

    return (
        <AuthenticatedLayout activeNavId="announcements">
            <Head title="Announcements - SmartKids Admin" />

            <div className="space-y-6">
                {/* PAGE HEADER */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white/70 backdrop-blur-md p-6 rounded-3xl border border-white/60 shadow-xs">
                    <div>

                        <h1 className="text-2xl sm:text-1xl font-black text-slate-900 tracking-tight mt-0.5">
                            Announcement Management
                        </h1>

                        <p className="text-xs sm:text-sm text-slate-500 font-medium mt-1">
                            Create and manage announcements for
                            teachers and parents.
                        </p>
                    </div>

                    <button
                        type="button"
                        onClick={openCreateModal}
                        className="px-5 py-2.5 bg-[#6C63FF] hover:bg-[#5A52D5] text-white font-bold text-xs rounded-2xl transition-all shadow-md hover:shadow-indigo-500/20 active:scale-95 flex items-center justify-center gap-2 cursor-pointer"
                    >
                        <span className="text-base leading-none">
                            +
                        </span>

                        New Announcement
                    </button>
                </div>

                {/* FILTER / SEARCH */}
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
                    <div className="flex gap-2 border-b border-slate-200/80 pb-3 overflow-x-auto">
                        {[
                            {
                                value: 'all',
                                label: 'All Announcements',
                            },
                            {
                                value: 'published',
                                label: 'Published',
                            },
                            {
                                value: 'draft',
                                label: 'Draft',
                            },
                        ].map((filter) => (
                            <button
                                key={filter.value}
                                type="button"
                                onClick={() =>
                                    setFilterStatus(
                                        filter.value
                                    )
                                }
                                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
                                    filterStatus ===
                                    filter.value
                                        ? 'bg-[#524987] text-white shadow-md'
                                        : 'bg-white/80 text-slate-600 hover:bg-white border border-slate-200/60'
                                }`}
                            >
                                {filter.label}
                            </button>
                        ))}
                    </div>

                    <div className="relative">
                        <input
                            type="text"
                            placeholder="Search announcements..."
                            value={searchQuery}
                            onChange={(e) =>
                                setSearchQuery(
                                    e.target.value
                                )
                            }
                            className="w-full sm:w-64 px-4 py-2 text-xs border border-slate-200/80 bg-white/80 rounded-xl focus:outline-hidden focus:border-[#6C63FF] font-semibold text-slate-900 placeholder:text-slate-400 shadow-xs"
                        />
                    </div>
                </div>

                {/* ANNOUNCEMENT TABLE */}
                <div className="bg-white/80 backdrop-blur-md rounded-3xl border border-white/60 shadow-xs overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-xs border-collapse">
                            <thead className="bg-slate-50/80 border-b border-slate-200/60 text-[10px] text-slate-500 font-extrabold uppercase tracking-wider">
                                <tr>
                                    <th className="px-6 py-4">
                                        Announcement
                                    </th>

                                    <th className="px-6 py-4">
                                        Audience
                                    </th>

                                    <th className="px-6 py-4">
                                        Priority
                                    </th>

                                    <th className="px-6 py-4">
                                        Status
                                    </th>

                                    <th className="px-6 py-4">
                                        Created By
                                    </th>

                                    <th className="px-6 py-4">
                                        Published
                                    </th>

                                    <th className="px-6 py-4">
                                        Actions
                                    </th>
                                </tr>
                            </thead>

                            <tbody className="divide-y divide-slate-100 font-medium text-slate-800">
                                {filteredAnnouncements.length >
                                0 ? (
                                    filteredAnnouncements.map(
                                        (announcement) => (
                                            <tr
                                                key={
                                                    announcement.id
                                                }
                                                className="hover:bg-slate-50/60 transition-colors"
                                            >
                                                <td className="px-6 py-4">
                                                    <div className="max-w-xs">
                                                        <p className="font-bold text-slate-900">
                                                            {
                                                                announcement.title
                                                            }
                                                        </p>

                                                        <p className="text-[11px] text-slate-400 font-normal mt-1 line-clamp-2">
                                                            {
                                                                announcement.content
                                                            }
                                                        </p>
                                                    </div>
                                                </td>

                                                <td className="px-6 py-4">
                                                    <span
                                                        className={`inline-block px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${getAudienceClass(
                                                            announcement.target_audience
                                                        )}`}
                                                    >
                                                        {
                                                            announcement.target_audience
                                                        }
                                                    </span>
                                                </td>

                                                <td className="px-6 py-4">
                                                    <span
                                                        className={`inline-block px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${getPriorityClass(
                                                            announcement.priority
                                                        )}`}
                                                    >
                                                        {
                                                            announcement.priority
                                                        }
                                                    </span>
                                                </td>

                                                <td className="px-6 py-4">
                                                    <span
                                                        className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${getStatusClass(
                                                            announcement.status
                                                        )}`}
                                                    >
                                                        <span
                                                            className={`w-2 h-2 rounded-full ${
                                                                announcement.status ===
                                                                'Published'
                                                                    ? 'bg-emerald-500'
                                                                    : 'bg-slate-400'
                                                            }`}
                                                        />

                                                        {
                                                            announcement.status
                                                        }
                                                    </span>
                                                </td>

                                                <td className="px-6 py-4 text-slate-600">
                                                    <div className="font-semibold">
                                                        {announcement
                                                            .creator
                                                            ?.full_name ||
                                                            'Unknown'}
                                                    </div>

                                                    <div className="text-[11px] text-slate-400 font-normal capitalize">
                                                        {announcement
                                                            .creator
                                                            ?.role ||
                                                            '-'}
                                                    </div>
                                                </td>

                                                <td className="px-6 py-4 text-slate-600">
                                                    {formatDate(
                                                        announcement.published_at
                                                    )}
                                                </td>

                                                <td className="px-6 py-4">
                                                    <div className="flex items-center gap-2">
                                                        <button
                                                            type="button"
                                                            onClick={() =>
                                                                openEditModal(
                                                                    announcement
                                                                )
                                                            }
                                                            className="px-4 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 rounded-xl text-xs font-bold uppercase tracking-wider transition-all cursor-pointer active:scale-95"
                                                        >
                                                            Edit
                                                        </button>

                                                        <button
                                                            type="button"
                                                            onClick={() =>
                                                                handleDelete(
                                                                    announcement
                                                                )
                                                            }
                                                            className="px-4 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 rounded-xl text-xs font-bold uppercase tracking-wider transition-all cursor-pointer active:scale-95"
                                                        >
                                                            Delete
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        )
                                    )
                                ) : (
                                    <tr>
                                        <td
                                            colSpan={7}
                                            className="px-6 py-12 text-center text-slate-400 text-xs font-semibold"
                                        >
                                            {announcements.length ===
                                            0
                                                ? 'No announcements found. Click "+ New Announcement" to create one.'
                                                : 'No announcements match your current filter or search.'}
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            {/* ADD / EDIT ANNOUNCEMENT MODAL */}
            {isModalOpen && (
                <div
                    className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4 z-50"
                    onClick={closeModal}
                >
                    <div
                        className="bg-white rounded-3xl max-w-2xl w-full p-6 sm:p-8 shadow-2xl border border-slate-100 space-y-4 max-h-[90vh] overflow-y-auto"
                        onClick={(e) =>
                            e.stopPropagation()
                        }
                    >
                        <div className="flex justify-between items-start gap-4 border-b border-slate-100 pb-3">
                            <div>
                                <h2 className="text-lg font-extrabold text-slate-900">
                                    {editingAnnouncement
                                        ? 'Edit Announcement'
                                        : 'Create New Announcement'}
                                </h2>

                                <p className="text-xs text-slate-500 font-medium mt-1">
                                    Enter the announcement
                                    information below.
                                </p>
                            </div>

                            <button
                                type="button"
                                onClick={closeModal}
                                className="text-slate-400 hover:text-slate-900 text-xl font-bold cursor-pointer"
                            >
                                ✕
                            </button>
                        </div>

                        <form
                            onSubmit={handleSubmit}
                            className="space-y-4"
                        >
                            <div>
                                <label
                                    htmlFor="title"
                                    className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1"
                                >
                                    Announcement Title
                                </label>

                                <input
                                    id="title"
                                    type="text"
                                    value={data.title}
                                    onChange={(e) =>
                                        setData(
                                            'title',
                                            e.target.value
                                        )
                                    }
                                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50/50 text-xs font-semibold text-slate-900 focus:outline-hidden focus:border-[#6C63FF]"
                                    placeholder="e.g., Public Holiday Notice"
                                    required
                                />

                                {errors.title && (
                                    <p className="text-rose-600 text-xs mt-1 font-semibold">
                                        {errors.title}
                                    </p>
                                )}
                            </div>

                            <div>
                                <label
                                    htmlFor="content"
                                    className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1"
                                >
                                    Announcement Details
                                </label>

                                <textarea
                                    id="content"
                                    value={data.content}
                                    onChange={(e) =>
                                        setData(
                                            'content',
                                            e.target.value
                                        )
                                    }
                                    rows="5"
                                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50/50 text-xs font-semibold text-slate-900 focus:outline-hidden focus:border-[#6C63FF]"
                                    placeholder="Write the announcement details..."
                                    required
                                />

                                {errors.content && (
                                    <p className="text-rose-600 text-xs mt-1 font-semibold">
                                        {errors.content}
                                    </p>
                                )}
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                <div>
                                    <label
                                        htmlFor="target_audience"
                                        className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1"
                                    >
                                        Target Audience
                                    </label>

                                    <select
                                        id="target_audience"
                                        value={
                                            data.target_audience
                                        }
                                        onChange={(e) =>
                                            setData(
                                                'target_audience',
                                                e.target.value
                                            )
                                        }
                                        className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50/50 text-xs font-semibold text-slate-900 focus:outline-hidden focus:border-[#6C63FF]"
                                    >
                                        <option value="All">
                                            All Users
                                        </option>

                                        <option value="Teachers">
                                            Teachers
                                        </option>

                                        <option value="Parents">
                                            Parents
                                        </option>
                                    </select>

                                    {errors.target_audience && (
                                        <p className="text-rose-600 text-xs mt-1 font-semibold">
                                            {
                                                errors.target_audience
                                            }
                                        </p>
                                    )}
                                </div>

                                <div>
                                    <label
                                        htmlFor="priority"
                                        className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1"
                                    >
                                        Priority
                                    </label>

                                    <select
                                        id="priority"
                                        value={data.priority}
                                        onChange={(e) =>
                                            setData(
                                                'priority',
                                                e.target.value
                                            )
                                        }
                                        className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50/50 text-xs font-semibold text-slate-900 focus:outline-hidden focus:border-[#6C63FF]"
                                    >
                                        <option value="Normal">
                                            Normal
                                        </option>

                                        <option value="Important">
                                            Important
                                        </option>

                                        <option value="Urgent">
                                            Urgent
                                        </option>
                                    </select>

                                    {errors.priority && (
                                        <p className="text-rose-600 text-xs mt-1 font-semibold">
                                            {errors.priority}
                                        </p>
                                    )}
                                </div>
                            </div>

                            <div>
                                <label
                                    htmlFor="status"
                                    className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1"
                                >
                                    Status
                                </label>

                                <select
                                    id="status"
                                    value={data.status}
                                    onChange={(e) =>
                                        setData(
                                            'status',
                                            e.target.value
                                        )
                                    }
                                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50/50 text-xs font-semibold text-slate-900 focus:outline-hidden focus:border-[#6C63FF]"
                                >
                                    <option value="Draft">
                                        Save as Draft
                                    </option>

                                    <option value="Published">
                                        Publish Now
                                    </option>
                                </select>

                                {errors.status && (
                                    <p className="text-rose-600 text-xs mt-1 font-semibold">
                                        {errors.status}
                                    </p>
                                )}
                            </div>

                            {data.priority === 'Urgent' && (
                                <div className="bg-rose-50 border border-rose-200 rounded-2xl p-4">
                                    <p className="text-[10px] font-extrabold text-rose-700 uppercase tracking-wider">
                                        Urgent Announcement
                                    </p>

                                    <p className="text-xs text-rose-600 mt-1">
                                        This announcement will
                                        be highlighted as urgent
                                        for the selected
                                        audience.
                                    </p>
                                </div>
                            )}

                            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4">
                                <p className="text-[10px] font-extrabold text-slate-500 uppercase tracking-wider mb-1">
                                    Visibility
                                </p>

                                <p className="text-xs text-slate-600 font-medium">
                                    {data.status === 'Draft'
                                        ? 'This announcement is saved as a draft and is not visible to teachers or parents.'
                                        : data.target_audience ===
                                            'All'
                                          ? 'This announcement will be visible to teachers and parents.'
                                          : `This announcement will be visible to ${data.target_audience.toLowerCase()}.`}
                                </p>
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
                                    {processing
                                        ? 'Saving...'
                                        : editingAnnouncement
                                          ? 'Update Announcement'
                                          : data.status ===
                                              'Published'
                                            ? 'Publish Announcement'
                                            : 'Save Draft'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </AuthenticatedLayout>
    );
}
