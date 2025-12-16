import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Navbar as BSNavbar, Container, Nav, Button } from 'react-bootstrap'

interface NavbarProps {
  mode?: 'user' | 'driver'
}

const Navbar = ({ mode = 'user' }: NavbarProps) => {
  const navigate = useNavigate()
  const [expanded, setExpanded] = useState(false)

  return (
    <BSNavbar
      expand="sm"
      fixed="top"
      className="navbar-viago"
      expanded={expanded}
      onToggle={() => setExpanded(!expanded)}
    >
      <Container>
        <BSNavbar.Brand
          onClick={() => navigate('/')}
          style={{ cursor: 'pointer' }}
          className="fw-bold text-white"
        >
          <span style={{ fontSize: '1.5rem' }}>
            Via<span className="text-viago-green">GO</span>
          </span>
        </BSNavbar.Brand>

        <BSNavbar.Toggle aria-controls="basic-navbar-nav" className="border-0">
          <span className="navbar-toggler-icon" style={{
            backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 30 30'%3e%3cpath stroke='rgba(255, 255, 255, 0.75)' stroke-linecap='round' stroke-miterlimit='10' stroke-width='2' d='M4 7h22M4 15h22M4 23h22'/%3e%3c/svg%3e")`
          }} />
        </BSNavbar.Toggle>

        <BSNavbar.Collapse id="basic-navbar-nav">
          <Nav className="ms-auto gap-2">
            <Button
              variant="link"
              onClick={() => {
                navigate('/login')
                setExpanded(false)
              }}
              className="text-white text-decoration-none"
              style={{ fontWeight: 500 }}
            >
              Log In
            </Button>
            <Button
              onClick={() => {
                const path = mode === 'driver' ? '/driver-signup' : '/signup'
                navigate(path)
                setExpanded(false)
              }}
              className="btn-viago-primary"
            >
              {mode === 'driver' ? 'Sign up to drive' : 'Sign Up'}
            </Button>
          </Nav>
        </BSNavbar.Collapse>
      </Container>
    </BSNavbar>
  )
}

export default Navbar