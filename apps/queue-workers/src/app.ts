import cors from 'cors'
import express, { Request, Response } from 'express'
import helmet from 'helmet'
import { requestLogger } from './middleware/request-logger'
import './setup-env' // added to conditionally load dotenv in development

import { logger } from './config/logger'
import { supabaseAdmin } from './lib/supabase'
import { crawlQueue } from './services/crawl-bull'

const PORT = process.env.PORT || 42069

const app = express()

// Middleware
app.use(helmet())
app.use(cors())
app.use(express.json())
app.use(requestLogger)

// Error handling middleware
app.use((err: Error, _req: Request, res: Response, next: any) => {
  logger.error('Unhandled error', { error: err.stack })

  if (!res.headersSent) {
    res.status(500).json({
      error: 'Internal server error',
      message: process.env.NODE_ENV === 'development' ? err.message : undefined,
    })
  }
  next(err)
})

const server = app.listen(PORT, () => {
  logger.info(`🚀 :: Server is running on port ${PORT}`)

  supabaseAdmin.realtime
    .channel('crawl-jobs-channel')
    .on(
      'postgres_changes',
      { event: 'INSERT', schema: 'public', table: 'crawl_jobs' },
      async (payload) => {
        logger.info(`New crawl job inserted: ${payload.new.id}`)
        console.dir(payload.new, { depth: null })

        const { data: user, error: userError } = await supabaseAdmin
          .from('profiles')
          .select('*')
          .eq('id', payload.new.user_id)
          .single()

        const { data: site, error: siteError } = await supabaseAdmin
          .from('sites')
          .select('*')
          .eq('id', payload.new.site_id)
          .single()

        if (userError || siteError) {
          console.error('Error fetching user or site', {
            userError,
            siteError,
          })
          return
        }

        const job = await crawlQueue.add(payload.new.id, {
          crawlId: payload.new.id,
          config: {
            url: site?.domain?.startsWith('http')
              ? site.domain
              : `https://${site?.domain}`,
            scPropertyName: payload.new.gsc_property_id,
            user: { id: user?.id, email: user?.email },
          },
        })

        console.log('Job added to queue', job)
      },
    )
    .on(
      'postgres_changes',
      { event: 'UPDATE', schema: 'public', table: 'crawl_jobs' },
      (payload) => {
        logger.info(`Crawl job updated: ${payload.new.id}`)
      },
    )
    .on(
      'postgres_changes',
      { event: 'DELETE', schema: 'public', table: 'crawl_jobs' },
      (payload) => {
        logger.info(`Crawl job deleted: ${payload.old.id}`)
      },
    )
    .subscribe()
})

export { server }
