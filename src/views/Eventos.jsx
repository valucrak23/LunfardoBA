import { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import DataCacheContext from '../context/DataCacheContext';
import { eventosService } from '../services/eventosService';
import { categoriasService } from '../services/categoriasService';
import Loading from '../components/Loading';
import CustomSelect from '../components/CustomSelect';
import ConfirmModal from '../components/ConfirmModal';

const Eventos = () => {
  const { token } = useContext(AuthContext);
  const { eventsList, loadEventsList, removeEvent } = useContext(DataCacheContext);
  const navigate = useNavigate();
  const [eventos, setEventos] = useState([]);
  const [categorias, setCategorias] = useState([]);
  const [loading, setLoading] = useState(true);
  const [msg, setMsg] = useState(null);
  const [filtroTipo, setFiltroTipo] = useState('Todos');
  const [filtroCategoria, setFiltroCategoria] = useState('Todas');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [eventoToDelete, setEventoToDelete] = useState(null);


  useEffect(() => {
    if (token) {
      loadEventos();
      loadCategorias();
    }
  }, [token]);



  const loadEventos = async () => {
    try {
      setLoading(true);
      // Forzar refresh para obtener datos actualizados con categorías populadas
      const list = await loadEventsList(true);
      setEventos(Array.isArray(list) ? list : (eventsList || []));
    } catch (error) {
      setMsg('Error al cargar eventos: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const loadCategorias = async () => {
    try {
      const response = await categoriasService.getAll();
      // La API devuelve { msg, data, total, filtros_aplicados }
      setCategorias(response?.data || []);
    } catch (error) {
      console.error('Error al cargar categorías:', error);
    }
  };


  const handleEdit = (evento) => {
    if (!evento) return;
    navigate(`/evento/editar/${evento._id}`);
  };

  const handleDelete = (id) => {
    setEventoToDelete(id);
    setShowDeleteConfirm(true);
  };

  const handleDeleteConfirm = async () => {
    if (!eventoToDelete) return;

    try {
      await eventosService.delete(eventoToDelete);
      setMsg('Evento eliminado correctamente');
      removeEvent(eventoToDelete);
      setEventos(prev => prev.filter(e => e._id !== eventoToDelete));
      setShowDeleteConfirm(false);
      setEventoToDelete(null);
    } catch (error) {
      setMsg('Error al eliminar: ' + error.message);
      setShowDeleteConfirm(false);
      setEventoToDelete(null);
    }
  };


  // Función para normalizar el tipo (manejar espacios, guiones bajos y normalizar)
  const normalizarTipo = (tipo) => {
    if (!tipo) return '';
    return tipo.trim().toLowerCase().replace(/[_\s]+/g, ''); // Elimina espacios y guiones bajos
  };

  // Función para obtener el nombre legible del tipo
  const getTipoNombre = (tipo) => {
    if (!tipo) return 'Evento';
    const tipoLower = tipo.toLowerCase();
    if (tipoLower === 'recital') return 'Recital';
    if (tipoLower === 'evento_cultural' || tipoLower === 'eventocultural') return 'Evento Cultural';
    if (tipoLower === 'taller') return 'Taller';
    return tipo; // Si no coincide, devolver el original
  };

  const getTipoIcono = (tipo) => {
    const tipoNormalizado = normalizarTipo(tipo);
    if (tipoNormalizado === 'recital') return '🎵';
    if (tipoNormalizado === 'eventocultural') return '🎨';
    if (tipoNormalizado === 'taller') return '📚';
    return '🎭';
  };

  const formatearFecha = (fecha) => {
    if (!fecha) return 'Fecha no especificada';
    
    try {
      // Si viene como string ISO, crear Date object
      const fechaObj = new Date(fecha);
      
      // Verificar que sea una fecha válida
      if (isNaN(fechaObj.getTime())) {
        return fecha; // Si no es válida, devolver la original
      }
      
      // Formatear en español
      const opciones = { 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric',
        timeZone: 'UTC'
      };
      
      return fechaObj.toLocaleDateString('es-AR', opciones);
    } catch (error) {
      // Si hay error, devolver la fecha original
      return fecha;
    }
  };

  const formatearPrecio = (precioObj) => {
    // Si precio es un objeto con esGratuito
    if (precioObj?.esGratuito) {
      return 'Gratis';
    }
    
    // Si precio es un número (estructura antigua - compatibilidad)
    if (typeof precioObj === 'number') {
      if (precioObj === 0 || isNaN(precioObj)) return 'Gratis';
      return `$${precioObj.toLocaleString('es-AR', { minimumFractionDigits: 0, maximumFractionDigits: 2 })}`;
    }
    
    // Si precio es un objeto con monto
    const monto = precioObj?.monto;
    if (monto === null || monto === undefined || monto === '' || monto === '0' || monto === 0) {
      return 'Gratis';
    }
    
    // Convertir a número
    const precioNum = typeof monto === 'number' ? monto : parseFloat(monto);
    
    // Si no es un número válido, mostrar "Gratis"
    if (isNaN(precioNum) || precioNum <= 0) {
      return 'Gratis';
    }
    
    // Formatear el precio con moneda si está disponible
    const moneda = precioObj?.moneda || 'ARS';
    const simbolo = moneda === 'ARS' ? '$' : moneda;
    return `${simbolo}${precioNum.toLocaleString('es-AR', { minimumFractionDigits: 0, maximumFractionDigits: 2 })}`;
  };

  // Debug: ver tipos únicos en eventos (temporal)
  useEffect(() => {
    if (eventos.length > 0) {
      const tiposUnicos = [...new Set(eventos.map(e => e.tipo).filter(Boolean))];
      console.log('Tipos encontrados en eventos:', tiposUnicos);
    }
  }, [eventos]);

  const eventosFiltrados = eventos.filter(evento => {
    const matchTipo = filtroTipo === 'Todos' || 
      (evento.tipo && normalizarTipo(evento.tipo) === normalizarTipo(filtroTipo));
    
    // Filtrar por categoría: buscar en categorias[] o categoria (compatibilidad)
    const matchCategoria = filtroCategoria === 'Todas' || 
      (evento.categorias && evento.categorias.some(cat => {
        const catId = cat._id || cat;
        return catId === filtroCategoria;
      })) ||
      (evento.categoria?._id || evento.categoria) === filtroCategoria;
    
    return matchTipo && matchCategoria;
  });

  if (!token) {
    return (
      <main className="container">
        <h2>Debes iniciar sesión para ver los eventos</h2>
      </main>
    );
  }

  return (
    <main className="container">
      <h1 className="page-title">🎭 Gestión de Eventos</h1>

      {msg && (
        <div className={`msg ${msg.includes('Error') ? 'error-msg' : 'success-msg'}`}>
          {msg}
        </div>
      )}

      <div className="filtros">
        <CustomSelect
          value={filtroTipo}
          onChange={setFiltroTipo}
          placeholder="Todos los tipos"
          options={[
            { value: 'Todos', label: 'Todos los tipos' },
            { value: 'recital', label: 'Recitales', icon: '🎵' },
            { value: 'evento_cultural', label: 'Eventos Culturales', icon: '🎨' },
            { value: 'taller', label: 'Talleres', icon: '📚' },
          ]}
        />

        <CustomSelect
          value={filtroCategoria}
          onChange={setFiltroCategoria}
          placeholder="Todas las categorías"
          options={[
            { value: 'Todas', label: 'Todas las categorías' },
            ...categorias.map(cat => ({
              value: cat._id,
              label: cat.nombre,
              icon: cat.icono || '🏷️'
            }))
          ]}
        />

        <button 
          onClick={() => navigate('/evento/nuevo')}
          className="btn-primary"
        >
          ➕ Nuevo Evento
        </button>
      </div>


      {loading ? (
        <Loading />
      ) : (
        <div className="eventos-grid">
          {eventosFiltrados.length === 0 ? (
            <p className="no-events">No hay eventos disponibles</p>
          ) : (
            eventosFiltrados.map(evento => (
              <div 
                key={evento._id} 
                className="evento-card-home"
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderRightColor = evento.color || '#007bff';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderRightColor = 'transparent';
                }}
              >
                <div className="evento-header">
                  <span className="evento-icono">{getTipoIcono(evento.tipo)}</span>
                  <h3>{evento.titulo}</h3>
                </div>
                <p className="evento-tipo">{getTipoNombre(evento.tipo)}</p>
                <div className="evento-info-basico">
                  <p><strong>📅</strong> {formatearFecha(evento.fecha)} {evento.hora && `• ${evento.hora}`}</p>
                  <p><strong>📍</strong> {evento.ubicacion?.nombre || evento.nombreLugar || 'No especificado'}</p>
                  <p><strong>💰</strong> {formatearPrecio(evento.precio || (evento.esGratuito ? { esGratuito: true } : { monto: evento.precio }))}</p>
                  {(() => {
                    // Priorizar categorias[] sobre categoria
                    let categoriasEvento = [];
                    if (evento.categorias && Array.isArray(evento.categorias) && evento.categorias.length > 0) {
                      categoriasEvento = evento.categorias;
                    } else if (evento.categoria) {
                      categoriasEvento = [evento.categoria];
                    }
                    
                    if (categoriasEvento.length === 0) return null;
                    
                    // Mapear categorías: si vienen como objetos populados, usarlas; si vienen como IDs, buscar en categorías
                    const categoriasCompletas = categoriasEvento.map(cat => {
                      if (cat && typeof cat === 'object' && cat._id && cat.nombre) {
                        return cat;
                      }
                      const catId = typeof cat === 'string' ? cat : (cat?._id || cat);
                      if (catId) {
                        const categoriaEncontrada = categorias.find(c => c._id === catId);
                        return categoriaEncontrada || { _id: catId, nombre: 'Categoría', icono: '🏷️' };
                      }
                      return null;
                    }).filter(Boolean);
                    
                    if (categoriasCompletas.length === 0) return null;
                    
                    const mostrarCategorias = categoriasCompletas.slice(0, 3);
                    const totalCategorias = categoriasCompletas.length;
                    
                    return (
                      <p style={{ marginTop: '0.5rem', fontSize: '0.85rem', display: 'flex', flexWrap: 'wrap', gap: '0.25rem', alignItems: 'center' }}>
                        <strong>🏷️</strong>
                        {mostrarCategorias.map((categoria, idx) => {
                          const catId = categoria._id;
                          const esPredominante = evento.categoriaPredominante?._id === catId || 
                                                evento.categoriaPredominante === catId ||
                                                (idx === 0 && !evento.categoriaPredominante && evento.categoria?._id === catId);
                          return (
                            <span key={catId || idx} style={{ fontSize: '0.8rem', opacity: 0.8 }}>
                              {categoria.icono || '🏷️'} {categoria.nombre}
                              {esPredominante && ' ⭐'}
                            </span>
                          );
                        })}
                        {totalCategorias > 3 && (
                          <span style={{ fontSize: '0.8rem', opacity: 0.6 }}>+{totalCategorias - 3} más</span>
                        )}
                      </p>
                    );
                  })()}
                </div>
                <div className="evento-actions">
                  <button onClick={() => navigate(`/evento/${evento._id}`)} className="btn-ver-detalle">Ver detalles</button>
                  <div>
                    <button onClick={() => handleEdit(evento)} className="btn-edit">Editar</button>
                    <button onClick={() => handleDelete(evento._id)} className="btn-delete">Eliminar</button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      <ConfirmModal
        isOpen={showDeleteConfirm}
        onClose={() => {
          setShowDeleteConfirm(false);
          setEventoToDelete(null);
        }}
        onConfirm={handleDeleteConfirm}
        title="Eliminar Evento"
        message="¿Estás seguro de que deseas eliminar este evento? Esta acción no se puede deshacer."
      />
    </main>
  );
};

export default Eventos;

