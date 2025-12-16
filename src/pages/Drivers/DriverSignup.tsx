import { useState } from 'react'
import { Container, Card, Form, Button, Alert, Row, Col, Modal } from 'react-bootstrap'
import { useNavigate } from 'react-router-dom'
import { FaArrowRight, FaCheckCircle, FaCar, FaIdCard, FaMapMarkerAlt, FaMobileAlt } from 'react-icons/fa'
import Navbar from '../../components/Navbar'

const DriverSignup = () => {
    const navigate = useNavigate()
    const [step, setStep] = useState(1)
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')
    const [showSuccess, setShowSuccess] = useState(false)

    // Form Data State
    const [mobile, setMobile] = useState('')
    const [name, setName] = useState('')
    const [nic, setNic] = useState('')
    const [city, setCity] = useState('')

    // --- API GATEWAY SPACES ---
    // These functions act as placeholders/gateways for backend interaction

    const verifyMobileNumber = async (number: string) => {
        // API CALL PLACEHOLDER: Verify if number exists
        // await api.post('/drivers/verify-mobile', { mobile: number })
        console.log(`[API Gateway] Verifying mobile: ${number}`)

        // Mock validation for now
        if (number === '0771234567') { // Mock used number
            throw new Error('This mobile number is already registered.')
        }
        return true
    }

    const submitDriverApplication = async (data: any) => {
        // API CALL PLACEHOLDER: Submit final application
        // await api.post('/drivers/register', data)
        console.log(`[API Gateway] Submitting application:`, data)

        return new Promise((resolve) => setTimeout(resolve, 1500))
    }

    // --- HANDLERS ---

    const handleStep1Submit = async (e: React.FormEvent) => {
        e.preventDefault()
        setError('')

        // Basic validation
        if (!mobile || mobile.length < 10) {
            setError('Please enter a valid mobile number.')
            return
        }

        setLoading(true)
        try {
            await verifyMobileNumber(mobile)
            setStep(2)
        } catch (err: any) {
            setError(err.message || 'Verification failed')
        } finally {
            setLoading(false)
        }
    }

    const handleStep2Submit = (e: React.FormEvent) => {
        e.preventDefault()
        if (!name || !nic) {
            setError('Please fill in all details.')
            return
        }
        setError('')
        setStep(3)
    }

    const handleStep3Submit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!city) {
            setError('Please enter your city.')
            return
        }

        setLoading(true)
        try {
            await submitDriverApplication({ mobile, name, nic, city })
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
                                    {/* STEP 1: MOBILE */}
                                    <div className="w-100 p-4 d-flex flex-column justify-content-center">
                                        <h4 className="fw-bold mb-4 text-center text-white">Let's start with your number</h4>
                                        <Form onSubmit={handleStep1Submit}>
                                            <Form.Group className="mb-4">
                                                <Form.Label className="text-white-50">Mobile Number</Form.Label>
                                                <div className="input-group">
                                                    <span className="input-group-text bg-viago-dark border-viago-gray text-white-50">
                                                        <FaMobileAlt />
                                                    </span>
                                                    <Form.Control
                                                        type="tel"
                                                        placeholder="077 123 4567"
                                                        value={mobile}
                                                        onChange={(e) => setMobile(e.target.value)}
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
                                                <Form.Label className="text-white-50">Full Name</Form.Label>
                                                <div className="input-group">
                                                    <span className="input-group-text bg-viago-dark border-viago-gray text-white-50">
                                                        <FaCar />
                                                    </span>
                                                    <Form.Control
                                                        type="text"
                                                        placeholder="Your Name"
                                                        value={name}
                                                        onChange={(e) => setName(e.target.value)}
                                                        className="form-control-viago border-start-0"
                                                    />
                                                </div>
                                            </Form.Group>
                                            <Form.Group className="mb-4">
                                                <Form.Label className="text-white-50">NIC Number</Form.Label>
                                                <div className="input-group">
                                                    <span className="input-group-text bg-viago-dark border-viago-gray text-white-50">
                                                        <FaIdCard />
                                                    </span>
                                                    <Form.Control
                                                        type="text"
                                                        placeholder="National Identity Card"
                                                        value={nic}
                                                        onChange={(e) => setNic(e.target.value)}
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

                                    {/* STEP 3: CITY */}
                                    <div className="w-100 p-4 d-flex flex-column justify-content-center">
                                        <h4 className="fw-bold mb-4 text-center ">Where will you drive?</h4>
                                        <Form onSubmit={handleStep3Submit}>
                                            <Form.Group className="mb-4">
                                                <Form.Label className="text-white-50">Service City</Form.Label>
                                                <div className="input-group">
                                                    <span className="input-group-text bg-viago-dark border-viago-gray text-white-50">
                                                        <FaMapMarkerAlt />
                                                    </span>
                                                    <Form.Control
                                                        type="text"
                                                        placeholder="e.g. Colombo, Kandy"
                                                        value={city}
                                                        onChange={(e) => setCity(e.target.value)}
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
                        onClick={() => navigate('/')}
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
