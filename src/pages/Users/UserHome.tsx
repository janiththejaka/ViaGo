import { useState, useEffect } from 'react'
import { Container, Row, Col } from 'react-bootstrap'
import Navbar from '../../components/Navbar'
import HeroBooking from '../../components/HeroBooking'
import MapContainer from '../../components/MapContainer'
import FeaturesSection from '../../components/FeatureSection'
import Footer from '../../components/Footer'

interface Suggestion {
  place_id: string
  display_name: string
  lat: string
  lon: string
  address?: {
    country_code?: string
  }
}

interface Location {
  lat: number
  lng: number
}

const Home = () => {
  const [pickup, setPickup] = useState<Location | null>(null)
  const [drop, setDrop] = useState<Location | null>(null)
  const [mode, setMode] = useState<'pickup' | 'drop'>('pickup')

  const [pickupText, setPickupText] = useState('')
  const [dropText, setDropText] = useState('')

  const [pickupSuggestions, setPickupSuggestions] = useState<Suggestion[]>([])
  const [dropSuggestions, setDropSuggestions] = useState<Suggestion[]>([])

  const [routeCoords, setRouteCoords] = useState<[number, number][]>([])
  const [distance, setDistance] = useState<string | null>(null)
  const [duration, setDuration] = useState<string | null>(null)

  const [userLocation, setUserLocation] = useState<Location | null>(null)

  const searchAddress = async (query: string, setter: React.Dispatch<React.SetStateAction<Suggestion[]>>) => {
    if (!query || query.length < 3) {
      setter([])
      return
    }

    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${query}&limit=20`
      )
      const data = await res.json()

      const filtered = (data || []).filter((item: Suggestion) => {
        const countryCode = item.address?.country_code
        if (countryCode) return countryCode.toLowerCase() === 'lk'
        return item.display_name && item.display_name.toLowerCase().includes('sri lanka')
      })

      setter(filtered)
    } catch (err) {
      console.error('Search error:', err)
    }
  }

  useEffect(() => {
    searchAddress(pickupText, setPickupSuggestions)
  }, [pickupText])

  useEffect(() => {
    searchAddress(dropText, setDropSuggestions)
  }, [dropText])

  const requestUserLocation = () => {
    if (!navigator.geolocation) {
      alert('Geolocation is not supported by your browser')
      return
    }

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude, longitude } = pos.coords
        setUserLocation({ lat: latitude, lng: longitude })
      },
      (err) => {
        console.error('GPS error:', err)
        alert('Could not get your location. Please check permissions.')
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0,
      }
    )
  }

  useEffect(() => {
    requestUserLocation()
  }, [])

  useEffect(() => {
    if (!pickup || !drop) return

    const fetchRoute = async () => {
      try {
        const url = `https://router.project-osrm.org/route/v1/driving/${pickup.lng},${pickup.lat};${drop.lng},${drop.lat}?overview=full&geometries=geojson`
        const res = await fetch(url)
        const data = await res.json()

        if (!data.routes?.length) return

        const coords: [number, number][] = data.routes[0].geometry.coordinates.map((c: number[]) => [
          c[1],
          c[0],
        ])

        setRouteCoords(coords)
        setDistance((data.routes[0].distance / 1000).toFixed(2))
        setDuration((data.routes[0].duration / 60).toFixed(1))
      } catch (e) {
        console.error('Route error:', e)
      }
    }

    fetchRoute()
  }, [pickup, drop])

  const handlePickupSelect = (item: Suggestion) => {
    const lat = parseFloat(item.lat)
    const lon = parseFloat(item.lon)

    setPickup({ lat, lng: lon })
    setPickupText(item.display_name)
    setPickupSuggestions([])
  }

  const handleDropSelect = (item: Suggestion) => {
    const lat = parseFloat(item.lat)
    const lon = parseFloat(item.lon)

    setDrop({ lat, lng: lon })
    setDropText(item.display_name)
    setDropSuggestions([])
  }

  return (
    <div className="min-vh-100 bg-viago-black">
      <Navbar />

      <main style={{ paddingTop: '70px' }}>
        <Container fluid className="px-0">
          <Row className="g-0">
            <Col xs={12} lg={6}>
              <HeroBooking
                pickupText={pickupText}
                setPickupText={setPickupText}
                dropText={dropText}
                setDropText={setDropText}
                pickupSuggestions={pickupSuggestions}
                dropSuggestions={dropSuggestions}
                handlePickupSelect={handlePickupSelect}
                handleDropSelect={handleDropSelect}
                setMode={setMode}
                userLocation={userLocation}
                setPickup={setPickup}
                setDrop={setDrop}
                distance={distance}
                duration={duration}
                onRequestLocation={requestUserLocation}
              />
            </Col>
            <Col xs={12} lg={6}>
              <MapContainer
                pickup={pickup}
                drop={drop}
                userLocation={userLocation}
                routeCoords={routeCoords}
                mode={mode}
                setPickup={setPickup}
                setDrop={setDrop}
                setPickupText={setPickupText}
                setDropText={setDropText}
              />
            </Col>
          </Row>
        </Container>

        <FeaturesSection />
      </main>

      <Footer />
    </div>
  )
}

export default Home