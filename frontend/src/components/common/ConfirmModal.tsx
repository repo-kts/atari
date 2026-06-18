import React from 'react'
import { Modal } from '@/components/ui/Modal'
import { AlertTriangle, Info, XCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { LoadingButton } from './LoadingButton'

interface ConfirmModalProps {
    isOpen: boolean
    onClose: () => void
    onConfirm: () => void | Promise<void>
    title: string
    message: string
    variant?: 'danger' | 'warning' | 'info'
    confirmText?: string
    cancelText?: string
    isLoading?: boolean
}

export const ConfirmModal: React.FC<ConfirmModalProps> = ({
    isOpen,
    onClose,
    onConfirm,
    title,
    message,
    variant = 'info',
    confirmText = 'Confirm',
    cancelText = 'Cancel',
    isLoading = false,
}) => {
    const handleConfirm = async () => {
        await onConfirm()
    }

    const variantConfig = {
        danger: {
            icon: XCircle,
            iconColor: 'text-red-600',
            bgColor: 'bg-red-50',
            borderColor: 'border-red-200',
            buttonVariant: 'danger' as const,
        },
        warning: {
            icon: AlertTriangle,
            iconColor: 'text-orange-600',
            bgColor: 'bg-orange-50',
            borderColor: 'border-orange-200',
            buttonVariant: 'outline' as const,
        },
        info: {
            icon: Info,
            iconColor: 'text-blue-600',
            bgColor: 'bg-blue-50',
            borderColor: 'border-blue-200',
            buttonVariant: 'primary' as const,
        },
    }

    const config = variantConfig[variant]
    const Icon = config.icon

    return (
        <Modal isOpen={isOpen} onClose={onClose} size="sm">
            <div className="space-y-4">
                {/* Icon and Title */}
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
                <div className="flex items-center justify-end gap-3 pt-4 border-t border-[#E0E0E0]">
                    <Button
                        variant="outline"
                        size="md"
                        onClick={onClose}
                        disabled={isLoading}
                        className="border-[#E0E0E0] text-[#757575] hover:text-[#212121] hover:bg-[#F5F5F5]"
                    >
                        {cancelText}
                    </Button>
                    <LoadingButton
                        onClick={handleConfirm}
                        isLoading={isLoading}
                        variant={config.buttonVariant}
                        size="md"
                    >
                        {confirmText}
                    </LoadingButton>
                </div>
            </div>
        </Modal>
    )
}
