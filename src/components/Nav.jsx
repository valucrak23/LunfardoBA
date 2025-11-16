import { NavLink } from "react-router-dom";

import { AuthContext } from "../context/AuthContext";
import { useContext } from "react";
const Nav = () => {

    const { user, logout, token } = useContext( AuthContext);
    
    const handleLogout = () => {
        const salir = confirm('¿Seguro que deseas salir?');
        if (salir) {
            logout();
        }
    }

    return (
        <nav>
            <h1>Lunfardo</h1>
            <ul className='menu'>
                <li> <NavLink to='/' end>Inicio</NavLink></li>
                {token ? (
                    <>
                        <li> <NavLink to='/eventos'>Eventos</NavLink></li>
                        <li> <NavLink to='/categorias'>Categorías</NavLink></li>
                    </>
                ) : (
                    <>
                        <li> <NavLink to='/login'>Login</NavLink></li>
                        <li> <NavLink to='/register'>Registro</NavLink></li>
                    </>
                )}
            </ul>
            {token && user && (
                <div className="user-info">
                    <p>{ user?.nombre || user?.name || user?.email }</p>
                    <div className="user-image" onClick={ handleLogout } title="Cerrar Sesión"></div>
                </div>
            )}
        </nav>
    )
}

export default Nav