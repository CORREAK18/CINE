import React from "react";
import { Nav } from "react-bootstrap";
import { jwtDecode } from "jwt-decode";

function Menu() {
    const getMenuItems = () => {
        const token = localStorage.getItem('token');
        if (!token) return [];

        try {
            const decodedToken = jwtDecode(token);
            const userRole = decodedToken.rol;
            console.log('Rol detectado:', userRole); // Agregamos este log

            // Menú base (compartido por todos los roles)
            const baseMenu = [
                { path: "/inicio", text: "Inicio" },
            ];

            // Menú específico para cada rol
            switch (userRole) {
                case 'usuario':
                    return [
                        ...baseMenu,
                        { path: "/peliculas", text: "Catálogo de Películas" },
                        { path: "/mis-resenas", text: "Mis Reseñas" }
                    ];
                case 'Administrador':
                    return [
                        ...baseMenu,
                        { path: "/admin/peliculas", text: "Gestión de Películas" },
                        { path: "/admin/usuarios", text: "Gestión de Usuarios" },
                        { path: "/admin/directores", text: "Gestión de Directores" },
                        { path: "/admin/actores", text: "Gestión de Actores" },
                        { path: "/admin/reportes", text: "Reportes" }
                    ];
                default:
                    return baseMenu;
            }
        } catch (error) {
            console.error('Error decodificando el token:', error);
            return [];
        }
    };

    const handleLogout = () => {
        localStorage.removeItem('token');
        window.location.href = '/';
    };

    return (
        <Nav className="menu" defaultActiveKey="/inicio">
            {getMenuItems().map((item, index) => (
                <Nav.Link key={index} href={item.path}>
                    {item.text}
                </Nav.Link>
            ))}
            <Nav.Link onClick={handleLogout}>
                Cerrar sesión
            </Nav.Link>
        </Nav>
    );
}

export default Menu;