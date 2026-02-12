/**
 * Reusable utility for abortable API calls
 * Prevents UI blocking and allows cancellation of in-flight requests
 */

import React from 'react'

/**
 * Hook for managing AbortController lifecycle
 * Automatically cancels previous requests when new ones are made
 */
export function useAbortController() {
    const controllerRef = React.useRef<AbortController | null>(null)

    const getAbortController = React.useCallback(() => {
        // Cancel previous request if exists
        if (controllerRef.current) {
            controllerRef.current.abort()
        }

        // Create new controller
        const controller = new AbortController()
        controllerRef.current = controller
        return controller
    }, [])

    const abort = React.useCallback(() => {
        if (controllerRef.current) {
            controllerRef.current.abort()
            controllerRef.current = null
        }
    }, [])

    React.useEffect(() => {
        return () => {
            // Cleanup on unmount
            if (controllerRef.current) {
                controllerRef.current.abort()
            }
        }
    }, [])

    return { getAbortController, abort, signal: controllerRef.current?.signal }
}
