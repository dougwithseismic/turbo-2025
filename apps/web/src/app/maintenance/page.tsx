import { MaintenanceCard } from './components/maintenance-card'
import { Metadata } from 'next'
export const metadata: Metadata = {
  title: 'System Maintenance',

  description:
    'Our system is currently undergoing scheduled maintenance to improve your experience. We apologize for any inconvenience.',
  robots: {
    index: false,
    follow: false,
  },
}
export default function MaintenancePage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-50 p-4">
      <MaintenanceCard />
    </main>
  )
}
