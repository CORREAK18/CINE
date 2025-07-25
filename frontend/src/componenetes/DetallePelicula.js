// src/componenetes/DetallePelicula.js
import React, { useState, useEffect, useMemo } from 'react';
import axios from 'axios';
import { useSearchParams } from 'react-router-dom';
import './css/detallepelicula.css';
import { jwtDecode } from 'jwt-decode';
import { Star, StarFill } from 'react-bootstrap-icons';
import { Badge } from 'react-bootstrap';

const DetallePelicula = () => {
    const [searchParams] = useSearchParams();
    const idPelicula = searchParams.get('id');
    const [pelicula, setPelicula] = useState(null);
    const [resenas, setResenas] = useState([]);
    const [error, setError] = useState(null);
    const [nuevaResena, setNuevaResena] = useState({
        TituloResena: '',
        CuerpoResena: '',
        Puntuacion: 1
    });

    useEffect(() => {
        const cargarDetallePelicula = async () => {
            try {
                const responsePelicula = await axios.get(`http://localhost:5000/peliculas/${idPelicula}`);
                console.log('Datos de la película:', responsePelicula.data); // Log temporal para depuración
                setPelicula(responsePelicula.data);
                const responseResenas = await axios.get(`http://localhost:5000/peliculas/${idPelicula}/resenas`);
                setResenas(responseResenas.data);
            } catch (err) {
                setError('Error al cargar los detalles de la película');
                console.error(err);
            }
        };
        if (idPelicula) cargarDetallePelicula();
    }, [idPelicula]);

    // Calcular promedio de puntuaciones
    const promedio = useMemo(() => {
        if (resenas.length === 0) return 0;
        const suma = resenas.reduce((acc, r) => acc + r.Puntuacion, 0);
        return suma / resenas.length;
    }, [resenas]);

    // Renderizar estrellas (hasta 10)
    const renderStars = (puntuacion) => {
        const stars = [];
        for (let i = 1; i <= 10; i++) {
            stars.push(
                i <= puntuacion ?
                    <StarFill key={i} className="text-warning me-1" size={16} /> :
                    <Star key={i} className="text-muted me-1" size={16} />
            );
        }
        return stars;
    };

    const handleSubmitResena = async (e) => {
        e.preventDefault();
        try {
            const token = localStorage.getItem('token');
            if (!token) {
                alert('Debes iniciar sesión para escribir una reseña');
                return;
            }
            const decoded = jwtDecode(token);
            const IdUsuario = decoded.id;
            await axios.post('http://localhost:5000/resenas', {
                IdPelicula: parseInt(idPelicula, 10),
                IdUsuario,
                TituloResena: nuevaResena.TituloResena,
                CuerpoResena: nuevaResena.CuerpoResena,
                Puntuacion: parseInt(nuevaResena.Puntuacion, 10)
            });
            setNuevaResena({ TituloResena: '', CuerpoResena: '', Puntuacion: 1 });
            const responseResenas = await axios.get(`http://localhost:5000/peliculas/${idPelicula}/resenas`);
            const respuesta = await axios.get(`http://localhost:5000/peliculas/${idPelicula}/actualizar-promedio`);
            setResenas(responseResenas.data);
            alert('Reseña enviada exitosamente');
        } catch (err) {
            console.error(err);
            alert(err.response?.data?.mensaje || 'Error al enviar la reseña');
        }
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setNuevaResena(prev => ({ ...prev, [name]: value }));
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
                    <p className="año-estreno">Año :{pelicula.AnioEstreno}</p>
                    {pelicula.Director && (
                        <p className="director">
                            Director: {pelicula.Director.Nombres} {pelicula.Director.Apellidos}
                        </p>
                    )}
                    <p className="sinopsis">{pelicula.Sinopsis}</p>
                    {/* Géneros */}
                    {pelicula.Generos && pelicula.Generos.length > 0 && (
                        <div className="generos-list mb-3">
                            {pelicula.Generos.map(genero => (
                                <Badge key={genero.IdGenero} bg="secondary" className="me-1">
                                    {genero.NombreGenero}
                                </Badge>
                            ))}
                        </div>
                    )}

                    <div className="calificacion-promedio d-flex align-items-center mt-3">
                        <strong className="me-2">Promedio:</strong>
                        <Badge bg="info" className="me-2">
                            {promedio.toFixed(1)}/10
                        </Badge>
                        <div className="d-flex">
                            {renderStars(Math.round(promedio))}
                        </div>
                    </div>
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
                            {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(num => (
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
                                <div className="d-flex align-items-center mb-1">
                                    <Badge bg="secondary" className="me-2">
                                        {resena.Puntuacion}/10
                                    </Badge>
                                    <div className="d-flex">
                                        {renderStars(resena.Puntuacion)}
                                    </div>
                                </div>
                                <h4>{resena.TituloResena}</h4>
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
