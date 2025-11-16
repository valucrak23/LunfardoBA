import { NavLink, useNavigate } from "react-router-dom"
import { useState } from "react"
import { authService } from "../services/authService";

const Register = () =>{
    const navigate = useNavigate();

    const [ user, setUser] = useState({
        nombre: '', 
        email: '', 
        password1: '',
        password2: '',
    });
    const [msg, setMsg] = useState(null);
    const [loading, setLoading] = useState(false);

    const onChange = ( event ) => {
        const { name, value} = event.target;
        setUser( {...user, [ name ] : value } );
        setMsg(null); // Limpiar mensaje al escribir
    }

    // Validación del formulario
    const validateForm = () => {
        if (!user.nombre.trim()) {
            setMsg('El nombre es requerido');
            return false;
        }
        if (!user.email.trim()) {
            setMsg('El email es requerido');
            return false;
        }
        if (!user.email.includes('@')) {
            setMsg('El email no es válido');
            return false;
        }
        if (user.password1.length < 6) {
            setMsg('La contraseña debe tener al menos 6 caracteres');
            return false;
        }
        if (user.password1 !== user.password2) {
            setMsg('Las contraseñas no coinciden');
            return false;
        }
        return true;
    }

    // Realizar el fetch a la API para crear el usuario POST
    const onSubmit = async (e) => {
        e.preventDefault();
        setMsg(null);
        setLoading(true);

        if (!validateForm()) {
            setLoading(false);
            return;
        }

        try {
            await authService.register(user.nombre, user.email, user.password1);
            navigate('/login');
        } catch (error) {
            setMsg(error.message || 'Error al registrar usuario');
        } finally {
            setLoading(false);
        }
    }
    return (
        <main className="container">
            <div className="form-wrapper">
                <form onSubmit={ onSubmit } className="login">
                    <h1 className="form-title">Registro</h1>
                    <hr />
                    
                    <div className="input-wrapper">
                        <input value={user.email} onChange={ onChange } type="email" name="email" className="input-text" spellCheck="false" autoComplete="off" required />
                        <label className="input-label" htmlFor="email">Email</label>
                    </div>

                    <div className="input-wrapper">
                        <input value={user.nombre} onChange={ onChange } type="text" name="nombre" className="input-text" spellCheck="false" autoComplete="off" required />
                        <label className="input-label" htmlFor="nombre">Nombre</label>
                    </div>

                    <div className="input-wrapper">
                        <input value={user.password1} onChange={ onChange } type="password" name="password1" className="input-text" spellCheck="false" autoComplete="off" required />
                        <label className="input-label" htmlFor="password1">Contraseña</label>
                    </div>

                    <div className="input-wrapper">
                        <input value={user.password2} onChange={ onChange } type="password" name="password2" className="input-text" spellCheck="false" autoComplete="off" required />
                        <label className="input-label" htmlFor="password2">Repetir Contraseña</label>
                    </div>

                    {msg && <div className="error-msg">{msg}</div>}
                    <button type="submit" className="submit-button" disabled={loading}>
                        {loading ? 'Registrando...' : 'Registrarme'}
                    </button>

                    <div className="ingresarA">
                        <NavLink to='/login'>¿Ya estás registrado? Inicia Sesión</NavLink>
                    </div>
                </form>
            </div>
        </main>
    )
}

export default Register