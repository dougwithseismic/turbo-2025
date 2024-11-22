export type ContentCategory =
  | 'getting-started'
  | 'daily-life'
  | 'about'
  | 'contact'
  | 'advertise'
  | 'privacy-policy'

export type GettingStartedArticle =
  | 'immigration-guide'
  | 'first-steps-checklist'
  | 'registration-process'
  | 'language-basics'

export type DailyLifeArticle =
  | 'housing'
  | 'healthcare'
  | 'banking-and-finance'
  | 'transportation'
  | 'education'
  | 'shopping-and-food'

export type JobsCategory =
  | 'job-board'
  | 'cv-writing-guide'
  | 'work-permits'
  | 'career-resources'
  | 'company-directory'

export type ServiceCategory =
  | 'medical'
  | 'legal'
  | 'translation'
  | 'relocation'
  | 'real-estate'
  | 'language-schools'

export type ForumCategory =
  | 'general'
  | 'housing'
  | 'jobs'
  | 'social'
  | 'bureaucracy'

export type CommunitySection =
  | 'events'
  | 'forums'
  | 'success-stories'
  | 'news-and-updates'

export interface CategoryParams {
  category: ContentCategory
  article?: string
}

export interface ServiceParams {
  category: ServiceCategory
}

export interface ForumParams {
  category: ForumCategory
  thread?: string
}
