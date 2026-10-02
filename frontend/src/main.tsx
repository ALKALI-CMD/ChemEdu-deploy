import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { RouterProvider } from 'react-router-dom'
import { AuthProvider } from '@/components/AuthProvider'
import { EducationDashboardProvider } from '@/components/EducationDashboardProvider'
import { router } from '@/router'

import './index.css'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <AuthProvider>
      <EducationDashboardProvider>
        <RouterProvider router={router} />
      </EducationDashboardProvider>
    </AuthProvider>
  </StrictMode>,
)
