import React from 'react'
import { BookOpen } from 'lucide-react'
import { MastersTabLayout, MasterSection } from './MastersTabLayout'

const sections: MasterSection[] = [
    {
        title: 'Publications',
        icon: <BookOpen className="w-5 h-5" />,
        items: [
            { label: 'Publication Items', path: '/all-master/publication-item' },
        ],
    },
]

export const PublicationsTab: React.FC = () => {
    return (
        <MastersTabLayout
            title="Publications"
            description="Manage publication items and related master data"
            sections={sections}
        />
    )
}
