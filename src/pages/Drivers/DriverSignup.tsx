import { useState } from 'react'
import { Container, Card, Form, Button, Alert, Row, Col, Modal } from 'react-bootstrap'
import { useNavigate } from 'react-router-dom'
import { FaArrowRight, FaCheckCircle, FaCar, FaIdCard, FaEnvelope, FaLock } from 'react-icons/fa'
import Navbar from '../../components/Navbar'
import { authService } from '../../services/authService'

const DriverSignup = () => {
    const navigate = useNavigate()
    const [step, setStep] = useState(1)
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')
    const [showSuccess, setShowSuccess] = useState(false)

    // Form Data State
    // Form Data State
    const [email, setEmail] = useState('')
    const [username, setUsername] = useState('')
    const [password, setPassword] = useState('')
    const [registrationNumber, setRegistrationNumber] = useState('')

    // --- API GATEWAY SPACES ---
    // These functions act as placeholders/gateways for backend interaction

    const verifyEmail = async (email: string) => {
        // API CALL PLACEHOLDER: Verify if email exists
        console.log(`[API Gateway] Verifying email: ${email}`)
        return true
    }



    // --- HANDLERS ---

    const handleStep1Submit = async (e: React.FormEvent) => {
        e.preventDefault()
        setError('')

        // Basic validation
        // Email Regex Validation
        const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/
        if (!email || !emailRegex.test(email)) {
            setError('Please enter a valid email address.')
            return
        }

        setLoading(true)
        try {
            await verifyEmail(email)
            setStep(2)
        } catch (err: any) {
            setError(err.message || 'Verification failed')
        } finally {
            setLoading(false)
        }
    }

    const handleStep2Submit = (e: React.FormEvent) => {
        e.preventDefault()
        if (!username || !password) {
            setError('Please fill in all details.')
            return
        }
        setError('')
        setStep(3)
    }

    const handleStep3Submit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!registrationNumber) {
            setError('Please enter your vehicle registration number.')
            return
        }

        setLoading(true)
        try {
            // Real API Call using authService
            await authService.signup(username, email, password, 'DRIVER', {
                vehicleType: 'Tuk',
                model: 'ThreeWheeler',
                seatCount: 3,
                registrationNumber: registrationNumber
            })
            setShowSuccess(true)
        } catch (err: any) {
            setError('Registration failed. Please try again.')
        } finally {
            setLoading(false)
        }
    }

    // --- RENDER HELPERS ---

    const renderProgressBar = () => (
        <div className="d-flex justify-content-center mb-5">
            {[1, 2, 3].map((s) => (
                <div key={s} className="d-flex align-items-center">
                    <div
                        className={`d-flex align-items-center justify-content-center rounded-circle fw-bold border ${step >= s
                            ? 'bg-viago-green text-black border-viago-green'
                            : 'bg-transparent text-secondary border-secondary'
                            }`}
                        style={{ width: '40px', height: '40px', transition: 'all 0.3s' }}
                    >
                        {step > s ? <FaCheckCircle /> : s}
                    </div>
                    {s < 3 && (
                        <div
                            className={`mx-2 ${step > s ? 'bg-viago-green' : 'bg-secondary'}`}
                            style={{ width: '40px', height: '2px', transition: 'all 0.3s' }}
                        />
                    )}
                </div>
            ))}
        </div>
    )

    return (
        <div className="min-vh-100 driver-auth-background text-white d-flex flex-column">
            <Navbar mode="driver" />

            <Container className="flex-grow-1 d-flex flex-column justify-content-center py-5">
                <Row className="justify-content-center">
                    <Col md={8} lg={6} xl={5}>
                        <div className="mb-4 text-center">
                            <h2 className="fw-bold mb-3">Partner with <span className="text-viago-green">ViaGO</span></h2>
                            {renderProgressBar()}
                        </div>

                        <Card className="card-viago overflow-hidden position-relative" style={{ minHeight: '400px' }}>
                            <Card.Body className="p-0">
                                {error && (
                                    <div className="position-absolute top-0 start-0 w-100 p-3" style={{ zIndex: 10 }}>
                                        <Alert variant="danger" onClose={() => setError('')} dismissible className="border-0 shadow-sm mb-0">
                                            {error}
                                        </Alert>
                                    </div>
                                )}

                                {/* SLIDING CONTAINER */}
                                <div
                                    className="d-flex h-100 transition-transform"
                                    style={{
                                        width: '300%',
                                        transform: `translateX(-${(step - 1) * 33.333}%)`,
                                        transition: 'transform 0.5s ease-in-out'
                                    }}
                                >
                                    {/* STEP 1: EMAIL */}
                                    <div className="w-100 p-4 d-flex flex-column justify-content-center">
                                        <h4 className="fw-bold mb-4 text-center text-white">Let's start with your email</h4>
                                        <Form onSubmit={handleStep1Submit}>
                                            <Form.Group className="mb-4">
                                                <Form.Label className="text-white-50">Email Address</Form.Label>
                                                <div className="input-group">
                                                    <span className="input-group-text bg-viago-dark border-viago-gray text-white-50">
                                                        <FaEnvelope />
                                                    </span>
                                                    <Form.Control
                                                        type="email"
                                                        placeholder="name@example.com"
                                                        value={email}
                                                        onChange={(e) => setEmail(e.target.value)}
                                                        className="form-control-viago border-start-0"
                                                        autoFocus
                                                    />
                                                </div>
                                            </Form.Group>
                                            <Button type="submit" className="btn-viago-primary w-100 py-2 fw-bold" disabled={loading}>
                                                {loading ? 'Verifying...' : 'Go Forward'} <FaArrowRight className="ms-2" />
                                            </Button>
                                        </Form>
                                    </div>

                                    {/* STEP 2: DETAILS */}
                                    <div className="w-100 p-4 d-flex flex-column justify-content-center">
                                        <h4 className="fw-bold mb-4 text-center text-white">Tell us about yourself</h4>
                                        <Form onSubmit={handleStep2Submit}>
                                            <Form.Group className="mb-3">
                                                <Form.Label className="text-white-50">Username</Form.Label>
                                                <div className="input-group">
                                                    <span className="input-group-text bg-viago-dark border-viago-gray text-white-50">
                                                        <FaCar />
                                                    </span>
                                                    <Form.Control
                                                        type="text"
                                                        placeholder="Your Username"
                                                        value={username}
                                                        onChange={(e) => setUsername(e.target.value)}
                                                        className="form-control-viago border-start-0"
                                                    />
                                                </div>
                                            </Form.Group>
                                            <Form.Group className="mb-4">
                                                <Form.Label className="text-white-50">Password</Form.Label>
                                                <div className="input-group">
                                                    <span className="input-group-text bg-viago-dark border-viago-gray text-white-50">
                                                        <FaLock />
                                                    </span>
                                                    <Form.Control
                                                        type="password"
                                                        placeholder="********"
                                                        value={password}
                                                        onChange={(e) => setPassword(e.target.value)}
                                                        className="form-control-viago border-start-0"
                                                    />
                                                </div>
                                            </Form.Group>
                                            <div className="d-flex gap-2">
                                                <Button variant="outline-light" onClick={() => setStep(1)} className="w-50">
                                                    Back
                                                </Button>
                                                <Button type="submit" className="btn-viago-primary w-50 fw-bold">
                                                    Next <FaArrowRight className="ms-2" />
                                                </Button>
                                            </div>
                                        </Form>
                                    </div>

                                    {/* STEP 3: VEHICLE */}
                                    <div className="w-100 p-4 d-flex flex-column justify-content-center">
                                        <h4 className="fw-bold mb-4 text-center ">Connect your vehicle</h4>
                                        <Form onSubmit={handleStep3Submit}>
                                            <Form.Group className="mb-4">
                                                <Form.Label className="text-white-50">Registration Number</Form.Label>
                                                <div className="input-group">
                                                    <span className="input-group-text bg-viago-dark border-viago-gray text-white-50">
                                                        <FaIdCard />
                                                    </span>
                                                    <Form.Control
                                                        type="text"
                                                        placeholder="ABC-1234"
                                                        value={registrationNumber}
                                                        onChange={(e) => setRegistrationNumber(e.target.value)}
                                                        className="form-control-viago border-start-0"
                                                    />
                                                </div>
                                            </Form.Group>
                                            <div className="d-flex gap-2">
                                                <Button variant="outline-light" onClick={() => setStep(2)} className="w-50">
                                                    Back
                                                </Button>
                                                <Button type="submit" className="btn-viago-primary w-50 fw-bold" disabled={loading}>
                                                    {loading ? 'Submitting...' : "Let's Drive"} <FaCar className="ms-2" />
                                                </Button>
                                            </div>
                                        </Form>
                                    </div>
                                </div>
                            </Card.Body>
                        </Card>
                    </Col>
                </Row>
            </Container>

            {/* Success Modal */}
            <Modal show={showSuccess} centered backdrop="static" keyboard={false} contentClassName="bg-viago-dark text-white border-viago-green">
                <Modal.Body className="text-center p-5">
                    <div className="mb-4 text-viago-green">
                        <FaCheckCircle size={80} />
                    </div>
                    <h2 className="fw-bold mb-3">Congratulations!</h2>
                    <p className="lead mb-4">
                        You have successfully joined the ViaGO drivers community.
                    </p>
                    <Button
                        onClick={() => navigate('/driver-dashboard')}
                        className="btn-viago-primary px-5 py-3 fw-bold fs-5 rounded-pill"
                    >
                        Let's go First ride
                    </Button>
                </Modal.Body>
            </Modal>
        </div>
    )
}

export default DriverSignup
