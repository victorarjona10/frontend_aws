import React from "react";
import styles from "./CompaniesDisplay.module.css";
import { Company } from "../../../models/Company";
import { useNavigate } from "react-router-dom";

interface CompaniesDisplayProps {
  companies: Company[];
}

const CompaniesDisplay: React.FC<CompaniesDisplayProps> = ({ companies }) => {
  const navigate = useNavigate();

  return (
    <div className={styles.perfilDisplayContainer}>
      <h3>Llista dempreses</h3>
      {companies.length > 0 ? (
        <ul className={styles.userList}>
          {companies.map((company) => (
            <li
              key={company._id}
              className={styles.userItem}
              onClick={() => navigate(`/company/${company._id}`)}
            >
              <img
                src={company.icon || "https://via.placeholder.com/50"}
                alt={`Avatar de ${company.name || 'empresa'}`}
                title={company.name}
                className={styles.userAvatar}
              />
              <div className={styles.userInfo}>
                <p className={styles.userName}>
                  {company.name || "Nom no disponible"}
                </p>
                <p className={styles.userEmail}>
                  {company.email || "Correu no disponible"}
                </p>
              </div>
            </li>
          ))}
        </ul>
      ) : (
        <p>No hi ha empreses disponibles.</p>
      )}
    </div>
  );
};

export default CompaniesDisplay;
