import cors from 'cors'
import express, { Request, Response } from 'express'
import helmet from 'helmet'
import { requestLogger } from './middleware/request-logger'
import './setup-env' // added to conditionally load dotenv in development

import { logger } from './config/logger'
import { supabaseAdmin } from './lib/supabase'
import { crawlQueue, crawlWorker } from './services/crawl-bull'

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

const server = app.listen(PORT, async () => {
  logger.info(`🚀 :: Server is running on port ${PORT}`)

  const fetchCrawlJobs = async () => {
    const { data, error } = await supabaseAdmin
      .from('crawl_jobs')
      .select('*')
      .eq('status', 'pending')

    if (error) {
      logger.error('Error fetching crawl jobs', { error })
      return []
    }

    return data
  }

  const pendingJobs = await fetchCrawlJobs()
  for (const supabaseJob of pendingJobs) {
    const { data: user, error: userError } = await supabaseAdmin
      .from('profiles')
      .select('*')
      .eq('id', supabaseJob.user_id)
      .single()

    const { data: site, error: siteError } = await supabaseAdmin
      .from('sites')
      .select('*')
      .eq('id', supabaseJob.site_id || '')
      .single()

    if (userError || siteError) {
      console.error('Error fetching user or site', {
        userError,
        siteError,
      })
      return
    }

    const job = await crawlQueue.add(supabaseJob.id, {
      crawlId: supabaseJob.id,
      config: {
        url: site?.domain?.startsWith('http')
          ? site.domain
          : `https://${site?.domain}`,
        scPropertyName: supabaseJob.gsc_property_id || '',
        user: { id: user?.id, email: user?.email },
        gaProfileId: supabaseJob.ga_property_id || '',
      },
    })

    supabaseJob.status = 'waiting'
    await supabaseAdmin
      .from('crawl_jobs')
      .update(supabaseJob)
      .eq('id', supabaseJob.id)

    console.log('Job added to queue', job.id)
  }

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
            gaProfileId: payload.new.ga_property_id,
          },
        })

        console.log('Job added to queue', job.id)
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
