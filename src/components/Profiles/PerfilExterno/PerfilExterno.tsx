import React from "react";
import styles from "./PerfilExterno.module.css";
import { useParams } from "react-router-dom";
import { useEffect } from "react";
import { getUserById, followUser, unfollowUser, getFollowedUsers } from "../../../service/userService";
interface PerfilExternoProps {
  user: {
    _id: string;
    name: string;
    email: string;
    phone?: string;
    description?: string;
    wallet?: number;
    avatar?: string;
    Flag?: boolean;
  };
}

const PerfilExterno: React.FC = () => {
    const currentUserId = localStorage.getItem("userId");
    if (!currentUserId) {
        console.error("No user ID found in localStorage");
        return <div>Error: No user ID found</div>;
    }
    const { id } = useParams<{ id: string }>(); // Obtén el ID de la URL
    const [user , setUser] = React.useState<PerfilExternoProps["user"] | null>(null); // Datos originales de la compañía
    const [isFollowing, setIsFollowing] = React.useState<boolean>(false);

    useEffect(() => {
  
      if (!id) {
        return;
      }
      const fetchUser = async () => {
        try {
            console.log("ID de usuario:", id);
          const response = await getUserById(id || "");
          setUser(response);
          console.log("Compañía cargada:", response);
        } catch (error) {
          console.error("Error al cargar la compañía:", error);
        }
      };
      const fetchFollowedUsers = async () => {
        try {
          const followedUsers = await getFollowedUsers(currentUserId);
          console.log("Usuarios seguidos:", followedUsers);
          setIsFollowing(followedUsers.some((user) => user._id === id));
        } catch (error) {
          console.error("Error al cargar los usuarios seguidos:", error);
        }
      };
      fetchFollowedUsers();
      fetchUser();
    }, [id]);

    
      const handleFollow = async () => {
    if (!user) return;
    try {
      await followUser(currentUserId, user._id);
      console.log("Usuario seguido:", user._id);
      console.log("ID del usuario actual:", currentUserId);
      setIsFollowing(true);
    } catch (error) {
      console.error("Error al seguir al usuario:", error);
    }
  };

  const handleUnfollow = async () => {
    if (!user) return;
    try {
      await unfollowUser(currentUserId, user._id);
      setIsFollowing(false);
    } catch (error) {
      console.error("Error al dejar de seguir al usuario:", error);
    }
  };

    if (!user) {
        return <div className={styles["perfil-loading"]}>Cargando perfil...</div>;
        }

    return (
    <div className={styles["perfil-wrapper"]}>
      <div className={styles["perfil-container"]}>
        <img
          src={user.avatar || "https://via.placeholder.com/150"}
          alt="Avatar del usuario"
          className={styles["perfil-avatar"]}
        />
        <h2 className={styles["perfil-name"]}>{user.name || "Nombre no disponible"}</h2>
        <p className={styles["perfil-email"]}>
          <strong>Email:</strong> {user.email || "No disponible"}
        </p>
        {user.phone && (
          <p className={styles["perfil-phone"]}>
            <strong>Teléfono:</strong> {user.phone}
          </p>
        )}
        <div className={styles["perfil-divider"]}></div>
        {user.wallet !== undefined && (
          <p className={styles["perfil-wallet"]}>
            <strong>Billetera:</strong> ${user.wallet.toFixed(2)}
          </p>
        )}
        {user.description && (
          <p className={styles["perfil-description"]}>
            <strong>Descripción:</strong> {user.description}
          </p>
        )}
        <div className={styles["perfil-status-row"]}>
          <span
            className={`${styles["perfil-status"]} ${user.Flag ? "" : styles["inactive"]}`}
          >
            <strong>Estado:</strong>{" "}
            {user.Flag !== undefined ? (user.Flag ? "Activo" : "Inactivo") : "No disponible"}
          </span>
          {!isFollowing ? (
            <button className={styles["perfil-follow-btn"]} onClick={handleFollow}>Follow</button>
          ) : (
            <button className={styles["perfil-unfollow-btn"]} onClick={handleUnfollow}>Unfollow</button>
          )}
        </div>
      </div>
    </div>
  );
};

export default PerfilExterno;