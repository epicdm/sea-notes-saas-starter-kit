'use client'

import { Suspense, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { Button, Input } from '@heroui/react'
import { FcGoogle } from 'react-icons/fc'
import { Mail, Lock, ArrowRight, Sparkles } from 'lucide-react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { signIn } from 'next-auth/react'
import { signInSchema, SignInForm } from '@/lib/schemas/auth-schema'

function SignInForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const callbackUrl = searchParams.get('callbackUrl') || '/dashboard'

  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<SignInForm>({
    resolver: zodResolver(signInSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  })

  const handleGoogleSignIn = async () => {
    setIsLoading(true)
    setError('')

    try {
      await signIn('google', {
        callbackUrl,
        redirect: true
      })
    } catch (error) {
      console.error('Google sign-in error:', error)
      setError('Failed to sign in with Google')
      setIsLoading(false)
    }
  }

  const handleEmailSignIn = async (data: SignInForm) => {
    setIsLoading(true)
    setError('')

    try {
      const result = await signIn('credentials', {
        email: data.email,
        password: data.password,
        redirect: false,
      })

      if (result?.error) {
        setError('Invalid email or password')
        setIsLoading(false)
        return
      }

      if (result?.ok) {
        router.push(callbackUrl)
        router.refresh()
      }
    } catch (error) {
      console.error('Sign-in error:', error)
      setError('Failed to sign in')
      setIsLoading(false)
    }
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-primary/5 via-background to-secondary/5 px-4">
      <div className="w-full max-w-md">
        {/* Logo/Brand */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 mb-4">
            <Sparkles className="h-8 w-8 text-primary" />
            <h1 className="text-3xl font-bold">Epic Voice</h1>
          </div>
          <p className="text-muted-foreground">
            Sign in to build AI voice agents
          </p>
        </div>

        {/* Auth Card */}
        <div className="bg-card border border-border rounded-xl p-8 shadow-lg">
          {/* Google Sign-In (Primary CTA) */}
          <Button
              onClick={handleGoogleSignIn}
              disabled={isLoading}
              size="lg"
              className="w-full mb-6 bg-white hover:bg-gray-50 text-gray-900 border border-gray-300"
            >
              <FcGoogle className="h-5 w-5 mr-2" />
              Continue with Google
            </Button>

            {/* Divider */}
            <div className="relative mb-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-border"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-4 bg-card text-muted-foreground">or continue with email</span>
              </div>
            </div>

            {/* Email/Password Form */}
            <form onSubmit={handleSubmit(handleEmailSignIn)} className="space-y-4">
              {error && (
                <div className="bg-danger/10 border border-danger text-danger rounded-lg p-3 text-sm">
                  {error}
                </div>
              )}

              <Input
                {...register('email')}
                type="email"
                label="Email"
                labelPlacement="outside"
                placeholder="you@company.com"
                autoComplete="email"
                startContent={<Mail className="h-4 w-4 text-muted-foreground" />}
                isInvalid={!!errors.email}
                errorMessage={errors.email?.message}
                disabled={isLoading}
              />

              <Input
                {...register('password')}
                type="password"
                label="Password"
                labelPlacement="outside"
                placeholder="••••••••"
                autoComplete="current-password"
                startContent={<Lock className="h-4 w-4 text-muted-foreground" />}
                isInvalid={!!errors.password}
                errorMessage={errors.password?.message}
                disabled={isLoading}
              />

              <Button
                type="submit"
                color="primary"
                size="lg"
                className="w-full"
                isLoading={isLoading}
              >
                Sign In
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            </form>

            {/* Sign Up Link */}
            <div className="mt-6 text-center text-sm">
              <span className="text-muted-foreground">Don't have an account? </span>
              <Link
                href="/auth/signup"
                className="text-primary hover:underline font-medium"
              >
                Sign up for free
              </Link>
            </div>
        </div>

        {/* Trust Indicators */}
        <div className="mt-6 text-center text-xs text-muted-foreground">
          <p>✓ 14-day free trial • ✓ No credit card required • ✓ 1,000 free minutes</p>
        </div>
      </div>
    </div>
  )
}


export default function SignInPage() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-primary/5 via-background to-secondary/5">
        <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-primary border-r-transparent"></div>
      </div>
    }>
      <SignInForm />
    </Suspense>
  )
}
