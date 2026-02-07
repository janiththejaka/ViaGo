import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import UserHome from './pages/Users/UserHome'
import UserLoging from './pages/Users/UserLoging'
import UserSignup from './pages/Users/UserSignup'
import DriverLanding from './pages/Drivers/DriverLanding'
import DriverSignup from './pages/Drivers/DriverSignup'
import DriverDashboard from './pages/Drivers/DriverDashboard'
import DriverHistory from './pages/Drivers/DriverHistory'
import DriverEarnings from './pages/Drivers/DriverEarnings'
import WebSocket from './pages/Websocket'
import LiveTrackingMap from './components/LiveTrackingMap'
import RideRequestPage from './pages/RideRequestPage.tsx'
import ProtectedRoute from './components/ProtectedRoute'

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<UserHome />} />
          <Route path="/login" element={<UserLoging />} />
          <Route path="/signup" element={<UserSignup />} />
          <Route path="/drive" element={<DriverLanding />} />
          <Route path="/driver-signup" element={<DriverSignup />} />
          <Route path="/driver-dashboard" element={<DriverDashboard />} />
          <Route path="/driver-history" element={<DriverHistory />} />
          <Route path="/driver-earnings" element={<DriverEarnings />} />
          <Route path="/ride-request-page" element={<RideRequestPage />} />


          {/* RIDER Protected Routes */}
          <Route
            path="/ride-request-page"
            element={
              <ProtectedRoute allowedRole="RIDER">
                <RideRequestPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/websocket"
            element={
              <ProtectedRoute allowedRole="RIDER">
                <WebSocket />
              </ProtectedRoute>
            }
          />
          <Route
            path="/live-tracking"
            element={
              <ProtectedRoute allowedRole="RIDER">
                <LiveTrackingMap />
              </ProtectedRoute>
            }
          />

          {/* DRIVER Protected Routes */}
          <Route
            path="/driver-dashboard"
            element={
              <ProtectedRoute allowedRole="DRIVER">
                <DriverDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/driver-history"
            element={
              <ProtectedRoute allowedRole="DRIVER">
                <DriverHistory />
              </ProtectedRoute>
            }
          />
          <Route
            path="/driver-earnings"
            element={
              <ProtectedRoute allowedRole="DRIVER">
                <DriverEarnings />
              </ProtectedRoute>
            }
          />
        </Routes>
      </Router>
    </AuthProvider>
  )
}

export default App