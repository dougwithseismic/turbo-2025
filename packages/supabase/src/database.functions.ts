import type { Json } from './types'

export type DbFunctions = {
  // Credit Pool Management
  add_credits_to_pool: {
    Args: {
      p_pool_id: string
      p_amount: number
      p_source: string
      p_description: string
    }
    Returns: {
      pool: {
        id: string
        owner_type: string
        owner_id: string
        total_credits: number
        reserved_credits: number
        expires_at: string | null
        source: string
        created_at: string
        updated_at: string
      }
      transaction: {
        id: string
        pool_id: string
        project_id: string | null
        amount: number
        balance_after: number
        description: string
        metadata: Json
        created_at: string
        updated_at: string
      }
    }
  }

  reserve_credits_from_pool: {
    Args: {
      p_pool_id: string
      p_amount: number
      p_description: string
    }
    Returns: {
      pool: {
        id: string
        owner_type: string
        owner_id: string
        total_credits: number
        reserved_credits: number
        expires_at: string | null
        source: string
        created_at: string
        updated_at: string
      }
      transaction: {
        id: string
        pool_id: string
        project_id: string | null
        amount: number
        balance_after: number
        description: string
        metadata: Json
        created_at: string
        updated_at: string
      }
    }
  }

  allocate_subscription_credits: {
    Args: {
      p_subscriber_type: string
      p_subscriber_id: string
      p_credits: number
    }
    Returns: null
  }

  // Credit Usage
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
    }
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
    }
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

  allocate_project_credits: {
    Args: {
      project_id_param: string
      monthly_limit_param: number
    }
    Returns: string
  }

  // API Usage Tracking
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
    }
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
    }
  }

  reset_api_usage: {
    Args: {
      p_service_id: string
      p_user_id: string
    }
    Returns: null
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
    }
  }

  // Access Control
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

  // Membership Management
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
    }
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

  remove_member: {
    Args: {
      resource_type_param: string
      resource_id_param: string
      user_id_param: string
    }
    Returns: boolean
  }

  // Invitation Management
  create_invitation: {
    Args: {
      resource_type_param: string
      resource_id_param: string
      email_param: string
      role_param?: string
    }
    Returns: string
  }

  accept_invitation: {
    Args: {
      invitation_id_param: string
    }
    Returns: string
  }

  decline_invitation: {
    Args: {
      invitation_id_param: string
    }
    Returns: boolean
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
    }
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
    }
  }
}
