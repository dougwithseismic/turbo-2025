export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type ResourceType = 'organization' | 'project'
export type Role = 'owner' | 'member'
export type SubscriberType = 'user' | 'organization'
export type OwnerType = 'user' | 'organization'
export type StripeSubscriberType = 'user' | 'organization'
