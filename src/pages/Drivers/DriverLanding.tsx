import { Container, Row, Col, Button } from 'react-bootstrap'
import Navbar from '../../components/Navbar'
import Footer from '../../components/Footer'
import { useNavigate } from 'react-router-dom'
import { FaClock, FaMoneyBillWave, FaBolt, FaCheckCircle } from 'react-icons/fa'

const DriverLanding = () => {
    const navigate = useNavigate()

    return (
        <div className="min-vh-100 bg-viago-black text-white">
            <Navbar mode="driver" />

            {/* Hero Section */}
            <div className="driver-background d-flex align-items-center" style={{ minHeight: '80vh' }}>
                <Container>
                    <Row>
                        <Col md={8} lg={6}>
                            <div className="mt-5 p-4 rounded" >
                                <h1 className="display-3 fw-bold mb-4">
                                    Drive when you want, <span className="text-viago-green">make what you need.</span>
                                </h1>
                                <p className="lead mb-4">
                                    Make money on your schedule with deliveries or rides—or both. You can use your own car or choose a rental through ViaGO.
                                </p>
                                <div className="d-flex gap-3">
                                    <Button
                                        onClick={() => navigate('/driver-signup')}
                                        className="btn-viago-primary px-4 py-3 fw-bold fs-5"
                                    >
                                        Get Started
                                    </Button>
                                    <Button
                                        onClick={() => navigate('/login')}
                                        variant="outline-light"
                                        className="px-4 py-3 fw-bold fs-5"
                                    >
                                        Log in
                                    </Button>
                                </div>
                            </div>
                        </Col>
                    </Row>
                </Container>
            </div>

            {/* Benefits Section */}
            <Container className="py-5">
                <h2 className="text-center mb-5 display-5 fw-bold">Why drive with Via<span className="text-viago-green">GO</span>?</h2>
                <Row className="g-4">
                    <Col md={4}>
                        <div className="card-viago-feature h-100 p-4 rounded text-center">
                            <div className="mb-3">
                                <FaClock className="text-viago-green" size={48} />
                            </div>
                            <h3 className="h4 fw-bold">Set your own schedule</h3>
                            <p className="text-white-50">
                                You are the boss. You can drive with the ViaGO app day or night. Fit driving around your life, not the other way around.
                            </p>
                        </div>
                    </Col>
                    <Col md={4}>
                        <div className="card-viago-feature h-100 p-4 rounded text-center">
                            <div className="mb-3">
                                <FaMoneyBillWave className="text-viago-green" size={48} />
                            </div>
                            <h3 className="h4 fw-bold">Make money on your terms</h3>
                            <p className="text-white-50">
                                The more you drive, the more you make. Plus, your fares get automatically deposited weekly.
                            </p>
                        </div>
                    </Col>
                    <Col md={4}>
                        <div className="card-viago-feature h-100 p-4 rounded text-center">
                            <div className="mb-3">
                                <FaBolt className="text-viago-green" size={48} />
                            </div>
                            <h3 className="h4 fw-bold">Instant Pay</h3>
                            <p className="text-white-50">
                                Want your money even faster? Cash out up to 5 times a day with Instant Pay.
                            </p>
                        </div>
                    </Col>
                </Row>
            </Container>

            {/* Requirements Section */}
            <div className="driver-background py-5" style={{ minHeight: 'auto' }}>
                <Container>
                    <Row className="justify-content-center">
                        <Col md={10} lg={8}>
                            <h2 className="mb-5 fw-bold">Requirements</h2>
                            <div className="card-viago p-4">
                                <ul className="list-unstyled mb-0">
                                    <li className="d-flex align-items-start mb-3">
                                        <FaCheckCircle className="text-viago-green mt-1 me-3 flex-shrink-0" />
                                        <div>
                                            <h5 className="fw-bold mb-1">Minimum Age</h5>
                                            <p className="text-white-50 mb-0">You must be at least 21 years old.</p>
                                        </div>
                                    </li>
                                    <li className="d-flex align-items-start mb-3">
                                        <FaCheckCircle className="text-viago-green mt-1 me-3 flex-shrink-0" />
                                        <div>
                                            <h5 className="fw-bold mb-1">Valid License</h5>
                                            <p className="text-white-50 mb-0">A valid Sri Lankan driver's license.</p>
                                        </div>
                                    </li>
                                    <li className="d-flex align-items-start mb-3">
                                        <FaCheckCircle className="text-viago-green mt-1 me-3 flex-shrink-0" />
                                        <div>
                                            <h5 className="fw-bold mb-1">Vehicle Documents</h5>
                                            <p className="text-white-50 mb-0">Registration and insurance documents for your vehicle.</p>
                                        </div>
                                    </li>
                                    <li className="d-flex align-items-start">
                                        <FaCheckCircle className="text-viago-green mt-1 me-3 flex-shrink-0" />
                                        <div>
                                            <h5 className="fw-bold mb-1">Smartphone</h5>
                                            <p className="text-white-50 mb-0">iPhone or Android smartphone to run the driver app.</p>
                                        </div>
                                    </li>
                                </ul>
                            </div>

                            <div className="mt-5 text-center">
                                <Button
                                    onClick={() => navigate('/signup')}
                                    className="btn-viago-primary px-5 py-3 fw-bold"
                                >
                                    Sign up to drive
                                </Button>
                            </div>
                        </Col>
                    </Row>
                </Container>
            </div>

            <Footer />
        </div>
    )
}

export default DriverLanding
