'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence, useReducedMotion } from 'motion/react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { useToast } from '@/components/ui/use-toast'
import { DragToConfirm } from '@/components/drag-to-confirm'
import { createOrganization } from '@/features/organization-creation/actions/create-organization'
import {
  getShakeAnimation,
  getReducedShakeAnimation,
} from '@/features/auth/animations/form-animations'

interface FormData {
  name: string
  error: string | null
  shake: boolean
}

export function OrganizationCreation() {
  const router = useRouter()
  const { toast } = useToast()
  const prefersReducedMotion = useReducedMotion()
  const [formData, setFormData] = useState<FormData>({
    name: '',
    error: null,
    shake: false,
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)

  const triggerShake = () => {
    setFormData((prev) => ({ ...prev, shake: true }))
    setTimeout(() => setFormData((prev) => ({ ...prev, shake: false })), 500)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.name.trim()) {
      setFormData((prev) => ({
        ...prev,
        error: 'Please enter an organization name',
      }))
      triggerShake()
      return
    }
    setShowConfirm(true)
  }

  const handleConfirm = async (): Promise<boolean> => {
    try {
      setIsSubmitting(true)
      const org = await createOrganization({ name: formData.name.trim() })
      toast({
        title: 'Success',
        description: 'Organization created successfully',
      })
      router.push(`/org/${org.id}`)
      return true
    } catch (error) {
      setFormData((prev) => ({
        ...prev,
        error:
          error instanceof Error
            ? error.message
            : 'Failed to create organization',
      }))
      triggerShake()
      setShowConfirm(false)
      return false
    } finally {
      setIsSubmitting(false)
    }
  }

  const shakeAnimation = prefersReducedMotion
    ? getReducedShakeAnimation()
    : getShakeAnimation(4)

  if (showConfirm) {
    return (
      <motion.div
        animate={formData.shake ? shakeAnimation.shake : { opacity: 1, y: 0 }}
        className="space-y-6"
      >
        <AnimatePresence mode="wait">
          {formData.error && (
            <motion.div
              key="error"
              initial={{
                opacity: 0,
                height: prefersReducedMotion ? 'auto' : 0,
              }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: prefersReducedMotion ? 'auto' : 0 }}
            >
              <Alert variant="destructive" className="bg-secondary-foreground">
                <AlertDescription>{formData.error}</AlertDescription>
              </Alert>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="flex flex-col gap-2">
          <h2 className="text-lg font-medium">Confirm Organization Creation</h2>
          <p className="text-sm text-muted-foreground">
            You are about to create an organization named &quot;{formData.name}
            &quot;
          </p>
        </div>
        <DragToConfirm
          onConfirm={handleConfirm}
          label="Drag to create organization"
          disabled={isSubmitting}
        />
        <motion.div whileTap={prefersReducedMotion ? {} : { scale: 0.98 }}>
          <Button
            variant="outline"
            className="w-full"
            onClick={() => setShowConfirm(false)}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
        </motion.div>
      </motion.div>
    )
  }

  return (
    <motion.form
      animate={formData.shake ? shakeAnimation.shake : { opacity: 1, y: 0 }}
      onSubmit={handleSubmit}
      className="space-y-6"
    >
      <AnimatePresence mode="wait">
        {formData.error && (
          <motion.div
            key="error"
            initial={{ opacity: 0, height: prefersReducedMotion ? 'auto' : 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: prefersReducedMotion ? 'auto' : 0 }}
          >
            <Alert variant="destructive" className="bg-secondary-foreground">
              <AlertDescription>{formData.error}</AlertDescription>
            </Alert>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="grid gap-2">
        <div className="grid gap-1">
          <Label htmlFor="name">Organization Name</Label>
          <motion.div whileTap={prefersReducedMotion ? {} : { scale: 0.995 }}>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, name: e.target.value }))
              }
              placeholder="Enter organization name"
              disabled={isSubmitting}
              className="transition-all duration-200 dark:bg-background dark:text-foreground dark:border-input"
            />
          </motion.div>
        </div>
      </div>

      <motion.div whileTap={prefersReducedMotion ? {} : { scale: 0.98 }}>
        <Button
          type="submit"
          disabled={isSubmitting || !formData.name.trim()}
          className="w-full dark:bg-primary dark:text-primary-foreground dark:hover:bg-primary/90"
        >
          {isSubmitting ? (
            <div className="flex items-center justify-center">
              <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-current" />
            </div>
          ) : (
            'Continue'
          )}
        </Button>
      </motion.div>
    </motion.form>
  )
}
