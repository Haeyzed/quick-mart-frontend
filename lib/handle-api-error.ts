import { toast } from 'sonner'
import { FieldValues, UseFormSetError, Path } from 'react-hook-form'

/**
 * Handle API errors and show messages via Sonner
 * Also sets form errors for 422 validation errors
 */
export function handleApiError<T extends FieldValues>(
  error: any,
  setError?: UseFormSetError<T>
): void {
  const status = error?.status || error?.response?.status
  const message = error?.message || 'An error occurred'
  const errors = error?.errors || error?.response?.data?.errors

  // Handle 422 validation errors - set form errors
  if (status === 422 && errors && setError) {
    Object.entries(errors).forEach(([field, messages]) => {
      const fieldName = field as Path<T>
      const errorMessages = Array.isArray(messages) ? messages : [messages]
      setError(fieldName, {
        type: 'server',
        message: errorMessages[0] as string,
      })
    })
    // Show general error message
    toast.error(message || 'Validation failed. Please check the form.')
    return
  }

  // For other errors, show toast message
  if (status === 401) {
    toast.error('Unauthorized. Please sign in again.')
  } else if (status === 403) {
    toast.error('You do not have permission to perform this action.')
  } else if (status === 404) {
    toast.error('Resource not found.')
  } else if (status === 422) {
    toast.error(message || 'Validation failed. Please check the form.')
  } else if (status === 500) {
    toast.error('Server error. Please try again later.')
  } else {
    toast.error(message)
  }
}

