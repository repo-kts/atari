import React, { lazy, Suspense } from 'react'
import { useLocation } from 'react-router-dom'
import {
    Trophy,
    GraduationCap,
    Package,
    TestTube,
    Briefcase,
    FileText,
    Award,
    UserCheck,
} from 'lucide-react'
import { FeatureTabLayout, FeatureSection } from '../shared/FeatureTabLayout'
import { LoadingState } from '@/components/common/LoadingState'
import { ROUTE_PATHS } from '@/constants/routePaths'

const ProjectsOverview = lazy(() => import('./projects/ProjectsOverview').then(m => ({ default: m.ProjectsOverview })))

const sections: FeatureSection[] = [
    {
        title: 'Technical Achievement Summary',
        icon: <Trophy className="w-5 h-5" />,
        items: [
            { label: 'Technical Achievement Summary', path: '/forms/achievements/technical-summary' },

        ],
    },
    {
        title: 'OFT & FLD',
        icon: <TestTube className="w-5 h-5" />,
        items: [
            { label: 'OFT', path: ROUTE_PATHS.ACHIEVEMENTS.OFT, moduleCode: 'achievements_oft' },
            { label: 'FLD - View FLD', path: ROUTE_PATHS.ACHIEVEMENTS.FLD.BASE, moduleCode: 'achievements_fld' },
            { label: 'Extension & Training activities under FLD', path: ROUTE_PATHS.ACHIEVEMENTS.FLD.EXTENSION_TRAINING, moduleCode: 'achievements_fld_extension_training' },
            { label: 'Technical Feedback on FLD', path: ROUTE_PATHS.ACHIEVEMENTS.FLD.TECHNICAL_FEEDBACK, moduleCode: 'achievements_fld_technical_feedback' },
        ],
    },
    {
        title: 'Training & Extension',
        icon: <GraduationCap className="w-5 h-5" />,
        items: [
            { label: 'Trainings', path: ROUTE_PATHS.ACHIEVEMENTS.TRAININGS },
            { label: 'Extension Activities', path: ROUTE_PATHS.ACHIEVEMENTS.EXTENSION_ACTIVITIES },
            { label: 'Other Extension Activities', path: ROUTE_PATHS.ACHIEVEMENTS.OTHER_EXTENSION },
            { label: 'Technology Week', path: ROUTE_PATHS.ACHIEVEMENTS.TECHNOLOGY_WEEK },
            { label: 'Celebration Days', path: ROUTE_PATHS.ACHIEVEMENTS.CELEBRATION_DAYS },
        ],
    },
    {
        title: 'Production & Supply',
        icon: <Package className="w-5 h-5" />,
        items: [
            { label: 'Production and Supply', path: ROUTE_PATHS.ACHIEVEMENTS.PRODUCTION_SUPPLY },
        ],
    },
    {
        title: 'Soil and Water Testing',
        icon: <TestTube className="w-5 h-5" />,
        items: [
            { label: 'Equipment Details', path: ROUTE_PATHS.ACHIEVEMENTS.SOIL_EQUIPMENT },
            { label: 'Analysis Details', path: ROUTE_PATHS.ACHIEVEMENTS.SOIL_ANALYSIS },
            { label: 'World Soil Day', path: ROUTE_PATHS.ACHIEVEMENTS.WORLD_SOIL_DAY },
        ],
    },
    {
        title: 'Projects',
        icon: <Briefcase className="w-5 h-5" />,
        items: [
            { label: 'View All Projects', path: ROUTE_PATHS.ACHIEVEMENTS.PROJECTS.BASE },
        ],
    },
    {
        title: 'Publications',
        icon: <FileText className="w-5 h-5" />,
        items: [
            { label: 'Publications', path: ROUTE_PATHS.ACHIEVEMENTS.PUBLICATIONS },
        ],
    },
    {
        title: 'Award and Recognition',
        icon: <Award className="w-5 h-5" />,
        items: [
            { label: 'KVK Awards', path: ROUTE_PATHS.ACHIEVEMENTS.AWARDS.KVK },
            { label: 'Scientist Awards', path: ROUTE_PATHS.ACHIEVEMENTS.AWARDS.SCIENTIST },
            { label: 'Farmer Awards', path: ROUTE_PATHS.ACHIEVEMENTS.AWARDS.FARMER },
        ],
    },
    {
        title: 'Human Resources Development',
        icon: <UserCheck className="w-5 h-5" />,
        items: [
            { label: 'Human Resources Development', path: ROUTE_PATHS.ACHIEVEMENTS.HRD },
        ],
    },
]

export const AchievementsTab: React.FC = () => {
    const location = useLocation()

    // If on projects route, show projects content
    if (location.pathname.startsWith('/forms/achievements/projects')) {
        return (
            <Suspense fallback={<LoadingState />}>
                <ProjectsOverview />
            </Suspense>
        )
    }

    return (
        <FeatureTabLayout
            title="Achievements"
            description="Manage technical achievements, OFT, FLD, trainings, extension activities, projects, and awards"
            sections={sections}
        />
    )
}
