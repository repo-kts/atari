import React, { useState, useEffect } from 'react'
import { localStorageService } from '../../../utils/localStorageService'
import { BankAccount } from '../../../types/bankAccount'
import { Card, CardContent } from '../../ui/Card'
import { exportService } from '../../../utils/exportService'
import { Download, FileSpreadsheet } from 'lucide-react'
import { Button } from '../../ui/Button'

interface BankAccountsTabProps {
    kvkId: number
}

export const BankAccountsTab: React.FC<BankAccountsTabProps> = ({ kvkId }) => {
    const [accounts, setAccounts] = useState<BankAccount[]>([])
    const [exporting, setExporting] = useState(false)

    useEffect(() => {
        loadAccounts()
    }, [kvkId])

    const loadAccounts = () => {
        const bankAccounts = localStorageService.getBankAccounts(kvkId)
        // Load KVK details for each account
        const kvks = localStorageService.getKVKDetails()
        const accountsWithKvk = bankAccounts.map(acc => {
            const kvk = kvks.find(k => k.id === acc.kvk_id)
            return { ...acc, kvk }
        })
        setAccounts(accountsWithKvk)
    }

    const handleExportPDF = async () => {
        setExporting(true)
        try {
            await exportService.exportToPDF(
                accounts,
                'bank',
                { filename: `bank-accounts-kvk-${kvkId}-${new Date().getTime()}.pdf` }
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
                accounts,
                'bank',
                `bank-accounts-kvk-${kvkId}-${new Date().getTime()}`
            )
        } catch (error) {
            console.error('Export failed:', error)
            alert('Failed to export Excel')
        } finally {
            setExporting(false)
        }
    }

    return (
        <Card>
            <CardContent className="p-6">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
                    <h3 className="text-xl font-bold text-emerald-700">
                        Bank Accounts ({accounts.length})
                    </h3>
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
                    </div>
                </div>

                {accounts.length === 0 ? (
                    <p className="text-[#757575] text-center py-8">
                        No bank accounts found
                    </p>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full border-collapse">
                            <thead>
                                <tr className="bg-emerald-50 border-b border-[#E0E0E0]">
                                    <th className="px-4 py-3 text-left text-sm font-semibold text-emerald-700">
                                        Account Type
                                    </th>
                                    <th className="px-4 py-3 text-left text-sm font-semibold text-emerald-700">
                                        Account Name
                                    </th>
                                    <th className="px-4 py-3 text-left text-sm font-semibold text-emerald-700">
                                        Bank Name
                                    </th>
                                    <th className="px-4 py-3 text-left text-sm font-semibold text-emerald-700">
                                        Location
                                    </th>
                                    <th className="px-4 py-3 text-left text-sm font-semibold text-emerald-700">
                                        Account Number
                                    </th>
                                </tr>
                            </thead>
                            <tbody>
                                {accounts.map(account => (
                                    <tr
                                        key={account.id}
                                        className="border-b border-[#E0E0E0] hover:bg-[#FAFAFA]"
                                    >
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
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </CardContent>
        </Card>
    )
}
