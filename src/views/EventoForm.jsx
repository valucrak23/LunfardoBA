import { useParams, useNavigate } from 'react-router-dom';
import { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import DataCacheContext from '../context/DataCacheContext';
import { eventosService } from '../services/eventosService';
import { categoriasService } from '../services/categoriasService';
import Loading from '../components/Loading';

const EventoForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { token } = useContext(AuthContext);
  const { loadEventsList, upsertEvent, invalidateEvents } = useContext(DataCacheContext);
  const [categorias, setCategorias] = useState([]);
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState(null);
  const isEditing = !!id;

  const [formData, setFormData] = useState({
    titulo: '',
    descripcion: '',
    tipo: 'recital',
    categorias: [], // Array de IDs de categorías seleccionadas
    categoriaPredominante: '', // ID de la categoría predominante
    fecha: '',
    hora: '',
    nombreLugar: '',
    direccion: '',
    esGratuito: false,
    precio: '',
    recomendaciones: '',
    contacto: '',
    color: '#007bff',
    colorManual: false, // Flag para saber si el color fue modificado manualmente
  });

  useEffect(() => {
    if (!token) {
      navigate('/login');
      return;
    }
    
    // Cargar categorías primero, luego el evento si estamos editando
    loadCategorias().then(() => {
      if (isEditing) {
        loadEvento();
      }
    });
  }, [id, token]);

  const loadEvento = async () => {
    try {
      setLoading(true);
      const response = await eventosService.getById(id);
      const evento = response?.data || response;
      
      // Manejar múltiples categorías o categoría única (compatibilidad hacia atrás)
      const categoriasIds = evento.categorias?.map(c => c._id || c) || 
                           (evento.categoria?._id || evento.categoria ? [evento.categoria._id || evento.categoria] : []);
      const categoriaPredominanteId = evento.categoriaPredominante?._id || evento.categoriaPredominante ||
                                      (evento.categoria?._id || evento.categoria) || '';
      
      // Determinar si el color fue modificado manualmente
      // Si el evento tiene color y es diferente al de la categoría predominante, fue manual
      // Esperar a que las categorías estén cargadas
      const categoriasCargadas = categorias.length > 0 ? categorias : await loadCategorias();
      const categoriaPredominante = categoriasCargadas.find(c => c._id === categoriaPredominanteId);
      const colorDeCategoria = categoriaPredominante?.color || '#007bff';
      const colorEvento = evento.color || colorDeCategoria;
      const colorManual = categoriaPredominanteId && colorEvento !== colorDeCategoria;
      
      setFormData({
        titulo: evento.titulo || '',
        descripcion: evento.descripcion || '',
        tipo: evento.tipo || 'recital',
        categorias: categoriasIds,
        categoriaPredominante: categoriaPredominanteId,
        fecha: evento.fecha ? evento.fecha.split('T')[0] : '',
        hora: evento.hora || '',
        nombreLugar: evento.ubicacion?.nombre || evento.nombreLugar || '',
        direccion: evento.ubicacion?.direccion || evento.direccion || '',
        esGratuito: evento.precio?.esGratuito || evento.esGratuito || false,
        precio: evento.precio?.monto?.toString() || evento.precio?.toString() || '',
        recomendaciones: Array.isArray(evento.informacionAdicional?.recomendaciones)
          ? evento.informacionAdicional.recomendaciones.join(', ')
          : Array.isArray(evento.recomendaciones)
            ? evento.recomendaciones.join(', ')
            : evento.informacionAdicional?.recomendaciones || evento.recomendaciones || '',
        contacto: evento.informacionAdicional?.contacto || evento.contacto || '',
        color: colorEvento,
        colorManual: colorManual,
      });
    } catch (error) {
      console.error('Error al cargar evento:', error);
      setMsg('Error al cargar el evento');
    } finally {
      setLoading(false);
    }
  };

  const loadCategorias = async () => {
    try {
      const response = await categoriasService.getAll();
      setCategorias(response?.data || []);
      return response?.data || [];
    } catch (error) {
      console.error('Error al cargar categorías:', error);
      return [];
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    // Manejar cambios en categorías (checkboxes)
    if (name === 'categoriaCheckbox') {
      const categoriaId = value;
      const categoriasActuales = formData.categorias || [];
      let nuevasCategorias;
      
      if (checked) {
        // Agregar categoría
        nuevasCategorias = [...categoriasActuales, categoriaId];
        // Si es la primera categoría seleccionada, marcarla como predominante
        if (categoriasActuales.length === 0) {
          setFormData({
            ...formData,
            categorias: nuevasCategorias,
            categoriaPredominante: categoriaId,
          });
          // Actualizar color automáticamente
          updateColorFromCategoria(categoriaId);
          return;
        }
      } else {
        // Remover categoría
        nuevasCategorias = categoriasActuales.filter(id => id !== categoriaId);
        // Si se deselecciona la predominante, elegir la primera disponible
        if (formData.categoriaPredominante === categoriaId && nuevasCategorias.length > 0) {
          const nuevaPredominante = nuevasCategorias[0];
          setFormData({
            ...formData,
            categorias: nuevasCategorias,
            categoriaPredominante: nuevaPredominante,
          });
          updateColorFromCategoria(nuevaPredominante);
          return;
        } else if (nuevasCategorias.length === 0) {
          // Si no quedan categorías, limpiar predominante y color
          setFormData({
            ...formData,
            categorias: [],
            categoriaPredominante: '',
            color: '#007bff',
            colorManual: false,
          });
          return;
        }
      }
      
      setFormData({
        ...formData,
        categorias: nuevasCategorias,
      });
      return;
    }
    
    // Manejar cambio de categoría predominante (radio buttons)
    if (name === 'categoriaPredominante') {
      setFormData({
        ...formData,
        categoriaPredominante: value,
      });
      // Actualizar color automáticamente si no fue modificado manualmente
      if (!formData.colorManual) {
        updateColorFromCategoria(value);
      }
      return;
    }
    
    // Manejar cambio de color manual
    if (name === 'color') {
      setFormData({
        ...formData,
        color: value,
        colorManual: true, // Marcar como cambio manual
      });
      return;
    }
    
    // Otros campos normales
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value,
    });
  };
  
  // Función para actualizar el color desde la categoría predominante
  const updateColorFromCategoria = (categoriaId) => {
    if (!categoriaId) return;
    const categoria = categorias.find(c => c._id === categoriaId);
    if (categoria?.color) {
      setFormData(prev => ({
        ...prev,
        color: categoria.color,
        colorManual: false, // Resetear flag al cambiar desde categoría
      }));
    }
  };

  const validateForm = () => {
    if (!formData.titulo.trim()) {
      setMsg('El título es requerido');
      return false;
    }
    if (!formData.descripcion.trim()) {
      setMsg('La descripción es requerida');
      return false;
    }
    if (!formData.fecha) {
      setMsg('La fecha es requerida');
      return false;
    }
    if (!formData.hora) {
      setMsg('La hora es requerida');
      return false;
    }
    if (!formData.nombreLugar.trim()) {
      setMsg('El nombre del lugar es requerido');
      return false;
    }
    if (!formData.esGratuito && (!formData.precio || parseFloat(formData.precio) < 0)) {
      setMsg('El precio debe ser un número válido');
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMsg(null);

    if (!validateForm()) {
      return;
    }

    try {
      // Validar que la categoría predominante esté en el array de categorías
      if (formData.categoriaPredominante && !formData.categorias.includes(formData.categoriaPredominante)) {
        setMsg('La categoría predominante debe estar seleccionada en las categorías');
        return;
      }
      
      const eventoData = {
        titulo: formData.titulo,
        descripcion: formData.descripcion,
        tipo: formData.tipo,
        categorias: formData.categorias || [],
        categoriaPredominante: formData.categoriaPredominante || null,
        // Mantener categoria para compatibilidad hacia atrás
        categoria: formData.categoriaPredominante || null,
        fecha: formData.fecha,
        hora: formData.hora,
        ubicacion: {
          nombre: formData.nombreLugar,
          direccion: formData.direccion || null
        },
        precio: {
          esGratuito: formData.esGratuito,
          monto: formData.esGratuito ? 0 : parseFloat(formData.precio) || 0,
          moneda: 'ARS'
        },
        informacionAdicional: {
          recomendaciones: formData.recomendaciones 
            ? formData.recomendaciones.split(',').map(r => r.trim()).filter(r => r)
            : [],
          contacto: formData.contacto || null
        },
        color: formData.color || '#007bff'
      };

      let eventoActualizado;
      if (isEditing) {
        const response = await eventosService.update(id, eventoData);
        eventoActualizado = response?.data || response;
        setMsg('Evento actualizado correctamente');
        // Actualizar el evento en el caché con los datos frescos del servidor
        if (eventoActualizado) {
          upsertEvent(eventoActualizado);
        }
      } else {
        const response = await eventosService.create(eventoData);
        eventoActualizado = response?.data || response;
        setMsg('Evento creado correctamente');
        // Agregar el nuevo evento al caché
        if (eventoActualizado) {
          upsertEvent(eventoActualizado);
        }
      }

      // Invalidar caché y forzar refresh de la lista para obtener datos actualizados con categorías populadas
      invalidateEvents();
      await loadEventsList(true);

      setTimeout(() => {
        navigate('/eventos');
      }, 1000);
    } catch (error) {
      setMsg('Error: ' + error.message);
    }
  };

  if (loading) {
    return (
      <main className="container">
        <Loading />
      </main>
    );
  }

  return (
    <main className="container">
      <div className="detail-header">
        <button onClick={() => navigate('/eventos')} className="btn-volver">
          ← Volver
        </button>
      </div>

      <div className="detail-view">
        <div className="detail-card">
          <h1 className="page-title">{isEditing ? 'Editar Evento' : 'Nuevo Evento'}</h1>

          {msg && (
            <div className={`msg ${msg.includes('Error') ? 'error-msg' : 'success-msg'}`}>
              {msg}
            </div>
          )}

          <form onSubmit={handleSubmit} className="evento-form">
            <div className="detail-item">
              <strong>Título *</strong>
              <input
                type="text"
                id="titulo"
                name="titulo"
                value={formData.titulo}
                onChange={handleInputChange}
                required
              />
            </div>

            <div className="detail-item">
              <strong>Descripción *</strong>
              <textarea
                id="descripcion"
                name="descripcion"
                value={formData.descripcion}
                onChange={handleInputChange}
                required
              />
            </div>

            <div className="detail-item">
              <strong>Tipo *</strong>
              <select id="tipo" name="tipo" value={formData.tipo} onChange={handleInputChange} required>
                <option value="recital">🎵 Recital</option>
                <option value="evento_cultural">🎨 Evento Cultural</option>
                <option value="taller">📚 Taller</option>
              </select>
            </div>

            <div className="detail-item">
              <strong>Categorías</strong>
              <p style={{ fontSize: '0.85rem', opacity: 0.8, marginBottom: '0.5rem' }}>
                Selecciona una o más categorías. La primera seleccionada será la predominante (define el color por defecto).
              </p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', maxHeight: '200px', overflowY: 'auto', padding: '0.5rem', background: 'var(--neu-bg)', borderRadius: '0.75rem' }}>
                {categorias.map(cat => (
                  <label key={cat._id} className="neo-checkbox" style={{ cursor: 'pointer' }}>
                    <input
                      type="checkbox"
                      name="categoriaCheckbox"
                      value={cat._id}
                      checked={formData.categorias.includes(cat._id)}
                      onChange={handleInputChange}
                    />
                    <span className="neo-checkbox-box" aria-hidden="true"></span>
                    <span className="neo-checkbox-text" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <span>{cat.icono}</span>
                      <span>{cat.nombre}</span>
                      {formData.categoriaPredominante === cat._id && (
                        <span style={{ fontSize: '0.75rem', opacity: 0.7 }}>⭐ Predominante</span>
                      )}
                    </span>
                    {formData.categorias.includes(cat._id) && (
                      <input
                        type="radio"
                        name="categoriaPredominante"
                        value={cat._id}
                        checked={formData.categoriaPredominante === cat._id}
                        onChange={handleInputChange}
                        style={{ marginLeft: 'auto' }}
                        title="Marcar como categoría predominante"
                      />
                    )}
                  </label>
                ))}
                {categorias.length === 0 && (
                  <p style={{ fontSize: '0.85rem', opacity: 0.6 }}>No hay categorías disponibles</p>
                )}
              </div>
            </div>

            <div className="detail-item">
              <strong>Fecha y Hora *</strong>
              <div className="form-row">
                <input
                  type="date"
                  id="fecha"
                  name="fecha"
                  value={formData.fecha}
                  onChange={handleInputChange}
                  required
                />
                <input
                  type="time"
                  id="hora"
                  name="hora"
                  value={formData.hora}
                  onChange={handleInputChange}
                  required
                />
              </div>
            </div>

            <div className="detail-item">
              <strong>Nombre del lugar *</strong>
              <input
                type="text"
                id="nombreLugar"
                name="nombreLugar"
                value={formData.nombreLugar}
                onChange={handleInputChange}
                required
              />
            </div>

            <div className="detail-item">
              <strong>Dirección</strong>
              <input
                type="text"
                id="direccion"
                name="direccion"
                value={formData.direccion}
                onChange={handleInputChange}
              />
            </div>

            <div className="detail-item">
              <strong>Precio</strong>
              <label className="neo-checkbox">
                <input
                  type="checkbox"
                  name="esGratuito"
                  id="esGratuito"
                  checked={formData.esGratuito}
                  onChange={handleInputChange}
                />
                <span className="neo-checkbox-box" aria-hidden="true"></span>
                <span className="neo-checkbox-text">Evento gratuito</span>
              </label>
              {!formData.esGratuito && (
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  id="precio"
                  name="precio"
                  value={formData.precio}
                  onChange={handleInputChange}
                  placeholder="Precio en ARS"
                />
              )}
            </div>

            <div className="detail-item">
              <strong>Recomendaciones</strong>
              <input
                type="text"
                id="recomendaciones"
                name="recomendaciones"
                value={formData.recomendaciones}
                onChange={handleInputChange}
                placeholder="Separadas por comas"
              />
            </div>

            <div className="detail-item">
              <strong>Contacto</strong>
              <input
                type="text"
                id="contacto"
                name="contacto"
                value={formData.contacto}
                onChange={handleInputChange}
              />
            </div>

            <div className="detail-item">
              <strong>Color</strong>
              <p style={{ fontSize: '0.85rem', opacity: 0.8, marginBottom: '0.5rem' }}>
                {formData.categoriaPredominante && !formData.colorManual 
                  ? `Color automático desde categoría predominante. Puedes cambiarlo manualmente.`
                  : formData.colorManual
                    ? 'Color personalizado (no se actualizará automáticamente)'
                    : 'Selecciona una categoría predominante para obtener el color automáticamente'}
              </p>
              <div className="form-row">
                <input
                  type="color"
                  id="color"
                  name="color"
                  value={formData.color}
                  onChange={handleInputChange}
                  data-manual-change="true"
                />
                <input
                  type="text"
                  id="colorHex"
                  name="color"
                  value={formData.color}
                  onChange={handleInputChange}
                  placeholder="#007bff"
                  data-manual-change="true"
                />
              </div>
            </div>

            <div className="form-actions">
              <button 
                type="button" 
                onClick={() => navigate('/eventos')}
                className="btn-secondary"
              >
                Cancelar
              </button>
              <button type="submit" className="btn-primary">
                {isEditing ? 'Actualizar' : 'Crear Evento'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </main>
  );
};

export default EventoForm;

