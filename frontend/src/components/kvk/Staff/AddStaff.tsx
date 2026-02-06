import React, { useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { useAuthStore } from '../../../stores/authStore'
import { localStorageService } from '../../../utils/localStorageService'
import { Staff } from '../../../types/staff'
import { Card, CardContent } from '../../ui/Card'
import { Button } from '../../ui/Button'
import { Input } from '../../ui/Input'
import { ArrowLeft, Save } from 'lucide-react'

const jobTypes = ['Permanent', 'Contractual', 'Temporary', 'Deputation']
const castCategories = ['General', 'OBC', 'SC', 'ST', 'EWS']
const posts = [
    { id: 1, post_name: 'Head', chart_label: 'HEAD' },
    { id: 2, post_name: 'Subject Matter Specialist', chart_label: 'SMS' },
    { id: 3, post_name: 'Programme Assistant', chart_label: 'PA' },
    { id: 4, post_name: 'Farm Manager', chart_label: 'FM' },
    { id: 5, post_name: 'Technical Officer', chart_label: 'TO' },
    { id: 6, post_name: 'Supporting Staff', chart_label: 'SS' },
]

export const AddStaff: React.FC = () => {
    const navigate = useNavigate()
    const location = useLocation()
    const { user, hasPermission } = useAuthStore()
    const [saving, setSaving] = useState(false)
    const [errors, setErrors] = useState<Record<string, string>>({})

    // Determine the back path based on current location
    const getBackPath = () => {
        if (location.pathname.includes('/forms/about-kvk/')) {
            return '/forms/about-kvk/employee-details'
        }
        return '/kvk/staff'
    }

    const [formData, setFormData] = useState({
        staff_name: '',
        post_id: '',
        position: 1,
        mobile: '',
        email: '',
        designation: '',
        discipline: '',
        pay_scale: '',
        date_of_joining: '',
        releaving_date: '',
        pay_band: '',
        dob: '',
        job_type: 'Permanent',
        alliances: '',
        specialization: '',
        cast_category: 'General',
    })

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target
        setFormData(prev => ({ ...prev, [name]: value }))
        // Clear error when field is edited
        if (errors[name]) {
            setErrors(prev => ({ ...prev, [name]: '' }))
        }
    }

    const validateForm = (): boolean => {
        const newErrors: Record<string, string> = {}

        if (!formData.staff_name.trim()) {
            newErrors.staff_name = 'Staff name is required'
        }
        if (!formData.post_id) {
            newErrors.post_id = 'Post is required'
        }
        if (!formData.mobile.trim()) {
            newErrors.mobile = 'Mobile number is required'
        } else if (!/^\d{10}$/.test(formData.mobile)) {
            newErrors.mobile = 'Mobile number must be 10 digits'
        }
        if (!formData.email.trim()) {
            newErrors.email = 'Email is required'
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
            newErrors.email = 'Invalid email format'
        }
        if (!formData.discipline.trim()) {
            newErrors.discipline = 'Discipline is required'
        }
        if (!formData.date_of_joining) {
            newErrors.date_of_joining = 'Date of joining is required'
        }
        if (!formData.dob) {
            newErrors.dob = 'Date of birth is required'
        }

        setErrors(newErrors)
        return Object.keys(newErrors).length === 0
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()

        if (!hasPermission('ADD')) {
            alert('You do not have permission to add staff members.')
            return
        }

        if (!validateForm()) {
            return
        }

        if (!user?.kvk_id) {
            alert('KVK ID not found. Please contact administrator.')
            return
        }

        setSaving(true)
        try {
            const selectedPost = posts.find(p => p.id === parseInt(formData.post_id))
            const now = new Date().toISOString()

            const newStaff: Staff = {
                id: Date.now(),
                kvk_id: user.kvk_id,
                staff_name: formData.staff_name,
                post_id: parseInt(formData.post_id),
                position: formData.position,
                mobile: formData.mobile,
                email: formData.email,
                designation: formData.designation || null,
                discipline: formData.discipline,
                pay_scale: formData.pay_scale,
                date_of_joining: formData.date_of_joining,
                releaving_date: formData.releaving_date || null,
                pay_band: formData.pay_band,
                dob: formData.dob,
                job_type: formData.job_type,
                alliances: formData.alliances,
                specialization: formData.specialization,
                cast_category: formData.cast_category,
                is_transferred: 0,
                created_at: now,
                updated_at: now,
                post: selectedPost ? {
                    id: selectedPost.id,
                    post_name: selectedPost.post_name,
                    chart_label: selectedPost.chart_label,
                    created_at: now,
                    updated_at: now,
                } : undefined,
            }

            localStorageService.saveStaff(newStaff)
            alert('Staff member added successfully!')
            navigate(getBackPath())
        } catch (error) {
            console.error('Failed to save staff:', error)
            alert('Failed to add staff member')
        } finally {
            setSaving(false)
        }
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center gap-4">
                <Button
                    variant="outline"
                    size="sm"
                    onClick={() => navigate(getBackPath())}
                    className="flex items-center"
                >
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Back
                </Button>
                <h1 className="text-2xl font-bold text-[#487749]">Add New Staff</h1>
            </div>

            <Card>
                <CardContent className="p-6">
                    <form onSubmit={handleSubmit} className="space-y-6">
                        {/* Personal Information */}
                        <div>
                            <h3 className="text-lg font-semibold text-[#212121] mb-4 pb-2 border-b border-[#E0E0E0]">
                                Personal Information
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                <Input
                                    label="Staff Name *"
                                    name="staff_name"
                                    value={formData.staff_name}
                                    onChange={handleChange}
                                    error={errors.staff_name}
                                    placeholder="Enter full name"
                                />
                                <Input
                                    label="Email *"
                                    type="email"
                                    name="email"
                                    value={formData.email}
                                    onChange={handleChange}
                                    error={errors.email}
                                    placeholder="Enter email address"
                                />
                                <Input
                                    label="Mobile *"
                                    name="mobile"
                                    value={formData.mobile}
                                    onChange={handleChange}
                                    error={errors.mobile}
                                    placeholder="10-digit mobile number"
                                    maxLength={10}
                                />
                                <Input
                                    label="Date of Birth *"
                                    type="date"
                                    name="dob"
                                    value={formData.dob}
                                    onChange={handleChange}
                                    error={errors.dob}
                                />
                                <div className="w-full">
                                    <label className="block text-sm font-medium text-[#487749] mb-2">
                                        Caste Category
                                    </label>
                                    <select
                                        name="cast_category"
                                        value={formData.cast_category}
                                        onChange={handleChange}
                                        className="w-full h-12 px-4 border border-[#E0E0E0] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#487749]/20 focus:border-[#487749] bg-white text-[#212121]"
                                    >
                                        {castCategories.map(cat => (
                                            <option key={cat} value={cat}>{cat}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>
                        </div>

                        {/* Professional Information */}
                        <div>
                            <h3 className="text-lg font-semibold text-[#212121] mb-4 pb-2 border-b border-[#E0E0E0]">
                                Professional Information
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                <div className="w-full">
                                    <label className="block text-sm font-medium text-[#487749] mb-2">
                                        Post *
                                    </label>
                                    <select
                                        name="post_id"
                                        value={formData.post_id}
                                        onChange={handleChange}
                                        className={`w-full h-12 px-4 border rounded-xl focus:outline-none focus:ring-2 focus:ring-[#487749]/20 focus:border-[#487749] bg-white text-[#212121] ${errors.post_id ? 'border-red-300' : 'border-[#E0E0E0]'
                                            }`}
                                    >
                                        <option value="">Select Post</option>
                                        {posts.map(post => (
                                            <option key={post.id} value={post.id}>{post.post_name}</option>
                                        ))}
                                    </select>
                                    {errors.post_id && (
                                        <p className="mt-1 text-sm text-red-600">{errors.post_id}</p>
                                    )}
                                </div>
                                <Input
                                    label="Designation"
                                    name="designation"
                                    value={formData.designation}
                                    onChange={handleChange}
                                    placeholder="Enter designation"
                                />
                                <Input
                                    label="Discipline *"
                                    name="discipline"
                                    value={formData.discipline}
                                    onChange={handleChange}
                                    error={errors.discipline}
                                    placeholder="e.g., Agriculture, Horticulture"
                                />
                                <Input
                                    label="Specialization"
                                    name="specialization"
                                    value={formData.specialization}
                                    onChange={handleChange}
                                    placeholder="Enter specialization"
                                />
                                <div className="w-full">
                                    <label className="block text-sm font-medium text-[#487749] mb-2">
                                        Job Type
                                    </label>
                                    <select
                                        name="job_type"
                                        value={formData.job_type}
                                        onChange={handleChange}
                                        className="w-full h-12 px-4 border border-[#E0E0E0] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#487749]/20 focus:border-[#487749] bg-white text-[#212121]"
                                    >
                                        {jobTypes.map(type => (
                                            <option key={type} value={type}>{type}</option>
                                        ))}
                                    </select>
                                </div>
                                <Input
                                    label="Alliances"
                                    name="alliances"
                                    value={formData.alliances}
                                    onChange={handleChange}
                                    placeholder="Enter alliances"
                                />
                            </div>
                        </div>

                        {/* Employment Details */}
                        <div>
                            <h3 className="text-lg font-semibold text-[#212121] mb-4 pb-2 border-b border-[#E0E0E0]">
                                Employment Details
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                <Input
                                    label="Date of Joining *"
                                    type="date"
                                    name="date_of_joining"
                                    value={formData.date_of_joining}
                                    onChange={handleChange}
                                    error={errors.date_of_joining}
                                />
                                <Input
                                    label="Relieving Date"
                                    type="date"
                                    name="releaving_date"
                                    value={formData.releaving_date}
                                    onChange={handleChange}
                                />
                                <Input
                                    label="Pay Scale"
                                    name="pay_scale"
                                    value={formData.pay_scale}
                                    onChange={handleChange}
                                    placeholder="e.g., Level 10"
                                />
                                <Input
                                    label="Pay Band"
                                    name="pay_band"
                                    value={formData.pay_band}
                                    onChange={handleChange}
                                    placeholder="e.g., PB-3"
                                />
                            </div>
                        </div>

                        {/* Actions */}
                        <div className="flex justify-end gap-4 pt-4 border-t border-[#E0E0E0]">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => navigate(getBackPath())}
                            >
                                Cancel
                            </Button>
                            <Button
                                type="submit"
                                variant="primary"
                                disabled={saving}
                                className="flex items-center"
                            >
                                <Save className="w-4 h-4 mr-2" />
                                {saving ? 'Saving...' : 'Save Staff'}
                            </Button>
                        </div>
                    </form>
                </CardContent>
            </Card>
        </div>
    )
}

export default AddStaff
