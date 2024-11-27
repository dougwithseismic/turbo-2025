/**
 * Puppeteer service for executing browser automation scenarios.
 * This service provides a high-level API for browser automation tasks using Puppeteer.
 * It supports various interactions like clicking, typing, scrolling, and custom JavaScript evaluation.
 *
 * Key Features:
 * - Concurrent session management
 * - Automatic retry mechanism for failed operations
 * - Screenshot capture
 * - Resource optimization (blocks unnecessary resources)
 * - Comprehensive error handling
 *
 * @class PuppeteerService
 *
 * @example
 * // Basic usage
 * const result = await puppeteerService.executeScenario({
 *   url: 'https://example.com',
 *   interactions: [
 *     {
 *       selector: '.button',
 *       action: 'click'
 *     }
 *   ]
 * });
 *
 * // Advanced usage with multiple interactions and screenshots
 * const result = await puppeteerService.executeScenario({
 *   url: 'https://example.com',
 *   interactions: [
 *     {
 *       selector: 'input[name="search"]',
 *       action: 'type',
 *       value: 'search term',
 *       options: { delay: 100 }
 *     },
 *     {
 *       selector: '.search-button',
 *       action: 'click',
 *       waitAfter: 2000
 *     },
 *     {
 *       selector: '.results',
 *       action: 'evaluate',
 *       value: `(el) => {
 *         return Array.from(el.querySelectorAll('.item')).map(item => ({
 *           title: item.querySelector('.title')?.textContent,
 *           price: item.querySelector('.price')?.textContent
 *         }));
 *       }`
 *     }
 *   ],
 *   captureScreenshots: true
 * });
 */
import puppeteer, {
  Browser,
  Page,
  ConsoleMessage,
  ElementHandle,
} from 'puppeteer'
import { logger } from '../config/logger'

/**
 * Configuration options for the Puppeteer service
 * @interface PuppeteerServiceConfig
 * @property {number} maxConcurrentSessions - Maximum number of concurrent browser sessions allowed
 * @property {number} defaultNavigationTimeout - Default timeout for page navigation in milliseconds
 * @property {number} defaultWaitTimeout - Default timeout for waiting operations in milliseconds
 * @property {number} retryAttempts - Number of retry attempts for failed operations
 * @property {number} retryDelay - Delay between retry attempts in milliseconds
 */
interface PuppeteerServiceConfig {
  maxConcurrentSessions: number
  defaultNavigationTimeout: number
  defaultWaitTimeout: number
  retryAttempts: number
  retryDelay: number
}

/**
 * Options for scrolling behavior in browser automation
 * @interface ScrollOptions
 * @property {('auto'|'smooth')} [behavior] - The scrolling behavior animation style
 * @property {('start'|'center'|'end'|'nearest')} [block] - Vertical alignment of the element after scrolling
 * @property {('start'|'center'|'end'|'nearest')} [inline] - Horizontal alignment of the element after scrolling
 */
export interface ScrollOptions {
  behavior?: 'auto' | 'smooth'
  block?: 'start' | 'center' | 'end' | 'nearest'
  inline?: 'start' | 'center' | 'end' | 'nearest'
}

/**
 * Function that returns an ElementHandle for custom element selection logic
 * @example
 * const customSelector: ElementSelectorFunction = async (page) => {
 *   return page.$('.my-dynamic-element');
 * }
 */
export type ElementSelectorFunction = (
  page: Page,
) => Promise<ElementHandle | null>

export type ElementSelector = string | ElementSelectorFunction

/**
 * Available interaction actions for browser automation
 * @example
 * // Click interaction
 * { selector: '.button', action: 'click' }
 *
 * // Type interaction
 * { selector: 'input[name="search"]', action: 'type', value: 'search term' }
 *
 * // Evaluate interaction - runs custom JavaScript on the element
 * {
 *   selector: '.element',
 *   action: 'evaluate',
 *   value: `(el, options) => {
 *     el.textContent = options.text;
 *     return el.getBoundingClientRect();
 *   }`,
 *   options: { text: 'New content' }
 * }
 *
 * // Drag and drop interaction
 * {
 *   selector: '.draggable',
 *   action: 'dragAndDrop',
 *   options: {
 *     targetSelector: '.dropzone',
 *     steps: 10 // Smoothness of drag motion
 *   }
 * }
 */
