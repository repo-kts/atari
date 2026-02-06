import React, { useState, useEffect } from 'react'
import { useAuthStore } from '../../../stores/authStore'
import { localStorageService } from '../../../utils/localStorageService'
import { BankAccount } from '../../../types/bankAccount'
import { Card, CardContent } from '../../ui/Card'
import { Button } from '../../ui/Button'
import { Modal } from '../../ui/Modal'
import { AddBankAccount } from './AddBankAccount'
import { EditBankAccount } from './EditBankAccount'
import { exportService } from '../../../utils/exportService'
import { searchService } from '../../../utils/searchService'
import { Plus, Search, Edit2, Trash2, Download, FileSpreadsheet } from 'lucide-react'

export const BankAccountList: React.FC = () => {
    const { user, hasPermission } = useAuthStore()
    const [accounts, setAccounts] = useState<BankAccount[]>([])
    const [filteredAccounts, setFilteredAccounts] = useState<BankAccount[]>([])
    const [searchQuery, setSearchQuery] = useState('')
    const [isAddModalOpen, setIsAddModalOpen] = useState(false)
    const [editingAccount, setEditingAccount] = useState<BankAccount | null>(null)
    const [exporting, setExporting] = useState(false)

    const canAdd = hasPermission('ADD')
    const canEdit = hasPermission('EDIT')
    const canDelete = hasPermission('DELETE')
    const isAdmin = user?.role === 'super_admin' || user?.role === 'zone_admin' || user?.role === 'state_admin' || user?.role === 'district_admin' || user?.role === 'org_admin'

    useEffect(() => {
        loadAccounts()
    }, [user])

    useEffect(() => {
        if (searchQuery.trim()) {
            const filtered = searchService.searchBankAccounts(
                searchQuery,
                isAdmin ? undefined : user?.kvk_id
            )
            setFilteredAccounts(filtered)
        } else {
            setFilteredAccounts(accounts)
        }
    }, [searchQuery, accounts, user, isAdmin])

    const loadAccounts = () => {
        // For admin/super_admin, show all bank accounts
        // For KVK users, show only their KVK's bank accounts
        if (isAdmin) {
            const allAccounts = localStorageService.getBankAccounts()
            // Load KVK details for each account
            const kvks = localStorageService.getKVKDetails()
            const accountsWithKvk = allAccounts.map(acc => {
                const kvk = kvks.find(k => k.id === acc.kvk_id)
                return { ...acc, kvk }
            })
            setAccounts(accountsWithKvk)
            setFilteredAccounts(accountsWithKvk)
        } else if (user?.kvk_id) {
            const bankAccounts = localStorageService.getBankAccounts(user.kvk_id)
            setAccounts(bankAccounts)
            setFilteredAccounts(bankAccounts)
        }
    }

    const handleDelete = (id: number) => {
        if (!canDelete) {
            alert('You do not have permission to delete bank accounts.')
            return
        }
        if (confirm('Are you sure you want to delete this bank account?')) {
            localStorageService.deleteBankAccount(id)
            loadAccounts()
        }
    }

    const handleExportPDF = async () => {
        setExporting(true)
        try {
            await exportService.exportToPDF(
                filteredAccounts,
                'bank',
                { filename: `bank-accounts-${new Date().getTime()}.pdf` }
            )
        } catch (error) {
            console.error('Export failed:', error)
            alert('Failed to export PDF')
        } finally {
            setExporting(false)
        }
    }

    const handleExportExcel = async () => {
        setExporting(true)
        try {
            await exportService.exportToExcel(
                filteredAccounts,
                'bank',
                `bank-accounts-${new Date().getTime()}`
            )
        } catch (error) {
            console.error('Export failed:', error)
            alert('Failed to export Excel')
        } finally {
            setExporting(false)
        }
    }

    return (
        <div className="space-y-6">
            <Card>
                <CardContent className="p-6">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
                        <h2 className="text-2xl font-bold text-[#487749]">
                            Bank Accounts
                        </h2>
                        <div className="flex gap-2 flex-wrap">
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={handleExportPDF}
                                disabled={exporting}
                                className="flex items-center"
                            >
                                <Download className="w-4 h-4 mr-2 shrink-0" />
                                <span>Export PDF</span>
                            </Button>
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={handleExportExcel}
                                disabled={exporting}
                                className="flex items-center"
                            >
                                <FileSpreadsheet className="w-4 h-4 mr-2 shrink-0" />
                                <span>Export Excel</span>
                            </Button>
                            {canAdd && (
                                <Button
                                    variant="primary"
                                    size="sm"
                                    onClick={() => setIsAddModalOpen(true)}
                                    className="flex items-center"
                                >
                                    <Plus className="w-4 h-4 mr-2 shrink-0" />
                                    <span>Add Bank Account</span>
                                </Button>
                            )}
                        </div>
                    </div>

                    <div className="mb-4">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[#757575] w-5 h-5" />
                            <input
                                type="text"
                                placeholder="Search by account type, bank name, account number, location..."
                                value={searchQuery}
                                onChange={e => setSearchQuery(e.target.value)}
                                className="w-full h-12 pl-10 pr-4 border border-[#E0E0E0] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#E8F5E9] focus:border-[#487749] bg-white text-[#212121]"
                            />
                        </div>
                    </div>

                    {filteredAccounts.length === 0 ? (
                        <p className="text-[#757575] text-center py-8">
                            No bank accounts found
                        </p>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full border-collapse">
                                <thead>
                                    <tr className="bg-[#E8F5E9] border-b border-[#E0E0E0]">
                                        {isAdmin && (
                                            <th className="px-4 py-3 text-left text-sm font-semibold text-[#487749]">
                                                KVK Name
                                            </th>
                                        )}
                                        <th className="px-4 py-3 text-left text-sm font-semibold text-[#487749]">
                                            Account Type
                                        </th>
                                        <th className="px-4 py-3 text-left text-sm font-semibold text-[#487749]">
                                            Account Name
                                        </th>
                                        <th className="px-4 py-3 text-left text-sm font-semibold text-[#487749]">
                                            Bank Name
                                        </th>
                                        <th className="px-4 py-3 text-left text-sm font-semibold text-[#487749]">
                                            Location
                                        </th>
                                        <th className="px-4 py-3 text-left text-sm font-semibold text-[#487749]">
                                            Account Number
                                        </th>
                                        {(canEdit || canDelete) && (
                                            <th className="px-4 py-3 text-left text-sm font-semibold text-[#487749]">
                                                Actions
                                            </th>
                                        )}
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredAccounts.map(account => (
                                        <tr
                                            key={account.id}
                                            className="border-b border-[#E0E0E0] hover:bg-[#FAFAFA]"
                                        >
                                            {isAdmin && (
                                                <td className="px-4 py-3 text-[#212121]">
                                                    {account.kvk?.kvk_name || '-'}
                                                </td>
                                            )}
                                            <td className="px-4 py-3 text-[#212121]">
                                                {account.account_type}
                                            </td>
                                            <td className="px-4 py-3 text-[#212121]">
                                                {account.account_name}
                                            </td>
                                            <td className="px-4 py-3 text-[#212121]">
                                                {account.bank_name}
                                            </td>
                                            <td className="px-4 py-3 text-[#212121]">
                                                {account.location}
                                            </td>
                                            <td className="px-4 py-3 text-[#212121]">
                                                {account.account_number}
                                            </td>
                                            {(canEdit || canDelete) && (
                                                <td className="px-4 py-3">
                                                    <div className="flex gap-2">
                                                        {canEdit && (
                                                            <button
                                                                onClick={() => setEditingAccount(account)}
                                                                className="p-2 text-[#487749] hover:bg-[#E8F5E9] rounded-xl transition-colors"
                                                                title="Edit"
                                                            >
                                                                <Edit2 className="w-4 h-4" />
                                                            </button>
                                                        )}
                                                        {canDelete && (
                                                            <button
                                                                onClick={() => handleDelete(account.id)}
                                                                className="p-2 text-red-600 hover:bg-red-50 rounded-xl transition-colors"
                                                                title="Delete"
                                                            >
                                                                <Trash2 className="w-4 h-4" />
                                                            </button>
                                                        )}
                                                    </div>
                                                </td>
                                            )}
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </CardContent>
            </Card>

            <Modal
                isOpen={isAddModalOpen}
                onClose={() => setIsAddModalOpen(false)}
                title="Add Bank Account"
                size="lg"
            >
                <AddBankAccount
                    onSuccess={() => {
                        setIsAddModalOpen(false)
                        loadAccounts()
                    }}
                    onCancel={() => setIsAddModalOpen(false)}
                />
            </Modal>

            {editingAccount && (
                <Modal
                    isOpen={!!editingAccount}
                    onClose={() => setEditingAccount(null)}
                    title="Edit Bank Account"
                    size="lg"
                >
                    <EditBankAccount
                        account={editingAccount}
                        onSuccess={() => {
                            setEditingAccount(null)
                            loadAccounts()
                        }}
                        onCancel={() => setEditingAccount(null)}
                    />
                </Modal>
            )}
        </div>
    )
}

export default BankAccountList
