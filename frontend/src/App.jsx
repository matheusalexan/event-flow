import { Routes, Route } from 'react-router-dom'
import { AuthProvider } from './contexts/AuthContext'
import { SocketProvider } from './contexts/SocketContext'
import ProtectedRoute from './components/ProtectedRoute'
import Layout from './components/Layout'
import Home from './pages/Home'
import Login from './pages/Login'
import Register from './pages/Register'
import Dashboard from './pages/Dashboard'
import Profile from './pages/Profile'
import RideRequest from './pages/RideRequest'
import RideHistory from './pages/RideHistory'

function App() {
  return (
    <AuthProvider>
      <SocketProvider>
        <Routes>
          {/* Public routes */}
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          
          {/* Protected routes */}
          <Route path="/dashboard" element={
            <ProtectedRoute>
              <Layout>
                <Dashboard />
              </Layout>
            </ProtectedRoute>
          } />
          
          <Route path="/profile" element={
            <ProtectedRoute>
              <Layout>
                <Profile />
              </Layout>
            </ProtectedRoute>
          } />
          
          <Route path="/ride-request" element={
            <ProtectedRoute>
              <Layout>
                <RideRequest />
              </Layout>
            </ProtectedRoute>
          } />
          
          <Route path="/ride-history" element={
            <ProtectedRoute>
              <Layout>
                <RideHistory />
              </Layout>
            </ProtectedRoute>
          } />
        </Routes>
      </SocketProvider>
    </AuthProvider>
  )
}

export default App 