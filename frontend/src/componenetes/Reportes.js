import React, { useState, useEffect, useCallback, useMemo } from 'react';
import axios from 'axios';
import { Table, Button, Form, ButtonGroup } from 'react-bootstrap';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import * as XLSX from 'xlsx';
import './css/reportes.css';

const Reportes = () => {
    const [tipoReporte, setTipoReporte] = useState('puntuacion');
    const [peliculas, setPeliculas] = useState([]);
    const [generos, setGeneros] = useState([]);
    const [generoSeleccionado, setGeneroSeleccionado] = useState('');
    const [error, setError] = useState('');

    const token = localStorage.getItem('token');
    const config = useMemo(() => ({
        headers: { Authorization: `Bearer ${token}` }
    }), [token]);

    const cargarGeneros = useCallback(async () => {
        try {
            const response = await axios.get('http://localhost:5000/generos', config);
            setGeneros(response.data);
            setError('');
        } catch (error) {
            console.error('Error:', error);
            setError('Error al cargar los géneros');
        }
    }, [config]);

    const cargarReportePuntuacion = useCallback(async () => {
        try {
            const response = await axios.get('http://localhost:5000/reportes/peliculas-puntuacion', config);
            setPeliculas(response.data);
            setError('');
        } catch (error) {
            console.error('Error:', error);
            setError('Error al cargar el reporte por puntuación');
            setPeliculas([]);
        }
    }, [config]);

    const cargarReportePorGenero = useCallback(async (idGenero) => {
        try {
            const response = await axios.get(`http://localhost:5000/reportes/peliculas-genero/${idGenero}`, config);
            setPeliculas(response.data);
            setError('');
        } catch (error) {
            console.error('Error:', error);
            setError('Error al cargar el reporte por género');
            setPeliculas([]);
        }
    }, [config]);

    // Efectos
    useEffect(() => {
        cargarGeneros();
    }, [cargarGeneros]);

    useEffect(() => {
        const cargarDatos = async () => {
            if (tipoReporte === 'puntuacion') {
                await cargarReportePuntuacion();
                setGeneroSeleccionado('');
            } else if (tipoReporte === 'genero' && generoSeleccionado) {
                await cargarReportePorGenero(generoSeleccionado);
            }
        };
        
        cargarDatos();
    }, [tipoReporte, generoSeleccionado, cargarReportePuntuacion, cargarReportePorGenero]);

    const handleGeneroChange = (e) => {
        setGeneroSeleccionado(e.target.value);
    };

    const formatearFecha = (fecha) => {
        return new Date(fecha).toLocaleDateString('es-ES', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric'
        });
    };

    const exportarAPDF = () => {
        const doc = new jsPDF('p', 'mm', 'a4');
        const titulo = tipoReporte === 'puntuacion' ? 
            'Reporte de Películas por Puntuación' : 
            'Reporte de Películas por Género';

        // Configurar el título
        doc.setFontSize(16);
        doc.text(titulo, 15, 15);
        doc.setFontSize(12);

        // Si es reporte por género, agregar el género seleccionado
        if (tipoReporte === 'genero' && generoSeleccionado) {
            const generoNombre = generos.find(g => g.IdGenero.toString() === generoSeleccionado)?.NombreGenero;
            doc.text(`Género: ${generoNombre || ''}`, 14, 25);
        }

        // Preparar datos para la tabla
        const datos = peliculas.map(pelicula => [
            pelicula.Pelicula,
            pelicula.Director,
            formatearFecha(pelicula.FechaCreacion),
            pelicula.Puntuacion?.toFixed(2) || 'Sin puntuación'
        ]);

        // Generar la tabla
        autoTable(doc, {
            startY: tipoReporte === 'genero' ? 30 : 25,
            head: [['Película', 'Director', 'Fecha de Publicación', 'Puntuación']],
            body: datos,
            theme: 'grid',
            styles: {
                fontSize: 8,
                cellPadding: 2,
                overflow: 'linebreak'
            },
            columnStyles: {
                0: { cellWidth: 50 },
                1: { cellWidth: 50 },
                2: { cellWidth: 40 },
                3: { cellWidth: 30 }
            }
        });

        // Guardar el PDF
        const fechaActual = new Date().toISOString().split('T')[0];
        doc.save('reporte-peliculas-' + tipoReporte + '-' + fechaActual + '.pdf');
    };

    const exportarAExcel = () => {
        // Preparar los datos
        const datos = peliculas.map(pelicula => ({
            'Película': pelicula.Pelicula,
            'Director': pelicula.Director,
            'Fecha de Publicación': formatearFecha(pelicula.FechaCreacion),
            'Puntuación': pelicula.Puntuacion?.toFixed(2) || 'Sin puntuación'
        }));

        // Crear una nueva hoja de trabajo
        const ws = XLSX.utils.json_to_sheet(datos);

        // Crear un nuevo libro
        const wb = XLSX.utils.book_new();
        const nombreHoja = tipoReporte === 'puntuacion' ? 'Reporte por Puntuación' : 'Reporte por Género';
        XLSX.utils.book_append_sheet(wb, ws, nombreHoja);

        // Guardar el archivo
        const fechaActual = new Date().toISOString().split('T')[0];
        XLSX.writeFile(wb, 'reporte-peliculas-' + tipoReporte + '-' + fechaActual + '.xlsx');
    };

    return (
        <div className="reportes-container">
            <div className="reportes-header">
                <h2>Reportes de Películas</h2>
            </div>

            <div className="reportes-buttons">
                <Button 
                    variant={tipoReporte === 'puntuacion' ? 'primary' : 'secondary'}
                    onClick={() => setTipoReporte('puntuacion')}
                >
                    Reporte por Puntuación
                </Button>
                <Button 
                    variant={tipoReporte === 'genero' ? 'primary' : 'secondary'}
                    onClick={() => setTipoReporte('genero')}
                >
                    Reporte por Género
                </Button>
            </div>

            {error && <div className="alert alert-danger">{error}</div>}

            {tipoReporte === 'genero' && (
                <Form.Group className="genero-filter">
                    <Form.Label>Seleccionar Género</Form.Label>
                    <Form.Select 
                        value={generoSeleccionado}
                        onChange={handleGeneroChange}
                    >
                        <option value="">Seleccione un género</option>
                        {generos.map(genero => (
                            <option key={genero.IdGenero} value={genero.IdGenero}>
                                {genero.NombreGenero}
                            </option>
                        ))}
                    </Form.Select>
                </Form.Group>
            )}

            <div className="export-buttons mb-3">
                <ButtonGroup>
                    <Button 
                        variant="success" 
                        onClick={exportarAExcel}
                        disabled={peliculas.length === 0}
                    >
                        Exportar a Excel
                    </Button>
                    <Button 
                        variant="danger" 
                        onClick={exportarAPDF}
                        disabled={peliculas.length === 0}
                    >
                        Exportar a PDF
                    </Button>
                </ButtonGroup>
            </div>

            <div className="table-responsive">
                <Table striped bordered hover>
                    <thead>
                        <tr>
                            <th>Película</th>
                            <th>Director</th>
                            <th>Fecha de Publicación</th>
                            <th>Puntuación</th>
                        </tr>
                    </thead>
                    <tbody>
                        {peliculas.map((pelicula, index) => (
                            <tr key={index}>
                                <td>{pelicula.Pelicula}</td>
                                <td>{pelicula.Director}</td>
                                <td>{formatearFecha(pelicula.FechaCreacion)}</td>
                                <td>{pelicula.Puntuacion?.toFixed(2) || 'Sin puntuación'}</td>
                            </tr>
                        ))}
                    </tbody>
                </Table>
            </div>
        </div>
    );
};

export default Reportes;
