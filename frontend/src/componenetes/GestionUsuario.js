import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Table, Button, Modal } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import './css/gestionUsuarios.css';

const GestionUsuario = () => {
    const [usuarios, setUsuarios] = useState([]);
    const [error, setError] = useState('');
    const [showModal, setShowModal] = useState(false);
    const [usuarioSeleccionado, setUsuarioSeleccionado] = useState(null);
    const navigate = useNavigate();
    const token = localStorage.getItem('token');

    useEffect(() => {
        cargarUsuarios();
    }, []);

    const cargarUsuarios = async () => {
        try {
            const response = await axios.get('http://localhost:5000/admin/usuarios', {
                headers: { Authorization: `Bearer ${token}` }
            });
            setUsuarios(response.data);
        } catch (error) {
            console.error('Error al cargar usuarios:', error);
            setError('Error al cargar la lista de usuarios');
        }
    };

    const handleVerResenas = (idUsuario) => {
        navigate(`/admin/ver-resenas-usuario/${idUsuario}`);
    };

    const handleCambiarEstado = async () => {
        try {
            await axios.put(`http://localhost:5000/admin/usuarios/${usuarioSeleccionado.IdUsuario}/estado`, {}, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setShowModal(false);
            cargarUsuarios();
        } catch (error) {
            console.error('Error:', error);
            setError(error.response?.data?.mensaje || 'Error al cambiar el estado del usuario');
        }
    };

    const confirmarCambioEstado = (usuario) => {
        setUsuarioSeleccionado(usuario);
        setShowModal(true);
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
                <h2>Gestión de Usuarios</h2>
            </div>

            {error && <div className="alert alert-danger">{error}</div>}

            <Table striped bordered hover responsive>
                <thead>
                    <tr>
                        <th>Usuario</th>
                        <th>Correo</th>
                        <th>Rol</th>
                        <th>Estado</th>
                        <th>Fecha de Registro</th>
                        <th>Acciones</th>
                    </tr>
                </thead>
                <tbody>
                    {usuarios.map(usuario => (
                        <tr key={usuario.IdUsuario}>
                            <td>{usuario.NombreUsuario}</td>
                            <td>{usuario.Correo}</td>
                            <td>{usuario.Rol.NombreRol}</td>
                            <td>
                                <span className={`estado-badge ${usuario.EstaActivo ? 'activo' : 'inactivo'}`}>
                                    {usuario.EstaActivo ? 'Activo' : 'Inactivo'}
                                </span>
                            </td>
                            <td>{formatearFecha(usuario.FechaRegistro)}</td>
                            <td>
                                <Button 
                                    variant="info" 
                                    size="sm" 
                                    onClick={() => handleVerResenas(usuario.IdUsuario)}
                                    className="me-2"
                                >
                                    Ver Reseñas
                                </Button>
                                <Button 
                                    variant={usuario.EstaActivo ? "danger" : "success"} 
                                    size="sm" 
                                    onClick={() => confirmarCambioEstado(usuario)}
                                >
                                    {usuario.EstaActivo ? 'Dar de Baja' : 'Activar'}
                                </Button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </Table>

            <Modal show={showModal} onHide={() => setShowModal(false)}>
                <Modal.Header closeButton>
                    <Modal.Title>Confirmar Acción</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    {usuarioSeleccionado && (
                        <p>¿Está seguro que desea {usuarioSeleccionado.EstaActivo ? 'dar de baja' : 'activar'} al usuario {usuarioSeleccionado.NombreUsuario}?</p>
                    )}
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={() => setShowModal(false)}>
                        Cancelar
                    </Button>
                    <Button 
                        variant={usuarioSeleccionado?.EstaActivo ? "danger" : "success"} 
                        onClick={handleCambiarEstado}
                    >
                        Confirmar
                    </Button>
                </Modal.Footer>
            </Modal>
        </div>
    );
};

export default GestionUsuario;
