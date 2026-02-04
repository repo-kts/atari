import React, { useState, useEffect, useRef } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useAuthStore } from '../../stores/authStore'
import {
    LayoutDashboard,
    FileText,
    ChevronLeft,
    ChevronRight,
    Menu,
    X,
    ChevronDown,
    LogOut,
    Users,
    Search,
    Settings,
    Bell,
    Image as ImageIcon,
    Target,
    History,
    FileBarChart,
} from 'lucide-react'

interface MenuItem {
    label: string
    path: string
    icon: React.ReactNode
    children?: MenuItem[]
}

// Super Admin menu items - Optimized and flattened structure
const superAdminMenuItems: MenuItem[] = [
    {
        label: 'Dashboard',
        path: '/dashboard',
        icon: <LayoutDashboard className="w-5 h-5" />,
    },
    {
        label: 'All Masters',
        path: '/all-master',
        icon: <Users className="w-5 h-5" />,
    },
    {
        label: 'Role Management',
        path: '/role-view',
        icon: <Settings className="w-5 h-5" />,
    },
    {
        label: 'User Management',
        path: '/view-users',
        icon: <Users className="w-5 h-5" />,
    },
    {
        label: 'Form Management',
        path: '/forms',
        icon: <FileText className="w-5 h-5" />,
    },
    {
        label: 'Module Images',
        path: '/module-images',
        icon: <ImageIcon className="w-5 h-5" />,
    },
    {
        label: 'Targets',
        path: '/targets',
        icon: <Target className="w-5 h-5" />,
    },
    {
        label: 'Log History',
        path: '/view-log-history',
        icon: <History className="w-5 h-5" />,
    },
    {
        label: 'Notifications',
        path: '/view-email-notifications',
        icon: <Bell className="w-5 h-5" />,
    },
    {
        label: 'Reports',
        path: '/all-reports',
        icon: <FileBarChart className="w-5 h-5" />,
    },
]

// Regular menu items for non-admin roles
const regularMenuItems: MenuItem[] = [
    {
        label: 'Dashboard',
        path: '/dashboard',
        icon: <LayoutDashboard className="w-5 h-5" />,
    },
    {
        label: 'Form Management',
        path: '/forms',
        icon: <FileText className="w-5 h-5" />,
    },
]

interface SidebarProps {
    isOpen: boolean
    onToggle: () => void
}

