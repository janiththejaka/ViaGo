import React, { useState, useEffect } from 'react'
import { Button } from 'react-bootstrap'
import {
  MapContainer,
  TileLayer,
  Marker,
  Polyline,
  useMapEvents,
  useMap,
} from 'react-leaflet'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import TripForm from './TripForm'

delete (L.Icon.Default.prototype as any)._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
})

const pickupIcon = new L.Icon({
  iconUrl: 'https://cdn-icons-png.flaticon.com/512/684/684908.png',
  iconSize: [32, 32],
})

const dropIcon = new L.Icon({
  iconUrl: 'https://cdn-icons-png.flaticon.com/512/149/149060.png',
  iconSize: [32, 32],
})

const userIcon = new L.Icon({
  iconUrl: 'https://cdn-icons-png.flaticon.com/512/1946/1946429.png',
  iconSize: [34, 34],
})

interface Location {
  lat: number
  lng: number
}

interface Suggestion {
  place_id: string
  display_name: string
  lat: string
  lon: string
  address?: {
    country_code?: string
  }
}

function FlyToLocation({ position }: { position: Location | null }) {
  const map = useMap()
  useEffect(() => {
    if (position) map.flyTo(position, 16)
  }, [position, map])
  return null
}

interface ClickHandlerProps {
  mode: 'pickup' | 'drop'
  setPickup: (location: Location) => void
  setDrop: (location: Location) => void
  setPickupText: (text: string) => void
  setDropText: (text: string) => void
}

function ClickHandler({ mode, setPickup, setDrop, setPickupText, setDropText }: ClickHandlerProps) {
  useMapEvents({
    click(e) {
      const { lat, lng } = e.latlng

      if (mode === 'pickup') {
        setPickup(e.latlng)
        setPickupText(`${lat.toFixed(5)}, ${lng.toFixed(5)}`)
      } else {
        setDrop(e.latlng)
        setDropText(`${lat.toFixed(5)}, ${lng.toFixed(5)}`)
      }
    },
  })

  return null
}

export default function RouteMap() {
  const [pickup, setPickup] = useState<Location | null>(null)
  const [drop, setDrop] = useState<Location | null>(null)
  const [mode, setMode] = useState<'pickup' | 'drop'>('pickup')
  const [isSidebarOpen, setIsSidebarOpen] = useState(true)

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

  useEffect(() => {
    if (!navigator.geolocation) return

    const watchId = navigator.geolocation.watchPosition(
      (pos) => {
        const { latitude, longitude } = pos.coords
        setUserLocation({ lat: latitude, lng: longitude })
      },
      (err) => console.error('GPS error:', err),
      {
        enableHighAccuracy: true,
        timeout: 5000,
        maximumAge: 0,
      }
    )

    return () => navigator.geolocation.clearWatch(watchId)
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
    <div className="vh-100 d-flex flex-column bg-viago-black">
      <header className="px-4 py-3 bg-viago-black border-bottom border-secondary d-flex justify-content-between align-items-center">
        <h2 className="text-white fw-bold mb-0" style={{ fontSize: 'clamp(1.25rem, 3vw, 1.75rem)' }}>
          Via<span className="text-viago-green">GO</span>
        </h2>
        <Button
          variant="link"
          onClick={() => setIsSidebarOpen(!isSidebarOpen)}
          className="d-lg-none text-white p-0"
        >
          <svg width="24" height="24" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
            <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </Button>
      </header>

      <div className="flex-grow-1 d-flex position-relative overflow-hidden">
        <aside
          className={`${
            isSidebarOpen ? '' : 'd-none'
          } d-lg-block position-absolute position-lg-relative bg-viago-dark border-end border-secondary p-4 overflow-auto`}
          style={{ 
            width: '100%', 
            maxWidth: '400px', 
            height: '100%',
            zIndex: 10 
          }}
        >
          <Button
            variant="link"
            onClick={() => setIsSidebarOpen(false)}
            className="d-lg-none position-absolute top-0 end-0 m-3 text-secondary p-0"
          >
            <svg width="24" height="24" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </Button>

          <TripForm
            pickupText={pickupText}
            setPickupText={setPickupText}
            dropText={dropText}
            setDropText={setDropText}
            pickupSuggestions={pickupSuggestions}
            dropSuggestions={dropSuggestions}
            handlePickupSelect={handlePickupSelect}
            handleDropSelect={handleDropSelect}
            setMode={setMode}
            distance={distance}
            duration={duration}
            userLocation={userLocation}
            setPickup={setPickup}
            setDrop={setDrop}
          />
        </aside>

        <main className="flex-grow-1 p-3 p-sm-4 bg-viago-black">
          <div className="map-container h-100">
            <MapContainer
              center={[6.9271, 79.8612]}
              zoom={13}
              style={{ width: '100%', height: '100%' }}
            >
              <TileLayer 
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                attribution='&copy; OpenStreetMap contributors'
              />

              <ClickHandler
                mode={mode}
                setPickup={setPickup}
                setDrop={setDrop}
                setPickupText={setPickupText}
                setDropText={setDropText}
              />

              <FlyToLocation position={pickup} />
              <FlyToLocation position={drop} />
              <FlyToLocation position={userLocation} />

              {userLocation && <Marker position={userLocation} icon={userIcon} />}
              {pickup && <Marker position={pickup} icon={pickupIcon} />}
              {drop && <Marker position={drop} icon={dropIcon} />}

              {routeCoords.length > 0 && (
                <Polyline positions={routeCoords} pathOptions={{ color: '#10b981', weight: 5 }} />
              )}
            </MapContainer>
          </div>
        </main>
      </div>
    </div>
  )
}