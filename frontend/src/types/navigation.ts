import { ReactNode } from 'react'

export interface MenuItem {
    label: string
    path: string
    icon?: ReactNode
    children?: MenuItem[]
    metadata?: {
        description?: string
        category?: string
        order?: number
        isDirectLink?: boolean
    }
}

export interface BreadcrumbItem {
    label: string
    path: string
    level: number
}

export interface NavigationContext {
    currentPath: string
    breadcrumbs: BreadcrumbItem[]
    siblings: MenuItem[]
    parent?: MenuItem
    children?: MenuItem[]
    currentItem?: MenuItem
}

export interface NavigationResult {
    item: MenuItem | null
    path: MenuItem[]
    siblings: MenuItem[]
    parent: MenuItem | null
}
