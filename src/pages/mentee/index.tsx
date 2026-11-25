import { MenteeAuthProvider, MenteeDashboard } from '@/components/mentee'

export default function MenteeDashboardPage(): JSX.Element {
  return (
    <MenteeAuthProvider>
      <MenteeDashboard />
    </MenteeAuthProvider>
  )
}
