import React, { useState, useEffect } from 'react'
import { localStorageService } from '../../../utils/localStorageService'
import { searchService } from '../../../utils/searchService'
import { exportService } from '../../../utils/exportService'
import { BankAccount } from '../../../types/bankAccount'
import { Card, CardContent } from '../../ui/Card'
import { Button } from '../../ui/Button'
import { Search, Download, FileSpreadsheet } from 'lucide-react'

export const AllBankAccounts: React.FC = () => {
    const [accounts, setAccounts] = useState<BankAccount[]>([])
    const [filteredAccounts, setFilteredAccounts] = useState<BankAccount[]>([])
    const [searchQuery, setSearchQuery] = useState('')
    const [accountTypeFilter, setAccountTypeFilter] = useState<string>('')
    const [exporting, setExporting] = useState(false)

    useEffect(() => {
        loadAccounts()
    }, [])

    useEffect(() => {
        let filtered = accounts

        if (searchQuery.trim()) {
            filtered = searchService.searchBankAccounts(searchQuery, undefined, {
                account_type: accountTypeFilter || undefined,
            })
        } else if (accountTypeFilter) {
            filtered = accounts.filter(acc => acc.account_type === accountTypeFilter)
        } else {
            filtered = accounts
        }

        setFilteredAccounts(filtered)
    }, [searchQuery, accountTypeFilter, accounts])

    const loadAccounts = () => {
        const allAccounts = localStorageService.getBankAccounts()
        // Load KVK details for each account
        const kvks = localStorageService.getKVKDetails()
        const accountsWithKvk = allAccounts.map(acc => {
            const kvk = kvks.find(k => k.id === acc.kvk_id)
            return { ...acc, kvk }
        })
        setAccounts(accountsWithKvk)
        setFilteredAccounts(accountsWithKvk)
    }

    const handleExportPDF = async () => {
        setExporting(true)
        try {
            await exportService.exportToPDF(
                filteredAccounts,
                'bank',
                { filename: `all-bank-accounts-${new Date().getTime()}.pdf` }
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
                `all-bank-accounts-${new Date().getTime()}`
            )
        } catch (error) {
            console.error('Export failed:', error)
            alert('Failed to export Excel')
        } finally {
            setExporting(false)
        }
    }

    const accountTypes = Array.from(new Set(accounts.map(acc => acc.account_type)))

    return (
        <div className="space-y-6">
            <Card>
                <CardContent className="p-6">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
                        <h2 className="text-2xl font-bold text-emerald-700">
                            All Bank Accounts
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
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[#757575] w-5 h-5" />
                            <input
                                type="text"
                                placeholder="Search by KVK name, bank name, account number..."
                                value={searchQuery}
                                onChange={e => setSearchQuery(e.target.value)}
                                className="w-full h-12 pl-10 pr-4 border border-[#E0E0E0] rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 bg-white text-[#212121]"
                            />
                        </div>
                        <div>
                            <select
                                value={accountTypeFilter}
                                onChange={e => setAccountTypeFilter(e.target.value)}
                                className="w-full h-12 px-4 border border-[#E0E0E0] rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 bg-white text-[#212121]"
                            >
                                <option value="">All Account Types</option>
                                {accountTypes.map(type => (
                                    <option key={type} value={type}>
                                        {type}
                                    </option>
                                ))}
                            </select>
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
                                    <tr className="bg-emerald-50 border-b border-[#E0E0E0]">
                                        <th className="px-4 py-3 text-left text-sm font-semibold text-emerald-700">
                                            KVK Name
                                        </th>
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
                                    {filteredAccounts.map(account => (
                                        <tr
                                            key={account.id}
                                            className="border-b border-[#E0E0E0] hover:bg-[#FAFAFA]"
                                        >
                                            <td className="px-4 py-3 text-[#212121]">
                                                {account.kvk?.kvk_name || '-'}
                                            </td>
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
        </div>
    )
}
