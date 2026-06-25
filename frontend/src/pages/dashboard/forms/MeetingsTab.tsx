import React from 'react'
import { Calendar } from 'lucide-react'
import { FeatureTabLayout, FeatureSection } from '../shared/FeatureTabLayout'

const sections: FeatureSection[] = [
    {
        title: 'Meetings',
        icon: <Calendar className="w-5 h-5" />,
        items: [
            { label: 'Details of Scientific Advisory Committee(SAC) Meetings', path: '/forms/meetings/sac' },
            { label: 'Details of other meeting related to ATARI', path: '/forms/meetings/other' },
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
