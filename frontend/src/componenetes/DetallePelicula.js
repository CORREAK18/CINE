import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useSearchParams } from 'react-router-dom';
import './css/detallepelicula.css';
import { jwtDecode } from "jwt-decode";
const DetallePelicula = () => {
    const [searchParams] = useSearchParams();
    const idPelicula = searchParams.get('id');
    const [pelicula, setPelicula] = useState(null);
    const [resenas, setResenas] = useState([]);
    const [error, setError] = useState(null);
    
    // Estados para el formulario de reseña
    const [nuevaResena, setNuevaResena] = useState({
        TituloResena: '',
        CuerpoResena: '',
        Puntuacion: 1
    });

    useEffect(() => {
        const cargarDetallePelicula = async () => {
            try {
                // Cargar detalles de la película
                const responsePelicula = await axios.get(`http://localhost:5000/peliculas/${idPelicula}`);
                setPelicula(responsePelicula.data);
                // Cargar reseñas de la película
                const responseResenas = await axios.get(`http://localhost:5000/peliculas/${idPelicula}/resenas`);
                setResenas(responseResenas.data);
            } catch (error) {
                setError('Error al cargar los detalles de la película');
                console.error('Error:', error);
            }
        };
        if (idPelicula) {
            cargarDetallePelicula();
        }
    }, [idPelicula]);

    // Función para enviar la reseña
    const handleSubmitResena = async (e) => {
        e.preventDefault();
        
        try {
            const token = localStorage.getItem('token');
            if (!token) {
                alert('Debes iniciar sesión para escribir una reseña');
                return;
            }

            // Corregimos esta parte para usar 'id' en lugar de 'IdUsuario'
            const decodedToken = jwtDecode(token);
            const IdUsuario = decodedToken.id; // Cambiamos aquí para usar 'id'

            const response = await axios.post('http://localhost:5000/resenas', {
                IdPelicula: parseInt(idPelicula),
                IdUsuario,
                TituloResena: nuevaResena.TituloResena,
                CuerpoResena: nuevaResena.CuerpoResena,
                Puntuacion: parseInt(nuevaResena.Puntuacion)
            });
            
            // Limpiar el formulario
            setNuevaResena({
                TituloResena: '',
                CuerpoResena: '',
                Puntuacion: 1
            });

            // Recargar las reseñas
            const responseResenas = await axios.get(`http://localhost:5000/peliculas/${idPelicula}/resenas`);
            setResenas(responseResenas.data);
            
            alert('Reseña enviada exitosamente');
        } catch (error) {
            console.error('Error completo:', error); // Agregamos este log para ver el error completo
            alert(error.response?.data?.mensaje || 'Error al enviar la reseña');
        }
    };

    // Manejar cambios en el formulario
    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setNuevaResena(prev => ({
            ...prev,
            [name]: value
        }));
    };

    if (error) return <div className="error-message">{error}</div>;
    if (!pelicula) return <div>Cargando...</div>;

    return (
        <div className="detalle-pelicula-container">
            <div className="pelicula-header">
                <img
                    src={pelicula.UrlPoster || '/imagenes/peliculaNE.jpg'}
                    alt={pelicula.Titulo}
                    className="detalle-poster"
                />
                <div className="pelicula-info-detalle">
                    <h1>{pelicula.Titulo}</h1>
                    <p className="año-estreno">Año: {pelicula.AnioEstreno}</p>
                    {pelicula.Directore && (
                        <p className="director">
                            Director: {pelicula.Directore.Nombres} {pelicula.Directore.Apellidos}
                        </p>
                    )}
                    <p className="sinopsis">{pelicula.Sinopsis}</p>
                </div>
            </div>

            {/* Formulario para nueva reseña */}
            <div className="nueva-resena-section">
                <h2>Escribir Reseña</h2>
                <form onSubmit={handleSubmitResena} className="formulario-resena">
                    <div className="form-group">
                        <label htmlFor="TituloResena">Título de la reseña:</label>
                        <input
                            type="text"
                            id="TituloResena"
                            name="TituloResena"
                            value={nuevaResena.TituloResena}
                            onChange={handleInputChange}
                            placeholder="Escribe un título para tu reseña"
                            required
                            className="input-titulo"
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="Puntuacion">Puntuación (1-10):</label>
                        <select
                            id="Puntuacion"
                            name="Puntuacion"
                            value={nuevaResena.Puntuacion}
                            onChange={handleInputChange}
                            className="select-puntuacion"
                        >
                            {[1,2,3,4,5,6,7,8,9,10].map(num => (
                                <option key={num} value={num}>{num}</option>
                            ))}
                        </select>
                    </div>

                    <div className="form-group">
                        <label htmlFor="CuerpoResena">Tu reseña:</label>
                        <div className="textarea-container">
                            <textarea
                                id="CuerpoResena"
                                name="CuerpoResena"
                                value={nuevaResena.CuerpoResena}
                                onChange={handleInputChange}
                                placeholder="Escribe tu reseña aquí..."
                                required
                                rows="4"
                                className="textarea-resena"
                            />
                            <button 
                                type="submit" 
                                className="btn-enviar-flecha"
                                title="Enviar reseña"
                            >
                                ➤
                            </button>
                        </div>
                    </div>
                </form>
            </div>

            <div className="seccion-resenas">
                <h2>Reseñas</h2>
                {resenas.length > 0 ? (
                    <div className="lista-resenas">
                        {resenas.map(resena => (
                            <div key={resena.IdResena} className="resena-card">
                                <h3>{resena.Usuario.NombreUsuario}</h3>
                                <h4>{resena.TituloResena}</h4>
                                <p className="puntuacion">Puntuación: {resena.Puntuacion}/10</p>
                                <p className="cuerpo-resena">{resena.CuerpoResena}</p>
                                <p className="fecha-resena">
                                    {new Date(resena.FechaCreacion).toLocaleDateString()}
                                </p>
                            </div>
                        ))}
                    </div>
                ) : (
                    <p>No hay reseñas disponibles para esta película.</p>
                )}
            </div>
        </div>
    );
};

export default DetallePelicula;