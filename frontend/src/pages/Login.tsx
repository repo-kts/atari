import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '../stores/authStore'
import { Input } from '../components/ui/Input'
import { Button } from '../components/ui/Button'
import { AlertCircle, Eye, EyeOff } from 'lucide-react'

export const Login: React.FC = () => {
    const navigate = useNavigate()
    const { login, isAuthenticated, isLoading, error, clearError } = useAuthStore()

    useEffect(() => {
        if (isAuthenticated) {
            navigate('/dashboard', { replace: true })
        }
    }, [isAuthenticated, navigate])

    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [showPassword, setShowPassword] = useState(false)

    // Clear error when user starts typing
    useEffect(() => {
        if (error) {
            const timer = setTimeout(() => clearError(), 5000) // Auto-clear after 5s
            return () => clearTimeout(timer)
        }
    }, [error, clearError])

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        clearError()

        const success = await login({ email, password })
        if (success) {
            navigate('/dashboard')
        }
    }


    return (
        <div className="min-h-screen flex">
            {/* Left Panel - Image with Overlay */}
            <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden">
                {/* Background Image */}
                <div
                    className="absolute inset-0 bg-cover bg-center"
                    style={{
                        backgroundImage: 'url(/images/auth-left.png)'
                    }}
                    aria-hidden="true"
                />

                {/* Dark Overlay at bottom for text readability */}
                <div className="absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-black/70 via-black/50 to-transparent" />

                {/* Content Overlay - Bottom Positioned */}
                <div className="relative z-10 flex flex-col justify-end px-8 pb-8 text-white">
                    <div>
                        <p className="text-xs font-medium uppercase tracking-wider text-white/90 mb-2">
                            AMS - ATARI ZONE (IV) PATNA
                        </p>
                        <h1 className="text-xl font-bold leading-tight mb-3">
                            ICAR - Agricultural Technology Application Research Institute
                        </h1>
                        <p className="text-sm text-white/90 leading-relaxed">
                            Coordination and Monitoring of Technology Application and Frontline Extension Education Programmes.
                            Strengthening Agricultural Extension Research and Knowledge Management.
                        </p>
                    </div>
                </div>
            </div>

            {/* Right Panel - Login Form */}
            <div className="w-full lg:w-1/2 flex items-center justify-center bg-[#FAF9F6] px-4 sm:px-6 lg:px-12 py-12">
                <div className="w-full max-w-md">
                    {/* Logos */}
                    <div className="flex items-center justify-between mb-8">
                        <div className="flex items-center gap-3">
                            <img
                                src="/logos/icar.png"
                                alt="ICAR Logo"
                                className="h-12 w-auto"
                            />
                        </div>
                        <div className="flex flex-col items-end">
                            <img
                                src="/logos/atari-patna.png"
                                alt="ATARI Patna Logo"
                                className="h-10 w-auto"
                            />
                        </div>
                    </div>

                    {/* Welcome Message */}
                    <div className="mb-8">
                        <h2 className="text-3xl font-bold text-[#487749] mb-2">
                            Welcome Back!
                        </h2>
                        <p className="text-[#757575] text-sm">
                            Sign in to continue to your account
                        </p>
                    </div>

                    {/* Login Form */}
                    <form onSubmit={handleSubmit} className="space-y-5">
                        <div>
                            <Input
                                label="Username"
                                type="text"
                                value={email}
                                onChange={e => setEmail(e.target.value)}
                                placeholder="Enter Username"
                                required
                                autoFocus
                            />
                        </div>

                        <div>
                            <Input
                                label="Password"
                                type={showPassword ? 'text' : 'password'}
                                value={password}
                                onChange={e => setPassword(e.target.value)}
                                placeholder="Enter Password"
                                required
                                rightIcon={
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="text-[#757575] hover:text-[#487749] transition-colors focus:outline-none"
                                        tabIndex={-1}
                                    >
                                        {showPassword ? (
                                            <EyeOff className="w-5 h-5" />
                                        ) : (
                                            <Eye className="w-5 h-5" />
                                        )}
                                    </button>
                                }
                            />
                        </div>

                        {error && (
                            <div className="flex items-center gap-2 p-4 bg-red-50 border border-red-200 rounded-xl text-red-600 text-sm">
                                <AlertCircle className="w-4 h-4 shrink-0" />
                                <span>{error}</span>
                            </div>
                        )}

                        <Button
                            type="submit"
                            variant="primary"
                            className="w-full"
                            disabled={isLoading}
                        >
                            {isLoading ? 'Logging in...' : 'Continue'}
                        </Button>
                    </form>

                    {/* Support Links */}
                    <div className="mt-8 space-y-3 text-center">
                        <a
                            href="#"
                            className="block text-sm text-blue-600 hover:text-blue-700 hover:underline transition-colors"
                        >
                            Download User Manual
                        </a>
                        <div className="text-sm">
                            <span className="text-red-600">Feedback / Help & Support: </span>
                            <a
                                href="#"
                                className="text-blue-600 hover:text-blue-700 hover:underline transition-colors"
                            >
                                Google Form
                            </a>
                        </div>
                        <p className="text-sm text-[#212121]">
                            Or reach out to us at{' '}
                            <a
                                href="mailto:atariams.kvk@gmail.com"
                                className="text-blue-600 hover:text-blue-700 hover:underline transition-colors"
                            >
                                atariams.kvk@gmail.com
                            </a>
                        </p>
                    </div>

                    {/* Quick Login (Demo) - Removed: Use real API authentication */}
                </div>
            </div>
        </div>
    )
}
