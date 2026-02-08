import React from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { ChevronLeft } from 'lucide-react'
import { Breadcrumbs } from '../../components/common/Breadcrumbs'
import { Card, CardContent } from '../../components/ui/Card'
import { getBreadcrumbsForPath, getRouteConfig } from '../../config/routeConfig'

export const LogHistory: React.FC = () => {
    const navigate = useNavigate()
    const location = useLocation()
    const routeConfig = getRouteConfig(location.pathname)
    const breadcrumbs = getBreadcrumbsForPath(location.pathname)

    return (
        <div className="bg-white rounded-2xl p-1">
            {/* Back + Breadcrumbs */}
            <div className="mb-6 flex items-center gap-4 px-6 pt-4">
                <button
                    onClick={() => {
                        if (routeConfig?.parent) {
                            navigate(routeConfig.parent)
                        } else {
                            navigate('/dashboard')
                        }
                    }}
                    className="flex items-center gap-1 px-3 py-1.5 text-sm font-medium text-[#487749] border border-[#E0E0E0] rounded-xl hover:bg-[#F5F5F5] transition-colors"
                >
                    <ChevronLeft className="w-4 h-4" />
                    Back
                </button>
                {breadcrumbs.length > 0 && (
                    <Breadcrumbs items={breadcrumbs.map((b, i) => ({ ...b, level: i }))} showHome={false} />
                )}
            </div>

            <Card className="bg-[#FAF9F6]">
                <CardContent className="p-6">
                    <div className="mb-6">
                        <h2 className="text-xl font-semibold text-[#487749]">Log History</h2>
                        <p className="text-sm text-[#757575] mt-1">
                            View system activity logs and audit history
                        </p>
                    </div>

                    <div className="bg-white rounded-xl border border-[#E0E0E0] p-8 text-center">
                        <p className="text-[#757575]">System logs content will be implemented here.</p>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}
