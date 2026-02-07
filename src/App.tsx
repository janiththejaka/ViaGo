import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import UserHome from './pages/Users/UserHome'
import UserLoging from './pages/Users/UserLoging'
import UserSignup from './pages/Users/UserSignup'
import DriverLanding from './pages/Drivers/DriverLanding'
import DriverSignup from './pages/Drivers/DriverSignup'
import WebSocket from './pages/Websocket'
import LiveTrackingMap from './components/LiveTrackingMap'
//import RideRequest from './components/RideRequest'
import RideRequestPage from './pages/RideRequestPage'
import ProtectedRoute from './components/ProtectedRoute'

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<UserHome />} />
        <Route path="/login" element={<UserLoging />} />
        <Route path="/signup" element={<UserSignup />} />
        <Route path="/drive" element={<DriverLanding />} />
        <Route path="/driver-signup" element={<DriverSignup />} />
        <Route path="/ride-request-page" element={<RideRequestPage />} />


        <Route
          path="/websocket"
          element={
            <ProtectedRoute>
              <WebSocket />
            </ProtectedRoute>
          }
        />
        <Route
          path="/live-tracking"
          element={
            <ProtectedRoute>
              <LiveTrackingMap />
            </ProtectedRoute>
          }
        />

      </Routes>
    </Router>
  )
}

export default App