import React, { useState, useEffect } from 'react';
import { Modal } from '../ui/Modal';
import { useAllKvksForDropdown, useTransferEmployee } from '../../hooks/forms/useAboutKvkData';
import { KvkEmployee } from '../../types/aboutKvk';
import { Loader2 } from 'lucide-react';

interface TransferModalProps {
    open: boolean;
    onClose: () => void;
    staff: KvkEmployee;
    onTransferSuccess: () => void;
}

export const TransferModal: React.FC<TransferModalProps> = ({
    open,
    onClose,
    staff,
    onTransferSuccess,
}) => {
    const [targetKvkId, setTargetKvkId] = useState<number | ''>('');
    const [transferReason, setTransferReason] = useState('');
    const [notes, setNotes] = useState('');
    const [error, setError] = useState<string | null>(null);

    // Fetch all KVKs for dropdown
    const { data: allKvks = [], isLoading: loadingKvks } = useAllKvksForDropdown({ limit: 1000 });
    
    // Filter out current KVK
    const kvkOptions = allKvks.filter((kvk: any) => kvk.kvkId !== staff.kvkId);

    // Transfer employee mutation
    const transferMutation = useTransferEmployee();
    const loading = transferMutation.isPending;

    useEffect(() => {
        if (!open) {
            // Reset form when modal closes
            setTargetKvkId('');
            setTransferReason('');
            setNotes('');
            setError(null);
        }
    }, [open]);

    const handleTransfer = async () => {
        if (!targetKvkId) {
            setError('Please select a target KVK');
            return;
        }

        setError(null);

        try {
            await transferMutation.mutateAsync({
                staffId: staff.kvkStaffId,
                targetKvkId: targetKvkId as number,
                reason: transferReason || undefined,
                notes: notes || undefined
            });
            onTransferSuccess();
            onClose();
        } catch (err: any) {
            setError(err.response?.data?.error || err.message || 'Failed to transfer employee. Please try again.');
        }
    };

    return (
        <Modal isOpen={open} onClose={onClose} title="Transfer Employee" size="md">
            <div className="space-y-4">
                {/* Employee Info */}
                <div className="bg-[#F5F5F5] rounded-lg p-4 space-y-2">
                    <div>
                        <span className="text-sm font-medium text-[#757575]">Employee:</span>
                        <p className="text-[#212121] font-semibold">{staff.staffName}</p>
                    </div>
                    <div>
                        <span className="text-sm font-medium text-[#757575]">Current KVK:</span>
                        <p className="text-[#212121]">{staff.kvk?.kvkName || `KVK ${staff.kvkId}`}</p>
                    </div>
                </div>

                {/* Error Message */}
                {error && (
                    <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
                        {error}
                    </div>
                )}

                {/* Target KVK Selection */}
                <div>
                    <label className="block text-sm font-medium text-[#212121] mb-2">
                        Target KVK <span className="text-red-500">*</span>
                    </label>
                    {loadingKvks ? (
                        <div className="flex items-center justify-center p-4 border border-[#E0E0E0] rounded-lg">
                            <Loader2 className="w-5 h-5 animate-spin text-[#487749]" />
                            <span className="ml-2 text-sm text-[#757575]">Loading KVKs...</span>
                        </div>
                    ) : (
                        <select
                            value={targetKvkId}
                            onChange={(e) => setTargetKvkId(e.target.value ? parseInt(e.target.value) : '')}
                            disabled={loading}
                            className="w-full px-4 py-2 border border-[#E0E0E0] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#487749]/20 focus:border-[#487749] disabled:bg-[#F5F5F5] disabled:cursor-not-allowed"
                        >
                            <option value="">Select Target KVK</option>
                            {kvkOptions.map((kvk) => (
                                <option key={kvk.kvkId} value={kvk.kvkId}>
                                    {kvk.kvkName}
                                </option>
                            ))}
                        </select>
                    )}
                </div>

                {/* Transfer Reason */}
                <div>
                    <label className="block text-sm font-medium text-[#212121] mb-2">
                        Transfer Reason (Optional)
                    </label>
                    <textarea
                        value={transferReason}
                        onChange={(e) => setTransferReason(e.target.value)}
                        rows={3}
                        disabled={loading}
                        placeholder="Enter reason for transfer..."
                        className="w-full px-4 py-2 border border-[#E0E0E0] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#487749]/20 focus:border-[#487749] disabled:bg-[#F5F5F5] disabled:cursor-not-allowed resize-none"
                    />
                </div>

                {/* Notes */}
                <div>
                    <label className="block text-sm font-medium text-[#212121] mb-2">
                        Notes (Optional)
                    </label>
                    <textarea
                        value={notes}
                        onChange={(e) => setNotes(e.target.value)}
                        rows={3}
                        disabled={loading}
                        placeholder="Additional notes..."
                        className="w-full px-4 py-2 border border-[#E0E0E0] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#487749]/20 focus:border-[#487749] disabled:bg-[#F5F5F5] disabled:cursor-not-allowed resize-none"
                    />
                </div>

                {/* Actions */}
                <div className="flex justify-end gap-3 pt-4 border-t border-[#E0E0E0]">
                    <button
                        onClick={onClose}
                        disabled={loading}
                        className="px-4 py-2 text-[#757575] hover:text-[#212121] font-medium rounded-lg hover:bg-[#F5F5F5] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleTransfer}
                        disabled={loading || !targetKvkId || loadingKvks}
                        className="px-4 py-2 bg-[#487749] text-white font-medium rounded-lg hover:bg-[#3d653e] transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                    >
                        {loading ? (
                            <>
                                <Loader2 className="w-4 h-4 animate-spin" />
                                Transferring...
                            </>
                        ) : (
                            'Transfer'
                        )}
                    </button>
                </div>
            </div>
        </Modal>
    );
};
