import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import ReporteVentas from './ReporteVentas'
import Inicio from "./Inicio";
import Footer from "./Footer";
import Header from "./Header";
import Menu from './Menu';
import Login from './Login';
import Precios from './Precios';
import Principal from '../App';
import PeliculasUsuario from './PeliculasUsuario';
import DetallePelicula from './DetallePelicula';
import Resenas from './Resenas';

import { jwtDecode } from 'jwt-decode';

function App() {
    const isAuthenticated = localStorage.getItem('token');

    const checkRole = (allowedRoles) => {
        if (!isAuthenticated) return false;
        try {
            const decodedToken = jwtDecode(isAuthenticated);
            return allowedRoles.includes(decodedToken.rol);
        } catch (error) {
            console.error('Error verificando rol:', error);
            return false;
        }
    };

    const isAdmin = () => checkRole(['Administrador']);
    
    const isUser = () => checkRole(['usuario']);

    return (
        <Router>
            {isAuthenticated && <Header />}
            {isAuthenticated && <Menu />}
            <Routes>
                {/* Rutas públicas */}
                <Route path="/" element={isAuthenticated ? <Navigate to="/inicio" /> : <Login />} />
                <Route path="/inicio" element={isAuthenticated ? <Inicio /> : <Navigate to="/" />} />
                <Route path="/menu" element={isAuthenticated ? <Principal /> : <Navigate to="/" />} />
                
                
                {/* Rutas para usuario */}
                <Route path="/peliculas" element={isUser() ? <PeliculasUsuario /> : <Navigate to="/" />} />
                <Route path="/detalle-pelicula" element={isUser() ? <DetallePelicula /> : <Navigate to="/" />} />
                <Route path="/mis-resenas" element={isUser() ? <Resenas /> : <Navigate to="/" />} />
                
                {/* Rutas para Admin */}
                <Route path="/admin/usuarios" element={isAdmin() ? <ReporteVentas /> : <Navigate to="/" />} />

                {/* Rutas heredadas del sistema anterior */}
                <Route path="/Precios" element={isAuthenticated ? <Precios /> : <Navigate to="/" />} />
                <Route path="/ReporteVentas" element={isAuthenticated ? <ReporteVentas /> : <Navigate to="/" />} />
            </Routes>
            {isAuthenticated && <Footer />}
        </Router>
    );
}

export default App;


