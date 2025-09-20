import React, {useState, useEffect} from 'react';
import styles from './Perfil.module.css';
import { useLocation, useNavigate } from 'react-router-dom';
import Cloudinary from '../../Cloudinary/Cloudinary';
import { getUserById, UpdateUserById, getFollowedCompanies } from '../../../service/userService';
import { getOrdersByUserId } from '../../../service/orderService'; // Asegúrate de importar la función correcta para obtener órdenes
import { getFollowedUsers, getFollowingUsers } from '../../../service/userService'; // Asegúrate de importar la función correcta para obtener usuarios seguidos
import OrdersDisplay from '../../Displays/OrdersDisplay/OrdersDisplay'; // Asegúrate de importar el componente correcto para mostrar órdenes
import CompaniesDisplay from '../../Displays/CompaniesDisplay/CompaniesDisplay';
import UsersDisplay from '../../Displays/UsersDisplay/UsersDisplay';
const Perfil: React.FC = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const initialUser = location.state?.user;
    const [selectedCategory, setSelectedCategory] = useState<string>("orders");
    const [recentOrders, setRecentOrders] = useState<any[]>([]); // Estado para las órdenes recientes
    const [isLoadingOrders, setIsLoadingOrders] = useState(true);
    
    const [user, setUser] = useState(initialUser); // Estado local para el usuario
    const [isEditing, setIsEditing] = useState(false); // Estado para alternar entre edición y visualización
    const [companyFollowed, setCompanyFollowed] = useState<any[]>([]); // Estado para los seguidores
    const [usersFollowed, setUsersFollowed] = useState<any[]>([]); // Estado para los usuarios seguidos
    const [usersFollowers, setUsersFollowers] = useState<any[]>([]); // Estado para los usuarios que siguen al usuario actual
    const [editedUser, setEditedUser] = useState({
        _id: user?._id || '',
        email: user?.email || '',
        name: user?.name || '',
        phone: user?.phone || '',
        description: user?.description || '',
    });

    
    const renderContent = () => {
        switch (selectedCategory) {
          case "orders":
            if (isLoadingOrders) {
                return <p>Cargando órdenes recientes...</p>;
              }
              
              return <OrdersDisplay orders={recentOrders} />;
        
          case "followers":
            return <CompaniesDisplay companies={[]} />;
          case "Companies Followed":
            return <CompaniesDisplay companies={companyFollowed} />;
          case "Users Followed":
            return <UsersDisplay users={usersFollowed} />; // Aquí puedes implementar la lógica para mostrar los usuarios seguidos
          case "Users Following":
            return <UsersDisplay users={usersFollowers} />; // Aquí puedes implementar la lógica para mostrar los usuarios que siguen al usuario actual
          case "Chats":
            return <CompaniesDisplay companies={companyFollowed} />;

            default:
            return <p>Selecciona una categoría.</p>;
        }
      };
      useEffect(() => {
        console.log('Órdenes recientes actualizadas:', recentOrders);
      }, [recentOrders]);
   
    useEffect(() => {
        setEditedUser({
            _id: user?._id || '',
            email: user?.email || '',
            name: user?.name || '',
            phone: user?.phone || '',
            description: user?.description || '',
        });

        // Cargar órdenes recientes
        const fetchOrders = async () => {
            if (user?._id) {
              try {
                const orders = await getOrdersByUserId(user._id);
                console.log('Órdenes recientes:', orders);
                setRecentOrders(orders || []);
              } catch (error) {
                console.error('Error al cargar las órdenes recientes:', error);
              } finally {
                setIsLoadingOrders(false); // Indica que la carga ha terminado
              }
            }
          };

        const fetchSiguiendo = async () => {
            if (user?._id) {
                try {
                    const companies = await getFollowedCompanies(user._id); // Llama al servicio para obtener las órdenes
                    console.log('Companies recientes:', companies); // Verifica la respuesta
                    setCompanyFollowed(companies|| []); // Asegúrate de que 'orders' sea un array
                } catch (error) {
                    console.error('Error al cargar las órdenes recientes:', error);
                }
            }
        }

        const fetchFollowedUsers = async () => {
            if (user?._id) {
                try {
                    const users = await getFollowedUsers(user._id); // Llama al servicio para obtener las órdenes
                    console.log('Usuarios seguidos:', users); // Verifica la respuesta
                    setUsersFollowed(users || []); // Asegúrate de que 'orders' sea un array
                } catch (error) {
                    console.error('Error al cargar los usuarios seguidos:', error);
                }
            }
        }

        const fetchUsersFollowing = async () => {
            if (user?._id) {
                try {
                    const users = await getFollowingUsers(user._id); // Llama al servicio para obtener los usuarios que siguen al usuario actual
                    console.log('Usuarios que siguen al usuario actual:', users); // Verifica la respuesta
                    setUsersFollowers(users || []); // Asegúrate de que 'orders' sea un array
                } catch (error) {
                    console.error('Error al cargar los usuarios que siguen al usuario actual:', error);
                }
            }
        }

        fetchOrders();
        fetchUsersFollowing(); // Llama a la función para cargar los usuarios que siguen al usuario actual
        fetchFollowedUsers(); // Llama a la función para cargar los usuarios seguidos
        fetchSiguiendo(); // Llama a la función para cargar las órdenes recientes
    }, [user]);

    

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setEditedUser((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    const handleSave = async () => {
        
        // Aquí puedes hacer la lógica para guardar los cambios en el backend
        
        console.log("Usuarioooo:", editedUser);
        console.log ("Usuario:", user);

        const updatedUser = await UpdateUserById({
            ...editedUser,
            _id: user._id,
            email: user.email,
            password: user.password,
            company_Followed: user.company_Followed,
        });
        
        console.log('Datos guardados:', editedUser);
        console.log('Usuario actualizado:', updatedUser);
        setUser(updatedUser);

        setIsEditing(false); // Volver al modo de visualización
    };

    const handleHome= () => {
        navigate(-1); // Navega a la página anterior
    };

    if (!user) {
        return <p>No se encontró información del usuario.</p>;
    }

       return (
 
    <div className = {styles['perfil-wrapper']}>
        <div className={styles['perfil-container']}>
             <Cloudinary initialImage={user.avatar} userEmail={user.email} model = "user"/>
             <p className={styles['perfil-email']}><strong>ID:</strong> {user._id || 'No disponible'}</p>
             <div className={styles['perfil-divider']}></div>
             {isEditing ? (
                <>
                    <input
                        type="text"
                        name="name"
                        value={editedUser.name}
                        onChange={handleInputChange}
                        className={styles['perfil-input']}
                        placeholder="Nombre"
                    />
                    <p className={styles['perfil-email']}><strong>Email:</strong> {user.email || 'No disponible'}</p>
                    <input
                        type="text"
                        name="phone"
                        value={editedUser.phone}
                        onChange={handleInputChange}
                        className={styles['perfil-input']}
                        placeholder="Teléfono"
                    />
                    <div className={styles['perfil-divider']}></div>
                    <p className={styles['perfil-wallet']}><strong>Billetera:</strong> ${user.wallet !== undefined ? user.wallet.toFixed(2) : 'No disponible'}</p>
                    <textarea
                        name="description"
                        value={editedUser.description}
                        onChange={handleInputChange}
                        className={styles['perfil-textarea']}
                        placeholder="Descripción"
                    />
                </>
            ) : (
                <>
                    <h2 className={styles['perfil-name']}>{user.name || 'Nombre no disponible'}</h2>
                    <p className={styles['perfil-email']}><strong>Email:</strong> {user.email || 'No disponible'}</p>
                    <p className={styles['perfil-phone']}><strong>Teléfono:</strong> {user.phone || 'No disponible'}</p>
                    <div className={styles['perfil-divider']}></div>
                    <p className={styles['perfil-wallet']}><strong>Billetera:</strong> ${user.wallet !== undefined ? user.wallet.toFixed(2) : 'No disponible'}</p>
                    <p className={styles['perfil-description']}><strong>Descripción:</strong> {user.description || 'No hay descripción'}</p>
                </>
            )}

            <div className={styles['perfil-divider']}></div>
            <span
                className={`${styles['perfil-status']} ${user.Flag ? '' : styles['inactive']}`}
            >
                <strong>Estado:</strong> {user.Flag !== undefined ? (user.Flag ? 'Activo' : 'Inactivo') : 'No disponible'}
            </span>

            <div className={styles['perfil-actions']}>
                <div>
                    {isEditing ? (
                        <div className={styles['perfil-buttons']}>
                            <button onClick={handleSave} className={styles['perfil-button']}>
                                Guardar
                            </button>
                            
                            <button onClick={() => setIsEditing(false)} className={styles['perfil-button']}>
                                Cancelar
                            </button>
                        </div>
                    ) : (
                        <button onClick={() => setIsEditing(true)} className={styles['perfil-button']}>
                            Modificar Perfil
                        </button>
                    )}
                </div>
            </div>
            
            <div className={styles['perfil-home']}>
                <button onClick={handleHome} className={styles['perfil-button']}>
                    Volver Página Principal
                </button>
            </div>

        </div>


        <div className={styles.tabs}>
            <button
                className={`${styles.tabButton} ${
                    selectedCategory === "orders" ? styles.active : ""
                }`}
                onClick={() => setSelectedCategory("orders")}
            >
                Órdenes Recientes
            </button>
            <button
                className={`${styles.tabButton} ${
                    selectedCategory === "Companies Followed" ? styles.active : ""
                }`}
                onClick={() => setSelectedCategory("Companies Followed")}
            >
                Empresas Seguidas
            </button>
            <button
                className={`${styles.tabButton} ${
                    selectedCategory === "Users Followed" ? styles.active : ""
                }`}
                onClick={() => setSelectedCategory("Users Followed")}
            >
                Usuarios Seguidos
            </button>

            <button
                className={`${styles.tabButton} ${
                    selectedCategory === "Users Following" ? styles.active : ""
                }`}
                onClick={() => setSelectedCategory("Users Following")}
            >
                Usuarios que te Siguen
            </button>

            <button
                className={`${styles.tabButton} ${selectedCategory === "Chats" ? styles.active : ""}`}
                onClick={() => setSelectedCategory("Chats")}
            >
                Chats
            </button>
        </div>
        <div className={styles.content}>
            {renderContent()}
        </div>

        </div>

        

        
    );
            
    
};

export default Perfil;
