import React from 'react'
import {
    TestTube,
    FolderTree,
    GraduationCap,
    Users,
    Package,
    Droplets,
    BookOpen,
} from 'lucide-react'
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
            { label: 'Sector Master', path: '/all-master/fld/sector' },
            { label: 'Thematic Area Master', path: '/all-master/fld/thematic-area' },
            { label: 'Category Master', path: '/all-master/fld/category' },
            { label: 'Sub-category Master', path: '/all-master/fld/sub-category' },
            { label: 'Crop Master', path: '/all-master/fld/crop' },
            { label: 'Activity Master', path: '/all-master/fld/activity' },
        ],
    },
    {
        title: 'Training Master',
        icon: <GraduationCap className="w-5 h-5" />,
        items: [
            { label: 'Training Type Master', path: '/all-master/training-type' },
            { label: 'Training Area Master', path: '/all-master/training-area' },
            { label: 'Training Thematic Area Master', path: '/all-master/training-thematic' },
            { label: 'Training Clientele Master', path: '/all-master/training-clientele' },
        ],
    },
    {
        title: 'Extension Activities Master',
        icon: <Users className="w-5 h-5" />,
        items: [
            { label: 'Extension Activity Master', path: '/all-master/extension-activity' },
            { label: 'Other Extension Activity Master', path: '/all-master/other-extension-activity' },
        ],
    },
    {
        title: 'Production of Seed, Planting Materials and Bio Products Master',
        icon: <Package className="w-5 h-5" />,
        items: [
            { label: 'Product Category Master', path: '/all-master/product-category' },
            { label: 'Product Type Master', path: '/all-master/product-type' },
            { label: 'Products Master', path: '/all-master/product' },
        ],
    },
    {
        title: 'Soil & Celebration Masters',
        icon: <Droplets className="w-5 h-5" />,
        items: [
            { label: 'Soil Water Analysis Master', path: '/all-master/soil-water-analysis' },
            { label: 'Important Day Master', path: '/all-master/important-day' },
        ],
    },
    {
        title: 'Publications Master',
        icon: <BookOpen className="w-5 h-5" />,
        items: [
            { label: 'Publication Items Master', path: '/all-master/publication-item' },
        ],
    },
]

export const AchievementsMastersTab: React.FC = () => {
    return (
        <FeatureTabLayout
            title="Achievements Master"
            description="Manage OFT, FLD, training, extension, production, soil water, and publication masters"
            sections={sections}
        />
    )
}
