import React from 'react';
import axios from 'axios';
import { useState, useEffect } from 'react';
import './css/peliculasusuario.css';

const PeliculasUsuario = () => {
    const [peliculas, setPeliculas] = useState([]);
    const [error, setError] = useState(null);

    const cargarPeliculas = async () => {
        try {
            const response = await axios.get('http://localhost:5000/peliculas');
            setPeliculas(response.data);
        } catch (error) {
            setError('Error al cargar las películas');
            console.error('Error:', error);
        }
    };

    // Función para manejar el clic del botón
    const handleVerDetalle = (idPelicula) => {
        window.location.href = `/detalle-pelicula?id=${idPelicula}`; // Navegar a la página de detalle
    };

    useEffect(() => {
        cargarPeliculas();
    }, []);

    return (
        <div className="peliculas-container">
            <h2>Catálogo de Películas</h2>
            {error && <div className="error-message">{error}</div>}
            <div className="peliculas-grid">
                {peliculas.map(pelicula => (
                    <div key={pelicula.IdPelicula} className="pelicula-card">
                        <div className="imagen-container">
                            <img
                                className="pelicula-poster"
                                src={pelicula.UrlPoster || '/imagenes/peliculaNE.jpg'}
                                alt={pelicula.Titulo}
                            />
                        </div>
                        <div className="pelicula-info">
                            <h3>{pelicula.Titulo}</h3>
                            <p className="año">Año: {pelicula.AnioEstreno}</p>
                            {pelicula.Director && (
                                <p className="director">
                                    Director: {pelicula.Director.Nombres} {pelicula.Director.Apellidos}
                                </p>
                            )}
                            <button 
                                className="btn-ver-detalle"
                                onClick={() => handleVerDetalle(pelicula.IdPelicula)}
                            >
                                Ver Detalle
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default PeliculasUsuario;