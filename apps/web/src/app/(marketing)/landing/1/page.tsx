'use client'

import { ContentCard, ContentCardProvider } from '@/components/content-card'
import { ContentCardBody } from '@/components/content-card/components/content-card-body'
import { ContentCardFooter } from '@/components/content-card/components/content-card-footer'
import { ContentCardHeader } from '@/components/content-card/components/content-card-header'
import { Mail } from 'lucide-react'
import { Button } from '@/components/ui/button'

const Page = () => {
  const invitations = []
  return (
    <div className="min-h-[calc(60vh-100px)] p-4 bg-background flex items-center justify-center">
      <ContentCardProvider>
        <div className="container mx-auto py-12">
          <ContentCard
            id="invitations"
            size="2xl"
            className="mx-auto"
            headerPosition="INSIDE"
          >
            <ContentCardHeader>
              <div className="flex flex-col gap-2">
                <h1 className="text-2xl font-bold">Pending Invitations</h1>
                <p className="text-muted-foreground">
                  View and manage your pending invitations to organizations and
                  projects
                </p>
              </div>
            </ContentCardHeader>

            <ContentCardBody>
              {invitations.length === 0 ? (
                <div className="flex flex-col gap-4">
                  <div className="flex flex-col items-center justify-center gap-4 py-12">
                    <Mail className="h-12 w-12 text-muted-foreground" />
                    <h3 className="text-lg font-semibold">
                      No pending invitations
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      You don't have any pending invitations at the moment
                    </p>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col gap-4">
                  <Button variant="default" className="mt-4">
                    Send an Invitation
                  </Button>
                </div>
              )}
            </ContentCardBody>

            <ContentCardFooter>
              <div className="flex justify-end">
                <Button variant="outline">Refresh</Button>
              </div>
            </ContentCardFooter>
          </ContentCard>
        </div>
      </ContentCardProvider>
    </div>
  )
}

export default Page
