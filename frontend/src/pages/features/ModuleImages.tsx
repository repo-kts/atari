import React from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { ChevronLeft } from 'lucide-react'
import { Breadcrumbs } from '../../components/common/Breadcrumbs'
import { Card, CardContent } from '../../components/ui/Card'
import { getBreadcrumbsForPath, getRouteConfig } from '../../config/routeConfig'

export const ModuleImages: React.FC = () => {
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
                        <h2 className="text-xl font-semibold text-[#487749]">Module Images</h2>
                        <p className="text-sm text-[#757575] mt-1">
                            Manage module images, banners, and digital assets
                        </p>
                    </div>

                    <div className="bg-white rounded-xl border border-[#E0E0E0] p-12 text-center">
                        <div className="max-w-md mx-auto">
                            <div className="w-16 h-16 bg-[#487749]/10 rounded-full flex items-center justify-center mx-auto mb-4">
                                <ChevronLeft className="w-8 h-8 text-[#487749] rotate-90" />
                            </div>
                            <h3 className="text-lg font-medium text-[#212121] mb-2">Media Library</h3>
                            <p className="text-[#757575] mb-6">Module images management will be implemented here. Upload and organize images for various system modules.</p>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}
