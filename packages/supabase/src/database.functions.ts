import type { Json } from './types';

export type DbFunctions = {
  add_credits_to_pool: {
    Args: {
      p_pool_id: string;
      p_amount: number;
      p_source: string;
      p_description: string;
    };
    Returns: {
      pool: {
        id: string;
        owner_type: string;
        owner_id: string;
        total_credits: number;
        reserved_credits: number;
        expires_at: string | null;
        source: string;
        created_at: string;
        updated_at: string;
      };
      transaction: {
        id: string;
        pool_id: string;
        project_id: string | null;
        amount: number;
        balance_after: number;
        description: string;
        metadata: Json;
        created_at: string;
        updated_at: string;
      };
    };
  };
  reserve_credits_from_pool: {
    Args: {
      p_pool_id: string;
      p_amount: number;
      p_description: string;
    };
    Returns: {
      pool: {
        id: string;
        owner_type: string;
        owner_id: string;
        total_credits: number;
        reserved_credits: number;
        expires_at: string | null;
        source: string;
        created_at: string;
        updated_at: string;
      };
      transaction: {
        id: string;
        pool_id: string;
        project_id: string | null;
        amount: number;
        balance_after: number;
        description: string;
        metadata: Json;
        created_at: string;
        updated_at: string;
      };
    };
  };
  allocate_subscription_credits: {
    Args: {
      p_subscriber_type: string;
      p_subscriber_id: string;
      p_credits: number;
    };
    Returns: null;
  };
  track_api_usage: {
    Args: {
      p_service_id: string;
      p_user_id: string;
      p_request_count: number;
      p_metadata: Json;
    };
    Returns: {
      service_id: string;
      user_id: string;
      daily_usage: number;
      last_request_at: string;
      requests_per_minute: number;
    };
  };
  check_api_quota: {
    Args: {
      p_service_id: string;
      p_user_id: string;
    };
    Returns: {
      can_proceed: boolean;
      current_usage: number;
      daily_quota: number;
      queries_per_second: number;
    };
  };
  reset_api_usage: {
    Args: {
      p_service_id: string;
      p_user_id: string;
    };
    Returns: null;
  };
  get_api_usage_stats: {
    Args: {
      p_service_id: string;
      p_user_id: string;
      p_start_date: string;
      p_end_date: string;
    };
    Returns: {
      total_requests: number;
      daily_average: number;
      peak_usage: number;
      by_day: Array<{
        date: string;
        requests: number;
      }>;
    };
  };
};
