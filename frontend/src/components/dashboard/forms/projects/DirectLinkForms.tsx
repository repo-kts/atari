import React from 'react'
import { ProjectFormTemplate } from './ProjectFormTemplate'

export const CSISADetails: React.FC = () => {
    return (
        <ProjectFormTemplate
            title="CSISA Details"
            description="Details of Cereal Systems Initiative for South Asia"
        />
    )
}

export const TSPSCSP: React.FC = () => {
    return (
        <ProjectFormTemplate
            title="TSP/SCSP"
            description="Tribal Sub Plan / Scheduled Caste Sub Plan activities"
        />
    )
}

export const SeedHubProgram: React.FC = () => {
    return (
        <ProjectFormTemplate
            title="Seed Hub Program"
            description="Seed Hub Program details and activities"
        />
    )
}

export const OtherProgram: React.FC = () => {
    return (
        <ProjectFormTemplate
            title="Other Programmes"
            description="Any other programme organized by KVK, not covered above"
        />
    )
}
