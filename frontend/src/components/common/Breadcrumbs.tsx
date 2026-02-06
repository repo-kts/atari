import React from 'react'
import { Link } from 'react-router-dom'
import { ChevronRight, Home } from 'lucide-react'
import { BreadcrumbItem } from '../../types/navigation'

interface BreadcrumbsProps {
    items: BreadcrumbItem[]
    showHome?: boolean
    maxItems?: number
    className?: string
}

export const Breadcrumbs: React.FC<BreadcrumbsProps> = ({
    items,
    showHome = true,
    maxItems = 0,
    className = ''
}) => {
    // Filter out items with empty paths (parent categories with '#')
    const validItems = items.filter(item => item.path && item.path !== '')

    // Truncate if maxItems is specified and we have more items
    let displayItems = validItems
    let truncated = false

    if (maxItems > 0 && validItems.length > maxItems) {
        truncated = true
        // Show first item, ellipsis, and last (maxItems - 1) items
        displayItems = [
            validItems[0],
            ...validItems.slice(-(maxItems - 1))
        ]
    }

    if (validItems.length === 0) return null

    return (
        <nav
            className={`flex items-center text-sm ${className}`}
            aria-label="Breadcrumb"
        >
            <ol className="flex items-center flex-wrap gap-1">
                {showHome && (
                    <li className="flex items-center">
                        <Link
                            to="/dashboard"
                            className="text-[#757575] hover:text-[#487749] transition-colors"
                            aria-label="Home"
                        >
                            <Home className="w-4 h-4" />
                        </Link>
                        <ChevronRight className="w-4 h-4 mx-1 text-[#BDBDBD]" />
                    </li>
                )}

                {displayItems.map((item, index) => {
                    const isLast = index === displayItems.length - 1
                    const showEllipsis = truncated && index === 0 && displayItems.length > 1

                    return (
                        <React.Fragment key={`${item.path}-${index}`}>
                            <li className="flex items-center">
                                {isLast ? (
                                    <span
                                        className="text-[#487749] font-medium"
                                        aria-current="page"
                                    >
                                        {item.label}
                                    </span>
                                ) : (
                                    <Link
                                        to={item.path}
                                        className="text-[#757575] hover:text-[#487749] transition-colors hover:underline"
                                    >
                                        {item.label}
                                    </Link>
                                )}
                            </li>

                            {showEllipsis && (
                                <>
                                    <ChevronRight className="w-4 h-4 mx-1 text-[#BDBDBD]" />
                                    <li className="flex items-center">
                                        <span className="text-[#757575]">...</span>
                                    </li>
                                </>
                            )}

                            {!isLast && (
                                <ChevronRight className="w-4 h-4 mx-1 text-[#BDBDBD]" />
                            )}
                        </React.Fragment>
                    )
                })}
            </ol>
        </nav>
    )
}
