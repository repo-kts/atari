import React from 'react'
import { TrendingUp } from 'lucide-react'
import { FeatureTabLayout, FeatureSection } from '../shared/FeatureTabLayout'

const sections: FeatureSection[] = [
    {
        title: 'Performance Indicator Masters',
        icon: <TrendingUp className="w-5 h-5" />,
        items: [
            { label: 'Impact Specific Area Master', path: '/all-master/impact-specific-area' },
            { label: 'Name of Demo Unit Master', path: '/all-master/demo-unit-name' },
            { label: 'Type of Enterprise Master', path: '/all-master/enterprise-type' },
            { label: 'Account Type Master', path: '/all-master/account-type' },
            { label: 'Programme Type Master', path: '/all-master/programme-type' },
        ],
    },
]

export const PerformanceMastersTab: React.FC = () => {
    return (
        <FeatureTabLayout
            title="Performance Indicators Master"
            description="Manage impact, demonstration unit, enterprise, account, and programme master data"
            sections={sections}
        />
    )
}
