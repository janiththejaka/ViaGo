'use client'

import { useState } from 'react'
//import { useRouter } from 'next/navigation'
//import Link from 'next/link'
//import SocialLogin from './social-login'

export default function LoginForm() {
  const router = useRouter()
  const [mobileOrEmail, setMobileOrEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    // TODO: Replace with your Spring Boot API endpoint
    // Example: POST to http://your-api.com/api/auth/login
    try {
      console.log('[v0] Login attempt:', { mobileOrEmail, password })
      // const response = await fetch('/api/auth/login', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify({ mobileOrEmail, password })
      // })
      // const data = await response.json()
      // if (!response.ok) throw new Error(data.message)
      // Store token if needed and redirect
      // router.push('/dashboard')
    } catch (err) {
      setError(err.message || 'Login failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-sm text-red-700">
          {error}
        </div>
      )}

      {/* Mobile or Email Input */}
      <div className="space-y-2">
        <label className="block text-sm font-medium text-black">
          Mobile Number or Email
        </label>
        <input
          type="text"
          value={mobileOrEmail}
          onChange={(e) => setMobileOrEmail(e.target.value)}
          placeholder="Enter your mobile or email"
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent text-black placeholder-gray-400"
          required
        />
      </div>

      {/* Password Input */}
      <div className="space-y-2">
        <label className="block text-sm font-medium text-black">
          Password
        </label>
        <div className="relative">
          <input
            type={showPassword ? 'text' : 'password'}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Enter your password"
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent text-black placeholder-gray-400"
            required
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-600 hover:text-black transition-colors"
          >
            {showPassword ? '👁️' : '👁️‍🗨️'}
          </button>
        </div>
      </div>

      {/* Forgot Password Link */}
      <div className="text-right">
        <Link
          href="/forgot-password"
          className="text-sm text-green-600 hover:text-green-700 font-medium transition-colors"
        >
          Forgot Password?
        </Link>
      </div>

      {/* Login Button */}
      <button
        type="submit"
        disabled={loading}
        className="w-full bg-green-600 hover:bg-green-700 disabled:bg-green-400 text-white font-semibold py-3 rounded-lg transition-colors duration-200 min-h-12 flex items-center justify-center"
      >
        {loading ? 'Signing in...' : 'Sign In'}
      </button>

      {/* Divider */}
      <div className="flex items-center gap-3 my-6">
        <div className="flex-1 h-px bg-gray-300"></div>
        <span className="text-sm text-gray-600">OR</span>
        <div className="flex-1 h-px bg-gray-300"></div>
      </div>

      {/* Social Login */}
      <SocialLogin />

      {/* Sign Up Link */}
      <div className="text-center text-sm text-gray-600">
        New to ViaGo?{' '}
        <Link
          href="/signup"
          className="text-green-600 hover:text-green-700 font-semibold transition-colors"
        >
          Sign up
        </Link>
      </div>
    </form>
  )
}
