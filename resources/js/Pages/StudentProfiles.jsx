import React, { useMemo, useState } from 'react';
import { Head, useForm } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import {
    Users,
    UserCheck,
    UserPlus,
    UserX,
    Search,
    Eye,
    Edit3,
    Camera,
    X,
} from 'lucide-react';

const emptyForm = {
    profile_image: null,
    full_name: '',
    ic_number: '',
    date_of_birth: '',
    birth_place: '',
    gender: 'Boy',
    favourite_food: '',
    birth_order: '',
    total_siblings: '',
    class_name: '2 Years',
    package_id: '',
    guardian_relationship: 'Father',
    guardian_name: '',
    guardian_phone: '',
    father_name: '',
    father_ic_number: '',
    father_phone: '',
    father_occupation: '',
    father_race: '',
    father_nationality: 'Malaysian',
    mother_name: '',
    mother_ic_number: '',
    mother_phone: '',
    mother_occupation: '',
    mother_race: '',
    mother_nationality: 'Malaysian',
    home_address: '',
    email: '',
    emergency_contact_name: '',
    emergency_contact_phone: '',
    emergency_contact_relationship: '',
    referral_source: '',
    allergies: '',
    medical_notes: '',
    student_status: 'Active',
};

const inputClass =
    'w-full rounded-lg border border-[#E2DFEE] bg-white p-2 text-[11px] text-[#2D3142] focus:border-[#6C63A8] focus:outline-none';

const showValue = (value) =>
    value === null || value === undefined || value === ''
        ? 'N/A'
        : String(value);

const isActiveStudent = (student) =>
    Number(student.is_active) === 1;

function SectionTitle({ children }) {
    return (
        <h4 className="mb-3 border-b border-[#E2DFEE] pb-1 text-[10px] font-extrabold uppercase tracking-wider text-[#6C63A8]">
            {children}
        </h4>
    );
}

function FormField({
    label,
    name,
    value,
    onChange,
    error,
    required = false,
    type = 'text',
    options,
    textarea = false,
    className = '',
    min,
}) {
    return (
        <div className={className}>
            <label
                htmlFor={name}
                className="mb-1 block font-semibold text-[#2D3142]"
            >
                {label}
                {required && (
                    <span className="ml-1 font-bold text-red-600">*</span>
                )}
            </label>

            {options ? (
                <select
                    id={name}
                    name={name}
                    value={value ?? ''}
                    onChange={(event) => onChange(event.target.value)}
                    required={required}
                    className={inputClass}
                >
                    {options.map((option) => (
                        <option key={option.value} value={option.value}>
                            {option.label}
                        </option>
                    ))}
                </select>
            ) : textarea ? (
                <textarea
                    id={name}
                    name={name}
                    value={value ?? ''}
                    onChange={(event) => onChange(event.target.value)}
                    required={required}
                    rows={3}
                    className={inputClass}
                />
            ) : (
                <input
                    id={name}
                    name={name}
                    type={type}
                    min={min}
                    value={value ?? ''}
                    onChange={(event) => onChange(event.target.value)}
                    required={required}
                    className={inputClass}
                />
            )}

            {error && (
                <p className="mt-1 text-[10px] text-red-600">{error}</p>
            )}
        </div>
    );
}

function ProfileField({ label, value }) {
    return (
        <div className="rounded-xl bg-[#F7F6FC] p-3">
            <p className="text-[10px] font-semibold text-[#6B7280]">
                {label}
            </p>
            <p className="mt-1 break-words font-bold text-[#2D3142]">
                {showValue(value)}
            </p>
        </div>
    );
}

