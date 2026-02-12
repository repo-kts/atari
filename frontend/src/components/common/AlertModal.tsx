import React, { useEffect } from 'react'
import { Modal } from '@/components/ui/Modal'
import { CheckCircle, XCircle, AlertTriangle, Info } from 'lucide-react'
import { LoadingButton } from './LoadingButton'

interface AlertModalProps {
    isOpen: boolean
    onClose: () => void
    title: string
    message: string
    variant?: 'success' | 'error' | 'warning' | 'info'
    autoClose?: boolean
    autoCloseDelay?: number
    showCloseButton?: boolean
}

export const AlertModal: React.FC<AlertModalProps> = ({
    isOpen,
    onClose,
    title,
    message,
    variant = 'info',
    autoClose = false,
    autoCloseDelay = 3000,
    showCloseButton = true,
}) => {
    useEffect(() => {
        if (isOpen && autoClose) {
            const timer = setTimeout(() => {
                onClose()
            }, autoCloseDelay)
            return () => clearTimeout(timer)
        }
    }, [isOpen, autoClose, autoCloseDelay, onClose])

    const variantConfig = {
        success: {
            icon: CheckCircle,
            iconColor: 'text-green-600',
            bgColor: 'bg-green-50',
            borderColor: 'border-green-200',
        },
        error: {
            icon: XCircle,
            iconColor: 'text-red-600',
            bgColor: 'bg-red-50',
            borderColor: 'border-red-200',
        },
        warning: {
            icon: AlertTriangle,
            iconColor: 'text-orange-600',
            bgColor: 'bg-orange-50',
            borderColor: 'border-orange-200',
        },
        info: {
            icon: Info,
            iconColor: 'text-blue-600',
            bgColor: 'bg-blue-50',
            borderColor: 'border-blue-200',
        },
    }

    const config = variantConfig[variant]
    const Icon = config.icon

    return (
        <Modal isOpen={isOpen} onClose={onClose} size="sm">
            <div className="space-y-4">
                {/* Icon and Content */}
                <div className={`flex items-start gap-4 p-4 rounded-xl ${config.bgColor} border ${config.borderColor}`}>
                    <Icon className={`w-6 h-6 ${config.iconColor} shrink-0 mt-0.5`} />
                    <div className="flex-1">
                        <h3 className="text-lg font-semibold text-[#212121] mb-1">
                            {title}
                        </h3>
                        <p className="text-sm text-[#757575] whitespace-pre-line">
                            {message}
                        </p>
                    </div>
                </div>

                {/* Actions */}
                {showCloseButton && (
                    <div className="flex items-center justify-end pt-4 border-t border-[#E0E0E0]">
                        <LoadingButton
                            onClick={onClose}
                            variant="primary"
                            size="md"
                        >
                            OK
                        </LoadingButton>
                    </div>
                )}
            </div>
        </Modal>
    )
}
