'use client'

import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useUpdateProject, useGetProject } from '@repo/supabase'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from '@/components/ui/form'
import { supabaseClient } from '@/lib/supabase/client'
import { useParams } from 'next/navigation'
import { useEffect } from 'react'

const formSchema = z.object({
  name: z.string().min(1, 'Name is required'),
})

type FormValues = z.infer<typeof formSchema>

export const ProjectNameField = () => {
  const params = useParams()
  const projectId = params.id as string

  const { data: project } = useGetProject({
    supabase: supabaseClient,
    projectId,
  })

  const { mutate: updateProject } = useUpdateProject({
    supabase: supabaseClient,
  })

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: project?.name || '',
    },
  })

  // Update form when project data is loaded
  useEffect(() => {
    if (project) {
      form.reset({
        name: project.name,
      })
    }
  }, [project, form])

  const handleSubmit = (values: FormValues) => {
    updateProject({
      projectId: params.id as string,
      updates: {
        name: values.name,
      },
    })
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-2">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <Label>Project Name</Label>
              <FormControl>
                <Input {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </form>
    </Form>
  )
}
