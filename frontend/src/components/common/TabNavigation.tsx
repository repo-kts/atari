import React, { useRef, useState, useEffect } from 'react'
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

    // Check if we need scroll arrows
    useEffect(() => {
        const checkScroll = () => {
            if (containerRef.current) {
                const { scrollLeft, scrollWidth, clientWidth } = containerRef.current
                setShowLeftArrow(scrollLeft > 0)
                setShowRightArrow(scrollLeft + clientWidth < scrollWidth - 5)
            }
        }

        checkScroll()
        window.addEventListener('resize', checkScroll)
        containerRef.current?.addEventListener('scroll', checkScroll)

        return () => {
            window.removeEventListener('resize', checkScroll)
        }
    }, [tabs])

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
