import { createContext, useCallback, useEffect, useMemo, useState } from 'react';
import { eventosService } from '../services/eventosService';

const DataCacheContext = createContext();

const EVENTS_LIST_KEY = 'events_list_cache_v1';
const EVENTS_BY_ID_KEY = 'events_by_id_cache_v1';

const readSessionJSON = (key, fallback) => {
  try {
    const raw = sessionStorage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw);
  } catch {
    return fallback;
  }
};

const writeSessionJSON = (key, value) => {
  try {
    sessionStorage.setItem(key, JSON.stringify(value));
  } catch {
    // ignore quota or serialization errors
  }
};

export const DataCacheProvider = ({ children }) => {
  const [eventsList, setEventsList] = useState(() => readSessionJSON(EVENTS_LIST_KEY, []));
  const [eventsById, setEventsById] = useState(() => readSessionJSON(EVENTS_BY_ID_KEY, {}));
  const [loadingEvents, setLoadingEvents] = useState(false);
  const [errorEvents, setErrorEvents] = useState(null);

  // Persist to sessionStorage whenever changes
  useEffect(() => {
    writeSessionJSON(EVENTS_LIST_KEY, eventsList);
  }, [eventsList]);

  useEffect(() => {
    writeSessionJSON(EVENTS_BY_ID_KEY, eventsById);
  }, [eventsById]);

  // Cargar listado de eventos (si no está en caché)
  const loadEventsList = useCallback(async (force = false) => {
    if (!force && Array.isArray(eventsList) && eventsList.length > 0) {
      return eventsList;
    }
    try {
      setLoadingEvents(true);
      setErrorEvents(null);
      const response = await eventosService.getAll();
      const list = response?.data || response || [];
      setEventsList(list);
      // también hidratar el mapa por id con datos básicos
      setEventsById(prev => {
        const next = { ...prev };
        list.forEach(ev => {
          if (ev && ev._id && !next[ev._id]) {
            next[ev._id] = ev;
          }
        });
        return next;
      });
      return list;
    } catch (err) {
      setErrorEvents(err?.message || 'Error al cargar eventos');
      return [];
    } finally {
      setLoadingEvents(false);
    }
  }, [eventsList]);

  // Obtener un evento por id: usa caché; si falta algún campo lo trae y lo guarda
  const getEventById = useCallback(async (id, forceRefresh = false) => {
    if (!id) return null;
    const cached = eventsById[id];
    // Si forceRefresh es true o el evento no tiene categorías populadas, traer datos frescos
    if (!forceRefresh && cached && cached.descripcion && cached.ubicacion) {
      // Verificar si tiene categorías populadas (objetos con nombre)
      const tieneCategoriasPopuladas = cached.categorias?.some(cat => 
        cat && typeof cat === 'object' && cat._id && cat.nombre
      ) || cached.categoria?.nombre;
      if (tieneCategoriasPopuladas || !cached.categorias) {
        return cached;
      }
    }
    try {
      const response = await eventosService.getById(id);
      const ev = response?.data || response;
      setEventsById(prev => ({ ...prev, [id]: { ...(prev[id] || {}), ...ev } }));
      // y si no estaba en la lista, agregarlo superficialmente
      setEventsList(prev => {
        if (!Array.isArray(prev)) return [ev];
        const idx = prev.findIndex(e => e._id === id);
        if (idx === -1) return [...prev, ev];
        // Actualizar el evento en la lista con datos frescos
        const next = [...prev];
        next[idx] = { ...next[idx], ...ev };
        return next;
      });
      return ev;
    } catch (err) {
      throw err;
    }
  }, [eventsById]);

  const value = useMemo(() => ({
    eventsList,
    eventsById,
    loadingEvents,
    errorEvents,
    loadEventsList,
    getEventById,
    // util para invalidar manualmente si hiciste un CRUD
    invalidateEvents: () => {
      setEventsList([]);
    },
    upsertEvent: (ev) => {
      if (!ev || !ev._id) return;
      setEventsById(prev => ({ ...prev, [ev._id]: { ...(prev[ev._id] || {}), ...ev } }));
      setEventsList(prev => {
        const idx = Array.isArray(prev) ? prev.findIndex(e => e._id === ev._id) : -1;
        if (idx === -1) return [...(prev || []), ev];
        const next = [...prev];
        next[idx] = { ...next[idx], ...ev };
        return next;
      });
    },
    removeEvent: (id) => {
      setEventsList(prev => (Array.isArray(prev) ? prev.filter(e => e._id !== id) : prev));
      setEventsById(prev => {
        const { [id]: _, ...rest } = prev || {};
        return rest;
      });
    },
  }), [eventsList, eventsById, loadingEvents, errorEvents, loadEventsList, getEventById]);

  return (
    <DataCacheContext.Provider value={value}>
      {children}
    </DataCacheContext.Provider>
  );
};

export default DataCacheContext;

