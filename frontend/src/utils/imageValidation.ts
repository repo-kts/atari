// Image uploads are bounded to 200KB–2MB across every image field.
export const IMAGE_MIN_BYTES = 200 * 1024
export const IMAGE_MAX_BYTES = 2 * 1024 * 1024

function isImageFile(file: { type?: string; name?: string }): boolean {
    if ((file.type || '').toLowerCase().startsWith('image/')) return true
    // Fall back to extension when the browser omits a MIME type.
    return /\.(png|jpe?g|gif|webp|bmp|svg|heic|heif|avif)$/i.test(file.name || '')
}

/**
 * Returns an error message when an image file is outside the 200KB–2MB range,
 * or null when the file is acceptable (or is not an image).
 */
export function validateImageFile(file: {
    name?: string
    size: number
    type?: string
}): string | null {
    if (!isImageFile(file)) return null
    const label = file.name ? `"${file.name}"` : 'Image'
    if (file.size < IMAGE_MIN_BYTES) {
        return `${label} is too small — images must be at least 200KB`
    }
    if (file.size > IMAGE_MAX_BYTES) {
        return `${label} is too large — images must not exceed 2MB`
    }
    return null
}
