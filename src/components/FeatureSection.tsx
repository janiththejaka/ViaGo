import { Container, Row, Col, Card } from 'react-bootstrap'

const FeaturesSection = () => {
  const features = [
    {
      title: 'Safe Rides',
      description: 'Verified drivers and 24/7 customer support for your safety',
      icon: (
        <svg width="32" height="32" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
        </svg>
      ),
    },
    {
      title: 'Affordable Prices',
      description: 'Competitive rates with transparent pricing and no hidden fees',
      icon: (
        <svg width="32" height="32" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
    },
    {
      title: 'Real-Time Tracking',
      description: 'Track your ride in real-time and share your trip with friends',
      icon: (
        <svg width="32" height="32" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
          <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
          <path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
      ),
    },
  ]

  const stats = [
    { value: '10M+', label: 'Happy Riders' },
    { value: '50K+', label: 'Active Drivers' },
    { value: '100+', label: 'Cities' },
    { value: '4.9', label: 'Average Rating' },
  ]

  return (
    <section className="py-5 bg-white">
      <Container>
        <div className="text-center mb-5">
          <h2 className="text-dark fw-bold mb-3" style={{ fontSize: 'clamp(2rem, 5vw, 2.5rem)' }}>
            Why Choose ViaGO?
          </h2>
          <p className="text-muted mx-auto" style={{ maxWidth: '600px' }}>
            Experience the future of ride-sharing with our reliable, safe, and affordable service
          </p>
        </div>

        <Row className="g-4 mb-5">
          {features.map((feature, index) => (
            <Col key={index} xs={12} md={4}>
              <Card className="card-viago-feature-light h-100 p-4">
                <Card.Body>
                  <div className="text-viago-green mb-3">
                    {feature.icon}
                  </div>
                  <h3 className="text-dark h5 mb-3">{feature.title}</h3>
                  <p className="text-muted mb-0">{feature.description}</p>
                </Card.Body>
              </Card>
            </Col>
          ))}
        </Row>

        <Row className="g-4 text-center">
          {stats.map((stat, index) => (
            <Col key={index} xs={6} md={3}>
              <div className="text-viago-green fw-bold mb-2" style={{ fontSize: 'clamp(2rem, 4vw, 2.5rem)' }}>
                {stat.value}
              </div>
              <div className="text-muted small">{stat.label}</div>
            </Col>
          ))}
        </Row>
      </Container>
    </section>
  )
}

export default FeaturesSection