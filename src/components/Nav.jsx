import { NavLink, useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import { useContext, useState, useRef, useEffect } from "react";
import ConfirmModal from "./ConfirmModal";

const Nav = () => {
    const { user, logout, token } = useContext(AuthContext);
    const navigate = useNavigate();
    const [showUserMenu, setShowUserMenu] = useState(false);
    const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
    const userMenuRef = useRef(null);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (userMenuRef.current && !userMenuRef.current.contains(event.target)) {
                setShowUserMenu(false);
            }
        };

        if (showUserMenu) {
            document.addEventListener('mousedown', handleClickOutside);
        }

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [showUserMenu]);

    const handleAvatarClick = () => {
        setShowUserMenu(!showUserMenu);
    };

    const handleLogoutClick = () => {
        setShowUserMenu(false);
        setShowLogoutConfirm(true);
    };

    const handleLogoutConfirm = () => {
        logout();
        setShowLogoutConfirm(false);
        navigate('/');
    };

    return (
        <>
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
                    <div className="user-info" ref={userMenuRef}>
                        <div className="user-avatar" onClick={handleAvatarClick} title="Ver información de usuario">
                            <span className="user-avatar-initials">
                                {(user?.nombre || user?.name || user?.email || 'U').charAt(0).toUpperCase()}
                            </span>
                        </div>
                        {showUserMenu && (
                            <div className="user-menu">
                                <div className="user-menu-header">
                                    <p className="user-menu-name">{user?.nombre || user?.name || 'Usuario'}</p>
                                    <p className="user-menu-email">{user?.email || ''}</p>
                                </div>
                                <button className="user-menu-logout" onClick={handleLogoutClick}>
                                    Cerrar Sesión
                                </button>
                            </div>
                        )}
                    </div>
                )}
            </nav>
            <ConfirmModal
                isOpen={showLogoutConfirm}
                onClose={() => setShowLogoutConfirm(false)}
                onConfirm={handleLogoutConfirm}
                title="Cerrar Sesión"
                message="¿Estás seguro de que deseas cerrar sesión?"
            />
        </>
    )
}

export default Nav