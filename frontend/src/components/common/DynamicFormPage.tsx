import React from 'react'
import { useLocation } from 'react-router-dom'
import { TableFormPage } from './TableFormPage'
import { getRouteConfig } from '../../config/routeConfig'
import { useAlert } from '@/hooks/useAlert'

// This component renders a form page dynamically based on the route
// It will be used for all project forms and master forms

export const DynamicFormPage: React.FC = () => {
    const location = useLocation()
    const { alert, AlertDialog } = useAlert()

    // Get route config for current path
    const routeConfig = getRouteConfig(location.pathname)

    if (!routeConfig) {
        return (
            <div className="p-6 text-center">
                <h1 className="text-xl text-[#757575]">Page not found</h1>
                <p className="text-sm text-[#9E9E9E] mt-2">
                    Route configuration not found for: {location.pathname}
                </p>
            </div>
        )
    }

    // For now, render as placeholder with table structure
    // Later, you can add actual data fetching logic here
    return (
        <>
            <TableFormPage
                title={routeConfig.title}
                description={routeConfig.description}
                placeholder={true}
                onAdd={() => alert({
                    title: 'Coming Soon',
                    message: `Add new ${routeConfig.title} - Coming soon`,
                    variant: 'info',
                })}
            />
            <AlertDialog />
        </>
    )
}
