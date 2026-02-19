import React from 'react'
import { Link } from 'react-router-dom'
import { ArrowRight } from 'lucide-react'
import { useAuth } from '../../../contexts/AuthContext'
import { getModuleCodeForPath } from '../../../config/routeConfig'

export interface FeatureSection {
    title: string
    icon: React.ReactNode
    items: {
        label: string
        path: string
        /** Optional override; otherwise derived from path via routeConfig */
        moduleCode?: string
    }[]
}

interface FeatureTabLayoutProps {
    title: string
    description: string
    sections: FeatureSection[]
}

export const FeatureTabLayout: React.FC<FeatureTabLayoutProps> = ({
    title,
    description,
    sections,
}) => {
    const { hasPermission } = useAuth()

    // Filter items by VIEW permission: hide items the user cannot access
    const filteredSections = React.useMemo(() => {
        return sections
            .map((section) => ({
                ...section,
                items: section.items.filter((item) => {
                    const moduleCode = item.moduleCode ?? getModuleCodeForPath(item.path)
                    if (!moduleCode) return true // No moduleCode = show (e.g. public)
                    return hasPermission('VIEW', moduleCode)
                }),
            }))
            .filter((section) => section.items.length > 0)
    }, [sections, hasPermission])

    return (
        <div className="p-6">
            <div className="mb-6">
                <h2 className="text-xl font-semibold text-[#487749]">{title}</h2>
                <p className="text-sm text-[#757575] mt-1">{description}</p>
            </div>

            {filteredSections.length === 0 ? (
                <div className="rounded-xl bg-[#FAF9F6] border border-[#E0E0E0] p-8 text-center text-[#757575]">
                    You don't have access to any items in this section.
                </div>
            ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredSections.map((section, sectionIdx) => (
                    <div
                        key={sectionIdx}
                        className="bg-white rounded-xl overflow-hidden hover:shadow-md transition-all duration-200 p-1 h-full"
                    >
                        <div className="px-4 py-3">
                            <div className="flex items-center gap-2">
                                <span className="text-[#487749]">{section.icon}</span>
                                <h3 className="font-semibold text-[#487749]">{section.title}</h3>
                            </div>
                        </div>

                        <div className="h-[calc(100%-48px)] p-2 space-y-2 bg-[#FAF9F6] rounded-xl">
                            {section.items.map((item, itemIdx) => (
                                <Link
                                    key={itemIdx}
                                    to={item.path}
                                    className="flex items-center justify-between p-3 rounded-lg hover:bg-[#ffffff] transition-all duration-200 group"
                                >
                                    <span className="text-sm text-[#212121] group-hover:text-[#487749] font-medium">
                                        {item.label}
                                    </span>
                                    <ArrowRight className="w-4 h-4 text-[#757575] group-hover:text-[#487749] opacity-0 group-hover:opacity-100 transition-all duration-200" />
                                </Link>
                            ))}
                        </div>
                    </div>
                ))}
            </div>
            )}
        </div>
    )
}
