import React from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import {
    MapPin,
    Building2,
    ClipboardList,
    Briefcase,
    TrendingUp,
    Layers,
    Boxes,
} from 'lucide-react'
import { BasicMastersTab } from './masters/BasicMastersTab'
import { AboutKvkMastersTab } from './masters/AboutKvkMastersTab'
import { AchievementsMastersTab } from './masters/AchievementsMastersTab'
import { ProjectsMastersTab } from './masters/ProjectsMastersTab'
import { PerformanceMastersTab } from './masters/PerformanceMastersTab'
import { MiscellaneousMastersTab } from './masters/MiscellaneousMastersTab'
import { OthersMastersTab } from './masters/OthersMastersTab'
import { SidebarLayout } from '../../components/common/SidebarLayout'

interface Tab {
    id: string
    label: string
    path: string
    icon: React.ReactNode
    component: React.ReactNode
}

// Tabs mirror the Form Management order:
// Basic → About KVK → Achievements → Projects → Performance Indicators → Miscellaneous → Others
const tabs: Tab[] = [
    {
        id: 'basic',
        label: 'Basic Masters',
        path: '/all-master/basic',
        icon: <MapPin className="w-4 h-4" />,
        component: <BasicMastersTab />,
    },
    {
        id: 'about-kvk',
        label: 'About KVK Master',
        path: '/all-master/about-kvk',
        icon: <Building2 className="w-4 h-4" />,
        component: <AboutKvkMastersTab />,
    },
    {
        id: 'achievements',
        label: 'Achievements Master',
        path: '/all-master/achievements',
        icon: <ClipboardList className="w-4 h-4" />,
        component: <AchievementsMastersTab />,
    },
    {
        id: 'projects',
        label: 'Projects Master',
        path: '/all-master/projects',
        icon: <Briefcase className="w-4 h-4" />,
        component: <ProjectsMastersTab />,
    },
    {
        id: 'performance',
        label: 'Performance Indicators Master',
        path: '/all-master/performance',
        icon: <TrendingUp className="w-4 h-4" />,
        component: <PerformanceMastersTab />,
    },
    {
        id: 'miscellaneous',
        label: 'Miscellaneous Master',
        path: '/all-master/miscellaneous',
        icon: <Layers className="w-4 h-4" />,
        component: <MiscellaneousMastersTab />,
    },
    {
        id: 'others',
        label: 'Others Master',
        path: '/all-master/others',
        icon: <Boxes className="w-4 h-4" />,
        component: <OthersMastersTab />,
    },
]

export const AllMasters: React.FC = () => {
    const navigate = useNavigate()
    const location = useLocation()
    const hasRedirectedRef = React.useRef(false)

    // /all-master-1 is the frozen backup tree; it shares this component but keeps
    // its own URL prefix. Normalize to /all-master for tab matching.
    const basePath = location.pathname.startsWith('/all-master-1')
        ? '/all-master-1'
        : '/all-master'

    // Redirect to first tab if on base route (guard to avoid maximum update depth)
    React.useEffect(() => {
        if (location.pathname !== basePath) {
            hasRedirectedRef.current = false
            return
        }
        if (hasRedirectedRef.current) return
        hasRedirectedRef.current = true
        navigate(`${basePath}/basic`, { replace: true })
    }, [location.pathname, navigate, basePath])

    // Determine active tab based on current route. Each individual master URL is
    // mapped to the form-aligned group it belongs to.
    const getActiveTab = (): string => {
        const currentPath = location.pathname.replace('/all-master-1', '/all-master')
        // Check for exact matches first
        const exactMatch = tabs.find(tab => currentPath === tab.path)
        if (exactMatch) return exactMatch.id

        const startsWithAny = (prefixes: string[]): boolean =>
            prefixes.some(p => currentPath.startsWith(p))

        // Basic Masters (org hierarchy)
        if (startsWithAny([
            '/all-master/zones',
            '/all-master/states',
            '/all-master/districts',
            '/all-master/organizations',
            '/all-master/universities',
            '/all-master/kvks',
        ])) {
            return 'basic'
        }

        // About KVK (employee, bank, infrastructure, land, assets)
        if (startsWithAny([
            '/all-master/staff-category',
            '/all-master/job-type',
            '/all-master/pay-level',
            '/all-master/pay-scale',
            '/all-master/sanctioned-post',
            '/all-master/discipline',
            '/all-master/bank-account-type',
            '/all-master/infrastructure-master',
            '/all-master/land-item-master',
            '/all-master/vehicle-type',
            '/all-master/equipment-type',
            '/all-master/equipment-master',
            '/all-master/vehicle-present-status',
            '/all-master/equipment-present-status',
        ])) {
            return 'about-kvk'
        }

        // Achievements (OFT, FLD, training, extension, product, soil water, celebration, publications)
        if (startsWithAny([
            '/all-master/oft',
            '/all-master/fld',
            '/all-master/training',
            '/all-master/extension-activity',
            '/all-master/other-extension-activity',
            '/all-master/product',
            '/all-master/soil-water-analysis',
            '/all-master/important-day',
            '/all-master/publication',
        ])) {
            return 'achievements'
        }

        // Projects (CFLD, CRA, ARYA, TSP/SCSP, natural farming, agri-drone, NARI, NICRA, budget)
        if (startsWithAny([
            '/all-master/cfld-crop',
            '/all-master/cra',
            '/all-master/arya-enterprise',
            '/all-master/tsp-scsp',
            '/all-master/natural-farming-activity',
            '/all-master/natural-farming-soil-parameter',
            '/all-master/agri-drone-demonstrations-on',
            '/all-master/nari',
            '/all-master/nicra',
            '/all-master/financial-project',
            '/all-master/budget-item-master',
        ])) {
            return 'projects'
        }

        // Performance Indicators
        if (startsWithAny([
            '/all-master/impact-specific-area',
            '/all-master/enterprise-type',
            '/all-master/account-type',
            '/all-master/programme-type',
        ])) {
            return 'performance'
        }

        // Miscellaneous
        if (startsWithAny([
            '/all-master/ppv-fra-training-type',
            '/all-master/dignitary-type',
        ])) {
            return 'miscellaneous'
        }

        // Others (calendar/context + funding source)
        if (startsWithAny([
            '/all-master/season',
            '/all-master/unit',
            '/all-master/crop-type',
            '/all-master/funding-source',
        ])) {
            return 'others'
        }

        return tabs[0].id
    }

    const activeTabData = tabs.find(tab => tab.id === getActiveTab()) || tabs[0]

    return (
        <SidebarLayout
            title="All Masters"
            description="Manage all master data including zones, states, organizations, OFT, FLD, training, extension, production, and publications"
            hideTabs={true}
        >
            {activeTabData.component}
        </SidebarLayout>
    )
}
