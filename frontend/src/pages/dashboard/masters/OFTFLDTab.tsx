import React from 'react'
import { TestTube, FolderTree } from 'lucide-react'
import { FeatureTabLayout, FeatureSection } from '../shared/FeatureTabLayout'

const sections: FeatureSection[] = [
    {
        title: 'OFT Master',
        icon: <TestTube className="w-5 h-5" />,
        items: [
            { label: 'Subject Master', path: '/all-master/oft/subject' },
            { label: 'Thematic Area Master', path: '/all-master/oft/thematic-area' },
        ],
    },
    {
        title: 'FLD Master',
        icon: <FolderTree className="w-5 h-5" />,
        items: [
            { label: 'Sector', path: '/all-master/fld/sector' },
            { label: 'Thematic Area', path: '/all-master/fld/thematic-area' },
            { label: 'Category', path: '/all-master/fld/category' },
            { label: 'Sub-category', path: '/all-master/fld/sub-category' },
            { label: 'Crop', path: '/all-master/fld/crop' },
        ],
    },
    {
        title: 'CFLD Master',
        icon: <TestTube className="w-5 h-5" />,
        items: [
            { label: 'CFLD Crop Master', path: '/all-master/cfld-crop' },
        ],
    },
]

export const OFTFLDTab: React.FC = () => {
    return (
        <FeatureTabLayout
            title="OFT & FLD Masters"
            description="Manage OFT (On Farm Testing), FLD (Front Line Demonstrations), and CFLD masters"
            sections={sections}
        />
    )
}
