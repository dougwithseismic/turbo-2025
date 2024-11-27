import { Page, ElementHandle } from 'puppeteer'
import {
  puppeteerService,
  type SyntheticSessionResult,
  type ScenarioConfig,
  type Interaction,
} from '../services/puppeteer-service'

interface LinkedInCookie {
  name: string
  value: string
  domain: string
  path: string
}

interface GetLinkedInMessagesOptions {
  cookies: LinkedInCookie[]
}

export const getLinkedInMessages = async ({
  cookies,
}: GetLinkedInMessagesOptions): Promise<SyntheticSessionResult> => {
  const scenario: ScenarioConfig = {
    url: 'https://www.linkedin.com/messaging/',
    interactions: [
      // First, we'll set up cookies before navigation
      {
        selector: async (page: Page): Promise<ElementHandle | null> => {
          // Set cookies before navigating
          await Promise.all(
            cookies.map((cookie) =>
              page.setCookie({
                ...cookie,
                // Additional required fields for Puppeteer Cookie type
                expires: Math.floor(Date.now() / 1000) + 3600, // 1 hour from now
                httpOnly: false,
                secure: true,
                sameSite: 'Lax',
              }),
            ),
          )

          await page.reload({ waitUntil: 'networkidle0' })

          // Return any element since we don't need to interact with it
          return page.$('body')
        },
        action: 'evaluate',
        value: 'el => undefined', // No-op evaluation
      } satisfies Interaction,
      // Wait for messages container to load
      {
        selector: '.msg-conversations-container',
        action: 'wait',
        options: {
          timeout: 10000,
        },
      },
    ],
    captureScreenshots: true, // Optional: capture screenshots for debugging
  }

  return puppeteerService.executeScenario(scenario)
}

// Example usage:
/*
const cookies = [
  {
    name: 'li_at',
    value: 'YOUR_LI_AT_COOKIE',
    domain: '.linkedin.com',
    path: '/',
  },
  // Add other required cookies
]

getLinkedInMessages({ cookies }).then(result => {
  console.log('Scenario completed:', result)
}).catch(error => {
  console.error('Error:', error)
})
*/
