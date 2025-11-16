import fetchWithAuth from './api';

export const eventosService = {
  // Obtener todos los eventos
  getAll: async () => {
    return await fetchWithAuth('/eventos');
  },

  // Obtener un evento por ID
  getById: async (id) => {
    return await fetchWithAuth(`/eventos/${id}`);
  },

  // Crear un nuevo evento
  create: async (eventoData) => {
    return await fetchWithAuth('/eventos', {
      method: 'POST',
      body: JSON.stringify(eventoData),
    });
  },

  // Actualizar un evento
  update: async (id, eventoData) => {
    return await fetchWithAuth(`/eventos/${id}`, {
      method: 'PUT',
      body: JSON.stringify(eventoData),
    });
  },

  // Eliminar un evento
  delete: async (id) => {
    return await fetchWithAuth(`/eventos/${id}`, {
      method: 'DELETE',
    });
  },
};

