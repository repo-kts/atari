import React from 'react'
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
import { ProjectsOverview } from './projects/ProjectsOverview'
import { MastersTabLayout, MasterSection } from '../masters/MastersTabLayout'

const sections: MasterSection[] = [
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
            { label: 'OFT', path: '/forms/achievements/oft' },
            { label: 'FLD - View FLD', path: '/forms/achievements/fld' },
        ],
    },
    {
        title: 'Training & Extension',
        icon: <GraduationCap className="w-5 h-5" />,
        items: [
            { label: 'Trainings', path: '/forms/achievements/trainings' },
            { label: 'Extension Activities', path: '/forms/achievements/extension-activities' },
            { label: 'Other Extension Activities', path: '/forms/achievements/other-extension' },
            { label: 'Technology Week', path: '/forms/achievements/technology-week' },
            { label: 'Celebration Days', path: '/forms/achievements/celebration-days' },
        ],
    },
    {
        title: 'Production & Supply',
        icon: <Package className="w-5 h-5" />,
        items: [
            { label: 'Production and Supply', path: '/forms/achievements/production-supply' },
        ],
    },
    {
        title: 'Soil and Water Testing',
        icon: <TestTube className="w-5 h-5" />,
        items: [
            { label: 'Equipment Details', path: '/forms/achievements/soil-equipment' },
            { label: 'Analysis Details', path: '/forms/achievements/soil-analysis' },
            { label: 'World Soil Day', path: '/forms/achievements/world-soil-day' },
        ],
    },
    {
        title: 'Projects',
        icon: <Briefcase className="w-5 h-5" />,
        items: [
            { label: 'View All Projects', path: '/forms/achievements/projects' },
        ],
    },
    {
        title: 'Publications',
        icon: <FileText className="w-5 h-5" />,
        items: [
            { label: 'Publications', path: '/forms/achievements/publications' },
        ],
    },
    {
        title: 'Award and Recognition',
        icon: <Award className="w-5 h-5" />,
        items: [
            { label: 'KVK Awards', path: '/forms/achievements/award-recognition/kvk' },
            { label: 'Scientist Awards', path: '/forms/achievements/award-recognition/scientist' },
            { label: 'Farmer Awards', path: '/forms/achievements/award-recognition/farmer' },
        ],
    },
    {
        title: 'Human Resources Development',
        icon: <UserCheck className="w-5 h-5" />,
        items: [
            { label: 'Human Resources Development', path: '/forms/achievements/hrd' },
        ],
    },
]

export const AchievementsTab: React.FC = () => {
    const location = useLocation()

    // If on projects route, show projects content
    if (location.pathname.startsWith('/forms/achievements/projects')) {
        return <ProjectsOverview />
    }

    return (
        <MastersTabLayout
            title="Achievements"
            description="Manage technical achievements, OFT, FLD, trainings, extension activities, projects, and awards"
            sections={sections}
        />
    )
}
