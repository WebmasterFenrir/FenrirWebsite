import { useState, useEffect } from 'react'
import pb from './lib/pocketbase'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import Login from './components/Login'
import ProtectedRoute from './components/ProtectedRoute'
import ProfileSetup from './components/ProfileSetup'
import { AppLayout } from './components/layout/AppLayout'
import { OverviewPage } from './components/pages/OverviewPage'
import { YearsPage } from './components/pages/YearsPage'
import { SponsorsPage } from './components/pages/SponsorsPage'
import { PeoplePage } from './components/pages/PeoplePage'
import { AdminUsersPage } from './components/pages/AdminUsersPage'
import { ActiviteitenPage } from './components/pages/ActiviteitenPage'
import { CategoriesPage } from './components/pages/CategoriesPage'
import { FormsPage } from './components/pages/FormsPage'
import { LedenPage } from './components/pages/LedenPage'
import { InvitePage } from './components/pages/InvitePage'
import { RoleContext } from './lib/RoleContext'
import { can, type Role } from './lib/roles'

export function App() {
  const [user, setUser] = useState<any>(pb.authStore.isValid ? pb.authStore.record : null)

  useEffect(() => {
    const remove = pb.authStore.onChange(() => {
      setUser(pb.authStore.isValid ? pb.authStore.record : null)
    })
    if (pb.authStore.isValid) {
      pb.collection('users').authRefresh().catch(() => pb.authStore.clear())
    }
    return () => remove()
  }, [])

  const isAuthenticated = !!user
  const role: Role | undefined = user?.role
  const needsSetup = isAuthenticated && !user?.name

  const redirectIfAuth = isAuthenticated
    ? <Navigate to={needsSetup ? '/setup' : '/'} replace />
    : undefined

  return (
    <RoleContext.Provider value={{ role, can: (action) => can(role, action) }}>
      <Router>
        <Routes>
          <Route
            path="/login"
            element={redirectIfAuth ?? <Login onLoginSuccess={setUser} />}
          />

          <Route path="/invite" element={<InvitePage />} />

          <Route
            path="/setup"
            element={
              <ProtectedRoute isAuthenticated={isAuthenticated}>
                {needsSetup
                  ? <ProfileSetup user={user} onComplete={setUser} />
                  : <Navigate to="/" replace />}
              </ProtectedRoute>
            }
          />

          <Route
            element={
              <ProtectedRoute isAuthenticated={isAuthenticated}>
                {needsSetup ? <Navigate to="/setup" replace /> : <AppLayout />}
              </ProtectedRoute>
            }
          >
            <Route index element={<OverviewPage />} />
            <Route path="years" element={<YearsPage />} />
            <Route path="sponsors" element={<SponsorsPage />} />
            <Route path="activiteiten" element={<ActiviteitenPage />} />
            <Route path="categories" element={<CategoriesPage />} />
            <Route path="forms" element={<FormsPage />} />
            <Route
              path="leden"
              element={
                can(role, 'write')
                  ? <LedenPage />
                  : <Navigate to="/" replace />
              }
            />
            <Route path="people" element={<PeoplePage />} />
            <Route
              path="admin/users"
              element={
                can(role, 'manageUsers')
                  ? <AdminUsersPage />
                  : <Navigate to="/" replace />
              }
            />
          </Route>

          <Route
            path="*"
            element={<Navigate to={isAuthenticated ? (needsSetup ? '/setup' : '/') : '/login'} replace />}
          />
        </Routes>
      </Router>
    </RoleContext.Provider>
  )
}

export default App
