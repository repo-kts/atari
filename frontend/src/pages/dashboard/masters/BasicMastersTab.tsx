import React from 'react'
import { useLocation } from 'react-router-dom'
import { MapPin } from 'lucide-react'
import { FeatureTabLayout, FeatureSection } from '../shared/FeatureTabLayout'

const buildSections = (basePath: string): FeatureSection[] => [
    {
        title: 'Basic Masters',
        icon: <MapPin className="w-5 h-5" />,
        items: [
            { label: 'Zones Master', path: `${basePath}/zones` },
            { label: 'States Master', path: `${basePath}/states` },
            { label: 'Districts Master', path: `${basePath}/districts` },
            { label: 'Institute Master', path: `${basePath}/organizations` },
            { label: 'Host Master', path: `${basePath}/universities` },
            { label: 'KVKs', path: `${basePath}/kvks` },
        ],
    },
]

export const BasicMastersTab: React.FC = () => {
    const location = useLocation()
    // Keep tiles inside the backup tree when viewed under /all-master-1.
    const basePath = location.pathname.startsWith('/all-master-1')
        ? '/all-master-1'
        : '/all-master'
    return (
        <FeatureTabLayout
            title="Basic Masters"
            description="Manage zones, states, institutes, hosts, and districts"
            sections={buildSections(basePath)}
        />
    )
}
