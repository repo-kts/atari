import { MenuItem } from '../types/navigation'

// Projects menu configuration - nested under Achievements
export const projectsMenuItems: MenuItem[] = [
    {
        label: 'CFLD',
        path: '#',
        children: [
            {
                label: 'Technical Parameter',
                path: '/forms/achievements/projects/cfld/technical-parameter',
                metadata: { isDirectLink: true }
            },
            {
                label: 'Extension Activity',
                path: '/forms/achievements/projects/cfld/extension-activity',
                metadata: { isDirectLink: true }
            },
            {
                label: 'Budget Utilization',
                path: '/forms/achievements/projects/cfld/budget-utilization',
                metadata: { isDirectLink: true }
            }
        ]
    },
    {
        label: 'Climate Resilient Agriculture (CRA)',
        path: '#',
        children: [
            {
                label: 'CRA Details',
                path: '/forms/achievements/projects/cra/details',
                metadata: { isDirectLink: true }
            },
            {
                label: 'Extension Activity',
                path: '/forms/achievements/projects/cra/extension-activity',
                metadata: { isDirectLink: true }
            }
        ]
    },
    {
        label: 'FPO And CBBO',
        path: '#',
        children: [
            {
                label: 'Details FPO and CBBO',
                path: '/forms/achievements/projects/fpo/details',
                metadata: { isDirectLink: true }
            },
            {
                label: 'FPO Management',
                path: '/forms/achievements/projects/fpo/management',
                metadata: { isDirectLink: true }
            }
        ]
    },
    {
        label: 'DRMR',
        path: '#',
        children: [
            {
                label: 'DRMR Details',
                path: '/forms/achievements/projects/drmr/details',
                metadata: { isDirectLink: true }
            },
            {
                label: 'DRMR Activity',
                path: '/forms/achievements/projects/drmr/activity',
                metadata: { isDirectLink: true }
            }
        ]
    },
    {
        label: 'NARI',
        path: '#',
        children: [
            {
                label: 'Details of Nutrition Garden in Nutri-Smart village',
                path: '/forms/achievements/projects/nari/nutri-smart',
                metadata: { isDirectLink: true }
            },
            {
                label: 'Details of Bio-fortified crops',
                path: '/forms/achievements/projects/nari/bio-fortified',
                metadata: { isDirectLink: true }
            },
            {
                label: 'Details of Value addition',
                path: '/forms/achievements/projects/nari/value-addition',
                metadata: { isDirectLink: true }
            },
            {
                label: 'Training programmes',
                path: '/forms/achievements/projects/nari/training-programm',
                metadata: { isDirectLink: true }
            },
            {
                label: 'Extension activities under NARI',
                path: '/forms/achievements/projects/nari/extension-activities',
                metadata: { isDirectLink: true }
            }
        ]
    },
    {
        label: 'Attracting and Retaining Youth in Agriculture (ARYA)',
        path: '#',
        children: [
            {
                label: 'Current Year Details',
                path: '/forms/achievements/projects/arya',
                metadata: { isDirectLink: true }
            },
            {
                label: 'Previous Year Evaluation',
                path: '/forms/achievements/projects/arya-evaluation',
                metadata: { isDirectLink: true }
            }
        ]
    },
    {
        label: 'Details of CSISA',
        path: '/forms/achievements/projects/csisa',
        metadata: { isDirectLink: true }
    },
    {
        label: 'TSP/SCSP',
        path: '/forms/achievements/projects/sub-plan-activity',
        metadata: { isDirectLink: true }
    },
    {
        label: 'NICRA (Technology Demonstration)',
        path: '#',
        children: [
            {
                label: 'Basic Information',
                path: '/forms/achievements/projects/nicra/basic-information',
                metadata: { isDirectLink: true }
            },
            {
                label: 'Details',
                path: '/forms/achievements/projects/nicra/details',
                metadata: { isDirectLink: true }
            },
            {
                label: 'Training',
                path: '/forms/achievements/projects/nicra/training',
                metadata: { isDirectLink: true }
            },
            {
                label: 'Extension Activity',
                path: '/forms/achievements/projects/nicra/extension-activity',
                metadata: { isDirectLink: true }
            },
            {
                label: 'Others',
                path: '#',
                children: [
                    {
                        label: 'Intervention',
                        path: '/forms/achievements/projects/nicra/others/intervention',
                        metadata: { isDirectLink: true }
                    },
                    {
                        label: 'Revenue Generated',
                        path: '/forms/achievements/projects/nicra/others/revenue-generated',
                        metadata: { isDirectLink: true }
                    },
                    {
                        label: 'Custom Hiring of Farm-Implement',
                        path: '/forms/achievements/projects/nicra/others/custom-hiring',
                        metadata: { isDirectLink: true }
                    },
                    {
                        label: 'Village wise VCRMC',
                        path: '/forms/achievements/projects/nicra/others/vcrmc',
                        metadata: { isDirectLink: true }
                    },
                    {
                        label: 'Soil Health Card',
                        path: '/forms/achievements/projects/nicra/others/soil-health-card',
                        metadata: { isDirectLink: true }
                    },
                    {
                        label: 'Convergence Programme',
                        path: '/forms/achievements/projects/nicra/others/convergence-programme',
                        metadata: { isDirectLink: true }
                    },
                    {
                        label: 'Dignitaries visited NICRA Villages',
                        path: '/forms/achievements/projects/nicra/others/dignitaries-visited',
                        metadata: { isDirectLink: true }
                    },
                    {
                        label: 'Name of PI & Co-PI List',
                        path: '/forms/achievements/projects/nicra/others/pi-copi-list',
                        metadata: { isDirectLink: true }
                    }
                ]
            }
        ]
    },
    {
        label: 'Out-scaling of Natural Farming',
        path: '#',
        children: [
            {
                label: 'Geographical information',
                path: '/forms/achievements/projects/natural-farming/geographical-information',
                metadata: { isDirectLink: true }
            },
            {
                label: 'Physical information',
                path: '/forms/achievements/projects/natural-farming/physical-information',
                metadata: { isDirectLink: true }
            },
            {
                label: 'Demonstration Information',
                path: '/forms/achievements/projects/natural-farming/demonstration-information',
                metadata: { isDirectLink: true }
            },
            {
                label: 'Farmer Already Practicing Natural Farming',
                path: '/forms/achievements/projects/natural-farming/farmers-practicing',
                metadata: { isDirectLink: true }
            },
            {
                label: 'Details of Beneficiaries',
                path: '/forms/achievements/projects/natural-farming/beneficiaries',
                metadata: { isDirectLink: true }
            },
            {
                label: 'Soil Data information',
                path: '/forms/achievements/projects/natural-farming/soil-data',
                metadata: { isDirectLink: true }
            },
            {
                label: 'Budget Expenditure',
                path: '/forms/achievements/projects/natural-farming/budget-expenditure',
                metadata: { isDirectLink: true }
            }
        ]
    },
    {
        label: 'Agri-Drone',
        path: '#',
        children: [
            {
                label: 'Introduction',
                path: '/forms/achievements/projects/agri-drone',
                metadata: { isDirectLink: true }
            },
            {
                label: 'Demonstration Details',
                path: '/forms/achievements/projects/demonstration-details',
                metadata: { isDirectLink: true }
            }
        ]
    },
    {
        label: 'Seed Hub Program',
        path: '/forms/achievements/projects/seed-hub-program',
        metadata: { isDirectLink: true }
    },
    {
        label: 'Any other programme organized by KVK',
        path: '/forms/achievements/projects/other-program',
        metadata: { isDirectLink: true }
    }
]

