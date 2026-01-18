import React from 'react'
import { Navigate, useParams } from 'react-router-dom'

export const AdminKVKRedirect: React.FC = () => {
    const { id } = useParams<{ id: string }>()
    return <Navigate to={`/forms/about-kvk/view-kvks/${id}`} replace />
}
