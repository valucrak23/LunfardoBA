// Usar proxy en desarrollo, API directa en producción
const API_BASE_URL = import.meta.env.DEV 
  ? '/api'  // En desarrollo usa el proxy de Vite
  : 'https://altadataba.onrender.com/api';  // En producción usa la URL directa

export const authService = {
  // Login
  login: async (email, password) => {
    try {
      const response = await fetch(`${API_BASE_URL}/usuarios/auth`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      const contentType = response.headers.get('content-type');
      let data;

      if (contentType && contentType.includes('application/json')) {
        data = await response.json();
      } else {
        const text = await response.text();
        throw new Error(`Error del servidor (${response.status}): La respuesta no es JSON válido`);
      }

      if (!response.ok) {
        let errorMessage = 'Error en el login';
        errorMessage = data.msg || data.message || errorMessage;
        
        // Si es 401, dar un mensaje más específico
        if (response.status === 401) {
          errorMessage = data.msg || 'Credenciales inválidas. Verifica tu email y contraseña. Si te registraste antes de implementar el login, necesitas crear una nueva cuenta.';
        }
        
        throw new Error(errorMessage);
      }

      return data;
    } catch (error) {
      if (error.message === 'Failed to fetch' || error.name === 'TypeError') {
        throw new Error('Error de conexión con el servidor. Verifica tu conexión a internet.');
      }
      throw error;
    }
  },

  // Registro
  register: async (nombre, email, password) => {
    try {
      const response = await fetch(`${API_BASE_URL}/usuarios`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ nombre, email, password }),
      });

      if (!response.ok) {
        let errorMessage = 'Error en el registro';
        try {
          const error = await response.json();
          errorMessage = error.msg || error.message || errorMessage;
        } catch (e) {
          // Si no se puede parsear el JSON
        }
        throw new Error(errorMessage);
      }

      return response.json();
    } catch (error) {
      if (error.message === 'Failed to fetch' || error.name === 'TypeError') {
        throw new Error('Error de conexión con el servidor. Verifica tu conexión a internet.');
      }
      throw error;
    }
  },
};

