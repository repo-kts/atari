import React from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { ChevronLeft } from 'lucide-react'
import { Breadcrumbs } from './Breadcrumbs'
import { TabNavigation } from './TabNavigation'
import { getRouteConfig, getSiblingRoutes, getBreadcrumbsForPath } from '../../config/routeConfig'
import { Button } from '../ui/Button'

interface RouteWrapperProps {
    children: React.ReactNode
    showBreadcrumbs?: boolean
    showTabs?: boolean
    showBack?: boolean
}

export const RouteWrapper: React.FC<RouteWrapperProps> = ({
    children,
    showBreadcrumbs = true,
    showTabs = true,
    showBack = true
}) => {
    const location = useLocation()
    const navigate = useNavigate()

    // Get route config for current path
    const routeConfig = getRouteConfig(location.pathname)
    const breadcrumbs = getBreadcrumbsForPath(location.pathname)
    const siblingRoutes = getSiblingRoutes(location.pathname)

    const handleBack = () => {
        if (routeConfig?.parent) {
            navigate(routeConfig.parent)
        } else {
            navigate(-1)
        }
    }

    return (
        <div className="space-y-6 bg-white rounded-2xl p-1">
            {/* Back button and Breadcrumbs */}
            {showBreadcrumbs && breadcrumbs.length > 0 && (
                <div className="flex items-center gap-4 px-6 pt-4">
                    {showBack && (
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={handleBack}
                            className="flex items-center shrink-0"
                        >
                            <ChevronLeft className="w-4 h-4 mr-1" />
                            Back
                        </Button>
                    )}
                    <Breadcrumbs items={breadcrumbs.map((b, i) => ({ ...b, level: i }))} showHome={false} />
                </div>
            )}

            {/* Tab Navigation for siblings */}
            {showTabs && siblingRoutes.length > 1 && (
                <TabNavigation
                    tabs={siblingRoutes.map(r => ({ label: r.title, path: r.path }))}
                    currentPath={location.pathname}
                />
            )}

            {/* Page Content */}
            {children}
        </div>
    )
}
