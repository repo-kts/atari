import React, { useState, useMemo } from 'react';
import { Card, CardContent } from '../ui/Card';
import {
    ClipboardList,
    Building2,
    Briefcase,
    BarChart3,
    Archive,
    Globe,
    Trash2,
    Users,
    Layout,
    Check
} from 'lucide-react';
import type { ReportSection } from '../../types/reports';

interface ReportModuleSelectorProps {
    sections: ReportSection[];
    selectedSections: Set<string>;
    onSectionToggle: (sectionId: string) => void;
    onCategorySelectAll: (sectionIds: string[]) => void;
}

export const ReportModuleSelector: React.FC<ReportModuleSelectorProps> = ({
    sections,
    selectedSections,
    onSectionToggle,
    onCategorySelectAll,
}) => {
    const [activeTab, setActiveTab] = useState<string>('about');

    const categoryMapping = [
        { id: 'about', label: 'About KVK', parentId: '1', icon: <Building2 className="w-4 h-4" /> },
        { id: 'achievements', label: 'Achievements', parentId: '2', icon: <ClipboardList className="w-4 h-4" /> },
        { id: 'projects', label: 'Projects', parentId: '3', icon: <Briefcase className="w-4 h-4" /> },
        { id: 'performance', label: 'Performance', parentId: '4', icon: <BarChart3 className="w-4 h-4" /> },
        { id: 'misc', label: 'Miscellaneous', parentId: '5', icon: <Archive className="w-4 h-4" /> },
        { id: 'digital', label: 'Digital', parentId: '6', icon: <Globe className="w-4 h-4" /> },
        { id: 'swachh', label: 'Swachh Bharat', parentId: '7', icon: <Trash2 className="w-4 h-4" /> },
        { id: 'meetings', label: 'Meetings', parentId: '8', icon: <Users className="w-4 h-4" /> },
    ];

    const handleTabChange = (categoryId: string) => {
        setActiveTab(categoryId);
    };

    // Helper to get all sections for a category and build the hierarchy
    const sectionHierarchy = useMemo(() => {
        const hierarchy: Record<string, { mainSections: ReportSection[], subSections: Record<string, ReportSection[]> }> = {};

        categoryMapping.forEach(cat => {
            const catSections = sections.filter(s => {
                const sParentId = String(s.parentSectionId || '');
                const cParentId = String(cat.parentId || '');
                const sId = String(s.id || '');
                
                // Direct children of category
                const matchesParent = sParentId === cParentId;
                // Prefix match (fallback)
                const matchesPrefix = sId.startsWith(cParentId + '.');
                
                return matchesParent || matchesPrefix;
            });

            // Find main sections (direct children of category)
            const mainSections = catSections.filter(s => String(s.parentSectionId) === String(cat.parentId));
            
            // Find subsections (children of main sections)
            const subSections: Record<string, ReportSection[]> = {};
            catSections.forEach(s => {
                if (mainSections.some(m => String(m.id) === String(s.parentSectionId))) {
                    const parentId = String(s.parentSectionId);
                    if (!subSections[parentId]) subSections[parentId] = [];
                    subSections[parentId].push(s);
                }
            });

            hierarchy[cat.id] = { mainSections, subSections };
        });

        return hierarchy;
    }, [sections]);

    return (
        <Card className="border-[#E0E0E0] shadow-sm hover:shadow-md transition-shadow rounded-2xl overflow-hidden">
            <CardContent className="p-4">
                <div className="flex items-center gap-2 mb-4 px-1">
                    <div className="p-1.5 bg-[#487749]/10 rounded-lg">
                        <Layout className="w-4 h-4 text-[#487749]" />
                    </div>
                    <h3 className="text-sm font-bold text-[#212121]">Report Modules</h3>
                </div>

                <div className="space-y-0.5 animate-in fade-in duration-500">
                    {/* Green Tab Bar Header - Matches Picture Style */}
                    <div className="bg-[#487749] p-4 pb-0 rounded-t-[20px] flex items-center gap-1 overflow-x-auto no-scrollbar">
                        {categoryMapping.map(category => {
                            const isActive = activeTab === category.id;
                            return (
                                <button
                                    key={category.id}
                                    onClick={() => handleTabChange(category.id)}
                                    className={`flex items-center gap-2 px-5 py-3 rounded-t-xl text-[13px] font-black whitespace-nowrap transition-all
                                    ${isActive ? 'bg-white text-[#487749]' : 'bg-[#487749]/50 text-white hover:bg-white/10'}`}
                                >
                                    <span className={isActive ? 'text-[#487749]' : 'text-white'}>{category.icon}</span>
                                    {category.label}
                                </button>
                            );
                        })}
                    </div>

                    {/* Content Area */}
                    <div className="bg-white border-x border-b border-[#E0E0E0] rounded-b-[20px] overflow-hidden">
                        {(() => {
                            const category = categoryMapping.find(c => c.id === activeTab) || categoryMapping[0];
                            const { mainSections, subSections } = sectionHierarchy[category.id] || { mainSections: [], subSections: {} };
                            
                            const allCategoryItemIds: string[] = [];
                            mainSections.forEach(m => {
                                if (subSections[m.id]) {
                                    allCategoryItemIds.push(...subSections[m.id].map(s => s.id));
                                } else if (m.dataSource) {
                                    allCategoryItemIds.push(m.id);
                                }
                            });

                            const selectedInCat = allCategoryItemIds.filter(id => selectedSections.has(id)).length;
                            const allSelected = selectedInCat === allCategoryItemIds.length && allCategoryItemIds.length > 0;

                            return (
                                <div key={category.id} className="flex flex-col">
                                    {/* Select All Bar - Matches Picture Style */}
                                    <div 
                                        onClick={() => onCategorySelectAll(allCategoryItemIds)}
                                        className="bg-[#F1F8F1] px-6 py-3 border-b border-[#E0E0E0] flex items-center justify-between cursor-pointer hover:bg-[#E8F5E9] transition-colors"
                                    >
                                        <span className="text-[12px] font-bold text-[#757575] italic">Select all</span>
                                        <div className={`w-5 h-5 rounded-md border flex items-center justify-center transition-all ${allSelected ? 'bg-blue-600 border-blue-600' : 'bg-white border-[#D1D1D1]'}`}>
                                            {allSelected && <Check className="w-4 h-4 text-white" strokeWidth={5} />}
                                        </div>
                                    </div>

                                    {/* Single Column Vertical List - Matches Picture Style */}
                                    <div className="max-h-[450px] overflow-y-auto custom-scrollbar bg-white">
                                        {mainSections.map(parent => {
                                            const children = subSections[parent.id] || [];
                                            
                                            // If it has sub-sections, we list them all in order
                                            if (children.length > 0) {
                                                return children.map(child => {
                                                    const isSelected = selectedSections.has(child.id);
                                                    return (
                                                        <div
                                                            key={child.id}
                                                            onClick={() => onSectionToggle(child.id)}
                                                            className="px-6 py-4 flex items-center justify-between border-b border-[#F0F0F0] hover:bg-[#F9F9F9] transition-all cursor-pointer group"
                                                        >
                                                            <span className={`text-[13px] font-bold text-[#424242] ${isSelected ? 'text-[#487749]' : ''}`}>
                                                                {child.title}
                                                            </span>
                                                            <div className={`w-5 h-5 rounded-md border flex items-center justify-center transition-all flex-shrink-0 ${isSelected ? 'bg-blue-600 border-blue-600' : 'bg-white border-[#D1D1D1] group-hover:border-blue-600'}`}>
                                                                {isSelected && <Check className="w-3.5 h-3.5 text-white" strokeWidth={5} />}
                                                            </div>
                                                        </div>
                                                    );
                                                });
                                            }

                                            if (parent.dataSource) {
                                                const isSelected = selectedSections.has(parent.id);
                                                return (
                                                    <div
                                                        key={parent.id}
                                                        onClick={() => onSectionToggle(parent.id)}
                                                        className="px-6 py-4 flex items-center justify-between border-b border-[#F0F0F0] hover:bg-[#F9F9F9] transition-all cursor-pointer group"
                                                    >
                                                        <span className={`text-[13px] font-bold text-[#424242] ${isSelected ? 'text-[#487749]' : ''}`}>
                                                            {parent.title}
                                                        </span>
                                                        <div className={`w-5 h-5 rounded-md border flex items-center justify-center transition-all flex-shrink-0 ${isSelected ? 'bg-blue-600 border-blue-600' : 'bg-white border-[#D1D1D1] group-hover:border-blue-600'}`}>
                                                            {isSelected && <Check className="w-3.5 h-3.5 text-white" strokeWidth={5} />}
                                                        </div>
                                                    </div>
                                                );
                                            }

                                            return null;
                                        })}
                                    </div>
                                </div>
                            );
                        })()}
                    </div>
                </div>
            </CardContent>
        </Card>
    );
};

;

