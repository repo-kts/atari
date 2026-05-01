import React, { lazy, Suspense } from 'react'
import { useLocation } from 'react-router-dom'
import {
    Trophy,
    GraduationCap,
    Package,
    TestTube,
    FileText,
    Award,
    UserCheck,
    FlaskConical,
    Megaphone,
    Sprout,
    CalendarDays,
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
            {
                label: 'Technical Achievement Summary',
                path: ROUTE_PATHS.ACHIEVEMENTS.TECHNICAL_SUMMARY,
                moduleCode: 'achievements_technical_achievement_summary',
            },
        ],
    },
    {
        title: 'OFT',
        icon: <FlaskConical className="w-5 h-5" />,
        items: [
            { label: 'OFT', path: ROUTE_PATHS.ACHIEVEMENTS.OFT, moduleCode: 'achievements_oft' },
        ],
    },
    {
        title: 'FLD',
        icon: <Sprout className="w-5 h-5" />,
        items: [
            { label: 'FLD - View FLD', path: ROUTE_PATHS.ACHIEVEMENTS.FLD.BASE, moduleCode: 'achievements_fld' },
            { label: 'Extension & Training activities under FLD', path: ROUTE_PATHS.ACHIEVEMENTS.FLD.EXTENSION_TRAINING, moduleCode: 'achievements_fld_extension_training' },
            { label: 'Technical Feedback on FLD', path: ROUTE_PATHS.ACHIEVEMENTS.FLD.TECHNICAL_FEEDBACK, moduleCode: 'achievements_fld_technical_feedback' },
        ],
    },
    {
        title: 'Training',
        icon: <GraduationCap className="w-5 h-5" />,
        items: [
            { label: 'Trainings', path: ROUTE_PATHS.ACHIEVEMENTS.TRAININGS },
        ],
    },
    {
        title: 'Extension',
        icon: <Megaphone className="w-5 h-5" />,
        items: [
            { label: 'Extension Activities', path: ROUTE_PATHS.ACHIEVEMENTS.EXTENSION_ACTIVITIES },
            { label: 'Other Extension Activities', path: ROUTE_PATHS.ACHIEVEMENTS.OTHER_EXTENSION },
        ],
    },
    {
        title: 'Special Days',
        icon: <CalendarDays className="w-5 h-5" />,
        items: [
            { label: 'Technology Week', path: ROUTE_PATHS.ACHIEVEMENTS.TECHNOLOGY_WEEK, moduleCode: 'achievements_technology_week_celebration' },
            { label: 'Celebration Days', path: ROUTE_PATHS.ACHIEVEMENTS.CELEBRATION_DAYS, moduleCode: 'achievements_celebration_days' },
            { label: 'World Soil Day', path: ROUTE_PATHS.ACHIEVEMENTS.WORLD_SOIL_DAY, moduleCode: 'achievements_soil_water_testing' },
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
            { label: 'Analysis Details', path: ROUTE_PATHS.ACHIEVEMENTS.SOIL_ANALYSIS },
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
        title: 'Human Resources Development',
        icon: <UserCheck className="w-5 h-5" />,
        items: [
            { label: 'Human Resources Development', path: ROUTE_PATHS.ACHIEVEMENTS.HRD },
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
