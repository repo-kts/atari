import React from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import {
    MapPin,
    TestTube,
    GraduationCap,
    Package,
    BookOpen,
    Calendar,
} from 'lucide-react'
import { BasicMastersTab } from './masters/BasicMastersTab'
import { OFTFLDTab } from './masters/OFTFLDTab'
import { TrainingExtensionTab } from './masters/TrainingExtensionTab'
import { ProductionProjectsTab } from './masters/ProductionProjectsTab'
import { PublicationsTab } from './masters/PublicationsTab'
import { OtherMastersTab } from './masters/OtherMastersTab'
import { SidebarLayout } from '../../components/common/SidebarLayout'

interface Tab {
    id: string
    label: string
    path: string
    icon: React.ReactNode
    component: React.ReactNode
}

const tabs: Tab[] = [
    {
        id: 'basic',
        label: 'Basic Masters',
        path: '/all-master/basic',
        icon: <MapPin className="w-4 h-4" />,
        component: <BasicMastersTab />,
    },
    {
        id: 'oft-fld',
        label: 'OFT & FLD Masters',
        path: '/all-master/oft-fld',
        icon: <TestTube className="w-4 h-4" />,
        component: <OFTFLDTab />,
    },
    {
        id: 'training-extension',
        label: 'Training & Extension',
        path: '/all-master/training-extension',
        icon: <GraduationCap className="w-4 h-4" />,
        component: <TrainingExtensionTab />,
    },
    {
        id: 'production-projects',
        label: 'Production & Projects',
        path: '/all-master/production-projects',
        icon: <Package className="w-4 h-4" />,
        component: <ProductionProjectsTab />,
    },
    {
        id: 'publications',
        label: 'Publications',
        path: '/all-master/publications',
        icon: <BookOpen className="w-4 h-4" />,
        component: <PublicationsTab />,
    },
    {
        id: 'other-masters',
        label: 'Other Masters',
        path: '/all-master/other-masters',
        icon: <Calendar className="w-4 h-4" />,
        component: <OtherMastersTab />,
    },
]

export const AllMasters: React.FC = () => {
    const navigate = useNavigate()
    const location = useLocation()
    const hasRedirectedRef = React.useRef(false)

    // Redirect to first tab if on base /all-master route (guard to avoid maximum update depth)
    React.useEffect(() => {
        if (location.pathname !== '/all-master') {
            hasRedirectedRef.current = false
            return
        }
        if (hasRedirectedRef.current) return
        hasRedirectedRef.current = true
        navigate(tabs[0].path, { replace: true })
    }, [location.pathname, navigate])

    // Determine active tab based on current route
    const getActiveTab = (): string => {
        const currentPath = location.pathname
        // Check for exact matches first
        const exactMatch = tabs.find(tab => currentPath === tab.path)
        if (exactMatch) return exactMatch.id

        // Check for path prefixes to match sub-routes
        if (currentPath.startsWith('/all-master/zones') ||
            currentPath.startsWith('/all-master/states') ||
            currentPath.startsWith('/all-master/organizations') ||
            currentPath.startsWith('/all-master/districts')) {
            return 'basic'
        }
        if (currentPath.startsWith('/all-master/oft') ||
            currentPath.startsWith('/all-master/fld') ||
            currentPath.startsWith('/all-master/cfld-crop')) {
            return 'oft-fld'
        }
        if (currentPath.startsWith('/all-master/season') ||
            currentPath.startsWith('/all-master/sanctioned-post') ||
            currentPath.startsWith('/all-master/year') ||
            currentPath.startsWith('/all-master/other-masters')) {
            return 'other-masters'
        }
        if (currentPath.startsWith('/all-master/training') ||
            currentPath.startsWith('/all-master/extension-activity') ||
            currentPath.startsWith('/all-master/other-extension-activity') ||
            currentPath.startsWith('/all-master/events')) {
            return 'training-extension'
        }
        if (currentPath.startsWith('/all-master/product') ||
            currentPath.startsWith('/all-master/cra') ||
            currentPath.startsWith('/all-master/arya-enterprise')) {
            return 'production-projects'
        }
        if (currentPath.startsWith('/all-master/publication')) {
            return 'publications'
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
