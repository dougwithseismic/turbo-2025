export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  graphql_public: {
    Tables: {
      [_ in never]: never
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      graphql: {
        Args: {
          operationName?: string
          query?: string
          variables?: Json
          extensions?: Json
        }
        Returns: Json
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
  public: {
    Tables: {
      api_quota_allocations: {
        Row: {
          created_at: string
          daily_quota: number
          id: string
          queries_per_second: number
          service_id: string | null
          updated_at: string
          user_id: string | null
        }
        Insert: {
          created_at?: string
          daily_quota: number
          id?: string
          queries_per_second: number
          service_id?: string | null
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          created_at?: string
          daily_quota?: number
          id?: string
          queries_per_second?: number
          service_id?: string | null
          updated_at?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: 'api_quota_allocations_service_id_fkey'
            columns: ['service_id']
            isOneToOne: false
            referencedRelation: 'api_services'
            referencedColumns: ['id']
          },
        ]
      }
      api_request_logs: {
        Row: {
          created_at: string
          id: string
          metadata: Json | null
          request_count: number
          service_id: string | null
          updated_at: string
          user_id: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          metadata?: Json | null
          request_count?: number
          service_id?: string | null
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          metadata?: Json | null
          request_count?: number
          service_id?: string | null
          updated_at?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: 'api_request_logs_service_id_fkey'
            columns: ['service_id']
            isOneToOne: false
            referencedRelation: 'api_services'
            referencedColumns: ['id']
          },
        ]
      }
      api_services: {
        Row: {
          created_at: string
          default_daily_quota: number
          default_queries_per_second: number
          description: string | null
          id: string
          name: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          default_daily_quota: number
          default_queries_per_second: number
          description?: string | null
          id?: string
          name: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          default_daily_quota?: number
          default_queries_per_second?: number
          description?: string | null
          id?: string
          name?: string
          updated_at?: string
        }
        Relationships: []
      }
      api_usage_tracking: {
        Row: {
          created_at: string
          daily_usage: number
          id: string
          last_request_at: string
          requests_per_minute: number
          service_id: string | null
          updated_at: string
          user_id: string | null
        }
        Insert: {
          created_at?: string
          daily_usage?: number
          id?: string
          last_request_at?: string
          requests_per_minute?: number
          service_id?: string | null
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          created_at?: string
          daily_usage?: number
          id?: string
          last_request_at?: string
          requests_per_minute?: number
          service_id?: string | null
          updated_at?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: 'api_usage_tracking_service_id_fkey'
            columns: ['service_id']
            isOneToOne: false
            referencedRelation: 'api_services'
            referencedColumns: ['id']
          },
        ]
      }
      crawl_jobs: {
        Row: {
          completed_at: string | null
          created_at: string
          error_count: number | null
          ga_property_id: string | null
          gsc_property_id: string | null
          id: string
          processed_urls: number | null
          results: Json | null
          settings: Json | null
          site_id: string | null
          started_at: string | null
          status: string
          total_urls: number | null
          updated_at: string
          user_email: string | null
          user_id: string
        }
        Insert: {
          completed_at?: string | null
          created_at?: string
          error_count?: number | null
          ga_property_id?: string | null
          gsc_property_id?: string | null
          id?: string
          processed_urls?: number | null
          results?: Json | null
          settings?: Json | null
          site_id?: string | null
          started_at?: string | null
          status?: string
          total_urls?: number | null
          updated_at?: string
          user_email?: string | null
          user_id: string
        }
        Update: {
          completed_at?: string | null
          created_at?: string
          error_count?: number | null
          ga_property_id?: string | null
          gsc_property_id?: string | null
          id?: string
          processed_urls?: number | null
          results?: Json | null
          settings?: Json | null
          site_id?: string | null
          started_at?: string | null
          status?: string
          total_urls?: number | null
          updated_at?: string
          user_email?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: 'crawl_jobs_site_id_fkey'
            columns: ['site_id']
            isOneToOne: false
            referencedRelation: 'sites'
            referencedColumns: ['id']
          },
        ]
      }
      credit_allocations: {
        Row: {
          created_at: string
          current_usage: number
          id: string
          monthly_limit: number
          pool_id: string | null
          project_id: string | null
          reset_at: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          current_usage?: number
          id?: string
          monthly_limit: number
          pool_id?: string | null
          project_id?: string | null
          reset_at: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          current_usage?: number
          id?: string
          monthly_limit?: number
          pool_id?: string | null
          project_id?: string | null
          reset_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: 'credit_allocations_pool_id_fkey'
            columns: ['pool_id']
            isOneToOne: false
            referencedRelation: 'credit_pools'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'credit_allocations_project_id_fkey'
            columns: ['project_id']
            isOneToOne: false
            referencedRelation: 'projects'
            referencedColumns: ['id']
          },
        ]
      }
      credit_pools: {
        Row: {
          created_at: string
          expires_at: string | null
          id: string
          owner_id: string
          owner_type: string
          reserved_credits: number
          source: string
          total_credits: number
          updated_at: string
        }
        Insert: {
          created_at?: string
          expires_at?: string | null
          id?: string
          owner_id: string
          owner_type: string
          reserved_credits?: number
          source: string
          total_credits?: number
          updated_at?: string
        }
        Update: {
          created_at?: string
          expires_at?: string | null
          id?: string
          owner_id?: string
          owner_type?: string
          reserved_credits?: number
          source?: string
          total_credits?: number
          updated_at?: string
        }
        Relationships: []
      }
      credit_transactions: {
        Row: {
          amount: number
          balance_after: number
          created_at: string
          description: string
          id: string
          metadata: Json | null
          pool_id: string | null
          project_id: string | null
          updated_at: string
        }
        Insert: {
          amount: number
          balance_after: number
          created_at?: string
          description: string
          id?: string
          metadata?: Json | null
          pool_id?: string | null
          project_id?: string | null
          updated_at?: string
        }
        Update: {
          amount?: number
          balance_after?: number
          created_at?: string
          description?: string
          id?: string
          metadata?: Json | null
          pool_id?: string | null
          project_id?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: 'credit_transactions_pool_id_fkey'
            columns: ['pool_id']
            isOneToOne: false
            referencedRelation: 'credit_pools'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'credit_transactions_project_id_fkey'
            columns: ['project_id']
            isOneToOne: false
            referencedRelation: 'projects'
            referencedColumns: ['id']
          },
        ]
      }
      invitations: {
        Row: {
          created_at: string
          email: string
          expires_at: string
          id: string
          invited_by: string | null
          resource_id: string
          resource_type: string
          role: string
          status: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          email: string
          expires_at?: string
          id?: string
          invited_by?: string | null
          resource_id: string
          resource_type: string
          role?: string
          status?: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          email?: string
          expires_at?: string
          id?: string
          invited_by?: string | null
          resource_id?: string
          resource_type?: string
          role?: string
          status?: string
          updated_at?: string
        }
        Relationships: []
      }
      memberships: {
        Row: {
          created_at: string
          id: string
          resource_id: string
          resource_type: string
          role: string
          updated_at: string
          user_id: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          resource_id: string
          resource_type: string
          role?: string
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          resource_id?: string
          resource_type?: string
          role?: string
          updated_at?: string
          user_id?: string | null
        }
        Relationships: []
      }
      oauth_states: {
        Row: {
          created_at: string
          expires_at: string
          id: string
          redirect_to: string | null
          state: string
          updated_at: string
          user_id: string | null
        }
        Insert: {
          created_at?: string
          expires_at: string
          id?: string
          redirect_to?: string | null
          state: string
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          created_at?: string
          expires_at?: string
          id?: string
          redirect_to?: string | null
          state?: string
          updated_at?: string
          user_id?: string | null
        }
        Relationships: []
      }
      organizations: {
        Row: {
          created_at: string
          id: string
          name: string
          owner_id: string | null
          settings: Json | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          name: string
          owner_id?: string | null
          settings?: Json | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          name?: string
          owner_id?: string | null
          settings?: Json | null
          updated_at?: string
        }
        Relationships: []
      }
      payment_methods: {
        Row: {
          account_id: string | null
          created_at: string
          id: string
          is_default: boolean | null
          provider_data: Json | null
          provider_payment_method_id: string
          type: string
          updated_at: string
        }
        Insert: {
          account_id?: string | null
          created_at?: string
          id?: string
          is_default?: boolean | null
          provider_data?: Json | null
          provider_payment_method_id: string
          type: string
          updated_at?: string
        }
        Update: {
          account_id?: string | null
          created_at?: string
          id?: string
          is_default?: boolean | null
          provider_data?: Json | null
          provider_payment_method_id?: string
          type?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: 'payment_methods_account_id_fkey'
            columns: ['account_id']
            isOneToOne: false
            referencedRelation: 'payment_provider_accounts'
            referencedColumns: ['id']
          },
        ]
      }
      payment_provider_accounts: {
        Row: {
          created_at: string
          id: string
          is_default: boolean | null
          owner_id: string
          owner_type: string
          provider_customer_id: string
          provider_data: Json | null
          provider_id: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          is_default?: boolean | null
          owner_id: string
          owner_type: string
          provider_customer_id: string
          provider_data?: Json | null
          provider_id?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          is_default?: boolean | null
          owner_id?: string
          owner_type?: string
          provider_customer_id?: string
          provider_data?: Json | null
          provider_id?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: 'payment_provider_accounts_provider_id_fkey'
            columns: ['provider_id']
            isOneToOne: false
            referencedRelation: 'payment_providers'
            referencedColumns: ['id']
          },
        ]
      }
      payment_providers: {
        Row: {
          created_at: string
          id: string
          is_active: boolean | null
          name: string
          settings: Json | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          is_active?: boolean | null
          name: string
          settings?: Json | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          is_active?: boolean | null
          name?: string
          settings?: Json | null
          updated_at?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          company: string | null
          created_at: string
          email: string
          full_name: string | null
          id: string
          updated_at: string
        }
        Insert: {
          avatar_url?: string | null
          company?: string | null
          created_at?: string
          email: string
          full_name?: string | null
          id: string
          updated_at?: string
        }
        Update: {
          avatar_url?: string | null
          company?: string | null
          created_at?: string
          email?: string
          full_name?: string | null
          id?: string
          updated_at?: string
        }
        Relationships: []
      }
      projects: {
        Row: {
          client_email: string | null
          client_name: string | null
          created_at: string
          id: string
          is_client_portal: boolean | null
          name: string
          organization_id: string | null
          settings: Json | null
          updated_at: string
        }
        Insert: {
          client_email?: string | null
          client_name?: string | null
          created_at?: string
          id?: string
          is_client_portal?: boolean | null
          name: string
          organization_id?: string | null
          settings?: Json | null
          updated_at?: string
        }
        Update: {
          client_email?: string | null
          client_name?: string | null
          created_at?: string
          id?: string
          is_client_portal?: boolean | null
          name?: string
          organization_id?: string | null
          settings?: Json | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: 'projects_organization_id_fkey'
            columns: ['organization_id']
            isOneToOne: false
            referencedRelation: 'organizations'
            referencedColumns: ['id']
          },
        ]
      }
      sites: {
        Row: {
          crawl_frequency: unknown
          created_at: string
          domain: string
          ga_property_id: string | null
          gsc_property_id: string | null
          id: string
          last_crawl_at: string | null
          project_id: string | null
          settings: Json | null
          sitemap_url: string | null
          updated_at: string
        }
        Insert: {
          crawl_frequency?: unknown
          created_at?: string
          domain: string
          ga_property_id?: string | null
          gsc_property_id?: string | null
          id?: string
          last_crawl_at?: string | null
          project_id?: string | null
          settings?: Json | null
          sitemap_url?: string | null
          updated_at?: string
        }
        Update: {
          crawl_frequency?: unknown
          created_at?: string
          domain?: string
          ga_property_id?: string | null
          gsc_property_id?: string | null
          id?: string
          last_crawl_at?: string | null
          project_id?: string | null
          settings?: Json | null
          sitemap_url?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: 'sites_project_id_fkey'
            columns: ['project_id']
            isOneToOne: false
            referencedRelation: 'projects'
            referencedColumns: ['id']
          },
        ]
      }
      subscription_plans: {
        Row: {
          created_at: string
          features: Json | null
          id: string
          is_active: boolean | null
          max_clients: number | null
          max_team_members: number | null
          monthly_credits: number
          name: string
          stripe_price_id: string | null
          type: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          features?: Json | null
          id?: string
          is_active?: boolean | null
          max_clients?: number | null
          max_team_members?: number | null
          monthly_credits: number
          name: string
          stripe_price_id?: string | null
          type: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          features?: Json | null
          id?: string
          is_active?: boolean | null
          max_clients?: number | null
          max_team_members?: number | null
          monthly_credits?: number
          name?: string
          stripe_price_id?: string | null
          type?: string
          updated_at?: string
        }
        Relationships: []
      }
      subscriptions: {
        Row: {
          cancel_at_period_end: boolean | null
          created_at: string
          current_period_end: string | null
          current_period_start: string | null
          id: string
          next_credit_allocation_at: string | null
          payment_account_id: string | null
          plan_id: string | null
          provider_data: Json | null
          provider_subscription_id: string | null
          status: string
          subscriber_id: string
          subscriber_type: string
          trial_ends_at: string | null
          updated_at: string
        }
        Insert: {
          cancel_at_period_end?: boolean | null
          created_at?: string
          current_period_end?: string | null
          current_period_start?: string | null
          id?: string
          next_credit_allocation_at?: string | null
          payment_account_id?: string | null
          plan_id?: string | null
          provider_data?: Json | null
          provider_subscription_id?: string | null
          status?: string
          subscriber_id: string
          subscriber_type: string
          trial_ends_at?: string | null
          updated_at?: string
        }
        Update: {
          cancel_at_period_end?: boolean | null
          created_at?: string
          current_period_end?: string | null
          current_period_start?: string | null
          id?: string
          next_credit_allocation_at?: string | null
          payment_account_id?: string | null
          plan_id?: string | null
          provider_data?: Json | null
          provider_subscription_id?: string | null
          status?: string
          subscriber_id?: string
          subscriber_type?: string
          trial_ends_at?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: 'subscriptions_payment_account_id_fkey'
            columns: ['payment_account_id']
            isOneToOne: false
            referencedRelation: 'payment_provider_accounts'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'subscriptions_plan_id_fkey'
            columns: ['plan_id']
            isOneToOne: false
            referencedRelation: 'subscription_plans'
            referencedColumns: ['id']
          },
        ]
      }
      user_oauth_tokens: {
        Row: {
          access_token: string
          created_at: string
          email: string
          id: string
          provider: string
          refresh_token: string
          scopes: string[]
          token_expires_at: string
          updated_at: string
          user_id: string | null
        }
        Insert: {
          access_token: string
          created_at?: string
          email: string
          id?: string
          provider: string
          refresh_token: string
          scopes: string[]
          token_expires_at: string
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          access_token?: string
          created_at?: string
          email?: string
          id?: string
          provider?: string
          refresh_token?: string
          scopes?: string[]
          token_expires_at?: string
          updated_at?: string
          user_id?: string | null
        }
        Relationships: []
      }
      user_onboarding: {
        Row: {
          completed_steps:
            | Database['public']['Enums']['onboarding_step'][]
            | null
          created_at: string
          current_step: Database['public']['Enums']['onboarding_step']
          id: string
          is_completed: boolean | null
          metadata: Json | null
          updated_at: string
          user_id: string | null
        }
        Insert: {
          completed_steps?:
            | Database['public']['Enums']['onboarding_step'][]
            | null
          created_at?: string
          current_step: Database['public']['Enums']['onboarding_step']
          id?: string
          is_completed?: boolean | null
          metadata?: Json | null
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          completed_steps?:
            | Database['public']['Enums']['onboarding_step'][]
            | null
          created_at?: string
          current_step?: Database['public']['Enums']['onboarding_step']
          id?: string
          is_completed?: boolean | null
          metadata?: Json | null
          updated_at?: string
          user_id?: string | null
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      accept_invitation: {
        Args: {
          invitation_id_param: string
        }
        Returns: string
      }
      add_credits_to_pool: {
        Args: {
          p_pool_id: string
          p_amount: number
          p_source: string
          p_description: string
        }
        Returns: {
          pool: Json
          transaction: Json
        }[]
      }
      add_member: {
        Args: {
          resource_type_param: string
          resource_id_param: string
          user_email_param: string
          role_param?: string
        }
        Returns: string
      }
      allocate_project_credits: {
        Args: {
          project_id_param: string
          monthly_limit_param: number
        }
        Returns: string
      }
      allocate_subscription_credits: {
        Args: {
          p_subscriber_type: string
          p_subscriber_id: string
          p_credits: number
        }
        Returns: undefined
      }
      check_api_quota: {
        Args: {
          p_service_id: string
          p_user_id: string
        }
        Returns: {
          can_proceed: boolean
          current_usage: number
          daily_quota: number
          queries_per_second: number
        }[]
      }
      create_invitation: {
        Args: {
          resource_type_param: string
          resource_id_param: string
          email_param: string
          role_param?: string
        }
        Returns: string
      }
      create_project: {
        Args: {
          organization_id_param: string
          name_param: string
          settings_param?: Json
          client_name_param?: string
          client_email_param?: string
          is_client_portal_param?: boolean
        }
        Returns: string
      }
      decline_invitation: {
        Args: {
          invitation_id_param: string
        }
        Returns: boolean
      }
      finalize_credit_reservation: {
        Args: {
          p_user_id: string
          p_reservation_id: string
        }
        Returns: undefined
      }
      get_api_usage_stats: {
        Args: {
          p_service_id: string
          p_user_id: string
          p_start_date: string
          p_end_date: string
        }
        Returns: {
          total_requests: number
          daily_average: number
          peak_usage: number
          by_day: Json
        }[]
      }
      get_available_credits: {
        Args: {
          owner_type_param: string
          owner_id_param: string
        }
        Returns: {
          total_credits: number
          available_credits: number
          reserved_credits: number
          expires_at: string
        }[]
      }
      get_credit_usage: {
        Args: {
          project_id_param: string
          start_date?: string
          end_date?: string
        }
        Returns: {
          transaction_date: string
          credits_used: number
          balance_after: number
          description: string
          metadata: Json
        }[]
      }
      get_memberships: {
        Args: {
          resource_type_param: string
          resource_id_param: string
        }
        Returns: {
          user_id: string
          email: string
          full_name: string
          role: string
          joined_at: string
        }[]
      }
      get_payment_account: {
        Args: {
          p_owner_type: string
          p_owner_id: string
          p_provider_name?: string
        }
        Returns: {
          account_id: string
          provider_id: string
          provider_customer_id: string
          provider_data: Json
        }[]
      }
      get_payment_methods: {
        Args: {
          p_account_id: string
        }
        Returns: {
          payment_method_id: string
          provider_payment_method_id: string
          type: string
          provider_data: Json
          is_default: boolean
        }[]
      }
      get_pending_invitations: {
        Args: Record<PropertyKey, never>
        Returns: {
          id: string
          resource_type: string
          resource_id: string
          role: string
          invited_by_email: string
          invited_by_name: string
          created_at: string
          expires_at: string
        }[]
      }
      get_sent_invitations: {
        Args: {
          resource_type_param: string
          resource_id_param: string
        }
        Returns: {
          id: string
          email: string
          role: string
          status: string
          created_at: string
          expires_at: string
        }[]
      }
      get_user_organizations: {
        Args: {
          user_id_param?: string
        }
        Returns: {
          id: string
          name: string
          is_owner: boolean
          role: string
          settings: Json
          created_at: string
        }[]
      }
      get_user_projects: {
        Args: {
          user_id_param?: string
        }
        Returns: {
          id: string
          organization_id: string
          organization_name: string
          name: string
          role: string
          settings: Json
          client_name: string
          client_email: string
          is_client_portal: boolean
          created_at: string
        }[]
      }
      has_organization_access: {
        Args: {
          organization_id_param: string
        }
        Returns: boolean
      }
      has_project_access: {
        Args: {
          project_id_param: string
        }
        Returns: boolean
      }
      is_organization_owner: {
        Args: {
          organization_id_param: string
        }
        Returns: boolean
      }
      record_credit_usage: {
        Args: {
          project_id_param: string
          amount_param: number
          description_param: string
          metadata_param?: Json
        }
        Returns: string
      }
      remove_member: {
        Args: {
          resource_type_param: string
          resource_id_param: string
          user_id_param: string
        }
        Returns: boolean
      }
      reserve_credits_from_pool: {
        Args: {
          p_pool_id: string
          p_amount: number
          p_description: string
        }
        Returns: {
          pool: Json
          transaction: Json
        }[]
      }
      reset_api_usage: {
        Args: {
          p_service_id: string
          p_user_id: string
        }
        Returns: undefined
      }
      track_api_usage: {
        Args: {
          p_service_id: string
          p_user_id: string
          p_request_count?: number
          p_metadata?: Json
        }
        Returns: {
          service_id: string
          user_id: string
          daily_usage: number
          last_request_at: string
          requests_per_minute: number
        }[]
      }
    }
    Enums: {
      onboarding_step:
        | 'signup_completed'
        | 'google_connected'
        | 'gsc_connected'
        | 'first_project_created'
        | 'first_site_added'
        | 'first_crawl_completed'
        | 'subscription_selected'
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type PublicSchema = Database[Extract<keyof Database, 'public'>]

export type Tables<
  PublicTableNameOrOptions extends
    | keyof (PublicSchema['Tables'] & PublicSchema['Views'])
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof (Database[PublicTableNameOrOptions['schema']]['Tables'] &
        Database[PublicTableNameOrOptions['schema']]['Views'])
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? (Database[PublicTableNameOrOptions['schema']]['Tables'] &
      Database[PublicTableNameOrOptions['schema']]['Views'])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : PublicTableNameOrOptions extends keyof (PublicSchema['Tables'] &
        PublicSchema['Views'])
    ? (PublicSchema['Tables'] &
        PublicSchema['Views'])[PublicTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  PublicTableNameOrOptions extends
    | keyof PublicSchema['Tables']
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions['schema']]['Tables']
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions['schema']]['Tables'][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema['Tables']
    ? PublicSchema['Tables'][PublicTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  PublicTableNameOrOptions extends
    | keyof PublicSchema['Tables']
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions['schema']]['Tables']
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions['schema']]['Tables'][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema['Tables']
    ? PublicSchema['Tables'][PublicTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  PublicEnumNameOrOptions extends
    | keyof PublicSchema['Enums']
    | { schema: keyof Database },
  EnumName extends PublicEnumNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicEnumNameOrOptions['schema']]['Enums']
    : never = never,
> = PublicEnumNameOrOptions extends { schema: keyof Database }
  ? Database[PublicEnumNameOrOptions['schema']]['Enums'][EnumName]
  : PublicEnumNameOrOptions extends keyof PublicSchema['Enums']
    ? PublicSchema['Enums'][PublicEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof PublicSchema['CompositeTypes']
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions['schema']]['CompositeTypes']
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions['schema']]['CompositeTypes'][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof PublicSchema['CompositeTypes']
    ? PublicSchema['CompositeTypes'][PublicCompositeTypeNameOrOptions]
    : never
