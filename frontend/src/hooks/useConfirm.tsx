import React, { useState, useCallback, useMemo } from 'react'
import { ConfirmModal } from '@/components/common/ConfirmModal'

interface ConfirmOptions {
    title: string
    message: string
    variant?: 'danger' | 'warning' | 'info'
    confirmText?: string
    cancelText?: string
}

export function useConfirm() {
    const [isOpen, setIsOpen] = useState(false)
    const [options, setOptions] = useState<ConfirmOptions>({
        title: 'Confirm',
        message: 'Are you sure?',
        variant: 'info',
    })
    const [onConfirmCallback, setOnConfirmCallback] = useState<() => void | Promise<void>>(() => {})
    const [isLoading, setIsLoading] = useState(false)

    const confirm = useCallback((
        opts: ConfirmOptions,
        onConfirm: () => void | Promise<void>
    ) => {
        setOptions(opts)
        setOnConfirmCallback(() => onConfirm)
        setIsOpen(true)
    }, [])

    const handleConfirm = useCallback(async () => {
        setIsLoading(true)
        try {
            await onConfirmCallback()
            setIsOpen(false)
        } catch (error) {
            console.error('Confirm action failed:', error)
        } finally {
            setIsLoading(false)
        }
    }, [onConfirmCallback])

    const handleClose = useCallback(() => {
        if (!isLoading) {
            setIsOpen(false)
        }
    }, [isLoading])

    const ConfirmDialog = useMemo<React.FC>(() => {
        return () => (
            <ConfirmModal
                isOpen={isOpen}
                onClose={handleClose}
                onConfirm={handleConfirm}
                title={options.title}
                message={options.message}
                variant={options.variant}
                confirmText={options.confirmText}
                cancelText={options.cancelText}
                isLoading={isLoading}
            />
        )
    }, [isOpen, handleClose, handleConfirm, options, isLoading])

    return {
        confirm,
        ConfirmDialog,
    }
}
