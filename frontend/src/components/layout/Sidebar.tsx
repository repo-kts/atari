import React, { useState, useEffect, useRef } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'
import {
    LayoutDashboard,
    LayoutList,
    FileText,
    Menu,
    X,
    ChevronDown,
    Users,
    Search,
    Settings,
    Bell,
    Image as ImageIcon,
    Target,
    History,
    FileBarChart,
    Database,
    Folder,
    ClipboardList,
    Building2,
    Briefcase,
    FileCheck,
    ChevronLeft,
    ChevronRight,
} from 'lucide-react'

interface MenuItem {
    label: string
    path: string
    icon: React.ReactNode
    /** Optional module code used for permission-based visibility (VIEW) */
    moduleCode?: string
    /** Optional: show if user has VIEW for any of these (for category-level items) */
    moduleCodes?: string[]
    children?: MenuItem[]
    dropdown?: boolean // If true, show children as dropdown in sidebar and hide tabs on page
    target?: string
}

// Super Admin menu items with dropdown support
const superAdminMenuItems: MenuItem[] = [
    {
        label: 'Dashboard',
        path: '/dashboard',
        icon: <LayoutDashboard className="w-5 h-5" />,
    },
    {
        label: 'Form Summary',
        path: '/form-summary',
        icon: <LayoutList className="w-5 h-5" />,
        moduleCode: 'form_summary_status',
    },
    {
        label: 'All Masters',
        path: '/all-master',
        icon: <Database className="w-5 h-5" />,
        dropdown: true,
        children: [
            {
                label: 'Basic Masters',
                path: '/all-master/basic',
                icon: <Folder className="w-4 h-4" />,
                moduleCodes: ['all_masters_zone_master', 'all_masters_states_master', 'all_masters_districts_master', 'all_masters_organization_master', 'all_masters_university_master', 'all_masters_kvks'],
            },
            {
                label: 'OFT & FLD Masters',
                path: '/all-master/oft-fld',
                icon: <Folder className="w-4 h-4" />,
                moduleCodes: ['all_masters_oft_master', 'all_masters_fld_master', 'all_masters_cfld_master'],
            },
            {
                label: 'Training & Extension Masters',
                path: '/all-master/training',
                icon: <Folder className="w-4 h-4" />,
                moduleCodes: ['all_masters_training_master', 'all_masters_extension_activity_master', 'all_masters_other_extension_activity_master', 'all_masters_events_master'],
            },
            {
                label: 'Production Masters',
                path: '/all-master/production-projects',
                icon: <Folder className="w-4 h-4" />,
                moduleCodes: ['all_masters_products_master', 'all_masters_agri_drone_master', 'all_masters_climate_master', 'all_masters_arya_master'],
            },
            {
                label: 'Publication Masters',
                path: '/all-master/publications',
                icon: <Folder className="w-4 h-4" />,
                moduleCodes: ['all_masters_publication_master'],
            },
            {
                label: 'Other Masters',
                path: '/all-master/other-masters',
                icon: <Folder className="w-4 h-4" />,
                moduleCodes: ['all_masters_season_master', 'all_masters_sanctioned_post_master', 'all_masters_staff_category_master', 'all_masters_pay_level_master', 'all_masters_pay_scale_master', 'all_masters_discipline_master', 'all_masters_crop_type_master', 'all_masters_infrastructure_master', 'all_masters_vehicle_present_status_master', 'all_masters_equipment_present_status_master', 'all_masters_events_master', 'all_masters_financial_project_master', 'all_masters_funding_agency_master'],
            },
        ],
    },
    {
        label: 'Role Management',
        path: '/role-view',
        icon: <Settings className="w-5 h-5" />,
        moduleCode: 'role_management_roles',
    },
    {
        label: 'User Management',
        path: '/view-users',
        icon: <Users className="w-5 h-5" />,
        moduleCode: 'user_management_users',
    },
    {
        label: 'Form Management',
        path: '/forms',
        icon: <FileText className="w-5 h-5" />,
        dropdown: true,
        children: [
            {
                label: 'About KVK',
                path: '/forms/about-kvk',
                icon: <Building2 className="w-4 h-4" />,
                moduleCodes: ['about_kvks_view_kvks', 'about_kvks_bank_account_details', 'about_kvks_employee_details', 'about_kvks_staff_details', 'about_kvks_infrastructure_details', 'about_kvks_vehicle_details', 'about_kvks_equipment_details', 'about_kvks_farm_implement_details'],
            },
            {
                label: 'Achievements',
                path: '/forms/achievements',
                icon: <ClipboardList className="w-4 h-4" />,
                moduleCodes: ['achievements_oft', 'achievements_fld', 'achievements_fld_extension_training', 'achievements_fld_technical_feedback', 'achievements_trainings', 'achievements_extension_activities', 'achievements_other_extension_activities', 'achievements_technology_week_celebration', 'achievements_celebration_days', 'achievements_production_supply_tech_products', 'achievements_soil_water_testing', 'achievements_projects', 'achievements_publications', 'achievements_award_recognition', 'achievements_hrd'],
            },
            {
                label: 'Projects',
                path: '/forms/achievements/projects',
                icon: <Briefcase className="w-4 h-4" />,
                moduleCodes: ['achievements_oft', 'achievements_fld', 'achievements_fld_extension_training', 'achievements_fld_technical_feedback', 'achievements_trainings', 'achievements_extension_activities', 'achievements_other_extension_activities', 'achievements_technology_week_celebration', 'achievements_celebration_days', 'achievements_production_supply_tech_products', 'achievements_soil_water_testing', 'achievements_projects', 'achievements_publications', 'achievements_award_recognition', 'achievements_hrd'],
                moduleCode: 'achievements_projects',
            },
            {
                label: 'Performance Indicators',
                path: '/forms/performance',
                icon: <FileCheck className="w-4 h-4" />,
                moduleCodes: ['performance_indicators_impact', 'performance_indicators_district_village', 'performance_indicators_infrastructure', 'performance_indicators_financial', 'performance_indicators_linkages'],
            },
            {
                label: 'Miscellaneous',
                path: '/forms/miscellaneous',
                icon: <FileCheck className="w-4 h-4" />,
                moduleCodes: ['misc_prevalent_diseases_crops', 'misc_prevalent_diseases_livestock', 'misc_nyk_training', 'misc_ppv_fra_training', 'misc_rawe_fet', 'misc_vip_visitors'],
            },
            {
                label: 'Digital Information',
                path: '/forms/digital-information',
                icon: <FileCheck className="w-4 h-4" />,
                moduleCodes: ['digital_mobile_app', 'digital_web_portal', 'digital_kisan_sarthi', 'digital_kisan_advisory', 'digital_messages_other_channels'],
            },
            {
                label: 'Swachhta Bharat Abhiyaan',
                path: '/forms/swachhta-bharat-abhiyaan',
                icon: <FileCheck className="w-4 h-4" />,
                moduleCodes: ['swachh_observation_sewa', 'swachh_pakhwada', 'swachh_budget_expenditure'],
            },
            {
                label: 'Meetings',
                path: '/forms/meetings',
                icon: <FileCheck className="w-4 h-4" />,
                moduleCodes: ['meetings_sac', 'meetings_other_atari'],
            },
        ],
    },
    {
        label: 'Module Images',
        path: '/module-images',
        icon: <ImageIcon className="w-5 h-5" />,
        moduleCode: 'module_images',
    },
    {
        label: 'Targets',
        path: '/targets',
        icon: <Target className="w-5 h-5" />,
        moduleCode: 'targets',
    },
    {
        label: 'Log History',
        path: '/view-log-history',
        icon: <History className="w-5 h-5" />,
        moduleCode: 'log_history',
    },
    {
        label: 'Notifications',
        path: '/view-email-notifications',
        icon: <Bell className="w-5 h-5" />,
        moduleCode: 'notifications',
    },
    {
        label: 'Reports',
        path: '/all-reports',
        icon: <FileBarChart className="w-5 h-5" />,
        moduleCode: 'reports',
    },
]

