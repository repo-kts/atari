import React, { useState, useMemo } from 'react';
import {
    ClipboardList,
    Building2,
    Briefcase,
    BarChart3,
    Archive,
    Globe,
    Trash2,
    Users,
    Check,
    ChevronDown
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
    const [isCollapsed, setIsCollapsed] = useState(false);

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

    const sectionHierarchy = useMemo(() => {
        const hierarchy: Record<string, { mainSections: ReportSection[], subSections: Record<string, ReportSection[]> }> = {};

        categoryMapping.forEach(cat => {
            const catSections = sections.filter(s => {
                const sParentId = String(s.parentSectionId || '');
                const cParentId = String(cat.parentId || '');
                const sId = String(s.id || '');
                const matchesParent = sParentId === cParentId;
                const matchesPrefix = sId.startsWith(cParentId + '.');
                return matchesParent || matchesPrefix;
            });

            const mainSections = catSections.filter(s => String(s.parentSectionId) === String(cat.parentId));

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
        <div className="bg-white p-3 rounded-2xl border border-[#E0E0E0] shadow-sm animate-in fade-in duration-500">
            <div className="p-0">
                <div
                    className={`flex items-center justify-between px-1 cursor-pointer group/header transition-all ${isCollapsed ? 'mb-0' : 'mb-4'}`}
                    onClick={() => setIsCollapsed(!isCollapsed)}
                >
                    <div className="flex items-center gap-3 h-10">
                        <div className={`p-1.5 bg-[#487749]/10 rounded-lg transition-transform duration-300 ${isCollapsed ? '-rotate-90' : ''}`}>
                            <ChevronDown className="w-4 h-4 text-[#487749]" />
                        </div>
                        <h3 className="text-sm font-bold text-[#487749] leading-none">Report Modules</h3>
                    </div>
                </div>

                {!isCollapsed && (
                    <div className="space-y-0.5 animate-in fade-in slide-in-from-top-2 duration-500">
                        <div className="bg-[#487749] p-1 rounded-[12px] flex items-center gap-0.5 overflow-x-auto no-scrollbar shadow-sm mb-2">
                            {categoryMapping.map(category => {
                                const isActive = activeTab === category.id;
                                return (
                                    <button
                                        key={category.id}
                                        onClick={() => handleTabChange(category.id)}
                                        className={`flex items-center gap-2 px-4 py-2 rounded-[10px] text-[12.5px] font-bold whitespace-nowrap transition-all duration-300
                                    ${isActive ? 'bg-white text-[#487749] shadow-sm' : 'text-white hover:bg-white/10'}`}
                                    >
                                        <span className={isActive ? 'text-[#487749]' : 'text-white'}>{category.icon}</span>
                                        {category.label}
                                    </button>
                                );
                            })}
                        </div>

                        <div className="bg-white border-none rounded-b-[20px]">
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
                                        <div
                                            onClick={() => onCategorySelectAll(allCategoryItemIds)}
                                            className="bg-[#F1F8F1] px-4 py-2 border-b border-[#E0E0E0] mb-2 rounded-xl flex items-center justify-between cursor-pointer hover:bg-[#E8F5E9] transition-colors"
                                        >
                                            <span className="text-[11px] font-bold text-[#757575] italic">Select all</span>
                                            <div className={`w-4 h-4 rounded-sm border flex items-center justify-center transition-all ${allSelected ? 'bg-[#487749] border-[#487749]' : 'bg-white border-[#D1D1D1]'}`}>
                                                {allSelected && <Check className="w-3.5 h-3.5 text-white" strokeWidth={5} />}
                                            </div>
                                        </div>

                                        <div className="max-h-[450px] overflow-y-auto custom-scrollbar bg-white">
                                            {mainSections.map(parent => {
                                                const children = subSections[parent.id] || [];

                                                if (children.length > 0) {
                                                    return children.map(child => {
                                                        const isSelected = selectedSections.has(child.id);
                                                        return (
                                                            <div
                                                                key={child.id}
                                                                onClick={() => onSectionToggle(child.id)}
                                                                className="px-6 py-4 flex items-center justify-between border-b border-[#F0F0F0] hover:bg-[#F9F9F9] transition-all cursor-pointer group"
                                                            >
                                                                <span className={`text-[13px] font-medium text-[#424242] ${isSelected ? 'text-[#487749] font-bold' : ''}`}>
                                                                    {child.title}
                                                                </span>
                                                                <div className={`w-4 h-4 rounded-sm border flex items-center justify-center transition-all flex-shrink-0 ${isSelected ? 'bg-[#487749] border-[#487749]' : 'bg-white border-[#D1D1D1] group-hover:border-[#487749]'}`}>
                                                                    {isSelected && <Check className="w-3 h-3 text-white" strokeWidth={5} />}
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
                                                            <span className={`text-[13px] font-medium text-[#424242] ${isSelected ? 'text-[#487749] font-bold' : ''}`}>
                                                                {parent.title}
                                                            </span>
                                                            <div className={`w-4 h-4 rounded-sm border flex items-center justify-center transition-all flex-shrink-0 ${isSelected ? 'bg-[#487749] border-[#487749]' : 'bg-white border-[#D1D1D1] group-hover:border-[#487749]'}`}>
                                                                {isSelected && <Check className="w-3 h-3 text-white" strokeWidth={5} />}
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
                )}
            </div>
        </div>
    );
};

