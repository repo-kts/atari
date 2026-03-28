import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import { ChevronRight, Home, MoreHorizontal, CornerDownRight } from 'lucide-react'
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
    const [isExpanded, setIsExpanded] = useState(false)
    // Responsive truncation for mobile
    const [isMobile, setIsMobile] = React.useState(false)

    React.useEffect(() => {
        const checkMobile = () => setIsMobile(window.innerWidth < 640)
        checkMobile()
        window.addEventListener('resize', checkMobile)
        return () => window.removeEventListener('resize', checkMobile)
    }, [])

    const validItems = items.filter(item => item.path && item.path !== '')
    if (validItems.length === 0) return null

    // Determine what to display based on device and maxItems
    let displayItems = validItems
    let hiddenItems: BreadcrumbItem[] = []
    let showEllipsis = false

    if (isMobile && validItems.length > 2) {
        showEllipsis = true
        displayItems = [validItems[0], validItems[validItems.length - 1]]
        hiddenItems = validItems.slice(1, -1)
    } else if (maxItems > 0 && validItems.length > maxItems) {
        showEllipsis = true
        displayItems = [validItems[0], ...validItems.slice(-(maxItems - 1))]
        hiddenItems = validItems.slice(1, -(maxItems - 1))
    }

    return (
        <nav className={`flex items-center text-sm ${className}`} aria-label="Breadcrumb">
            <ol className="flex items-center flex-wrap gap-1">
                {showHome && (
                    <li className="flex items-center">
                        <Link
                            to="/dashboard"
                            className="text-[#757575] hover:text-[#487749] transition-all p-1 hover:bg-gray-100 rounded-md"
                            aria-label="Home"
                        >
                            <Home className="w-4 h-4" />
                        </Link>
                        <ChevronRight className="w-4 h-4 mx-0.5 text-[#BDBDBD] shrink-0" />
                    </li>
                )}

                {displayItems.map((item, index) => {
                    const isFirst = index === 0
                    const isLast = index === displayItems.length - 1
                    
                    return (
                        <React.Fragment key={`${item.path}-${index}`}>
                            <li className="flex items-center">
                                {isLast ? (
                                    <span className="text-[#487749] font-bold px-1 py-0.5 bg-[#487749]/5 rounded-md truncate max-w-[150px] sm:max-w-none">
                                        {item.label}
                                    </span>
                                ) : (
                                    <Link
                                        to={item.path}
                                        className="text-[#757575] hover:text-[#487749] transition-all px-1.5 py-1 hover:bg-gray-100 rounded-md truncate max-w-[100px] sm:max-w-none"
                                    >
                                        {item.label}
                                    </Link>
                                )}
                            </li>

                            {/* Show ellipsis AND hidden items button */}
                            {isFirst && showEllipsis && (
                                <li className="flex items-center gap-1">
                                    <ChevronRight className="w-4 h-4 text-[#BDBDBD] shrink-0" />
                                    <div className="relative">
                                        <button
                                            onClick={() => setIsExpanded(!isExpanded)}
                                            className={`flex items-center justify-center text-[#757575] hover:text-[#487749] w-7 h-7 rounded-lg transition-all ${isExpanded ? 'bg-[#487749]/10 text-[#487749]' : 'bg-gray-100'}`}
                                            aria-label="Show full breadcrumbs"
                                        >
                                            <MoreHorizontal className="w-4 h-4" />
                                        </button>

                                        {isExpanded && (
                                            <>
                                                <div className="fixed inset-0 z-40" onClick={() => setIsExpanded(false)} />
                                                <div className="absolute top-full left-0 mt-2 z-50 min-w-[200px] bg-white rounded-2xl border border-gray-100 p-2 shadow-2xl animate-in fade-in slide-in-from-top-2 duration-200">
                                                    <div className="text-[10px] font-bold text-gray-400 px-3 py-1 uppercase tracking-wider">
                                                        Hidden Steps
                                                    </div>
                                                    <div className="flex flex-col gap-1 mt-1">
                                                        {hiddenItems.map((hidItem, hidIdx) => (
                                                            <Link
                                                                key={`${hidItem.path}-popup`}
                                                                to={hidItem.path}
                                                                onClick={() => setIsExpanded(false)}
                                                                className="flex items-center px-3 py-2 text-gray-600 hover:text-[#487749] hover:bg-[#487749]/5 rounded-xl transition-all group"
                                                                style={{ paddingLeft: `${0.75 + hidIdx * 0.75}rem` }}
                                                            >
                                                                {hidIdx > 0 ? (
                                                                    <CornerDownRight className="w-3.5 h-3.5 mr-2 text-gray-400 group-hover:text-[#487749] shrink-0" />
                                                                ) : (
                                                                    <div className="w-3.5 h-3.5 mr-2" />
                                                                )}
                                                                <span className="text-sm font-medium">{hidItem.label}</span>
                                                            </Link>
                                                        ))}
                                                    </div>
                                                </div>
                                            </>
                                        )}
                                    </div>
                                </li>
                            )}

                            {!isLast && !showEllipsis && (
                                <li className="flex items-center">
                                    <ChevronRight className="w-4 h-4 mx-0.5 text-[#BDBDBD] shrink-0" />
                                </li>
                            )}
                        </React.Fragment>
                    )
                })}
            </ol>
        </nav>
    )
}
