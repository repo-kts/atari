import React from 'react'
import {
    Leaf,
    Sun,
    Users,
    FlaskConical,
    Utensils,
    UserCheck,
    Building2,
    FileText,
    Thermometer,
    Sprout,
    Plane,
    Warehouse,
    MoreHorizontal,
    FolderOpen
} from 'lucide-react'
import { FeatureTabLayout, FeatureSection } from '../../shared/FeatureTabLayout'
import { ROUTE_PATHS } from '@/constants/routePaths'

const sections: FeatureSection[] = [
    {
        title: 'CFLD',
        icon: <Leaf className="w-5 h-5" />,
        items: [
            { label: 'Technical Parameter', path: ROUTE_PATHS.ACHIEVEMENTS.PROJECTS.CFLD.TECHNICAL_PARAMETER },
            { label: 'Extension Activity', path: ROUTE_PATHS.ACHIEVEMENTS.PROJECTS.CFLD.EXTENSION_ACTIVITY },
            { label: 'Budget Utilization', path: ROUTE_PATHS.ACHIEVEMENTS.PROJECTS.CFLD.BUDGET_UTILIZATION },
        ],
    },
    {
        title: 'NICRA',
        icon: <Thermometer className="w-5 h-5" />,
        items: [
            { label: 'Basic Information', path: ROUTE_PATHS.ACHIEVEMENTS.PROJECTS.NICRA.BASIC_INFORMATION },
            { label: 'Details', path: ROUTE_PATHS.ACHIEVEMENTS.PROJECTS.NICRA.DETAILS },
            { label: 'Training', path: ROUTE_PATHS.ACHIEVEMENTS.PROJECTS.NICRA.TRAINING },
            { label: 'Extension Activity', path: ROUTE_PATHS.ACHIEVEMENTS.PROJECTS.NICRA.EXTENSION_ACTIVITY },
        ],
    },
    {
        title: 'NICRA Others',
        icon: <FolderOpen className="w-5 h-5" />,
        items: [
            { label: 'Intervention', path: ROUTE_PATHS.ACHIEVEMENTS.PROJECTS.NICRA.OTHERS.INTERVENTION },
            { label: 'Revenue Generated', path: ROUTE_PATHS.ACHIEVEMENTS.PROJECTS.NICRA.OTHERS.REVENUE_GENERATED },
            { label: 'Custom Hiring', path: ROUTE_PATHS.ACHIEVEMENTS.PROJECTS.NICRA.OTHERS.CUSTOM_HIRING },
            { label: 'VCRMC', path: ROUTE_PATHS.ACHIEVEMENTS.PROJECTS.NICRA.OTHERS.VCRMC },
            { label: 'Soil Health Card', path: ROUTE_PATHS.ACHIEVEMENTS.PROJECTS.NICRA.OTHERS.SOIL_HEALTH_CARD },
            { label: 'Convergence Programme', path: ROUTE_PATHS.ACHIEVEMENTS.PROJECTS.NICRA.OTHERS.CONVERGENCE_PROGRAMME },
            { label: 'Dignitaries Visited', path: ROUTE_PATHS.ACHIEVEMENTS.PROJECTS.NICRA.OTHERS.DIGNITARIES_VISITED },
            { label: 'PI/Co-PI List', path: ROUTE_PATHS.ACHIEVEMENTS.PROJECTS.NICRA.OTHERS.PI_COPI_LIST },
        ],
    },
    {
        title: 'ARYA / SAFAL',
        icon: <UserCheck className="w-5 h-5" />,
        items: [
            { label: 'Current Year Details', path: ROUTE_PATHS.ACHIEVEMENTS.PROJECTS.ARYA.CURRENT },
            { label: 'Previous Year Evaluation', path: ROUTE_PATHS.ACHIEVEMENTS.PROJECTS.ARYA.EVALUATION },
        ],
    },
    {
        title: 'Natural Farming',
        icon: <Sprout className="w-5 h-5" />,
        items: [
            { label: 'Geographical Information', path: ROUTE_PATHS.ACHIEVEMENTS.PROJECTS.NATURAL_FARMING.GEOGRAPHICAL_INFORMATION },
            { label: 'Physical Information', path: ROUTE_PATHS.ACHIEVEMENTS.PROJECTS.NATURAL_FARMING.PHYSICAL_INFORMATION },
            { label: 'Demonstration Information', path: ROUTE_PATHS.ACHIEVEMENTS.PROJECTS.NATURAL_FARMING.DEMONSTRATION_INFORMATION },
            { label: 'Farmers Practicing', path: ROUTE_PATHS.ACHIEVEMENTS.PROJECTS.NATURAL_FARMING.FARMERS_PRACTICING },
            { label: 'Beneficiaries', path: ROUTE_PATHS.ACHIEVEMENTS.PROJECTS.NATURAL_FARMING.BENEFICIARIES },
            { label: 'Soil Data', path: ROUTE_PATHS.ACHIEVEMENTS.PROJECTS.NATURAL_FARMING.SOIL_DATA },
            { label: 'Budget Expenditure', path: ROUTE_PATHS.ACHIEVEMENTS.PROJECTS.NATURAL_FARMING.BUDGET_EXPENDITURE },
        ],
    },
    {
        title: 'TSP/SCSP',
        icon: <FileText className="w-5 h-5" />,
        items: [
            { label: 'TSP/SCSP', path: ROUTE_PATHS.ACHIEVEMENTS.PROJECTS.TSP_SCSP },
        ],
    },
    {
        title: 'NARI',
        icon: <Utensils className="w-5 h-5" />,
        items: [
            { label: 'Nutrition Garden', path: ROUTE_PATHS.ACHIEVEMENTS.PROJECTS.NARI.NUTRI_SMART },
            { label: 'Bio-fortified Crops', path: ROUTE_PATHS.ACHIEVEMENTS.PROJECTS.NARI.BIO_FORTIFIED },
            { label: 'Value Addition', path: ROUTE_PATHS.ACHIEVEMENTS.PROJECTS.NARI.VALUE_ADDITION },
            { label: 'Training Program', path: ROUTE_PATHS.ACHIEVEMENTS.PROJECTS.NARI.TRAINING_PROGRAMM },
            { label: 'Extension Activities', path: ROUTE_PATHS.ACHIEVEMENTS.PROJECTS.NARI.EXTENSION_ACTIVITIES },
        ],
    },
    {
        title: 'Agri-Drone',
        icon: <Plane className="w-5 h-5" />,
        items: [
            { label: 'Introduction', path: ROUTE_PATHS.ACHIEVEMENTS.PROJECTS.AGRI_DRONE },
            { label: 'Demonstration', path: ROUTE_PATHS.ACHIEVEMENTS.PROJECTS.DEMONSTRATION_DETAILS },
        ],
    },
    {
        title: 'FPO and CBBO',
        icon: <Users className="w-5 h-5" />,
        items: [
            { label: 'Details FPO and CBBO', path: ROUTE_PATHS.ACHIEVEMENTS.PROJECTS.FPO.DETAILS },
            { label: 'FPO Management', path: ROUTE_PATHS.ACHIEVEMENTS.PROJECTS.FPO.MANAGEMENT },
        ],
    },
    {
        title: 'DRMR',
        icon: <FlaskConical className="w-5 h-5" />,
        items: [
            { label: 'DRMR Details', path: ROUTE_PATHS.ACHIEVEMENTS.PROJECTS.DRMR.DETAILS },
            { label: 'DRMR Activity', path: ROUTE_PATHS.ACHIEVEMENTS.PROJECTS.DRMR.ACTIVITY },
        ],
    },
    {
        title: 'Climate Resilient Agriculture (CRA)',
        icon: <Sun className="w-5 h-5" />,
        items: [
            { label: 'CRA Details', path: ROUTE_PATHS.ACHIEVEMENTS.PROJECTS.CRA.DETAILS },
            { label: 'Extension Activity', path: ROUTE_PATHS.ACHIEVEMENTS.PROJECTS.CRA.EXTENSION_ACTIVITY },
        ],
    },
    // Below: project tiles not listed in the spec — appended at the end so existing data remains accessible.
    {
        title: 'CSISA',
        icon: <Building2 className="w-5 h-5" />,
        items: [
            { label: 'CSISA', path: ROUTE_PATHS.ACHIEVEMENTS.PROJECTS.CSISA },
        ],
    },
    {
        title: 'Seed Hub Program',
        icon: <Warehouse className="w-5 h-5" />,
        items: [
            { label: 'Seed Hub Program', path: ROUTE_PATHS.ACHIEVEMENTS.PROJECTS.SEED_HUB_PROGRAM },
        ],
    },
    {
        title: 'Other Programmes',
        icon: <MoreHorizontal className="w-5 h-5" />,
        items: [
            { label: 'Other Programmes', path: ROUTE_PATHS.ACHIEVEMENTS.PROJECTS.OTHER_PROGRAM },
        ],
    },
]

export const ProjectsOverview: React.FC = () => {
    return (
        <FeatureTabLayout
            title="Projects"
            description="Manage project details, technical parameters, extension activities, and budget utilization"
            sections={sections}
        />
    )
}
