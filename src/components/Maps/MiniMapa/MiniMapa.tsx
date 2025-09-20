import React from "react";
import { MapContainer, TileLayer, Marker } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import styles from "./MiniMapa.module.css";
import L from "leaflet";

const customIcon = new L.Icon({
  iconUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
  shadowSize: [41, 41],
});

interface MiniMapaProps {
  lat: number;
  lng: number;
}

const MiniMapa: React.FC<MiniMapaProps> = ({ lat, lng }) => {
  return (
    <MapContainer
      center={[lat, lng]}
      zoom={15}
      className={styles.mapContainer} // Aplica la clase CSS aquí
    >
      <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
      <Marker position={[lat, lng]} icon={customIcon} />
    </MapContainer>
  );
};

export default MiniMapa;