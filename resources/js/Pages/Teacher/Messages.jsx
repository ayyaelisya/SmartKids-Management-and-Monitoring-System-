import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Head, router, useForm, usePage } from '@inertiajs/react';
import AuthenticatedLayoutTeacher from '@/Layouts/AuthenticatedLayoutTeacher';
import { Download, FileText, MessageCircle, Paperclip, Plus, Search, Send, X } from 'lucide-react';

export default function Messages({
    conversations = [],
    selectedConversation = null,
    parentStudentList = [],
}) {
    const { flash } = usePage().props;
    const [search, setSearch] = useState('');
    const [isNewChatOpen, setIsNewChatOpen] = useState(false);
    const [selectedPair, setSelectedPair] = useState('');
    const endRef = useRef(null);
    const fileRef = useRef(null);
    const form = useForm({ message: '', attachment: null });
    const conversationForm = useForm({ parent_id: '', student_id: '' });

    const filtered = useMemo(() => {
        const keyword = search.trim().toLowerCase();
        if (!keyword) return conversations;
        return conversations.filter((item) =>
            item.other_user?.name?.toLowerCase().includes(keyword) ||
            item.other_user?.email?.toLowerCase().includes(keyword) ||
            item.student?.name?.toLowerCase().includes(keyword) ||
            item.latest_message?.toLowerCase().includes(keyword)
        );
    }, [conversations, search]);

    useEffect(() => {
        endRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [selectedConversation?.id, selectedConversation?.messages?.length]);

    // Refresh every five seconds while a chat is open.
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

    const openConversation = (id) => {
        router.get('/teacher/messages', { conversation_id: id }, {
            preserveState: true,
            preserveScroll: true,
            replace: true,
        });
    };

    const sendMessage = (event) => {
        event.preventDefault();
        if (!selectedConversation) return;
        form.post(`/teacher/messages/${selectedConversation.id}/send`, {
            forceFormData: true,
            preserveScroll: true,
            onSuccess: () => {
                form.reset();
                if (fileRef.current) fileRef.current.value = '';
            },
        });
    };

    const selectParentStudent = (value) => {
        setSelectedPair(value);
        const [parentId = '', studentId = ''] = value.split(':');
        conversationForm.setData({
            parent_id: parentId,
            student_id: studentId,
        });
    };

    const startConversation = (event) => {
        event.preventDefault();
        conversationForm.post('/teacher/messages/conversations', {
            preserveScroll: true,
            onSuccess: () => {
                setIsNewChatOpen(false);
                setSelectedPair('');
                conversationForm.reset();
            },
        });
    };

    const time = (value) => value ? new Intl.DateTimeFormat('en-MY', { hour: '2-digit', minute: '2-digit' }).format(new Date(value)) : '';
    const date = (value) => value ? new Intl.DateTimeFormat('en-MY', { day: '2-digit', month: 'short' }).format(new Date(value)) : '';

    return (
        <AuthenticatedLayoutTeacher activeNavId="messages">
            <Head title="Messages - Teacher Portal" />

            <div className="mb-6">
                <p className="text-xs font-black uppercase tracking-wider text-[#D97706]">Parent–Teacher Communication</p>
                <h1 className="mt-1 text-2xl font-black text-slate-900">Messages</h1>
            </div>

            <div className="grid min-h-[72vh] w-full overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm lg:grid-cols-[340px_minmax(0,1fr)]">
                <section className="border-b border-slate-200 lg:border-b-0 lg:border-r">
                    <div className="border-b border-slate-200 p-4">
                        <div className="flex items-center justify-between gap-3">
                            <h2 className="font-black text-slate-900">Parent Conversations</h2>
                            <button type="button" onClick={() => setIsNewChatOpen(true)} className="flex shrink-0 items-center gap-1.5 rounded-xl bg-[#527A5D] px-3 py-2 text-[10px] font-black text-white hover:bg-[#42664c]">
                                <Plus className="h-3.5 w-3.5" /> New Chat
                            </button>
                        </div>
                        <div className="relative mt-3">
                            <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                            <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search parent or student..." className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2 pl-9 pr-3 text-xs focus:border-[#527A5D] focus:ring-[#527A5D]" />
                        </div>
                    </div>

                    <div className="max-h-[65vh] overflow-y-auto">
                        {filtered.length === 0 ? (
                            <div className="px-5 py-12 text-center"><MessageCircle className="mx-auto h-9 w-9 text-slate-300" /><p className="mt-3 text-xs font-bold text-slate-500">No parent conversations yet.</p></div>
                        ) : filtered.map((conversation) => (
                            <button key={conversation.id} type="button" onClick={() => openConversation(conversation.id)} className={`w-full border-b border-slate-100 p-4 text-left transition hover:bg-emerald-50 ${selectedConversation?.id === conversation.id ? 'bg-emerald-50' : 'bg-white'}`}>
                                <div className="flex items-start gap-3">
                                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-amber-100 text-sm font-black text-amber-700">{conversation.other_user?.name?.charAt(0)?.toUpperCase() || 'P'}</div>
                                    <div className="min-w-0 flex-1">
                                        <div className="flex items-center justify-between gap-2"><p className="truncate text-xs font-black text-slate-900">{conversation.other_user?.name}</p><span className="shrink-0 text-[9px] font-semibold text-slate-400">{date(conversation.last_message_at)}</span></div>
                                        <p className="mt-0.5 truncate text-[10px] font-bold text-[#527A5D]">Student: {conversation.student?.name}</p>
                                        <p className="truncate text-[10px] text-slate-500">{conversation.other_user?.email}</p>
                                        <div className="mt-1 flex items-center justify-between gap-2"><p className="truncate text-[10px] text-slate-500">{conversation.latest_message}</p>{conversation.unread_count > 0 && <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-rose-500 px-1 text-[9px] font-black text-white">{conversation.unread_count}</span>}</div>
                                    </div>
                                </div>
                            </button>
                        ))}
                    </div>
                </section>

                <section className="flex min-h-[620px] min-w-0 flex-col">
                    {!selectedConversation ? (
                        <div className="flex flex-1 flex-col items-center justify-center p-8 text-center"><MessageCircle className="h-14 w-14 text-slate-300" /><h2 className="mt-4 text-lg font-black text-slate-900">Select a conversation</h2><p className="mt-1 text-xs text-slate-500">Choose a parent conversation to read and reply.</p></div>
                    ) : <>
                        <div className="flex items-center gap-3 border-b border-slate-200 px-5 py-4">
                            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-100 font-black text-amber-700">{selectedConversation.other_user?.name?.charAt(0)?.toUpperCase() || 'P'}</div>
                            <div><h2 className="text-sm font-black text-slate-900">{selectedConversation.other_user?.name}</h2><p className="text-[10px] text-slate-500">{selectedConversation.other_user?.email}</p><p className="text-[10px] font-bold text-[#527A5D]">Regarding {selectedConversation.student?.name} · {selectedConversation.student?.class_name || 'No class'}</p></div>
                        </div>

                        {flash?.success && <div className="mx-5 mt-3 rounded-xl bg-emerald-50 px-4 py-2 text-xs font-bold text-emerald-700">{flash.success}</div>}

                        <div className="flex-1 space-y-3 overflow-y-auto bg-slate-50 p-4 sm:p-6">
                            {selectedConversation.messages?.length === 0 ? <p className="py-12 text-center text-xs font-bold text-slate-400">No messages in this conversation.</p> : selectedConversation.messages?.map((message) => (
                                <div key={message.id} className={`flex ${message.is_mine ? 'justify-end' : 'justify-start'}`}>
                                    <div className={`max-w-[85%] rounded-2xl px-4 py-3 shadow-sm sm:max-w-[70%] ${message.is_mine ? 'rounded-br-md bg-[#527A5D] text-white' : 'rounded-bl-md border border-slate-200 bg-white text-slate-800'}`}>
                                        {message.message && <p className="whitespace-pre-wrap break-words text-sm leading-5">{message.message}</p>}
                                        {message.attachment_url && <a href={message.attachment_url} target="_blank" rel="noreferrer" className="mt-2 flex items-center gap-2 rounded-lg bg-white/20 px-3 py-2 text-xs font-bold underline"><FileText className="h-4 w-4" /><span className="truncate">{message.attachment_name}</span><Download className="h-3.5 w-3.5" /></a>}
                                        <div className={`mt-1.5 flex items-center justify-end gap-1 text-[9px] font-semibold ${message.is_mine ? 'text-white/70' : 'text-slate-400'}`}><span>{time(message.sent_at)}</span>{message.is_mine && <span>{message.is_read ? '✓✓' : '✓'}</span>}</div>
                                    </div>
                                </div>
                            ))}
                            <div ref={endRef} />
                        </div>

                        <form onSubmit={sendMessage} className="border-t border-slate-200 bg-white p-4">
                            {(form.errors.message || form.errors.attachment) && <p className="mb-2 text-xs font-bold text-rose-600">{form.errors.message || form.errors.attachment}</p>}
                            {form.data.attachment && <div className="mb-2 flex items-center justify-between rounded-xl bg-slate-100 px-3 py-2 text-xs font-bold text-slate-600"><span className="truncate">{form.data.attachment.name}</span><button type="button" onClick={() => { form.setData('attachment', null); if (fileRef.current) fileRef.current.value = ''; }}><X className="h-4 w-4" /></button></div>}
                            <div className="flex items-end gap-2">
                                <input ref={fileRef} type="file" accept=".jpg,.jpeg,.png,.pdf,.doc,.docx" className="hidden" onChange={(e) => form.setData('attachment', e.target.files?.[0] || null)} />
                                <button type="button" onClick={() => fileRef.current?.click()} className="rounded-xl border border-slate-200 p-3 text-slate-500 hover:bg-slate-50" title="Attach file"><Paperclip className="h-5 w-5" /></button>
                                <textarea rows="1" value={form.data.message} onChange={(e) => form.setData('message', e.target.value)} placeholder="Type your reply..." className="max-h-32 min-h-[46px] flex-1 resize-y rounded-xl border border-slate-200 px-4 py-3 text-sm focus:border-[#527A5D] focus:ring-[#527A5D]" />
                                <button type="submit" disabled={form.processing || (!form.data.message.trim() && !form.data.attachment)} className="rounded-xl bg-[#527A5D] p-3 text-white hover:bg-[#42664c] disabled:cursor-not-allowed disabled:opacity-50"><Send className="h-5 w-5" /></button>
                            </div>
                        </form>
                    </>}
                </section>
            </div>

            {isNewChatOpen && (
                <div className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-900/60 p-4">
                    <div className="w-full max-w-md rounded-2xl bg-white shadow-2xl">
                        <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4">
                            <div>
                                <h2 className="font-black text-slate-900">Start New Conversation</h2>
                                <p className="text-[10px] font-semibold text-slate-500">Select a student using the linked parent email.</p>
                            </div>
                            <button type="button" onClick={() => setIsNewChatOpen(false)} className="rounded-lg p-2 hover:bg-slate-100"><X className="h-5 w-5" /></button>
                        </div>

                        <form onSubmit={startConversation} className="space-y-4 p-5">
                            <div>
                                <label className="mb-1.5 block text-xs font-black text-slate-700">Student and Parent Email</label>
                                <select value={selectedPair} onChange={(e) => selectParentStudent(e.target.value)} className="w-full rounded-xl border border-slate-200 px-3 py-3 text-sm focus:border-[#527A5D] focus:ring-[#527A5D]">
                                    <option value="">Select student and parent email</option>
                                    {parentStudentList.map((item) => (
                                        <option key={`${item.parent_id}-${item.student_id}`} value={`${item.parent_id}:${item.student_id}`}>
                                            {item.student_name} — {item.parent_email}
                                        </option>
                                    ))}
                                </select>
                                {(conversationForm.errors.parent_id || conversationForm.errors.student_id) && <p className="mt-1 text-xs font-bold text-rose-600">{conversationForm.errors.parent_id || conversationForm.errors.student_id}</p>}
                                {parentStudentList.length === 0 && <p className="mt-2 text-xs font-bold text-amber-700">No parent with a linked student was found.</p>}
                            </div>

                            <div className="flex justify-end gap-2 border-t border-slate-100 pt-4">
                                <button type="button" onClick={() => setIsNewChatOpen(false)} className="rounded-xl border border-slate-200 px-4 py-2.5 text-xs font-black text-slate-600">Cancel</button>
                                <button type="submit" disabled={conversationForm.processing || !conversationForm.data.parent_id || !conversationForm.data.student_id} className="rounded-xl bg-[#527A5D] px-4 py-2.5 text-xs font-black text-white disabled:opacity-50">
                                    {conversationForm.processing ? 'Opening...' : 'Start Conversation'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </AuthenticatedLayoutTeacher>
    );
}
