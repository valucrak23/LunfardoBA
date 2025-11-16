import { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { categoriasService } from '../services/categoriasService';
import Loading from '../components/Loading';
import ConfirmModal from '../components/ConfirmModal';

const Categorias = () => {
  const { token } = useContext(AuthContext);
  const navigate = useNavigate();
  const [categorias, setCategorias] = useState([]);
  const [loading, setLoading] = useState(true);
  const [msg, setMsg] = useState(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [categoriaToDelete, setCategoriaToDelete] = useState(null);


  useEffect(() => {
    if (token) {
      loadCategorias();
    }
  }, [token]);


  const loadCategorias = async () => {
    try {
      setLoading(true);
      const response = await categoriasService.getAll();
      setCategorias(response.data || response || []);
    } catch (error) {
      setMsg('Error al cargar categorías: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (categoria) => {
    if (!categoria) return;
    navigate(`/categoria/editar/${categoria._id}`);
  };

  const handleDelete = (id) => {
    setCategoriaToDelete(id);
    setShowDeleteConfirm(true);
  };

  const handleDeleteConfirm = async () => {
    if (!categoriaToDelete) return;

    try {
      await categoriasService.delete(categoriaToDelete);
      setMsg('Categoría eliminada correctamente');
      loadCategorias();
      setShowDeleteConfirm(false);
      setCategoriaToDelete(null);
    } catch (error) {
      setMsg('Error al eliminar: ' + error.message);
      setShowDeleteConfirm(false);
      setCategoriaToDelete(null);
    }
  };


  if (!token) {
    return (
      <main className="container">
        <h2>Debes iniciar sesión para ver las categorías</h2>
      </main>
    );
  }

  return (
    <main className="container">
      <h1 className="page-title">🏷️ Gestión de Categorías</h1>

      {msg && (
        <div className={`msg ${msg.includes('Error') ? 'error-msg' : 'success-msg'}`}>
          {msg}
        </div>
      )}

      <div className="filtros">
        <button 
          onClick={() => navigate('/categoria/nuevo')}
          className="btn-primary"
        >
          ➕ Nueva Categoría
        </button>
      </div>

      {loading ? (
        <Loading />
      ) : (
        <div className="eventos-grid">
          {categorias.length === 0 ? (
            <p className="no-events">No hay categorías disponibles</p>
          ) : (
            categorias.map(categoria => (
              <div 
                key={categoria._id} 
                className="evento-card-home"
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderRightColor = categoria.color || '#007bff';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderRightColor = 'transparent';
                }}
              >
                <div className="evento-header">
                  <span className="evento-icono" style={{ color: categoria.color || '#C2185B' }}>
                    {categoria.icono || '🏷️'}
                  </span>
                  <h3>{categoria.nombre}</h3>
                </div>
                <p className="evento-tipo">Categoría</p>
                <div className="evento-info-basico">
                  <p>{categoria.descripcion}</p>
                </div>
                <div className="evento-actions">
                  <div>
                    <button onClick={() => handleEdit(categoria)} className="btn-edit">Editar</button>
                    <button onClick={() => handleDelete(categoria._id)} className="btn-delete">Eliminar</button>
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
          setCategoriaToDelete(null);
        }}
        onConfirm={handleDeleteConfirm}
        title="Eliminar Categoría"
        message="¿Estás seguro de que deseas eliminar esta categoría? Esta acción no se puede deshacer."
      />
    </main>
  );
};

export default Categorias;

