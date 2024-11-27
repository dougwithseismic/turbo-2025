import { stripe } from '..'
import type { CreateCustomerParams } from '../types'

/**
 * Creates a new Stripe customer
 *
 * @example
 * ```typescript
 * // Create a basic customer
 * const customer = await createCustomer({
 *   email: 'user@example.com',
 *   name: 'John Doe'
 * })
 *
 * // Create a customer with metadata
 * const customer = await createCustomer({
 *   email: 'user@example.com',
 *   name: 'John Doe',
 *   metadata: {
 *     userId: '123',
 *     plan: 'premium'
 *   }
 * })
 * ```
 *
 * @param params - Parameters for creating the customer
 * @param params.email - Customer's email address
 * @param params.name - Optional customer's full name
 * @param params.metadata - Optional metadata to attach to the customer
 * @returns Promise<Stripe.Customer> - The created customer
 */
export const createCustomer = async ({
  email,
  name,
  metadata,
}: CreateCustomerParams) => {
  return stripe.customers.create({
    email,
    name,
    metadata,
  })
}

/**
 * Retrieves a customer by ID
 *
 * @example
 * ```typescript
 * // Get customer details
 * const customer = await getCustomer('cus_xyz123')
 *
 * // Access customer information
 * console.log({
 *   email: customer.email,
 *   name: customer.name,
 *   defaultPaymentMethod: customer.default_source
 * })
 * ```
 *
 * @param customerId - The ID of the customer to retrieve
 * @returns Promise<Stripe.Customer> - The retrieved customer
 */
export const getCustomer = async (customerId: string) => {
  return stripe.customers.retrieve(customerId)
}

/**
 * Updates a customer's details
 *
 * @example
 * ```typescript
 * // Update customer name
 * const updatedCustomer = await updateCustomer('cus_xyz123', {
 *   name: 'Jane Doe'
 * })
 *
 * // Update customer metadata
 * const updatedCustomer = await updateCustomer('cus_xyz123', {
 *   metadata: {
 *     plan: 'enterprise',
 *     status: 'active'
 *   }
 * })
 * ```
 *
 * @param customerId - The ID of the customer to update
 * @param data - The customer data to update
 * @returns Promise<Stripe.Customer> - The updated customer
 */
export const updateCustomer = async (
  customerId: string,
  data: Partial<CreateCustomerParams>,
) => {
  return stripe.customers.update(customerId, data)
}

/**
 * Deletes a customer
 *
 * @example
 * ```typescript
 * // Delete a customer
 * const deletedCustomer = await deleteCustomer('cus_xyz123')
 *
 * // Verify deletion
 * console.log(deletedCustomer.deleted) // true
 * ```
 *
 * @param customerId - The ID of the customer to delete
 * @returns Promise<Stripe.DeletedCustomer> - The deleted customer object
 * @throws Will throw if the customer cannot be deleted (e.g., has active subscriptions)
 */
export const deleteCustomer = async (customerId: string) => {
  return stripe.customers.del(customerId)
}
