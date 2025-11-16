import { useParams, useNavigate } from 'react-router-dom';
import { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { eventosService } from '../services/eventosService';
import { categoriasService } from '../services/categoriasService';
import Loading from '../components/Loading';

const EventoForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { token } = useContext(AuthContext);
  const [categorias, setCategorias] = useState([]);
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState(null);
  const isEditing = !!id;

  const [formData, setFormData] = useState({
    titulo: '',
    descripcion: '',
    tipo: 'recital',
    categoria: '',
    fecha: '',
    hora: '',
    nombreLugar: '',
    direccion: '',
    esGratuito: false,
    precio: '',
    recomendaciones: '',
    contacto: '',
    color: '#007bff',
  });

  useEffect(() => {
    if (!token) {
      navigate('/login');
      return;
    }
    
    loadCategorias();
    if (isEditing) {
      loadEvento();
    }
  }, [id, token]);

  const loadEvento = async () => {
    try {
      setLoading(true);
      const response = await eventosService.getById(id);
      const evento = response?.data || response;
      
      setFormData({
        titulo: evento.titulo || '',
        descripcion: evento.descripcion || '',
        tipo: evento.tipo || 'recital',
        categoria: evento.categoria?._id || evento.categoria || '',
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
        color: evento.color || '#007bff',
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
    } catch (error) {
      console.error('Error al cargar categorías:', error);
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value,
    });
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
      const eventoData = {
        titulo: formData.titulo,
        descripcion: formData.descripcion,
        tipo: formData.tipo,
        categoria: formData.categoria || null,
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

      if (isEditing) {
        await eventosService.update(id, eventoData);
        setMsg('Evento actualizado correctamente');
      } else {
        await eventosService.create(eventoData);
        setMsg('Evento creado correctamente');
      }

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
          <h1>{isEditing ? 'Editar Evento' : 'Nuevo Evento'}</h1>

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
              <strong>Categoría</strong>
              <select id="categoria" name="categoria" value={formData.categoria} onChange={handleInputChange}>
                <option value="">Sin categoría</option>
                {categorias.map(cat => (
                  <option key={cat._id} value={cat._id}>
                    {cat.icono} {cat.nombre}
                  </option>
                ))}
              </select>
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
              <div className="checkbox-group">
                <input
                  type="checkbox"
                  name="esGratuito"
                  id="esGratuito"
                  checked={formData.esGratuito}
                  onChange={handleInputChange}
                />
                <label htmlFor="esGratuito">Evento gratuito</label>
              </div>
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
              <div className="form-row">
                <input
                  type="color"
                  id="color"
                  name="color"
                  value={formData.color}
                  onChange={handleInputChange}
                />
                <input
                  type="text"
                  id="colorHex"
                  name="color"
                  value={formData.color}
                  onChange={handleInputChange}
                  placeholder="#007bff"
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

