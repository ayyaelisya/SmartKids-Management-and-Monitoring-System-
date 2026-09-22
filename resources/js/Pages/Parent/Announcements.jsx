import React, { useMemo, useState } from 'react';
import { Head } from '@inertiajs/react';
import AuthenticatedLayoutParent from '@/Layouts/AuthenticatedLayoutParent';

export default function Announcements({ announcements = [] }) {
    const [search, setSearch] = useState('');
    const [priorityFilter, setPriorityFilter] = useState('All');

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

            const matchesPriority =
                priorityFilter === 'All' ||
                announcement.priority === priorityFilter;

            return matchesSearch && matchesPriority;
        });
    }, [announcements, search, priorityFilter]);

    const formatDate = (value) => {
        if (!value) return '-';

        const date = new Date(value);

        if (Number.isNaN(date.getTime())) return '-';

        return new Intl.DateTimeFormat('en-MY', {
            day: '2-digit',
            month: 'short',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        }).format(date);
    };

    const priorityStyle = (priority) => {
        if (priority === 'Urgent') {
            return 'bg-rose-100 text-rose-700 border-rose-200';
        }

        if (priority === 'Important') {
            return 'bg-amber-100 text-amber-700 border-amber-200';
        }

        return 'bg-emerald-100 text-emerald-700 border-emerald-200';
    };

    return (
        <AuthenticatedLayoutParent activeNavId="announcements" pageTitle="Announcements" pageSubtitle="News & Updates">
            <Head title="Announcements - Parent Portal" />

            <main className="w-full">
                <div className="mx-auto w-full max-w-7xl space-y-6 p-4 sm:p-6 lg:p-8">
                    <section className="overflow-hidden rounded-3xl bg-slate-900 p-6 text-white shadow-lg sm:p-8">
                        <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-center">
                            <div>
                                <span className="inline-flex rounded-full bg-amber-400 px-3 py-1 text-[10px] font-black uppercase text-amber-950">
                                    Parent Notice Board
                                </span>
                                <h2 className="mt-4 text-2xl font-black sm:text-3xl">
                                    Stay informed with the latest updates
                                </h2>
                                <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-300">
                                    View important notices and updates from the
                                    administration and teachers.
                                </p>
                            </div>
                            <div className="text-5xl" aria-hidden="true">
                                📢
                            </div>
                        </div>
                    </section>

                    <section className="flex flex-col gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:flex-row">
                        <div className="relative flex-1">
                            <span className="absolute left-3.5 top-2.5 text-sm">
                                🔍
                            </span>
                            <input
                                type="text"
                                value={search}
                                onChange={(event) => setSearch(event.target.value)}
                                placeholder="Search announcements..."
                                className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2.5 pl-10 pr-4 text-xs font-medium focus:border-amber-400 focus:ring-amber-400"
                            />
                        </div>

                        <select
                            value={priorityFilter}
                            onChange={(event) =>
                                setPriorityFilter(event.target.value)
                            }
                            className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-xs font-bold focus:border-amber-400 focus:ring-amber-400"
                        >
                            <option value="All">All Priorities</option>
                            <option value="Normal">Normal</option>
                            <option value="Important">Important</option>
                            <option value="Urgent">Urgent</option>
                        </select>
                    </section>

                    <div className="flex items-center justify-between">
                        <h3 className="text-base font-black text-slate-900">
                            Latest Announcements
                        </h3>
                        <span className="text-xs font-bold text-slate-400">
                            {filteredAnnouncements.length} Records
                        </span>
                    </div>

                    {filteredAnnouncements.length === 0 ? (
                        <section className="rounded-2xl border border-slate-200 bg-white px-6 py-16 text-center shadow-sm">
                            <div className="text-4xl">📭</div>
                            <h3 className="mt-3 text-base font-black text-slate-900">
                                No announcements found
                            </h3>
                            <p className="mt-1 text-xs font-medium text-slate-500">
                                There are no published announcements matching
                                your search.
                            </p>
                        </section>
                    ) : (
                        <section className="space-y-4">
                            {filteredAnnouncements.map((announcement) => (
                                <article
                                    key={announcement.id}
                                    className={`rounded-2xl border bg-white p-5 shadow-sm transition hover:shadow-md sm:p-6 ${
                                        announcement.priority === 'Urgent'
                                            ? 'border-rose-200'
                                            : announcement.priority ===
                                              'Important'
                                            ? 'border-amber-200'
                                            : 'border-slate-200'
                                    }`}
                                >
                                    <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-start">
                                        <div className="min-w-0">
                                            <div className="flex flex-wrap items-center gap-2">
                                                <span
                                                    className={`rounded-full border px-2.5 py-1 text-[9px] font-black uppercase ${priorityStyle(
                                                        announcement.priority
                                                    )}`}
                                                >
                                                    {announcement.priority}
                                                </span>
                                                <span className="rounded-full border border-slate-200 bg-slate-100 px-2.5 py-1 text-[9px] font-black uppercase text-slate-600">
                                                    {announcement.target_audience ===
                                                    'All'
                                                        ? 'All Families'
                                                        : 'Parents'}
                                                </span>
                                            </div>

                                            <h4 className="mt-3 break-words text-lg font-black text-slate-900">
                                                {announcement.title}
                                            </h4>
                                        </div>

                                        <span className="shrink-0 text-2xl" aria-hidden="true">
                                            {announcement.priority === 'Urgent'
                                                ? '🚨'
                                                : announcement.priority ===
                                                  'Important'
                                                ? '⭐'
                                                : '📌'}
                                        </span>
                                    </div>

                                    <p className="mt-4 whitespace-pre-line break-words text-sm leading-6 text-slate-600">
                                        {announcement.content}
                                    </p>

                                    <div className="mt-5 flex flex-col gap-2 border-t border-slate-100 pt-4 text-[10px] font-semibold text-slate-500 sm:flex-row sm:items-center sm:justify-between">
                                        <span>
                                            👤{' '}
                                            {announcement.creator?.full_name ??
                                                'Smart Kids Management'}
                                        </span>
                                        <span>
                                            🗓️{' '}
                                            {formatDate(
                                                announcement.published_at
                                            )}
                                        </span>
                                    </div>
                                </article>
                            ))}
                        </section>
                    )}
                </div>
            </main>
        </AuthenticatedLayoutParent>
    );
}
