import React, { useCallback, useEffect, useMemo, useState } from 'react'
import { CheckCircle, XCircle, AlertTriangle, Info } from 'lucide-react'

type ToastVariant = 'success' | 'error' | 'warning' | 'info'

interface ToastOptions {
    title?: string
    message: string
    variant?: ToastVariant
    autoCloseDelay?: number
}

interface ToastState extends Required<ToastOptions> {
    id: number
}

const variantConfig: Record<ToastVariant, { icon: React.ComponentType<any>; container: string; iconColor: string }> = {
    success: {
        icon: CheckCircle,
        container: 'bg-green-50 border-green-200',
        iconColor: 'text-green-600',
    },
    error: {
        icon: XCircle,
        container: 'bg-red-50 border-red-200',
        iconColor: 'text-red-600',
    },
    warning: {
        icon: AlertTriangle,
        container: 'bg-orange-50 border-orange-200',
        iconColor: 'text-orange-600',
    },
    info: {
        icon: Info,
        container: 'bg-blue-50 border-blue-200',
        iconColor: 'text-blue-600',
    },
}

export function useToast() {
    const [toastState, setToastState] = useState<ToastState | null>(null)

    const dismiss = useCallback(() => {
        setToastState(null)
    }, [])

    const toast = useCallback((opts: ToastOptions) => {
        setToastState({
            id: Date.now(),
            title: opts.title || 'Notice',
            message: opts.message,
            variant: opts.variant || 'info',
            autoCloseDelay: opts.autoCloseDelay ?? 3500,
        })
    }, [])

    useEffect(() => {
        if (!toastState) return
        const timer = setTimeout(() => {
            setToastState((current) => (current?.id === toastState.id ? null : current))
        }, toastState.autoCloseDelay)
        return () => clearTimeout(timer)
    }, [toastState])

    const ToastContainer = useMemo<React.FC>(() => {
        return () => {
            if (!toastState) return null

            const config = variantConfig[toastState.variant]
            const Icon = config.icon

            return (
                <div className="fixed top-4 right-4 z-[100] max-w-sm w-[calc(100vw-2rem)]">
                    <div className={`border rounded-xl shadow-lg px-4 py-3 ${config.container}`}>
                        <div className="flex items-start gap-3">
                            <Icon className={`w-5 h-5 mt-0.5 shrink-0 ${config.iconColor}`} />
                            <div className="min-w-0 flex-1">
                                <p className="text-sm font-semibold text-[#212121]">{toastState.title}</p>
                                <p className="text-sm text-[#4F4F4F] break-words">{toastState.message}</p>
                            </div>
                            <button
                                type="button"
                                onClick={dismiss}
                                className="text-xs text-[#616161] hover:text-[#212121] px-1"
                                aria-label="Dismiss notification"
                            >
                                x
                            </button>
                        </div>
                    </div>
                </div>
            )
        }
    }, [dismiss, toastState])

    return {
        toast,
        dismiss,
        ToastContainer,
    }
}

