import { Container, Row, Col, Card, Button, Badge } from 'react-bootstrap'
import { useNavigate } from 'react-router-dom'
import { FaArrowLeft, FaMapMarkerAlt, FaClock, FaMoneyBillWave } from 'react-icons/fa'

const DriverHistory = () => {
    const navigate = useNavigate()

    // Mock data - replace with actual API call
    const rideHistory: any[] = []

    return (
        <div className="min-vh-100 bg-viago-black text-white">
            {/* Header */}
            <div className="bg-dark border-bottom border-secondary py-3">
                <Container>
                    <Row className="align-items-center">
                        <Col>
                            <Button
                                variant="link"
                                className="text-white text-decoration-none p-0"
                                onClick={() => navigate('/driver-dashboard')}
                            >
                                <FaArrowLeft className="me-2" />
                                Back to Dashboard
                            </Button>
                        </Col>
                    </Row>
                </Container>
            </div>

            <Container className="py-4">
                <h2 className="mb-4">Ride History</h2>

                {rideHistory.length === 0 ? (
                    <Card className="bg-dark text-white border-secondary">
                        <Card.Body className="text-center py-5">
                            <FaMapMarkerAlt className="text-viago-green fs-1 mb-3 opacity-50" />
                            <h5 className="mb-3">No rides yet</h5>
                            <p className="text-white-50 mb-4">
                                Your completed rides will appear here
                            </p>
                            <Button
                                className="btn-viago-primary"
                                onClick={() => navigate('/driver-dashboard')}
                            >
                                Go to Dashboard
                            </Button>
                        </Card.Body>
                    </Card>
                ) : (
                    <Row className="g-3">
                        {rideHistory.map((ride, index) => (
                            <Col xs={12} key={index}>
                                <Card className="bg-dark text-white border-secondary">
                                    <Card.Body>
                                        <Row>
                                            <Col md={8}>
                                                <div className="mb-2">
                                                    <Badge bg="success" className="me-2">
                                                        Completed
                                                    </Badge>
                                                    <span className="text-white-50">
                                                        {ride.date}
                                                    </span>
                                                </div>
                                                <div className="mb-2">
                                                    <FaMapMarkerAlt className="text-viago-green me-2" />
                                                    <strong>Pickup:</strong> {ride.pickup}
                                                </div>
                                                <div className="mb-2">
                                                    <FaMapMarkerAlt className="text-danger me-2" />
                                                    <strong>Drop:</strong> {ride.drop}
                                                </div>
                                                <div className="text-white-50">
                                                    <FaClock className="me-2" />
                                                    {ride.duration} • {ride.distance}
                                                </div>
                                            </Col>
                                            <Col md={4} className="text-md-end">
                                                <div className="mb-2">
                                                    <FaMoneyBillWave className="text-viago-green me-2" />
                                                    <strong className="fs-5">
                                                        LKR {ride.fare}
                                                    </strong>
                                                </div>
                                                <div className="text-white-50">
                                                    Passenger: {ride.passenger}
                                                </div>
                                            </Col>
                                        </Row>
                                    </Card.Body>
                                </Card>
                            </Col>
                        ))}
                    </Row>
                )}
            </Container>
        </div>
    )
}

export default DriverHistory
