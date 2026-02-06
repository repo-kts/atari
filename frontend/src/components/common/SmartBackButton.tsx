import React from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'
import { Button } from '../ui/Button'
import { Breadcrumbs } from './Breadcrumbs'
import { SiblingNavigation } from './SiblingNavigation'
import { useNavigationContext } from '../../utils/navigationContext'
import { projectsMenuItems } from '../../utils/menuConfig'

interface SmartBackButtonProps {
    fallbackPath?: string
    showBreadcrumbs?: boolean
    showSiblings?: boolean
    className?: string
    breadcrumbMaxItems?: number
}

export const SmartBackButton: React.FC<SmartBackButtonProps> = ({
    fallbackPath = '/forms/achievements/projects',
    showBreadcrumbs = true,
    showSiblings = false,
    className = '',
    breadcrumbMaxItems = 0
}) => {
    const navigate = useNavigate()
    const location = useLocation()
    const context = useNavigationContext(projectsMenuItems)

    const handleBack = () => {
        if (context.parent && context.parent.path !== '#') {
            navigate(context.parent.path)
        } else if (context.breadcrumbs.length > 1) {
            // Go to the second-to-last breadcrumb
            const parentBreadcrumb = context.breadcrumbs[context.breadcrumbs.length - 2]
            if (parentBreadcrumb && parentBreadcrumb.path) {
                navigate(parentBreadcrumb.path)
            } else {
                navigate(fallbackPath)
            }
        } else {
            navigate(fallbackPath)
        }
    }

    return (
        <div className={`flex flex-col sm:flex-row sm:items-center gap-4 ${className}`}>
            <div className="flex items-center gap-4">
                <Button
                    variant="outline"
                    size="sm"
                    onClick={handleBack}
                    className="flex items-center shrink-0"
                >
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Back
                </Button>

                {showBreadcrumbs && context.breadcrumbs.length > 0 && (
                    <Breadcrumbs
                        items={context.breadcrumbs}
                        maxItems={breadcrumbMaxItems}
                        showHome={false}
                    />
                )}
            </div>

            {showSiblings && context.siblings.length > 1 && (
                <SiblingNavigation
                    siblings={context.siblings}
                    currentPath={location.pathname}
                />
            )}
        </div>
    )
}