export type InteractionAction =
  | 'click'
  | 'type'
  | 'hover'
  | 'select'
  | 'focus'
  | 'blur'
  | 'press'
  | 'wait'
  | 'screenshot'
  | 'scroll'
  | 'evaluate'
  | 'clear'
  | 'doubleClick'
  | 'rightClick'
  | 'dragAndDrop'

/**
 * Options for configuring interaction behavior
 * @interface InteractionOptions
 * @property {number} [delay] - Delay between keystrokes for typing actions in milliseconds
 * @property {('left'|'right'|'middle')} [button] - Mouse button to use for click actions
 * @property {number} [clickCount] - Number of clicks to perform
 * @property {boolean} [force] - Whether to force the action even if the element is not visible
 * @property {number} [timeout] - Timeout for the interaction in milliseconds
 * @property {ElementSelector} [targetSelector] - Target element selector for drag and drop actions
 * @property {Array<'Alt'|'Control'|'Meta'|'Shift'>} [modifiers] - Keyboard modifiers to hold during the action
 * @property {ScrollOptions} [scroll] - Options for scroll behavior
 * @property {number} [steps] - Number of steps for smooth mouse movements
 */
export interface InteractionOptions {
  delay?: number
  button?: 'left' | 'right' | 'middle'
  clickCount?: number
  force?: boolean
  timeout?: number
  targetSelector?: ElementSelector
  modifiers?: Array<'Alt' | 'Control' | 'Meta' | 'Shift'>
  scroll?: ScrollOptions
  steps?: number
}

/**
 * Represents a single interaction to be performed
 * @example
 * // Click a button and wait 2 seconds
 * const interaction: Interaction = {
 *   selector: '.submit-button',
 *   action: 'click',
 *   waitAfter: 2000
 * }
 *
 * // Type into an input with delay
 * const interaction: Interaction = {
 *   selector: 'input[name="username"]',
 *   action: 'type',
 *   value: 'johndoe',
 *   options: { delay: 100 }
 * }
 *
 * // Custom element selection and evaluation
 * const interaction: Interaction = {
 *   selector: async (page) => page.$('.dynamic-element'),
 *   action: 'evaluate',
 *   value: '(el, options) => el.setAttribute("data-tested", options.value)',
 *   options: { value: 'true' }
 * }
 */
export interface Interaction {
  selector: ElementSelector
  action: InteractionAction
  value?: string
  waitAfter?: number
  options?: InteractionOptions
}

/**
 * Configuration for a browser automation scenario
 * @example
 * const config: ScenarioConfig = {
 *   url: 'https://example.com',
 *   interactions: [
 *     {
 *       selector: 'input[type="text"]',
 *       action: 'type',
 *       value: 'Hello World'
 *     },
 *     {
 *       selector: 'button[type="submit"]',
 *       action: 'click',
 *       waitAfter: 1000
 *     }
 *   ],
 *   captureScreenshots: true
 * }
 */
export interface ScenarioConfig {
  url: string
  interactions?: Interaction[]
  captureScreenshots?: boolean
}

/**
 * Result of executing a synthetic browser session
 * @example
 * const result: SyntheticSessionResult = {
 *   screenshots: ['base64EncodedImage1', 'base64EncodedImage2'],
 *   completedInteractions: ['click:.button', 'type:input[name="search"]'],
 *   error: undefined
 * }
 */
export interface SyntheticSessionResult {
  screenshots: string[]
  completedInteractions: string[]
  error?: string
}

const VALID_KEYS = [
  'Enter',
  'Escape',
  'ArrowDown',
  'ArrowUp',
  'ArrowLeft',
  'ArrowRight',
  'Backspace',
  'Delete',
  'Tab',
  'Space',
  ...'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'.split(''),
] as const

type KeyInput = (typeof VALID_KEYS)[number]

function isValidKey(key: string): key is KeyInput {
  return VALID_KEYS.includes(key as KeyInput)
}

/**
 * Service for executing browser automation scenarios using Puppeteer
 */
export class PuppeteerService {
  private browser: Browser | null = null
  private activeSessions = 0
  private readonly config: PuppeteerServiceConfig = {
    maxConcurrentSessions: 5,
    defaultNavigationTimeout: 30000,
    defaultWaitTimeout: 5000,
    retryAttempts: 3,
    retryDelay: 1000,
  }

