import React, { useState, useEffect } from 'react';
import styles from './Login.module.css';
import { User } from '../../models/User';
import { useNavigate } from 'react-router-dom';
import { logInUser, registerUser } from '../../service/userService';

const Login: React.FC = () => {
  const navigate = useNavigate();

  // Login state
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  // Register state
  const [registerName, setRegisterName] = useState('');
  const [registerEmail, setRegisterEmail] = useState('');
  const [registerPassword, setRegisterPassword] = useState('');

  // State to track if card is flipped (register view)
  const [isFlipped, setIsFlipped] = useState(false);

  // Error state
  const [error, setError] = useState<string | null>(null);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!email || !password) {
      setError('Introduce email y contraseña.');
      return;
    }

    try {
      const response = await logInUser(email, password);
      const user: User = response.user;
      localStorage.setItem('token', response.token);
      localStorage.setItem('refreshToken', response.refreshToken);
      localStorage.setItem('user', JSON.stringify(user));
      localStorage.setItem('userId', user._id);
      navigate('/home', { state: { user } });
    } catch (error) {
      setError('Login incorrecto. Revisa tus credenciales.');
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!registerName || !registerEmail || !registerPassword) {
      setError('Rellena todos los campos.');
      return;
    }

    try {
      const response = await registerUser(
        registerName,
        registerEmail,
        registerPassword,
      );
      alert('¡Registro exitoso! Ahora puedes iniciar sesión.');
      setIsFlipped(false);
      setEmail(registerEmail);
    } catch (error) {
      setError('Error en el registro. Inténtalo de nuevo.');
    }
  };

  useEffect(() => {
    const handleGoogleLoginMessage = (event: MessageEvent) => {
      if (event.origin !== 'http://miapi:40000') return;
      if (event.data.token) {
        const user: User = event.data.user;
        localStorage.setItem('token', event.data.token);
        localStorage.setItem('refreshToken', event.data.refreshToken);
        localStorage.setItem('userId', user._id);
        if (event.data.user) {
          navigate('/home', { state: { user } });
        }
      }
    };
    window.addEventListener('message', handleGoogleLoginMessage);
    return () =>
      window.removeEventListener('message', handleGoogleLoginMessage);
  }, [navigate]);

  const loginWithGoogle = () => {
    const googleAuthUrl = 'http://miapi:40000/api/users/auth/google';
    const width = 500;
    const height = 600;
    const left = (window.screen.width - width) / 2;
    const top = (window.screen.height - height) / 2;
    window.open(
      googleAuthUrl,
      'googleAuth',
      `width=${width},height=${height},left=${left},top=${top}`,
    );
  };

  return (
    <div className={styles.loginBg}>
      <div className={styles.cardContainer}>
        <div className={`${styles.card} ${isFlipped ? styles.flipped : ''}`}>
          {/* Login */}
          <div className={styles.front}>
            <div className={styles.logoBox}>
              <img
                src="/quickfind_logo.png"
                alt="Logo"
                className={styles.logo}
              />
            </div>
            <h2 className={styles.title}>Iniciar sesión</h2>
            <form className={styles.form} onSubmit={handleLogin}>
              <input
                className={styles.input}
                type="email"
                placeholder="Correo electrónico"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
              <input
                className={styles.input}
                type="password"
                placeholder="Contraseña"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
              {error && <div className={styles.error}>{error}</div>}
              <button className={styles.btn} type="submit">
                Entrar
              </button>
              <button
                type="button"
                className={styles.googleBtn}
                onClick={loginWithGoogle}>
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 48 48"
                  style={{ marginRight: 8 }}>
                  <g>
                    <path
                      fill="#4285F4"
                      d="M43.6 20.5h-1.9V20H24v8h11.3c-1.6 4.3-5.7 7-11.3 7-6.6 0-12-5.4-12-12s5.4-12 12-12c2.8 0 5.4 1 7.4 2.6l6.2-6.2C34.5 5.5 29.5 3.5 24 3.5 12.7 3.5 3.5 12.7 3.5 24S12.7 44.5 24 44.5c11 0 20.5-8.5 20.5-20.5 0-1.4-.1-2.7-.3-4z"
                    />
                    <path
                      fill="#34A853"
                      d="M6.3 14.1l6.6 4.8C14.5 16.1 18.9 13.5 24 13.5c2.8 0 5.4 1 7.4 2.6l6.2-6.2C34.5 5.5 29.5 3.5 24 3.5c-7.2 0-13.4 3.7-17.1 9.3z"
                    />
                    <path
                      fill="#FBBC05"
                      d="M24 44.5c5.5 0 10.5-1.8 14.4-4.9l-6.7-5.5c-2 1.4-4.5 2.2-7.7 2.2-5.6 0-10.3-3.8-12-9H6.3c3.6 7.1 11 12.2 17.7 12.2z"
                    />
                    <path
                      fill="#EA4335"
                      d="M43.6 20.5h-1.9V20H24v8h11.3c-0.7 2-2.1 3.7-4.1 4.9l6.7 5.5c3.9-3.6 6.1-8.9 6.1-14.9 0-1.4-.1-2.7-.3-4z"
                    />
                  </g>
                </svg>
                Entrar con Google
              </button>
            </form>
            <div className={styles.switchText}>
              ¿No tienes cuenta?{' '}
              <span className={styles.link} onClick={() => setIsFlipped(true)}>
                Regístrate
              </span>
            </div>
          </div>
          {/* Register */}
          <div className={styles.back}>
            <div className={styles.logoBox}>
              <img
                src="/quickfind_logo.png"
                alt="Logo"
                className={styles.logo}
              />
            </div>
            <h2 className={styles.title}>Registro</h2>
            <form className={styles.form} onSubmit={handleRegister}>
              <input
                className={styles.input}
                type="text"
                placeholder="Nombre"
                value={registerName}
                onChange={(e) => setRegisterName(e.target.value)}
                required
              />
              <input
                className={styles.input}
                type="email"
                placeholder="Correo electrónico"
                value={registerEmail}
                onChange={(e) => setRegisterEmail(e.target.value)}
                required
              />
              <input
                className={styles.input}
                type="password"
                placeholder="Contraseña"
                value={registerPassword}
                onChange={(e) => setRegisterPassword(e.target.value)}
                required
              />
              {error && <div className={styles.error}>{error}</div>}
              <button className={styles.btn} type="submit">
                Crear cuenta
              </button>
            </form>
            <div className={styles.switchText}>
              ¿Ya tienes cuenta?{' '}
              <span className={styles.link} onClick={() => setIsFlipped(false)}>
                Inicia sesión
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
