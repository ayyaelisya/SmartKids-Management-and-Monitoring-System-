import React, { useState, useEffect } from 'react';
import { Head, useForm, router } from '@inertiajs/react';
import AuthenticatedLayoutTeacher from '@/Layouts/AuthenticatedLayoutTeacher';
import {
    BookOpen,
    Plus,
    Calendar,
    User,
    Clock,
    Edit3,
    Trash2,
    Image as ImageIcon,
    X,
    Utensils,
    School,
    Home,
    Baby,
    Milk,
    Moon,
    Smile,
    Sparkles,
    FileText,
} from 'lucide-react';

export default function LearningLog({ students = [], logs = [] }) {
    const todayDate = new Date().toISOString().split('T')[0];
    const currentTime = new Date().toTimeString().slice(0, 5);

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [editingLogId, setEditingLogId] = useState(null);
    const [imagePreview, setImagePreview] = useState(null);

    const [selectedStudentId, setSelectedStudentId] = useState(students[0]?.id || '');
    const [selectedDate, setSelectedDate] = useState(todayDate);

    useEffect(() => {
        if (students.length > 0 && !selectedStudentId) {
            setSelectedStudentId(students[0].id);
        }
    }, [students]);

    const selectedStudent = students.find((s) => Number(s.id) === Number(selectedStudentId));

    const filteredLogs = logs.filter((log) => {
        const matchesStudent = Number(log.student_id) === Number(selectedStudentId);
        const matchesDate = selectedDate ? log.date === selectedDate : true;
        return matchesStudent && matchesDate;
    });

    const defaultActivityFields = {
        time: currentTime,
        remarks: '',
        who_sent: '',
        who_picks_up: '',
        temperature: '',
        scars_bruises: '',
        health_symptoms: '',
        taken_bath: 'No',
        new_diaper: 'No',
        fingernails: 'Clean',
        activity: '',
        learning: '',
        reaction: '',
        meal_type: 'Breakfast',
        meal_served: '',
        portion_eaten: 'All',
        sleep_duration: '',
        pee_poo: 'Pee',
        texture: '',
        color: '',
        brush_teeth: 'Yes',
        milk_type: '',
        amount_drank: '',
    };

    const { data, setData, processing, reset, errors, clearErrors } = useForm({
        student_id: selectedStudentId || '',
        category: 'Check In',
        date: todayDate,
        activity_data: { ...defaultActivityFields },
        image: null,
    });

    const editForm = useForm({
        _method: 'put',
        category: 'Check In',
        date: todayDate,
        activity_data: { ...defaultActivityFields },
        image: null,
    });

    useEffect(() => {
        setData('student_id', selectedStudentId);
        setData('date', selectedDate || todayDate);
    }, [selectedStudentId, selectedDate]);

    const formatTo24Hour = (timeStr) => {
        if (!timeStr) return new Date().toTimeString().slice(0, 5);
        if (/^([01]\d|2[0-3]):[0-5]\d$/.test(timeStr)) return timeStr;

        const match = timeStr.match(/(\d+):(\d+)\s*([AP]M)/i);
        if (match) {
            let hours = parseInt(match[1], 10);
            const minutes = match[2];
            const modifier = match[3].toUpperCase();

            if (modifier === 'PM' && hours < 12) hours += 12;
            if (modifier === 'AM' && hours === 12) hours = 0;

            return `${String(hours).padStart(2, '0')}:${minutes}`;
        }

        return timeStr.slice(0, 5);
    };

    const handleCategoryChange = (cat, isEdit = false) => {
        if (isEdit) {
            editForm.setData({
                ...editForm.data,
                category: cat,
                activity_data: { ...defaultActivityFields, time: editForm.data.activity_data?.time || currentTime },
            });
        } else {
            setData({
                ...data,
                category: cat,
                activity_data: { ...defaultActivityFields, time: data.activity_data?.time || currentTime },
            });
        }
    };

    const handleFieldChange = (field, value, isEdit = false) => {
        if (isEdit) {
            editForm.setData('activity_data', {
                ...editForm.data.activity_data,
                [field]: value,
            });
        } else {
            setData('activity_data', {
                ...data.activity_data,
                [field]: value,
            });
        }
    };

    const handleImageChange = (e, isEdit = false) => {
        const file = e.target.files[0];
        if (file) {
            if (isEdit) {
                editForm.setData('image', file);
            } else {
                setData('image', file);
            }
            setImagePreview(URL.createObjectURL(file));
        }
    };

    const handleAddLogSubmit = (e) => {
        e.preventDefault();

        const formData = new FormData();
        formData.append('student_id', data.student_id);
        formData.append('category', data.category);
        formData.append('date', data.date);
        formData.append('activity_data', JSON.stringify(data.activity_data));
        if (data.image) {
            formData.append('image', data.image);
        }

        router.post('/teacher/learning-log', formData, {
            preserveScroll: true,
            onSuccess: () => {
                setIsModalOpen(false);
                setImagePreview(null);
                reset('category', 'activity_data', 'image');
                clearErrors();
            },
        });
    };

    const openEditModal = (log) => {
        setEditingLogId(log.id);
        const logData = log.activity_data || {};

        editForm.setData({
            _method: 'put',
            category: log.category || 'Check In',
            date: log.date || todayDate,
            activity_data: {
                ...defaultActivityFields,
                ...logData,
                time: formatTo24Hour(log.time || currentTime),
            },
            image: null,
        });
        setImagePreview(log.image || null);
        setIsEditModalOpen(true);
    };

    const handleEditLogSubmit = (e) => {
        e.preventDefault();

        const formData = new FormData();
        formData.append('_method', 'put');
        formData.append('category', editForm.data.category);
        formData.append('date', editForm.data.date);
        formData.append('activity_data', JSON.stringify(editForm.data.activity_data));
        if (editForm.data.image) {
            formData.append('image', editForm.data.image);
        }

        router.post(`/teacher/learning-log/${editingLogId}`, formData, {
            preserveScroll: true,
            onSuccess: () => {
                setIsEditModalOpen(false);
                setImagePreview(null);
                editForm.reset();
                editForm.clearErrors();
            },
        });
    };

    const handleDeleteLog = (id) => {
        if (window.confirm('Are you sure you want to delete this log entry?')) {
            router.delete(`/teacher/learning-log/${id}`, {
                preserveScroll: true,
            });
        }
    };

    const categories = [
        'Check In',
        'Check Out',
        'Meal',
        'Diaper',
        'Milk',
        'Sleep',
        'Bath',
        'Circle & Play',
        'Development Activity',
    ];

    const getCategoryIcon = (category) => {
        switch (category) {
            case 'Meal': return <Utensils className="w-4 h-4" />;
            case 'Check In': return <School className="w-4 h-4" />;
            case 'Check Out': return <Home className="w-4 h-4" />;
            case 'Diaper': return <Baby className="w-4 h-4" />;
            case 'Milk': return <Milk className="w-4 h-4" />;
            case 'Sleep': return <Moon className="w-4 h-4" />;
            case 'Bath': return <Smile className="w-4 h-4" />;
            case 'Circle & Play': return <Sparkles className="w-4 h-4" />;
            case 'Development Activity': return <BookOpen className="w-4 h-4" />;
            default: return <FileText className="w-4 h-4" />;
        }
    };

    const renderDynamicFields = (formData, setFieldFn) => {
        const category = formData.category;
        const actData = formData.activity_data || {};

        return (
            <div className="space-y-4">
                <div>
                    <label className="block text-xs font-bold uppercase text-[#68736B] tracking-wider mb-1">Time</label>
                    <input
                        type="time"
                        value={actData.time || ''}
                        onChange={(e) => setFieldFn('time', e.target.value)}
                        required
                        className="w-full px-4 py-2.5 bg-[#F8F7F2] border border-[#E4E6E2] rounded-xl text-xs font-semibold text-[#26332A] focus:ring-[#527A5D] focus:border-[#527A5D]"
                    />
                </div>

                {category === 'Check In' && (
                    <>
                        <div>
                            <label className="block text-xs font-bold uppercase text-[#68736B] tracking-wider mb-1">Who Sent Student?</label>
                            <input
                                type="text"
                                placeholder="e.g. Mother / Father"
                                value={actData.who_sent || ''}
                                onChange={(e) => setFieldFn('who_sent', e.target.value)}
                                className="w-full px-4 py-2.5 bg-[#F8F7F2] border border-[#E4E6E2] rounded-xl text-xs font-semibold text-[#26332A] focus:ring-[#527A5D] focus:border-[#527A5D]"
                            />
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                            <div>
                                <label className="block text-xs font-bold uppercase text-[#68736B] tracking-wider mb-1">Temperature (°C)</label>
                                <input
                                    type="text"
                                    placeholder="36.5"
                                    value={actData.temperature || ''}
                                    onChange={(e) => setFieldFn('temperature', e.target.value)}
                                    className="w-full px-4 py-2.5 bg-[#F8F7F2] border border-[#E4E6E2] rounded-xl text-xs font-semibold text-[#26332A] focus:ring-[#527A5D] focus:border-[#527A5D]"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-bold uppercase text-[#68736B] tracking-wider mb-1">Scars & Bruises?</label>
                                <input
                                    type="text"
                                    placeholder="None / Left leg mark"
                                    value={actData.scars_bruises || ''}
                                    onChange={(e) => setFieldFn('scars_bruises', e.target.value)}
                                    className="w-full px-4 py-2.5 bg-[#F8F7F2] border border-[#E4E6E2] rounded-xl text-xs font-semibold text-[#26332A] focus:ring-[#527A5D] focus:border-[#527A5D]"
                                />
                            </div>
                        </div>
                        <div>
                            <label className="block text-xs font-bold uppercase text-[#68736B] tracking-wider mb-1">Health Symptoms</label>
                            <input
                                type="text"
                                placeholder="e.g. Coughing, active"
                                value={actData.health_symptoms || ''}
                                onChange={(e) => setFieldFn('health_symptoms', e.target.value)}
                                className="w-full px-4 py-2.5 bg-[#F8F7F2] border border-[#E4E6E2] rounded-xl text-xs font-semibold text-[#26332A] focus:ring-[#527A5D] focus:border-[#527A5D]"
                            />
                        </div>
                        <div className="grid grid-cols-3 gap-2">
                            <div>
                                <label className="block text-[10px] font-bold uppercase text-[#68736B] mb-1">Taken Bath?</label>
                                <select
                                    value={actData.taken_bath || 'No'}
                                    onChange={(e) => setFieldFn('taken_bath', e.target.value)}
                                    className="w-full px-2.5 py-2 bg-[#F8F7F2] border border-[#E4E6E2] rounded-xl text-xs font-bold text-[#26332A]"
                                >
                                    <option value="Yes">Yes</option>
                                    <option value="No">No</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-[10px] font-bold uppercase text-[#68736B] mb-1">New Diaper?</label>
                                <select
                                    value={actData.new_diaper || 'No'}
                                    onChange={(e) => setFieldFn('new_diaper', e.target.value)}
                                    className="w-full px-2.5 py-2 bg-[#F8F7F2] border border-[#E4E6E2] rounded-xl text-xs font-bold text-[#26332A]"
                                >
                                    <option value="Yes">Yes</option>
                                    <option value="No">No</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-[10px] font-bold uppercase text-[#68736B] mb-1">Fingernail</label>
                                <select
                                    value={actData.fingernails || 'Clean'}
                                    onChange={(e) => setFieldFn('fingernails', e.target.value)}
                                    className="w-full px-2.5 py-2 bg-[#F8F7F2] border border-[#E4E6E2] rounded-xl text-xs font-bold text-[#26332A]"
                                >
                                    <option value="Clean">Clean</option>
                                    <option value="Long">Long</option>
                                    <option value="Dirty">Dirty</option>
                                </select>
                            </div>
                        </div>
                    </>
                )}

                {category === 'Check Out' && (
                    <>
                        <div>
                            <label className="block text-xs font-bold uppercase text-[#68736B] tracking-wider mb-1">Who Picks Up Student?</label>
                            <input
                                type="text"
                                placeholder="e.g. Mother / Father"
                                value={actData.who_picks_up || ''}
                                onChange={(e) => setFieldFn('who_picks_up', e.target.value)}
                                className="w-full px-4 py-2.5 bg-[#F8F7F2] border border-[#E4E6E2] rounded-xl text-xs font-semibold text-[#26332A]"
                            />
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                            <div>
                                <label className="block text-xs font-bold uppercase text-[#68736B] tracking-wider mb-1">Temperature (°C)</label>
                                <input
                                    type="text"
                                    placeholder="36.5"
                                    value={actData.temperature || ''}
                                    onChange={(e) => setFieldFn('temperature', e.target.value)}
                                    className="w-full px-4 py-2.5 bg-[#F8F7F2] border border-[#E4E6E2] rounded-xl text-xs font-semibold text-[#26332A]"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-bold uppercase text-[#68736B] tracking-wider mb-1">Scars & Bruises?</label>
                                <input
                                    type="text"
                                    placeholder="None"
                                    value={actData.scars_bruises || ''}
                                    onChange={(e) => setFieldFn('scars_bruises', e.target.value)}
                                    className="w-full px-4 py-2.5 bg-[#F8F7F2] border border-[#E4E6E2] rounded-xl text-xs font-semibold text-[#26332A]"
                                />
                            </div>
                        </div>
                    </>
                )}

                {category === 'Meal' && (
                    <>
                        <div className="grid grid-cols-2 gap-3">
                            <div>
                                <label className="block text-xs font-bold uppercase text-[#68736B] tracking-wider mb-1">Meal Type</label>
                                <select
                                    value={actData.meal_type || 'Breakfast'}
                                    onChange={(e) => setFieldFn('meal_type', e.target.value)}
                                    className="w-full px-3 py-2.5 bg-[#F8F7F2] border border-[#E4E6E2] rounded-xl text-xs font-bold text-[#26332A]"
                                >
                                    <option value="Breakfast">Breakfast</option>
                                    <option value="Morning Snack">Morning Snack</option>
                                    <option value="Lunch">Lunch</option>
                                    <option value="Tea Time">Tea Time</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-xs font-bold uppercase text-[#68736B] tracking-wider mb-1">Portion Eaten</label>
                                <select
                                    value={actData.portion_eaten || 'All'}
                                    onChange={(e) => setFieldFn('portion_eaten', e.target.value)}
                                    className="w-full px-3 py-2.5 bg-[#F8F7F2] border border-[#E4E6E2] rounded-xl text-xs font-bold text-[#26332A]"
                                >
                                    <option value="All">All (100%)</option>
                                    <option value="Half">Half (50%)</option>
                                    <option value="Little">Little (&lt;25%)</option>
                                    <option value="Refused">Refused</option>
                                </select>
                            </div>
                        </div>
                        <div>
                            <label className="block text-xs font-bold uppercase text-[#68736B] tracking-wider mb-1">Meal Served</label>
                            <input
                                type="text"
                                placeholder="e.g. Nasi Goreng & Eggs"
                                value={actData.meal_served || ''}
                                onChange={(e) => setFieldFn('meal_served', e.target.value)}
                                className="w-full px-4 py-2.5 bg-[#F8F7F2] border border-[#E4E6E2] rounded-xl text-xs font-semibold text-[#26332A]"
                            />
                        </div>
                    </>
                )}

                {category === 'Diaper' && (
                    <>
                        <div>
                            <label className="block text-xs font-bold uppercase text-[#68736B] tracking-wider mb-1">Pee / Poo</label>
                            <select
                                value={actData.pee_poo || 'Pee'}
                                onChange={(e) => setFieldFn('pee_poo', e.target.value)}
                                className="w-full px-3 py-2.5 bg-[#F8F7F2] border border-[#E4E6E2] rounded-xl text-xs font-bold text-[#26332A]"
                            >
                                <option value="Pee">Pee Only</option>
                                <option value="Poo">Poo Only</option>
                                <option value="Both">Both (Pee & Poo)</option>
                                <option value="Dry">Dry</option>
                            </select>
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                            <div>
                                <label className="block text-xs font-bold uppercase text-[#68736B] tracking-wider mb-1">Texture</label>
                                <input
                                    type="text"
                                    placeholder="Soft / Hard"
                                    value={actData.texture || ''}
                                    onChange={(e) => setFieldFn('texture', e.target.value)}
                                    className="w-full px-4 py-2.5 bg-[#F8F7F2] border border-[#E4E6E2] rounded-xl text-xs font-semibold text-[#26332A]"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-bold uppercase text-[#68736B] tracking-wider mb-1">Color</label>
                                <input
                                    type="text"
                                    placeholder="Yellowish / Brown"
                                    value={actData.color || ''}
                                    onChange={(e) => setFieldFn('color', e.target.value)}
                                    className="w-full px-4 py-2.5 bg-[#F8F7F2] border border-[#E4E6E2] rounded-xl text-xs font-semibold text-[#26332A]"
                                />
                            </div>
                        </div>
                    </>
                )}

                {category === 'Milk' && (
                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <label className="block text-xs font-bold uppercase text-[#68736B] tracking-wider mb-1">Milk Type</label>
                            <input
                                type="text"
                                placeholder="Formula / Breastmilk"
                                value={actData.milk_type || ''}
                                onChange={(e) => setFieldFn('milk_type', e.target.value)}
                                className="w-full px-4 py-2.5 bg-[#F8F7F2] border border-[#E4E6E2] rounded-xl text-xs font-semibold text-[#26332A]"
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-bold uppercase text-[#68736B] tracking-wider mb-1">Amount Drank</label>
                            <input
                                type="text"
                                placeholder="180 ml / 6 oz"
                                value={actData.amount_drank || ''}
                                onChange={(e) => setFieldFn('amount_drank', e.target.value)}
                                className="w-full px-4 py-2.5 bg-[#F8F7F2] border border-[#E4E6E2] rounded-xl text-xs font-semibold text-[#26332A]"
                            />
                        </div>
                    </div>
                )}

                {category === 'Sleep' && (
                    <div>
                        <label className="block text-xs font-bold uppercase text-[#68736B] tracking-wider mb-1">Sleep Duration</label>
                        <input
                            type="text"
                            placeholder="e.g. 1 hour 30 mins"
                            value={actData.sleep_duration || ''}
                            onChange={(e) => setFieldFn('sleep_duration', e.target.value)}
                            className="w-full px-4 py-2.5 bg-[#F8F7F2] border border-[#E4E6E2] rounded-xl text-xs font-semibold text-[#26332A]"
                        />
                    </div>
                )}

                {category === 'Bath' && (
                    <div>
                        <label className="block text-xs font-bold uppercase text-[#68736B] tracking-wider mb-1">Brush Teeth?</label>
                        <select
                            value={actData.brush_teeth || 'Yes'}
                            onChange={(e) => setFieldFn('brush_teeth', e.target.value)}
                            className="w-full px-3 py-2.5 bg-[#F8F7F2] border border-[#E4E6E2] rounded-xl text-xs font-bold text-[#26332A]"
                        >
                            <option value="Yes">Yes</option>
                            <option value="No">No</option>
                        </select>
                    </div>
                )}

                {category === 'Circle & Play' && (
                    <div>
                        <label className="block text-xs font-bold uppercase text-[#68736B] tracking-wider mb-1">Activity</label>
                        <input
                            type="text"
                            placeholder="e.g. Morning Exercise"
                            value={actData.activity || ''}
                            onChange={(e) => setFieldFn('activity', e.target.value)}
                            className="w-full px-4 py-2.5 bg-[#F8F7F2] border border-[#E4E6E2] rounded-xl text-xs font-semibold text-[#26332A]"
                        />
                    </div>
                )}

                {category === 'Development Activity' && (
                    <>
                        <div>
                            <label className="block text-xs font-bold uppercase text-[#68736B] tracking-wider mb-1">The Learning</label>
                            <input
                                type="text"
                                placeholder="e.g. Motor Skills & Painting"
                                value={actData.learning || ''}
                                onChange={(e) => setFieldFn('learning', e.target.value)}
                                className="w-full px-4 py-2.5 bg-[#F8F7F2] border border-[#E4E6E2] rounded-xl text-xs font-semibold text-[#26332A]"
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-bold uppercase text-[#68736B] tracking-wider mb-1">Reaction</label>
                            <input
                                type="text"
                                placeholder="e.g. Focused and happy"
                                value={actData.reaction || ''}
                                onChange={(e) => setFieldFn('reaction', e.target.value)}
                                className="w-full px-4 py-2.5 bg-[#F8F7F2] border border-[#E4E6E2] rounded-xl text-xs font-semibold text-[#26332A]"
                            />
                        </div>
                    </>
                )}

                <div>
                    <label className="block text-xs font-bold uppercase text-[#68736B] tracking-wider mb-1">Remarks (Optional)</label>
                    <textarea
                        rows="2"
                        placeholder="Additional notes..."
                        value={actData.remarks || ''}
                        onChange={(e) => setFieldFn('remarks', e.target.value)}
                        className="w-full px-4 py-2.5 bg-[#F8F7F2] border border-[#E4E6E2] rounded-xl text-xs font-semibold text-[#26332A] resize-none"
                    />
                </div>
            </div>
        );
    };

    return (
        <AuthenticatedLayoutTeacher activeNavId="learning-log">
            <Head title="Daily Learning Logs - Teacher Portal" />

            <div className="space-y-6 pb-12">
                {/* Header Banner */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-[#E4E6E2] shadow-xs">
                    <div>
                        <div className="flex items-center gap-2">
                            <h1 className="text-2xl font-extrabold text-[#26332A] tracking-tight">Daily Learning Log</h1>
                            <span className="px-2.5 py-0.5 rounded-full bg-[#7FAF8A]/15 text-[#527A5D] font-black text-xs">Activity Tracker</span>
                        </div>
                        <p className="text-xs text-[#68736B] font-medium mt-1">Record and monitor daily classroom milestones and student updates.</p>
                    </div>

                    <button
                        onClick={() => {
                            clearErrors();
                            setIsModalOpen(true);
                        }}
                        disabled={!selectedStudentId}
                        className="px-4 py-2.5 bg-[#527A5D] hover:bg-[#3D5C46] text-white font-extrabold text-xs uppercase rounded-xl transition-all shadow-md flex items-center justify-center gap-2 disabled:opacity-50"
                    >
                        <Plus className="w-4 h-4" />
                        Add Log Entry
                    </button>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                    {/* LEFT COLUMN: FILTERS */}
                    <div className="lg:col-span-4 space-y-6">
                        <div className="bg-white p-6 rounded-2xl border border-[#E4E6E2] shadow-xs space-y-5">
                            <div className="flex items-center gap-2 border-b border-[#E4E6E2] pb-3">
                                <BookOpen className="w-4 h-4 text-[#527A5D]" />
                                <h2 className="text-sm font-extrabold text-[#26332A] uppercase tracking-wide">Select Student</h2>
                            </div>

                            <div className="space-y-4">
                                <div>
                                    <label className="block text-[11px] font-black uppercase text-[#68736B] tracking-wider mb-1.5">Student</label>
                                    <div className="relative">
                                        <User className="w-4 h-4 absolute left-3.5 top-3 text-[#68736B]" />
                                        <select
                                            value={selectedStudentId}
                                            onChange={(e) => setSelectedStudentId(Number(e.target.value))}
                                            className="w-full pl-10 pr-4 py-2.5 bg-[#F8F7F2] border border-[#E4E6E2] rounded-xl text-xs font-bold text-[#26332A] outline-none"
                                        >
                                            {students.map((s) => (
                                                <option key={s.id} value={s.id}>
                                                    {s.name} ({s.class})
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-[11px] font-black uppercase text-[#68736B] tracking-wider mb-1.5">Date</label>
                                    <div className="relative">
                                        <Calendar className="w-4 h-4 absolute left-3.5 top-3 text-[#68736B]" />
                                        <input
                                            type="date"
                                            value={selectedDate}
                                            onChange={(e) => setSelectedDate(e.target.value)}
                                            className="w-full pl-10 pr-4 py-2.5 bg-[#F8F7F2] border border-[#E4E6E2] rounded-xl text-xs font-bold text-[#26332A] outline-none"
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* RIGHT COLUMN: TIMELINE FEED */}
                    <div className="lg:col-span-8">
                        <div className="bg-white p-6 rounded-2xl border border-[#E4E6E2] shadow-xs space-y-6">
                            <div className="flex items-center justify-between border-b border-[#E4E6E2] pb-4">
                                <div>
                                    <h3 className="text-base font-black text-[#26332A]">Activity Timeline</h3>
                                    <p className="text-xs text-[#68736B]">
                                        Logs for <span className="font-bold text-[#527A5D]">{selectedStudent?.name}</span> on <span className="font-bold">{selectedDate}</span>
                                    </p>
                                </div>
                                <span className="text-xs font-bold text-[#527A5D] bg-[#527A5D]/10 px-3 py-1 rounded-full border border-[#527A5D]/20">
                                    {filteredLogs.length} Total Entries
                                </span>
                            </div>

                            {filteredLogs.length === 0 ? (
                                <div className="text-center py-12 space-y-2">
                                    <FileText className="w-10 h-10 text-[#68736B]/40 mx-auto" />
                                    <p className="text-xs font-bold text-[#68736B] italic">No activity logs found for this student on this date.</p>
                                </div>
                            ) : (
                                <div className="relative pl-6 space-y-6 before:absolute before:left-[11px] before:top-2 before:bottom-2 before:w-[2px] before:bg-[#E4E6E2]">
                                    {(() => {
                                        const groupedLogs = filteredLogs.reduce((acc, log) => {
                                            const cat = log.category || 'General';
                                            if (!acc[cat]) acc[cat] = [];
                                            acc[cat].push(log);
                                            return acc;
                                        }, {});

                                        return Object.keys(groupedLogs).map((category) => {
                                            const logsInCategory = groupedLogs[category];

                                            return (
                                                <div key={category} className="relative bg-[#F8F7F2] p-5 rounded-2xl border border-[#E4E6E2] shadow-xs space-y-4">
                                                    <div className="absolute -left-[35px] top-5 w-5 h-5 rounded-full bg-[#527A5D] border-4 border-white shadow-xs" />

                                                    {/* Category Header */}
                                                    <div className="flex items-center justify-between border-b border-[#E4E6E2] pb-2">
                                                        <div className="flex items-center gap-2">
                                                            <span className="px-3 py-1 bg-[#527A5D] text-white text-xs font-extrabold rounded-lg uppercase tracking-wider flex items-center gap-1.5">
                                                                {getCategoryIcon(category)}
                                                                <span>{category}</span>
                                                            </span>
                                                            <span className="text-xs font-bold text-[#68736B]">
                                                                ({logsInCategory.length} {logsInCategory.length > 1 ? 'records' : 'record'})
                                                            </span>
                                                        </div>
                                                    </div>

                                                    {/* Category Item List */}
                                                    <div className="space-y-4 divide-y divide-[#E4E6E2]">
                                                        {logsInCategory.map((log, index) => {
                                                            const details = log.activity_data || {};
                                                            return (
                                                                <div key={log.id} className={`${index > 0 ? 'pt-4' : ''} space-y-2`}>
                                                                    <div className="flex items-center justify-between">
                                                                        <span className="text-xs font-bold text-[#527A5D] bg-white px-2.5 py-1 rounded-lg border border-[#E4E6E2] flex items-center gap-1">
                                                                            <Clock className="w-3.5 h-3.5" />
                                                                            <span>{log.time}</span>
                                                                        </span>

                                                                        <div className="flex items-center gap-1">
                                                                            <button
                                                                                type="button"
                                                                                onClick={() => openEditModal(log)}
                                                                                className="p-1.5 rounded-lg text-[#68736B] hover:bg-white hover:text-[#527A5D] transition-all text-xs font-bold flex items-center gap-1"
                                                                                title="Edit Entry"
                                                                            >
                                                                                <Edit3 className="w-3.5 h-3.5" />
                                                                                <span>Edit</span>
                                                                            </button>
                                                                            <button
                                                                                type="button"
                                                                                onClick={() => handleDeleteLog(log.id)}
                                                                                className="p-1.5 rounded-lg text-[#68736B] hover:bg-[#D97B73]/10 hover:text-[#D97B73] transition-all text-xs font-bold flex items-center gap-1"
                                                                                title="Delete Entry"
                                                                            >
                                                                                <Trash2 className="w-3.5 h-3.5" />
                                                                                <span>Delete</span>
                                                                            </button>
                                                                        </div>
                                                                    </div>

                                                                    <div className="text-xs text-[#26332A] space-y-1 font-medium leading-relaxed pt-1">
                                                                        {category === 'Meal' && (
                                                                            <ul className="list-disc list-inside space-y-1 text-[#68736B]">
                                                                                <li><b>Meal Type:</b> {details.meal_type || '-'}</li>
                                                                                <li><b>Meal Served:</b> {details.meal_served || '-'}</li>
                                                                                <li><b>Portion Eaten:</b> {details.portion_eaten || '-'}</li>
                                                                            </ul>
                                                                        )}

                                                                        {category === 'Check In' && (
                                                                            <ul className="list-disc list-inside space-y-1 text-[#68736B]">
                                                                                <li><b>Who Sent:</b> {details.who_sent || '-'}</li>
                                                                                <li><b>Temperature:</b> {details.temperature ? `${details.temperature}°C` : '-'}</li>
                                                                                <li><b>Scars & Bruises:</b> {details.scars_bruises || 'None'}</li>
                                                                                <li><b>Health Symptoms:</b> {details.health_symptoms || 'Active / Healthy'}</li>
                                                                            </ul>
                                                                        )}

                                                                        {category === 'Check Out' && (
                                                                            <ul className="list-disc list-inside space-y-1 text-[#68736B]">
                                                                                <li><b>Who Picks Up:</b> {details.who_picks_up || '-'}</li>
                                                                                <li><b>Temperature:</b> {details.temperature ? `${details.temperature}°C` : '-'}</li>
                                                                            </ul>
                                                                        )}

                                                                        {category === 'Diaper' && (
                                                                            <ul className="list-disc list-inside space-y-1 text-[#68736B]">
                                                                                <li><b>Status:</b> {details.pee_poo || '-'}</li>
                                                                                <li><b>Texture:</b> {details.texture || '-'}</li>
                                                                                <li><b>Color:</b> {details.color || '-'}</li>
                                                                            </ul>
                                                                        )}

                                                                        {category === 'Milk' && (
                                                                            <ul className="list-disc list-inside space-y-1 text-[#68736B]">
                                                                                <li><b>Milk Type:</b> {details.milk_type || '-'}</li>
                                                                                <li><b>Amount Drank:</b> {details.amount_drank || '-'}</li>
                                                                            </ul>
                                                                        )}

                                                                        {category === 'Sleep' && (
                                                                            <ul className="list-disc list-inside space-y-1 text-[#68736B]">
                                                                                <li><b>Sleep Duration:</b> {details.sleep_duration || '-'}</li>
                                                                            </ul>
                                                                        )}

                                                                        {!['Meal', 'Check In', 'Check Out', 'Diaper', 'Milk', 'Sleep'].includes(category) && (
                                                                            <ul className="list-disc list-inside space-y-1 text-[#68736B]">
                                                                                {details.activity && <li><b>Activity:</b> {details.activity}</li>}
                                                                                {details.learning && <li><b>Learning:</b> {details.learning}</li>}
                                                                                {details.reaction && <li><b>Reaction:</b> {details.reaction}</li>}
                                                                            </ul>
                                                                        )}

                                                                        {details.remarks && (
                                                                            <div className="mt-2 pt-1 italic text-[#68736B] bg-white p-2.5 rounded-lg border border-[#E4E6E2]">
                                                                                📝 <b>Remarks:</b> {details.remarks}
                                                                            </div>
                                                                        )}
                                                                    </div>

                                                                    {log.image && (
                                                                        <div className="mt-3 rounded-xl overflow-hidden border border-[#E4E6E2] max-h-52 max-w-sm">
                                                                            <img src={log.image} alt={category} className="w-full h-40 object-cover" />
                                                                        </div>
                                                                    )}
                                                                </div>
                                                            );
                                                        })}
                                                    </div>
                                                </div>
                                            );
                                        });
                                    })()}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* MODAL: ADD LOG */}
            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#26332A]/60 backdrop-blur-xs p-4">
                    <div className="w-full max-w-lg bg-white rounded-2xl p-6 shadow-xl space-y-4 max-h-[90vh] overflow-y-auto border border-[#E4E6E2]">
                        <div className="flex items-center justify-between border-b border-[#E4E6E2] pb-3">
                            <div>
                                <h3 className="text-base font-extrabold text-[#26332A]">Add Learning Log</h3>
                                <p className="text-xs font-semibold text-[#527A5D]">For {selectedStudent?.name}</p>
                            </div>
                            <button onClick={() => setIsModalOpen(false)} className="p-1 rounded-lg text-[#68736B] hover:bg-[#F8F7F2]">
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <form onSubmit={handleAddLogSubmit} className="space-y-4">
                            <div>
                                <label className="block text-xs font-bold uppercase text-[#68736B] tracking-wider mb-1">Date</label>
                                <input
                                    type="date"
                                    value={data.date}
                                    onChange={(e) => setData('date', e.target.value)}
                                    required
                                    className="w-full px-4 py-2.5 bg-[#F8F7F2] border border-[#E4E6E2] rounded-xl text-xs font-semibold text-[#26332A]"
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-bold uppercase text-[#68736B] tracking-wider mb-1">Activity Type</label>
                                <select
                                    value={data.category}
                                    onChange={(e) => handleCategoryChange(e.target.value, false)}
                                    className="w-full px-4 py-2.5 bg-[#F8F7F2] border border-[#E4E6E2] rounded-xl text-xs font-bold text-[#26332A]"
                                >
                                    {categories.map((cat) => (
                                        <option key={cat} value={cat}>{cat}</option>
                                    ))}
                                </select>
                            </div>

                            {renderDynamicFields(data, (field, value) => handleFieldChange(field, value, false))}

                            <div>
                                <label className="block text-xs font-bold uppercase text-[#68736B] tracking-wider mb-1">Photo (Optional)</label>
                                <input
                                    type="file"
                                    accept="image/*"
                                    onChange={(e) => handleImageChange(e, false)}
                                    className="w-full text-xs text-[#68736B] file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:bg-[#527A5D]/10 file:text-[#527A5D] font-bold"
                                />
                                {imagePreview && (
                                    <div className="mt-2 rounded-xl overflow-hidden border border-[#E4E6E2] max-h-32">
                                        <img src={imagePreview} alt="Preview" className="w-full h-32 object-cover" />
                                    </div>
                                )}
                            </div>

                            <div className="pt-2 flex gap-3">
                                <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 py-2.5 bg-[#F8F7F2] text-[#68736B] font-bold rounded-xl text-xs border border-[#E4E6E2]">
                                    Cancel
                                </button>
                                <button type="submit" disabled={processing} className="flex-1 py-2.5 bg-[#527A5D] text-white font-extrabold rounded-xl text-xs shadow-md uppercase">
                                    {processing ? 'Saving...' : 'Save Log'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* MODAL: EDIT LOG */}
            {isEditModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#26332A]/60 backdrop-blur-xs p-4">
                    <div className="w-full max-w-lg bg-white rounded-2xl p-6 shadow-xl space-y-4 max-h-[90vh] overflow-y-auto border border-[#E4E6E2]">
                        <div className="flex items-center justify-between border-b border-[#E4E6E2] pb-3">
                            <h3 className="text-base font-extrabold text-[#26332A]">Edit Learning Log</h3>
                            <button onClick={() => setIsEditModalOpen(false)} className="p-1 rounded-lg text-[#68736B] hover:bg-[#F8F7F2]">
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <form onSubmit={handleEditLogSubmit} className="space-y-4">
                            <div>
                                <label className="block text-xs font-bold uppercase text-[#68736B] tracking-wider mb-1">Date</label>
                                <input
                                    type="date"
                                    value={editForm.data.date}
                                    onChange={(e) => editForm.setData('date', e.target.value)}
                                    required
                                    className="w-full px-4 py-2.5 bg-[#F8F7F2] border border-[#E4E6E2] rounded-xl text-xs font-semibold text-[#26332A]"
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-bold uppercase text-[#68736B] tracking-wider mb-1">Activity Type</label>
                                <select
                                    value={editForm.data.category}
                                    onChange={(e) => handleCategoryChange(e.target.value, true)}
                                    className="w-full px-4 py-2.5 bg-[#F8F7F2] border border-[#E4E6E2] rounded-xl text-xs font-bold text-[#26332A]"
                                >
                                    {categories.map((cat) => (
                                        <option key={cat} value={cat}>{cat}</option>
                                    ))}
                                </select>
                            </div>

                            {renderDynamicFields(editForm.data, (field, value) => handleFieldChange(field, value, true))}

                            <div>
                                <label className="block text-xs font-bold uppercase text-[#68736B] tracking-wider mb-1">Change Photo (Optional)</label>
                                <input
                                    type="file"
                                    accept="image/*"
                                    onChange={(e) => handleImageChange(e, true)}
                                    className="w-full text-xs text-[#68736B] file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:bg-[#527A5D]/10 file:text-[#527A5D] font-bold"
                                />
                                {imagePreview && (
                                    <div className="mt-2 rounded-xl overflow-hidden border border-[#E4E6E2] max-h-32">
                                        <img src={imagePreview} alt="Preview" className="w-full h-32 object-cover" />
                                    </div>
                                )}
                            </div>

                            <div className="pt-2 flex gap-3">
                                <button type="button" onClick={() => setIsEditModalOpen(false)} className="flex-1 py-2.5 bg-[#F8F7F2] text-[#68736B] font-bold rounded-xl text-xs border border-[#E4E6E2]">
                                    Cancel
                                </button>
                                <button type="submit" disabled={editForm.processing} className="flex-1 py-2.5 bg-[#527A5D] text-white font-extrabold rounded-xl text-xs shadow-md uppercase">
                                    {editForm.processing ? 'Updating...' : 'Update Log'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </AuthenticatedLayoutTeacher>
    );
}
