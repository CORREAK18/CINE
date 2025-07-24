import axios from 'axios';
import { useState } from 'react';
import { Form } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import "../componenetes/css/Login.css";

const RegistrarUsuarios = () => {
    const [nombreUsuario, setNombreUsuario] = useState('');
    const [correo, setCorreo] = useState('');
    const [contrasena, setContrasena] = useState('');
    const navigate = useNavigate();

    const handleRegistro = async (e) => {
        e.preventDefault();
        try {
            const response = await axios.post('http://localhost:5000/usuarios/registro', {
                nombreUsuario,
                correo,
                contraseña: contrasena
            });
            
            
            navigate('/');
        } catch (error) {
            alert(error.response?.data?.mensaje || 'Error al registrar usuario');
        }
    };

    return (
        <div className="container">
            <div className="imagen-login">
                <img src='./imagenes/escuelaii.jpg' alt='Imagen en registro' />
            </div>
            <div className="form-section">
                <h3 className="login-title">Registrar Usuario</h3>
                <Form className="login-form" onSubmit={handleRegistro}>
                    <div className="custom-form-group">
                        <label htmlFor="nombreUsuario" className="custom-label">
                            Nombre de Usuario
                        </label>
                        <input
                            type='text'
                            id="nombreUsuario"
                            className='custom-input'
                            value={nombreUsuario}
                            onChange={(e) => setNombreUsuario(e.target.value)}
                            required
                        />
                    </div>
                    <div className="custom-form-group">
                        <label htmlFor="correo" className="custom-label">
                            Correo Electrónico
                        </label>
                        <input
                            type='email'
                            id="correo"
                            className='custom-input'
                            value={correo}
                            onChange={(e) => setCorreo(e.target.value)}
                            required
                        />
                    </div>
                    <div className="custom-form-group">
                        <label htmlFor="password" className="custom-label">
                            Contraseña
                        </label>
                        <input
                            type='password'
                            id="password"
                            className='custom-input'
                            value={contrasena}
                            onChange={(e) => setContrasena(e.target.value)}
                            required
                        />
                    </div>
                    <button type="submit" className="custom-button">
                        Registrarse
                    </button>
                    <p className="mt-3 text-center">
                        ¿Ya tienes una cuenta? <a href="/">Iniciar Sesión</a>
                    </p>
                </Form>
            </div>
        </div>
    );
};

export default RegistrarUsuarios;
