import React from 'react'
import { Calendar, PartyPopper, CalendarDays, Globe } from 'lucide-react'
import { FeatureTabLayout, FeatureSection } from '../shared/FeatureTabLayout'
import { ROUTE_PATHS } from '@/constants/routePaths'

const sections: FeatureSection[] = [
    {
        title: 'Meetings',
        icon: <Calendar className="w-5 h-5" />,
        items: [
            { label: 'SAC Meetings', path: '/forms/meetings/sac' },
            { label: 'Other meetings', path: '/forms/meetings/other' },
        ],
    },
    {
        title: 'Technology Week',
        icon: <PartyPopper className="w-5 h-5" />,
        items: [
            { label: 'Technology Week', path: ROUTE_PATHS.ACHIEVEMENTS.TECHNOLOGY_WEEK, moduleCode: 'achievements_technology_week_celebration' },
        ],
    },
    {
        title: 'Celebration Days',
        icon: <CalendarDays className="w-5 h-5" />,
        items: [
            { label: 'Celebration Days', path: ROUTE_PATHS.ACHIEVEMENTS.CELEBRATION_DAYS, moduleCode: 'achievements_celebration_days' },
        ],
    },
    {
        title: 'World Soil Day',
        icon: <Globe className="w-5 h-5" />,
        items: [
            { label: 'World Soil Day', path: ROUTE_PATHS.ACHIEVEMENTS.WORLD_SOIL_DAY, moduleCode: 'achievements_soil_water_testing' },
        ],
    },
]

export const MeetingsTab: React.FC = () => {
    return (
        <FeatureTabLayout
            title="Meetings"
            description="Manage Scientific Advisory Committee meetings and other ATARI-related meetings"
            sections={sections}
        />
    )
}
