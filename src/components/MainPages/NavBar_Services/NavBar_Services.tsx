import React, { useRef, useEffect, useState, use } from 'react';
import styles from './NavBar_Services.module.css';
import { motion } from 'framer-motion';
import { Company } from '../../../models/Company';
import { Product } from '../../../models/Product';
import Company_Table_View from '../../Company_Table_View/Company_Table_View';
import {
  GetAllCompanies,
  UpdateCompanyById,
  AddProductToCompany,
  CreateProduct,
  GetUserCompanies,
  AddCompany,
  LoginCompany,
} from '../../../service/companiesService'; // Importamos el servicio para obtener empresas
import { FaSearch, FaMapMarkedAlt, FaStore, FaEdit } from 'react-icons/fa';
import { AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { FaApple, FaAndroid } from 'react-icons/fa';
import {
  FollowCompany,
  getUserById,
  UnfollowCompany,
} from '../../../service/userService';
import { User } from '../../../models/User'; // Importamos el modelo de usuario
import { latLng } from 'leaflet';

interface FollowedCompany {
  company_id: string;
  _id: string;
}

const NavBar_Services: React.FC = () => {
  const outerRef = useRef<HTMLDivElement>(null);
  const thirdSectionRef = useRef<HTMLDivElement>(null);
  const [inViewport, setInViewport] = useState(true);
  const [allCompanies, setAllCompanies] = useState<Company[]>([]);
  const updateFormRef = useRef<HTMLDivElement>(null);
  const productFormRef = useRef<HTMLDivElement>(null);
  const [activeSection, setActiveSection] = useState<
    'none' | 'view' | 'add' | 'existing'
  >('none');
  const [selectedCompany, setSelectedCompany] = useState<Company | null>(null);
  const [showProductForm, setShowProductForm] = useState(false);
  const [showUpdateForm, setShowUpdateForm] = useState(false);
  const [userCompanies, setUserCompanies] = useState<Company[]>([]);
  const user = JSON.parse(localStorage.getItem('user') || '{}') as {
    _id: string;
    company_Followed: FollowedCompany[];
  };
  const [currentUser, setCurrentUser] = useState(user);
  // Estado para el carrusel de imágenes
  const [currentImage, setCurrentImage] = useState(0);
  const totalImages = 7;
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [updateError, setUpdateError] = useState<string | null>(null);
  const [updateSuccess, setUpdateSuccess] = useState(false);

  const [productIsSubmitting, setProductIsSubmitting] = useState(false);
  const [productError, setProductError] = useState<string | null>(null);
  const [productSuccess, setProductSuccess] = useState(false);
  //estados para manage company
  // Añadir estos estados junto a los otros useState al inicio del componente
  const [showPasswordForm, setShowPasswordForm] = useState(false);
  const [passwordInput, setPasswordInput] = useState('');
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [passwordSuccess, setPasswordSuccess] = useState(false);
  const [passwordIsSubmitting, setPasswordIsSubmitting] = useState(false);
  const passwordFormRef = useRef<HTMLDivElement>(null);
  // Form state para empresas
  const [formData, setFormData] = useState({
    ownerId: currentUser._id,
    name: 'Insert name',
    description: 'Insert description',
    location: 'Ej: St George Street 123 London',
    coordenates_lat: 45.151542,
    coordenates_lng: -13.370415,
    email: ' email@example.com',
    phone: '+44 1234 567890',
    password: '',
  });

  // Form state para productos
  const [productData, setProductData] = useState({
    name: '',
    description: '',
    price: 0,
  });
  // Auto rotar imágenes
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentImage((prev) => (prev + 1) % totalImages);
    }, 5000);

    return () => clearInterval(timer);
  }, []);

  // Nuevas variantes de animación para los servicios
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.3,
      },
    },
  };

  const childVariants = {
    hidden: { y: 50, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        type: 'spring',
        damping: 12,
        stiffness: 100,
      },
    },
  };
  // Cargar las empresas del usuario cuando se necesiten
  useEffect(() => {
    if (activeSection === 'existing') {
      const loadUserCompanies = async () => {
        try {
          const companies = await GetUserCompanies(currentUser._id);
          setUserCompanies(companies);
        } catch (error) {
          console.error('Error loading companies:', error);
        }
      };

      loadUserCompanies();
    }
  }, [activeSection, currentUser._id]);

  useEffect(() => {
    const storedUserId = localStorage.getItem('userId');
    const fetchUser = async () => {
      if (!storedUserId) return;
      const user = await getUserById(storedUserId || '');
      setCurrentUser(user || null);
    };
    fetchUser();
  }, []);

  useEffect(() => {
    if (!outerRef.current) return;

    const onChange = (entries: IntersectionObserverEntry[]) => {
      entries.forEach((entry) => {
        if (entry.target === outerRef.current) {
          setInViewport(entry.isIntersecting);
        }
      });
    };

    const observer = new IntersectionObserver(onChange, { threshold: 0.5 });
    observer.observe(outerRef.current);

    return () => {
      if (outerRef.current) {
        observer.unobserve(outerRef.current);
      }
    };
  }, []);

  const handleFollowToggle = async (companyId: string) => {
    if (!currentUser) {
      alert('No user is logged in.');
      return;
    }
    const isFollowing = currentUser.company_Followed?.some(
      (followed: FollowedCompany) => followed.company_id === companyId,
    );

    try {
      if (isFollowing) {
        await UnfollowCompany(currentUser._id, companyId);
        const updatedFollowed = currentUser.company_Followed.filter(
          (followed: FollowedCompany) => followed.company_id !== companyId,
        );
        setCurrentUser({ ...currentUser, company_Followed: updatedFollowed });
      } else {
        console.log('Following company:', currentUser._id, companyId);
        await FollowCompany(currentUser._id, companyId);
        const updatedFollowed = [
          ...currentUser.company_Followed,
          { company_id: companyId, _id: '' },
        ];
        setCurrentUser({ ...currentUser, company_Followed: updatedFollowed });
      }

      localStorage.setItem('user', JSON.stringify(currentUser));
    } catch (error) {
      console.error(
        `Error while toggling follow for company ${companyId}:`,
        error,
      );
      alert(
        'An error occurred while updating your follow status. Please try again.',
      );
    }
  };

  useEffect(() => {
    // Scroll to third section when a button is clicked
    if (activeSection !== 'none' && thirdSectionRef.current) {
      setTimeout(() => {
        thirdSectionRef.current?.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    }
  }, [activeSection]);

  useEffect(() => {
    if (activeSection === 'view') {
      const fetchAllCompanies = async () => {
        try {
          const companies = await GetAllCompanies();
          setAllCompanies(companies);
        } catch (error) {
          console.error('Error loading companies:', error);
        }
      };

      fetchAllCompanies();
    }
  }, [activeSection]);

  useEffect(() => {
    setFormData((prev) => ({
      ...prev,
      ownerId: currentUser._id || '',
    }));
  }, [currentUser]);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleProductInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const { name, value } = e.target;
    setProductData((prev) => ({
      ...prev,
      [name]: name === 'price' ? parseFloat(value) : value,
    }));
  };

  const handleUpdateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedCompany) {
      setUpdateError('No company selected to update');
      return;
    }

    setIsSubmitting(true);
    setUpdateError(null);
    setUpdateSuccess(false);

    try {
      // Define el tipo explícitamente para incluir la propiedad password opcional
      const updateData: {
        name: string;
        description: string;
        location: string;
        email: string;
        phone: string;
        password?: string; // hacemos password opcional con ?
      } = {
        name: formData.name,
        description: formData.description,
        location: formData.location,
        email: formData.email,
        phone: formData.phone,
      };

      // Añadir contraseña solo si se ha proporcionado una nueva
      if (formData.password && formData.password.trim() !== '') {
        updateData.password = formData.password;
      }

      // Llamar al servicio de actualización
      const updatedCompany = await UpdateCompanyById(
        selectedCompany._id,
        updateData,
      );

      // Actualizar la lista local de empresas
      setUserCompanies((prevCompanies) =>
        prevCompanies.map((company) =>
          company._id === updatedCompany._id ? updatedCompany : company,
        ),
      );

      // Mostrar mensaje de éxito
      setUpdateSuccess(true);
      setTimeout(() => {
        setShowUpdateForm(false);
        setUpdateSuccess(false);
      }, 2000);
    } catch (error: any) {
      // Manejar errores específicos
      if (error.message === 'El email ya está registrado') {
        setUpdateError('This email is already registered by another company');
      } else {
        setUpdateError(error.response.data.message);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleProductSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCompany) {
      setProductError('No company selected!');
      return;
    }

    setProductIsSubmitting(true);
    setProductError(null);
    setProductSuccess(false);

    try {
      // Primero, crear el producto
      const newProduct = await CreateProduct(productData);

      // Luego, asociarlo con la empresa
      const updatedCompany = await AddProductToCompany(
        selectedCompany._id,
        newProduct._id,
      );

      // Actualizar la UI
      setUserCompanies((prevCompanies) =>
        prevCompanies.map((company) =>
          company._id === updatedCompany._id ? updatedCompany : company,
        ),
      );

      // Mostrar mensaje de éxito
      setProductSuccess(true);
      setTimeout(() => {
        setShowProductForm(false);
        setProductSuccess(false);
      }, 2000);

      // Resetear formulario
      setProductData({
        name: '',
        description: '',
        price: 0,
      });
    } catch (error: any) {
      setProductError(`Error adding product: ${error.message}`);
    } finally {
      setProductIsSubmitting(false);
    }
  };

  const handleCompanySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setUpdateError(null);
    setUpdateSuccess(false);

    try {
      // Llama a tu servicio para crear la empresa (ajusta el nombre si es diferente)
      console.log('Creating new company:', formData);

      const newCompany = await AddCompany(formData);

      // Opcional: actualiza la lista de empresas del usuario si lo necesitas
      setUserCompanies((prev) => [...prev, newCompany]);

      setUpdateSuccess(true);
      alert('Company created successfully!');

      // Resetea el formulario
      setFormData({
        ownerId: currentUser._id,
        name: 'Insert name',
        description: 'Insert description',
        location: 'Ej: St George Street 123 London',
        coordenates_lat: 45.151542,
        coordenates_lng: -13.370415,
        email: ' email@example.com',
        phone: '+44 1234 567890',
        password: '',
      });

      setActiveSection('existing');
    } catch (error: any) {
      setUpdateError(error.response.data.message || 'Error creating company');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpdateCompany = (company: Company) => {
    setSelectedCompany(company);
    setFormData({
      ownerId: currentUser._id,
      name: company.name,
      description: company.description,
      location: company.location,
      coordenates_lat: company.coordenates_lat,
      coordenates_lng: company.coordenates_lng,
      email: company.email,
      phone: company.phone,
      password: '', // No mostramos la contraseña por seguridad
    });
    setShowUpdateForm(true);
    setShowProductForm(false);
    setTimeout(() => {
      updateFormRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  };

  const handleAddProduct = (company: Company) => {
    setSelectedCompany(company);
    setProductData({
      name: '',
      description: '',
      price: 0,
    });
    setShowProductForm(true);
    setShowUpdateForm(false);
    setTimeout(() => {
      productFormRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  };

  const handleManage = (company: Company) => {
    setSelectedCompany(company);
    setPasswordInput('');
    setPasswordError(null);
    setPasswordSuccess(false);
    setShowPasswordForm(true);
    setShowUpdateForm(false);
    setShowProductForm(false);
    setTimeout(() => {
      passwordFormRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  };
  const navigate = useNavigate(); // Asegúrate de que ya está importado al inicio del componente
  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedCompany) {
      setPasswordError('No company selected');
      return;
    }

    setPasswordIsSubmitting(true);
    setPasswordError(null);

    try {
      // Llamar a la API real de login en lugar de la simulación
      await LoginCompany(selectedCompany.email, passwordInput);

      // Si la autenticación es exitosa
      setPasswordSuccess(true);

      // Guardar información de la empresa en localStorage para la sesión
      localStorage.setItem('companyId', selectedCompany._id);
      localStorage.setItem('companyName', selectedCompany.name);

      // Esperar un momento y redirigir a la página de administración
      setTimeout(() => {
        navigate(`/companyManage/${selectedCompany._id}`);
      }, 1500);
    } catch (error: any) {
      console.error('Login error:', error);
      setPasswordError(error.message || 'Invalid password. Please try again.');
    } finally {
      setPasswordIsSubmitting(false);
    }
  };

  // Animation variants
  const fadeInContainerWithStagger = {
    hidden: {
      opacity: 0,
    },
    visible: {
      opacity: 1,
      transition: {
        duration: 0.25,
        type: 'tween',
        ease: 'easeIn',
        when: 'beforeChildren',
        staggerChildren: 0.1,
      },
    },
  };

  const fadeInUp = {
    hidden: {
      opacity: 0,
      y: 40,
    },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        type: 'spring',
      },
    },
  };

  const slideUp = {
    hidden: { opacity: 0, y: 100 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        type: 'spring',
        damping: 15,
        stiffness: 100,
      },
    },
  };

  if (!currentUser) {
    return <p>Loading user data...</p>; // Show loading state while fetching user data
  }

  return (
    <div className={styles.servicesPageContainer}>
      {/* Primera sección - Texto principal */}
      <section className={styles.topSection}>
        <div>
          {/* Encabezado principal */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className={styles.ye}>

          
            <h1 className={styles.servicesTitle}>¿Por qué elegir QuickFind?</h1>
            <p className={styles.servicesDescription}>
              QuickFind conecta a los compradores con negocios locales, facilitando encontrar exactamente lo que necesitas cerca de ti, ahorrando tiempo y apoyando el comercio local.
            </p>
          </motion.div>

          {/* Tarjetas de servicios */}
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className={styles.servicesGrid}>
            {/* Servicio 1 */}
            <motion.div variants={childVariants} className={styles.serviceCard}>
              <div
                className={`${styles.serviceIconWrapper} ${styles.serviceIconBlue}`}>
                {FaSearch({ className: styles.serviceIcon })}
              </div>

                <h3 className={styles.serviceTitle}>Búsqueda inteligente de productos</h3>
                <p className={styles.serviceDescription}>
                Encuentra productos en varias tiendas cercanas con disponibilidad y precios en tiempo real.
                </p>
            </motion.div>

            {/* Servicio 2 */}
            <motion.div variants={childVariants} className={styles.serviceCard}>
              <div
                className={`${styles.serviceIconWrapper} ${styles.serviceIconGreen}`}>
                {FaMapMarkedAlt({ className: styles.serviceIcon })}
              </div>

                <h3 className={styles.serviceTitle}>Mapas Interactivos</h3>
                <p className={styles.serviceDescription}>
                Descubre tiendas en un mapa interactivo con valoraciones, reseñas y direcciones.
                </p>
            </motion.div>

            {/* Servicio 3 */}
            <motion.div variants={childVariants} className={styles.serviceCard}>
              <div
                className={`${styles.serviceIconWrapper} ${styles.serviceIconPurple}`}>
                {FaStore({ className: styles.serviceIcon })}
              </div>

                <h3 className={styles.serviceTitle}>Visibilidad para Negocios Locales</h3>
                <p className={styles.serviceDescription}>
                Ayudamos a pequeños negocios a aumentar su visibilidad y conectar con clientes locales.
                </p>
            </motion.div>

            {/* Servicio 4 */}
            <motion.div variants={childVariants} className={styles.serviceCard}>
              <div
                className={`${styles.serviceIconWrapper} ${styles.serviceIconAmber}`}>
                {FaEdit({ className: styles.serviceIcon })}
              </div>
                <h3 className={styles.serviceTitle}>Gestión de Tiendas</h3>
                <p className={styles.serviceDescription}>
                Los propietarios de tiendas pueden actualizar la información y gestionar el inventario de productos fácilmente.
                </p>
            </motion.div>
          </motion.div>

          {/* Carrusel de imágenes */}
          <div className={styles.mediaSection}>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 1, delay: 0.5 }}
              className={styles.carouselContainer}>
              <div className={styles.carouselContent}>
                <div className={styles.carouselImageContainer}>
                  <AnimatePresence mode="wait">
                    <motion.img
                      key={currentImage}
                      src={`/NavBar_Services_Photos/${currentImage + 1}.png`}
                      alt={`Captura de pantalla de QuickFind ${currentImage + 1}`}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.5 }}
                      className={styles.carouselImage}
                    />
                  </AnimatePresence>
                </div>
              </div>

              {/* Indicadores del carrusel */}
              <div className={styles.carouselIndicators}>
                {Array.from({ length: totalImages }).map((_, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentImage(index)}
                    className={`${styles.carouselDot} ${
                      index === currentImage ? styles.carouselDotActive : ''
                    }`}
                    aria-label={`Ver imagen ${index + 1}`}
                  />
                ))}
              </div>
            </motion.div>

            {/* Call to Action */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 1, delay: 0.7 }}
              className={styles.downloadSectionStandalone}>
              <h3 className={styles.downloadTitle}>
                Obtén QuickFind en tu dispositivo
              </h3>
              <div className={styles.downloadButtons}>

                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className={styles.downloadButton}>
                  {FaApple({ className: styles.downloadIcon })}
                  Descargar para iOS
                </motion.button>

                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className={styles.downloadButton}>
                  {FaAndroid({ className: styles.downloadIcon })}
                  Descargar para Android
                </motion.button>
                </div>
            </motion.div>
          </div>
        </div>

        {/* Mantén el indicador de desplazamiento */}
        <div className={styles.scrollIndicator}>
          <p>Desplázate para más información</p>
          <div className={styles.scrollArrow}></div>
        </div>
      </section>
      {/* Segunda sección con animación y botones */}
      <div ref={outerRef} className={styles.bottomSection}>
        {inViewport && (
          <motion.div
            className={styles.animatedContent}
            variants={fadeInContainerWithStagger}
            initial="hidden"
            animate="visible">
            <motion.div variants={fadeInUp}>
              <h2 className={styles.bottomSectionTitle}>
                Explora Nuestras Empresas Asociadas
              </h2>
            </motion.div>

            <motion.div variants={fadeInUp}>
              <p className={styles.bottomSectionText}>
                Descubre todos los negocios locales que forman parte de nuestra
                red. Desde restaurantes hasta tiendas especializadas, tenemos
                una amplia variedad de opciones para satisfacer tus necesidades.
              </p>
            </motion.div>

            <motion.div variants={fadeInUp} className={styles.buttonContainer}>
              <button
                className={`${styles.companyButton} ${styles.leftButton}`}
                onClick={() => setActiveSection('view')}>
                Ver Empresas
              </button>
              <button
                className={`${styles.companyButton} ${styles.leftButton}`}
                onClick={() => setActiveSection('existing')}>
                Gestionar tus empresas
              </button>
              <button
                className={`${styles.companyButton} ${styles.rightButton}`}
                onClick={() => setActiveSection('add')}>
                Añadir Empresa
              </button>
            </motion.div>

          </motion.div>
        )}
      </div>

      {/* Tercera sección - Condicional basada en botón presionado */}
      {activeSection !== 'none' && (
        <div ref={thirdSectionRef} className={styles.thirdSection}>
          <motion.div
            variants={slideUp}
            initial="hidden"
            animate="visible"
            className={styles.thirdSectionContent}>
            {activeSection === 'view' && (
              <div className={styles.viewCompaniesContainer}>

              <h3>Directorio de Empresas</h3>
              <Company_Table_View
                allCompanies={allCompanies}
                currentUser={currentUser}
                handleFollowToggle={handleFollowToggle}
              />
              </div>
            )}

            {activeSection === 'add' && (
              <div className={styles.addCompanyForm}>

              <h3>Agregar Nueva Empresa</h3>
              <p className={styles.switchOption}>
                ¿Ya tienes una empresa?{" "}
                <button
                className={styles.linkButton}
                onClick={() => setActiveSection("existing")}
                >
                Gestiona tus empresas existentes
                </button>
              </p>
              {updateError && (
                <div className={styles.errorMessage}>{updateError}</div>
              )}
              <form onSubmit={handleCompanySubmit}>
                <div className={styles.formGroup}>
                <label htmlFor="ownerId">ID del Propietario</label>
                    <input
                      type="text"
                      id="ownerId"
                      value={currentUser._id}
                      readOnly
                      className={styles.readOnlyInput}
                    />
                  </div>

                    <div className={styles.formGroup}>
                    <label htmlFor="name">Nombre de la Empresa</label>
                    <input
                      type="text"
                      id="name"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      required
                    />
                    </div>


                    <div className={styles.formGroup}>
                    <label htmlFor="description">Descripción</label>
                    <textarea
                      id="description"
                      name="description"
                      value={formData.description}
                      onChange={handleInputChange}
                      required
                    />
                    </div>

                    <div className={styles.formGroup}>
                    <label htmlFor="location">Ubicación</label>
                    <input
                      type="text"
                      id="location"
                      name="location"
                      value={formData.location}
                      onChange={handleInputChange}
                      required
                    />
                    </div>


                    <div className={styles.formGroup}>
                    <label htmlFor="coordenates">Coordenadas</label>
                    <div className={styles.coordinatesInputs}>
                      <input
                        type="number"
                        id="latitude"
                        name="latitude"
                        placeholder="Latitud"
                        value={formData.coordenates_lat}
                        onChange={(e) =>
                          setFormData((prev) => ({
                            ...prev,
                            coordenates: [
                              parseFloat(e.target.value),
                              prev.coordenates_lng,
                            ],
                          }))
                        }
                        required
                        step="any"
                      />
                      <input
                        type="number"
                        id="longitude"
                        name="longitude"
                        placeholder="Longitud"
                        value={formData.coordenates_lng}
                        onChange={(e) =>
                          setFormData((prev) => ({
                            ...prev,
                            coordenates: [
                              prev.coordenates_lng,
                              parseFloat(e.target.value),
                            ],
                          }))
                        }
                        required
                        step="any"
                      />
                    </div>
                  </div>

                  <div className={styles.formGroup}>
                    <label htmlFor="email">Correo Electrónico</label>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      required
                    />
                  </div>

                  <div className={styles.formGroup}>
           <label htmlFor="phone">Número Telefónico</label>
                    <input
                      type="tel"
                      id="phone"
                      name="phone"
                      value={formData.phone}
                      onChange={handleInputChange}
                      required
                    />
                  </div>

                  <div className={styles.formGroup}>
                    <label htmlFor="password">Contraseña</label>
                    <input
                      type="password"
                      id="password"
                      name="password"
                      value={formData.password}
                      onChange={handleInputChange}
                      required
                    />
                  </div>


                  <button type="submit" className={styles.submitButton} >
                    Crear Compañía
                  </button>
                </form>
              </div>
            )}

            {activeSection === 'existing' && (
              <div className={styles.existingCompaniesContainer}>

                <h3>Tus Compañías</h3>

                {userCompanies.length > 0 ? (
                  <div className={styles.companiesTableWrapper}>
                    <table className={styles.companiesTable}>
                      <thead>
                        <tr>

                            <th>Nombre</th>
                            <th>Descripción</th>
                            <th>Ubicación</th>
                            <th>Email</th>
                            <th>Teléfono</th>
                            <th>Acciones</th>
                        </tr>
                      </thead>
                      <tbody>
                        {userCompanies.map((company) => (
                          <tr key={company._id}>
                            <td>{company.name}</td>
                            <td className={styles.descriptionCell}>
                              {company.description.length > 50
                                ? `${company.description.substring(0, 50)}...`
                                : company.description}
                            </td>
                            <td>{company.location}</td>
                            <td>{company.email}</td>
                            <td>{company.phone}</td>
                            <td className={styles.actionButtons}>
                                <button
                                className={styles.updateButton}

                                onClick={() => handleUpdateCompany(company)}
                                >
                                Actualizar
                                </button>
                                <button
                                className={styles.addProductButton}
                                onClick={() => handleAddProduct(company)}
                                >
                                Añadir Producto
                                </button>
                                <button
                                className={styles.manageButton}
                                onClick={() => handleManage(company)}
                                >
                                Gestionar
                                </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (

                    <p>
                    No tienes ninguna compañía aún.{" "}
                    <button
                      className={styles.linkButton}
                      onClick={() => setActiveSection("add")}
                    >
                      Añadir una compañía
                    </button>
                    .
                    </p>
                  )}


                  {/* Formulario para actualización de empresa */}
                  {showUpdateForm && selectedCompany && (
                    <div ref={updateFormRef} className={styles.updateCompanyForm}>
                    <h4>Actualizar Compañía: {selectedCompany.name}</h4>

                    {/* Mostrar mensajes de error */}
                    {updateError && (
                      <div className={styles.errorMessage}>{updateError}</div>
                    )}

                    {/* Mostrar mensaje de éxito */}
                    {updateSuccess && (
                      <div className={styles.successMessage}>

                      ¡Compañía actualizada exitosamente!
                      </div>
                    )}

                    <form onSubmit={handleUpdateSubmit}>
                      <div className={styles.formGroup}>

                      <label htmlFor="update-name">Nombre de la Compañía</label>
                      <input
                        type="text"
                        id="update-name"
                        name="name"
                        value={formData.name}
                        onChange={handleInputChange}
                        required
                        disabled={isSubmitting}
                      />
                      </div>

                      <div className={styles.formGroup}>
                      <label htmlFor="update-description">Descripción</label>
                      <textarea
                        id="update-description"
                        name="description"
                        value={formData.description}
                        onChange={handleInputChange}
                        required
                        disabled={isSubmitting}
                      />
                      </div>

                      <div className={styles.formGroup}>
                      <label htmlFor="update-location">Ubicación</label>
                      <input
                        type="text"
                        id="update-location"
                        name="location"
                        value={formData.location}
                        onChange={handleInputChange}
                        required
                        disabled={isSubmitting}
                      />
                      </div>

                      <div className={styles.formGroup}>
                        <label htmlFor="update-email">Correo Electrónico</label>
                        <input
                          type="email"
                          id="update-email"
                          name="email"
                          value={formData.email}
                          onChange={handleInputChange}
                          required
                          disabled={isSubmitting}
                        />
                      </div>

                      <div className={styles.formGroup}>

                        <label htmlFor="update-phone">Número Telefónico</label>
                        <input
                          type="tel"
                          id="update-phone"
                          name="phone"
                          value={formData.phone}
                          onChange={handleInputChange}
                          required
                          disabled={isSubmitting}
                        />
                      </div>

                        <div className={styles.formGroup}>
                        <label htmlFor="update-password">

                          Contraseña (deja vacío para mantener la actual)
                        </label>
                        <input
                          type="password"
                          id="update-password"
                          name="password"
                          value={formData.password}
                          onChange={handleInputChange}

                          placeholder="Deja vacío para mantener la contraseña actual"
                          disabled={isSubmitting}
                        />
                        </div>

                      <button
                        type="submit"
                        className={styles.submitButton}
                        disabled={isSubmitting}>
                        {isSubmitting
                          ? 'Actualizando...'
                          : 'Actualizar Empresa'}
                      </button>
                      <button
                        type="button"
                        className={styles.cancelButton}
                        onClick={() => setShowUpdateForm(false)}

                        disabled={isSubmitting}
                      >
                        Cancelar
                      </button>
                    </form>
                  </div>
                )}

                {/* Formulario para añadir productos */}

                        {showProductForm && selectedCompany && (
                          <div ref={productFormRef} className={styles.addProductForm}>
                          <h4>Añadir producto a {selectedCompany.name}</h4>

                          {/* Mostrar mensajes de error */}
                          {productError && (
                            <div className={styles.errorMessage}>{productError}</div>
                          )}


                          {/* Mostrar mensaje de éxito */}
                          {productSuccess && (
                            <div className={styles.successMessage}>
                            ¡Producto añadido exitosamente a {selectedCompany.name}!
                            </div>
                          )}

                          <form onSubmit={handleProductSubmit}>
                            <div className={styles.formGroup}>
                            <label htmlFor="product-name">Nombre del producto</label>
                            <input
                              type="text"
                              id="product-name"
                              name="name"
                              value={productData.name}
                              onChange={handleProductInputChange}
                              required
                              disabled={productIsSubmitting}
                            />
                            </div>

                            <div className={styles.formGroup}>
                            <label htmlFor="product-description">Descripción</label>
                            <textarea
                              id="product-description"
                              name="description"
                              value={productData.description}
                              onChange={handleProductInputChange}
                              required
                              disabled={productIsSubmitting}
                            />
                            </div>

                            <div className={styles.formGroup}>
                            <label htmlFor="product-price">Precio</label>
                            <input
                              type="number"
                              id="product-price"
                              name="price"
                              value={productData.price}
                              onChange={handleProductInputChange}
                              step="0.01"
                              min="0"
                              required
                              disabled={productIsSubmitting}
                            />
                            </div>

                            <button
                            type="submit"
                            className={styles.submitButton}
                            disabled={productIsSubmitting}
                            >
                            {productIsSubmitting
                              ? "Añadiendo producto..."
                              : "Añadir producto"}
                            </button>
                            <button
                            type="button"
                            className={styles.cancelButton}
                            onClick={() => setShowProductForm(false)}
                            disabled={productIsSubmitting}
                            >
                            Cancelar
                            </button>
                          </form>
                          </div>
                        )}
                        {/* Formulario para verificar contraseña */}
                {showPasswordForm && selectedCompany && (
                  <div
                    ref={passwordFormRef}
                    className={styles.passwordVerificationForm}
                  >
                    <h4>Verificación de acceso para {selectedCompany.name}</h4>
                    <p className={styles.verificationDescription}>
                      Por favor, introduce la contraseña de la compañía para acceder al área de gestión.
                    </p>

                    {/* Mostrar mensajes de error */}
                    {passwordError && (
                      <div className={styles.errorMessage}>{passwordError}</div>
                    )}

                    {/* Mostrar mensaje de éxito */}
                    {passwordSuccess && (

                        <div className={styles.successMessage}>
                        ¡Acceso verificado! Redirigiendo a la página de gestión...
                        </div>
                    )}

                    <form onSubmit={handlePasswordSubmit}>
                      <div className={styles.formGroup}>
                        <label htmlFor="company-password">

                          Contraseña de la compañía
                        </label>
                        <input
                          type="password"
                          id="company-password"
                          name="password"
                          value={passwordInput}
                          onChange={(e) => setPasswordInput(e.target.value)}
                          required
                          disabled={passwordIsSubmitting}
                          placeholder="Introduce la contraseña para esta empresa"
                          autoComplete="off"
                        />
                      </div>

                      <button
                        type="submit"
                        className={styles.submitButton}
                        disabled={passwordIsSubmitting}>
                        {passwordIsSubmitting
                          ? 'Verificando...'
                          : 'Verificar Acceso'}
                      </button>
                      <button
                        type="button"
                        className={styles.cancelButton}
                        onClick={() => setShowPasswordForm(false)}

                        disabled={passwordIsSubmitting}
                      >
                        Cancelar
                      </button>
                    </form>
                  </div>
                )}
              </div>
            )}
          </motion.div>
        </div>
      )}
    </div>
  );
};

export default NavBar_Services;
