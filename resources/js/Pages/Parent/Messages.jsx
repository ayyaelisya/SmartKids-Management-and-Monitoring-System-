import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Head, router, useForm, usePage } from '@inertiajs/react';
import AuthenticatedLayoutParent from '@/Layouts/AuthenticatedLayoutParent';
import {
    Download,
    FileText,
    MessageCircle,
    Paperclip,
    Plus,
    Search,
    Send,
    X,
} from 'lucide-react';

export default function Messages({
    conversations = [],
    selectedConversation = null,
    childrenList = [],
    teachersList = [],
}) {
    const { flash } = usePage().props;

    const [isNewChatOpen, setIsNewChatOpen] = useState(false);
    const [conversationSearch, setConversationSearch] = useState('');
    const messagesEndRef = useRef(null);
    const attachmentInputRef = useRef(null);

    const messageForm = useForm({
        message: '',
        attachment: null,
    });

    const conversationForm = useForm({
        student_id: '',
        teacher_id: '',
    });

    const availableTeachers = useMemo(() => {
        const child = childrenList.find(
            (item) =>
                String(item.id) === String(conversationForm.data.student_id)
        );

        if (!child) return [];

        return teachersList.filter(
            (teacher) =>
                !teacher.assigned_class ||
                teacher.assigned_class === child.class_name
        );
    }, [childrenList, teachersList, conversationForm.data.student_id]);

    const filteredConversations = useMemo(() => {
        const keyword = conversationSearch.trim().toLowerCase();

        if (!keyword) return conversations;

        return conversations.filter(
            (conversation) =>
                conversation.other_user?.name
                    ?.toLowerCase()
                    .includes(keyword) ||
                conversation.student?.name
                    ?.toLowerCase()
                    .includes(keyword) ||
                conversation.latest_message
                    ?.toLowerCase()
                    .includes(keyword)
        );
    }, [conversations, conversationSearch]);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [selectedConversation?.id, selectedConversation?.messages?.length]);

    // Near-real-time refresh without WebSocket.
    useEffect(() => {
        if (!selectedConversation?.id) return undefined;

        const interval = window.setInterval(() => {
            router.reload({
                only: ['conversations', 'selectedConversation'],
                preserveScroll: true,
                preserveState: true,
            });
        }, 5000);

        return () => window.clearInterval(interval);
    }, [selectedConversation?.id]);

    const openConversation = (conversationId) => {
        router.get(
            '/parent/messages',
            { conversation_id: conversationId },
            {
                preserveState: true,
                preserveScroll: true,
                replace: true,
            }
        );
    };

    const submitNewConversation = (event) => {
        event.preventDefault();

        conversationForm.post('/parent/messages/conversations', {
            preserveScroll: true,
            onSuccess: () => {
                setIsNewChatOpen(false);
                conversationForm.reset();
            },
        });
    };

    const sendMessage = (event) => {
        event.preventDefault();

        if (!selectedConversation) return;

        messageForm.post(
            `/parent/messages/${selectedConversation.id}/send`,
            {
                forceFormData: true,
                preserveScroll: true,
                onSuccess: () => {
                    messageForm.reset();

                    if (attachmentInputRef.current) {
                        attachmentInputRef.current.value = '';
                    }
                },
            }
        );
    };

    const formatTime = (value) => {
        if (!value) return '';
        const date = new Date(value);
        if (Number.isNaN(date.getTime())) return '';

        return new Intl.DateTimeFormat('en-MY', {
            hour: '2-digit',
            minute: '2-digit',
        }).format(date);
    };

    const formatConversationTime = (value) => {
        if (!value) return '';
        const date = new Date(value);
        if (Number.isNaN(date.getTime())) return '';

        return new Intl.DateTimeFormat('en-MY', {
            day: '2-digit',
            month: 'short',
        }).format(date);
    };

    return (
        <AuthenticatedLayoutParent activeNavId="messages" pageTitle="Messages" pageSubtitle="Parent–Teacher Communication">
            <Head title="Messages - Parent Portal" />

            <main className="w-full">

                <div className="flex min-h-0 flex-1 p-3 sm:p-5 lg:p-6">
                    <div className="grid min-h-[70vh] w-full overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm lg:grid-cols-[340px_minmax(0,1fr)]">
                        <section className="border-b border-slate-200 lg:border-b-0 lg:border-r">
                            <div className="border-b border-slate-200 p-4">
                                <div className="flex items-center justify-between gap-3">
                                    <h2 className="font-black text-slate-900">Conversations</h2>
                                    <button
                                        type="button"
                                        onClick={() => setIsNewChatOpen(true)}
                                        className="flex items-center gap-1.5 rounded-xl bg-amber-400 px-3 py-2 text-[10px] font-black text-amber-950 hover:bg-amber-500"
                                    >
                                        <Plus className="h-3.5 w-3.5" /> New Chat
                                    </button>
                                </div>

                                <div className="relative mt-3">
                                    <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                                    <input
                                        value={conversationSearch}
                                        onChange={(event) => setConversationSearch(event.target.value)}
                                        placeholder="Search conversation..."
                                        className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2 pl-9 pr-3 text-xs focus:border-amber-400 focus:ring-amber-400"
                                    />
                                </div>
                            </div>

                            <div className="max-h-[64vh] overflow-y-auto">
                                {filteredConversations.length === 0 ? (
                                    <div className="px-5 py-12 text-center">
                                        <MessageCircle className="mx-auto h-9 w-9 text-slate-300" />
                                        <p className="mt-3 text-xs font-bold text-slate-500">No conversations yet.</p>
                                    </div>
                                ) : (
                                    filteredConversations.map((conversation) => (
                                        <button
                                            key={conversation.id}
                                            type="button"
                                            onClick={() => openConversation(conversation.id)}
                                            className={`w-full border-b border-slate-100 p-4 text-left transition hover:bg-slate-50 ${
                                                selectedConversation?.id === conversation.id
                                                    ? 'bg-amber-50'
                                                    : 'bg-white'
                                            }`}
                                        >
                                            <div className="flex items-start gap-3">
                                                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-100 text-sm font-black text-emerald-700">
                                                    {conversation.other_user?.name?.charAt(0)?.toUpperCase() || 'T'}
                                                </div>
                                                <div className="min-w-0 flex-1">
                                                    <div className="flex items-center justify-between gap-2">
                                                        <p className="truncate text-xs font-black text-slate-900">{conversation.other_user?.name}</p>
                                                        <span className="shrink-0 text-[9px] font-semibold text-slate-400">{formatConversationTime(conversation.last_message_at)}</span>
                                                    </div>
                                                    <p className="mt-0.5 truncate text-[10px] font-bold text-amber-700">Regarding: {conversation.student?.name}</p>
                                                    <div className="mt-1 flex items-center justify-between gap-2">
                                                        <p className="truncate text-[10px] text-slate-500">{conversation.latest_message}</p>
                                                        {conversation.unread_count > 0 && (
                                                            <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-rose-500 px-1 text-[9px] font-black text-white">{conversation.unread_count}</span>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        </button>
                                    ))
                                )}
                            </div>
                        </section>

                        <section className="flex min-h-[600px] min-w-0 flex-col">
                            {!selectedConversation ? (
                                <div className="flex flex-1 flex-col items-center justify-center p-8 text-center">
                                    <MessageCircle className="h-14 w-14 text-slate-300" />
                                    <h2 className="mt-4 text-lg font-black text-slate-900">Select a conversation</h2>
                                    <p className="mt-1 text-xs text-slate-500">Choose an existing conversation or start a new chat.</p>
                                </div>
                            ) : (
                                <>
                                    <div className="flex items-center gap-3 border-b border-slate-200 px-5 py-4">
                                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-100 font-black text-emerald-700">
                                            {selectedConversation.other_user?.name?.charAt(0)?.toUpperCase() || 'T'}
                                        </div>
                                        <div>
                                            <h2 className="text-sm font-black text-slate-900">{selectedConversation.other_user?.name}</h2>
                                            <p className="text-[10px] font-bold text-amber-700">Regarding {selectedConversation.student?.name} · {selectedConversation.student?.class_name || 'No class'}</p>
                                        </div>
                                    </div>

                                    {flash?.success && (
                                        <div className="mx-5 mt-3 rounded-xl bg-emerald-50 px-4 py-2 text-xs font-bold text-emerald-700">{flash.success}</div>
                                    )}

                                    <div className="flex-1 space-y-3 overflow-y-auto bg-slate-50 p-4 sm:p-6">
                                        {selectedConversation.messages?.length === 0 ? (
                                            <p className="py-12 text-center text-xs font-bold text-slate-400">Send the first message to this teacher.</p>
                                        ) : (
                                            selectedConversation.messages?.map((message) => (
                                                <div key={message.id} className={`flex ${message.is_mine ? 'justify-end' : 'justify-start'}`}>
                                                    <div className={`max-w-[85%] rounded-2xl px-4 py-3 shadow-sm sm:max-w-[70%] ${
                                                        message.is_mine
                                                            ? 'rounded-br-md bg-amber-400 text-amber-950'
                                                            : 'rounded-bl-md border border-slate-200 bg-white text-slate-800'
                                                    }`}>
                                                        {message.message && (
                                                            <p className="whitespace-pre-wrap break-words text-sm leading-5">{message.message}</p>
                                                        )}
                                                        {message.attachment_url && (
                                                            <a
                                                                href={message.attachment_url}
                                                                target="_blank"
                                                                rel="noreferrer"
                                                                className="mt-2 flex items-center gap-2 rounded-lg bg-white/60 px-3 py-2 text-xs font-bold underline"
                                                            >
                                                                <FileText className="h-4 w-4" />
                                                                <span className="truncate">{message.attachment_name}</span>
                                                                <Download className="h-3.5 w-3.5" />
                                                            </a>
                                                        )}
                                                        <div className={`mt-1.5 flex items-center justify-end gap-1 text-[9px] font-semibold ${message.is_mine ? 'text-amber-900/70' : 'text-slate-400'}`}>
                                                            <span>{formatTime(message.sent_at)}</span>
                                                            {message.is_mine && <span>{message.is_read ? '✓✓' : '✓'}</span>}
                                                        </div>
                                                    </div>
                                                </div>
                                            ))
                                        )}
                                        <div ref={messagesEndRef} />
                                    </div>

                                    <form onSubmit={sendMessage} className="border-t border-slate-200 bg-white p-4">
                                        {(messageForm.errors.message || messageForm.errors.attachment) && (
                                            <p className="mb-2 text-xs font-bold text-rose-600">{messageForm.errors.message || messageForm.errors.attachment}</p>
                                        )}

                                        {messageForm.data.attachment && (
                                            <div className="mb-2 flex items-center justify-between rounded-xl bg-slate-100 px-3 py-2 text-xs font-bold text-slate-600">
                                                <span className="truncate">{messageForm.data.attachment.name}</span>
                                                <button type="button" onClick={() => {
                                                    messageForm.setData('attachment', null);
                                                    if (attachmentInputRef.current) attachmentInputRef.current.value = '';
                                                }}>
                                                    <X className="h-4 w-4" />
                                                </button>
                                            </div>
                                        )}

                                        <div className="flex items-end gap-2">
                                            <input
                                                ref={attachmentInputRef}
                                                type="file"
                                                accept=".jpg,.jpeg,.png,.pdf,.doc,.docx"
                                                className="hidden"
                                                onChange={(event) => messageForm.setData('attachment', event.target.files?.[0] || null)}
                                            />
                                            <button
                                                type="button"
                                                onClick={() => attachmentInputRef.current?.click()}
                                                className="rounded-xl border border-slate-200 p-3 text-slate-500 hover:bg-slate-50"
                                                title="Attach file"
                                            >
                                                <Paperclip className="h-5 w-5" />
                                            </button>
                                            <textarea
                                                rows="1"
                                                value={messageForm.data.message}
                                                onChange={(event) => messageForm.setData('message', event.target.value)}
                                                placeholder="Type your message..."
                                                className="max-h-32 min-h-[46px] flex-1 resize-y rounded-xl border border-slate-200 px-4 py-3 text-sm focus:border-amber-400 focus:ring-amber-400"
                                            />
                                            <button
                                                type="submit"
                                                disabled={messageForm.processing || (!messageForm.data.message.trim() && !messageForm.data.attachment)}
                                                className="rounded-xl bg-amber-400 p-3 text-amber-950 hover:bg-amber-500 disabled:cursor-not-allowed disabled:opacity-50"
                                            >
                                                <Send className="h-5 w-5" />
                                            </button>
                                        </div>
                                    </form>
                                </>
                            )}
                        </section>
                    </div>
                </div>
            </main>

            {isNewChatOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4">
                    <div className="w-full max-w-md rounded-2xl bg-white shadow-2xl">
                        <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4">
                            <div>
                                <h2 className="font-black text-slate-900">Start New Conversation</h2>
                                <p className="text-[10px] font-semibold text-slate-500">Select your child and their teacher.</p>
                            </div>
                            <button type="button" onClick={() => setIsNewChatOpen(false)} className="rounded-lg p-2 hover:bg-slate-100">
                                <X className="h-5 w-5" />
                            </button>
                        </div>

                        <form onSubmit={submitNewConversation} className="space-y-4 p-5">
                            <div>
                                <label className="mb-1.5 block text-xs font-black text-slate-700">Child</label>
                                <select
                                    value={conversationForm.data.student_id}
                                    onChange={(event) => conversationForm.setData({ student_id: event.target.value, teacher_id: '' })}
                                    className="w-full rounded-xl border border-slate-200 px-3 py-3 text-sm focus:border-amber-400 focus:ring-amber-400"
                                >
                                    <option value="">Select child</option>
                                    {childrenList.map((child) => (
                                        <option key={child.id} value={child.id}>{child.name} ({child.class_name || 'No class'})</option>
                                    ))}
                                </select>
                                {conversationForm.errors.student_id && <p className="mt-1 text-xs font-bold text-rose-600">{conversationForm.errors.student_id}</p>}
                            </div>

                            <div>
                                <label className="mb-1.5 block text-xs font-black text-slate-700">Teacher</label>
                                <select
                                    value={conversationForm.data.teacher_id}
                                    onChange={(event) => conversationForm.setData('teacher_id', event.target.value)}
                                    disabled={!conversationForm.data.student_id}
                                    className="w-full rounded-xl border border-slate-200 px-3 py-3 text-sm focus:border-amber-400 focus:ring-amber-400 disabled:bg-slate-100"
                                >
                                    <option value="">Select teacher</option>
                                    {availableTeachers.map((teacher) => (
                                        <option key={teacher.id} value={teacher.id}>{teacher.name} ({teacher.assigned_class || 'Teacher'})</option>
                                    ))}
                                </select>
                                {conversationForm.errors.teacher_id && <p className="mt-1 text-xs font-bold text-rose-600">{conversationForm.errors.teacher_id}</p>}
                                {conversationForm.data.student_id && availableTeachers.length === 0 && (
                                    <p className="mt-1 text-xs font-bold text-amber-700">No teacher is assigned to this child’s class.</p>
                                )}
                            </div>

                            <div className="flex justify-end gap-2 border-t border-slate-100 pt-4">
                                <button type="button" onClick={() => setIsNewChatOpen(false)} className="rounded-xl border border-slate-200 px-4 py-2.5 text-xs font-black text-slate-600">Cancel</button>
                                <button
                                    type="submit"
                                    disabled={conversationForm.processing || !conversationForm.data.student_id || !conversationForm.data.teacher_id}
                                    className="rounded-xl bg-amber-400 px-4 py-2.5 text-xs font-black text-amber-950 disabled:opacity-50"
                                >
                                    {conversationForm.processing ? 'Opening...' : 'Start Conversation'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </AuthenticatedLayoutParent>
    );
}
