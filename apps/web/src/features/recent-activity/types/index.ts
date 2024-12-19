import { ReactElement } from 'react'

export type ActivityItem = {
  id: number
  href: string
  label: string
  value: ReactElement
  date: string
  dateTime: string
}

export type ActivityItemProps = {
  item: ActivityItem
  onDelete: (id: number) => void
}