  /**
   * Initializes a new browser instance if one doesn't exist.
   * Configures the browser with optimal settings for automation.
   *
   * @private
   * @returns {Promise<Browser>} The initialized browser instance
   * @throws {Error} If browser initialization fails
   */
  private async initializeBrowser(): Promise<Browser> {
    if (!this.browser) {
      this.browser = await puppeteer.launch({
        headless: false as any,
        args: [
          '--no-sandbox',
          '--disable-setuid-sandbox',
          '--disable-dev-shm-usage',
          '--disable-gpu',
        ],
        defaultViewport: { width: 1920, height: 1080 },
      })

      this.browser.on('disconnected', () => {
        logger.warn('Browser disconnected, will reinitialize on next request')
        this.browser = null
      })
    }
    return this.browser
  }

  /**
   * Executes an operation with automatic retry mechanism.
   * Useful for handling transient failures in browser automation.
   *
   * @private
   * @template T The type of the operation result
   * @param {() => Promise<T>} operation The operation to execute
   * @param {number} [attempts] Number of retry attempts
   * @returns {Promise<T>} The operation result
   * @throws {Error} If all retry attempts fail
   */
  private async withRetry<T>(
    operation: () => Promise<T>,
    attempts = this.config.retryAttempts,
  ): Promise<T> {
    for (let i = 0; i < attempts; i++) {
      try {
        return await operation()
      } catch (err) {
        if (i === attempts - 1) throw err
        logger.warn(`Retry attempt ${i + 1} of ${attempts}`, { error: err })
        await new Promise((resolve) =>
          setTimeout(resolve, this.config.retryDelay),
        )
      }
    }
    throw new Error('Retry operation failed')
  }

  /**
   * Sets up a new page with optimal configuration for automation.
   * Configures timeouts, request interception, and event handlers.
   *
   * @private
   * @param {Page} page The page to configure
   * @returns {Promise<void>}
   */
  private async setupPage(page: Page): Promise<void> {
    page.setDefaultNavigationTimeout(this.config.defaultNavigationTimeout)
    page.setDefaultTimeout(this.config.defaultWaitTimeout)

    await page.setRequestInterception(true)
    page.on('request', (request) => {
      if (
        request.resourceType() === 'image' ||
        request.resourceType() === 'font'
      ) {
        request.abort()
      } else {
        request.continue()
      }
    })

    page.on('console', (msg: ConsoleMessage) =>
      logger.debug(`Browser Console: ${msg.text()}`),
    )

    page.on('error', (err) => logger.error('Page error:', { error: err }))
    page.on('pageerror', (err) => logger.error('Page error:', { error: err }))
  }

  /**
   * Retrieves an element from the page using either a string selector or custom function.
   *
   * @private
   * @param {Page} page The page to search in
   * @param {ElementSelector} selector The selector to use
   * @param {number} [timeout] Optional timeout in milliseconds
   * @returns {Promise<ElementHandle | null>} The found element or null
   */
  private async getElement(
    page: Page,
    selector: ElementSelector,
    timeout?: number,
  ): Promise<ElementHandle | null> {
    if (typeof selector === 'string') {
      return page.waitForSelector(selector, { timeout })
    }
    return selector(page)
  }

  private async getStringSelector(selector: ElementSelector): Promise<string> {
    if (typeof selector === 'string') {
      return selector
    }
    throw new Error('This action requires a string selector')
  }

