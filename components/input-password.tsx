'use client'

import * as React from 'react'
import { useId, useMemo, useState } from 'react'
import { ViewIcon, ViewOffSlashIcon, CheckmarkCircle02Icon, CancelCircleIcon } from '@hugeicons/core-free-icons'
import { HugeiconsIcon } from '@hugeicons/react'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

import { cn } from '@/lib/utils'

const requirements = [
  { regex: /.{8,}/, text: 'At least 8 characters' },
  { regex: /[a-z]/, text: 'At least 1 lowercase letter' },
  { regex: /[A-Z]/, text: 'At least 1 uppercase letter' },
  { regex: /[0-9]/, text: 'At least 1 number' },
  {
    regex: /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>/?]/,
    text: 'At least 1 special character'
  }
]

type InputPasswordProps = Omit<
  React.InputHTMLAttributes<HTMLInputElement>,
  'type'
> & {
  showStrengthIndicator?: boolean
}

const InputPassword = React.forwardRef<HTMLInputElement, InputPasswordProps>(
  ({ className, showStrengthIndicator = true, value, onChange, ...props }, ref) => {
    const [password, setPassword] = useState(typeof value === 'string' ? value : '')
    const [isVisible, setIsVisible] = useState(false)

    const id = useId()

    // Sync with controlled value
    React.useEffect(() => {
      if (value !== undefined) {
        setPassword(typeof value === 'string' ? value : '')
      }
    }, [value])

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const newValue = e.target.value
      setPassword(newValue)
      if (onChange) {
        onChange(e)
      }
    }

    const toggleVisibility = () => setIsVisible(prevState => !prevState)

    const strength = requirements.map(req => ({
      met: req.regex.test(password),
      text: req.text
    }))

    const strengthScore = useMemo(() => {
      return strength.filter(req => req.met).length
    }, [strength])

    const getColor = (score: number) => {
      if (score === 0) return 'bg-border'
      if (score <= 1) return 'bg-destructive'
      if (score <= 2) return 'bg-orange-500 '
      if (score <= 3) return 'bg-amber-500'
      if (score === 4) return 'bg-yellow-400'

      return 'bg-green-500'
    }

    const getText = (score: number) => {
      if (score === 0) return 'Enter a password'
      if (score <= 2) return 'Weak password'
      if (score <= 3) return 'Medium password'
      if (score === 4) return 'Strong password'

      return 'Very strong password'
    }

    return (
      <div className={cn('w-full space-y-2', className)}>
        <div className='relative'>
          <Input
            id={id}
            type={isVisible ? 'text' : 'password'}
            placeholder={props.placeholder || 'Password'}
            value={password}
            onChange={handleChange}
            className='pr-9'
            ref={ref}
            {...props}
          />
          <Button
            type='button'
            variant='ghost'
            size='icon'
            onClick={toggleVisibility}
            className='text-muted-foreground focus-visible:ring-ring/50 absolute inset-y-0 right-0 rounded-l-none hover:bg-transparent'
            disabled={props.disabled}
          >
            <HugeiconsIcon icon={isVisible ? ViewOffSlashIcon : ViewIcon} className='size-4' />
            <span className='sr-only'>{isVisible ? 'Hide password' : 'Show password'}</span>
          </Button>
        </div>

        {showStrengthIndicator && (
          <>
            <div className='mb-4 flex h-1 w-full gap-1'>
              {Array.from({ length: 5 }).map((_, index) => (
                <span
                  key={index}
                  className={cn(
                    'h-full flex-1 rounded-full transition-all duration-500 ease-out',
                    index < strengthScore ? getColor(strengthScore) : 'bg-border'
                  )}
                />
              ))}
            </div>

            <p className='text-foreground text-sm font-medium'>{getText(strengthScore)}. Must contain:</p>

            <ul className='mb-4 space-y-1.5'>
              {strength.map((req, index) => (
                <li key={index} className='flex items-center gap-2'>
                  {req.met ? (
                    <HugeiconsIcon icon={CheckmarkCircle02Icon} className='size-4 text-green-600 dark:text-green-400' />
                  ) : (
                    <HugeiconsIcon icon={CancelCircleIcon} className='text-muted-foreground size-4' />
                  )}
                  <span className={cn('text-xs', req.met ? 'text-green-600 dark:text-green-400' : 'text-muted-foreground')}>
                    {req.text}
                    <span className='sr-only'>{req.met ? ' - Requirement met' : ' - Requirement not met'}</span>
                  </span>
                </li>
              ))}
            </ul>
          </>
        )}
      </div>
    )
  }
)

InputPassword.displayName = 'InputPassword'

export default InputPassword
