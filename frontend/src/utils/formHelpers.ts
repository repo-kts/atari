/**
 * Reusable form helper functions for achievement forms
 * Provides utilities for common form operations like field mapping and data transformation
 */

/**
 * Format staff name with post name for display
 */
export function formatStaffLabel(staff: { staffName: string; sanctionedPost?: { postName?: string } }): string {
    return `${staff.staffName}${staff.sanctionedPost?.postName ? ` (${staff.sanctionedPost.postName})` : ''}`;
}

/**
 * Create staff dropdown options from staff data
 */
export function createStaffOptions(staffData: Array<{ kvkStaffId: number; staffName: string; sanctionedPost?: { postName?: string } }>) {
    return staffData.map((staff) => ({
        value: staff.kvkStaffId,
        label: formatStaffLabel(staff),
    }));
}

/**
 * Handle staff selection change
 */
export function handleStaffChange(
    value: string | number,
    staffData: Array<{ kvkStaffId: number; staffName: string; sanctionedPost?: { postName?: string } }>,
    setFormData: (data: any) => void,
    formData: any
) {
    const selectedStaff = staffData.find((s) => s.kvkStaffId === value);
    setFormData({
        ...formData,
        staffId: value as number,
        staffName: selectedStaff?.staffName || '',
    });
}

/**
 * Create master data options from array of items
 */
export function createMasterDataOptions<T extends { [key: string]: any }>(
    items: T[] | undefined | null,
    valueKey: keyof T,
    labelKey: keyof T
): Array<{ value: string | number; label: string }> {
    if (!items || !Array.isArray(items)) {
        return [];
    }
    return items.map((item) => ({
        value: item[valueKey] as string | number,
        label: String(item[labelKey]),
    }));
}

/**
 * Filter items by parent ID
 */
export function filterByParentId<T extends { [key: string]: any }>(
    items: T[],
    parentIdKey: keyof T,
    parentId: string | number | null | undefined
): T[] {
    if (!parentId) return [];
    return items.filter((item) => item[parentIdKey] === parentId);
}