  /**
   * Performs a single interaction on the page.
   * Supports various types of interactions like clicking, typing, and custom evaluation.
   *
   * @private
   * @param {Page} page The page to interact with
   * @param {Interaction} interaction The interaction to perform
   * @returns {Promise<void>}
   * @throws {Error} If the interaction fails
   */
  private async performInteraction(
    page: Page,
    interaction: Interaction,
  ): Promise<void> {
    await this.withRetry(async () => {
      const element = await this.getElement(
        page,
        interaction.selector,
        interaction.options?.timeout,
      )
      if (!element) {
        throw new Error(
          `Element not found: ${
            typeof interaction.selector === 'string'
              ? interaction.selector
              : 'custom selector function'
          }`,
        )
      }

      switch (interaction.action) {
        case 'click':
          await element.click(interaction.options)
          break

        case 'type':
          if (interaction.value) {
            await element.type(interaction.value, {
              delay: interaction.options?.delay,
            })
          }
          break

        case 'hover':
          await element.hover()
          break

        case 'select':
          if (interaction.value) {
            if (typeof interaction.selector !== 'string') {
              throw new Error('Select action requires a string selector')
            }
            await page.select(interaction.selector, interaction.value)
          }
          break

        case 'focus':
          await element.focus()
          break

        case 'blur':
          await element.evaluate((el: Element) => {
            if (el instanceof HTMLElement && 'blur' in el) {
              ;(
                el as HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
              ).blur()
            }
          })
          break

        case 'press':
          if (interaction.value) {
            const key = interaction.value
            if (isValidKey(key)) {
              await element.press(key as any, interaction.options)
            } else {
              throw new Error(`Invalid key: ${key}`)
            }
          }
          break

        case 'wait':
          if (typeof interaction.selector === 'string') {
            await page.waitForSelector(interaction.selector, {
              timeout: interaction.options?.timeout,
              visible: true,
              ...interaction.options,
            })
          } else {
            // For function selectors, we'll use polling to wait for the element
            const startTime = Date.now()
            const timeout =
              interaction.options?.timeout || this.config.defaultWaitTimeout

            while (Date.now() - startTime < timeout) {
              const element = await interaction.selector(page)
              if (element) {
                const isVisible = await element.isVisible()
                if (isVisible) return
              }
              await new Promise((resolve) => setTimeout(resolve, 100))
            }
            throw new Error(
              'Timeout waiting for element with function selector',
            )
          }
          break

        case 'screenshot':
          await element.screenshot({
            path: interaction.value,
            encoding: 'base64',
            ...interaction.options,
          })
          break

        case 'scroll':
          await element.evaluate((el, options) => {
            el.scrollIntoView({
              behavior: options?.scroll?.behavior || 'smooth',
              block: options?.scroll?.block || 'center',
              inline: options?.scroll?.inline || 'nearest',
            })
          }, interaction.options || {})
          break

        case 'evaluate':
          if (interaction.value) {
            await element.evaluate(
              (el, { value, options }) => {
                const fn = new Function('el', 'options', value)
                return fn(el, options)
              },
              { value: interaction.value, options: interaction.options },
            )
          }
          break

        case 'clear':
          await element.evaluate((el) => {
            if (
              el instanceof HTMLInputElement ||
              el instanceof HTMLTextAreaElement
            ) {
              el.value = ''
              el.dispatchEvent(new Event('input', { bubbles: true }))
              el.dispatchEvent(new Event('change', { bubbles: true }))
            }
          })
          break

        case 'doubleClick':
          await element.click({ clickCount: 2, ...interaction.options })
          break

        case 'rightClick':
          await element.click({ button: 'right', ...interaction.options })
          break

        case 'dragAndDrop':
          if (interaction.options?.targetSelector) {
            const target = await this.getElement(
              page,
              interaction.options.targetSelector,
              interaction.options?.timeout,
            )
            if (!target) {
              throw new Error(
                `Target element not found: ${
                  typeof interaction.options.targetSelector === 'string'
                    ? interaction.options.targetSelector
                    : 'custom selector function'
                }`,
              )
            }

            const sourceBox = await element.boundingBox()
            const targetBox = await target.boundingBox()

            if (sourceBox && targetBox) {
              const sourceX = sourceBox.x + sourceBox.width / 2
              const sourceY = sourceBox.y + sourceBox.height / 2
              const targetX = targetBox.x + targetBox.width / 2
              const targetY = targetBox.y + targetBox.height / 2

              await page.mouse.move(sourceX, sourceY, {
                steps: interaction.options?.steps,
              })
              await page.mouse.down()
              await page.mouse.move(targetX, targetY, {
                steps: interaction.options?.steps,
              })
              await page.mouse.up()
            }
          }
          break
      }

      if (interaction.waitAfter) {
        await page
          .waitForNetworkIdle({
            timeout: interaction.waitAfter,
            idleTime: 500,
            ...interaction.options,
          })
          .catch(() => {
            logger.warn(
              `Network did not become idle after ${interaction.waitAfter}ms`,
            )
          })
      }
    })
  }

