import React, { useState } from 'react'
import { useAuthStore } from '../../../stores/authStore'
import { localStorageService } from '../../../utils/localStorageService'
import { Publication } from '../../../types/publication'
import { Input } from '../../ui/Input'
import { Button } from '../../ui/Button'

interface AddPublicationProps {
    onSuccess: () => void
    onCancel: () => void
}

export const AddPublication: React.FC<AddPublicationProps> = ({ onSuccess, onCancel }) => {
    const { user } = useAuthStore()
    const [formData, setFormData] = useState<Partial<Publication>>({
        year: new Date().getFullYear().toString(),
        publication_item: 'Research Paper Published',
    })
    const [errors, setErrors] = useState<Record<string, string>>({})

    const publicationItems = [
        "Research Paper Published",
        "Abstracts Published in Seminar or Conference or Symposia",
        "Books Published",
        "Book Chapter Published",
        "Popular Articles Published",
        "Success Story Published",
        "Extension Bulletins Published",
        "Extension Folders or Leaflet or Pamphlets",
        "Technical Reports",
        "News Letter",
        "Electronic Publication CD or DVD",
        "E Publication"
    ]

    const validate = (): boolean => {
        const newErrors: Record<string, string> = {}
        if (!formData.year) newErrors.year = 'Year is required'
        if (!formData.publication_item) newErrors.publication_item = 'Publication item is required'
        if (!formData.title) newErrors.title = 'Title is required'
        if (!formData.author_name) newErrors.author_name = 'Author name is required'
        if (!formData.journal_name) newErrors.journal_name = 'Journal name is required'

        setErrors(newErrors)
        return Object.keys(newErrors).length === 0
    }

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault()
        if (!validate() || !user?.kvkId) return

        const newPub: Publication = {
            id: Date.now(),
            kvk_id: user.kvkId,
            kvk_name: user.name || 'Unknown KVK',
            year: formData.year || '',
            publication_item: formData.publication_item || '',
            title: formData.title || '',
            author_name: formData.author_name || '',
            journal_name: formData.journal_name || '',
        }

        localStorageService.savePublication(newPub)
        onSuccess()
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                    <label className="block text-sm font-medium text-[#487749] mb-2">
                        Year
                    </label>
                    <select
                        value={formData.year}
                        onChange={e => setFormData({ ...formData, year: e.target.value })}
                        className={`w-full h-12 px-4 border rounded-xl focus:outline-none focus:ring-2 focus:ring-[#487749]/20 focus:border-[#487749] bg-white text-[#212121] ${errors.year ? 'border-red-300' : 'border-[#E0E0E0]'}`}
                        required
                    >
                        <option value="2024">2024</option>
                        <option value="2025">2025</option>
                        <option value="2026">2026</option>
                    </select>
                </div>

                <div>
                    <label className="block text-sm font-medium text-[#487749] mb-2">
                        Publication Item
                    </label>
                    <select
                        value={formData.publication_item}
                        onChange={e => setFormData({ ...formData, publication_item: e.target.value })}
                        className="w-full h-12 px-4 border border-[#E0E0E0] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#487749]/20 focus:border-[#487749] bg-white text-[#212121]"
                        required
                    >
                        {publicationItems.map(item => (
                            <option key={item} value={item}>{item}</option>
                        ))}
                    </select>
                </div>

                <div className="md:col-span-2">
                    <Input
                        label="Title"
                        value={formData.title || ''}
                        onChange={e => setFormData({ ...formData, title: e.target.value })}
                        placeholder="Enter publication title"
                        error={errors.title}
                        required
                    />
                </div>

                <div>
                    <Input
                        label="Author Name"
                        value={formData.author_name || ''}
                        onChange={e => setFormData({ ...formData, author_name: e.target.value })}
                        placeholder="Enter author name"
                        error={errors.author_name}
                        required
                    />
                </div>

                <div>
                    <Input
                        label="Journal Name"
                        value={formData.journal_name || ''}
                        onChange={e => setFormData({ ...formData, journal_name: e.target.value })}
                        placeholder="Enter journal name"
                        error={errors.journal_name}
                        required
                    />
                </div>
            </div>

            <div className="flex justify-end gap-3 pt-4">
                <Button
                    type="submit"
                    variant="primary"
                    className="flex-1 bg-[#487749] hover:bg-[#3A613B]"
                >
                    Add Publication Details
                </Button>
                <Button
                    type="button"
                    variant="secondary"
                    onClick={onCancel}
                    className="flex-1"
                >
                    Cancel
                </Button>
            </div>
        </form>
    )
}
