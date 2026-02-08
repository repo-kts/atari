import React from 'react'
import { useNavigate } from 'react-router-dom'
import {
    Leaf,
    Sun,
    Users,
    FlaskConical,
    Utensils,
    UserCheck,
    Building2,
    FileText,
    Thermometer,
    Sprout,
    Plane,
    Warehouse,
    MoreHorizontal
} from 'lucide-react'
import { Card, CardContent } from '@/components/ui/Card'
import { SmartBackButton } from '@/components/common/SmartBackButton'

interface ProjectCategory {
    id: string
    title: string
    description: string
    icon: React.ReactNode
    path: string
    subItems?: string[]
}

const projectCategories: ProjectCategory[] = [
    {
        id: 'cfld',
        title: 'CFLD',
        description: 'Cluster Front Line Demonstration',
        icon: <Leaf className="w-6 h-6" />,
        path: '/forms/achievements/projects/cfld/technical-parameter',
        subItems: ['Technical Parameter', 'Extension Activity', 'Budget Utilization']
    },
    {
        id: 'cra',
        title: 'Climate Resilient Agriculture (CRA)',
        description: 'CRA programs and extension activities',
        icon: <Sun className="w-6 h-6" />,
        path: '/forms/achievements/projects/cra/details',
        subItems: ['CRA Details', 'Extension Activity']
    },
    {
        id: 'fpo',
        title: 'FPO And CBBO',
        description: 'Farmer Producer Organizations and CBBO',
        icon: <Users className="w-6 h-6" />,
        path: '/forms/achievements/projects/fpo/details',
        subItems: ['Details FPO and CBBO', 'FPO Management']
    },
    {
        id: 'drmr',
        title: 'DRMR',
        description: 'Directorate of Rapeseed-Mustard Research',
        icon: <FlaskConical className="w-6 h-6" />,
        path: '/forms/achievements/projects/drmr/details',
        subItems: ['DRMR Details', 'DRMR Activity']
    },
    {
        id: 'nari',
        title: 'NARI',
        description: 'Nutri-Smart village program',
        icon: <Utensils className="w-6 h-6" />,
        path: '/forms/achievements/projects/nari/nutri-smart',
        subItems: ['Nutrition Garden', 'Bio-fortified Crops', 'Value Addition', 'Training', 'Extension']
    },
    {
        id: 'arya',
        title: 'ARYA',
        description: 'Attracting and Retaining Youth in Agriculture',
        icon: <UserCheck className="w-6 h-6" />,
        path: '/forms/achievements/projects/arya',
        subItems: ['Current Year Details', 'Previous Year Evaluation']
    },
    {
        id: 'csisa',
        title: 'CSISA',
        description: 'Cereal Systems Initiative for South Asia',
        icon: <Building2 className="w-6 h-6" />,
        path: '/forms/achievements/projects/csisa'
    },
    {
        id: 'tsp-scsp',
        title: 'TSP/SCSP',
        description: 'Tribal Sub Plan / Scheduled Caste Sub Plan',
        icon: <FileText className="w-6 h-6" />,
        path: '/forms/achievements/projects/sub-plan-activity'
    },
    {
        id: 'nicra',
        title: 'NICRA',
        description: 'National Innovations on Climate Resilient Agriculture',
        icon: <Thermometer className="w-6 h-6" />,
        path: '/forms/achievements/projects/nicra/basic-information',
        subItems: ['Basic Info', 'Details', 'Training', 'Extension', 'Others']
    },
    {
        id: 'natural-farming',
        title: 'Natural Farming',
        description: 'Out-scaling of Natural Farming',
        icon: <Sprout className="w-6 h-6" />,
        path: '/forms/achievements/projects/natural-farming/geographical-information',
        subItems: ['Geographical', 'Physical', 'Demonstration', 'Beneficiaries', 'Soil Data', 'Budget']
    },
    {
        id: 'agri-drone',
        title: 'Agri-Drone',
        description: 'Agricultural drone programs',
        icon: <Plane className="w-6 h-6" />,
        path: '/forms/achievements/projects/agri-drone',
        subItems: ['Introduction', 'Demonstration Details']
    },
    {
        id: 'seed-hub',
        title: 'Seed Hub Program',
        description: 'Seed hub development programs',
        icon: <Warehouse className="w-6 h-6" />,
        path: '/forms/achievements/projects/seed-hub-program'
    },
    {
        id: 'other',
        title: 'Other Programmes',
        description: 'Any other programme organized by KVK',
        icon: <MoreHorizontal className="w-6 h-6" />,
        path: '/forms/achievements/projects/other-program'
    }
]

export const ProjectsOverview: React.FC = () => {
    const navigate = useNavigate()

    return (
        <div className="space-y-6">
            <SmartBackButton
                fallbackPath="/forms/achievements"
                showBreadcrumbs
            />

            <div>
                <h1 className="text-2xl font-semibold text-[#487749]">Projects</h1>
                <p className="text-sm text-[#757575] mt-1">
                    Select a project category to view or manage details
                </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {projectCategories.map((category) => (
                    <Card
                        key={category.id}
                        className="cursor-pointer hover:shadow-md transition-all duration-200 hover:border-[#487749]"
                        onClick={() => navigate(category.path)}
                    >
                        <CardContent className="p-4">
                            <div className="flex items-start gap-3">
                                <div className="p-2 bg-[#E8F5E9] rounded-lg text-[#487749] shrink-0">
                                    {category.icon}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <h3 className="font-medium text-[#212121] truncate">
                                        {category.title}
                                    </h3>
                                    <p className="text-xs text-[#757575] mt-1 line-clamp-2">
                                        {category.description}
                                    </p>
                                    {category.subItems && (
                                        <p className="text-xs text-[#487749] mt-2">
                                            {category.subItems.length} sub-forms
                                        </p>
                                    )}
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>
        </div>
    )
}