// Helper function to find menu item by path
export const findMenuItemByPath = (
    items: MenuItem[],
    path: string,
    parentPath: MenuItem[] = []
): { item: MenuItem | null; path: MenuItem[]; siblings: MenuItem[]; parent: MenuItem | null } => {
    for (const item of items) {
        const currentPath = [...parentPath, item]

        if (item.path === path) {
            return {
                item,
                path: currentPath,
                siblings: items,
                parent: parentPath.length > 0 ? parentPath[parentPath.length - 1] : null
            }
        }

        if (item.children) {
            const result = findMenuItemByPath(item.children, path, currentPath)
            if (result.item) {
                return result
            }
        }
    }

    return { item: null, path: [], siblings: [], parent: null }
}

// Helper to check if a path is within Projects
export const isProjectsPath = (path: string): boolean => {
    return path.startsWith('/forms/achievements/projects')
}

// Helper to get all paths for a menu tree (for active state detection)
export const getAllPaths = (items: MenuItem[]): string[] => {
    const paths: string[] = []

    const traverse = (menuItems: MenuItem[]) => {
        for (const item of menuItems) {
            if (item.path !== '#') {
                paths.push(item.path)
            }
            if (item.children) {
                traverse(item.children)
            }
        }
    }

    traverse(items)
    return paths
}
