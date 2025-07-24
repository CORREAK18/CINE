import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Table, Button, Form, Modal } from 'react-bootstrap';
import './css/actores.css';

const Actores = () => {
    const [actores, setActores] = useState([]);
    const [showModal, setShowModal] = useState(false);
    const [modalMode, setModalMode] = useState('crear'); // 'crear' o 'editar'
    const [actorSeleccionado, setActorSeleccionado] = useState(null);
    const [formData, setFormData] = useState({
        Nombres: '',
        Apellidos: '',
        FechaNacimiento: ''
    });
    const [error, setError] = useState('');

    const token = localStorage.getItem('token');

    useEffect(() => {
        cargarActores();
    }, []);

    const cargarActores = async () => {
        try {
            const response = await axios.get('http://localhost:5000/actores', {
                headers: { Authorization: `Bearer ${token}` }
            });
            setActores(response.data);
        } catch (error) {
            console.error('Error al cargar actores:', error);
            setError('Error al cargar la lista de actores');
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (modalMode === 'crear') {
                await axios.post('http://localhost:5000/actores', formData, {
                    headers: { Authorization: `Bearer ${token}` }
                });
            } else {
                await axios.put(`http://localhost:5000/actores/${actorSeleccionado.IdActor}`, formData, {
                    headers: { Authorization: `Bearer ${token}` }
                });
            }
            setShowModal(false);
            cargarActores();
            limpiarFormulario();
        } catch (error) {
            console.error('Error:', error);
            setError(error.response?.data?.mensaje || 'Error en la operación');
        }
    };

    const handleEliminar = async (id) => {
        if (window.confirm('¿Está seguro de eliminar este actor?')) {
            try {
                await axios.delete(`http://localhost:5000/actores/${id}`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                cargarActores();
            } catch (error) {
                console.error('Error:', error);
                setError(error.response?.data?.mensaje || 'Error al eliminar el actor');
            }
        }
    };

    const handleEditar = (actor) => {
        setActorSeleccionado(actor);
        setFormData({
            Nombres: actor.Nombres,
            Apellidos: actor.Apellidos,
            FechaNacimiento: actor.FechaNacimiento ? actor.FechaNacimiento.split('T')[0] : ''
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
        setActorSeleccionado(null);
        setError('');
    };

    const formatearFecha = (fecha) => {
        if (!fecha) return 'No especificada';
        return new Date(fecha).toLocaleDateString();
    };

    return (
        <div className="actores-container">
            <div className="actores-header">
                <h2>Gestión de Actores</h2>
                <Button variant="primary" onClick={handleNuevo}>
                    Nuevo Actor
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
                    {actores.map(actor => (
                        <tr key={actor.IdActor}>
                            <td>{actor.Nombres}</td>
                            <td>{actor.Apellidos}</td>
                            <td>{formatearFecha(actor.FechaNacimiento)}</td>
                            <td>
                                <Button 
                                    variant="info" 
                                    size="sm" 
                                    onClick={() => handleEditar(actor)}
                                    className="me-2"
                                >
                                    Editar
                                </Button>
                                <Button 
                                    variant="danger" 
                                    size="sm" 
                                    onClick={() => handleEliminar(actor.IdActor)}
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
                        {modalMode === 'crear' ? 'Nuevo Actor' : 'Editar Actor'}
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

export default Actores;
