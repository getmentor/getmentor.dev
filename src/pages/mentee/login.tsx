import { MenteeAuthProvider, MenteeLoginForm } from '@/components/mentee'

export default function MenteeLoginPage(): JSX.Element {
  return (
    <MenteeAuthProvider>
      <MenteeLoginForm />
    </MenteeAuthProvider>
  )
}
