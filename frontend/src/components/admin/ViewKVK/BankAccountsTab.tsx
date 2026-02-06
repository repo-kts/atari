import React, { useState, useEffect } from 'react'
import { localStorageService } from '../../../utils/localStorageService'
import { BankAccount } from '../../../types/bankAccount'
import { exportService } from '../../../utils/exportService'
import { DynamicTablePage, TableColumn, ButtonOption } from '../../common/DynamicTablePage'
import { Download, FileSpreadsheet } from 'lucide-react'
import { getMockBankAccounts, getMockKVKs } from '../../../mocks/kvkMockData'

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
        let bankAccounts = localStorageService.getBankAccounts(kvkId)
        let kvks = localStorageService.getKVKDetails()

        if (!bankAccounts || bankAccounts.length === 0) {
            bankAccounts = getMockBankAccounts(kvkId)
        }
        if (!kvks || kvks.length === 0) {
            kvks = getMockKVKs()
        }
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

    const columns: TableColumn[] = [
        { key: 'account_type', label: 'Account Type', sortable: true },
        { key: 'account_name', label: 'Account Name', sortable: true },
        { key: 'bank_name', label: 'Bank Name', sortable: true },
        { key: 'location', label: 'Location', sortable: true },
        { key: 'account_number', label: 'Account Number', sortable: true },
    ]

    const buttonOptions: ButtonOption[] = [
        {
            label: 'Export PDF',
            icon: <Download className="w-4 h-4" />,
            onClick: handleExportPDF,
            disabled: exporting,
        },
        {
            label: 'Export Excel',
            icon: <FileSpreadsheet className="w-4 h-4" />,
            onClick: handleExportExcel,
            disabled: exporting,
        },
    ]

    return (
        <DynamicTablePage
            title={`Bank Accounts (${accounts.length})`}
            description="Manage bank account details for this KVK"
            columns={columns}
            data={accounts}
            buttonOptions={buttonOptions}
            showBreadcrumbs={false}
            showTabs={false}
            showBack={false}
        />
    )
}
