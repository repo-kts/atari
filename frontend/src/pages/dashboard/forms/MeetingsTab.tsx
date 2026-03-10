import React from 'react'
import { Calendar } from 'lucide-react'
import { FeatureTabLayout, FeatureSection } from '../shared/FeatureTabLayout'

const sections: FeatureSection[] = [
    {
        title: 'Meetings',
        icon: <Calendar className="w-5 h-5" />,
        items: [
            { label: 'SAC Meetings', path: '/forms/meetings/sac' },
            { label: 'Other meetings', path: '/forms/meetings/other' },
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
