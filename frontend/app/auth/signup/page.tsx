'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Button, Input } from '@heroui/react'
import { FcGoogle } from 'react-icons/fc'
import { Mail, Lock, User, ArrowRight, Sparkles } from 'lucide-react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { signIn } from 'next-auth/react'
import { signup } from '@/lib/api'
import { signUpSchema, SignUpForm } from '@/lib/schemas/auth-schema'

function SignUpPage() {
  const router = useRouter()

  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<SignUpForm>({
    resolver: zodResolver(signUpSchema),
    defaultValues: {
      fullName: '',
      email: '',
      password: '',
      confirmPassword: '',
      company: '',
    },
  })

  const handleGoogleSignUp = async () => {
    setIsLoading(true)
    setError('')

    try {
      await signIn('google', {
        callbackUrl: '/dashboard',
        redirect: true
      })
    } catch (error) {
      console.error('Google sign-up error:', error)
      setError('Failed to sign up with Google')
      setIsLoading(false)
    }
  }

  const handleEmailSignUp = async (data: SignUpForm) => {
    setIsLoading(true)
    setError('')

    try {
      // Create account in database
      await signup(data.email, data.password, data.fullName)

      // Auto-login with NextAuth after signup
      const result = await signIn('credentials', {
        email: data.email,
        password: data.password,
        redirect: false,
      })

      if (result?.error) {
        setError('Account created but login failed. Please sign in manually.')
        setIsLoading(false)
        return
      }

      if (result?.ok) {
        router.push('/dashboard')
        router.refresh()
      }
    } catch (error: any) {
      console.error('Sign-up error:', error)
      setError(error.message || 'Failed to create account')
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-secondary/5">
      <div className="max-w-7xl mx-auto px-6 py-12">
        <div className="flex items-center justify-center min-h-[80vh]">
          <div className="w-full max-w-md">
            {/* Logo/Brand */}
            <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 mb-4">
            <Sparkles className="h-8 w-8 text-primary" />
            <h1 className="text-3xl font-bold">Epic Voice</h1>
          </div>
          <p className="text-muted-foreground">
            Start your free 14-day trial
          </p>
        </div>

        {/* Auth Card */}
        <div className="bg-card border border-border rounded-xl p-8 shadow-lg">
          {/* Google Sign-Up (Primary CTA) */}
          <Button
            onClick={handleGoogleSignUp}
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
              <span className="px-4 bg-card text-muted-foreground">or sign up with email</span>
            </div>
          </div>

          {/* Email/Password Form */}
          <form onSubmit={handleSubmit(handleEmailSignUp)} className="space-y-4">
            {error && (
              <div className="bg-danger/10 border border-danger text-danger rounded-lg p-3 text-sm">
                {error}
              </div>
            )}

            <Input
              {...register('fullName')}
              type="text"
              label="Full Name"
              labelPlacement="outside"
              placeholder="Your name"
              startContent={<User className="h-4 w-4 text-muted-foreground" />}
              isInvalid={!!errors.fullName}
              errorMessage={errors.fullName?.message}
              disabled={isLoading}
            />

            <Input
              {...register('email')}
              type="email"
              label="Email"
              labelPlacement="outside"
              placeholder="you@company.com"
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
              startContent={<Lock className="h-4 w-4 text-muted-foreground" />}
              isInvalid={!!errors.password}
              errorMessage={errors.password?.message}
              disabled={isLoading}
            />

            <Input
              {...register('confirmPassword')}
              type="password"
              label="Confirm Password"
              labelPlacement="outside"
              placeholder="••••••••"
              startContent={<Lock className="h-4 w-4 text-muted-foreground" />}
              isInvalid={!!errors.confirmPassword}
              errorMessage={errors.confirmPassword?.message}
              disabled={isLoading}
            />

            <Button
              type="submit"
              color="primary"
              size="lg"
              className="w-full"
              isLoading={isLoading}
            >
              Start Free Trial
              <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
          </form>

          {/* Sign In Link */}
          <div className="mt-6 text-center text-sm">
            <span className="text-muted-foreground">Already have an account? </span>
            <Link
              href="/auth/signin"
              className="text-primary hover:underline font-medium"
            >
              Sign in
            </Link>
          </div>
        </div>

        {/* Trust Indicators */}
        <div className="mt-6 text-center text-xs text-muted-foreground space-y-2">
          <p>✓ 14-day free trial • ✓ No credit card required • ✓ 1,000 free minutes</p>
          <p className="text-[10px]">
            By signing up, you agree to our Terms of Service and Privacy Policy
          </p>
        </div>
          </div>
        </div>
      </div>
    </div>
  )
}


export default SignUpPage
