import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { jwtDecode } from "jwt-decode";
import './css/resenas.css';

const Resenas = () => {
    const [resenas, setResenas] = useState([]);
    const [error, setError] = useState(null);
    const [editando, setEditando] = useState(null);
    const [resenaEditada, setResenaEditada] = useState({
        TituloResena: '',
        CuerpoResena: '',
        Puntuacion: 1
    });

    useEffect(() => {
        cargarResenas();
    }, []);

    const cargarResenas = async () => {
        try {
            const token = localStorage.getItem('token');
            const decodedToken = jwtDecode(token);
            const userId = decodedToken.id;

            const response = await axios.get(`http://localhost:5000/usuarios/${userId}/resenas`);
            setResenas(response.data);
        } catch (error) {
            setError('Error al cargar las reseñas');
            console.error('Error:', error);
        }
    };

    const handleEditar = (resena) => {
        setEditando(resena.IdResena);
        setResenaEditada({
            TituloResena: resena.TituloResena,
            CuerpoResena: resena.CuerpoResena,
            Puntuacion: resena.Puntuacion
        });
    };

    const handleGuardar = async (idResena) => {
        try {
            await axios.put(`http://localhost:5000/resenas/${idResena}`, resenaEditada);
            setEditando(null);
            cargarResenas();
        } catch (error) {
            alert('Error al actualizar la reseña');
            console.error('Error:', error);
        }
    };

    const handleEliminar = async (idResena) => {
        if (window.confirm('¿Estás seguro de que quieres eliminar esta reseña?')) {
            try {
                await axios.delete(`http://localhost:5000/resenas/${idResena}`);
                cargarResenas();
            } catch (error) {
                alert('Error al eliminar la reseña');
                console.error('Error:', error);
            }
        }
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setResenaEditada(prev => ({
            ...prev,
            [name]: value
        }));
    };

    if (error) return <div className="error-message">{error}</div>;

    return (
        <div className="resenas-container">
            <h2>Mis Reseñas</h2>
            <div className="tabla-resenas">
                <table>
                    <thead>
                        <tr>
                            <th>Película</th>
                            <th>Sinopsis</th>
                            <th>Título de Reseña</th>
                            <th>Reseña</th>
                            <th>Puntuación</th>
                            <th>Acciones</th>
                        </tr>
                    </thead>
                    <tbody>
                        {resenas.map(resena => (
                            <tr key={resena.IdResena}>
                                <td>{resena.Pelicula.Titulo}</td>
                                <td className="sinopsis-cell">{resena.Pelicula.Sinopsis}</td>
                                <td>
                                    {editando === resena.IdResena ? (
                                        <input
                                            type="text"
                                            name="TituloResena"
                                            value={resenaEditada.TituloResena}
                                            onChange={handleInputChange}
                                        />
                                    ) : (
                                        resena.TituloResena
                                    )}
                                </td>
                                <td>
                                    {editando === resena.IdResena ? (
                                        <textarea
                                            name="CuerpoResena"
                                            value={resenaEditada.CuerpoResena}
                                            onChange={handleInputChange}
                                        />
                                    ) : (
                                        resena.CuerpoResena
                                    )}
                                </td>
                                <td>
                                    {editando === resena.IdResena ? (
                                        <select
                                            name="Puntuacion"
                                            value={resenaEditada.Puntuacion}
                                            onChange={handleInputChange}
                                        >
                                            {[1,2,3,4,5,6,7,8,9,10].map(num => (
                                                <option key={num} value={num}>{num}</option>
                                            ))}
                                        </select>
                                    ) : (
                                        `${resena.Puntuacion}/10`
                                    )}
                                </td>
                                <td>
                                    {editando === resena.IdResena ? (
                                        <button onClick={() => handleGuardar(resena.IdResena)}>
                                            Guardar
                                        </button>
                                    ) : (
                                        <button onClick={() => handleEditar(resena)}>
                                            Editar
                                        </button>
                                    )}
                                    <button 
                                        className="btn-eliminar"
                                        onClick={() => handleEliminar(resena.IdResena)}
                                    >
                                        Eliminar
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default Resenas;