import React, { useMemo, useState } from 'react';
import { Head, router, useForm, usePage } from '@inertiajs/react';
import AuthenticatedLayoutTeacher from '@/Layouts/AuthenticatedLayoutTeacher';
import {
    Bell,
    CalendarDays,
    Edit3,
    Megaphone,
    Plus,
    Search,
    Trash2,
    User,
    X,
} from 'lucide-react';

const emptyForm = {
    title: '',
    content: '',
    target_audience: 'Parents',
    priority: 'Normal',
    status: 'Draft',
};

export default function Announcements({ announcements = [] }) {
    const { auth, flash } = usePage().props;
    const currentUserId = auth?.user?.user_id ?? auth?.user?.id;

    const [search, setSearch] = useState('');
    const [statusFilter, setStatusFilter] = useState('All');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingAnnouncement, setEditingAnnouncement] = useState(null);

    const {
        data,
        setData,
        post,
        put,
        processing,
        errors,
        reset,
        clearErrors,
    } = useForm(emptyForm);

    const filteredAnnouncements = useMemo(() => {
        const keyword = search.trim().toLowerCase();

        return announcements.filter((announcement) => {
            const matchesSearch =
                !keyword ||
                announcement.title?.toLowerCase().includes(keyword) ||
                announcement.content?.toLowerCase().includes(keyword) ||
                announcement.creator?.full_name
                    ?.toLowerCase()
                    .includes(keyword);

            const matchesStatus =
                statusFilter === 'All' ||
                announcement.status === statusFilter;

            return matchesSearch && matchesStatus;
        });
    }, [announcements, search, statusFilter]);

    const openCreateModal = () => {
        setEditingAnnouncement(null);
        clearErrors();
        reset();
        setData({ ...emptyForm });
        setIsModalOpen(true);
    };

    const openEditModal = (announcement) => {
        setEditingAnnouncement(announcement);
        clearErrors();
        setData({
            title: announcement.title ?? '',
            content: announcement.content ?? '',
            target_audience: 'Parents',
            priority: announcement.priority ?? 'Normal',
            status: announcement.status ?? 'Draft',
        });
        setIsModalOpen(true);
    };

    const closeModal = () => {
        if (processing) return;

        setIsModalOpen(false);
        setEditingAnnouncement(null);
        clearErrors();
        reset();
    };

    const handleSubmit = (event) => {
        event.preventDefault();

        const options = {
            preserveScroll: true,
            onSuccess: closeModal,
        };

        if (editingAnnouncement) {
            put(
                route(
                    'teacher.announcements.update',
                    editingAnnouncement.id
                ),
                options
            );
            return;
        }

        post(route('teacher.announcements.store'), options);
    };

    const handleDelete = (announcement) => {
        if (
            !window.confirm(
                `Delete announcement “${announcement.title}”?`
            )
        ) {
            return;
        }

        router.delete(
            route('teacher.announcements.destroy', announcement.id),
            {
                preserveScroll: true,
            }
        );
    };

    const isOwnAnnouncement = (announcement) =>
        String(announcement.created_by) === String(currentUserId);

    const formatDate = (value) => {
        if (!value) return 'Not published';

        return new Intl.DateTimeFormat('en-MY', {
            day: '2-digit',
            month: 'short',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        }).format(new Date(value));
    };

    const priorityClass = (priority) => {
        if (priority === 'Urgent') {
            return 'bg-[#D97B73]/15 text-[#B94F47]';
        }

        if (priority === 'Important') {
            return 'bg-[#E8B85C]/20 text-[#9B6A12]';
        }

        return 'bg-[#7FAF8A]/15 text-[#527A5D]';
    };

    return (
        <AuthenticatedLayoutTeacher activeNavId="announcements">
            <Head title="Announcements - Teacher Portal" />

            <div className="space-y-6 pb-12">
                <div className="flex flex-col gap-4 rounded-2xl border border-[#E4E6E2] bg-white p-6 shadow-sm md:flex-row md:items-center md:justify-between">
                    <div>
                        <div className="flex items-center gap-2">
                            <Megaphone className="h-6 w-6 text-[#527A5D]" />
                            <h1 className="text-2xl font-extrabold text-[#26332A]">
                                Announcements
                            </h1>
                        </div>
                        <p className="mt-1 text-xs font-medium text-[#68736B]">
                            View school notices and publish updates for parents.
                        </p>
                    </div>

                    <button
                        type="button"
                        onClick={openCreateModal}
                        className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#527A5D] px-4 py-3 text-xs font-extrabold text-white transition hover:bg-[#42664B]"
                    >
                        <Plus className="h-4 w-4" />
                        New Announcement
                    </button>
                </div>

                {flash?.success && (
                    <div className="rounded-xl border border-[#72A77D]/30 bg-[#72A77D]/10 px-4 py-3 text-sm font-semibold text-[#527A5D]">
                        {flash.success}
                    </div>
                )}

                <div className="flex flex-col gap-3 rounded-2xl border border-[#E4E6E2] bg-white p-4 shadow-sm md:flex-row">
                    <div className="relative flex-1">
                        <Search className="absolute left-3.5 top-3 h-4 w-4 text-[#68736B]" />
                        <input
                            type="text"
                            value={search}
                            onChange={(event) => setSearch(event.target.value)}
                            placeholder="Search announcements..."
                            className="w-full rounded-xl border border-[#E4E6E2] bg-[#F8F7F2] py-2.5 pl-10 pr-4 text-xs font-medium focus:border-[#7FAF8A] focus:ring-[#7FAF8A]"
                        />
                    </div>

                    <select
                        value={statusFilter}
                        onChange={(event) =>
                            setStatusFilter(event.target.value)
                        }
                        className="rounded-xl border border-[#E4E6E2] bg-[#F8F7F2] px-4 py-2.5 text-xs font-bold focus:border-[#7FAF8A] focus:ring-[#7FAF8A]"
                    >
                        <option value="All">All Statuses</option>
                        <option value="Published">Published</option>
                        <option value="Draft">My Drafts</option>
                    </select>
                </div>

                {filteredAnnouncements.length === 0 ? (
                    <div className="rounded-2xl border border-[#E4E6E2] bg-white px-6 py-16 text-center shadow-sm">
                        <Bell className="mx-auto h-10 w-10 text-[#7FAF8A]" />
                        <h2 className="mt-3 text-base font-extrabold text-[#26332A]">
                            No announcements found
                        </h2>
                        <p className="mt-1 text-xs text-[#68736B]">
                            Create a new parent announcement or change the filter.
                        </p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
                        {filteredAnnouncements.map((announcement) => {
                            const ownAnnouncement =
                                isOwnAnnouncement(announcement);

                            return (
                                <article
                                    key={announcement.id}
                                    className="rounded-2xl border border-[#E4E6E2] bg-white p-5 shadow-sm"
                                >
                                    <div className="flex items-start justify-between gap-4">
                                        <div className="min-w-0">
                                            <div className="flex flex-wrap items-center gap-2">
                                                <span
                                                    className={`rounded-full px-2.5 py-1 text-[9px] font-black uppercase ${priorityClass(
                                                        announcement.priority
                                                    )}`}
                                                >
                                                    {announcement.priority}
                                                </span>
                                                <span
                                                    className={`rounded-full px-2.5 py-1 text-[9px] font-black uppercase ${
                                                        announcement.status ===
                                                        'Published'
                                                            ? 'bg-[#72A77D]/15 text-[#527A5D]'
                                                            : 'bg-gray-100 text-gray-500'
                                                    }`}
                                                >
                                                    {announcement.status}
                                                </span>
                                                <span className="rounded-full bg-[#F8F7F2] px-2.5 py-1 text-[9px] font-black uppercase text-[#68736B]">
                                                    {announcement.target_audience}
                                                </span>
                                            </div>

                                            <h2 className="mt-3 break-words text-lg font-extrabold text-[#26332A]">
                                                {announcement.title}
                                            </h2>
                                        </div>

                                        {ownAnnouncement && (
                                            <div className="flex shrink-0 items-center gap-1.5">
                                                <button
                                                    type="button"
                                                    onClick={() =>
                                                        openEditModal(
                                                            announcement
                                                        )
                                                    }
                                                    title="Edit announcement"
                                                    className="rounded-lg bg-[#E8B85C]/15 p-2 text-[#9B6A12] transition hover:bg-[#E8B85C]/30"
                                                >
                                                    <Edit3 className="h-4 w-4" />
                                                </button>
                                                <button
                                                    type="button"
                                                    onClick={() =>
                                                        handleDelete(
                                                            announcement
                                                        )
                                                    }
                                                    title="Delete announcement"
                                                    className="rounded-lg bg-[#D97B73]/15 p-2 text-[#B94F47] transition hover:bg-[#D97B73]/30"
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                </button>
                                            </div>
                                        )}
                                    </div>

                                    <p className="mt-4 whitespace-pre-line break-words text-sm leading-6 text-[#4F5B52]">
                                        {announcement.content}
                                    </p>

                                    <div className="mt-5 flex flex-col gap-2 border-t border-[#E4E6E2] pt-4 text-[10px] font-semibold text-[#68736B] sm:flex-row sm:items-center sm:justify-between">
                                        <span className="inline-flex items-center gap-1.5">
                                            <User className="h-3.5 w-3.5" />
                                            {announcement.creator?.full_name ??
                                                'Unknown user'}
                                            {ownAnnouncement
                                                ? ' (You)'
                                                : ''}
                                        </span>
                                        <span className="inline-flex items-center gap-1.5">
                                            <CalendarDays className="h-3.5 w-3.5" />
                                            {announcement.status === 'Published'
                                                ? formatDate(
                                                      announcement.published_at
                                                  )
                                                : 'Draft'}
                                        </span>
                                    </div>
                                </article>
                            );
                        })}
                    </div>
                )}
            </div>

            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#26332A]/60 p-4">
                    <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl bg-white shadow-2xl">
                        <div className="sticky top-0 flex items-center justify-between border-b border-[#E4E6E2] bg-white px-6 py-4">
                            <div>
                                <h2 className="text-lg font-extrabold text-[#26332A]">
                                    {editingAnnouncement
                                        ? 'Edit Announcement'
                                        : 'New Announcement'}
                                </h2>
                                <p className="mt-0.5 text-[10px] font-semibold text-[#68736B]">
                                    Teacher announcements are sent to parents.
                                </p>
                            </div>
                            <button
                                type="button"
                                onClick={closeModal}
                                className="rounded-lg p-2 text-[#68736B] hover:bg-[#F8F7F2]"
                            >
                                <X className="h-5 w-5" />
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-5 p-6">
                            <div>
                                <label className="mb-1.5 block text-xs font-extrabold text-[#26332A]">
                                    Title
                                </label>
                                <input
                                    type="text"
                                    value={data.title}
                                    onChange={(event) =>
                                        setData('title', event.target.value)
                                    }
                                    className="w-full rounded-xl border border-[#E4E6E2] px-4 py-3 text-sm focus:border-[#7FAF8A] focus:ring-[#7FAF8A]"
                                    placeholder="Enter announcement title"
                                />
                                {errors.title && (
                                    <p className="mt-1 text-xs font-semibold text-red-600">
                                        {errors.title}
                                    </p>
                                )}
                            </div>

                            <div>
                                <label className="mb-1.5 block text-xs font-extrabold text-[#26332A]">
                                    Content
                                </label>
                                <textarea
                                    rows="7"
                                    value={data.content}
                                    onChange={(event) =>
                                        setData('content', event.target.value)
                                    }
                                    className="w-full resize-y rounded-xl border border-[#E4E6E2] px-4 py-3 text-sm focus:border-[#7FAF8A] focus:ring-[#7FAF8A]"
                                    placeholder="Write the announcement details..."
                                />
                                {errors.content && (
                                    <p className="mt-1 text-xs font-semibold text-red-600">
                                        {errors.content}
                                    </p>
                                )}
                            </div>

                            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                                <div>
                                    <label className="mb-1.5 block text-xs font-extrabold text-[#26332A]">
                                        Priority
                                    </label>
                                    <select
                                        value={data.priority}
                                        onChange={(event) =>
                                            setData(
                                                'priority',
                                                event.target.value
                                            )
                                        }
                                        className="w-full rounded-xl border border-[#E4E6E2] px-4 py-3 text-sm focus:border-[#7FAF8A] focus:ring-[#7FAF8A]"
                                    >
                                        <option value="Normal">Normal</option>
                                        <option value="Important">
                                            Important
                                        </option>
                                        <option value="Urgent">Urgent</option>
                                    </select>
                                    {errors.priority && (
                                        <p className="mt-1 text-xs font-semibold text-red-600">
                                            {errors.priority}
                                        </p>
                                    )}
                                </div>

                                <div>
                                    <label className="mb-1.5 block text-xs font-extrabold text-[#26332A]">
                                        Status
                                    </label>
                                    <select
                                        value={data.status}
                                        onChange={(event) =>
                                            setData(
                                                'status',
                                                event.target.value
                                            )
                                        }
                                        className="w-full rounded-xl border border-[#E4E6E2] px-4 py-3 text-sm focus:border-[#7FAF8A] focus:ring-[#7FAF8A]"
                                    >
                                        <option value="Draft">
                                            Save as Draft
                                        </option>
                                        <option value="Published">
                                            Publish Now
                                        </option>
                                    </select>
                                    {errors.status && (
                                        <p className="mt-1 text-xs font-semibold text-red-600">
                                            {errors.status}
                                        </p>
                                    )}
                                </div>
                            </div>

                            {errors.target_audience && (
                                <p className="text-xs font-semibold text-red-600">
                                    {errors.target_audience}
                                </p>
                            )}

                            <div className="flex justify-end gap-3 border-t border-[#E4E6E2] pt-5">
                                <button
                                    type="button"
                                    onClick={closeModal}
                                    disabled={processing}
                                    className="rounded-xl border border-[#E4E6E2] px-4 py-2.5 text-xs font-extrabold text-[#68736B] hover:bg-[#F8F7F2] disabled:opacity-50"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={processing}
                                    className="rounded-xl bg-[#527A5D] px-5 py-2.5 text-xs font-extrabold text-white hover:bg-[#42664B] disabled:cursor-not-allowed disabled:opacity-50"
                                >
                                    {processing
                                        ? 'Saving...'
                                        : data.status === 'Published'
                                        ? 'Publish Announcement'
                                        : 'Save Draft'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </AuthenticatedLayoutTeacher>
    );
}
