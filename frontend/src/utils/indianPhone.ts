/** Indian mobile: 10 digits, first digit 6–9 (no leading 0). */
export const INDIAN_MOBILE_REGEX = /^[6-9]\d{9}$/

export function cleanIndianMobileInput(raw: string): string {
    return raw.replace(/\D/g, '').slice(0, 10)
}

export function isValidIndianMobile(value: string): boolean {
    return INDIAN_MOBILE_REGEX.test(cleanIndianMobileInput(value))
}

/**
 * @returns Error message or null if valid
 */
export function indianMobileFieldError(value: string, required: boolean): string | null {
    const d = cleanIndianMobileInput(value)
    if (!d) {
        return required ? 'Mobile number is required' : null
    }
    if (d.length !== 10) {
        return 'Enter exactly 10 digits'
    }
    if (!INDIAN_MOBILE_REGEX.test(d)) {
        return 'Invalid mobile number (10 digits, starting with 6–9)'
    }
    return null
}
