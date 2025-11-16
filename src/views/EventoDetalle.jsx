import { useParams, useNavigate } from 'react-router-dom';
import { useState, useEffect, useContext } from 'react';
import DataCacheContext from '../context/DataCacheContext';
import Loading from '../components/Loading';

const EventoDetalle = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { eventsById, getEventById } = useContext(DataCacheContext);
  const [evento, setEvento] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadEvento();
  }, [id]);

  const loadEvento = async () => {
    try {
      setLoading(true);
      // usar caché si existe, sino traer y guardar
      const cached = eventsById?.[id];
      if (cached && cached.descripcion) {
        setEvento(cached);
      } else {
        const ev = await getEventById(id);
        setEvento(ev);
      }
    } catch (error) {
      console.error('Error al cargar evento:', error);
    } finally {
      setLoading(false);
    }
  };

  const normalizarTipo = (tipo) => {
    if (!tipo) return '';
    return tipo.trim().toLowerCase().replace(/[_\s]+/g, '');
  };

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
    return tipo;
  };

  const formatearFecha = (fecha) => {
    if (!fecha) return 'Fecha no especificada';
    try {
      const fechaObj = new Date(fecha);
      if (isNaN(fechaObj.getTime())) return fecha;
      const opciones = { 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric',
        timeZone: 'UTC'
      };
      return fechaObj.toLocaleDateString('es-AR', opciones);
    } catch (error) {
      return fecha;
    }
  };

  const formatearPrecio = (precioObj) => {
    if (precioObj?.esGratuito) return 'Gratis';
    if (typeof precioObj === 'number') {
      if (precioObj === 0 || isNaN(precioObj)) return 'Gratis';
      return `$${precioObj.toLocaleString('es-AR', { minimumFractionDigits: 0, maximumFractionDigits: 2 })}`;
    }
    const monto = precioObj?.monto;
    if (monto === null || monto === undefined || monto === '' || monto === '0' || monto === 0) {
      return 'Gratis';
    }
    const precioNum = typeof monto === 'number' ? monto : parseFloat(monto);
    if (isNaN(precioNum) || precioNum <= 0) return 'Gratis';
    const moneda = precioObj?.moneda || 'ARS';
    const simbolo = moneda === 'ARS' ? '$' : moneda;
    return `${simbolo}${precioNum.toLocaleString('es-AR', { minimumFractionDigits: 0, maximumFractionDigits: 2 })}`;
  };

  if (loading) {
    return (
      <main className="container">
        <Loading />
      </main>
    );
  }

  if (!evento) {
    return (
      <main className="container">
        <h1>Evento no encontrado</h1>
        <button onClick={() => navigate('/')}>Volver al inicio</button>
      </main>
    );
  }

  return (
    <main className="container">
      <div className="detail-header">
        <button onClick={() => navigate(-1)} className="btn-volver">
          ← Volver
        </button>
      </div>
      
      <div className="detail-view">
        <div className="detail-card">
          <h1>{evento.titulo}</h1>
          
          <div className="detail-item">
            <strong>Tipo</strong>
            <span>{getTipoIcono(evento.tipo)} {getTipoNombre(evento.tipo)}</span>
          </div>

          {evento.descripcion && (
            <div className="detail-item">
              <strong>Descripción</strong>
              <p>{evento.descripcion}</p>
            </div>
          )}

          <div className="detail-item">
            <strong>Fecha y Hora</strong>
            <span>{formatearFecha(evento.fecha)} {evento.hora && `a las ${evento.hora}`}</span>
          </div>

          <div className="detail-item">
            <strong>Lugar</strong>
            <span>{evento.ubicacion?.nombre || evento.nombreLugar || 'No especificado'}</span>
          </div>

          {(evento.ubicacion?.direccion || evento.direccion) && (
            <div className="detail-item">
              <strong>Dirección</strong>
              <span>{evento.ubicacion?.direccion || evento.direccion}</span>
            </div>
          )}

          <div className="detail-item">
            <strong>Precio</strong>
            <span>{formatearPrecio(evento.precio || (evento.esGratuito ? { esGratuito: true } : { monto: evento.precio }))}</span>
          </div>

          {evento.categoria && (
            <div className="detail-item">
              <strong>Categoría</strong>
              <span>{evento.categoria.icono} {evento.categoria.nombre}</span>
            </div>
          )}

          {(evento.informacionAdicional?.recomendaciones && evento.informacionAdicional.recomendaciones.length > 0) || evento.recomendaciones ? (
            <div className="detail-item">
              <strong>Recomendaciones</strong>
              <span>{
                evento.informacionAdicional?.recomendaciones 
                  ? (Array.isArray(evento.informacionAdicional.recomendaciones) ? evento.informacionAdicional.recomendaciones.join(', ') : evento.informacionAdicional.recomendaciones)
                  : (Array.isArray(evento.recomendaciones) ? evento.recomendaciones.join(', ') : evento.recomendaciones)
              }</span>
            </div>
          ) : null}

          {(evento.informacionAdicional?.contacto || evento.contacto) && (
            <div className="detail-item">
              <strong>Contacto</strong>
              <span>{evento.informacionAdicional?.contacto || evento.contacto}</span>
            </div>
          )}
        </div>
      </div>
    </main>
  );
};

export default EventoDetalle;

