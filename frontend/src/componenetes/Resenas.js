// src/componenetes/Resenas.js
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { jwtDecode } from 'jwt-decode';
import 'bootstrap/dist/css/bootstrap.min.css';
import { Modal, Button, Form, Table, Container, Alert, Badge } from 'react-bootstrap';
import { PencilSquare, Trash3, Star, StarFill } from 'react-bootstrap-icons';

const Resenas = () => {
  const [resenas, setResenas] = useState([]);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [currentResena, setCurrentResena] = useState(null);
  const [formValues, setFormValues] = useState({
    TituloResena: '',
    CuerpoResena: '',
    Puntuacion: 1
  });

  useEffect(() => {
    cargarResenas();
  }, []);

  const cargarResenas = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const decoded = jwtDecode(token);
      const userId = decoded.id;
      const response = await axios.get(`http://localhost:5000/usuarios/${userId}/resenas`);
      setResenas(response.data);
      setError(null);
    } catch (e) {
      setError('Error al cargar las reseñas');
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const openEditModal = (resena) => {
    setCurrentResena(resena);
    setFormValues({
      TituloResena: resena.TituloResena,
      CuerpoResena: resena.CuerpoResena,
      Puntuacion: resena.Puntuacion
    });
    setShowEditModal(true);
  };

  const openDeleteModal = (resena) => {
    setCurrentResena(resena);
    setShowDeleteModal(true);
  };

  const closeModals = () => {
    setShowEditModal(false);
    setShowDeleteModal(false);
    setCurrentResena(null);
  };

const handleSave = async () => {
  try {
    // Guardar la puntuación anterior
    const puntuacionAnterior = currentResena.Puntuacion;
    // Actualiza la reseña
    await axios.put(`http://localhost:5000/resenas/${currentResena.IdResena}`, formValues);
    // Si la puntuación cambió, recalcula el promedio de la película
    if (Number(formValues.Puntuacion) !== Number(puntuacionAnterior)) {
      await axios.get(`http://localhost:5000/peliculas/${currentResena.IdPelicula}/actualizar-promedio`);
    }
    closeModals();
    cargarResenas();
  } catch (e) {
    setError('Error al actualizar la reseña o recalcular promedio');
    console.error(e);
  }
};


  const handleDeleteConfirmed = async () => {
    try {
      await axios.delete(`http://localhost:5000/resenas/${currentResena.IdResena}`);
      closeModals();
      cargarResenas();
    } catch (e) {
      setError('Error al eliminar la reseña');
      console.error(e);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormValues(prev => ({ ...prev, [name]: value }));
  };

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

  const getPuntuacionColor = (puntuacion) => {
    if (puntuacion >= 8) return 'success';
    if (puntuacion >= 6) return 'warning';
    if (puntuacion >= 4) return 'info';
    return 'danger';
  };

  if (loading) {
    return (
      <Container className="d-flex justify-content-center align-items-center" style={{minHeight: '400px'}}>
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Cargando...</span>
        </div>
      </Container>
    );
  }

  return (
    <Container fluid className="py-4">
      <div className="row">
        <div className="col-12">
          <div className="d-flex justify-content-between align-items-center mb-4">
            <h2 className="h3 text-primary fw-bold mb-0">
              <i className="bi bi-chat-square-text me-2"></i>
              Mis Reseñas
            </h2>
            <Badge bg="secondary" className="fs-6">
              {resenas.length} reseña{resenas.length !== 1 ? 's' : ''}
            </Badge>
          </div>

          {error && (
            <Alert variant="danger" className="mb-4" dismissible onClose={() => setError(null)}>
              <i className="bi bi-exclamation-triangle me-2"></i>
              {error}
            </Alert>
          )}

          {resenas.length === 0 ? (
            <div className="text-center py-5">
              <i className="bi bi-chat-square-text display-1 text-muted mb-3"></i>
              <h4 className="text-muted">No tienes reseñas aún</h4>
              <p className="text-muted">Comienza escribiendo tu primera reseña de película</p>
            </div>
          ) : (
            <div className="card shadow-sm">
              <div className="card-body p-0">
                <Table responsive hover className="mb-0">
                  <thead className="table-dark">
                    <tr>
                      <th className="px-4 py-3">Película</th>
                      <th className="px-4 py-3">Sinopsis</th>
                      <th className="px-4 py-3">Título Reseña</th>
                      <th className="px-4 py-3">Reseña</th>
                      <th className="px-4 py-3 text-center">Puntuación</th>
                      <th className="px-4 py-3 text-center">Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {resenas.map(resena => (
                      <tr key={resena.IdResena} className="align-middle">
                        <td className="px-4 py-3">
                          <strong className="text-primary">{resena.Pelicula.Titulo}</strong>
                        </td>
                        <td className="px-4 py-3">
                          <div style={{maxWidth: '200px', overflow: 'hidden', textOverflow: 'ellipsis'}}>
                            {resena.Pelicula.Sinopsis.length > 100 
                              ? `${resena.Pelicula.Sinopsis.substring(0, 100)}...` 
                              : resena.Pelicula.Sinopsis}
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <strong>{resena.TituloResena}</strong>
                        </td>
                        <td className="px-4 py-3">
                          <div style={{maxWidth: '250px', overflow: 'hidden', textOverflow: 'ellipsis'}}>
                            {resena.CuerpoResena.length > 100 
                              ? `${resena.CuerpoResena.substring(0, 100)}...` 
                              : resena.CuerpoResena}
                          </div>
                        </td>
                        <td className="px-4 py-3 text-center">
                          <div className="d-flex flex-column align-items-center">
                            <Badge bg={getPuntuacionColor(resena.Puntuacion)} className="mb-1">
                              {resena.Puntuacion}/10
                            </Badge>
                            <div className="d-flex">
                              {renderStars(resena.Puntuacion)}
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-center">
                          <div className="btn-group" role="group">
                            <Button
                              variant="outline-primary"
                              size="sm"
                              onClick={() => openEditModal(resena)}
                              className="d-flex align-items-center"
                            >
                              <PencilSquare size={16} className="me-1" />
                              Editar
                            </Button>
                            <Button
                              variant="outline-danger"
                              size="sm"
                              onClick={() => openDeleteModal(resena)}
                              className="d-flex align-items-center"
                            >
                              <Trash3 size={16} className="me-1" />
                              Eliminar
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Modal de Edición */}
      <Modal 
        show={showEditModal} 
        onHide={closeModals}
        size="lg"
        backdrop="static"
        keyboard={false}
      >
        <Modal.Header closeButton className="bg-primary text-white">
          <Modal.Title>
            <PencilSquare className="me-2" />
            Editar Reseña
          </Modal.Title>
        </Modal.Header>
        <Modal.Body className="p-4">
          {currentResena && (
            <div className="mb-3 p-3 bg-light rounded">
              <h6 className="text-primary mb-1">Película:</h6>
              <strong>{currentResena.Pelicula.Titulo}</strong>
            </div>
          )}
          
          <Form>
            <Form.Group className="mb-3">
              <Form.Label className="fw-semibold">Título de la Reseña</Form.Label>
              <Form.Control
                type="text"
                name="TituloResena"
                value={formValues.TituloResena}
                onChange={handleInputChange}
                placeholder="Ingresa un título para tu reseña"
                className="form-control-lg"
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label className="fw-semibold">Reseña</Form.Label>
              <Form.Control
                as="textarea"
                rows={5}
                name="CuerpoResena"
                value={formValues.CuerpoResena}
                onChange={handleInputChange}
                placeholder="Escribe tu reseña aquí..."
                className="form-control-lg"
              />
              <Form.Text className="text-muted">
                {formValues.CuerpoResena.length} caracteres
              </Form.Text>
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label className="fw-semibold">Puntuación</Form.Label>
              <div className="row align-items-center">
                <div className="col-md-4">
                  <Form.Select
                    name="Puntuacion"
                    value={formValues.Puntuacion}
                    onChange={handleInputChange}
                    className="form-select-lg"
                  >
                    {[1,2,3,4,5,6,7,8,9,10].map(num => (
                      <option key={num} value={num}>{num} - {
                        num >= 9 ? 'Excelente' :
                        num >= 7 ? 'Muy Buena' :
                        num >= 5 ? 'Buena' :
                        num >= 3 ? 'Regular' : 'Mala'
                      }</option>
                    ))}
                  </Form.Select>
                </div>
                <div className="col-md-8">
                  <div className="d-flex align-items-center">
                    <Badge bg={getPuntuacionColor(formValues.Puntuacion)} className="me-2">
                      {formValues.Puntuacion}/10
                    </Badge>
                    <div className="d-flex">
                      {renderStars(formValues.Puntuacion)}
                    </div>
                  </div>
                </div>
              </div>
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer className="bg-light">
          <Button variant="secondary" onClick={closeModals}>
            Cancelar
          </Button>
          <Button variant="primary" onClick={handleSave}>
            <i className="bi bi-check-lg me-1"></i>
            Guardar Cambios
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Modal de Confirmación de Eliminación */}
      <Modal 
        show={showDeleteModal} 
        onHide={closeModals}
        backdrop="static"
        keyboard={false}
      >
        <Modal.Header closeButton className="bg-danger text-white">
          <Modal.Title>
            <Trash3 className="me-2" />
            Confirmar Eliminación
          </Modal.Title>
        </Modal.Header>
        <Modal.Body className="p-4">
          {currentResena && (
            <div>
              <div className="text-center mb-3">
                <i className="bi bi-exclamation-triangle display-1 text-warning"></i>
              </div>
              <h5 className="text-center mb-3">¿Estás seguro de que deseas eliminar esta reseña?</h5>
              <div className="bg-light p-3 rounded">
                <strong>Película:</strong> {currentResena.Pelicula.Titulo}<br />
                <strong>Título:</strong> {currentResena.TituloResena}<br />
                <strong>Puntuación:</strong> {currentResena.Puntuacion}/10
              </div>
              <div className="alert alert-warning mt-3 mb-0">
                <i className="bi bi-info-circle me-2"></i>
                Esta acción no se puede deshacer.
              </div>
            </div>
          )}
        </Modal.Body>
        <Modal.Footer className="bg-light">
          <Button variant="secondary" onClick={closeModals}>
            Cancelar
          </Button>
          <Button variant="danger" onClick={handleDeleteConfirmed}>
            <Trash3 className="me-1" />
            Eliminar Reseña
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
};

export default Resenas;