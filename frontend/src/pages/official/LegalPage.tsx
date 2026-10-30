// Compatibility entry for older public links; current consultation information lives on /enroll.
import { Navigate } from 'react-router-dom'

export default function LegalPage() {
  return <Navigate to="/enroll" replace />
}
