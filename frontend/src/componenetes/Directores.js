import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Table, Button, Form, Modal } from 'react-bootstrap';
import './css/directores.css';

const Directores = () => {
    const [directores, setDirectores] = useState([]);
    const [showModal, setShowModal] = useState(false);
    const [modalMode, setModalMode] = useState('crear'); // 'crear' o 'editar'
    const [directorSeleccionado, setDirectorSeleccionado] = useState(null);
    const [formData, setFormData] = useState({
        Nombres: '',
        Apellidos: '',
        FechaNacimiento: ''
    });
    const [error, setError] = useState('');

    const token = localStorage.getItem('token');

    useEffect(() => {
        cargarDirectores();
    }, []);

    const cargarDirectores = async () => {
        try {
            const response = await axios.get('http://localhost:5000/directores', {
                headers: { Authorization: `Bearer ${token}` }
            });
            setDirectores(response.data);
        } catch (error) {
            console.error('Error al cargar directores:', error);
            setError('Error al cargar la lista de directores');
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (modalMode === 'crear') {
                await axios.post('http://localhost:5000/directores', formData, {
                    headers: { Authorization: `Bearer ${token}` }
                });
            } else {
                await axios.put(`http://localhost:5000/directores/${directorSeleccionado.IdDirector}`, formData, {
                    headers: { Authorization: `Bearer ${token}` }
                });
            }
            setShowModal(false);
            cargarDirectores();
            limpiarFormulario();
        } catch (error) {
            console.error('Error:', error);
            setError(error.response?.data?.mensaje || 'Error en la operación');
        }
    };

    const handleEliminar = async (id) => {
        if (window.confirm('¿Está seguro de eliminar este director?')) {
            try {
                await axios.delete(`http://localhost:5000/directores/${id}`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                cargarDirectores();
            } catch (error) {
                console.error('Error:', error);
                setError(error.response?.data?.mensaje || 'Error al eliminar el director');
            }
        }
    };

    const handleEditar = (director) => {
        setDirectorSeleccionado(director);
        setFormData({
            Nombres: director.Nombres,
            Apellidos: director.Apellidos,
            FechaNacimiento: director.FechaNacimiento ? director.FechaNacimiento.split('T')[0] : ''
        });
        setModalMode('editar');
        setShowModal(true);
    };

    const handleNuevo = () => {
        setModalMode('crear');
        limpiarFormulario();
        setShowModal(true);
    };

    const limpiarFormulario = () => {
        setFormData({
            Nombres: '',
            Apellidos: '',
            FechaNacimiento: ''
        });
        setDirectorSeleccionado(null);
        setError('');
    };

    const formatearFecha = (fecha) => {
        if (!fecha) return 'No especificada';
        return new Date(fecha).toLocaleDateString();
    };

    return (
        <div className="directores-container">
            <div className="directores-header">
                <h2>Gestión de Directores</h2>
                <Button variant="primary" onClick={handleNuevo}>
                    Nuevo Director
                </Button>
            </div>

            {error && <div className="alert alert-danger">{error}</div>}

            <Table striped bordered hover responsive>
                <thead>
                    <tr>
                        <th>Nombres</th>
                        <th>Apellidos</th>
                        <th>Fecha de Nacimiento</th>
                        <th>Acciones</th>
                    </tr>
                </thead>
                <tbody>
                    {directores.map(director => (
                        <tr key={director.IdDirector}>
                            <td>{director.Nombres}</td>
                            <td>{director.Apellidos}</td>
                            <td>{formatearFecha(director.FechaNacimiento)}</td>
                            <td>
                                <Button 
                                    variant="info" 
                                    size="sm" 
                                    onClick={() => handleEditar(director)}
                                    className="me-2"
                                >
                                    Editar
                                </Button>
                                <Button 
                                    variant="danger" 
                                    size="sm" 
                                    onClick={() => handleEliminar(director.IdDirector)}
                                >
                                    Eliminar
                                </Button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </Table>

            <Modal show={showModal} onHide={() => setShowModal(false)}>
                <Modal.Header closeButton>
                    <Modal.Title>
                        {modalMode === 'crear' ? 'Nuevo Director' : 'Editar Director'}
                    </Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Form onSubmit={handleSubmit}>
                        <Form.Group className="mb-3">
                            <Form.Label>Nombres</Form.Label>
                            <Form.Control
                                type="text"
                                value={formData.Nombres}
                                onChange={(e) => setFormData({...formData, Nombres: e.target.value})}
                                required
                            />
                        </Form.Group>

                        <Form.Group className="mb-3">
                            <Form.Label>Apellidos</Form.Label>
                            <Form.Control
                                type="text"
                                value={formData.Apellidos}
                                onChange={(e) => setFormData({...formData, Apellidos: e.target.value})}
                                required
                            />
                        </Form.Group>

                        <Form.Group className="mb-3">
                            <Form.Label>Fecha de Nacimiento</Form.Label>
                            <Form.Control
                                type="date"
                                value={formData.FechaNacimiento}
                                onChange={(e) => setFormData({...formData, FechaNacimiento: e.target.value})}
                            />
                        </Form.Group>

                        <div className="d-flex justify-content-end">
                            <Button variant="secondary" onClick={() => setShowModal(false)} className="me-2">
                                Cancelar
                            </Button>
                            <Button variant="primary" type="submit">
                                {modalMode === 'crear' ? 'Crear' : 'Guardar'}
                            </Button>
                        </div>
                    </Form>
                </Modal.Body>
            </Modal>
        </div>
    );
};

export default Directores;
