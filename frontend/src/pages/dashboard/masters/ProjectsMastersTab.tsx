import React from 'react'
import {
    TestTube,
    CloudRain,
    Briefcase,
    ListTree,
    Sprout,
    Plane,
    ShieldCheck,
    IndianRupee,
} from 'lucide-react'
import { FeatureTabLayout, FeatureSection } from '../shared/FeatureTabLayout'

const sections: FeatureSection[] = [
    {
        title: 'CFLD Master',
        icon: <TestTube className="w-5 h-5" />,
        items: [
            { label: 'CFLD Crop Master', path: '/all-master/cfld-crop' },
            { label: 'CFLD Budget Item Master', path: '/all-master/budget-item-master' },
        ],
    },
    {
        title: 'Climate Resilient Agriculture Master',
        icon: <CloudRain className="w-5 h-5" />,
        items: [
            { label: 'Cropping System Master', path: '/all-master/cra-croping-system' },
            { label: 'Farming System Master', path: '/all-master/cra-farming-system' },
        ],
    },
    {
        title: 'ARYA Master',
        icon: <Briefcase className="w-5 h-5" />,
        items: [
            { label: 'ARYA Enterprise Master', path: '/all-master/arya-enterprise' },
        ],
    },
    {
        title: 'TSP/SCSP Master',
        icon: <ListTree className="w-5 h-5" />,
        items: [
            { label: 'TSP/SCSP Type Master', path: '/all-master/tsp-scsp-type' },
            { label: 'TSP/SCSP Activity Master', path: '/all-master/tsp-scsp-activity' },
        ],
    },
    {
        title: 'Natural Farming Master',
        icon: <Sprout className="w-5 h-5" />,
        items: [
            { label: 'Natural Farming Activity Master', path: '/all-master/natural-farming-activity' },
            { label: 'Natural Farming Soil Parameter Master', path: '/all-master/natural-farming-soil-parameter' },
        ],
    },
    {
        title: 'Agri-Drone Master',
        icon: <Plane className="w-5 h-5" />,
        items: [
            { label: 'Demonstrations On Master', path: '/all-master/agri-drone-demonstrations-on' },
        ],
    },
    {
        title: 'NARI Masters',
        icon: <Sprout className="w-5 h-5" />,
        items: [
            { label: 'NARI Activity Master', path: '/all-master/nari-activity' },
            { label: 'NARI Nutrition Garden Type Master', path: '/all-master/nari-nutrition-garden-type' },
            { label: 'NARI Crop Category Master', path: '/all-master/nari-crop-category' },
        ],
    },
    {
        title: 'NICRA Masters',
        icon: <ShieldCheck className="w-5 h-5" />,
        items: [
            { label: 'NICRA Category Master', path: '/all-master/nicra-category' },
            { label: 'NICRA Sub-category Master', path: '/all-master/nicra-sub-category' },
            { label: 'NICRA Seed/Fodder Bank Master', path: '/all-master/nicra-seed-bank-fodder-bank' },
            { label: 'NICRA Dignitary Type Master', path: '/all-master/nicra-dignitary-type' },
            { label: 'NICRA PI/CO-PI Type Master', path: '/all-master/nicra-pi-type' },
        ],
    },
    {
        title: 'Project wise Budget Masters',
        icon: <IndianRupee className="w-5 h-5" />,
        items: [
            { label: 'Financial Project Master', path: '/all-master/financial-project' },
        ],
    },
]

export const ProjectsMastersTab: React.FC = () => {
    return (
        <FeatureTabLayout
            title="Projects Master"
            description="Manage CFLD, CRA, ARYA, TSP/SCSP, natural farming, agri-drone, NARI, NICRA, and project budget masters"
            sections={sections}
        />
    )
}
