import { useEffect } from 'react'
import {
  MapContainer as LeafletMapContainer,
  TileLayer,
  Marker,
  Polyline,
  useMapEvents,
  useMap,
} from 'react-leaflet'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'

// Fix for default marker icons
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

interface MapContainerProps {
  pickup: Location | null
  drop: Location | null
  userLocation: Location | null
  routeCoords: [number, number][]
  mode: 'pickup' | 'drop'
  setPickup: (location: Location) => void
  setDrop: (location: Location) => void
  setPickupText: (text: string) => void
  setDropText: (text: string) => void
}

function FlyToLocation({ position }: { position: Location | null }) {
  const map = useMap()
  useEffect(() => {
    if (position) map.flyTo(position, 16)
  }, [position, map])
  return null
}

function ClickHandler({
  mode,
  setPickup,
  setDrop,
  setPickupText,
  setDropText
}: {
  mode: 'pickup' | 'drop'
  setPickup: (location: Location) => void
  setDrop: (location: Location) => void
  setPickupText: (text: string) => void
  setDropText: (text: string) => void
}) {
  useMapEvents({
    click(e) {
      const { lat, lng } = e.latlng
      if (mode === 'pickup') {
        setPickup({ lat, lng })
        setPickupText(`${lat.toFixed(5)}, ${lng.toFixed(5)}`)
      } else {
        setDrop({ lat, lng })
        setDropText(`${lat.toFixed(5)}, ${lng.toFixed(5)}`)
      }
    },
  })
  return null
}

const MapContainer = ({
  pickup,
  drop,
  userLocation,
  routeCoords,
  mode,
  setPickup,
  setDrop,
  setPickupText,
  setDropText
}: MapContainerProps) => {
  return (
    <div className="d-flex align-items-center justify-content-center p-3 p-sm-4 h-100" style={{ minHeight: '400px' }}>
      <div
        className="w-100 h-100 bg-viago-dark border border-2 border-dashed rounded overflow-hidden"
        style={{
          minHeight: '350px',
          borderColor: 'var(--viago-gray-700) !important'
        }}
      >
        <LeafletMapContainer
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
            <Polyline positions={routeCoords} pathOptions={{ color: '#035137ff', weight: 5 }} />
          )}
        </LeafletMapContainer>
      </div>
    </div>
  )
}

export default MapContainer