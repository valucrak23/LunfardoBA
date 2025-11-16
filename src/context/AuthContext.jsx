import { useState, useEffect, createContext } from "react";
import { jwtDecode } from "jwt-decode";
// Creamos el contexto
const AuthContext = createContext(); 
// Definimos el Provider del contexto
const AuthProvider = ( { children }) =>{
    const [ user, setUser] = useState(null);
    const [ token, setToken] = useState(null);
    
    // Cargar token desde localStorage al iniciar
    useEffect( () => {
        const storedToken = localStorage.getItem('jwt');
        if (storedToken) {
            setToken(storedToken);
        }
    }, []);

    // Decodificamos el token
    useEffect( () => {
        if( token){
            try {
                const decoded = jwtDecode( token);
                console.log( decoded);
                setUser( decoded )
            } catch (error) {
                console.error('Token invalido', error);
                setUser(null);
                setToken(null);
                localStorage.removeItem('jwt');
            }
        } else {
            setUser(null);
        }
    }, [ token ] )

    const login = (token) => {
        console.log('Login desde el Context');
        setToken( token );
        localStorage.setItem('jwt', token);
    }

    const logout = () =>{
        console.log('logout desde el context');
        setToken(null);
        setUser(null);
        localStorage.removeItem('jwt');
    }

    return (
        <AuthContext.Provider value={ { user, token, login, logout } }>
            { children }
        </AuthContext.Provider>
    )
}


export { AuthProvider, AuthContext }