interface SidebarProps {
    isOpen: boolean
    onToggle: () => void
}

export const Sidebar: React.FC<SidebarProps> = ({ isOpen, onToggle }) => {
    const location = useLocation()
    const { user, hasPermission } = useAuth()
    const [expandedItems, setExpandedItems] = useState<string[]>([])
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
    const [searchQuery, setSearchQuery] = useState('')
    const [debouncedSearchQuery, setDebouncedSearchQuery] = useState('')
    const searchInputRef = useRef<HTMLInputElement>(null)

    // Check if form is open (create or edit mode)
    const isFormOpen = location.pathname.includes('/create') || location.pathname.includes('/edit/')

    // All roles use the full menu set — permission filtering (below) controls visibility
    // based on the Role Permission Editor assignments
    const rawMenuItems = React.useMemo(() => {
        const role = user?.role?.toLowerCase()
        const isKvkAdminRole = role === 'kvk_admin' || role === 'kvk_amdin'

        if (!isKvkAdminRole) return superAdminMenuItems

        return superAdminMenuItems.filter(item => item.path !== '/all-master')
    }, [user?.role])

    // Filter menu items based on VIEW permission where moduleCode is defined
    const menuItems = React.useMemo(() => {
        const filterList = (items: MenuItem[]): MenuItem[] => {
            const result: MenuItem[] = []

            for (const item of items) {
                let children: MenuItem[] | undefined
                if (item.children) {
                    children = filterList(item.children)
                }

                const hasViewForItem =
                    !item.moduleCode && !item.moduleCodes
                        ? true
                        : item.moduleCodes
                            ? item.moduleCodes.some((code) => hasPermission('VIEW', code))
                            : hasPermission('VIEW', item.moduleCode!)
                const hasVisibleChildren = !!children && children.length > 0

                if (item.children) {
                    // Parent / dropdown: only show if at least one child is visible.
                    // Never show an empty section header.
                    if (!hasVisibleChildren) continue
                } else {
                    // Leaf item: show only if the user has VIEW for this item.
                    if (!hasViewForItem) continue
                }

                result.push({ ...item, children })
            }

            return result
        }

        return filterList(rawMenuItems)
    }, [rawMenuItems, hasPermission])

    const menuItemsRef = useRef(menuItems)
    useEffect(() => {
        menuItemsRef.current = menuItems
    }, [menuItems])

    // Debounce search query
    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedSearchQuery(searchQuery)
        }, 300)
        return () => clearTimeout(timer)
    }, [searchQuery])

    // Filter menu items based on search
    const filteredMenuItems = React.useMemo(() => {
        if (!debouncedSearchQuery.trim()) return menuItems

        const query = debouncedSearchQuery.toLowerCase()

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

    // Auto-expand items based on active route or search query
    // Use menuItemsRef to avoid menuItems in deps (it can change ref on re-renders and cause infinite loop)
    useEffect(() => {
        const items = menuItemsRef.current
        const itemsToExpand: string[] = []

        // 1. Expand active section
        items.forEach(item => {
            const sectionActive =
                location.pathname === item.path ||
                location.pathname.startsWith(item.path + '/') ||
                !!item.children?.some(
                    child =>
                        location.pathname === child.path ||
                        location.pathname.startsWith(child.path + '/')
                )

            if (item.children && item.dropdown && sectionActive) {
                itemsToExpand.push(item.path)
            }
        })

        // 2. Expand search results
        if (debouncedSearchQuery.trim()) {
            const query = debouncedSearchQuery.toLowerCase()
            items.forEach(item => {
                if (item.children && item.dropdown) {
                    const hasMatchingChild = item.children.some(child =>
                        child.label.toLowerCase().includes(query) ||
                        child.path.toLowerCase().includes(query)
                    )
                    if (hasMatchingChild) {
                        itemsToExpand.push(item.path)
                    }
                }
            })
        }

        if (itemsToExpand.length > 0) {
            setExpandedItems(prev => {
                const newItems = [...new Set([...prev, ...itemsToExpand])]
                if (newItems.length === prev.length) return prev
                return newItems
            })
        }
    }, [location.pathname, debouncedSearchQuery])

    // Keyboard shortcut handler
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if ((e.ctrlKey || e.metaKey) && e.key === 'k' && isOpen) {
                e.preventDefault()
                searchInputRef.current?.focus()
            }
            if (e.key === 'Escape' && document.activeElement === searchInputRef.current) {
                setSearchQuery('')
                searchInputRef.current?.blur()
            }
        }

        window.addEventListener('keydown', handleKeyDown)
        return () => window.removeEventListener('keydown', handleKeyDown)
    }, [isOpen])

    // Highlight search matches
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

    // Mapping of route patterns to their parent dropdown paths
    const routeToParentMap: { pattern: RegExp; parentPath: string }[] = [
        { pattern: /^\/all-master\/(zones|states|organizations|universities|districts|kvks)/, parentPath: '/all-master/basic' },
        { pattern: /^\/all-master\/(oft|fld|cfld-crop)/, parentPath: '/all-master/oft-fld' },
        { pattern: /^\/all-master\/(training-type|training-area|training-thematic|training-clientele|funding-source|extension-activity|other-extension-activity|events|training-extension)/, parentPath: '/all-master/training' },
        { pattern: /^\/all-master\/(product-category|product-type|product|cra-croping-system|cra-farming-system|arya-enterprise|natural-farming-activity|natural-farming-soil-parameter|agri-drone-demonstrations-on)/, parentPath: '/all-master/production-projects' },
        { pattern: /^\/forms\/(about-kvk|achievements|success-stories)/, parentPath: '/forms' },
        { pattern: /^\/all-master\/(publications|publication-item)/, parentPath: '/all-master/publications' },
        { pattern: /^\/all-master\/(staff-category|pay-level|sanctioned-post|discipline|season|year|crop-type|infrastructure-master|vehicle-present-status|equipment-present-status|important-day|soil-water-analysis|nicra-category|nicra-sub-category|nicra-seed-bank-fodder-bank|nicra-dignitary-type|nicra-pi-type)/, parentPath: '/all-master/other-masters' },
        { pattern: /^\/all-master\/(nari-activity|nari-nutrition-garden-type|nari-crop-category)/, parentPath: '/all-master/other-masters' },
        { pattern: /^\/all-master\/(impact-specific-area|enterprise-type|account-type|programme-type|ppv-fra-training-type|dignitary-type|financial-project|funding-agency)/, parentPath: '/all-master/other-masters' },
    ]

    const getEffectiveParent = (pathname: string): string | null => {
        for (const mapping of routeToParentMap) {
            if (mapping.pattern.test(pathname)) {
                return mapping.parentPath
            }
        }
        return null
    }

    // Collect all menu paths (including children) for specificity check
    const allMenuPaths = React.useMemo(() => {
        const paths: string[] = []
        for (const item of menuItems) {
            paths.push(item.path)
            if (item.children) {
                for (const child of item.children) {
                    paths.push(child.path)
                }
            }
        }
        return paths
    }, [menuItems])

    const isActive = (path: string): boolean => {
        if (path === '#') return false
        if (location.pathname === path) return true
        if (location.pathname.startsWith(path + '/')) {
            // Check if a more specific menu path matches — if so, this shorter prefix is NOT active
            const hasMoreSpecificMatch = allMenuPaths.some(
                p => p !== path && p.length > path.length && p.startsWith(path + '/') &&
                    (location.pathname === p || location.pathname.startsWith(p + '/'))
            )
            if (hasMoreSpecificMatch) return false
            return true
        }
        const effectiveParent = getEffectiveParent(location.pathname)
        if (effectiveParent && path === effectiveParent) {
            return true
        }
        return false
    }

    const isSectionActive = (item: MenuItem): boolean => {
        if (isActive(item.path)) return true
        if (item.children) {
            if (item.children.some(child => isActive(child.path))) {
                return true
            }
            const effectiveParent = getEffectiveParent(location.pathname)
            if (effectiveParent && item.children.some(child => child.path === effectiveParent)) {
                return true
            }
        }
        return false
    }

    const toggleExpanded = (path: string) => {
        setExpandedItems(prev =>
            prev.includes(path) ? prev.filter(p => p !== path) : [...prev, path]
        )
    }

    return (
        <>
            {/* Hide hamburger menu when form is open */}
            {!isFormOpen && (
                <button
                    onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                    className={`lg:hidden fixed top-4 ${isMobileMenuOpen ? 'right-4' : 'left-4'} z-50 p-2 bg-white focus:outline-none focus:ring-2 focus:ring-[#487749] transition-all duration-200 rounded-xl`}
                    aria-label={isMobileMenuOpen ? 'Close menu' : 'Open menu'}
                    aria-expanded={isMobileMenuOpen}
                >
                    {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
                </button>
            )}

            {isMobileMenuOpen && (
                <div
                    className="lg:hidden fixed inset-0 bg-black/50 z-40 backdrop-blur-sm"
                    onClick={() => setIsMobileMenuOpen(false)}
                />
            )}

            <aside
                id="main-sidebar"
                className={`fixed top-0 left-0 h-screen bg-[#487749] z-40 transition-all duration-300 ${isOpen ? 'w-64' : 'w-16'
                    } ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
                    } overflow-hidden shadow-xl`}
                role="navigation"
                aria-label="Main navigation"
            >
                <div className="flex flex-col h-full">
                    <div className={`flex items-center ${isOpen ? 'justify-between px-4' : 'justify-center'} h-16 border-b border-white/10`}>
                        {isOpen && (
                            <h2 className="text-lg font-bold text-white tracking-wide">
                                ATARI Zone IV
                            </h2>
                        )}
                        <button
                            onClick={onToggle}
                            className="hidden lg:flex p-2 rounded-lg transition-all duration-200 hover:bg-white/10 text-white/80 hover:text-white"
                            aria-label={isOpen ? 'Collapse sidebar' : 'Expand sidebar'}
                        >
                            {isOpen ? <ChevronLeft className="w-5 h-5" /> : <ChevronRight className="w-5 h-5" />}
                        </button>
                    </div>

                    {isOpen && (
                        <div className="p-3 border-b border-white/10">
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/50" />
                                <input
                                    ref={searchInputRef}
                                    type="text"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    placeholder="Search... (Ctrl+K)"
                                    className="w-full pl-9 pr-9 py-2.5 text-sm rounded-lg bg-white/10 border border-white/10 text-white placeholder-white/50 focus:bg-white/15 focus:border-white/20 focus:outline-none transition-all duration-200"
                                    aria-label="Search menu"
                                />
                                {searchQuery && (
                                    <button
                                        onClick={() => {
                                            setSearchQuery('')
                                            searchInputRef.current?.focus()
                                        }}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 p-0.5 rounded hover:bg-white/10 text-white/50 hover:text-white/80"
                                        aria-label="Clear search"
                                    >
                                        <X className="w-3.5 h-3.5" />
                                    </button>
                                )}
                            </div>
                        </div>
                    )}

                    {isOpen && (
                        <div className="px-4 pt-4 pb-2">
                            <span className="text-[10px] font-semibold uppercase tracking-widest text-white/40">
                                Navigation
                            </span>
                        </div>
                    )}

                    <nav className="flex-1 overflow-y-auto py-1 scrollbar-thin scrollbar-thumb-white/20 scrollbar-track-transparent hover:scrollbar-thumb-white/30" role="menu">
                        {filteredMenuItems.length > 0 ? (
                            filteredMenuItems.map(item => (
                                <SidebarItem
                                    key={item.path}
                                    item={item}
                                    isOpen={isOpen}
                                    isActive={isActive}
                                    isSectionActive={isSectionActive}
                                    isExpanded={expandedItems.includes(item.path)}
                                    onToggleExpand={toggleExpanded}
                                    searchQuery={debouncedSearchQuery}
                                    highlightMatch={highlightMatch}
                                    onMobileClose={() => setIsMobileMenuOpen(false)}
                                />
                            ))
                        ) : (
                            <div className="px-4 py-8 text-center text-white/50">
                                <p className="text-sm">No items found</p>
                            </div>
                        )}
                    </nav>
                </div>
            </aside>
        </>
    )
}

