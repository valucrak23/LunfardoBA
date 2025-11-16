import fetchWithAuth from './api';

export const categoriasService = {
  // Obtener todas las categorías
  getAll: async () => {
    return await fetchWithAuth('/categorias');
  },

  // Obtener una categoría por ID
  getById: async (id) => {
    return await fetchWithAuth(`/categorias/${id}`);
  },

  // Crear una nueva categoría
  create: async (categoriaData) => {
    return await fetchWithAuth('/categorias', {
      method: 'POST',
      body: JSON.stringify(categoriaData),
    });
  },

  // Actualizar una categoría
  update: async (id, categoriaData) => {
    return await fetchWithAuth(`/categorias/${id}`, {
      method: 'PUT',
      body: JSON.stringify(categoriaData),
    });
  },

  // Eliminar una categoría
  delete: async (id) => {
    return await fetchWithAuth(`/categorias/${id}`, {
      method: 'DELETE',
    });
  },
};