  /**
   * Executes a browser automation scenario with the given configuration.
   * This is the main method for running automation tasks.
   *
   * Features:
   * - Automatic page setup and cleanup
   * - Sequential interaction execution
   * - Optional screenshot capture
   * - Detailed result reporting
   *
   * @param {Object} params The scenario configuration
   * @param {string} params.url The URL to navigate to
   * @param {Interaction[]} [params.interactions=[]] Array of interactions to perform
   * @param {boolean} [params.captureScreenshots=false] Whether to capture screenshots
   * @returns {Promise<SyntheticSessionResult>} The scenario execution result
   * @throws {Error} If maximum concurrent sessions are reached
   *
   * @example
   * // Form filling and submission
   * const result = await puppeteerService.executeScenario({
   *   url: 'https://example.com/login',
   *   interactions: [
   *     {
   *       selector: '#username',
   *       action: 'type',
   *       value: 'user@example.com'
   *     },
   *     {
   *       selector: '#password',
   *       action: 'type',
   *       value: 'password123'
   *     },
   *     {
   *       selector: 'button[type="submit"]',
   *       action: 'click',
   *       waitAfter: 2000
   *     },
   *     {
   *       selector: '.dashboard',
   *       action: 'wait'
   *     }
   *   ],
   *   captureScreenshots: true
   * });
   *
   * // Custom DOM manipulation and data extraction
   * const result = await puppeteerService.executeScenario({
   *   url: 'https://example.com/products',
   *   interactions: [
   *     {
   *       selector: '.product-grid',
   *       action: 'evaluate',
   *       value: `(el) => {
   *         const products = [];
   *         el.querySelectorAll('.product-card').forEach(card => {
   *           products.push({
   *             name: card.querySelector('.name')?.textContent?.trim(),
   *             price: card.querySelector('.price')?.textContent?.trim(),
   *             inStock: !card.classList.contains('out-of-stock')
   *           });
   *         });
   *         return products;
   *       }`
   *     }
   *   ]
   * });
   */
  async executeScenario({
    url,
    interactions = [],
    captureScreenshots = false,
  }: {
    url: string
    interactions?: Interaction[]
    captureScreenshots?: boolean
  }): Promise<SyntheticSessionResult> {
    if (this.activeSessions >= this.config.maxConcurrentSessions) {
      throw new Error('Maximum concurrent sessions reached')
    }

    let page: Page | null = null
    const screenshots: string[] = []
    const completedInteractions: string[] = []

    try {
      this.activeSessions++
      const browser = await this.initializeBrowser()
      page = await browser.newPage()

      await this.setupPage(page)

      // Navigate to the page
      await page.goto(url, { waitUntil: 'networkidle0' })

      if (captureScreenshots) {
        screenshots.push(
          (await page.screenshot({ encoding: 'base64' })) as string,
        )
      }

      // Execute interactions
      for (const interaction of interactions) {
        try {
          await this.performInteraction(page, interaction)
          completedInteractions.push(
            `${interaction.action}:${interaction.selector}`,
          )

          if (captureScreenshots) {
            screenshots.push(
              (await page.screenshot({ encoding: 'base64' })) as string,
            )
          }
        } catch (err) {
          logger.error('Interaction failed', {
            interaction,
            error: err instanceof Error ? err.message : 'Unknown error',
          })
        }
      }

      return {
        screenshots,
        completedInteractions,
      }
    } catch (err) {
      logger.error('Error in GCP session', { error: err })
      return {
        screenshots,
        completedInteractions,
        error: err instanceof Error ? err.message : 'Unknown error occurred',
      }
    } finally {
      this.activeSessions--
      if (page) {
        await page
          .close()
          .catch((err) => logger.error('Error closing page', { error: err }))
      }
    }
  }

  /**
   * Cleans up browser resources by closing the browser instance.
   * Should be called when the service is no longer needed or during application shutdown.
   *
   * @returns {Promise<void>}
   * @throws {Error} If cleanup fails
   *
   * @example
   * // Cleanup during application shutdown
   * process.on('SIGTERM', async () => {
   *   await puppeteerService.cleanup();
   *   process.exit(0);
   * });
   */
  async cleanup(): Promise<void> {
    if (this.browser) {
      await this.browser
        .close()
        .catch((err) => logger.error('Error closing browser', { error: err }))
      this.browser = null
    }
  }
}

export const puppeteerService = new PuppeteerService()
