import { stripe } from '..'
import type { Stripe } from 'stripe'

export interface ListProductsParams {
  /** Filter for active/inactive products */
  active?: boolean
  /** Maximum number of products to return */
  limit?: number
  /** Cursor for pagination, using the last product ID */
  starting_after?: string
  /** Filter products by type */
  type?: 'good' | 'service'
}

/**
 * Lists all products with optional filtering
 *
 * @example
 * ```typescript
 * // Get all active products (default 10 per page)
 * const products = await listProducts()
 *
 * // Get 20 active service products
 * const products = await listProducts({
 *   active: true,
 *   limit: 20,
 *   type: 'service'
 * })
 *
 * // Get next page using cursor
 * const nextPage = await listProducts({
 *   starting_after: products.data[products.data.length - 1].id
 * })
 * ```
 *
 * @param params - Optional parameters for filtering products
 * @returns Promise<Stripe.Response<Stripe.ApiList<Stripe.Product>>> - A paginated list of Stripe products
 */
export const listProducts = async ({
  active = true,
  limit = 10,
  starting_after,
  type,
}: ListProductsParams = {}) => {
  return stripe.products.list({
    active,
    limit,
    starting_after,
    type,
    expand: ['data.default_price'],
  })
}

/**
 * Retrieves a specific product by ID with its default price expanded
 *
 * @example
 * ```typescript
 * // Get a specific product
 * const product = await getProduct('prod_xyz123')
 * console.log(product.name, product.default_price)
 * ```
 *
 * @param productId - The ID of the product to retrieve
 * @returns Promise<Stripe.Product> - The Stripe product with expanded default price
 */
export const getProduct = async (productId: string) => {
  return stripe.products.retrieve(productId, {
    expand: ['default_price'],
  })
}

/**
 * Lists all active prices for a specific product
 *
 * @example
 * ```typescript
 * // Get all prices for a product
 * const prices = await listProductPrices('prod_xyz123')
 *
 * // Access price information
 * prices.data.forEach(price => {
 *   console.log({
 *     id: price.id,
 *     currency: price.currency,
 *     unitAmount: price.unit_amount,
 *     recurring: price.recurring
 *   })
 * })
 * ```
 *
 * @param productId - The ID of the product to list prices for
 * @returns Promise<Stripe.Response<Stripe.ApiList<Stripe.Price>>> - A list of active prices for the product
 */
export const listProductPrices = async (productId: string) => {
  return stripe.prices.list({
    product: productId,
    active: true,
    expand: ['data.product'],
  })
}

/**
 * Creates a formatted product list with simplified price information
 *
 * @example
 * ```typescript
 * // Get formatted products
 * const products = await getFormattedProducts()
 *
 * // Example product structure
 * console.log(products[0])
 * // {
 * //   id: 'prod_xyz123',
 * //   name: 'Premium Plan',
 * //   description: 'Access to all features',
 * //   image: 'https://...',
 * //   active: true,
 * //   defaultPrice: {
 * //     id: 'price_xyz123',
 * //     currency: 'usd',
 * //     unitAmount: 2000,
 * //     type: 'recurring',
 * //     recurring: { interval: 'month' }
 * //   },
 * //   metadata: { ... }
 * // }
 * ```
 *
 * @param params - Optional parameters for filtering products (same as listProducts)
 * @returns Promise<Array<{
 *   id: string
 *   name: string
 *   description: string | null
 *   image: string | undefined
 *   active: boolean
 *   defaultPrice: {
 *     id: string
 *     currency: string
 *     unitAmount: number | null
 *     type: string
 *     recurring: Stripe.Price.Recurring | null
 *   } | null
 *   metadata: Stripe.Metadata
 * }>> - Array of formatted products with simplified price information
 */
export const getFormattedProducts = async (params: ListProductsParams = {}) => {
  const products = await listProducts(params)

  return products.data.map((product) => {
    const defaultPrice = product.default_price as Stripe.Price
    return {
      id: product.id,
      name: product.name,
      description: product.description,
      image: product.images?.[0],
      active: product.active,
      defaultPrice: defaultPrice
        ? {
            id: defaultPrice.id,
            currency: defaultPrice.currency,
            unitAmount: defaultPrice.unit_amount,
            type: defaultPrice.type,
            recurring: defaultPrice.recurring,
          }
        : null,
      metadata: product.metadata,
    }
  })
}
