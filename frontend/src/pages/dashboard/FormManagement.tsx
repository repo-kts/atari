import React from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import {
    Building2,
    Trophy,
    BarChart3,
    FolderTree,
} from 'lucide-react'
import { AboutKVKTab } from './forms/AboutKVKTab'
import { AchievementsTab } from './forms/AchievementsTab'
import { PerformanceTab } from './forms/PerformanceTab'
import { MiscellaneousTab } from './forms/MiscellaneousTab'
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
        id: 'about-kvk',
        label: 'About KVK',
        path: '/forms/about-kvk',
        icon: <Building2 className="w-4 h-4" />,
        component: <AboutKVKTab />,
    },
    {
        id: 'achievements',
        label: 'Achievements',
        path: '/forms/achievements',
        icon: <Trophy className="w-4 h-4" />,
        component: <AchievementsTab />,
    },
    {
        id: 'performance',
        label: 'Performance Indicators',
        path: '/forms/performance',
        icon: <BarChart3 className="w-4 h-4" />,
        component: <PerformanceTab />,
    },
    {
        id: 'miscellaneous',
        label: 'Miscellaneous',
        path: '/forms/miscellaneous',
        icon: <FolderTree className="w-4 h-4" />,
        component: <MiscellaneousTab />,
    },
]

export const FormManagement: React.FC = () => {
    const navigate = useNavigate()
    const location = useLocation()

    // Redirect to first tab if on base /forms route
    React.useEffect(() => {
        if (location.pathname === '/forms') {
            navigate(tabs[0].path, { replace: true })
        }
    }, [location.pathname, navigate])

    // Determine active tab based on current route
    const getActiveTab = (): string => {
        const currentPath = location.pathname
        // Find tab whose path is a prefix of the current location
        // We sort by path length descending to match the most specific path first
        const matchedTab = [...tabs]
            .sort((a, b) => b.path.length - a.path.length)
            .find(tab => currentPath.startsWith(tab.path))

        return matchedTab ? matchedTab.id : tabs[0].id
    }

    const activeTabData = tabs.find(tab => tab.id === getActiveTab()) || tabs[0]

    return (
        <SidebarLayout
            title="Form Management"
            description="Manage KVK forms, achievements, performance indicators, and miscellaneous data"
            hideTabs={true}
        >
            {activeTabData.component}
        </SidebarLayout>
    )
}

