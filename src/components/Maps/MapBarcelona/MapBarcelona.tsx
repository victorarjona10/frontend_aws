import React, { useEffect, useState } from "react";
import { MapContainer, TileLayer, Marker } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import styles from "./MapBarcelona.module.css";
import { GetAllCompanies, getCompanyByProductName, getCompanyByName, getCompanyByNameWithCoord } from "../../../service/companiesService";
import { Company } from "../../../models/Company";
import { useNavigate } from "react-router-dom";
import ReserveProducts from "../../ReserveProducts/ReserveProducts";
import { useTranslation } from 'react-i18next';

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

interface MarkerInfo {
  lat: number;
  lng: number;
  info: string;
  shop?: string;
  phone?: string;
  icon?: string;
  score?: number;
}

const BarcelonaMap: React.FC = () => {
  const [markers, setMarkers] = useState<MarkerInfo[]>([]);
  const [companies, setCompanies] = useState<any[]>([]);
  const [reloadCompanies, setReloadCompanies] = useState<boolean>(false);
  const [selectedCompany, setSelectedCompany] = useState<any | null>(null);
  const [searchType, setSearchType] = useState<string>("product"); // Nuevo estado para el tipo de búsqueda
  const [searchValue, setSearchValue] = useState("");
  const navigate = useNavigate();
  const { t } = useTranslation();


  const handleSearch = async (query: string) => {
    if (query) {
      try {
        let filteredResults: any[] = [];
        if (searchType === "product") {
          filteredResults = await getCompanyByProductName(query);
        } else if (searchType === "company") {
          filteredResults = await getCompanyByName(query);
        }
        else if (searchType === "coordenates") {
          navigator.geolocation.getCurrentPosition(async (position) => {
            const lat = position.coords.latitude;
            const lng = position.coords.longitude;
            filteredResults = await getCompanyByNameWithCoord(query, lat, lng);
            console.log("Resultados filtrados", filteredResults);
            const newMarkers: MarkerInfo[] = filteredResults.map((company) => ({
              lat: company.location.lat,
              lng: company.location.lng,
              info: "this company is no registered yet",
              name: company.name,
              phone: "this company is no registered yet",
              icon: company.icon,
              score: company.rating,
              status: company.businessStatus || "No disponible",
              address: company.address || "No disponible",
              openingHours: company.openingHours || "No disponible",
            }));
            setMarkers(newMarkers);
          });
          return;
        }

        console.log("Resultados filtrados", filteredResults);

        const newMarkers = filteredResults.map((company) => ({
          lat: company.coordenates_lat,
          lng: company.coordenates_lng,
          info: company.description,
          shop: company.name,
          phone: company.phone,
          icon: company.icon,
          score: company.rating,
        }));
        setMarkers(newMarkers);

      } catch (error) {
        console.error("Error fetching results:", error);
      }
    } else {
      setReloadCompanies(true);
    }
  };



  useEffect(() => {
    const handleCompanies = async () => {
      const newCompanies: Company[] = await GetAllCompanies();
      setCompanies(newCompanies);
      console.log(newCompanies); // Verifica la estructura de los datos
      const newMarkers = newCompanies.map((company) => ({
        lat: company.coordenates_lat,
        lng: company.coordenates_lng,
        info: company.description,
        shop: company.name,
        phone: company.phone,
        icon: company.icon,
        score: company.rating,
      }));
      setMarkers(newMarkers);
    };
    handleCompanies();
    setReloadCompanies(false);
  }, [reloadCompanies]);

  const handleMarkerClick = (company: Company) => {
    console.log("Marker clicked:", company);
    setSelectedCompany(company);
  };

  const closeSidebar = () => {
    setSelectedCompany(null);
  };

  const loadCompanyProfile = (company: Company) => {
    console.log("Loading company profile:", company);
    navigate(`/company/${company._id}`); // Redirige a la página del perfil de la empresa
  };

  return (
    <div className={styles.mapWrapper}>
      {/* Barra buscadora */}
      <div className={styles.floatingSearchBar}>
        <select
          className={styles.searchTypeSelect}
          value={searchType}
          onChange={(e) => setSearchType(e.target.value)}
        >
          <option value="product">{t('map.search1')}</option>
          <option value="company">{t('map.search2')}</option>
          <option value="coordenates">{t('map.search3')}</option>
        </select>
        <input
          type="text"
          placeholder={searchType === "product" ? t('map.search') : t('map.search')}
          className={styles.searchInput}
          value={searchValue}
          onChange={e => setSearchValue(e.target.value)}
          onKeyDown={e => {
            if (e.key === "Enter") handleSearch(searchValue);
          }}
        />
        <button
          className={styles.searchButton}
          onClick={() => handleSearch(searchValue)}
        >
          {t('common.search')}
        </button>
      </div>

      {/* Contenedor del mapa y la barra lateral */}
      <div className={styles.mapContainer}>
        {selectedCompany && (
          <aside className={`${styles.sidebar} ${styles.open}`}>
            <button className={styles.closeButton} onClick={closeSidebar} title="Cerrar">
              ×
            </button>
            <div className={styles.sidebarContent}>
              <h2
                className={styles.sidebarTitle}
                onClick={() => loadCompanyProfile(selectedCompany)}
                style={{ cursor: "pointer" }}
              >
                {selectedCompany.name || t('common.notAvailable')}
              </h2>
              {selectedCompany.icon && (
                <img
                  src={selectedCompany.icon}
                  alt="Icon"
                  className={styles.iconImage}
                />
              )}
              <p>
                <strong>{t('common.description')}:</strong>{" "}
                {selectedCompany.description || t('common.notAvailable')}
              </p>
              <p>
                <strong>{t('company.profile.phone')}:</strong>{" "}
                {selectedCompany.phone || t('common.notAvailable')}
              </p>
              <p>
                <strong>{t('company.profile.rating')}:</strong>{" "}
                {selectedCompany.rating
                  ? `${selectedCompany.rating} ⭐`
                  : t('common.notAvailable')}
              </p>
              {selectedCompany.products && selectedCompany.products.length > 0 ? (
                <>
                  <p>
                    <strong>Productos:</strong>
                  </p>
                  <div className={styles.productsContainer}>
                    {selectedCompany.products.map((product: any, index: number) => (
                      <div key={index} className={styles.productCard}>
                        <p>
                          <strong>{product.name || "Sin nombre"}</strong>
                        </p>
                        <p>
                          <span className={styles.productRating}>
                            {product.rating ? `${product.rating} ⭐` : "Sin valoración"}
                          </span>
                        </p>
                        <p className={styles.productDescription}>
                          {product.description || "Sin descripción"}
                        </p>
                        <p>
                          <strong>Precio:</strong>{" "}
                          {product.price ? `${product.price}€` : "No disponible"}
                        </p>
                      </div>
                    ))}
                  </div>
                  <button
                    className={styles.reserveButton}
                    onClick={() => {
                      if (selectedCompany) {
                        navigate(`/ReserveProducts/${selectedCompany._id}`);
                      }
                    }}
                  >
                    Reservar productos
                  </button>
                </>
              ) : (
                <p>No hay productos disponibles</p>
              )}
            </div>
          </aside>
        )}

        <MapContainer
          center={[41.3784, 2.1926]}
          zoom={13}
          className={styles.mapContainer}
        >
          <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
          {markers.map((marker, index) => {
            // Si el marker coincide con una company de tu base de datos, usa el sidebar
            const company = companies.find(
              (company) =>
                (company.coordenates_lat === marker.lat && company.coordenates_lng === marker.lng) ||
                (company.location && company.location.lat === marker.lat && company.location.lng === marker.lng)
            );

            if (company) {
              // Marker de tu base de datos: click abre el sidebar
              return (
                <Marker
                  key={index}
                  position={[marker.lat, marker.lng]}
                  icon={customIcon}
                  eventHandlers={{
                    click: () => handleMarkerClick(company),
                  }}
                />
              );
            } else {
              // Marker de Google Places: click muestra un Popup
              return (
                <Marker
                  key={index}
                  position={[marker.lat, marker.lng]}
                  icon={customIcon}
                  eventHandlers={{
                    click: () => handleMarkerClick(company || marker),
                  }}
                />



              );
            }
          })}
        </MapContainer>
      </div>
    </div>
  );
};

export default BarcelonaMap;