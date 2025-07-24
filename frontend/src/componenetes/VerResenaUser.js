import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Table, Button } from 'react-bootstrap';
import { useParams, useNavigate } from 'react-router-dom';
import './css/gestionUsuarios.css';

const VerResenaUser = () => {
    const [resenas, setResenas] = useState([]);
    const [usuario, setUsuario] = useState(null);
    const [error, setError] = useState('');
    const { id } = useParams();
    const navigate = useNavigate();
    const token = localStorage.getItem('token');

    useEffect(() => {
        cargarResenas();
    }, [id]);

    const cargarResenas = async () => {
        try {
            const response = await axios.get(`http://localhost:5000/usuarios/${id}/resenas`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setResenas(response.data);
            if (response.data.length > 0) {
                setUsuario(response.data[0].Usuario);
            }
        } catch (error) {
            console.error('Error al cargar reseñas:', error);
            setError('Error al cargar las reseñas del usuario');
        }
    };

    const formatearFecha = (fecha) => {
        return new Date(fecha).toLocaleDateString('es-ES', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    };

    return (
        <div className="gestion-usuarios-container">
            <div className="gestion-usuarios-header">
                <h2>Reseñas del Usuario: {usuario?.NombreUsuario}</h2>
                <Button variant="secondary" onClick={() => navigate('/admin/usuarios')}>
                    Volver a Usuarios
                </Button>
            </div>

            {error && <div className="alert alert-danger">{error}</div>}

            {resenas.length === 0 ? (
                <div className="alert alert-info">
                    Este usuario no ha realizado ninguna reseña.
                </div>
            ) : (
                <Table striped bordered hover responsive>
                    <thead>
                        <tr>
                            <th>Película</th>
                            <th>Título de Reseña</th>
                            <th>Contenido</th>
                            <th>Puntuación</th>
                            <th>Fecha</th>
                            <th>Estado</th>
                        </tr>
                    </thead>
                    <tbody>
                        {resenas.map(resena => (
                            <tr key={resena.IdResena}>
                                <td>{resena.Pelicula.Titulo}</td>
                                <td>{resena.TituloResena}</td>
                                <td>{resena.CuerpoResena}</td>
                                <td>
                                    <span className="puntuacion">
                                        {resena.Puntuacion}/10
                                    </span>
                                </td>
                                <td>{formatearFecha(resena.FechaCreacion)}</td>
                                <td>
                                    <span className={`estado-badge ${resena.Estado === 'Realizada' ? 'activo' : 'inactivo'}`}>
                                        {resena.Estado}
                                    </span>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </Table>
            )}
        </div>
    );
};

export default VerResenaUser;