// Separate components to handle their own state (fixes hook violation)
const SidebarDropdownItem: React.FC<{
    item: MenuItem
    isOpen: boolean
    isExpanded: boolean
    isActive: (path: string) => boolean
    isSectionActive: (item: MenuItem) => boolean
    onToggleExpand: (path: string) => void
    searchQuery: string
    highlightMatch: (text: string, query: string) => React.ReactNode
    onMobileClose: () => void
}> = ({ item, isOpen, isExpanded, isActive, isSectionActive, onToggleExpand, searchQuery, highlightMatch, onMobileClose }) => {
    const [isHovered, setIsHovered] = useState(false)
    const sectionActive = isSectionActive(item)

    // Filter children if searching
    const displayedChildren = React.useMemo(() => {
        if (!searchQuery.trim()) return item.children
        const query = searchQuery.toLowerCase()
        return item.children?.filter(child =>
            child.label.toLowerCase().includes(query) ||
            child.path.toLowerCase().includes(query)
        )
    }, [item.children, searchQuery])

    return (
        <div
            className="mx-2 my-1"
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
        >
            <div
                className={`rounded-xl transition-all duration-300 ${sectionActive
                    ? 'bg-[#3d6540]'
                    : isHovered ? 'bg-white/5' : isExpanded ? 'bg-white/5' : ''
                    }`}
            >
                <button
                    onClick={() => onToggleExpand(item.path)}
                    className={`w-full flex items-center justify-between px-3 py-2.5 rounded-t-xl transition-all duration-200 ${sectionActive
                        ? 'text-white font-medium'
                        : 'text-white/85 hover:text-white'
                        } ${isExpanded ? '' : 'rounded-b-xl'}`}
                    aria-expanded={isExpanded}
                >
                    <div className={`flex items-center ${isOpen ? 'gap-3' : 'justify-center w-full'}`}>
                        {item.icon && <span className="shrink-0">{item.icon}</span>}
                        {isOpen && (
                            <span className="text-sm font-medium truncate">
                                {searchQuery ? highlightMatch(item.label, searchQuery) : item.label}
                            </span>
                        )}
                    </div>
                    {isOpen && (
                        <ChevronDown
                            className={`w-4 h-4 transition-transform duration-300 ${isExpanded ? 'rotate-180' : ''}`}
                        />
                    )}
                </button>

                {isOpen && (
                    <div
                        className={`overflow-hidden transition-all duration-300 ease-out ${isExpanded ? 'max-h-[500px] opacity-100' : 'max-h-0 opacity-0'
                            }`}
                    >
                        <div className="px-2 pb-2 pt-1 space-y-1">
                            {displayedChildren?.map(child => {
                                const childActive = isActive(child.path)
                                return (
                                    <Link
                                        key={child.path}
                                        to={child.path}
                                        target={child.target}
                                        onClick={() => onMobileClose()}
                                        className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-all duration-200 ${childActive
                                            ? 'bg-white text-[#2d4a2f] font-semibold shadow-sm'
                                            : 'text-white/85 hover:bg-white/10 hover:text-white'
                                            }`}
                                    >
                                        {child.icon && (
                                            <span className={`shrink-0 ${childActive ? 'text-[#3d6540]' : ''}`}>
                                                {child.icon}
                                            </span>
                                        )}
                                        <span className="text-sm truncate">
                                            {searchQuery ? highlightMatch(child.label, searchQuery) : child.label}
                                        </span>
                                    </Link>
                                )
                            })}
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}

const SidebarItem: React.FC<{
    item: MenuItem
    isOpen: boolean
    isActive: (path: string) => boolean
    isSectionActive: (item: MenuItem) => boolean
    isExpanded: boolean
    onToggleExpand: (path: string) => void
    searchQuery: string
    highlightMatch: (text: string, query: string) => React.ReactNode
    onMobileClose: () => void
}> = (props) => {
    if (props.item.children && props.item.dropdown) {
        return <SidebarDropdownItem {...props} />
    }

    const active = props.isActive(props.item.path)

    return (
        <div className="mx-2 my-0.5">
            <Link
                to={props.item.path}
                target={props.item.target}
                onClick={props.onMobileClose}
                className={`flex items-center px-3 py-2.5 rounded-xl transition-all duration-200 ${active
                    ? 'bg-[#3d6540] text-white font-medium'
                    : 'text-white/80 hover:bg-white/10 hover:text-white'
                    }`}
                aria-current={active ? 'page' : undefined}
            >
                <div className={`flex items-center ${props.isOpen ? 'gap-3' : 'justify-center w-full'}`}>
                    {props.item.icon && <span className="shrink-0 opacity-90">{props.item.icon}</span>}
                    {props.isOpen && (
                        <span className="text-sm truncate">
                            {props.searchQuery ? props.highlightMatch(props.item.label, props.searchQuery) : props.item.label}
                        </span>
                    )}
                </div>
            </Link>
        </div>
    )
}
