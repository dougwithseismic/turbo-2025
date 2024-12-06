'use client';

import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';

const newsletterSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
});

type NewsletterForm = z.infer<typeof newsletterSchema>;

export const NewsletterForm = () => {
  const form = useForm<NewsletterForm>({
    resolver: zodResolver(newsletterSchema),
    defaultValues: {
      email: '',
    },
  });

  const onSubmit = async (data: NewsletterForm) => {
    try {
      // TODO: Implement newsletter subscription
      console.log('Newsletter subscription:', data);
    } catch (error) {
      console.error('Newsletter subscription failed:', error);
    }
  };

  return (
    <div>
      <h3 className="font-medium text-white mb-3">
        Subscribe to our newsletter
      </h3>
      <p className="text-sm text-gray-400 mb-4">
        Get the latest updates and news delivered to your inbox.
      </p>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-2">
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormControl>
                  <Input
                    type="email"
                    placeholder="Enter your email"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <Button
            type="submit"
            variant="outline"
            disabled={form.formState.isSubmitting}
          >
            {form.formState.isSubmitting ? 'Subscribing...' : 'Subscribe'}
          </Button>
        </form>
      </Form>
    </div>
  );
};
