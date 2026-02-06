import React from 'react'
import { MapPin } from 'lucide-react'
import { MastersTabLayout, MasterSection } from './MastersTabLayout'

const sections: MasterSection[] = [
    {
        title: 'Basic Masters',
        icon: <MapPin className="w-5 h-5" />,
        items: [
            { label: 'Zones Master', path: '/all-master/zones' },
            { label: 'States Master', path: '/all-master/states' },
            { label: 'Organization Master', path: '/all-master/universities' },
            { label: 'Districts Master', path: '/all-master/districts' },
        ],
    },
]

export const BasicMastersTab: React.FC = () => {
    return (
        <MastersTabLayout
            title="Basic Masters"
            description="Manage zones, states, organizations, and districts"
            sections={sections}
        />
    )
}
