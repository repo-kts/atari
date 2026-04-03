import React from 'react'
import { Package, CloudRain, Briefcase, ListTree, Sprout, Plane } from 'lucide-react'
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
    {
        title: 'TSP/SCSP',
        icon: <ListTree className="w-5 h-5" />,
        items: [
            { label: 'TSP/SCSP Type Master', path: '/all-master/tsp-scsp-type' },
            { label: 'TSP/SCSP Activity Master', path: '/all-master/tsp-scsp-activity' },
        ],
    },
    {
        title: 'Natural Farming',
        icon: <Sprout className="w-5 h-5" />,
        items: [
            { label: 'Natural Farming Activity Master', path: '/all-master/natural-farming-activity' },
            { label: 'Natural Farming Soil Parameter Master', path: '/all-master/natural-farming-soil-parameter' },
        ],
    },
    {
        title: 'Agri-Drone',
        icon: <Plane className="w-5 h-5" />,
        items: [
            { label: 'Demonstrations On Master', path: '/all-master/agri-drone-demonstrations-on' },
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
