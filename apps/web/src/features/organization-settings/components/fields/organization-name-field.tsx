'use client'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useUpdateOrganization } from '@repo/supabase'
import type { Organization } from '@repo/supabase'
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

const formSchema = z.object({
  name: z.string().min(1, 'Name is required'),
})

type FormValues = z.infer<typeof formSchema>

interface OrganizationNameFieldProps {
  organization: Organization
}

export const OrganizationNameField = ({
  organization,
}: OrganizationNameFieldProps) => {
  const { mutate: updateOrganization } = useUpdateOrganization({
    supabase: supabaseClient,
  })

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: organization.name,
    },
  })

  const handleSubmit = (values: FormValues) => {
    updateOrganization({
      orgId: organization.id,
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
              <Label>Organization Name</Label>
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
