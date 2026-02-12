import React, { useRef, useState, useEffect, useCallback, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { ChevronLeft, ChevronRight } from 'lucide-react'

interface Tab {
    label: string
    path: string
}

interface TabNavigationProps {
    tabs: Tab[]
    currentPath: string
    className?: string
}

export const TabNavigation: React.FC<TabNavigationProps> = ({
    tabs,
    currentPath,
    className = ''
}) => {
    const navigate = useNavigate()
    const containerRef = useRef<HTMLDivElement>(null)
    const [showLeftArrow, setShowLeftArrow] = useState(false)
    const [showRightArrow, setShowRightArrow] = useState(false)

    // Refs for optimization
    const rafIdRef = useRef<number | null>(null)
    const tabsStringRef = useRef<string>('')
    const checkScrollRef = useRef<(() => void) | undefined>(undefined)

    // Optimized checkScroll function that only updates state when values change
    const checkScroll = useCallback(() => {
        if (!containerRef.current) return

        const { scrollLeft, scrollWidth, clientWidth } = containerRef.current
        const newShowLeft = scrollLeft > 0
        const newShowRight = scrollLeft + clientWidth < scrollWidth - 5

        // Only update state if values actually changed (prevents unnecessary re-renders)
        setShowLeftArrow(prev => prev !== newShowLeft ? newShowLeft : prev)
        setShowRightArrow(prev => prev !== newShowRight ? newShowRight : prev)
    }, [])

    // Store checkScroll in ref for stable reference
    checkScrollRef.current = checkScroll

    // Throttled scroll handler using requestAnimationFrame
    const handleScroll = useCallback(() => {
        if (rafIdRef.current !== null) {
            cancelAnimationFrame(rafIdRef.current)
        }
        rafIdRef.current = requestAnimationFrame(() => {
            checkScrollRef.current?.()
            rafIdRef.current = null
        })
    }, [])

    // Create stable tabs string for comparison
    const tabsString = useMemo(() =>
        JSON.stringify(tabs.map(t => ({ path: t.path, label: t.label }))),
        [tabs]
    )

    // Setup scroll detection with proper cleanup - only depends on container mount
    useEffect(() => {
        const container = containerRef.current
        if (!container) return

        // Initial check after a brief delay to ensure DOM is ready
        const timeoutId = setTimeout(() => {
            checkScroll()
        }, 0)

        // Add event listeners
        window.addEventListener('resize', checkScroll, { passive: true })
        container.addEventListener('scroll', handleScroll, { passive: true })

        // Cleanup function
        return () => {
            clearTimeout(timeoutId)
            window.removeEventListener('resize', checkScroll)
            container.removeEventListener('scroll', handleScroll)
            if (rafIdRef.current !== null) {
                cancelAnimationFrame(rafIdRef.current)
            }
        }
    }, [checkScroll, handleScroll]) // Only re-run if handlers change (they're memoized)

    // Separate effect to re-check scroll when tabs actually change
    useEffect(() => {
        // Only re-check if tabs actually changed (not just reference)
        if (tabsString !== tabsStringRef.current) {
            tabsStringRef.current = tabsString
            // Use requestAnimationFrame to check after DOM updates
            // Use ref to avoid dependency on checkScroll
            requestAnimationFrame(() => {
                checkScrollRef.current?.()
            })
        }
    }, [tabsString]) // Removed checkScroll from dependencies - using ref instead

    const scroll = (direction: 'left' | 'right') => {
        if (containerRef.current) {
            const scrollAmount = 200
            containerRef.current.scrollBy({
                left: direction === 'left' ? -scrollAmount : scrollAmount,
                behavior: 'smooth'
            })
        }
    }

    if (tabs.length <= 1) return null

    return (
        <div className={`relative px-6 pb-2 ${className}`}>
            {/* Left scroll button */}
            {showLeftArrow && (
                <button
                    onClick={() => scroll('left')}
                    className="absolute left-0 top-0 bottom-0 z-10 px-2 bg-gradient-to-r from-white via-white to-transparent flex items-center"
                    aria-label="Scroll left"
                >
                    <ChevronLeft className="w-5 h-5 text-[#757575]" />
                </button>
            )}

            {/* Tabs container */}
            <div
                ref={containerRef}
                className="flex items-center gap-1 overflow-x-auto w-fit scrollbar-hide bg-[#487749] rounded-xl p-1"
                style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
            >
                {tabs.map((tab) => {
                    const isActive = tab.path === currentPath
                    return (
                        <button
                            key={tab.path}
                            onClick={() => navigate(tab.path)}
                            className={`px-4 py-2 text-sm font-medium rounded-lg whitespace-nowrap transition-all duration-200 ${isActive
                                ? 'bg-white text-[#487749] shadow-sm'
                                : 'text-white hover:text-[#487749] hover:bg-white/50'
                                }`}
                            role="tab"
                            aria-selected={isActive}
                        >
                            {tab.label}
                        </button>
                    )
                })}
            </div>

            {/* Right scroll button */}
            {showRightArrow && (
                <button
                    onClick={() => scroll('right')}
                    className="absolute right-0 top-0 bottom-0 z-10 px-2 bg-gradient-to-l from-white via-white to-transparent flex items-center"
                    aria-label="Scroll right"
                >
                    <ChevronRight className="w-5 h-5 text-[#757575]" />
                </button>
            )}
        </div>
    )
}
