import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Alert, AlertDescription } from '@/components/ui/alert'

import Form from 'next/form'
import { useActionState } from 'react'

interface AuthFormProps {
  type: 'login' | 'register'
  onSubmit: (email: string, password: string) => Promise<void>
  isLoading?: boolean
}

function SubmitButton({
  type,
  isLoading,
}: {
  type: 'login' | 'register'
  isLoading?: boolean
}) {
  const [, , isPending] = useActionState(async () => {}, null)
  const isDisabled = isLoading || isPending

  return (
    <Button type="submit" disabled={isDisabled}>
      {isDisabled ? (
        <div className="flex items-center justify-center">
          <div className="animate-spin rounded-full h-5 w-5 border-t-4 border-b-4 border-brand"></div>
        </div>
      ) : type === 'login' ? (
        'Sign In'
      ) : (
        'Sign Up'
      )}
    </Button>
  )
}

export function AuthForm({ type, onSubmit, isLoading }: AuthFormProps) {
  const handleSubmit = async (state: string | null, formData: FormData) => {
    const email = formData.get('email') as string
    const password = formData.get('password') as string

    try {
      await onSubmit(email, password)
      return null
    } catch (err) {
      return err instanceof Error ? err.message : 'An error occurred'
    }
  }

  const [state, formAction, isPending] = useActionState(handleSubmit, null)

  return (
    <Form action={formAction} className="grid gap-6">
      {state && (
        <Alert variant="destructive">
          <AlertDescription>{state}</AlertDescription>
        </Alert>
      )}
      <div className="grid gap-2">
        <div className="grid gap-1">
          <Label className="sr-only" htmlFor="email">
            Email
          </Label>
          <Input
            id="email"
            placeholder="name@example.com"
            type="email"
            autoCapitalize="none"
            autoComplete="email"
            autoCorrect="off"
            name="email"
            required
          />
        </div>
        <div className="grid gap-1">
          <Label className="sr-only" htmlFor="password">
            Password
          </Label>
          <Input
            id="password"
            placeholder="Password"
            type="password"
            autoCapitalize="none"
            autoComplete={
              type === 'login' ? 'current-password' : 'new-password'
            }
            autoCorrect="off"
            name="password"
            required
          />
        </div>
      </div>
      <SubmitButton type={type} isLoading={isLoading} />
    </Form>
  )
}
