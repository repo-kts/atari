/**
 * Hook State Utilities
 *
 * Utilities for extracting loading and error states from various hook types
 */

/**
 * Extract loading state from a hook
 * Handles different hook structures (isLoading vs loading)
 */
export function getHookLoading(hook: any): boolean {
    if (!hook) return false
    if ('isLoading' in hook) return hook.isLoading
    if ('loading' in hook) return hook.loading
    return false
}

/**
 * Extract error state from a hook
 * Handles different error formats (Error object vs string vs other)
 */
export function getHookError(hook: any): string | null {
    if (!hook || !hook.error) return null
    if (hook.error instanceof Error) return hook.error.message
    if (typeof hook.error === 'string') return hook.error
    return String(hook.error)
}
