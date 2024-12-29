'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { motion, AnimatePresence, useReducedMotion } from 'motion/react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { DragToConfirm } from '@/components/drag-to-confirm'
import { useGetUserOrganizations, useGetUserProjects } from '@repo/supabase'
import type { UserProject } from '@repo/supabase'
import { supabaseClient } from '@/lib/supabase/client'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  getShakeAnimation,
  getReducedShakeAnimation,
} from '@/features/auth/animations/form-animations'
import { createProject } from '../actions/create-project'

type FormSchema = {
  name: string
  organizationId: string
  error: string | null
  shake: boolean
}

export function ProjectCreation() {
  const router = useRouter()
  const prefersReducedMotion = useReducedMotion()
  const [showConfirm, setShowConfirm] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const { data: organizations = [] } = useGetUserOrganizations({
    supabase: supabaseClient,
  })

  const { data: projects = [] } = useGetUserProjects({
    supabase: supabaseClient,
  })

  const validateProjectName = (
    name: string,
    organizationId: string,
    existingProjects: UserProject[],
  ): boolean => {
    const normalizedName = name.toLowerCase().trim()
    return !existingProjects.some(
      (project) =>
        project.name.toLowerCase() === normalizedName &&
        project.organization_id === organizationId,
    )
  }

  const createProjectSchema = (existingProjects: UserProject[]) => {
    const baseSchema = z.object({
      name: z
        .string()
        .min(1, 'Project name is required')
        .transform((name) => name.trim()),
      organizationId: z.string().min(1, 'Organization is required'),
    })

    return baseSchema.refine(
      (data) =>
        validateProjectName(data.name, data.organizationId, existingProjects),
      {
        message: 'A project with this name already exists in this organization',
        path: ['name'], // Show error on the name field
      },
    )
  }

  const form = useForm<FormSchema>({
    resolver: zodResolver(createProjectSchema(projects)),
    defaultValues: {
      name: '',
      organizationId: '',
      error: null,
      shake: false,
    },
    mode: 'onChange',
  })

  const triggerShake = () => {
    form.setValue('shake', true)
    setTimeout(() => form.setValue('shake', false), 500)
  }

  const onSubmit = async (data: FormSchema): Promise<boolean> => {
    try {
      setIsSubmitting(true)
      const project = await createProject({
        name: data.name.trim(),
        organizationId: data.organizationId,
      })
      router.push(`/project/${project.id}`)
      return true
    } catch (error) {
      form.setValue(
        'error',
        error instanceof Error ? error.message : 'An error occurred',
      )
      triggerShake()
      setShowConfirm(false)
      return false
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleFormSubmit = form.handleSubmit(
    () => {
      // Only show confirm if form is valid and dirty
      if (isValid && isDirty) {
        setShowConfirm(true)
      }
    },
    (errors) => {
      // On validation errors, trigger shake animation
      console.error('Validation errors:', errors)
      // Set a generic error message
      form.setValue(
        'error',
        'Please fix the validation errors before continuing',
      )
      triggerShake()
    },
  )

  const shakeAnimation = prefersReducedMotion
    ? getReducedShakeAnimation()
    : getShakeAnimation(4)

  const formValues = form.watch()
  const isValid = form.formState.isValid && !form.formState.isValidating
  const isDirty = form.formState.isDirty

  const handleOrganizationChange = (value: string) => {
    form.setValue('organizationId', value)
    form.trigger('name')
    form.clearErrors()
    form.setValue('error', null)
  }

  if (showConfirm) {
    return (
      <motion.div
        animate={formValues.shake ? shakeAnimation.shake : { opacity: 1, y: 0 }}
        className="space-y-6"
      >
        <AnimatePresence mode="wait">
          {formValues.error && (
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
                <AlertDescription>{formValues.error}</AlertDescription>
              </Alert>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="flex flex-col gap-2">
          <h2 className="text-lg font-medium">Confirm Project Creation</h2>
          <p className="text-sm text-muted-foreground">
            You are about to create a project named &quot;{formValues.name}
            &quot;
          </p>
        </div>
        <DragToConfirm
          onConfirm={() => onSubmit(formValues)}
          label="Drag to create project"
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
      animate={formValues.shake ? shakeAnimation.shake : { opacity: 1, y: 0 }}
      onSubmit={handleFormSubmit}
      className="flex flex-col gap-6 w-full"
    >
      <AnimatePresence mode="wait">
        {formValues.error && (
          <motion.div
            key="error"
            initial={{ opacity: 0, height: prefersReducedMotion ? 'auto' : 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: prefersReducedMotion ? 'auto' : 0 }}
          >
            <Alert variant="destructive" className="bg-secondary-foreground">
              <AlertDescription>{formValues.error}</AlertDescription>
            </Alert>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="grid gap-4">
        <div className="grid gap-2">
          <Label htmlFor="organization">Organization</Label>
          <Select
            value={formValues.organizationId}
            onValueChange={handleOrganizationChange}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select an organization" />
            </SelectTrigger>
            <SelectContent>
              {organizations.map((org) => (
                <SelectItem key={org.id} value={org.id}>
                  {org.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {form.formState.errors.organizationId && (
            <p className="text-sm text-destructive">
              {form.formState.errors.organizationId.message}
            </p>
          )}
        </div>

        <div className="grid gap-2">
          <Label htmlFor="name">Project Name</Label>
          <motion.div whileTap={prefersReducedMotion ? {} : { scale: 0.995 }}>
            <Input
              id="name"
              {...form.register('name', {
                onChange: () => {
                  form.setValue('error', null)
                },
              })}
              placeholder="Enter project name"
              disabled={isSubmitting}
              className="transition-all duration-200 dark:bg-background dark:text-foreground dark:border-input"
            />
          </motion.div>
          {form.formState.errors.name && (
            <p className="text-sm text-destructive">
              {form.formState.errors.name.message}
            </p>
          )}
        </div>
      </div>

      <motion.div whileTap={prefersReducedMotion ? {} : { scale: 0.98 }}>
        <Button
          type="submit"
          disabled={isSubmitting || !isValid || !isDirty}
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
