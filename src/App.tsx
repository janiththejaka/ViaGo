import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import UserHome from './pages/Users/UserHome'
import UserLoging from './pages/Users/UserLoging'
import UserSignup from './pages/Users/UserSignup'
import DriverLanding from './pages/Drivers/DriverLanding'
import DriverSignup from './pages/Drivers/DriverSignup'

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<UserHome />} />
        <Route path="/login" element={<UserLoging />} />
        <Route path="/signup" element={<UserSignup />} />
        <Route path="/drive" element={<DriverLanding />} />
        <Route path="/driver-signup" element={<DriverSignup />} />
      </Routes>
    </Router>
  )
}

export default App