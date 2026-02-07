import { Container, Row, Col, Card, Button, Table } from 'react-bootstrap'
import { useNavigate } from 'react-router-dom'
import { FaArrowLeft, FaWallet, FaMoneyBillWave, FaChartLine, FaDownload } from 'react-icons/fa'

const DriverEarnings = () => {
    const navigate = useNavigate()

    // Mock data - replace with actual API call
    const totalEarnings = 0
    const weeklyEarnings = 0
    const monthlyEarnings = 0
    const availableBalance = 0
    const earningsHistory: any[] = []

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
                <h2 className="mb-4">Earnings & Wallet</h2>

                {/* Earnings Summary */}
                <Row className="g-4 mb-4">
                    <Col md={3}>
                        <Card className="bg-dark text-white border-secondary h-100">
                            <Card.Body>
                                <div className="text-white-50 mb-2">
                                    <FaWallet className="me-2" />
                                    Available Balance
                                </div>
                                <h3 className="text-viago-green mb-0">
                                    LKR {availableBalance.toFixed(2)}
                                </h3>
                            </Card.Body>
                        </Card>
                    </Col>

                    <Col md={3}>
                        <Card className="bg-dark text-white border-secondary h-100">
                            <Card.Body>
                                <div className="text-white-50 mb-2">
                                    <FaMoneyBillWave className="me-2" />
                                    This Week
                                </div>
                                <h3 className="mb-0">LKR {weeklyEarnings.toFixed(2)}</h3>
                            </Card.Body>
                        </Card>
                    </Col>

                    <Col md={3}>
                        <Card className="bg-dark text-white border-secondary h-100">
                            <Card.Body>
                                <div className="text-white-50 mb-2">
                                    <FaChartLine className="me-2" />
                                    This Month
                                </div>
                                <h3 className="mb-0">LKR {monthlyEarnings.toFixed(2)}</h3>
                            </Card.Body>
                        </Card>
                    </Col>

                    <Col md={3}>
                        <Card className="bg-dark text-white border-secondary h-100">
                            <Card.Body>
                                <div className="text-white-50 mb-2">
                                    <FaMoneyBillWave className="me-2" />
                                    Total Earnings
                                </div>
                                <h3 className="mb-0">LKR {totalEarnings.toFixed(2)}</h3>
                            </Card.Body>
                        </Card>
                    </Col>
                </Row>

                {/* Withdraw Section */}
                <Card className="bg-dark text-white border-secondary mb-4">
                    <Card.Body>
                        <Row className="align-items-center">
                            <Col md={8}>
                                <h5 className="mb-2">Withdraw Earnings</h5>
                                <p className="text-white-50 mb-0">
                                    Transfer your available balance to your bank account
                                </p>
                            </Col>
                            <Col md={4} className="text-md-end">
                                <Button
                                    className="btn-viago-primary"
                                    disabled={availableBalance === 0}
                                >
                                    <FaDownload className="me-2" />
                                    Withdraw
                                </Button>
                            </Col>
                        </Row>
                    </Card.Body>
                </Card>

                {/* Earnings History */}
                <Card className="bg-dark text-white border-secondary">
                    <Card.Header className="bg-transparent border-secondary">
                        <h5 className="mb-0">Earnings History</h5>
                    </Card.Header>
                    <Card.Body>
                        {earningsHistory.length === 0 ? (
                            <div className="text-center text-white-50 py-5">
                                <FaMoneyBillWave className="fs-1 mb-3 opacity-50" />
                                <p>No earnings yet. Complete rides to start earning!</p>
                            </div>
                        ) : (
                            <Table responsive variant="dark" className="mb-0">
                                <thead>
                                    <tr>
                                        <th>Date</th>
                                        <th>Description</th>
                                        <th>Type</th>
                                        <th className="text-end">Amount</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {earningsHistory.map((transaction, index) => (
                                        <tr key={index}>
                                            <td>{transaction.date}</td>
                                            <td>{transaction.description}</td>
                                            <td>
                                                <span
                                                    className={
                                                        transaction.type === 'earning'
                                                            ? 'text-success'
                                                            : 'text-danger'
                                                    }
                                                >
                                                    {transaction.type}
                                                </span>
                                            </td>
                                            <td className="text-end">
                                                LKR {transaction.amount.toFixed(2)}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </Table>
                        )}
                    </Card.Body>
                </Card>
            </Container>
        </div>
    )
}

export default DriverEarnings
