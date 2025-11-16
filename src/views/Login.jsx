import { NavLink, useNavigate } from "react-router-dom"
import { useRef, useState, useContext } from 'react'
import { AuthContext } from "../context/AuthContext";
import { authService } from "../services/authService";

const Login = () => {

    const navigate = useNavigate();
    const emailRef = useRef();
    const passwordRef = useRef();
    const [msg, setMsg] = useState(null);
    const [loading, setLoading] = useState(false);

    const { login } = useContext( AuthContext);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setMsg(null);
        setLoading(true);

        const email = emailRef.current.value.trim();
        const password = passwordRef.current.value;

        // Validación
        if (!email || !password) {
            setMsg('Por favor completa todos los campos');
            setLoading(false);
            return;
        }

        try {
            const response = await authService.login(email, password);
            console.log('Respuesta del login:', response);
            
            // Intentar obtener el token de diferentes posibles estructuras
            const token = response.jwt || response.token || response.data?.jwt || response.data?.token;
            
            if (token) {
                login(token);
                navigate('/');
            } else {
                console.error('Estructura de respuesta inesperada:', response);
                setMsg('Error: No se recibió el token. Verifica las credenciales.');
            }
        } catch (error) {
            console.error('Error en login:', error);
            // Mostrar el mensaje de error del servidor o uno genérico
            const errorMsg = error.message || 'Error al iniciar sesión';
            setMsg(errorMsg);
        } finally {
            setLoading(false);
        }
    } 
    return (
        <main className="container">
            <div className="form-wrapper">
                <form onSubmit={handleSubmit} className="login">
                    <h1 className="form-title">Iniciar Sesión</h1>
                    <hr />
                    
                    <div className="input-wrapper">
                        <input
                            ref={emailRef}
                            type="email"
                            id="email"
                            name="email"
                            className="input-text"
                            spellCheck="false"
                            autoComplete="off"
                            required
                        />
                        <label className="input-label" htmlFor="email">Email</label>
                    </div>

                    <div className="input-wrapper">
                        <input
                            ref={passwordRef}
                            type="password"
                            id="password"
                            name="password"
                            className="input-text"
                            spellCheck="false"
                            autoComplete="off"
                            required
                        />
                        <label className="input-label" htmlFor="password">Contraseña</label>
                    </div>

                    {msg && <div className="error-msg">{msg}</div>}
                    
                    <button type="submit" className="submit-button" disabled={loading}>
                        {loading ? 'Ingresando...' : 'Ingresar'}
                    </button>

                    <div className="ingresarA">
                        <NavLink to='/register'>¿No estás registrado? Crea una cuenta</NavLink>
                    </div>
                </form>
            </div>
        </main>
    )
}

export default Login