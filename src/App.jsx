import { BrowserRouter, Routes, Route } from 'react-router-dom'
import './App.css'

import MainLayout from './components/MainLayout'
import Home from './views/Home'
import Login from './views/Login'
import Register from './views/Register'
import Eventos from './views/Eventos'
import Categorias from './views/Categorias'
import EventoDetalle from './views/EventoDetalle'
import EventoForm from './views/EventoForm'
import CategoriaForm from './views/CategoriaForm'
import NotFound from './views/NotFound'
import { DataCacheProvider } from './context/DataCacheContext'

function App() {
  return (
    <>
      <BrowserRouter>
        <DataCacheProvider>
          <Routes>
            <Route element={ <MainLayout />}>
              <Route path='/' element={ <Home />} />
              <Route path='/login'  element={ <Login /> }/>
              <Route path='/register'  element={ <Register /> }/>
              <Route path='/eventos'  element={ <Eventos /> }/>
              <Route path='/evento/nuevo' element={ <EventoForm /> }/>
              <Route path='/evento/editar/:id' element={ <EventoForm /> }/>
              <Route path='/evento/:id' element={ <EventoDetalle /> }/>
              <Route path='/categorias'  element={ <Categorias /> }/>
              <Route path='/categoria/nuevo' element={ <CategoriaForm /> }/>
              <Route path='/categoria/editar/:id' element={ <CategoriaForm /> }/>
              <Route path='*' element={ <NotFound /> } />
            </Route>
          </Routes>
        </DataCacheProvider>
      </BrowserRouter>
    </>
  )
}

export default App
