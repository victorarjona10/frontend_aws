import React from "react";
import styles from "./UsersDisplay.module.css";
import { Company } from "../../../models/Company";
import { User } from "../../../models/User";
import { useNavigate } from "react-router-dom";

interface UsersDisplayProps {
  users: User[];
}

const UsersDisplay: React.FC<UsersDisplayProps> = ({ users }) => {
  const navigate = useNavigate();

  return (
    <div className={styles.perfilDisplayContainer}>
      <h3>Llista dusuaris</h3>
      {users.length > 0 ? (
        <ul className={styles.userList}>
          {users.map((user) => (
            <li
              key={user._id}
              className={styles.userItem}
              onClick={() => navigate(`/perfilExterno/${user._id}`)}
            >
              <img
                src={user.avatar || "https://via.placeholder.com/50"}
                alt={`Avatar de ${user.name || 'usuari'}`}
                title={user.name}
                className={styles.userAvatar}
              />
              <div className={styles.userInfo}>
                <p className={styles.userName}>
                  {user.name || "Nom no disponible"}
                </p>
                <p className={styles.userEmail}>
                  {user.email || "Correu no disponible"}
                </p>
              </div>
            </li>
          ))}
        </ul>
      ) : (
        <p>No hi ha usuaris disponibles.</p>
      )}
    </div>
  );
};

export default UsersDisplay;
