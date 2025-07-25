import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Table, Button, Modal, Form, Alert } from 'react-bootstrap';
import '../componenetes/css/crudpeliculas.css';

function CrudPeliculas() {
    const [peliculas, setPeliculas] = useState([]);
    const [directores, setDirectores] = useState([]);
    const [actores, setActores] = useState([]);
    const [actoresSeleccionados, setActoresSeleccionados] = useState([]);
    const [showModal, setShowModal] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [currentPelicula, setCurrentPelicula] = useState({
        IdPelicula: '',
        Titulo: '',
        Sinopsis: '',
        AnioEstreno: '',
        IdDirector: '',
        UrlPoster: '',
        UrlTrailer: '',
        FechaPublicacion: '',
        Estado: 'Publicado',
        CalificacionPromedio: ''
    });
    const [alert, setAlert] = useState({ show: false, message: '', variant: '' });
    const [loading, setLoading] = useState(false);

    // Cargar datos al montar el componente
    useEffect(() => {
        const cargarDatos = async () => {
            await Promise.all([
                cargarPeliculas(),
                cargarDirectores(),
                cargarActores()
            ]);
        };
        cargarDatos();
    }, []);

    const cargarPeliculas = async () => {
        setLoading(true);
        try {
            const token = localStorage.getItem('token');
            const response = await fetch('http://localhost:5000/admin/peliculas', {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            if (!response.ok) {
                throw new Error('Error al cargar las películas');
            }

            const peliculasData = await response.json();
            setPeliculas(peliculasData);
        } catch (error) {
            console.error('Error cargando películas:', error);
            showAlert('Error al cargar las películas', 'danger');
        } finally {
            setLoading(false);
        }
    };

    const cargarActores = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await fetch('http://localhost:5000/actores', {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            if (!response.ok) {
                throw new Error('Error al cargar los actores');
            }

            const actoresData = await response.json();
            setActores(actoresData);
        } catch (error) {
            console.error('Error cargando actores:', error);
            showAlert('Error al cargar los actores', 'danger');
        }
    };

    const cargarDirectores = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await fetch('http://localhost:5000/directores', {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            if (!response.ok) {
                throw new Error('Error al cargar los directores');
            }

            const directoresData = await response.json();
            setDirectores(directoresData);
        } catch (error) {
            console.error('Error cargando directores:', error);
        }
    };

    const showAlert = (message, variant) => {
        setAlert({ show: true, message, variant });
        setTimeout(() => setAlert({ show: false, message: '', variant: '' }), 3000);
    };

    const cargarActoresPelicula = async (idPelicula) => {
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`http://localhost:5000/peliculas/${idPelicula}/actores`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            if (!response.ok) {
                throw new Error('Error al cargar los actores de la película');
            }

            const actoresPelicula = await response.json();
            setActoresSeleccionados(actoresPelicula);
        } catch (error) {
            console.error('Error cargando actores de la película:', error);
            showAlert('Error al cargar los actores de la película', 'danger');
        }
    };

    const handleShowModal = async (pelicula = null) => {
        if (pelicula) {
            setCurrentPelicula(pelicula);
            setIsEditing(true);
            await cargarActoresPelicula(pelicula.IdPelicula);
        } else {
            setCurrentPelicula({
                IdPelicula: '',
                Titulo: '',
                Sinopsis: '',
                AnioEstreno: '',
                IdDirector: '',
                UrlPoster: '',
                UrlTrailer: '',
                FechaPublicacion: '',
                Estado: 'Publicado',
                CalificacionPromedio: ''
            });
            setActoresSeleccionados([]);
            setIsEditing(false);
        }
        setShowModal(true);
    };

    const handleCloseModal = () => {
        setShowModal(false);
        setCurrentPelicula({
            IdPelicula: '',
            Titulo: '',
            Sinopsis: '',
            AnioEstreno: '',
            IdDirector: '',
            UrlPoster: '',
            UrlTrailer: '',
            FechaPublicacion: '',
            Estado: 'Publicado',
            CalificacionPromedio: ''
        });
        setIsEditing(false);
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setCurrentPelicula(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleAgregarActor = () => {
        setActoresSeleccionados([
            ...actoresSeleccionados,
            { IdActor: '', NombrePersonaje: '' }
        ]);
    };

    const handleEliminarActor = (index) => {
        const nuevosActores = actoresSeleccionados.filter((_, i) => i !== index);
        setActoresSeleccionados(nuevosActores);
    };

    const handleActorChange = (index, campo, valor) => {
        const nuevosActores = actoresSeleccionados.map((actor, i) => {
            if (i === index) {
                return { ...actor, [campo]: valor };
            }
            return actor;
        });
        setActoresSeleccionados(nuevosActores);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            const token = localStorage.getItem('token');
            const url = isEditing 
                ? `http://localhost:5000/peliculas/actualizar/${currentPelicula.IdPelicula}`
                : 'http://localhost:5000/peliculas/registro';
            
            const method = isEditing ? 'PUT' : 'POST';
            
            // Validar actores seleccionados
            const actoresValidos = actoresSeleccionados.filter(
                actor => actor.IdActor && actor.NombrePersonaje
            );
            
            const peliculaData = {
                Titulo: currentPelicula.Titulo,
                Sinopsis: currentPelicula.Sinopsis,
                AnioEstreno: parseInt(currentPelicula.AnioEstreno),
                IdDirector: currentPelicula.IdDirector ? parseInt(currentPelicula.IdDirector) : null,
                UrlPoster: currentPelicula.UrlPoster,
                UrlTrailer: currentPelicula.UrlTrailer,
                actores: actoresValidos
            };

            const response = await fetch(url, {
                method: method,
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(peliculaData)
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.mensaje || 'Error al guardar la película');
            }

            const peliculaResponse = await response.json();

            if (isEditing) {
                // Actualizar actores después de actualizar la película
                await fetch(`http://localhost:5000/peliculas/${currentPelicula.IdPelicula}/actores`, {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ actores: actoresValidos })
                });
            }

            await cargarPeliculas(); // Recargar la lista de películas
            showAlert(
                isEditing ? 'Película actualizada exitosamente' : 'Película agregada exitosamente', 
                'success'
            );
            handleCloseModal();
        } catch (error) {
            console.error('Error guardando película:', error);
            showAlert(error.message || 'Error al guardar la película', 'danger');
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (idPelicula) => {
        if (window.confirm('¿Está seguro de que desea eliminar esta película?')) {
            setLoading(true);
            try {
                const token = localStorage.getItem('token');
                const response = await fetch(`http://localhost:5000/peliculas/eliminar/${idPelicula}`, {
                    method: 'DELETE',
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    }
                });

                if (!response.ok) {
                    const errorData = await response.json();
                    throw new Error(errorData.mensaje || 'Error al eliminar la película');
                }

                await cargarPeliculas(); // Recargar la lista de películas
                showAlert('Película eliminada exitosamente', 'success');
            } catch (error) {
                console.error('Error eliminando película:', error);
                showAlert(error.message || 'Error al eliminar la película', 'danger');
            } finally {
                setLoading(false);
            }
        }
    };

    return (
        <Container fluid className="crud-peliculas-container">
            <Row>
                <Col>
                    <div className="crud-header">
                        <h2>Gestión de Películas</h2>
                        <Button 
                            variant="primary" 
                            onClick={() => handleShowModal()}
                            disabled={loading}
                        >
                            Agregar Nueva Película
                        </Button>
                    </div>

                    {alert.show && (
                        <Alert variant={alert.variant} className="mt-3">
                            {alert.message}
                        </Alert>
                    )}

                    <div className="table-container">
                        <Table striped bordered hover responsive>
                            <thead>
                                <tr>
                                    <th>ID</th>
                                    <th>Título</th>
                                    <th>Año Estreno</th>
                                    <th>Director</th>
                                    <th>Estado</th>
                                    <th>Calificación</th>
                                    <th>Acciones</th>
                                </tr>
                            </thead>
                            <tbody>
                                {loading ? (
                                    <tr>
                                        <td colSpan="7" className="text-center">Cargando...</td>
                                    </tr>
                                ) : peliculas.length === 0 ? (
                                    <tr>
                                        <td colSpan="7" className="text-center">No hay películas registradas</td>
                                    </tr>
                                ) : (
                                    peliculas.map((pelicula) => (
                                        <tr key={pelicula.IdPelicula}>
                                            <td>{pelicula.IdPelicula}</td>
                                            <td>{pelicula.Titulo}</td>
                                            <td>{pelicula.AnioEstreno}</td>
                                            <td>{pelicula.NombreDirector}</td>
                                            <td>
                                                <span className={`badge ${pelicula.Estado === 'Publicado' ? 'bg-success' : 'bg-warning'}`}>
                                                    {pelicula.Estado}
                                                </span>
                                            </td>
                                            <td>{pelicula.CalificacionPromedio}/10</td>
                                            <td>
                                                <Button 
                                                    variant="outline-primary" 
                                                    size="sm" 
                                                    onClick={() => handleShowModal(pelicula)}
                                                    className="me-2"
                                                    disabled={loading}
                                                >
                                                    Editar
                                                </Button>
                                                <Button 
                                                    variant="outline-danger" 
                                                    size="sm" 
                                                    onClick={() => handleDelete(pelicula.IdPelicula)}
                                                    disabled={loading}
                                                >
                                                    Eliminar
                                                </Button>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </Table>
                    </div>
                </Col>
            </Row>

            {/* Modal para Agregar/Editar Película */}
            <Modal show={showModal} onHide={handleCloseModal} size="lg">
                <Modal.Header closeButton>
                    <Modal.Title>
                        {isEditing ? 'Editar Película' : 'Agregar Nueva Película'}
                    </Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Form onSubmit={handleSubmit}>
                        <Row>
                            <Col md={6}>
                                <Form.Group className="mb-3">
                                    <Form.Label>Título *</Form.Label>
                                    <Form.Control
                                        type="text"
                                        name="Titulo"
                                        value={currentPelicula.Titulo}
                                        onChange={handleInputChange}
                                        required
                                        placeholder="Título de la película"
                                    />
                                </Form.Group>
                            </Col>
                            <Col md={6}>
                                <Form.Group className="mb-3">
                                    <Form.Label>Año de Estreno *</Form.Label>
                                    <Form.Control
                                        type="number"
                                        name="AnioEstreno"
                                        value={currentPelicula.AnioEstreno}
                                        onChange={handleInputChange}
                                        required
                                        min="1900"
                                        max={new Date().getFullYear()}
                                    />
                                </Form.Group>
                            </Col>
                        </Row>

                        <Row>
                            <Col md={6}>
                                <Form.Group className="mb-3">
                                    <Form.Label>Director *</Form.Label>
                                    <Form.Select
                                        name="IdDirector"
                                        value={currentPelicula.IdDirector}
                                        onChange={handleInputChange}
                                        required
                                    >
                                        <option value="">Seleccione un director</option>
                                        {directores.map(director => (
                                            <option key={director.IdDirector} value={director.IdDirector}>
                                                {director.Nombres} {director.Apellidos}
                                            </option>
                                        ))}
                                    </Form.Select>
                                </Form.Group>
                            </Col>
                            <Col md={6}>
                                <Form.Group className="mb-3">
                                    <Form.Label>Estado</Form.Label>
                                    <Form.Select
                                        name="Estado"
                                        value={currentPelicula.Estado}
                                        onChange={handleInputChange}
                                    >
                                        <option value="Publicado">Publicado</option>
                                        <option value="Borrador">Borrador</option>
                                    </Form.Select>
                                </Form.Group>
                            </Col>
                        </Row>

                        <Form.Group className="mb-3">
                            <Form.Label>Sinopsis</Form.Label>
                            <Form.Control
                                as="textarea"
                                rows={3}
                                name="Sinopsis"
                                value={currentPelicula.Sinopsis}
                                onChange={handleInputChange}
                                placeholder="Descripción de la película"
                            />
                        </Form.Group>

                        <Row>
                            <Col md={6}>
                                <Form.Group className="mb-3">
                                    <Form.Label>URL del Poster</Form.Label>
                                    <Form.Control
                                        type="url"
                                        name="UrlPoster"
                                        value={currentPelicula.UrlPoster}
                                        onChange={handleInputChange}
                                        placeholder="https://ejemplo.com/poster.jpg"
                                    />
                                </Form.Group>
                            </Col>
                            <Col md={6}>
                                <Form.Group className="mb-3">
                                    <Form.Label>URL del Trailer</Form.Label>
                                    <Form.Control
                                        type="url"
                                        name="UrlTrailer"
                                        value={currentPelicula.UrlTrailer}
                                        onChange={handleInputChange}
                                        placeholder="https://youtube.com/watch?v=..."
                                    />
                                </Form.Group>
                            </Col>
                        </Row>

                        <Row>
                            <Col md={6}>
                                <Form.Group className="mb-3">
                                    <Form.Label>Fecha de Publicación</Form.Label>
                                    <Form.Control
                                        type="date"
                                        name="FechaPublicacion"
                                        value={currentPelicula.FechaPublicacion}
                                        onChange={handleInputChange}
                                    />
                                </Form.Group>
                            </Col>
                            <Col md={6}>
                                <Form.Group className="mb-3">
                                    <Form.Label>Calificación Promedio</Form.Label>
                                    <Form.Control
                                        type="number"
                                        step="0.1"
                                        min="0"
                                        max="10"
                                        name="CalificacionPromedio"
                                        value={currentPelicula.CalificacionPromedio}
                                        onChange={handleInputChange}
                                        placeholder="0.0 - 10.0"
                                    />
                                </Form.Group>
                            </Col>
                        </Row>

                        <hr className="my-4" />
                        
                        <div className="actores-section">
                            <div className="d-flex justify-content-between align-items-center mb-3">
                                <h5>Actores</h5>
                                <Button 
                                    variant="outline-primary" 
                                    size="sm"
                                    onClick={handleAgregarActor}
                                >
                                    Agregar Actor
                                </Button>
                            </div>

                            {actoresSeleccionados.map((actor, index) => (
                                <Row key={index} className="mb-3 align-items-end">
                                    <Col md={5}>
                                        <Form.Group>
                                            <Form.Label>Actor</Form.Label>
                                            <Form.Select
                                                value={actor.IdActor}
                                                onChange={(e) => handleActorChange(index, 'IdActor', e.target.value)}
                                                required
                                            >
                                                <option value="">Seleccione un actor</option>
                                                {actores.map(a => (
                                                    <option key={a.IdActor} value={a.IdActor}>
                                                        {a.Nombres} {a.Apellidos}
                                                    </option>
                                                ))}
                                            </Form.Select>
                                        </Form.Group>
                                    </Col>
                                    <Col md={5}>
                                        <Form.Group>
                                            <Form.Label>Nombre del Personaje</Form.Label>
                                            <Form.Control
                                                type="text"
                                                value={actor.NombrePersonaje}
                                                onChange={(e) => handleActorChange(index, 'NombrePersonaje', e.target.value)}
                                                placeholder="Nombre del personaje"
                                                required
                                            />
                                        </Form.Group>
                                    </Col>
                                    <Col md={2}>
                                        <Button 
                                            variant="outline-danger" 
                                            size="sm"
                                            onClick={() => handleEliminarActor(index)}
                                            className="w-100"
                                        >
                                            Eliminar
                                        </Button>
                                    </Col>
                                </Row>
                            ))}
                        </div>

                        <Modal.Footer>
                            <Button variant="secondary" onClick={handleCloseModal}>
                                Cancelar
                            </Button>
                            <Button variant="primary" type="submit" disabled={loading}>
                                {loading ? 'Guardando...' : (isEditing ? 'Actualizar' : 'Agregar')}
                            </Button>
                        </Modal.Footer>
                    </Form>
                </Modal.Body>
            </Modal>
        </Container>
    );
}

export default CrudPeliculas;
