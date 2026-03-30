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
    ChevronDown,
    Search
} from 'lucide-react';
import type { ReportSection } from '../../types/reports';

interface ReportModuleSelectorProps {
    sections: ReportSection[];
    selectedSections: Set<string>;
    onSectionToggle: (sectionId: string) => void;
    onCategorySelectAll: (sectionIds: string[]) => void;
    collapsed?: boolean;
    onToggleCollapse?: () => void;
}

export const ReportModuleSelector: React.FC<ReportModuleSelectorProps> = ({
    sections,
    selectedSections,
    onSectionToggle,
    onCategorySelectAll,
    collapsed = false,
    onToggleCollapse,
}) => {
    const [activeTab, setActiveTab] = useState<string>('about');
    const [isSearchOpen, setIsSearchOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const searchInputRef = React.useRef<HTMLInputElement | null>(null);
    const searchInputId = 'report-module-search';

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

    const normalizedSearchTerm = searchTerm.trim().toLowerCase();

    React.useEffect(() => {
        if (isSearchOpen) {
            searchInputRef.current?.focus();
        }
    }, [isSearchOpen]);

    const handleToggleSearch = (event: React.MouseEvent<HTMLButtonElement>) => {
        event.stopPropagation();
        if (isSearchOpen) {
            setIsSearchOpen(false);
            setSearchTerm('');
            return;
        }
        setIsSearchOpen(true);
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
        <div className="bg-white p-3 rounded-2xl border border-[#E0E0E0] shadow-sm animate-in fade-in duration-500">
            <div className="p-0">
                <div
                    className={`flex items-center justify-between px-1 cursor-pointer group/header transition-all ${collapsed ? 'mb-0' : 'mb-4'}`}
                    onClick={onToggleCollapse}
                >
                    <div className="flex items-center gap-3 h-10">
                        <div className={`p-1.5 bg-[#487749]/10 rounded-lg transition-transform duration-300 ${collapsed ? '-rotate-90' : ''}`}>
                            <ChevronDown className="w-4 h-4 text-[#487749]" />
                        </div>
                        {isSearchOpen ? (
                        <h3 className="hidden text-sm font-semibold text-[#487749] leading-none">
                            Report Modules
                        </h3>
                    ) : (
                        <h3 className="text-sm font-semibold text-[#487749] leading-none">
                            Report Modules
                        </h3>
                    )}                    </div>
                    <div
                        className="flex items-center gap-2"
                        onClick={event => event.stopPropagation()}
                    >
                        <div className={`overflow-hidden transition-all duration-200 ease-out ${isSearchOpen ? 'w-44 opacity-100' : 'w-0 opacity-0'}`}>
                            <input
                                id={searchInputId}
                                ref={searchInputRef}
                                type="text"
                                value={searchTerm}
                                onChange={event => setSearchTerm(event.target.value)}
                                placeholder="Search..."
                                onKeyDown={event => {
                                    if (event.key === 'Escape') {
                                        setIsSearchOpen(false);
                                        setSearchTerm('');
                                    }
                                }}
                                className="h-8 w-full rounded-lg border border-[#D8E3D8] bg-white px-2.5 text-xs text-[#2d4a2f] outline-none focus:border-[#487749]"
                            />
                        </div>
                        <button
                            type="button"
                            onClick={handleToggleSearch}
                            className="h-8 w-8 rounded-lg border border-[#D8E3D8] bg-white text-[#487749] hover:bg-[#F5FAF5] flex items-center justify-center"
                            aria-label="Toggle module search"
                            aria-expanded={isSearchOpen}
                            aria-controls={searchInputId}
                        >
                            <Search className="h-3.5 w-3.5" />
                        </button>
                    </div>
                </div>

                <div
                    className={`space-y-0.5 overflow-hidden transition-[max-height,opacity,margin] duration-300 ease-in-out ${
                        collapsed ? 'max-h-0 opacity-0 pointer-events-none' : 'max-h-[1200px] opacity-100'
                    }`}
                >
                    {/* Green Tab Bar Header - synchronized with ReportScopeSelector style */}
                    <div className="bg-[#487749] p-1 rounded-[12px] flex items-stretch gap-0 shadow-sm mb-2">
                        {categoryMapping.map(category => {
                            const isActive = activeTab === category.id;
                            return (
                                <button
                                    key={category.id}
                                    onClick={() => handleTabChange(category.id)}
                                    title={category.label}
                                    className={`flex-1 min-w-0 flex items-center justify-center gap-1.5 px-2 py-2 rounded-[10px] text-[11px] font-medium whitespace-nowrap transition-all duration-300
                                    ${isActive ? 'bg-white text-[#487749] shadow-sm' : 'text-white hover:bg-white/10'}`}
                                >
                                    <span className={`shrink-0 ${isActive ? 'text-[#487749]' : 'text-white'}`}>{category.icon}</span>
                                    <span className="truncate">{category.label}</span>
                                </button>
                            );
                        })}
                    </div>

                    {/* Content Area */}
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
                                    {/* Select All Bar - Matches Picture Style */}
                                    <div
                                        onClick={() => onCategorySelectAll(allCategoryItemIds)}
                                        className="bg-[#F1F8F1] px-4 py-2 border-b border-[#E0E0E0] mb-2 rounded-xl flex items-center justify-between cursor-pointer hover:bg-[#E8F5E9] transition-colors"
                                    >
                                        <span className="text-[11px] font-medium text-[#757575]">Select all</span>
                                        <div className={`w-4 h-4 rounded-sm border flex items-center justify-center transition-all ${allSelected ? 'bg-[#487749] border-[#487749]' : 'bg-white border-[#D1D1D1]'}`}>
                                            {allSelected && <Check className="w-3.5 h-3.5 text-white" strokeWidth={5} />}
                                        </div>
                                    </div>

                                    {/* Single Column Vertical List - Matches Picture Style */}
                                    <div className="max-h-[450px] overflow-y-auto custom-scrollbar bg-white">
                                        {mainSections.map(parent => {
                                            const children = subSections[parent.id] || [];

                                            // If it has sub-sections, we list them all in order
                                            if (children.length > 0) {
                                                const filteredChildren = normalizedSearchTerm
                                                    ? children.filter(child => child.title.toLowerCase().includes(normalizedSearchTerm))
                                                    : children;

                                                return filteredChildren.map(child => {
                                                    const isSelected = selectedSections.has(child.id);
                                                    return (
                                                        <div
                                                            key={child.id}
                                                            onClick={() => onSectionToggle(child.id)}
                                                            className="px-6 py-4 flex items-center justify-between border-b border-[#F0F0F0] hover:bg-[#F9F9F9] transition-all cursor-pointer group"
                                                        >
                                                            <span className={`text-[13px] font-normal text-[#424242] ${isSelected ? 'text-[#2f5a30] font-medium' : ''}`}>
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
                                                if (normalizedSearchTerm && !parent.title.toLowerCase().includes(normalizedSearchTerm)) {
                                                    return null;
                                                }
                                                const isSelected = selectedSections.has(parent.id);
                                                return (
                                                    <div
                                                        key={parent.id}
                                                        onClick={() => onSectionToggle(parent.id)}
                                                        className="px-6 py-4 flex items-center justify-between border-b border-[#F0F0F0] hover:bg-[#F9F9F9] transition-all cursor-pointer group"
                                                    >
                                                        <span className={`text-[13px] font-normal text-[#424242] ${isSelected ? 'text-[#2f5a30] font-medium' : ''}`}>
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
                                    {normalizedSearchTerm && (
                                        (() => {
                                            const visibleCount = mainSections.reduce((count, parent) => {
                                                const children = subSections[parent.id] || [];
                                                if (children.length > 0) {
                                                    return count + children.filter(child => child.title.toLowerCase().includes(normalizedSearchTerm)).length;
                                                }
                                                if (parent.dataSource && parent.title.toLowerCase().includes(normalizedSearchTerm)) {
                                                    return count + 1;
                                                }
                                                return count;
                                            }, 0);

                                            if (visibleCount > 0) return null;
                                            return (
                                                <div className="py-4 text-center">
                                                    <p className="text-[10px] text-[#9E9E9E] italic">No matching results</p>
                                                </div>
                                            );
                                        })()
                                    )}
                                </div>
                            );
                        })()}
                    </div>
                </div>
            </div>
        </div>
    );
};
