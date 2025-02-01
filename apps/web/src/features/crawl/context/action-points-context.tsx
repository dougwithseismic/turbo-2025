'use client'

import {
  createContext,
  useContext,
  useReducer,
  ReactNode,
  Dispatch,
} from 'react'

export interface UrlAction {
  url: string
  actions: Array<{
    type: string
    color: string
  }>
}

interface ActionPointsState {
  urlActions: UrlAction[]
}

type ActionPointsAction =
  | {
      type: 'ADD_ACTIONS'
      payload: { urls: string[]; actionType: string; color: string }
    }
  | { type: 'REMOVE_ACTION'; payload: { url: string; action: string } }
  | { type: 'CLEAR_ALL' }

const ActionPointsContext = createContext<
  | {
      state: ActionPointsState
      dispatch: Dispatch<ActionPointsAction>
    }
  | undefined
>(undefined)

function actionPointsReducer(
  state: ActionPointsState,
  action: ActionPointsAction,
): ActionPointsState {
  switch (action.type) {
    case 'ADD_ACTIONS': {
      const newUrlActions = [...state.urlActions]
      action.payload.urls.forEach((url) => {
        const existingUrlAction = newUrlActions.find((ua) => ua.url === url)
        if (existingUrlAction) {
          if (
            !existingUrlAction.actions.some(
              (a) => a.type === action.payload.actionType,
            )
          ) {
            existingUrlAction.actions.push({
              type: action.payload.actionType,
              color: action.payload.color,
            })
          }
        } else {
          newUrlActions.push({
            url,
            actions: [
              {
                type: action.payload.actionType,
                color: action.payload.color,
              },
            ],
          })
        }
      })
      return { ...state, urlActions: newUrlActions }
    }
    case 'REMOVE_ACTION': {
      const newUrlActions = state.urlActions.map((urlAction) => {
        if (urlAction.url === action.payload.url) {
          return {
            ...urlAction,
            actions: urlAction.actions.filter(
              (a) => a.type !== action.payload.action,
            ),
          }
        }
        return urlAction
      })
      return {
        ...state,
        urlActions: newUrlActions.filter(
          (urlAction) => urlAction.actions.length > 0,
        ),
      }
    }
    case 'CLEAR_ALL':
      return { urlActions: [] }
    default:
      return state
  }
}

export function ActionPointsProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(actionPointsReducer, {
    urlActions: [],
  })

  return (
    <ActionPointsContext.Provider value={{ state, dispatch }}>
      {children}
    </ActionPointsContext.Provider>
  )
}

export function useActionPoints() {
  const context = useContext(ActionPointsContext)
  if (context === undefined) {
    throw new Error(
      'useActionPoints must be used within an ActionPointsProvider',
    )
  }
  return context
}
