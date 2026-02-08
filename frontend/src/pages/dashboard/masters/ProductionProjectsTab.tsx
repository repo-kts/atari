import React from 'react'
import { Package, CloudRain, Briefcase } from 'lucide-react'
import { FeatureTabLayout, FeatureSection } from '../shared/FeatureTabLayout'

const sections: FeatureSection[] = [
    {
        title: 'Production of Seed, Planting Materials and Bio Products',
        icon: <Package className="w-5 h-5" />,
        items: [
            { label: 'Product Category', path: '/all-master/product-category' },
            { label: 'Product Type', path: '/all-master/product-type' },
            { label: 'Products', path: '/all-master/product' },
        ],
    },
    {
        title: 'Climate Resilient Agriculture',
        icon: <CloudRain className="w-5 h-5" />,
        items: [
            { label: 'Cropping System', path: '/all-master/cra-croping-system' },
            { label: 'Farming System', path: '/all-master/cra-farming-system' },
        ],
    },
    {
        title: 'ARYA',
        icon: <Briefcase className="w-5 h-5" />,
        items: [
            { label: 'ARYA Enterprise Master', path: '/all-master/arya-enterprise' },
        ],
    },
]

export const ProductionProjectsTab: React.FC = () => {
    return (
        <FeatureTabLayout
            title="Production & Projects"
            description="Manage production items, climate resilient agriculture, and ARYA enterprise masters"
            sections={sections}
        />
    )
}
