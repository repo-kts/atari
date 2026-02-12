/**
 * Form State Management Hook
 *
 * Centralized form state management for data management views
 * Handles form open/close, editing, and data reset
 */

import { useState, useCallback } from 'react'

interface UseFormStateReturn {
    isFormPageOpen: boolean
    editingItem: any | null
    formData: any
    setIsFormPageOpen: (open: boolean) => void
    setEditingItem: (item: any | null) => void
    setFormData: (data: any) => void
    openForm: (item?: any) => void
    closeForm: () => void
    resetForm: () => void
}

/**
 * Hook for managing form state
 */
export function useFormState(): UseFormStateReturn {
    const [isFormPageOpen, setIsFormPageOpen] = useState(false)
    const [editingItem, setEditingItem] = useState<any | null>(null)
    const [formData, setFormData] = useState<any>({})

    const openForm = useCallback((item?: any) => {
        if (item) {
            setEditingItem(item)
            setFormData(item)
        } else {
            setEditingItem(null)
            setFormData({})
        }
        setIsFormPageOpen(true)
    }, [])

    const closeForm = useCallback(() => {
        setIsFormPageOpen(false)
        setEditingItem(null)
        setFormData({})
    }, [])

    const resetForm = useCallback(() => {
        setEditingItem(null)
        setFormData({})
    }, [])

    return {
        isFormPageOpen,
        editingItem,
        formData,
        setIsFormPageOpen,
        setEditingItem,
        setFormData,
        openForm,
        closeForm,
        resetForm,
    }
}
