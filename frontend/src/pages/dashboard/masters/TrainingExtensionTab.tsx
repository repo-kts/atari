import React from 'react'
import { GraduationCap, Users, Calendar } from 'lucide-react'
import { FeatureTabLayout, FeatureSection } from '../shared/FeatureTabLayout'

const sections: FeatureSection[] = [
    {
        title: 'Training Master',
        icon: <GraduationCap className="w-5 h-5" />,
        items: [
            { label: 'Training Type', path: '/all-master/training-type' },
            { label: 'Training Area', path: '/all-master/training-area' },
            { label: 'Training Thematic Area', path: '/all-master/training-thematic' },
        ],
    },
    {
        title: 'Extension Activities',
        icon: <Users className="w-5 h-5" />,
        items: [
            { label: 'Extension Activity', path: '/all-master/extension-activity' },
            { label: 'Other Extension Activity', path: '/all-master/other-extension-activity' },
        ],
    },
    {
        title: 'Events',
        icon: <Calendar className="w-5 h-5" />,
        items: [
            { label: 'Events', path: '/all-master/events' },
        ],
    },
]

export const TrainingExtensionTab: React.FC = () => {
    return (
        <FeatureTabLayout
            title="Training & Extension"
            description="Manage training masters, extension activities, and events"
            sections={sections}
        />
    )
}
