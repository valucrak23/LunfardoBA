import Loading from "../components/Loading"
import { AuthContext } from "../context/AuthContext"
import { useState, useEffect, useContext } from 'react'
import { categoriasService } from '../services/categoriasService'
import { NavLink, useNavigate } from 'react-router-dom'
import CustomSelect from '../components/CustomSelect'
import DataCacheContext from '../context/DataCacheContext'

const Home = () => {
  const { token, user } = useContext(AuthContext);
  const { eventsList, loadEventsList } = useContext(DataCacheContext);
  const navigate = useNavigate();
  const [eventos, setEventos] = useState([]);
  const [categorias, setCategorias] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filtroTipo, setFiltroTipo] = useState('Todos');
  const [filtroCategoria, setFiltroCategoria] = useState('Todas');
  
  useEffect(() => {
    loadEventos();
    loadCategorias();
  }, []);

  const loadEventos = async () => {
    try {
      setLoading(true);
      const list = await loadEventsList(false);
      setEventos(Array.isArray(list) ? list : (eventsList || []));
    } catch (error) {
      console.error('Error al cargar eventos:', error);
      setEventos(Array.isArray(eventsList) ? eventsList : []);
    } finally {
      setLoading(false);
    }
  };

  const loadCategorias = async () => {
    try {
      const response = await categoriasService.getAll();
      // La API devuelve { msg, data, total, filtros_aplicados }
      const categoriasData = response?.data || [];
      setCategorias(categoriasData);
    } catch (error) {
      console.error('Error al cargar categorías:', error);
      setCategorias([]);
    }
  };

  // Función para normalizar el tipo (manejar espacios, guiones bajos y normalizar)
  const normalizarTipo = (tipo) => {
    if (!tipo) return '';
    return tipo.trim().toLowerCase().replace(/[_\s]+/g, ''); // Elimina espacios y guiones bajos
  };

  const eventosFiltrados = eventos.filter(evento => {
    const matchTipo = filtroTipo === 'Todos' || 
      (evento.tipo && normalizarTipo(evento.tipo) === normalizarTipo(filtroTipo));
    const matchCategoria = filtroCategoria === 'Todas' || 
      (evento.categoria?._id || evento.categoria) === filtroCategoria;
    return matchTipo && matchCategoria;
  });

  const getTipoIcono = (tipo) => {
    const tipoNormalizado = normalizarTipo(tipo);
    if (tipoNormalizado === 'recital') return '🎵';
    if (tipoNormalizado === 'eventocultural') return '🎨';
    if (tipoNormalizado === 'taller') return '📚';
    return '🎭';
  };

  const getTipoNombre = (tipo) => {
    if (!tipo) return 'Evento';
    const tipoLower = tipo.toLowerCase();
    if (tipoLower === 'recital') return 'Recital';
    if (tipoLower === 'evento_cultural' || tipoLower === 'eventocultural') return 'Evento Cultural';
    if (tipoLower === 'taller') return 'Taller';
    return tipo; // Si no coincide, devolver el original
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

  return (
    <main className='container'>
      <h1 className="home-title">Lunfardo</h1>
      <p className="subtitle">Descubre recitales, eventos culturales y talleres en la ciudad</p>

      {!token && (
        <div className="welcome-message">
          <p>Bienvenido! Para gestionar eventos, <NavLink to="/login">inicia sesión</NavLink> o <NavLink to="/register">regístrate</NavLink>.</p>
        </div>
      )}

      {token && user && (
        <div className="welcome-message">
          <p>Bienvenido, <strong>{user.nombre || user.name || user.email}</strong>!</p>
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
      </div>

      {loading ? (
        <Loading />
      ) : (
        <>
          <div className="eventos-grid">
            {eventosFiltrados.length === 0 ? (
              <p className="no-events">No hay eventos disponibles con estos filtros</p>
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
                  </div>
                  <button 
                    className="btn-ver-detalle"
                    onClick={() => navigate(`/evento/${evento._id}`)}
                  >
                    Ver detalles
                  </button>
                </div>
              ))
            )}
          </div>
          <div className="eventos-stats">
            <h2>Eventos encontrados: <span>{eventosFiltrados.length}</span></h2>
          </div>
        </>
      )}
    </main>
  )
}

export default Home