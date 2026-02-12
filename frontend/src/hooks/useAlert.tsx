import React, { useState, useCallback, useMemo } from 'react'
import { AlertModal } from '@/components/common/AlertModal'

interface AlertOptions {
    title: string
    message: string
    variant?: 'success' | 'error' | 'warning' | 'info'
    autoClose?: boolean
    autoCloseDelay?: number
}

export function useAlert() {
    const [isOpen, setIsOpen] = useState(false)
    const [options, setOptions] = useState<AlertOptions>({
        title: 'Alert',
        message: '',
        variant: 'info',
    })

    const alert = useCallback((opts: AlertOptions) => {
        setOptions(opts)
        setIsOpen(true)
    }, [])

    const handleClose = useCallback(() => {
        setIsOpen(false)
    }, [])

    const AlertDialog = useMemo<React.FC>(() => {
        return () => (
            <AlertModal
                isOpen={isOpen}
                onClose={handleClose}
                title={options.title}
                message={options.message}
                variant={options.variant}
                autoClose={options.autoClose}
                autoCloseDelay={options.autoCloseDelay}
            />
        )
    }, [isOpen, handleClose, options])

    return {
        alert,
        AlertDialog,
    }
}
