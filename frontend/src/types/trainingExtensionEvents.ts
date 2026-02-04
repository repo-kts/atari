/**
 * Training, Extension & Events Master Data Types
 */

// ============================================
// Training Types
// ============================================

export interface TrainingType {
    trainingTypeId: number;
    trainingTypeName: string;
    _count?: {
        trainingAreas: number;
    };
}

export interface TrainingArea {
    trainingAreaId: number;
    trainingAreaName: string;
    trainingTypeId: number;
    trainingType?: {
        trainingTypeId: number;
        trainingTypeName: string;
    };
    _count?: {
        thematicAreas: number;
    };
}

export interface TrainingThematicArea {
    trainingThematicAreaId: number;
    trainingThematicAreaName: string;
    trainingAreaId: number;
    trainingArea?: {
        trainingAreaId: number;
        trainingAreaName: string;
        trainingType?: {
            trainingTypeId: number;
            trainingTypeName: string;
        };
    };
}

// ============================================
// Extension Activity Types
// ============================================

export interface ExtensionActivity {
    extensionActivityId: number;
    extensionName: string;
}

export interface OtherExtensionActivity {
    otherExtensionActivityId: number;
    otherExtensionName: string;
}

// ============================================
// Event Types
// ============================================

export interface Event {
    eventId: number;
    eventName: string;
}

// ============================================
// Form Data Types
// ============================================

export interface TrainingTypeFormData {
    trainingTypeName: string;
}

export interface TrainingAreaFormData {
    trainingAreaName: string;
    trainingTypeId: number;
}

export interface TrainingThematicAreaFormData {
    trainingThematicAreaName: string;
    trainingAreaId: number;
}

export interface ExtensionActivityFormData {
    extensionName: string;
}

export interface OtherExtensionActivityFormData {
    otherExtensionName: string;
}

export interface EventFormData {
    eventName: string;
}

// ============================================
// Statistics Types
// ============================================

export interface TrainingExtensionEventsStats {
    training: {
        types: number;
        areas: number;
        thematicAreas: number;
    };
    extension: {
        activities: number;
        otherActivities: number;
    };
    events: {
        total: number;
    };
}

// ============================================
// API Response Types
// ============================================

export interface ApiResponse<T> {
    success: boolean;
    data: T;
    message?: string;
    error?: string;
}

export interface PaginatedResponse<T> {
    success: boolean;
    data: T[];
    pagination: {
        total: number;
        page: number;
        limit: number;
        totalPages: number;
    };
}
