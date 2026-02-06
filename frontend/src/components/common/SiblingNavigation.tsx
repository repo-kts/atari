import React, { useState, useRef, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { ChevronLeft, ChevronRight, ChevronDown } from 'lucide-react'
import { MenuItem } from '../../types/navigation'
import { getSiblingNavigation } from '../../utils/navigationContext'

interface SiblingNavigationProps {
    siblings: MenuItem[]
    currentPath: string
    variant?: 'arrows' | 'dropdown' | 'tabs'
    className?: string
}

export const SiblingNavigation: React.FC<SiblingNavigationProps> = ({
    siblings,
    currentPath,
    variant = 'arrows',
    className = ''
}) => {
    const navigate = useNavigate()
    const [dropdownOpen, setDropdownOpen] = useState(false)
    const dropdownRef = useRef<HTMLDivElement>(null)

    const { prev, next, current, currentIndex } = getSiblingNavigation(siblings, currentPath)

    // Filter out non-navigable items (with '#' paths)
    const navigableSiblings = siblings.filter(s => s.path !== '#')

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setDropdownOpen(false)
            }
        }
        document.addEventListener('mousedown', handleClickOutside)
        return () => document.removeEventListener('mousedown', handleClickOutside)
    }, [])

    // Handle keyboard navigation
    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'ArrowLeft' && prev && prev.path !== '#') {
            navigate(prev.path)
        } else if (e.key === 'ArrowRight' && next && next.path !== '#') {
            navigate(next.path)
        }
    }

    if (navigableSiblings.length <= 1) return null

    // Arrows variant - shows prev/next buttons
    if (variant === 'arrows') {
        return (
            <div
                className={`flex items-center gap-2 ${className}`}
                onKeyDown={handleKeyDown}
                tabIndex={0}
                role="navigation"
                aria-label="Sibling navigation"
            >
                <button
                    onClick={() => prev && prev.path !== '#' && navigate(prev.path)}
                    disabled={!prev || prev.path === '#'}
                    className={`p-2 rounded-lg transition-colors ${
                        prev && prev.path !== '#'
                            ? 'text-[#487749] hover:bg-[#E8F5E9]'
                            : 'text-[#BDBDBD] cursor-not-allowed'
                    }`}
                    title={prev?.label || 'Previous'}
                    aria-label={`Previous: ${prev?.label || 'None'}`}
                >
                    <ChevronLeft className="w-5 h-5" />
                </button>

                <span className="text-sm text-[#757575] min-w-[60px] text-center">
                    {currentIndex + 1} / {navigableSiblings.length}
                </span>

                <button
                    onClick={() => next && next.path !== '#' && navigate(next.path)}
                    disabled={!next || next.path === '#'}
                    className={`p-2 rounded-lg transition-colors ${
                        next && next.path !== '#'
                            ? 'text-[#487749] hover:bg-[#E8F5E9]'
                            : 'text-[#BDBDBD] cursor-not-allowed'
                    }`}
                    title={next?.label || 'Next'}
                    aria-label={`Next: ${next?.label || 'None'}`}
                >
                    <ChevronRight className="w-5 h-5" />
                </button>
            </div>
        )
    }

    // Dropdown variant - shows all siblings in a dropdown
    if (variant === 'dropdown') {
        return (
            <div className={`relative ${className}`} ref={dropdownRef}>
                <button
                    onClick={() => setDropdownOpen(!dropdownOpen)}
                    className="flex items-center gap-2 px-3 py-2 text-sm text-[#487749] bg-[#E8F5E9] rounded-lg hover:bg-[#C8E6C9] transition-colors"
                    aria-expanded={dropdownOpen}
                    aria-haspopup="listbox"
                >
                    <span className="max-w-[200px] truncate">{current?.label || 'Select'}</span>
                    <ChevronDown className={`w-4 h-4 transition-transform ${dropdownOpen ? 'rotate-180' : ''}`} />
                </button>

                {dropdownOpen && (
                    <div
                        className="absolute z-50 mt-1 w-64 bg-white rounded-xl border border-[#E0E0E0] shadow-lg max-h-64 overflow-y-auto"
                        role="listbox"
                    >
                        {navigableSiblings.map((sibling) => (
                            <button
                                key={sibling.path}
                                onClick={() => {
                                    navigate(sibling.path)
                                    setDropdownOpen(false)
                                }}
                                className={`w-full px-4 py-2 text-left text-sm transition-colors ${
                                    sibling.path === currentPath
                                        ? 'bg-[#E8F5E9] text-[#487749] font-medium'
                                        : 'text-[#212121] hover:bg-[#F5F5F5]'
                                }`}
                                role="option"
                                aria-selected={sibling.path === currentPath}
                            >
                                {sibling.label}
                            </button>
                        ))}
                    </div>
                )}
            </div>
        )
    }

    // Tabs variant - shows horizontal tabs (for few siblings)
    if (variant === 'tabs') {
        return (
            <div
                className={`flex items-center gap-1 p-1 bg-[#F5F5F5] rounded-xl ${className}`}
                role="tablist"
            >
                {navigableSiblings.slice(0, 5).map((sibling) => (
                    <button
                        key={sibling.path}
                        onClick={() => navigate(sibling.path)}
                        className={`px-3 py-1.5 text-sm rounded-lg transition-colors ${
                            sibling.path === currentPath
                                ? 'bg-white text-[#487749] font-medium shadow-sm'
                                : 'text-[#757575] hover:text-[#487749]'
                        }`}
                        role="tab"
                        aria-selected={sibling.path === currentPath}
                    >
                        {sibling.label}
                    </button>
                ))}
                {navigableSiblings.length > 5 && (
                    <span className="px-2 text-sm text-[#757575]">
                        +{navigableSiblings.length - 5} more
                    </span>
                )}
            </div>
        )
    }

    return null
}
