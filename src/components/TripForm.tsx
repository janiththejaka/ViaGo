import React, { useState } from 'react'
import { Form, Card, ListGroup } from 'react-bootstrap'

interface Suggestion {
  place_id: string
  display_name: string
  lat: string
  lon: string
}

interface UserLocation {
  lat: number
  lng: number
}

interface TripFormProps {
  pickupText: string
  setPickupText: (text: string) => void
  dropText: string
  setDropText: (text: string) => void
  pickupSuggestions: Suggestion[]
  dropSuggestions: Suggestion[]
  handlePickupSelect: (item: Suggestion) => void
  handleDropSelect: (item: Suggestion) => void
  setMode: (mode: 'pickup' | 'drop') => void
  distance: string | null
  duration: string | null
  userLocation: UserLocation | null
  setPickup: (location: { lat: number; lng: number }) => void
  setDrop: (location: { lat: number; lng: number }) => void
}

export default function TripForm({
  pickupText,
  setPickupText,
  dropText,
  setDropText,
  pickupSuggestions,
  dropSuggestions,
  handlePickupSelect,
  handleDropSelect,
  setMode,
  distance,
  duration,
  userLocation,
  setPickup,
  setDrop,
}: TripFormProps) {
  const [focused, setFocused] = useState<'pickup' | 'drop' | null>(null)

  const useCurrent = (type: 'pickup' | 'drop') => {
    if (!userLocation) return
    const loc = { lat: userLocation.lat, lng: userLocation.lng }

    if (type === 'pickup') {
      setPickup({ lat: loc.lat, lng: loc.lng })
      setPickupText('Current location')
    } else {
      setDrop({ lat: loc.lat, lng: loc.lng })
      setDropText('Current location')
    }
    setFocused(null)
  }

  const onSelectMap = (type: 'pickup' | 'drop') => {
    setMode(type)
    setFocused(null)
  }

  const preventBlur = (e: React.MouseEvent) => e.preventDefault()

  return (
    <div>
      <h3 className="text-white fw-bold mb-4">Select Locations</h3>

      <Form.Group className="mb-3 position-relative">
        <Form.Label className="text-white-50 small">Pickup Location</Form.Label>
        <div className="position-relative">
          <span className="position-absolute top-50 translate-middle-y ms-3 text-viago-green" style={{ zIndex: 10 }}>
            <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="3" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 2v7m0 6v7m7-7h-7m-6 0H2" />
            </svg>
          </span>
          <Form.Control
            type="text"
            value={pickupText}
            placeholder="Search address..."
            onChange={(e) => setPickupText(e.target.value)}
            onFocus={() => setFocused('pickup')}
            onBlur={() => setTimeout(() => setFocused((f) => (f === 'pickup' ? null : f)), 150)}
            className="form-control-viago ps-5"
            style={{ paddingTop: '0.75rem', paddingBottom: '0.75rem' }}
          />
        </div>

        {focused === 'pickup' && (
          <div className="dropdown-viago position-absolute w-100 mt-2" style={{ zIndex: 1000 }}>
            {userLocation && (
              <div
                onMouseDown={preventBlur}
                onClick={() => useCurrent('pickup')}
                className="dropdown-viago-item"
              >
                📍 Use current location
              </div>
            )}
            <div
              onMouseDown={preventBlur}
              onClick={() => onSelectMap('pickup')}
              className="dropdown-viago-item"
            >
              🗺️ Select on map
            </div>
            {pickupSuggestions.map((item) => (
              <div
                key={item.place_id}
                onMouseDown={preventBlur}
                onClick={() => {
                  handlePickupSelect(item)
                  setFocused(null)
                }}
                className="dropdown-viago-item"
              >
                {item.display_name}
              </div>
            ))}
          </div>
        )}
      </Form.Group>

      <Form.Group className="mb-4 position-relative">
        <Form.Label className="text-white-50 small">Drop Location</Form.Label>
        <div className="position-relative">
          <span className="position-absolute top-50 translate-middle-y ms-3 text-viago-green" style={{ zIndex: 10 }}>
            <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          </span>
          <Form.Control
            type="text"
            value={dropText}
            placeholder="Search address..."
            onChange={(e) => setDropText(e.target.value)}
            onFocus={() => setFocused('drop')}
            onBlur={() => setTimeout(() => setFocused((f) => (f === 'drop' ? null : f)), 150)}
            className="form-control-viago ps-5"
            style={{ paddingTop: '0.75rem', paddingBottom: '0.75rem' }}
          />
        </div>

        {focused === 'drop' && (
          <div className="dropdown-viago position-absolute w-100 mt-2" style={{ zIndex: 1000 }}>
            <div
              onMouseDown={preventBlur}
              onClick={() => onSelectMap('drop')}
              className="dropdown-viago-item"
            >
              🗺️ Select on map
            </div>
            {dropSuggestions.map((item) => (
              <div
                key={item.place_id}
                onMouseDown={preventBlur}
                onClick={() => {
                  handleDropSelect(item)
                  setFocused(null)
                }}
                className="dropdown-viago-item"
              >
                {item.display_name}
              </div>
            ))}
          </div>
        )}
      </Form.Group>

      {distance && duration && (
        <Card className="border-viago-green bg-black bg-opacity-50">
          <Card.Body>
            <h4 className="text-white h6 fw-semibold mb-3">
              <svg className="me-2" width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2" style={{ display: 'inline', verticalAlign: 'middle' }}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Trip Details
            </h4>
            <div className="d-flex justify-content-between mb-2">
              <span className="text-secondary">Distance</span>
              <span className="text-white fw-semibold fs-5">{distance} km</span>
            </div>
            <div className="d-flex justify-content-between">
              <span className="text-secondary">Duration</span>
              <span className="text-white fw-semibold fs-5">{duration} mins</span>
            </div>
          </Card.Body>
        </Card>
      )}
    </div>
  )
}