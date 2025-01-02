'use client'

import { Button } from '@/components/ui/button'
import { CardDescription, CardTitle } from '@/components/ui/card'
import { ContentCard, ContentCardProvider } from '@/components/content-card'
import { ContentCardSearch } from '@/components/content-card/components/content-card-search'
import { ActionField } from '@/components/action-field'
import { AlertTriangle, Save } from 'lucide-react'
import { ProjectNameField } from './fields/project-name-field'
import { FetchDemo } from './fetch-demo'
import { useParams, useRouter } from 'next/navigation'
import { useGetProject } from '@repo/supabase'
import { supabaseClient } from '@/lib/supabase/client'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { useState } from 'react'
import toast from 'react-hot-toast'

export const ProjectSettings = () => {
  const params = useParams()
  const router = useRouter()
  const projectId = params.id as string
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)

  const { data: project } = useGetProject({
    supabase: supabaseClient,
    projectId,
  })

  if (!project) return null

  const handleDeleteProject = async () => {
    try {
      setIsDeleting(true)
      const { error } = await supabaseClient
        .from('projects')
        .delete()
        .eq('id', projectId)

      if (error) {
        throw error
      }

      toast.success('Project deleted successfully')
      // Redirect to dashboard
      router.push('/dashboard')
    } catch (error) {
      console.error('Error deleting project:', error)
      toast.error('Failed to delete project')
    } finally {
      setIsDeleting(false)
      setIsDeleteDialogOpen(false)
    }
  }

  return (
    <ContentCardProvider>
      <div className="flex flex-1 flex-col gap-4 p-4 md:p-8 pt-0 container max-w-4xl mx-auto">
        <div className="row flex flex-col gap-6">
          <div className="flex flex-col gap-2">
            <h1 className="text-2xl font-bold">Project Settings</h1>
            <span className="text-sm text-muted-foreground">
              Manage your project settings and preferences.
            </span>
          </div>

          <ContentCardSearch placeholder="Search project settings..." />
        </div>

        <div className="flex flex-col gap-8 md:gap-12">
          <ContentCard id="project-information" headerPosition="INSIDE">
            <ContentCard.Header>
              <div className="flex items-center justify-between w-full">
                <div className="flex flex-col gap-2">
                  <CardTitle>Project Information</CardTitle>
                  <CardDescription>
                    Basic information about your project
                  </CardDescription>
                </div>
              </div>
            </ContentCard.Header>

            <ContentCard.Body>
              <ContentCard.Item id="name">
                <ProjectNameField />
              </ContentCard.Item>

              <ContentCard.Item id="fetch-demo">
                <div className="space-y-4">
                  <h3 className="text-sm font-medium">Data Fetching Demo</h3>
                  <FetchDemo />
                </div>
              </ContentCard.Item>
            </ContentCard.Body>

            <ContentCard.Footer>
              <div className="flex w-full items-center justify-between">
                <p className="text-sm text-muted-foreground">
                  Last updated: {new Date().toLocaleDateString()}
                </p>
                <Button variant="outline" size="sm">
                  <Save className="mr-2 h-4 w-4" />
                  Save Changes
                </Button>
              </div>
            </ContentCard.Footer>
          </ContentCard>

          <ContentCard id="danger" headerPosition="OUTSIDE">
            <ContentCard.Header>
              <div className="flex items-center justify-between w-full">
                <div className="flex flex-col gap-2">
                  <CardTitle>Danger Zone</CardTitle>
                  <CardDescription>
                    Irreversible and destructive actions
                  </CardDescription>
                </div>
              </div>
            </ContentCard.Header>
            <ContentCard.Body>
              <ContentCard.Item id="delete-project" contentClassName="w-full">
                <ActionField>
                  <ActionField.Label>Delete Project</ActionField.Label>
                  <ActionField.Content>
                    <span className="text-sm">
                      Once you delete a project, there is no going back. Please
                      be certain.
                    </span>
                  </ActionField.Content>
                  <ActionField.Action>
                    <Dialog
                      open={isDeleteDialogOpen}
                      onOpenChange={setIsDeleteDialogOpen}
                    >
                      <DialogTrigger asChild>
                        <Button variant="destructive" size="sm">
                          <AlertTriangle className="mr-2 h-4 w-4" />
                          Delete Project
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Are you absolutely sure?</DialogTitle>
                          <DialogDescription>
                            This action cannot be undone. This will permanently
                            delete your project and remove all associated data.
                          </DialogDescription>
                        </DialogHeader>
                        <DialogFooter>
                          <Button
                            variant="outline"
                            onClick={() => setIsDeleteDialogOpen(false)}
                            disabled={isDeleting}
                          >
                            Cancel
                          </Button>
                          <Button
                            variant="destructive"
                            onClick={handleDeleteProject}
                            disabled={isDeleting}
                          >
                            {isDeleting ? 'Deleting...' : 'Delete Project'}
                          </Button>
                        </DialogFooter>
                      </DialogContent>
                    </Dialog>
                  </ActionField.Action>
                </ActionField>
              </ContentCard.Item>
            </ContentCard.Body>
          </ContentCard>
        </div>
      </div>
    </ContentCardProvider>
  )
}
