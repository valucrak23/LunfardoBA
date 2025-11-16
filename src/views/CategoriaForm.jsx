import { useParams, useNavigate } from 'react-router-dom';
import { useState, useEffect, useContext, useRef } from 'react';
import { AuthContext } from '../context/AuthContext';
import { categoriasService } from '../services/categoriasService';
import Loading from '../components/Loading';

const CategoriaForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { token } = useContext(AuthContext);
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState(null);
  const [showIconPicker, setShowIconPicker] = useState(false);
  const iconInputRef = useRef(null);
  const iconPickerRef = useRef(null);
  const isEditing = !!id;

  const todosLosIconos = [
    '🎵', '🎨', '📚', '🎭', '🎪', '🎬', '🎤', '🎸', '🎹', '🎺',
    '🎻', '🥁', '🎧', '🎮', '🏀', '⚽', '🎾', '🏊', '🚴', '🏃',
    '🧘', '🍕', '🍔', '🍰', '☕', '🍷', '🎂', '🎁', '🎈', '🎉',
    '🌟', '⭐', '💫', '🔥', '💡', '🎯', '🏆', '🎖️', '📱', '💻',
    '📷', '🎥', '📺', '📻', '🎙️', '🎚️', '🎛️', '🎞️', '📽️', '🎬',
    '🌍', '🗺️', '🏛️', '⛪', '🕌', '🕍', '🏰', '🏯', '🗼', '🗽',
    '🌆', '🌇', '🌃', '🌉', '🌊', '⛰️', '🏔️', '🌋', '🏕️', '🏖️',
    '🏝️', '🏜️', '🌴', '🌵', '🌲', '🌳', '🌱', '🌿', '🍀', '☘️',
    '🌾', '🌷', '🌹', '🌺', '🌻', '🌼', '🌸', '🌎', '🌏', '🌍'
  ];

  const obtenerIconosAleatorios = () => {
    const iconosAleatorios = [];
    const iconosDisponibles = [...todosLosIconos];
    for (let i = 0; i < 5; i++) {
      const indiceAleatorio = Math.floor(Math.random() * iconosDisponibles.length);
      iconosAleatorios.push(iconosDisponibles[indiceAleatorio]);
      iconosDisponibles.splice(indiceAleatorio, 1);
    }
    return iconosAleatorios;
  };

  const [iconosRecomendados, setIconosRecomendados] = useState(obtenerIconosAleatorios());

  const [formData, setFormData] = useState({
    nombre: '',
    descripcion: '',
    icono: '',
    color: '#000000',
  });

  useEffect(() => {
    if (!token) {
      navigate('/login');
      return;
    }
    
    if (isEditing) {
      loadCategoria();
    }
  }, [id, token]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        iconPickerRef.current &&
        !iconPickerRef.current.contains(event.target) &&
        iconInputRef.current &&
        !iconInputRef.current.contains(event.target)
      ) {
        setShowIconPicker(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const loadCategoria = async () => {
    try {
      setLoading(true);
      const response = await categoriasService.getById(id);
      const categoria = response?.data || response;
      
      setFormData({
        nombre: categoria.nombre || '',
        descripcion: categoria.descripcion || '',
        icono: categoria.icono || '',
        color: categoria.color || '#000000',
      });
    } catch (error) {
      console.error('Error al cargar categoría:', error);
      setMsg('Error al cargar la categoría');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const validateForm = () => {
    if (!formData.nombre.trim()) {
      setMsg('El nombre es requerido');
      return false;
    }
    if (!formData.descripcion.trim()) {
      setMsg('La descripción es requerida');
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
      if (isEditing) {
        await categoriasService.update(id, formData);
        setMsg('Categoría actualizada correctamente');
      } else {
        await categoriasService.create(formData);
        setMsg('Categoría creada correctamente');
      }

      setTimeout(() => {
        navigate('/categorias');
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
        <button onClick={() => navigate('/categorias')} className="btn-volver">
          ← Volver
        </button>
      </div>

      <div className="detail-view">
        <div className="detail-card">
          <h1>{isEditing ? 'Editar Categoría' : 'Nueva Categoría'}</h1>

          {msg && (
            <div className={`msg ${msg.includes('Error') ? 'error-msg' : 'success-msg'}`}>
              {msg}
            </div>
          )}

          <form onSubmit={handleSubmit} className="categoria-form">
            <div className="detail-item">
              <strong>Nombre *</strong>
              <input
                type="text"
                id="nombre"
                name="nombre"
                value={formData.nombre}
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
              <strong>Icono y Color</strong>
              <div className="form-row icono-color-row">
                <div className="icono-input-wrapper">
                  <input
                    ref={iconInputRef}
                    type="text"
                    id="icono"
                    name="icono"
                    value={formData.icono}
                    onChange={handleInputChange}
                    onFocus={() => {
                      setIconosRecomendados(obtenerIconosAleatorios());
                      setShowIconPicker(true);
                    }}
                    placeholder="Ej: 🎵"
                    maxLength="2"
                  />
                  {showIconPicker && (
                    <div ref={iconPickerRef} className="icon-picker">
                      <div className="icon-picker-header">
                        <span>Iconos recomendados</span>
                        <button 
                          type="button"
                          className="icon-picker-close"
                          onClick={() => setShowIconPicker(false)}
                        >
                          ✕
                        </button>
                      </div>
                      <div className="icon-picker-grid">
                        {iconosRecomendados.map((icono, index) => (
                          <button
                            key={index}
                            type="button"
                            className="icon-picker-item"
                            onClick={() => {
                              setFormData({ ...formData, icono });
                              setShowIconPicker(false);
                            }}
                          >
                            {icono}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
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
                  placeholder="#000000"
                />
              </div>
            </div>

            <div className="form-actions">
              <button 
                type="button" 
                onClick={() => navigate('/categorias')}
                className="btn-secondary"
              >
                Cancelar
              </button>
              <button type="submit" className="btn-primary">
                {isEditing ? 'Actualizar' : 'Crear Categoría'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </main>
  );
};

export default CategoriaForm;

