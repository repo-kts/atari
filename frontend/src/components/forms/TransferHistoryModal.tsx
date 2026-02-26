import React from 'react';
import { Modal } from '../ui/Modal';
import { useStaffTransferHistory } from '../../hooks/forms/useAboutKvkData';
import { KvkEmployee } from '../../types/aboutKvk';
import { Loader2, History, ArrowRight } from 'lucide-react';
import { format } from 'date-fns';

interface TransferHistoryModalProps {
    open: boolean;
    onClose: () => void;
    staff: KvkEmployee;
}

export const TransferHistoryModal: React.FC<TransferHistoryModalProps> = ({
    open,
    onClose,
    staff,
}) => {
    // Fetch transfer history using TanStack Query
    const {
        data: history = [],
        isLoading: loading,
        error: queryError
    } = useStaffTransferHistory(open && staff ? staff.kvkStaffId : null);

    const error = queryError
        ? (queryError instanceof Error ? queryError.message : 'Failed to load transfer history.')
        : null;

    const formatDate = (dateString: string) => {
        try {
            return format(new Date(dateString), 'MMM dd, yyyy HH:mm');
        } catch {
            return dateString;
        }
    };

    return (
        <Modal isOpen={open} onClose={onClose} title={`Transfer History - ${staff.staffName}`} size="lg">
            <div className="space-y-4">
                {loading ? (
                    <div className="flex items-center justify-center py-8">
                        <Loader2 className="w-6 h-6 animate-spin text-[#487749]" />
                        <span className="ml-2 text-sm text-[#757575]">Loading history...</span>
                    </div>
                ) : error ? (
                    <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
                        {error}
                    </div>
                ) : history.length === 0 ? (
                    <div className="text-center py-8 text-[#757575]">
                        <History className="w-12 h-12 mx-auto mb-3 text-[#E0E0E0]" />
                        <p>No transfer history found.</p>
                    </div>
                ) : (
                    <div className="space-y-3">
                        {history.map((transfer) => (
                            <div
                                key={transfer.transferId}
                                className={`border rounded-lg p-4 ${transfer.isReversal
                                        ? 'bg-orange-50 border-orange-200'
                                        : 'bg-[#F5F5F5] border-[#E0E0E0]'
                                    }`}
                            >
                                <div className="flex items-start justify-between mb-2">
                                    <div className="flex items-center gap-2">
                                        {transfer.isReversal ? (
                                            <span className="px-2 py-1 text-xs font-medium bg-orange-100 text-orange-700 rounded">
                                                Reversal
                                            </span>
                                        ) : (
                                            <span className="px-2 py-1 text-xs font-medium bg-green-100 text-green-700 rounded">
                                                Transfer
                                            </span>
                                        )}
                                        <span className="text-xs text-[#757575]">
                                            {formatDate(transfer.transferDate)}
                                        </span>
                                    </div>
                                </div>

                                <div className="flex items-center gap-3 mb-2">
                                    <div className="flex-1">
                                        <p className="text-xs text-[#757575] mb-1">From KVK</p>
                                        <p className="font-medium text-[#212121]">
                                            {transfer.fromKvk?.kvkName || `KVK ${transfer.fromKvkId}`}
                                        </p>
                                    </div>
                                    <ArrowRight className="w-4 h-4 text-[#757575] flex-shrink-0" />
                                    <div className="flex-1">
                                        <p className="text-xs text-[#757575] mb-1">To KVK</p>
                                        <p className="font-medium text-[#212121]">
                                            {transfer.toKvk?.kvkName || `KVK ${transfer.toKvkId}`}
                                        </p>
                                    </div>
                                </div>

                                {transfer.transferredByUser && (
                                    <div className="mb-2">
                                        <p className="text-xs text-[#757575] mb-1">Transferred By</p>
                                        <p className="text-sm text-[#212121]">
                                            {transfer.transferredByUser.name}
                                        </p>
                                    </div>
                                )}

                                {transfer.transferReason && (
                                    <div className="mb-2">
                                        <p className="text-xs text-[#757575] mb-1">Reason</p>
                                        <p className="text-sm text-[#212121]">{transfer.transferReason}</p>
                                    </div>
                                )}

                                {transfer.notes && (
                                    <div>
                                        <p className="text-xs text-[#757575] mb-1">Notes</p>
                                        <p className="text-sm text-[#212121]">{transfer.notes}</p>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                )}

                {/* Close Button */}
                <div className="flex justify-end pt-4 border-t border-[#E0E0E0]">
                    <button
                        onClick={onClose}
                        className="px-4 py-2 bg-[#487749] text-white font-medium rounded-lg hover:bg-[#3d653e] transition-colors"
                    >
                        Close
                    </button>
                </div>
            </div>
        </Modal>
    );
};