export default function StudentProfiles({
    students = [],
    packages = [],
    filters = {},
}) {
    const [isAddEditModalOpen, setIsAddEditModalOpen] = useState(false);
    const [isViewProfileOpen, setIsViewProfileOpen] = useState(false);
    const [editingStudent, setEditingStudent] = useState(null);
    const [viewingStudent, setViewingStudent] = useState(null);
    const [activeTab, setActiveTab] = useState('personal');
    const [imagePreview, setImagePreview] = useState(null);

    const [search, setSearch] = useState(filters.search || '');
    const [selectedClassFilter, setSelectedClassFilter] = useState(
        filters.class_filter || ''
    );

    // Paparan awal: Active. Kad lain menukar kategori senarai.
    const [selectedCard, setSelectedCard] = useState('active');
    const [exitFilter, setExitFilter] = useState('all');

    const {
        data,
        setData,
        post,
        processing,
        errors,
        clearErrors,
        reset,
        transform,
    } = useForm({ ...emptyForm });

    const thirtyDaysAgo = useMemo(() => {
        const date = new Date();
        date.setDate(date.getDate() - 30);
        return date;
    }, []);

    const stats = useMemo(
        () => ({
            total: students.length,
            active: students.filter(isActiveStudent).length,
            inactive: students.filter(
                (student) => !isActiveStudent(student)
            ).length,
            newStudents: students.filter(
                (student) =>
                    isActiveStudent(student) &&
                    student.created_at &&
                    new Date(student.created_at) >= thirtyDaysAgo
            ).length,
        }),
        [students, thirtyDaysAgo]
    );

    const filteredStudents = useMemo(() => {
        const keyword = search.trim().toLowerCase();

        const result = students
            .filter((student) => {
                if (selectedCard === 'active') {
                    return isActiveStudent(student);
                }

                if (selectedCard === 'inactive') {
                    if (isActiveStudent(student)) return false;

                    return (
                        exitFilter === 'all' ||
                        student.exit_reason === exitFilter
                    );
                }

                if (selectedCard === 'new') {
                    return (
                        isActiveStudent(student) &&
                        student.created_at &&
                        new Date(student.created_at) >= thirtyDaysAgo
                    );
                }

                return true;
            })
            .filter((student) => {
                const matchesSearch =
                    String(student.full_name || '')
                        .toLowerCase()
                        .includes(keyword) ||
                    String(student.student_id || student.id || '')
                        .toLowerCase()
                        .includes(keyword) ||
                    String(student.ic_number || '')
                        .toLowerCase()
                        .includes(keyword) ||
                    String(student.mykid_number || '')
                        .toLowerCase()
                        .includes(keyword);

                const matchesClass =
                    !selectedClassFilter ||
                    student.class_name === selectedClassFilter;

                return matchesSearch && matchesClass;
            })
            .sort(
                (a, b) =>
                    new Date(b.created_at || 0) -
                    new Date(a.created_at || 0)
            );

        // Senarai utama hanya 10 terkini.
        // Search tetap boleh cari semua pelajar dalam kategori Active.
        return selectedCard === 'active' && !keyword
            ? result.slice(0, 10)
            : result;
    }, [
        students,
        search,
        selectedClassFilter,
        selectedCard,
        exitFilter,
        thirtyDaysAgo,
    ]);

    const selectedAgeGroup =
        data.class_name === 'Tots Club'
            ? '10-23 months'
            : '2-4 years';

    const availablePackages = packages.filter(
        (item) => item.age_group === selectedAgeGroup
    );

    const selectedPackage = packages.find(
        (item) => String(item.package_id) === String(data.package_id)
    );

    const viewedPackage = viewingStudent
        ? viewingStudent.package ||
          packages.find(
              (item) =>
                  String(item.package_id) ===
                  String(viewingStudent.package_id)
          )
        : null;

    const field = (name, value) => setData(name, value);

    const renderField = (
        label,
        name,
        {
            required = false,
            type = 'text',
            options,
            textarea = false,
            className = '',
            min,
            onChange,
        } = {}
    ) => (
        <FormField
            key={name}
            label={label}
            name={name}
            value={data[name]}
            onChange={onChange || ((value) => field(name, value))}
            error={errors[name]}
            required={required}
            type={type}
            options={options}
            textarea={textarea}
            className={className}
            min={min}
        />
    );

    const renderProfileFields = (student, fields) =>
        fields.map(([label, key]) => (
            <ProfileField
                key={key}
                label={label}
                value={student[key]}
            />
        ));

    const closeAddEditModal = () => {
        setIsAddEditModalOpen(false);

        if (imagePreview?.startsWith('blob:')) {
            URL.revokeObjectURL(imagePreview);
        }

        setImagePreview(null);
    };

    const openCreateModal = () => {
        clearErrors();
        setEditingStudent(null);

        if (imagePreview?.startsWith('blob:')) {
            URL.revokeObjectURL(imagePreview);
        }

        setImagePreview(null);
        setData({ ...emptyForm });
        setIsAddEditModalOpen(true);
    };

    const openEditModal = (student) => {
        clearErrors();
        setEditingStudent(student);
        setImagePreview(student.profile_image_url || null);

        const populatedForm = Object.fromEntries(
            Object.keys(emptyForm).map((name) => [
                name,
                name === 'profile_image'
                    ? null
                    : student[name] ?? emptyForm[name],
            ])
        );

        populatedForm.package_id = student.package_id
            ? String(student.package_id)
            : '';

        populatedForm.student_status = isActiveStudent(student)
            ? 'Active'
            : student.exit_reason || 'Withdrawn';

        setData(populatedForm);
        setIsAddEditModalOpen(true);
    };

    const openViewModal = (student) => {
        setViewingStudent(student);
        setActiveTab('personal');
        setIsViewProfileOpen(true);
    };

    const handleImageChange = (event) => {
        const file = event.target.files?.[0];

        if (!file) return;

        if (imagePreview?.startsWith('blob:')) {
            URL.revokeObjectURL(imagePreview);
        }

        field('profile_image', file);
        setImagePreview(URL.createObjectURL(file));
    };

    const handleSubmit = (event) => {
        event.preventDefault();

        if (editingStudent) {
            const studentId =
                editingStudent.student_id || editingStudent.id;

            // Laravel menerima PUT dengan _method apabila ada fail gambar.
            transform((formData) => ({
                ...formData,
                _method: 'put',
            }));

            post(`/students/${studentId}`, {
                forceFormData: true,
                preserveScroll: true,
                onSuccess: () => {
                    closeAddEditModal();
                    setEditingStudent(null);
                    reset();
                },
                onFinish: () =>
                    transform((formData) => formData),
            });

            return;
        }

        transform((formData) => formData);

        post('/students', {
            forceFormData: true,
            preserveScroll: true,
            onSuccess: () => {
                closeAddEditModal();
                setEditingStudent(null);
                reset();
                setData({ ...emptyForm });
            },
        });
    };

    const fatherRequired =
        data.guardian_relationship === 'Father';

    const motherRequired =
        data.guardian_relationship === 'Mother';

    const guardianRequired =
        data.guardian_relationship === 'Guardian';

    const summaryCards = [
        {
            id: 'total',
            label: 'Total Students',
            value: stats.total,
            icon: Users,
            color: 'text-[#6C63A8]',
        },
        {
            id: 'active',
            label: 'Active',
            value: stats.active,
            icon: UserCheck,
            color: 'text-green-600',
        },
        {
            id: 'new',
            label: 'New (30 Days)',
            value: stats.newStudents,
            icon: UserPlus,
            color: 'text-orange-600',
        },
        {
            id: 'inactive',
            label: 'Inactive',
            value: stats.inactive,
            icon: UserX,
            color: 'text-red-500',
        },
    ];

    return (
        <AuthenticatedLayout activeNavId="students">
            <Head title="SKMMS - Student Management" />

            <div className="min-h-screen space-y-6 bg-[#EAE7F6] p-4 sm:p-6 lg:p-8">
                {/* HEADER */}
                <div className="flex flex-col justify-between gap-4 rounded-2xl border border-[#E2DFEE] bg-white p-5 shadow-sm sm:flex-row sm:items-center">
                    <div>
                        <h1 className="text-xl font-black text-[#2D3142]">
                            Student Management
                        </h1>
                        <p className="mt-1 text-[11px] text-[#6B7280]">
                            Manage student profiles and registration.
                        </p>
                    </div>

                    <button
                        type="button"
                        onClick={openCreateModal}
                        className="flex items-center justify-center gap-2 rounded-xl bg-[#6C63A8] px-4 py-2.5 text-[11px] font-extrabold text-white hover:bg-[#514A82]"
                    >
                        <UserPlus className="h-4 w-4" />
                        Enrol New Student
                    </button>
                </div>

                {/* CLICKABLE SUMMARY CARDS */}
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                    {summaryCards.map((card) => {
                        const Icon = card.icon;

                        return (
                            <button
                                key={card.id}
                                type="button"
                                onClick={() => {
                                    setSelectedCard(card.id);
                                    setExitFilter('all');
                                }}
                                className={`flex items-center gap-3 rounded-2xl border bg-white p-4 text-left shadow-sm transition hover:border-[#6C63A8] hover:shadow-md ${
                                    selectedCard === card.id
                                        ? 'border-[#6C63A8] ring-2 ring-[#6C63A8]/20'
                                        : 'border-[#E2DFEE]'
                                }`}
                            >
                                <div
                                    className={`rounded-xl bg-[#F7F6FC] p-2.5 ${card.color}`}
                                >
                                    <Icon className="h-5 w-5" />
                                </div>

                                <div>
                                    <p className="text-[10px] font-bold uppercase text-[#6B7280]">
                                        {card.label}
                                    </p>
                                    <p className="text-xl font-black text-[#2D3142]">
                                        {card.value}
                                    </p>
                                </div>
                            </button>
                        );
                    })}
                </div>

                {/* STUDENT LIST */}
                <div className="overflow-hidden rounded-2xl border border-[#E2DFEE] bg-white shadow-sm">
                    <div className="grid grid-cols-1 gap-3 border-b border-[#E2DFEE] p-4 sm:grid-cols-3">
                        <div className="relative sm:col-span-2">
                            <Search className="absolute left-3 top-2.5 h-4 w-4 text-[#6B7280]" />
                            <input
                                type="text"
                                placeholder="Search name, student ID or IC / MyKid..."
                                value={search}
                                onChange={(event) =>
                                    setSearch(event.target.value)
                                }
                                className={`${inputClass} pl-9`}
                            />
                        </div>

                        <select
                            value={selectedClassFilter}
                            onChange={(event) =>
                                setSelectedClassFilter(event.target.value)
                            }
                            className={inputClass}
                        >
                            <option value="">All Classes</option>
                            <option value="Tots Club">Tots Club</option>
                            <option value="2 Years">2 Years</option>
                            <option value="3 Years">3 Years</option>
                            <option value="4 Years">4 Years</option>
                        </select>
                    </div>

                    <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#E2DFEE] px-4 py-3">
                        <p className="text-[11px] font-bold text-[#2D3142]">
                            {selectedCard === 'active' &&
                                'Latest Active Students'}
                            {selectedCard === 'total' &&
                                'All Students'}
                            {selectedCard === 'new' &&
                                'New Active Students (30 Days)'}
                            {selectedCard === 'inactive' &&
                                'Inactive Students'}
                        </p>

                        {selectedCard === 'inactive' && (
                            <select
                                value={exitFilter}
                                onChange={(event) =>
                                    setExitFilter(event.target.value)
                                }
                                className="rounded-lg border border-[#E2DFEE] bg-white px-3 py-2 text-[11px]"
                            >
                                <option value="all">
                                    All Inactive
                                </option>
                                <option value="Withdrawn">
                                    Withdrawn
                                </option>
                                <option value="Graduated">
                                    Graduated
                                </option>
                            </select>
                        )}
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-[11px]">
                            <thead className="border-b border-[#E2DFEE] bg-[#F7F6FC] font-bold uppercase text-[#6B7280]">
                                <tr>
                                    <th className="px-5 py-3">Student</th>
                                    <th className="px-5 py-3">
                                        IC / MyKid
                                    </th>
                                    <th className="px-5 py-3">Class</th>
                                    <th className="px-5 py-3">
                                        Status
                                    </th>
                                    <th className="px-5 py-3">
                                        Primary Guardian
                                    </th>
                                    <th className="px-5 py-3 text-right">
                                        Actions
                                    </th>
                                </tr>
                            </thead>

                            <tbody className="divide-y divide-[#E2DFEE] text-[#2D3142]">
                                {filteredStudents.map((student) => (
                                    <tr
                                        key={
                                            student.student_id ||
                                            student.id
                                        }
                                        className="hover:bg-[#F7F6FC]"
                                    >
                                        <td className="px-5 py-3">
                                            <div className="flex items-center gap-2.5">
                                                {student.profile_image_url ? (
                                                    <img
                                                        src={
                                                            student.profile_image_url
                                                        }
                                                        alt=""
                                                        className="h-9 w-9 rounded-xl object-cover"
                                                    />
                                                ) : (
                                                    <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#6C63A8]/10 font-black text-[#6C63A8]">
                                                        {student.full_name?.charAt(
                                                            0
                                                        ) || 'S'}
                                                    </div>
                                                )}

                                                <div>
                                                    <p className="font-bold">
                                                        {student.full_name}
                                                    </p>
                                                    <p className="text-[10px] text-[#6B7280]">
                                                        {showValue(
                                                            student.selected_service
                                                        )}
                                                    </p>
                                                </div>
                                            </div>
                                        </td>

                                        <td className="px-5 py-3">
                                            {showValue(
                                                student.ic_number ||
                                                    student.mykid_number
                                            )}
                                        </td>

                                        <td className="px-5 py-3 text-[#6C63A8]">
                                            {showValue(
                                                student.class_name
                                            )}
                                        </td>

                                        <td className="px-5 py-3">
                                            {isActiveStudent(student) ? (
                                                <span className="rounded-full bg-green-50 px-2 py-1 font-bold text-green-700">
                                                    Active
                                                </span>
                                            ) : (
                                                <span className="rounded-full bg-red-50 px-2 py-1 font-bold text-red-700">
                                                    {showValue(
                                                        student.exit_reason
                                                    )}
                                                </span>
                                            )}
                                        </td>

                                        <td className="px-5 py-3">
                                            <p className="font-semibold">
                                                {showValue(
                                                    student.guardian_name
                                                )}
                                            </p>
                                            <p className="text-[10px] text-[#6B7280]">
                                                {showValue(
                                                    student.guardian_phone
                                                )}
                                            </p>
                                        </td>

                                        <td className="px-5 py-3 text-right">
                                            <div className="flex justify-end gap-1">
                                                <button
                                                    type="button"
                                                    title="View student"
                                                    onClick={() =>
                                                        openViewModal(student)
                                                    }
                                                    className="rounded-lg bg-[#F7F6FC] p-2 text-[#6C63A8]"
                                                >
                                                    <Eye className="h-4 w-4" />
                                                </button>

                                                <button
                                                    type="button"
                                                    title="Edit student"
                                                    onClick={() =>
                                                        openEditModal(student)
                                                    }
                                                    className="rounded-lg bg-[#F7F6FC] p-2 text-[#2D3142]"
                                                >
                                                    <Edit3 className="h-4 w-4" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}

                                {filteredStudents.length === 0 && (
                                    <tr>
                                        <td
                                            colSpan={6}
                                            className="px-5 py-8 text-center text-[#6B7280]"
                                        >
                                            No students found in this
                                            category.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            {/* VIEW PROFILE MODAL */}
            {isViewProfileOpen && viewingStudent && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4">
                    <div className="flex max-h-[90vh] w-full max-w-4xl flex-col overflow-hidden rounded-2xl bg-white shadow-xl">
                        <div className="flex shrink-0 items-center justify-between bg-[#6C63A8] p-5 text-white">
                            <div className="flex items-center gap-3">
                                {viewingStudent.profile_image_url ? (
                                    <img
                                        src={
                                            viewingStudent.profile_image_url
                                        }
                                        alt=""
                                        className="h-12 w-12 rounded-xl object-cover"
                                    />
                                ) : (
                                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-white/20 font-black">
                                        {viewingStudent.full_name?.charAt(
                                            0
                                        ) || 'S'}
                                    </div>
                                )}

                                <div>
                                    <h2 className="text-base font-extrabold">
                                        {viewingStudent.full_name}
                                    </h2>
                                    <p className="text-[11px] text-white/80">
                                        Student ID:{' '}
                                        {showValue(
                                            viewingStudent.student_id ||
                                                viewingStudent.id
                                        )}{' '}
                                        ·{' '}
                                        {isActiveStudent(viewingStudent)
                                            ? 'Active'
                                            : showValue(
                                                  viewingStudent.exit_reason
                                              )}
                                    </p>
                                </div>
                            </div>

                            <button
                                type="button"
                                onClick={() =>
                                    setIsViewProfileOpen(false)
                                }
                                aria-label="Close profile"
                            >
                                <X className="h-5 w-5" />
                            </button>
                        </div>

                        <div className="flex shrink-0 gap-2 overflow-x-auto border-b border-[#E2DFEE] bg-[#F7F6FC] px-4">
                            {[
                                {
                                    id: 'personal',
                                    label: 'Student Information',
                                },
                                {
                                    id: 'parents',
                                    label: 'Parents & Guardians',
                                },
                                {
                                    id: 'contact',
                                    label: 'Address & Emergency',
                                },
                                {
                                    id: 'medical',
                                    label: 'Health & Registration',
                                },
                            ].map((tab) => (
                                <button
                                    key={tab.id}
                                    type="button"
                                    onClick={() =>
                                        setActiveTab(tab.id)
                                    }
                                    className={`whitespace-nowrap border-b-2 px-3 py-3 text-[11px] font-bold ${
                                        activeTab === tab.id
                                            ? 'border-[#6C63A8] text-[#6C63A8]'
                                            : 'border-transparent text-[#6B7280]'
                                    }`}
                                >
                                    {tab.label}
                                </button>
                            ))}
                        </div>

                        <div className="flex-1 overflow-y-auto p-5 text-[11px]">
                            {activeTab === 'personal' && (
                                <div className="space-y-5">
                                    <section>
                                        <SectionTitle>
                                            Student Personal Information
                                        </SectionTitle>
                                        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                                            {renderProfileFields(
                                                viewingStudent,
                                                [
                                                    [
                                                        'Full Name',
                                                        'full_name',
                                                    ],
                                                    [
                                                        'IC / MyKid No.',
                                                        'ic_number',
                                                    ],
                                                    [
                                                        'Date of Birth',
                                                        'date_of_birth',
                                                    ],
                                                    [
                                                        'Place of Birth',
                                                        'birth_place',
                                                    ],
                                                    ['Gender', 'gender'],
                                                    [
                                                        'Favourite Food',
                                                        'favourite_food',
                                                    ],
                                                    [
                                                        'Child Order',
                                                        'birth_order',
                                                    ],
                                                    [
                                                        'Total Siblings',
                                                        'total_siblings',
                                                    ],
                                                ]
                                            )}

                                            {viewingStudent.mykid_number && (
                                                <ProfileField
                                                    label="Previous Specific MyKid No."
                                                    value={
                                                        viewingStudent.mykid_number
                                                    }
                                                />
                                            )}
                                        </div>
                                    </section>

                                    <section>
                                        <SectionTitle>
                                            Class & Package
                                        </SectionTitle>
                                        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                                            <ProfileField
                                                label="Class Name"
                                                value={
                                                    viewingStudent.class_name
                                                }
                                            />
                                            <ProfileField
                                                label="Age Category"
                                                value={
                                                    viewingStudent.age_category ||
                                                    viewedPackage?.age_group
                                                }
                                            />
                                            <ProfileField
                                                label="Package"
                                                value={
                                                    viewedPackage?.package_name ||
                                                    viewingStudent.selected_service
                                                }
                                            />
                                            <ProfileField
                                                label="Monthly Fee"
                                                value={
                                                    viewedPackage?.monthly_fee !=
                                                    null
                                                        ? `RM ${Number(
                                                              viewedPackage.monthly_fee
                                                          ).toFixed(2)}`
                                                        : null
                                                }
                                            />
                                            <ProfileField
                                                label="Student Status"
                                                value={
                                                    isActiveStudent(
                                                        viewingStudent
                                                    )
                                                        ? 'Active'
                                                        : viewingStudent.exit_reason
                                                }
                                            />
                                        </div>
                                    </section>
                                </div>
                            )}

                            {activeTab === 'parents' && (
                                <div className="space-y-5">
                                    <section>
                                        <SectionTitle>
                                            Primary Guardian
                                        </SectionTitle>
                                        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                                            {renderProfileFields(
                                                viewingStudent,
                                                [
                                                    [
                                                        'Relationship',
                                                        'guardian_relationship',
                                                    ],
                                                    [
                                                        'Name',
                                                        'guardian_name',
                                                    ],
                                                    [
                                                        'Phone',
                                                        'guardian_phone',
                                                    ],
                                                ]
                                            )}
                                        </div>
                                    </section>

                                    <section>
                                        <SectionTitle>
                                            Father’s Information
                                        </SectionTitle>
                                        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                                            {renderProfileFields(
                                                viewingStudent,
                                                [
                                                    [
                                                        'Name',
                                                        'father_name',
                                                    ],
                                                    [
                                                        'IC',
                                                        'father_ic_number',
                                                    ],
                                                    [
                                                        'Phone',
                                                        'father_phone',
                                                    ],
                                                    [
                                                        'Occupation',
                                                        'father_occupation',
                                                    ],
                                                    [
                                                        'Race',
                                                        'father_race',
                                                    ],
                                                    [
                                                        'Nationality',
                                                        'father_nationality',
                                                    ],
                                                ]
                                            )}
                                        </div>
                                    </section>

                                    <section>
                                        <SectionTitle>
                                            Mother’s Information
                                        </SectionTitle>
                                        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                                            {renderProfileFields(
                                                viewingStudent,
                                                [
                                                    [
                                                        'Name',
                                                        'mother_name',
                                                    ],
                                                    [
                                                        'IC',
                                                        'mother_ic_number',
                                                    ],
                                                    [
                                                        'Phone',
                                                        'mother_phone',
                                                    ],
                                                    [
                                                        'Occupation',
                                                        'mother_occupation',
                                                    ],
                                                    [
                                                        'Race',
                                                        'mother_race',
                                                    ],
                                                    [
                                                        'Nationality',
                                                        'mother_nationality',
                                                    ],
                                                ]
                                            )}
                                        </div>
                                    </section>
                                </div>
                            )}

                            {activeTab === 'contact' && (
                                <div className="space-y-5">
                                    <section>
                                        <SectionTitle>
                                            Home & Contact
                                        </SectionTitle>
                                        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                                            {renderProfileFields(
                                                viewingStudent,
                                                [
                                                    [
                                                        'Home Address',
                                                        'home_address',
                                                    ],
                                                    ['Email', 'email'],
                                                ]
                                            )}
                                        </div>
                                    </section>

                                    <section>
                                        <SectionTitle>
                                            Emergency Contact
                                        </SectionTitle>
                                        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                                            {renderProfileFields(
                                                viewingStudent,
                                                [
                                                    [
                                                        'Contact Name',
                                                        'emergency_contact_name',
                                                    ],
                                                    [
                                                        'Phone',
                                                        'emergency_contact_phone',
                                                    ],
                                                    [
                                                        'Relationship',
                                                        'emergency_contact_relationship',
                                                    ],
                                                ]
                                            )}
                                        </div>
                                    </section>
                                </div>
                            )}

                            {activeTab === 'medical' && (
                                <div className="space-y-5">
                                    <section>
                                        <SectionTitle>
                                            Health Information
                                        </SectionTitle>
                                        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                                            {renderProfileFields(
                                                viewingStudent,
                                                [
                                                    [
                                                        'Allergies',
                                                        'allergies',
                                                    ],
                                                    [
                                                        'Medical Notes',
                                                        'medical_notes',
                                                    ],
                                                ]
                                            )}
                                        </div>
                                    </section>

                                    <section>
                                        <SectionTitle>
                                            Registration Information
                                        </SectionTitle>
                                        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                                            {renderProfileFields(
                                                viewingStudent,
                                                [
                                                    [
                                                        'Selected Service',
                                                        'selected_service',
                                                    ],
                                                    [
                                                        'Referral Source',
                                                        'referral_source',
                                                    ],
                                                ]
                                            )}

                                            <ProfileField
                                                label="Record Created"
                                                value={
                                                    viewingStudent.created_at
                                                        ? new Date(
                                                              viewingStudent.created_at
                                                          ).toLocaleString(
                                                              'en-MY'
                                                          )
                                                        : null
                                                }
                                            />

                                            <ProfileField
                                                label="Last Updated"
                                                value={
                                                    viewingStudent.updated_at
                                                        ? new Date(
                                                              viewingStudent.updated_at
                                                          ).toLocaleString(
                                                              'en-MY'
                                                          )
                                                        : null
                                                }
                                            />
                                        </div>
                                    </section>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* ADD / EDIT MODAL */}
            {isAddEditModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4">
                    <div className="flex max-h-[90vh] w-full max-w-4xl flex-col overflow-hidden rounded-2xl bg-white shadow-xl">
                        <div className="flex shrink-0 items-center justify-between bg-[#6C63A8] p-4 text-white">
                            <h3 className="text-sm font-extrabold">
                                {editingStudent
                                    ? 'Update Student Profile'
                                    : 'New Student Registration Form'}
                            </h3>

                            <button
                                type="button"
                                onClick={closeAddEditModal}
                                aria-label="Close form"
                            >
                                <X className="h-5 w-5" />
                            </button>
                        </div>

                        <form
                            onSubmit={handleSubmit}
                            className="flex-1 space-y-6 overflow-y-auto p-5 text-[11px]"
                        >
                            <p className="text-[#6B7280]">
                                Fields marked{' '}
                                <span className="font-bold text-red-600">
                                    *
                                </span>{' '}
                                are required.
                            </p>

                            {/* PROFILE PHOTO */}
                            <div className="flex flex-col items-center rounded-xl border border-dashed border-[#E2DFEE] bg-[#F7F6FC] p-4">
                                <div className="mb-2 flex h-16 w-16 items-center justify-center overflow-hidden rounded-xl bg-slate-200">
                                    {imagePreview ? (
                                        <img
                                            src={imagePreview}
                                            alt="Student preview"
                                            className="h-full w-full object-cover"
                                        />
                                    ) : (
                                        <Camera className="h-6 w-6 text-slate-400" />
                                    )}
                                </div>

                                <label className="cursor-pointer rounded-lg bg-[#6C63A8] px-3 py-1.5 font-bold text-white">
                                    Upload Profile Picture
                                    <input
                                        type="file"
                                        accept="image/jpeg,image/png,image/webp"
                                        onChange={handleImageChange}
                                        className="hidden"
                                    />
                                </label>

                                {errors.profile_image && (
                                    <p className="mt-1 text-red-600">
                                        {errors.profile_image}
                                    </p>
                                )}
                            </div>

                            {/* STUDENT INFORMATION */}
                            <section>
                                <SectionTitle>
                                    1. Student Personal Information
                                </SectionTitle>

                                <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                                    {renderField(
                                        'Full Name',
                                        'full_name',
                                        {
                                            required: true,
                                            className: 'sm:col-span-2',
                                        }
                                    )}

                                    {renderField('Gender', 'gender', {
                                        required: true,
                                        options: [
                                            {
                                                value: 'Boy',
                                                label: 'Boy',
                                            },
                                            {
                                                value: 'Girl',
                                                label: 'Girl',
                                            },
                                        ],
                                    })}

                                    {renderField(
                                        'IC / MyKid No.',
                                        'ic_number',
                                        { required: true }
                                    )}

                                    {renderField(
                                        'Date of Birth',
                                        'date_of_birth',
                                        {
                                            required: true,
                                            type: 'date',
                                        }
                                    )}

                                    {renderField(
                                        'Place of Birth',
                                        'birth_place'
                                    )}

                                    {renderField(
                                        'Child Order',
                                        'birth_order',
                                        { type: 'number', min: 1 }
                                    )}

                                    {renderField(
                                        'Total Siblings',
                                        'total_siblings',
                                        { type: 'number', min: 0 }
                                    )}

                                    {renderField(
                                        'Favourite Food',
                                        'favourite_food',
                                        {
                                            className: 'sm:col-span-3',
                                        }
                                    )}
                                </div>
                            </section>

                            {/* PACKAGE */}
                            <section>
                                <SectionTitle>
                                    2. Package & Service Details
                                </SectionTitle>

                                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                                    {renderField(
                                        'Class Name',
                                        'class_name',
                                        {
                                            required: true,
                                            onChange: (value) =>
                                                setData((previous) => ({
                                                    ...previous,
                                                    class_name: value,
                                                    package_id: '',
                                                })),
                                            options: [
                                                {
                                                    value: 'Tots Club',
                                                    label: 'Tots Club',
                                                },
                                                {
                                                    value: '2 Years',
                                                    label: '2 Years',
                                                },
                                                {
                                                    value: '3 Years',
                                                    label: '3 Years',
                                                },
                                                {
                                                    value: '4 Years',
                                                    label: '4 Years',
                                                },
                                            ],
                                        }
                                    )}

                                    {renderField(
                                        'Package',
                                        'package_id',
                                        {
                                            required: true,
                                            options: [
                                                {
                                                    value: '',
                                                    label: 'Select Package',
                                                },
                                                ...availablePackages.map(
                                                    (item) => ({
                                                        value: String(
                                                            item.package_id
                                                        ),
                                                        label: `${
                                                            item.package_name
                                                        } — RM ${Number(
                                                            item.monthly_fee
                                                        ).toFixed(
                                                            2
                                                        )}/month`,
                                                    })
                                                ),
                                            ],
                                        }
                                    )}
                                </div>

                                {selectedPackage && (
                                    <div className="mt-3 rounded-xl border border-[#E2DFEE] bg-[#F7F6FC] p-3">
                                        <p className="font-bold text-[#6C63A8]">
                                            {
                                                selectedPackage.package_name
                                            }
                                        </p>
                                        <p className="mt-1 text-[#6B7280]">
                                            Age group:{' '}
                                            {showValue(
                                                selectedPackage.age_group
                                            )}{' '}
                                            · Monthly fee: RM{' '}
                                            {Number(
                                                selectedPackage.monthly_fee
                                            ).toFixed(2)}
                                        </p>
                                    </div>
                                )}
                            </section>

                            {/* GUARDIAN */}
                            <section>
                                <SectionTitle>
                                    3. Primary Guardian
                                </SectionTitle>

                                <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                                    {renderField(
                                        'Relationship',
                                        'guardian_relationship',
                                        {
                                            required: true,
                                            options: [
                                                {
                                                    value: 'Father',
                                                    label: 'Father',
                                                },
                                                {
                                                    value: 'Mother',
                                                    label: 'Mother',
                                                },
                                                {
                                                    value: 'Guardian',
                                                    label: 'Guardian',
                                                },
                                            ],
                                        }
                                    )}

                                    {guardianRequired ? (
                                        <>
                                            {renderField(
                                                'Guardian Name',
                                                'guardian_name',
                                                { required: true }
                                            )}
                                            {renderField(
                                                'Guardian Phone',
                                                'guardian_phone',
                                                { required: true }
                                            )}
                                        </>
                                    ) : (
                                        <div className="rounded-lg bg-[#F7F6FC] p-3 text-[#6B7280] sm:col-span-2">
                                            Primary guardian name and
                                            phone will be taken from the
                                            selected father or mother
                                            below.
                                        </div>
                                    )}
                                </div>

                                {!guardianRequired &&
                                    (errors.guardian_name ||
                                        errors.guardian_phone) && (
                                        <p className="mt-2 text-red-600">
                                            {errors.guardian_name ||
                                                errors.guardian_phone}
                                        </p>
                                    )}
                            </section>

                            {/* FATHER */}
                            <section>
                                <SectionTitle>
                                    4. Father’s Details
                                </SectionTitle>

                                <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                                    {renderField(
                                        'Father’s Name',
                                        'father_name',
                                        { required: fatherRequired }
                                    )}
                                    {renderField(
                                        'Father’s IC',
                                        'father_ic_number'
                                    )}
                                    {renderField(
                                        'Father’s Phone',
                                        'father_phone',
                                        { required: fatherRequired }
                                    )}
                                    {renderField(
                                        'Father’s Occupation',
                                        'father_occupation'
                                    )}
                                    {renderField(
                                        'Father’s Race',
                                        'father_race'
                                    )}
                                    {renderField(
                                        'Father’s Nationality',
                                        'father_nationality'
                                    )}
                                </div>
                            </section>

                            {/* MOTHER */}
                            <section>
                                <SectionTitle>
                                    5. Mother’s Details
                                </SectionTitle>

                                <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                                    {renderField(
                                        'Mother’s Name',
                                        'mother_name',
                                        { required: motherRequired }
                                    )}
                                    {renderField(
                                        'Mother’s IC',
                                        'mother_ic_number'
                                    )}
                                    {renderField(
                                        'Mother’s Phone',
                                        'mother_phone',
                                        { required: motherRequired }
                                    )}
                                    {renderField(
                                        'Mother’s Occupation',
                                        'mother_occupation'
                                    )}
                                    {renderField(
                                        'Mother’s Race',
                                        'mother_race'
                                    )}
                                    {renderField(
                                        'Mother’s Nationality',
                                        'mother_nationality'
                                    )}
                                </div>
                            </section>

                            {/* CONTACT */}
                            <section>
                                <SectionTitle>
                                    6. Address & Contact
                                </SectionTitle>

                                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                                    {renderField(
                                        'Home Address',
                                        'home_address',
                                        {
                                            textarea: true,
                                            className: 'sm:col-span-2',
                                        }
                                    )}
                                    {renderField('Email', 'email', {
                                        type: 'email',
                                    })}
                                </div>
                            </section>

                            {/* EMERGENCY */}
                            <section>
                                <SectionTitle>
                                    7. Emergency Contact
                                </SectionTitle>

                                <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                                    {renderField(
                                        'Contact Name',
                                        'emergency_contact_name'
                                    )}
                                    {renderField(
                                        'Contact Phone',
                                        'emergency_contact_phone'
                                    )}
                                    {renderField(
                                        'Relationship',
                                        'emergency_contact_relationship'
                                    )}
                                </div>
                            </section>

                            {/* HEALTH */}
                            <section>
                                <SectionTitle>
                                    8. Health & Registration Notes
                                </SectionTitle>

                                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                                    {renderField(
                                        'Allergies',
                                        'allergies',
                                        { textarea: true }
                                    )}
                                    {renderField(
                                        'Medical Notes',
                                        'medical_notes',
                                        { textarea: true }
                                    )}
                                    {renderField(
                                        'Referral Source',
                                        'referral_source',
                                        {
                                            className: 'sm:col-span-2',
                                        }
                                    )}
                                </div>
                            </section>

                            {/* STATUS: EDIT ONLY */}
                            {editingStudent && (
                                <section>
                                    <SectionTitle>
                                        9. Student Status
                                    </SectionTitle>

                                    {renderField(
                                        'Status',
                                        'student_status',
                                        {
                                            required: true,
                                            options: [
                                                {
                                                    value: 'Active',
                                                    label: 'Active — Still Enrolled',
                                                },
                                                {
                                                    value: 'Withdrawn',
                                                    label: 'Withdrawn — Left the Centre',
                                                },
                                                {
                                                    value: 'Graduated',
                                                    label: 'Graduated — Completed Studies',
                                                },
                                            ],
                                        }
                                    )}

                                    {data.student_status !==
                                        'Active' && (
                                        <p className="mt-2 rounded-lg bg-amber-50 p-3 text-amber-900">
                                            Student profile and previous
                                            records will be kept. The
                                            student will appear under
                                            Inactive.
                                        </p>
                                    )}
                                </section>
                            )}

                            {/* ACTIONS */}
                            <div className="flex justify-end gap-2 border-t border-[#E2DFEE] pt-4">
                                <button
                                    type="button"
                                    onClick={closeAddEditModal}
                                    className="rounded-lg bg-slate-100 px-4 py-2 font-bold text-[#2D3142]"
                                >
                                    Cancel
                                </button>

                                <button
                                    type="submit"
                                    disabled={processing}
                                    className="rounded-lg bg-[#6C63A8] px-5 py-2 font-bold text-white hover:bg-[#514A82] disabled:opacity-50"
                                >
                                    {processing
                                        ? 'Saving...'
                                        : editingStudent
                                          ? 'Update Record'
                                          : 'Save Record'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </AuthenticatedLayout>
    );
}
