import React from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { ChevronLeft } from 'lucide-react'
import { Card, CardContent } from '../../../ui/Card'
import { Breadcrumbs } from '../../../common/Breadcrumbs'
import { TabNavigation } from '../../../common/TabNavigation'
import { getRouteConfig, getSiblingRoutes, getBreadcrumbsForPath } from '../../../../config/routeConfig'

interface ProjectFormTemplateProps {
    title: string
    description?: string
    children?: React.ReactNode
}

export const ProjectFormTemplate: React.FC<ProjectFormTemplateProps> = ({
    title,
    description,
    children
}) => {
    const location = useLocation()
    const navigate = useNavigate()

    // Get route config and siblings
    const routeConfig = getRouteConfig(location.pathname)
    const siblingRoutes = getSiblingRoutes(location.pathname)
    const breadcrumbs = getBreadcrumbsForPath(location.pathname)

    const handleBack = () => {
        if (routeConfig?.parent) {
            navigate(routeConfig.parent)
        } else {
            navigate('/forms/achievements/projects')
        }
    }

    return (
        <div className="space-y-6">
            {/* Back button and Breadcrumbs */}
            <div className="flex items-center gap-4">
                <button
                    onClick={handleBack}
                    className="flex items-center gap-1 px-3 py-1.5 text-sm font-medium text-[#487749] border border-[#E0E0E0] rounded-xl hover:bg-[#F5F5F5] transition-colors shrink-0"
                >
                    <ChevronLeft className="w-4 h-4" />
                    Back
                </button>
                {breadcrumbs.length > 0 && (
                    <Breadcrumbs items={breadcrumbs.map((b, i) => ({ ...b, level: i }))} showHome={false} />
                )}
            </div>

            {/* Tab Navigation for siblings */}
            {siblingRoutes.length > 1 && (
                <TabNavigation
                    tabs={siblingRoutes.map(r => ({ label: r.title, path: r.path }))}
                    currentPath={location.pathname}
                />
            )}

            {/* Page Header */}
            <div>
                <h1 className="text-2xl font-semibold text-[#487749]">{title}</h1>
                {description && (
                    <p className="text-sm text-[#757575] mt-1">{description}</p>
                )}
            </div>

            {/* Content */}
            <Card>
                <CardContent className="p-6">
                    {children || (
                        <div className="text-center py-12">
                            <div className="w-16 h-16 bg-[#E8F5E9] rounded-full flex items-center justify-center mx-auto mb-4">
                                <svg className="w-8 h-8 text-[#487749]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                </svg>
                            </div>
                            <h3 className="text-lg font-medium text-[#212121] mb-2">Form Coming Soon</h3>
                            <p className="text-sm text-[#757575] max-w-md mx-auto">
                                This form is under development. The data entry interface for {title} will be available soon.
                            </p>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    )
}
