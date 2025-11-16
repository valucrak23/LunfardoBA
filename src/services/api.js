// Usar proxy en desarrollo, API directa en producción
const API_BASE_URL = import.meta.env.DEV 
  ? '/api'  // En desarrollo usa el proxy de Vite
  : 'https://altadataba.onrender.com/api';  // En producción usa la URL directa

// Función helper para hacer peticiones con autenticación
const fetchWithAuth = async (endpoint, options = {}) => {
  const token = localStorage.getItem('jwt');
  
  const headers = {
    'Content-Type': 'application/json',
    ...options.headers,
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      headers,
    });

    // Si la respuesta no es OK, intentar leer el error
    if (!response.ok) {
      let errorMessage = `Error: ${response.status}`;
      try {
        const errorData = await response.json();
        errorMessage = errorData.msg || errorData.message || errorMessage;
      } catch (e) {
        // Si no se puede parsear el JSON, usar el mensaje por defecto
      }
      throw new Error(errorMessage);
    }

    return response.json();
  } catch (error) {
    // Si es un error de red (CORS, conexión, etc.)
    if (error.message === 'Failed to fetch' || error.name === 'TypeError') {
      throw new Error('Error de conexión con el servidor. Verifica tu conexión a internet o que el servidor esté disponible.');
    }
    throw error;
  }
};

export default fetchWithAuth;

