"use client"

import { VerifyEmailForm } from './components/verify-email-form'

export function VerifyEmail() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-4">
      <div className="w-full max-w-md space-y-6">
        <div className="text-center">
          <h1 className="text-2xl font-bold">Verify Your Email</h1>
          <p className="text-muted-foreground mt-2">
            Please verify your email address to continue
          </p>
        </div>
        <VerifyEmailForm />
      </div>
    </div>
  )
}
