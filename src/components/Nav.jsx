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
    const switchRef = useRef(null);

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

    useEffect(() => {
        const input = switchRef.current;
        const label = input?.parentElement;
        if (label) {
            label.classList.add("switch--pristine");
        }
        if (input && window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches) {
            input.checked = true;
        }
        // Capturar color previo al toggle para la animación
        const onPointerDown = () => {
            try {
                const bodyStyles = getComputedStyle(document.body);
                const prevBg = bodyStyles.getPropertyValue('background-color') || '#000';
                document.body.style.setProperty('--wipe-bg', prevBg.trim());
            } catch {}
        };
        input?.addEventListener('pointerdown', onPointerDown, { passive: true });
        const onChange = () => {
            if (label) {
                label.classList.remove("switch--pristine");
            }
            const body = document.body;
            const isGoingToDark = input.checked; // true = light → dark, false = dark → light
            
            // Respeta reduced motion: salta animación si el usuario lo prefiere
            const prefersReduced = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
            if (prefersReduced) {
                body.classList.remove('theme-stagger','theme-radial-start','theme-bg-transparent','theme-reverse-stagger');
                body.style.removeProperty('--wipe-bg');
                return;
            }
            
            if (isGoingToDark) {
                // Light → Dark: transición completa con radial (HD fluida)
                body.classList.add('theme-stagger','theme-bg-transparent');
                // eslint-disable-next-line no-unused-expressions
                body.offsetWidth;
                body.classList.add('theme-radial-start');
                window.setTimeout(() => {
                    body.classList.remove('theme-stagger','theme-radial-start','theme-bg-transparent');
                    body.style.removeProperty('--wipe-bg');
                }, 1600); // después del radial (1400ms) + margen
            } else {
                // Dark → Light: solo escalonado rápido, sin radial, orden invertido (fluida)
                body.classList.add('theme-reverse-stagger');
                // eslint-disable-next-line no-unused-expressions
                body.offsetWidth;
                window.setTimeout(() => {
                    body.classList.remove('theme-reverse-stagger');
                    body.style.removeProperty('--wipe-bg');
                }, 800); // después de la transición (550ms + delays) + margen
            }
        };
        input?.addEventListener("change", onChange);
        return () => {
            input?.removeEventListener('pointerdown', onPointerDown);
            input?.removeEventListener("change", onChange);
        };
    }, []);

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
                {/* Switch de tema (violeta azulado) */}
                <label className="switch" title="Cambiar tema">
                    <input ref={switchRef} className="switch__input" type="checkbox" role="switch" />
                    <svg className="switch__scene" viewBox="0 0 48 24" width="48px" height="24px" aria-hidden="true">
                        <symbol id="switch-cloud" viewBox="0 0 10 6">
                            <path d="m7.5,1c-.238,0-.463.049-.675.125-.55-.681-1.381-1.125-2.325-1.125-1.13,0-2.103.633-2.614,1.556-.124-.033-.251-.056-.386-.056-.828,0-1.5.672-1.5,1.5s.672,1.5,1.5,1.5c.134,0,.262-.023.386-.056.511.924,1.484,1.556,2.614,1.556.943,0,1.775-.444,2.325-1.125.212.076.437.125.675.125,1.105,0,2-.895,2-2s-.895-2-2-2Z"/>
                        </symbol>
                        <symbol id="switch-star" viewBox="0 0 4 4">
                            <path d="m2.277.172l.379.767c.045.091.132.154.233.169l.847.123c.253.037.355.348.171.527l-.613.597c-.073.071-.106.173-.089.273l.145.843c.043.252-.222.445-.448.326l-.757-.398c-.09-.047-.197-.047-.287,0l-.757.398c-.227.119-.491-.073-.448-.326l.145-.843c.017-.1-.016-.202-.089-.273L.094,1.758c-.183-.179-.082-.49.171-.527l.847-.123c.101-.015.188-.078.233-.169l.379-.767c.113-.23.441-.23.554,0Z"/>
                        </symbol>
                        <defs>
                            <linearGradient id="switch-sun1" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="0" stopColor="hsl(255,70%,75%)" />
                                <stop offset="1" stopColor="hsl(245,70%,70%)" />
                            </linearGradient>
                            <linearGradient id="switch-sun2" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="0" stopColor="hsl(245,70%,70%)" />
                                <stop offset="1" stopColor="hsl(235,70%,68%)" />
                            </linearGradient>
                            <linearGradient id="switch-moon1" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="0" stopColor="hsl(255,90%,95%)" />
                                <stop offset="1" stopColor="hsl(255,70%,85%)" />
                            </linearGradient>
                            <linearGradient id="switch-moon2" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="0" stopColor="hsla(255,90%,95%,0)" />
                                <stop offset="1" stopColor="hsla(255,90%,95%,1)" />
                            </linearGradient>
                            <linearGradient id="switch-moon3" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="0" stopColor="hsla(255,70%,75%,1)" />
                                <stop offset="1" stopColor="hsla(255,70%,75%,0)" />
                            </linearGradient>
                            <linearGradient id="switch-cloud1" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="0" stopColor="hsla(0,0%,100%,1)" />
                                <stop offset="1" stopColor="hsla(0,0%,100%,0)" />
                            </linearGradient>
                        </defs>
                        <g className="switch__stars" fill="hsl(255,80%,95%)">
                            <g className="switch__star" transform="translate(28,14) scale(0)">
                                <use href="#switch-star" width="4px" height="4px" />
                            </g>
                            <g className="switch__star" transform="translate(21,13) scale(0)">
                                <use href="#switch-star" width="4px" height="4px" />
                            </g>
                            <g className="switch__star" transform="translate(17,10) scale(0)">
                                <use href="#switch-star" width="4px" height="4px" />
                            </g>
                            <g className="switch__star" transform="translate(24,6) scale(0)">
                                <use href="#switch-star" width="4px" height="4px" />
                            </g>
                            <g className="switch__star" transform="translate(31,5) scale(0)">
                                <use href="#switch-star" width="4px" height="4px" />
                            </g>
                        </g>
                        <g className="switch__handle" transform="translate(12,12)">
                            <g className="switch__handle-side">
                                <circle r="8" fill="url(#switch-sun1)" />
                                <circle r="6.5" fill="url(#switch-sun2)" />
                            </g>
                            <g className="switch__handle-side" opacity="0">
                                <circle r="8" fill="url(#switch-moon1)" />
                                <circle r="6.5" fill="url(#switch-moon2)" />
                                <clipPath id="switch-moon-clip">
                                    <circle className="switch__moon-hole" r="1.5" cx="-6" cy="2" />
                                    <circle className="switch__moon-hole" r="1.5" cx="-1" cy="3" />
                                    <circle className="switch__moon-hole" r="2" cx="-1" cy="8" />
                                    <circle className="switch__moon-hole" r="1" cx="2" cy="0" />
                                    <circle className="switch__moon-hole" r="5" cx="8" cy="6" />
                                </clipPath>
                                <circle r="8" fill="url(#switch-moon3)" clipPath="url(#switch-moon-clip)" />
                            </g>
                        </g>
                        <g fill="url(#switch-cloud1)">
                            <use className="switch__cloud" href="#switch-cloud" width="10" height="6" transform="translate(34,9)" />
                            <use className="switch__cloud" href="#switch-cloud" width="10" height="6" transform="translate(24,13) scale(0.8)" />
                            <use className="switch__cloud" href="#switch-cloud" width="10" height="6" transform="translate(24,5) scale(0.6)" />
                        </g>
                    </svg>
                    <span className="switch__text">Dark Mode</span>
                </label>
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