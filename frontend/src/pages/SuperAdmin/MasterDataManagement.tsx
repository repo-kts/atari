import { useState } from 'react';
import { useMasterData } from '../../hooks/useMasterData';
import type { EntityType, Zone, State, District, Organization } from '../../types/masterData';
import './MasterDataManagement.css';

type MasterDataEntity = Zone | State | District | Organization;

export function MasterDataManagement() {
    const [activeTab, setActiveTab] = useState<EntityType>('zones');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedItem, setSelectedItem] = useState<MasterDataEntity | null>(null);
    const [searchTerm, setSearchTerm] = useState('');

    // Get data for active tab
    const { data, loading, error, create, update, remove, fetchAll } = useMasterData(activeTab);

    const handleCreate = async (formData: any) => {
        try {
            await create(formData);
            setIsModalOpen(false);
            setSelectedItem(null);
            await fetchAll();
        } catch (err) {
            console.error('Error creating:', err);
        }
    };

    const handleEdit = (item: MasterDataEntity) => {
        setSelectedItem(item);
        setIsModalOpen(true);
    };

    const handleUpdate = async (formData: any) => {
        if (!selectedItem) return;

        try {
            const id = getEntityId(selectedItem, activeTab);
            await update(id, formData);
            setIsModalOpen(false);
            setSelectedItem(null);
            await fetchAll();
        } catch (err) {
            console.error('Error updating:', err);
        }
    };

    const handleDelete = async (item: MasterDataEntity) => {
        if (!confirm('Are you sure you want to delete this item? This action cannot be undone.')) {
            return;
        }

        try {
            const id = getEntityId(item, activeTab);
            await remove(id);
            await fetchAll();
        } catch (err) {
            console.error('Error deleting:', err);
            alert('Failed to delete. This item may have dependent records.');
        }
    };

    const handleSearch = (value: string) => {
        setSearchTerm(value);
        fetchAll({ search: value, page: 1 });
    };

    const filteredData = data.filter((item) => {
        const nameField = getNameField(activeTab);
        const name = (item as any)[nameField]?.toLowerCase() || '';
        return name.includes(searchTerm.toLowerCase());
    });

    return (
        <div className="master-data-management">
            <div className="mdm-header">
                <div className="mdm-header-content">
                    <h1 className="mdm-title">Master Data Management</h1>
                    <p className="mdm-subtitle">Manage zones, states, districts, and organizations</p>
                </div>
                <button
                    className="mdm-btn mdm-btn-primary"
                    onClick={() => {
                        setSelectedItem(null);
                        setIsModalOpen(true);
                    }}
                >
                    <span className="mdm-btn-icon">+</span>
                    Add {getEntityLabel(activeTab)}
                </button>
            </div>

            <div className="mdm-tabs">
                {(['zones', 'states', 'districts', 'organizations'] as EntityType[]).map((tab) => (
                    <button
                        key={tab}
                        className={`mdm-tab ${activeTab === tab ? 'mdm-tab-active' : ''}`}
                        onClick={() => {
                            setActiveTab(tab);
                            setSearchTerm('');
                        }}
                    >
                        {getEntityLabel(tab)}
                    </button>
                ))}
            </div>

            <div className="mdm-toolbar">
                <div className="mdm-search">
                    <input
                        type="text"
                        placeholder={`Search ${getEntityLabel(activeTab).toLowerCase()}...`}
                        value={searchTerm}
                        onChange={(e) => handleSearch(e.target.value)}
                        className="mdm-search-input"
                    />
                </div>
                <div className="mdm-stats">
                    <span className="mdm-stat-label">Total:</span>
                    <span className="mdm-stat-value">{data.length}</span>
                </div>
            </div>

            {error && (
                <div className="mdm-error">
                    <span className="mdm-error-icon">⚠️</span>
                    {error}
                </div>
            )}

            {loading ? (
                <div className="mdm-loading">
                    <div className="mdm-spinner"></div>
                    <p>Loading {getEntityLabel(activeTab).toLowerCase()}...</p>
                </div>
            ) : (
                <div className="mdm-table-container">
                    <table className="mdm-table">
                        <thead>
                            <tr>
                                {getTableHeaders(activeTab).map((header) => (
                                    <th key={header}>{header}</th>
                                ))}
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredData.length === 0 ? (
                                <tr>
                                    <td colSpan={getTableHeaders(activeTab).length + 1} className="mdm-empty">
                                        No {getEntityLabel(activeTab).toLowerCase()} found
                                    </td>
                                </tr>
                            ) : (
                                filteredData.map((item) => (
                                    <tr key={getEntityId(item, activeTab)}>
                                        {renderTableRow(item, activeTab)}
                                        <td className="mdm-actions">
                                            <button
                                                className="mdm-btn-icon mdm-btn-edit"
                                                onClick={() => handleEdit(item)}
                                                title="Edit"
                                            >
                                                ✏️
                                            </button>
                                            <button
                                                className="mdm-btn-icon mdm-btn-delete"
                                                onClick={() => handleDelete(item)}
                                                title="Delete"
                                            >
                                                🗑️
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            )}

            {isModalOpen && (
                <MasterDataModal
                    entityType={activeTab}
                    item={selectedItem}
                    onSubmit={selectedItem ? handleUpdate : handleCreate}
                    onClose={() => {
                        setIsModalOpen(false);
                        setSelectedItem(null);
                    }}
                />
            )}
        </div>
    );
}

// Helper functions

function getEntityId(item: MasterDataEntity, entityType: EntityType): number {
    switch (entityType) {
        case 'zones':
            return (item as Zone).zoneId;
        case 'states':
            return (item as State).stateId;
        case 'districts':
            return (item as District).districtId;
        case 'organizations':
            return (item as Organization).orgId;
    }
}

function getNameField(entityType: EntityType): string {
    switch (entityType) {
        case 'zones':
            return 'zoneName';
        case 'states':
            return 'stateName';
        case 'districts':
            return 'districtName';
        case 'organizations':
            return 'uniName';
    }
}

function getEntityLabel(entityType: EntityType): string {
    switch (entityType) {
        case 'zones':
            return 'Zones';
        case 'states':
            return 'States';
        case 'districts':
            return 'Districts';
        case 'organizations':
            return 'Organizations';
    }
}

function getTableHeaders(entityType: EntityType): string[] {
    switch (entityType) {
        case 'zones':
            return ['ID', 'Zone Name', 'States', 'Districts'];
        case 'states':
            return ['ID', 'State Name', 'Zone', 'Districts', 'Organizations'];
        case 'districts':
            return ['ID', 'District Name', 'State', 'Zone'];
        case 'organizations':
            return ['ID', 'Organization Name', 'State'];
    }
}

function renderTableRow(item: MasterDataEntity, entityType: EntityType) {
    switch (entityType) {
        case 'zones': {
            const zone = item as Zone;
            return (
                <>
                    <td>{zone.zoneId}</td>
                    <td className="mdm-cell-name">{zone.zoneName}</td>
                    <td>{zone._count?.states || 0}</td>
                    <td>{zone._count?.districts || 0}</td>
                </>
            );
        }
        case 'states': {
            const state = item as State;
            return (
                <>
                    <td>{state.stateId}</td>
                    <td className="mdm-cell-name">{state.stateName}</td>
                    <td>{state.zone?.zoneName || '-'}</td>
                    <td>{state._count?.districts || 0}</td>
                    <td>{state._count?.orgs || 0}</td>
                </>
            );
        }
        case 'districts': {
            const district = item as District;
            return (
                <>
                    <td>{district.districtId}</td>
                    <td className="mdm-cell-name">{district.districtName}</td>
                    <td>{district.state?.stateName || '-'}</td>
                    <td>{district.zone?.zoneName || '-'}</td>
                </>
            );
        }
        case 'organizations': {
            const org = item as Organization;
            return (
                <>
                    <td>{org.orgId}</td>
                    <td className="mdm-cell-name">{org.uniName}</td>
                    <td>{org.state?.stateName || '-'}</td>
                </>
            );
        }
    }
}

// Simple Modal Component
function MasterDataModal({
    entityType,
    item,
    onSubmit,
    onClose,
}: {
    entityType: EntityType;
    item: MasterDataEntity | null;
    onSubmit: (data: any) => void;
    onClose: () => void;
}) {
    const [formData, setFormData] = useState<any>(item || {});
    const { data: zones } = useMasterData<Zone>('zones');
    const { data: states } = useMasterData<State>('states');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSubmit(formData);
    };

    return (
        <div className="mdm-modal-overlay" onClick={onClose}>
            <div className="mdm-modal" onClick={(e) => e.stopPropagation()}>
                <div className="mdm-modal-header">
                    <h2>{item ? 'Edit' : 'Add'} {getEntityLabel(entityType).slice(0, -1)}</h2>
                    <button className="mdm-modal-close" onClick={onClose}>×</button>
                </div>
                <form onSubmit={handleSubmit} className="mdm-form">
                    {entityType === 'zones' && (
                        <div className="mdm-form-group">
                            <label>Zone Name *</label>
                            <input
                                type="text"
                                value={formData.zoneName || ''}
                                onChange={(e) => setFormData({ ...formData, zoneName: e.target.value })}
                                required
                                placeholder="Enter zone name"
                            />
                        </div>
                    )}

                    {entityType === 'states' && (
                        <>
                            <div className="mdm-form-group">
                                <label>State Name *</label>
                                <input
                                    type="text"
                                    value={formData.stateName || ''}
                                    onChange={(e) => setFormData({ ...formData, stateName: e.target.value })}
                                    required
                                    placeholder="Enter state name"
                                />
                            </div>
                            <div className="mdm-form-group">
                                <label>Zone *</label>
                                <select
                                    value={formData.zoneId || ''}
                                    onChange={(e) => setFormData({ ...formData, zoneId: parseInt(e.target.value) })}
                                    required
                                >
                                    <option value="">Select zone</option>
                                    {zones.map((zone) => (
                                        <option key={zone.zoneId} value={zone.zoneId}>
                                            {zone.zoneName}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        </>
                    )}

                    {entityType === 'districts' && (
                        <>
                            <div className="mdm-form-group">
                                <label>District Name *</label>
                                <input
                                    type="text"
                                    value={formData.districtName || ''}
                                    onChange={(e) => setFormData({ ...formData, districtName: e.target.value })}
                                    required
                                    placeholder="Enter district name"
                                />
                            </div>
                            <div className="mdm-form-group">
                                <label>Zone *</label>
                                <select
                                    value={formData.zoneId || ''}
                                    onChange={(e) => {
                                        const zoneId = parseInt(e.target.value);
                                        setFormData({ ...formData, zoneId, stateId: '' });
                                    }}
                                    required
                                >
                                    <option value="">Select zone</option>
                                    {zones.map((zone) => (
                                        <option key={zone.zoneId} value={zone.zoneId}>
                                            {zone.zoneName}
                                        </option>
                                    ))}
                                </select>
                            </div>
                            <div className="mdm-form-group">
                                <label>State *</label>
                                <select
                                    value={formData.stateId || ''}
                                    onChange={(e) => setFormData({ ...formData, stateId: parseInt(e.target.value) })}
                                    required
                                    disabled={!formData.zoneId}
                                >
                                    <option value="">Select state</option>
                                    {states
                                        .filter((state) => state.zoneId === formData.zoneId)
                                        .map((state) => (
                                            <option key={state.stateId} value={state.stateId}>
                                                {state.stateName}
                                            </option>
                                        ))}
                                </select>
                            </div>
                        </>
                    )}

                    {entityType === 'organizations' && (
                        <>
                            <div className="mdm-form-group">
                                <label>Organization Name *</label>
                                <input
                                    type="text"
                                    value={formData.uniName || ''}
                                    onChange={(e) => setFormData({ ...formData, uniName: e.target.value })}
                                    required
                                    placeholder="Enter organization name"
                                />
                            </div>
                            <div className="mdm-form-group">
                                <label>State *</label>
                                <select
                                    value={formData.stateId || ''}
                                    onChange={(e) => setFormData({ ...formData, stateId: parseInt(e.target.value) })}
                                    required
                                >
                                    <option value="">Select state</option>
                                    {states.map((state) => (
                                        <option key={state.stateId} value={state.stateId}>
                                            {state.stateName}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        </>
                    )}

                    <div className="mdm-form-actions">
                        <button type="button" className="mdm-btn mdm-btn-secondary" onClick={onClose}>
                            Cancel
                        </button>
                        <button type="submit" className="mdm-btn mdm-btn-primary">
                            {item ? 'Update' : 'Create'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
