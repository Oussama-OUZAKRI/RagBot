import { useState, useEffect } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { 
  AdminDashboard as Admin, 
  ChatPage as Chat, 
  Dashboard, 
  DocumentsPage as Documents 
} from './pages'
import { Login, Register, Navbar, Sidebar } from './components'
import { isAuthenticated, getCurrentUser } from './services'
import { ProtectedRoute } from './constants/ProtectedRoute'

function App() {
  const [authenticated, setAuthenticated] = useState(false)
  const [userRole, setUserRole] = useState('user')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const checkAuth = async () => {
      const authStatus = await isAuthenticated()
      setAuthenticated(authStatus)
      
      if (authStatus) {
        const user = await getCurrentUser()
        setUserRole(user.role)
      }
      
      setLoading(false)
    }
    
    checkAuth()
  }, [])

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    )
  }

  return (
    <div className="app">
      {authenticated ? (
        <div className="flex h-screen overflow-hidden">
          <Sidebar userRole={userRole} />
          <div className="flex flex-col flex-1 overflow-hidden">
            <Navbar setAuthenticated={setAuthenticated} />
            <main className="flex-1 overflow-y-auto p-4 bg-gray-50">
              <Routes>
                <Route 
                  path="/" 
                  element={<Navigate to="/dashboard" replace />} 
                />
                <Route 
                  path="/dashboard" 
                  element={
                    <ProtectedRoute>
                      <Dashboard />
                    </ProtectedRoute>
                  } 
                />
                <Route 
                  path="/documents" 
                  element={
                    <ProtectedRoute>
                      <Documents />
                    </ProtectedRoute>
                  } 
                />
                <Route 
                  path="/chat" 
                  element={
                    <ProtectedRoute>
                      <Chat />
                    </ProtectedRoute>
                  } 
                />
                <Route 
                  path="/admin" 
                  element={
                    <ProtectedRoute allowedRoles={['admin']}>
                      <Admin />
                    </ProtectedRoute>
                  } 
                />
                <Route path="*" element={<Navigate to="/dashboard" replace />} />
              </Routes>
            </main>
          </div>
        </div>
      ) : (
        <Routes>
          <Route path="/login" element={<Login setAuthenticated={setAuthenticated} />} />
          <Route path="/register" element={<Register />} />
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      )}
    </div>
  )
}

export default App