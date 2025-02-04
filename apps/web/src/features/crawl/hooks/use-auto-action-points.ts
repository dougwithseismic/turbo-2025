'use client'

import { useEffect } from 'react'
import { RealMockData } from '../utils/real-data'
import { useActionPoints } from '../context/action-points-context'
import { ALL_ACTION_CHECKS } from '../config/action-checks'

export const ACTION_COLORS = {
  SEO: 'text-chart-1 border-chart-1 bg-chart-1/10',
  Performance: 'text-chart-2 border-chart-2 bg-chart-2/10',
  Content: 'text-chart-3 border-chart-3 bg-chart-3/10',
  Mobile: 'text-chart-4 border-chart-4 bg-chart-4/10',
  Security: 'text-chart-5 border-chart-5 bg-chart-5/10',
} as const

export function useAutoActionPoints(data: RealMockData) {
  const { dispatch } = useActionPoints()

  useEffect(() => {
    // Clear existing actions
    dispatch({ type: 'CLEAR_ALL' })

    // Analyze each page
    data.pages.forEach((page) => {
      // Find all applicable actions for this page
      const applicableActions = ALL_ACTION_CHECKS.filter((check) =>
        check.check(page),
      )

      // Dispatch each action separately
      applicableActions.forEach((action) => {
        dispatch({
          type: 'ADD_ACTIONS',
          payload: {
            urls: [page.url],
            actionType: `${action.category}: ${action.type}`,
            color: ACTION_COLORS[action.category],
          },
        })
      })
    })
  }, [data, dispatch])
}