export const Sidebar: React.FC<SidebarProps> = ({ isOpen, onToggle }) => {
    const location = useLocation()
    const navigate = useNavigate()
    const { user, logout } = useAuthStore()
    const [expandedItems, setExpandedItems] = useState<string[]>([])
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
    const [searchQuery, setSearchQuery] = useState('')
    const [debouncedSearchQuery, setDebouncedSearchQuery] = useState('')
    const searchInputRef = useRef<HTMLInputElement>(null)

    // Roles that get admin UI (Create User, Role Management, User Management)
    const adminRoles = ['super_admin', 'zone_admin', 'state_admin', 'district_admin', 'org_admin', 'kvk']
    const isAdmin = user?.role && adminRoles.includes(user.role)

    // Admins get full admin menu; others get regular menu
    const menuItems = isAdmin ? superAdminMenuItems : regularMenuItems

    // Debounce search query
    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedSearchQuery(searchQuery)
        }, 300)
        return () => clearTimeout(timer)
    }, [searchQuery])

    // Filter menu items based on debounced search query with fuzzy matching
    const filteredMenuItems = React.useMemo(() => {
        if (!debouncedSearchQuery.trim()) return menuItems

        const query = debouncedSearchQuery.toLowerCase()

        // Simple fuzzy matching: checks if all characters in query appear in order
        const fuzzyMatch = (text: string, pattern: string): boolean => {
            let patternIdx = 0
            for (let i = 0; i < text.length && patternIdx < pattern.length; i++) {
                if (text[i] === pattern[patternIdx]) {
                    patternIdx++
                }
            }
            return patternIdx === pattern.length
        }

        return menuItems.filter(item => {
            const matchesItem =
                item.label.toLowerCase().includes(query) ||
                item.path.toLowerCase().includes(query) ||
                fuzzyMatch(item.label.toLowerCase(), query)

            if (matchesItem) return true

            // Check children if any
            if (item.children) {
                return item.children.some(child =>
                    child.label.toLowerCase().includes(query) ||
                    child.path.toLowerCase().includes(query) ||
                    fuzzyMatch(child.label.toLowerCase(), query)
                )
            }
            return false
        })
    }, [menuItems, debouncedSearchQuery])

    // Keyboard shortcut handler (Ctrl/Cmd + K)
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if ((e.ctrlKey || e.metaKey) && e.key === 'k' && isOpen) {
                e.preventDefault()
                searchInputRef.current?.focus()
            }
            // Escape to clear search
            if (e.key === 'Escape' && document.activeElement === searchInputRef.current) {
                setSearchQuery('')
                searchInputRef.current?.blur()
            }
        }

        window.addEventListener('keydown', handleKeyDown)
        return () => window.removeEventListener('keydown', handleKeyDown)
    }, [isOpen])

    // Highlight search matches in text
    const highlightMatch = (text: string, query: string): React.ReactNode => {
        if (!query.trim()) return text

        const lowerText = text.toLowerCase()
        const lowerQuery = query.toLowerCase()
        const index = lowerText.indexOf(lowerQuery)

        if (index === -1) return text

        return (
            <>
                {text.substring(0, index)}
                <mark className="bg-white/30 text-white px-0.5 rounded">
                    {text.substring(index, index + query.length)}
                </mark>
                {text.substring(index + query.length)}
            </>
        )
    }

    // Helper function to build unique path for menu items
    const buildUniquePath = (item: MenuItem, parentPath: string = ''): string => {
        return parentPath ? `${parentPath}::${item.path}::${item.label}` : `${item.path}::${item.label}`
    }

    // Auto-expand parent items when child route is active
    useEffect(() => {
        // Helper function to find parent unique paths for a given route
        const findParentPaths = (
            items: MenuItem[],
            targetPath: string,
            parents: string[] = [],
            parentUniquePath: string = ''
        ): string[] => {
            for (const item of items) {
                const currentUniquePath = buildUniquePath(item, parentUniquePath)
                if (item.path === targetPath || targetPath.startsWith(item.path + '/')) {
                    return parents // Return all parent paths
                }
                if (item.children) {
                    const found = findParentPaths(
                        item.children,
                        targetPath,
                        [...parents, currentUniquePath],
                        currentUniquePath
                    )
                    if (found.length > 0) {
                        return found
                    }
                }
            }
            return []
        }

        const parentPaths = findParentPaths(menuItems, location.pathname)
        if (parentPaths.length > 0) {
            setExpandedItems(prev => {
                const newExpanded = [...new Set([...prev, ...parentPaths])]
                // Only update if there are new paths to add
                if (newExpanded.length === prev.length &&
                    newExpanded.every(path => prev.includes(path))) {
                    return prev
                }
                return newExpanded
            })
        }
    }, [location.pathname, menuItems])

    const handleLogout = () => {
        logout()
        navigate('/login')
        setIsMobileMenuOpen(false)
    }

    const toggleExpanded = (path: string) => {
        setExpandedItems(prev =>
            prev.includes(path) ? prev.filter(p => p !== path) : [...prev, path]
        )
    }

    const isActive = (path: string) => {
        if (path === '#') return false
        // Special handling for /all-master to highlight when any sub-route is active
        if (path === '/all-master') {
            return location.pathname.startsWith('/all-master')
        }
        // Special handling for /forms to highlight when any form route is active
        if (path === '/forms') {
            return location.pathname.startsWith('/forms')
        }
        return (
            location.pathname === path ||
            location.pathname.startsWith(path + '/')
        )
    }

    const renderMenuItem = (
        item: MenuItem,
        level: number = 0,
        parentPath: string = ''
    ) => {
        const hasChildren = item.children && item.children.length > 0
        // Use unique path for expansion tracking to avoid conflicts
        const uniquePath = parentPath ? `${parentPath}::${item.path}::${item.label}` : `${item.path}::${item.label}`
        const isExpanded = expandedItems.includes(uniquePath)
        const active = isActive(item.path)

        // For super admin, check if any child is active to highlight parent
        const hasActiveChild = hasChildren && item.children?.some(child => {
            if (child.path !== '#') {
                return isActive(child.path)
            }
            // Recursively check nested children
            return child.children?.some(nestedChild => isActive(nestedChild.path))
        })
        const isItemActive = active || hasActiveChild

        // Unified green theme styling for all roles
        const getItemStyles = () => {
            if (level === 0) {
                // Top level items
                return isItemActive
                    ? 'bg-[#3d6540] text-white border-2 border-black/5 shadow-sm'
                    : 'text-white/80 hover:bg-[#3d6540] hover:text-white'
            } else {
                // Nested items
                return isItemActive
                    ? 'bg-[#3d6540]/50 text-white'
                    : 'text-white/70 hover:bg-[#3d6540] hover:text-white'
            }
        }

        // Calculate indentation for nested items with better spacing
        const indentClass = level > 0 ? `ml-${Math.min(level * 3, 12)}` : ''
        const paddingClass = isOpen
            ? (level === 0 ? 'px-3' : level === 1 ? 'px-3 pl-6' : 'px-3 pl-9')
            : 'px-0 justify-center'

        return (
            <div key={uniquePath} className={`${indentClass} transition-all duration-200`}>
                {hasChildren ? (
                    <>
                        <div className="flex items-center group">
                            {item.path !== '#' ? (
                                <Link
                                    to={item.path}
                                    onClick={() => setIsMobileMenuOpen(false)}
                                    onMouseDown={(e) => e.preventDefault()}
                                    data-menu-item
                                    tabIndex={debouncedSearchQuery ? 0 : -1}
                                    className={`flex-1 flex items-center ${isOpen ? 'gap-2.5' : 'justify-center'} ${paddingClass} py-2.5 mx-1 rounded-xl transition-all duration-200 ${getItemStyles()} ${isItemActive ? 'font-medium' : ''} ${
                                        level > 0 ? 'text-sm' : ''
                                    } outline-none focus:outline-none active:outline-none`}
                                    aria-label={`Navigate to ${item.label}`}
                                    aria-current={isItemActive ? 'page' : undefined}
                                    onKeyDown={(e) => {
                                        if (e.key === 'Enter' || e.key === ' ') {
                                            e.preventDefault()
                                            navigate(item.path)
                                            setIsMobileMenuOpen(false)
                                        }
                                    }}
                                >
                                    {item.icon && (
                                        <span className={`shrink-0 flex items-center justify-center ${level > 0 ? 'w-4 h-4' : 'w-5 h-5'}`}>
                                            {item.icon}
                                        </span>
                                    )}
                                    {isOpen && (
                                        <span className={`${level > 0 ? 'text-sm' : 'text-sm'} truncate`}>
                                            {debouncedSearchQuery ? highlightMatch(item.label, debouncedSearchQuery) : item.label}
                                        </span>
                                    )}
                                </Link>
                            ) : (
                                <div className={`flex-1 flex items-center ${isOpen ? 'gap-2.5' : 'justify-center'} ${paddingClass} py-2 mx-1 rounded-md transition-all duration-200 ${getItemStyles()} ${
                                    level > 0 ? 'text-sm' : ''
                                }`}>
                                    {item.icon && (
                                        <span className={`shrink-0 flex items-center justify-center ${level > 0 ? 'w-4 h-4' : 'w-5 h-5'}`}>
                                            {item.icon}
                                        </span>
                                    )}
                                    {isOpen && (
                                        <span className={`${level > 0 ? 'text-sm' : 'text-sm'} truncate`}>
                                            {debouncedSearchQuery ? highlightMatch(item.label, debouncedSearchQuery) : item.label}
                                        </span>
                                    )}
                                </div>
                            )}
                            <button
                                onClick={(e) => {
                                    e.stopPropagation()
                                    toggleExpanded(uniquePath)
                                }}
                                onMouseDown={(e) => e.preventDefault()}
                                className={`px-1.5 py-2 rounded-xl transition-all duration-200 ${getItemStyles()} hover:opacity-80 outline-none focus:outline-none active:outline-none`}
                                aria-label={`${isExpanded ? 'Collapse' : 'Expand'} ${item.label}`}
                                aria-expanded={isExpanded}
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter' || e.key === ' ') {
                                        e.preventDefault()
                                        toggleExpanded(uniquePath)
                                    }
                                }}
                            >
                                {isOpen && (
                                    <span className="transition-transform duration-200 inline-block">
                                        {isExpanded ? (
                                            <ChevronDown className="w-4 h-4" />
                                        ) : (
                                            <ChevronRight className="w-4 h-4" />
                                        )}
                                    </span>
                                )}
                            </button>
                        </div>
                        {isOpen && (
                            <div
                                className={`overflow-hidden transition-all duration-300 ease-in-out ${
                                    isExpanded ? 'max-h-[1000px] opacity-100' : 'max-h-0 opacity-0'
                                }`}
                            >
                                <div className="mt-1 space-y-0.5">
                                    {item.children?.map((child) =>
                                        renderMenuItem(child, level + 1, uniquePath)
                                    )}
                                </div>
                            </div>
                        )}
                    </>
                ) : (
                    <Link
                        to={item.path}
                        onClick={() => setIsMobileMenuOpen(false)}
                        onMouseDown={(e) => e.preventDefault()}
                        data-menu-item
                        tabIndex={debouncedSearchQuery ? 0 : -1}
                        className={`flex items-center ${isOpen ? 'gap-2.5' : 'justify-center'} ${paddingClass} py-2.5 mx-1 rounded-xl transition-all duration-200 ${getItemStyles()} ${isItemActive ? 'font-medium' : ''} ${
                            level > 0 ? 'text-sm' : ''
                        } outline-none focus:outline-none active:outline-none`}
                        aria-label={`Navigate to ${item.label}`}
                        aria-current={isItemActive ? 'page' : undefined}
                        onKeyDown={(e) => {
                            if (e.key === 'Enter' || e.key === ' ') {
                                e.preventDefault()
                                navigate(item.path)
                                setIsMobileMenuOpen(false)
                            }
                        }}
                    >
                        {item.icon && (
                            <span className={`shrink-0 flex items-center justify-center ${level > 0 ? 'w-4 h-4' : 'w-5 h-5'}`}>
                                {item.icon}
                            </span>
                        )}
                        {isOpen && (
                            <span className={`${level > 0 ? 'text-sm' : 'text-sm'} truncate`}>
                                {debouncedSearchQuery ? highlightMatch(item.label, debouncedSearchQuery) : item.label}
                            </span>
                        )}
                    </Link>
                )}
            </div>
        )
    }

    return (
        <>
            {/* Mobile Menu Button */}
            <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="lg:hidden fixed top-4 left-4 z-50 p-2 bg-white rounded-xl shadow-md border border-[#E0E0E0] focus:outline-none focus:ring-2 focus:ring-[#487749] transition-all duration-200"
                aria-label={isMobileMenuOpen ? 'Close menu' : 'Open menu'}
                aria-expanded={isMobileMenuOpen}
                aria-controls="main-sidebar"
            >
                {isMobileMenuOpen ? (
                    <X className="w-6 h-6" />
                ) : (
                    <Menu className="w-6 h-6" />
                )}
            </button>

            {/* Mobile Overlay */}
            {isMobileMenuOpen && (
                <div
                    className="lg:hidden fixed inset-0 bg-black bg-opacity-50 z-40"
                    onClick={() => setIsMobileMenuOpen(false)}
                />
            )}

            {/* Sidebar */}
            <aside
                id="main-sidebar"
                className={`fixed top-0 left-0 h-screen bg-[#487749] border-r border-[#3d6540] z-40 transition-all duration-300 ${
                    isOpen ? 'w-64' : 'w-16'
                } ${
                    isMobileMenuOpen
                        ? 'translate-x-0'
                        : '-translate-x-full lg:translate-x-0'
                } overflow-y-auto shadow-sm`}
                role="navigation"
                aria-label="Main navigation"
                style={{ height: '100vh' }}
            >
                <div className="flex flex-col h-screen">
                    {/* Header */}
                    <div className={`flex items-center ${isOpen ? 'justify-between px-4' : 'justify-center px-0'} h-16 border-b border-[#3d6540]`}>
                        {isOpen && (
                            <h2 className="text-lg font-semibold text-white">
                                ATARI Zone IV
                            </h2>
                        )}
                        <button
                            onClick={onToggle}
                            onMouseDown={(e) => e.preventDefault()}
                            className="hidden lg:flex p-1.5 rounded-xl transition-all duration-200 outline-none focus:outline-none active:outline-none hover:bg-[#3d6540] text-white/80"
                            aria-label={isOpen ? 'Collapse sidebar' : 'Expand sidebar'}
                            aria-expanded={isOpen}
                        >
                            {isOpen ? (
                                <ChevronLeft className="w-5 h-5" />
                            ) : (
                                <ChevronRight className="w-5 h-5" />
                            )}
                        </button>
                    </div>

                    {/* Search Menu - Enhanced with icon and keyboard shortcut hint */}
                    {isOpen && (
                        <div className="p-3 border-b border-[#3d6540]">
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-white/60" />
                                <input
                                    ref={searchInputRef}
                                    type="text"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    placeholder="Search menu... (Ctrl+K)"
                                    className="w-full pl-9 pr-9 py-2.5 text-sm rounded-xl border-2 transition-all duration-200 bg-[#3d6540] border-black/5 text-white placeholder-white/50 focus:ring-2 focus:ring-white/30 focus:border-white/30 focus:outline-none"
                                    aria-label="Search menu items"
                                    aria-describedby="search-help-text"
                                    role="searchbox"
                                    onKeyDown={(e) => {
                                        if (e.key === 'Escape') {
                                            setSearchQuery('')
                                            searchInputRef.current?.blur()
                                        }
                                        // Arrow down to navigate to first result
                                        if (e.key === 'ArrowDown' && filteredMenuItems.length > 0) {
                                            e.preventDefault()
                                            const firstMenuItem = document.querySelector('[data-menu-item]') as HTMLElement
                                            firstMenuItem?.focus()
                                        }
                                    }}
                                />
                                <span id="search-help-text" className="sr-only">
                                    Search menu items by name. Use arrow keys to navigate results, Enter to select, Escape to clear.
                                </span>
                                {searchQuery && (
                                    <button
                                        onClick={() => {
                                            setSearchQuery('')
                                            searchInputRef.current?.focus()
                                        }}
                                        className="absolute right-3 top-1/2 transform -translate-y-1/2 p-1 rounded-xl hover:bg-[#2d4d30] text-white/70 transition-all duration-200"
                                        aria-label="Clear search"
                                    >
                                        <X className="w-4 h-4" />
                                    </button>
                                )}
                            </div>
                        </div>
                    )}

                    {/* MENU Label */}
                    {isOpen && (
                        <div className="px-3 pt-3 pb-2">
                            <span className="text-white/60 text-xs font-semibold uppercase tracking-wider">Navigation</span>
                        </div>
                    )}

                    {/* Menu Items */}
                    <nav className="flex-1 overflow-y-auto p-2 space-y-0.5" role="menu" aria-label="Navigation menu">
                        {filteredMenuItems.length > 0 ? (
                            filteredMenuItems.map((item) => (
                                <div key={`${item.path}-${item.label}`}>
                                    {renderMenuItem(item)}
                                </div>
                            ))
                        ) : (
                                <div className="px-4 py-8 text-center text-white/60">
                                <p className="text-sm">No menu items found</p>
                                <p className="text-xs mt-1">Try a different search term</p>
                            </div>
                        )}
                    </nav>

                    {/* Logout Button - Always visible at bottom */}
                        {user && (
                        <div className="p-3 border-t border-[#3d6540]">
                                {isOpen && user && (
                                <div className="mb-3 px-1 text-xs text-white/70">
                                    <p className="font-medium text-white">{user.name}</p>
                                    <p className="text-white/70">
                                        {user.role === 'super_admin'
                                            ? 'ATARI Super Admin'
                                            : ['zone_admin', 'state_admin', 'district_admin', 'org_admin'].includes(user.role)
                                            ? 'Admin'
                                            : user.role === 'kvk'
                                            ? 'KVK User'
                                            : 'User'}
                                    </p>
                                </div>
                            )}
                            <button
                                onClick={handleLogout}
                                onMouseDown={(e) => e.preventDefault()}
                                className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl border-2 transition-all duration-200 outline-none focus:outline-none active:outline-none text-white bg-[#3d6540] border-black/5 hover:bg-[#2d4d30]"
                                aria-label="Logout"
                            >
                                <LogOut className="w-4 h-4 shrink-0" />
                                {isOpen && (
                                    <span className="text-sm font-medium">
                                        Logout
                                    </span>
                                )}
                            </button>
                        </div>
                    )}
                </div>
            </aside>
        </>
    )
}
