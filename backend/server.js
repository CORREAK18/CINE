const express = require('express');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const app = express();
app.use(cors());
app.use(express.json());

// Importar modelos desde modelodatosCINE.js
const { 
    sequelize, 
    Rol, 
    Usuario, 
    Director, 
    Actor, 
    Genero, 
    Pelicula, 
    PeliculaGenero, 
    PeliculaActor, 
    Resena 
} = require('./datos/modelodatosCINE');
const { Op, QueryTypes } = require('sequelize');

// Middleware de autenticación
const verificarToken = (req, res, next) => {
    const token = req.headers['authorization']?.split(' ')[1];

    if (!token) {
        return res.status(401).json({ mensaje: 'Token no proporcionado' });
    }

    try {
        const decoded = jwt.verify(token, 'secreto');
        req.usuario = decoded;
        next();
    } catch (error) {
        return res.status(401).json({ mensaje: 'Token inválido' });
    }
};

// Middleware para verificar rol de administrador
const verificarAdmin = (req, res, next) => {
    if (req.usuario.rol !== 'Administrador') {
        return res.status(403).json({ mensaje: 'Acceso denegado: se requiere rol de administrador' });
    }
    next();
};

// Endpoints de autenticación
// Registro de usuarios
app.post('/usuarios/registro', async (req, res) => {
    try {
        const { nombreUsuario, correo, contraseña } = req.body;

        // 1. Validar que los campos requeridos estén presentes
        if (!nombreUsuario || !correo || !contraseña) {
            return res.status(400).json({
                mensaje: 'Todos los campos son obligatorios',
                campos_requeridos: ['nombreUsuario', 'correo', 'contraseña']
            });
        }

        // 2. Verificar si el usuario ya existe
        const usuarioExistente = await Usuario.findOne({
            where: {
                [Op.or]: [
                    { NombreUsuario: nombreUsuario },
                    { Correo: correo }
                ]
            }
        });

        if (usuarioExistente) {
            return res.status(400).json({
                mensaje: 'El nombre de usuario o correo ya está registrado'
            });
        }

        // 3. Crear el nuevo usuario
        const nuevoUsuario = await Usuario.create({
            NombreUsuario: nombreUsuario,
            Correo: correo,
            ClaveHash: contraseña,
            IdRol: 1, // Rol normal de usuario
            EstaActivo: true
        });

        // 4. Generar token
        const token = jwt.sign(
            { 
                id: nuevoUsuario.IdUsuario,
                rol: nuevoUsuario.IdRol,
                usuario: nuevoUsuario.NombreUsuario
            },
            'secreto',
            { expiresIn: '24h' }
        );

        // 5. Enviar respuesta
        res.status(201).json({
            mensaje: 'Usuario registrado exitosamente',
            usuario: {
                id: nuevoUsuario.IdUsuario,
                nombreUsuario: nuevoUsuario.NombreUsuario,
                correo: nuevoUsuario.Correo
            },
            token
        });

    } catch (error) {
        console.error('Error al registrar usuario:', error);
        res.status(500).json({
            mensaje: 'Error al registrar usuario',
            error: error.message
        });
    }
});

app.post('/login', async (req, res) => {
    try {
        const { nombreUsuario, contraseña } = req.body;

        if (!nombreUsuario || !contraseña) {
            return res.status(400).json({
                mensaje: 'Nombre de usuario/correo y contraseña son requeridos'
            });
        }

        const usuario = await Usuario.findOne({
            where: {
                [Op.or]: [
                    { Correo: nombreUsuario },
                    { NombreUsuario: nombreUsuario }
                ]
            },
            include: [{
                model: Rol,
                attributes: ['NombreRol']
            }]
        });

        if (!usuario) {
            return res.status(401).json({
                mensaje: 'Usuario no encontrado'
            });
        }

        if (contraseña !== usuario.ClaveHash) {
            return res.status(401).json({
                mensaje: 'Contraseña incorrecta'
            });
        }

        if (!usuario.EstaActivo) {
            return res.status(401).json({
                mensaje: 'La cuenta está desactivada'
            });
        }

        const token = jwt.sign(
            {
                id: usuario.IdUsuario,
                rol: usuario.Rol.NombreRol, // Usamos el nombre del rol
                usuario: usuario.NombreUsuario
            },
            'secreto',
            { expiresIn: '24h' }
        );

        return res.json({
            mensaje: 'Inicio de sesión exitoso',
            usuario: {
                id: usuario.IdUsuario,
                nombreUsuario: usuario.NombreUsuario,
                correo: usuario.Correo
            },
            token
        });

    } catch (error) {
        console.error('Error en login:', error);
        return res.status(500).json({
            mensaje: 'Error al procesar el inicio de sesión'
        });
    }
});

// Endpoints de Directores
app.get('/directores', verificarToken, async (req, res) => {
    try {
        const directores = await Director.findAll({
            attributes: ['IdDirector', 'Nombres', 'Apellidos', 'FechaNacimiento'],
            order: [['Apellidos', 'ASC'], ['Nombres', 'ASC']]
        });
        res.json(directores);
    } catch (error) {
        console.error('Error al obtener directores:', error);
        res.status(500).json({
            mensaje: 'Error al obtener la lista de directores',
            error: error.message
        });
    }
});

app.get('/directores/:id', verificarToken, async (req, res) => {
    try {
        const { id } = req.params;
        const director = await Director.findByPk(id, {
            include: [{
                model: Pelicula,
                attributes: ['IdPelicula', 'Titulo', 'AnioEstreno']
            }]
        });

        if (!director) {
            return res.status(404).json({ mensaje: 'Director no encontrado' });
        }

        res.json(director);
    } catch (error) {
        console.error('Error al obtener director:', error);
        res.status(500).json({
            mensaje: 'Error al obtener el director',
            error: error.message
        });
    }
});

app.post('/directores', verificarToken, verificarAdmin, async (req, res) => {
    try {
        const { Nombres, Apellidos, FechaNacimiento } = req.body;

        if (!Nombres || !Apellidos) {
            return res.status(400).json({
                mensaje: 'Nombres y Apellidos son obligatorios'
            });
        }

        const nuevoDirector = await Director.create({
            Nombres,
            Apellidos,
            FechaNacimiento: FechaNacimiento || null
        });

        res.status(201).json({
            mensaje: 'Director registrado exitosamente',
            director: nuevoDirector
        });
    } catch (error) {
        console.error('Error al crear director:', error);
        res.status(500).json({
            mensaje: 'Error al registrar el director',
            error: error.message
        });
    }
});

app.put('/directores/:id', verificarToken, verificarAdmin, async (req, res) => {
    try {
        const { id } = req.params;
        const { Nombres, Apellidos, FechaNacimiento } = req.body;

        const director = await Director.findByPk(id);
        if (!director) {
            return res.status(404).json({ mensaje: 'Director no encontrado' });
        }

        await director.update({
            Nombres: Nombres || director.Nombres,
            Apellidos: Apellidos || director.Apellidos,
            FechaNacimiento: FechaNacimiento || director.FechaNacimiento
        });

        res.json({
            mensaje: 'Director actualizado exitosamente',
            director
        });
    } catch (error) {
        console.error('Error al actualizar director:', error);
        res.status(500).json({
            mensaje: 'Error al actualizar el director',
            error: error.message
        });
    }
});

app.delete('/directores/:id', verificarToken, verificarAdmin, async (req, res) => {
    try {
        const { id } = req.params;
        const director = await Director.findByPk(id);

        if (!director) {
            return res.status(404).json({ mensaje: 'Director no encontrado' });
        }

        // Verificar si tiene películas asociadas
        const peliculasAsociadas = await Pelicula.count({
            where: { IdDirector: id }
        });

        if (peliculasAsociadas > 0) {
            return res.status(400).json({
                mensaje: 'No se puede eliminar el director porque tiene películas asociadas'
            });
        }

        await director.destroy();
        res.json({ mensaje: 'Director eliminado exitosamente' });
    } catch (error) {
        console.error('Error al eliminar director:', error);
        res.status(500).json({
            mensaje: 'Error al eliminar el director',
            error: error.message
        });
    }
});

// Endpoints de Actores
app.get('/actores', verificarToken, async (req, res) => {
    try {
        const actores = await Actor.findAll({
            attributes: ['IdActor', 'Nombres', 'Apellidos', 'FechaNacimiento'],
            order: [['Apellidos', 'ASC'], ['Nombres', 'ASC']]
        });
        res.json(actores);
    } catch (error) {
        console.error('Error al obtener actores:', error);
        res.status(500).json({
            mensaje: 'Error al obtener la lista de actores',
            error: error.message
        });
    }
});

app.get('/actores/:id', verificarToken, async (req, res) => {
    try {
        const { id } = req.params;
        const actor = await Actor.findByPk(id, {
            include: [{
                model: Pelicula,
                through: {
                    attributes: ['NombrePersonaje']
                },
                attributes: ['IdPelicula', 'Titulo', 'AnioEstreno']
            }]
        });

        if (!actor) {
            return res.status(404).json({ mensaje: 'Actor no encontrado' });
        }

        res.json(actor);
    } catch (error) {
        console.error('Error al obtener actor:', error);
        res.status(500).json({
            mensaje: 'Error al obtener el actor',
            error: error.message
        });
    }
});

app.post('/actores', verificarToken, verificarAdmin, async (req, res) => {
    try {
        const { Nombres, Apellidos, FechaNacimiento } = req.body;

        if (!Nombres || !Apellidos) {
            return res.status(400).json({
                mensaje: 'Nombres y Apellidos son obligatorios'
            });
        }

        const nuevoActor = await Actor.create({
            Nombres,
            Apellidos,
            FechaNacimiento: FechaNacimiento || null
        });

        res.status(201).json({
            mensaje: 'Actor registrado exitosamente',
            actor: nuevoActor
        });
    } catch (error) {
        console.error('Error al crear actor:', error);
        res.status(500).json({
            mensaje: 'Error al registrar el actor',
            error: error.message
        });
    }
});

app.put('/actores/:id', verificarToken, verificarAdmin, async (req, res) => {
    try {
        const { id } = req.params;
        const { Nombres, Apellidos, FechaNacimiento } = req.body;

        const actor = await Actor.findByPk(id);
        if (!actor) {
            return res.status(404).json({ mensaje: 'Actor no encontrado' });
        }

        await actor.update({
            Nombres: Nombres || actor.Nombres,
            Apellidos: Apellidos || actor.Apellidos,
            FechaNacimiento: FechaNacimiento || actor.FechaNacimiento
        });

        res.json({
            mensaje: 'Actor actualizado exitosamente',
            actor
        });
    } catch (error) {
        console.error('Error al actualizar actor:', error);
        res.status(500).json({
            mensaje: 'Error al actualizar el actor',
            error: error.message
        });
    }
});

app.delete('/actores/:id', verificarToken, verificarAdmin, async (req, res) => {
    try {
        const { id } = req.params;
        const actor = await Actor.findByPk(id);

        if (!actor) {
            return res.status(404).json({ mensaje: 'Actor no encontrado' });
        }

        // Verificar si tiene películas asociadas
        const peliculasAsociadas = await PeliculaActor.count({
            where: { IdActor: id }
        });

        if (peliculasAsociadas > 0) {
            return res.status(400).json({
                mensaje: 'No se puede eliminar el actor porque tiene películas asociadas'
            });
        }

        await actor.destroy();
        res.json({ mensaje: 'Actor eliminado exitosamente' });
    } catch (error) {
        console.error('Error al eliminar actor:', error);
        res.status(500).json({
            mensaje: 'Error al eliminar el actor',
            error: error.message
        });
    }
});

// Endpoints de películas
app.post('/peliculas/registro', verificarToken, verificarAdmin, async (req, res) => {
    try {
        const {
            Titulo,
            Sinopsis,
            AnioEstreno,
            IdDirector,
            UrlPoster,
            UrlTrailer
        } = req.body;

        if (!Titulo || !AnioEstreno) {
            return res.status(400).json({ mensaje: 'Título y año de estreno son obligatorios.' });
        }

        const { actores } = req.body; // Array de objetos {IdActor, NombrePersonaje}
        
        const t = await sequelize.transaction();
        
        try {
            const nuevaPelicula = await Pelicula.create({
                Titulo,
                Sinopsis: Sinopsis || null,
                AnioEstreno,
                IdDirector: IdDirector || null,
                UrlPoster: UrlPoster || null,
                UrlTrailer: UrlTrailer || null,
                Estado: 'Publicado',
                FechaPublicacion: sequelize.literal('GETDATE()'),
                CalificacionPromedio: null
            }, { transaction: t });

            if (actores && actores.length > 0) {
                const relacionesActores = actores.map(actor => ({
                    IdPelicula: nuevaPelicula.IdPelicula,
                    IdActor: actor.IdActor,
                    NombrePersonaje: actor.NombrePersonaje
                }));

                await PeliculaActor.bulkCreate(relacionesActores, { transaction: t });
            }

            await t.commit();
            res.status(201).json({
                mensaje: 'Película registrada exitosamente',
                pelicula: nuevaPelicula
            });

    } catch (error) {
        console.error('Error al registrar la película:', error);
        res.status(500).json({
            mensaje: 'Error al registrar la película',
            error: error.message
        });
    }
});

app.put('/peliculas/actualizar/:id', verificarToken, verificarAdmin, async (req, res) => {
    try {
        const { id } = req.params;
        const {
            Titulo,
            Sinopsis,
            AnioEstreno,
            IdDirector,
            UrlPoster,
            UrlTrailer
        } = req.body;

        const pelicula = await Pelicula.findByPk(id);

        if (!pelicula) {
            return res.status(404).json({ mensaje: 'Película no encontrada' });
        }

        await pelicula.update({
            Titulo: Titulo || pelicula.Titulo,
            Sinopsis: Sinopsis || pelicula.Sinopsis,
            AnioEstreno: AnioEstreno || pelicula.AnioEstreno,
            IdDirector: IdDirector || pelicula.IdDirector,
            UrlPoster: UrlPoster || pelicula.UrlPoster,
            UrlTrailer: UrlTrailer || pelicula.UrlTrailer
        });

        res.json({
            mensaje: 'Película actualizada exitosamente',
            pelicula
        });

    } catch (error) {
        console.error('Error al actualizar la película:', error);
        res.status(500).json({
            mensaje: 'Error al actualizar la película',
            error: error.message
        });
    }
});

app.delete('/peliculas/eliminar/:id', verificarToken, verificarAdmin, async (req, res) => {
    try {
        const { id } = req.params;
        const pelicula = await Pelicula.findByPk(id);

        if (!pelicula) {
            return res.status(404).json({ mensaje: 'Película no encontrada' });
        }

        await pelicula.destroy();

        res.json({
            mensaje: 'Película eliminada exitosamente'
        });

    } catch (error) {
        console.error('Error al eliminar la película:', error);
        res.status(500).json({
            mensaje: 'Error al eliminar la película',
            error: error.message
        });
    }
});

// Endpoint para administradores: obtener todas las películas (activas e inactivas)
app.get('/admin/peliculas', verificarToken, verificarAdmin, async (req, res) => {
    try {
        const peliculas = await Pelicula.findAll({
            include: [
                { 
                    model: Director,
                    attributes: ['IdDirector', 'Nombres', 'Apellidos']
                },
                {
                    model: Genero,
                    through: { attributes: [] },
                    attributes: ['IdGenero', 'NombreGenero']
                }
            ],
            order: [['IdPelicula', 'ASC']]
        });

        // Formatear los datos para el frontend
        const peliculasFormateadas = peliculas.map(pelicula => ({
            IdPelicula: pelicula.IdPelicula,
            Titulo: pelicula.Titulo,
            Sinopsis: pelicula.Sinopsis,
            AnoEstreno: pelicula.AnioEstreno,
            IdDirector: pelicula.IdDirector,
            NombreDirector: pelicula.Director ? `${pelicula.Director.Nombres} ${pelicula.Director.Apellidos}` : 'Sin director',
            UrlPoster: pelicula.UrlPoster,
            UrlTrailer: pelicula.UrlTrailer,
            FechaPublicacion: pelicula.FechaPublicacion,
            Estado: pelicula.Estado,
            CalificacionPromedio: pelicula.CalificacionPromedio || 0
        }));

        res.json(peliculasFormateadas);
    } catch (error) {
        console.error('Error al obtener películas para administrador:', error);
        res.status(500).json({
            mensaje: 'Error al obtener las películas',
            error: error.message
        });
    }
});

// Endpoints para actores
app.get('/actores', verificarToken, async (req, res) => {
    try {
        const actores = await Actor.findAll({
            attributes: ['IdActor', 'Nombres', 'Apellidos', 'FechaNacimiento'],
            order: [['Apellidos', 'ASC'], ['Nombres', 'ASC']]
        });
        res.json(actores);
    } catch (error) {
        console.error('Error al obtener actores:', error);
        res.status(500).json({
            mensaje: 'Error al obtener los actores',
            error: error.message
        });
    }
});

// Endpoint para obtener los actores de una película específica
app.get('/peliculas/:id/actores', verificarToken, async (req, res) => {
    try {
        const { id } = req.params;
        const actoresPelicula = await PeliculaActor.findAll({
            where: { IdPelicula: id },
            include: [{
                model: Actor,
                attributes: ['IdActor', 'Nombres', 'Apellidos']
            }]
        });

        res.json(actoresPelicula.map(pa => ({
            ...pa.Actor.dataValues,
            NombrePersonaje: pa.NombrePersonaje
        })));
    } catch (error) {
        console.error('Error al obtener actores de la película:', error);
        res.status(500).json({
            mensaje: 'Error al obtener los actores de la película',
            error: error.message
        });
    }
});

// Endpoint para asignar actores a una película
app.post('/peliculas/:id/actores', verificarToken, verificarAdmin, async (req, res) => {
    const t = await sequelize.transaction();
    try {
        const { id } = req.params;
        const { actores } = req.body; // Array de objetos {IdActor, NombrePersonaje}

        // Verificar que la película existe
        const pelicula = await Pelicula.findByPk(id);
        if (!pelicula) {
            throw new Error('Película no encontrada');
        }

        // Eliminar relaciones existentes
        await PeliculaActor.destroy({
            where: { IdPelicula: id },
            transaction: t
        });

        // Crear nuevas relaciones
        const relacionesActores = actores.map(actor => ({
            IdPelicula: id,
            IdActor: actor.IdActor,
            NombrePersonaje: actor.NombrePersonaje
        }));

        await PeliculaActor.bulkCreate(relacionesActores, { transaction: t });

        await t.commit();
        res.json({
            mensaje: 'Actores asignados exitosamente',
            actores: relacionesActores
        });
    } catch (error) {
        await t.rollback();
        console.error('Error al asignar actores:', error);
        res.status(500).json({
            mensaje: 'Error al asignar actores a la película',
            error: error.message
        });
    }
});

// Modificar los endpoints existentes de películas para incluir actores
app.get('/peliculas', async (req, res) => {
    try {
        const peliculas = await Pelicula.findAll({
            where: { Estado: 'Publicado' },
            include: [
                { 
                    model: Director,
                    attributes: ['Nombres', 'Apellidos']
                },
                {
                    model: Genero,
                    through: { attributes: [] }
                },
                {
                    model: Actor,
                    through: { attributes: ['NombrePersonaje'] }
                }
            ]
        });

        res.json(peliculas);
    } catch (error) {
        console.error('Error al obtener películas:', error);
        res.status(500).json({
            mensaje: 'Error al obtener las películas',
            error: error.message
        });
    }
});

app.get('/peliculas/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const pelicula = await Pelicula.findByPk(id, {
            include: [
                { 
                    model: Director,
                    attributes: ['Nombres', 'Apellidos']
                },
                {
                    model: Genero,
                    through: { attributes: [] }
                },
                {
                    model: Actor,
                    through: { attributes: ['NombrePersonaje'] }
                },
                {
                    model: Resena,
                    where: { Estado: 'Publicado' },
                    required: false,
                    include: [{
                        model: Usuario,
                        attributes: ['NombreUsuario']
                    }]
                }
            ]
        });

        if (!pelicula) {
            return res.status(404).json({ mensaje: 'Película no encontrada' });
        }

        res.json(pelicula);
    } catch (error) {
        console.error('Error al obtener la película:', error);
        res.status(500).json({
            mensaje: 'Error al obtener la película',
            error: error.message
        });
    }
});
// Crear una nueva reseña
app.post('/resenas', async (req, res) => {
  try {
    const { IdPelicula, IdUsuario, TituloResena, CuerpoResena, Puntuacion } = req.body;
    const nueva = await Resena.create({
      IdPelicula,
      IdUsuario,
      TituloResena,
      CuerpoResena,
      Puntuacion
    });
    res.status(201).json(nueva);
  } catch (error) {
    console.error(error);
    res.status(400).json({ mensaje: 'Error al crear reseña', error: error.message });
  }
});
app.get('/peliculas/:id/resenas', async (req, res) => {
  try {
    const { id } = req.params;
    const resenas = await Resena.findAll({
      where: { IdPelicula: id },
      include: [
        {
          model: Usuario,
          attributes: ['IdUsuario', 'NombreUsuario', 'Correo']
        }
      ],
      order: [['FechaCreacion', 'DESC']]
    });
    if (resenas.length === 0) {
      return res.status(404).json({ mensaje: 'No se encontraron reseñas para esta película' });
    }
    res.json(resenas);
  } catch (error) {
    console.error(error);
    res.status(500).json({ mensaje: 'Error al obtener reseñas de la película', error: error.message });
  }
});

// Obtener reseñas de un usuario
app.get('/usuarios/:id/resenas', async (req, res) => {
    try {
        const { id } = req.params;
        const resenas = await Resena.findAll({
            where: { IdUsuario: id },
            include: [{
                model: Pelicula,
                attributes: ['Titulo', 'Sinopsis']
            }],
            order: [['FechaCreacion', 'DESC']]
        });
        res.json(resenas);
    } catch (error) {
        console.error(error);
        res.status(500).json({ 
            mensaje: 'Error al obtener las reseñas del usuario', 
            error: error.message 
        });
    }
});

// Actualizar una reseña
app.put('/resenas/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { TituloResena, CuerpoResena, Puntuacion } = req.body;
        
        const resena = await Resena.findByPk(id);
        if (!resena) {
            return res.status(404).json({ mensaje: 'Reseña no encontrada' });
        }
        
        await resena.update({
            TituloResena,
            CuerpoResena,
            Puntuacion
        });
        
        res.json(resena);
    } catch (error) {
        console.error(error);
        res.status(500).json({ 
            mensaje: 'Error al actualizar la reseña', 
            error: error.message 
        });
    }
});

// Eliminar una reseña
app.delete('/resenas/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const resena = await Resena.findByPk(id);
        
        if (!resena) {
            return res.status(404).json({ mensaje: 'Reseña no encontrada' });
        }
        
        await resena.destroy();
        res.json({ mensaje: 'Reseña eliminada exitosamente' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ 
            mensaje: 'Error al eliminar la reseña', 
            error: error.message 
        });
    }
});

// Endpoints para gestión de usuarios (admin)
app.get('/admin/usuarios', verificarToken, verificarAdmin, async (req, res) => {
    try {
        const usuarios = await Usuario.findAll({
            attributes: ['IdUsuario', 'NombreUsuario', 'Correo', 'EstaActivo', 'FechaRegistro'],
            include: [{
                model: Rol,
                attributes: ['NombreRol']
            }],
            order: [['FechaRegistro', 'DESC']]
        });
        res.json(usuarios);
    } catch (error) {
        console.error('Error al obtener usuarios:', error);
        res.status(500).json({
            mensaje: 'Error al obtener la lista de usuarios',
            error: error.message
        });
    }
});

app.put('/admin/usuarios/:id/estado', verificarToken, verificarAdmin, async (req, res) => {
    try {
        const { id } = req.params;
        const usuario = await Usuario.findByPk(id);
        
        if (!usuario) {
            return res.status(404).json({ mensaje: 'Usuario no encontrado' });
        }

        // Cambiar el estado del usuario
        await usuario.update({
            EstaActivo: !usuario.EstaActivo
        });

        res.json({
            mensaje: `Usuario ${usuario.EstaActivo ? 'activado' : 'desactivado'} exitosamente`,
            usuario: {
                id: usuario.IdUsuario,
                nombreUsuario: usuario.NombreUsuario,
                estaActivo: usuario.EstaActivo
            }
        });
    } catch (error) {
        console.error('Error al actualizar estado del usuario:', error);
        res.status(500).json({
            mensaje: 'Error al actualizar el estado del usuario',
            error: error.message
        });
    }
});
app.get('/peliculas/:id/actualizar-promedio', async (req, res) => {
  const { id } = req.params;
  
  if (!id || isNaN(id)) {
    return res.status(400).json({ 
      mensaje: 'ID de película inválido' 
    });
  }

  try {
    const resultados = await sequelize.query(
      'EXEC sp_ActualizarPromedioPelicula @IdPelicula = :IdPelicula',
      {
        replacements: { IdPelicula: id },
        type: QueryTypes.SELECT
      }
    );

    if (resultados.length === 0) {
      return res.status(404).json({ 
        mensaje: 'Película no encontrada o sin reseñas.' 
      });
    }
    
    res.json(resultados[0]);
  } catch (error) {
    console.error('Error al actualizar promedio de película:', error);
    res.status(500).json({
      mensaje: 'Error al actualizar el promedio de la película',
      error: error.message
    });
  }
});

// Endpoints para la gestión de usuarios (admin)
app.get('/admin/usuarios', verificarToken, verificarAdmin, async (req, res) => {
    try {
        const usuarios = await Usuario.findAll({
            attributes: ['id', 'username', 'email', 'estado'],
            include: [{
                model: Rol,
                attributes: ['nombre']
            }]
        });
        res.json(usuarios);
    } catch (error) {
        console.error('Error al obtener usuarios:', error);
        res.status(500).json({
            mensaje: 'Error al obtener la lista de usuarios',
            error: error.message
        });
    }
});

app.put('/admin/usuarios/:id/estado', verificarToken, verificarAdmin, async (req, res) => {
    const { id } = req.params;
    const { estado } = req.body;

    try {
        const usuario = await Usuario.findByPk(id);
        if (!usuario) {
            return res.status(404).json({ mensaje: 'Usuario no encontrado' });
        }

        await usuario.update({ estado });
        res.json({ mensaje: 'Estado del usuario actualizado con éxito' });
    } catch (error) {
        console.error('Error al actualizar estado del usuario:', error);
        res.status(500).json({
            mensaje: 'Error al actualizar el estado del usuario',
            error: error.message
        });
    }
});

app.get('/usuarios/:id', verificarToken, async (req, res) => {
    const { id } = req.params;

    try {
        const usuario = await Usuario.findByPk(id, {
            attributes: ['id', 'username', 'email', 'estado'],
            include: [{
                model: Rol,
                attributes: ['nombre']
            }]
        });

        if (!usuario) {
            return res.status(404).json({ mensaje: 'Usuario no encontrado' });
        }

        res.json(usuario);
    } catch (error) {
        console.error('Error al obtener usuario:', error);
        res.status(500).json({
            mensaje: 'Error al obtener los datos del usuario',
            error: error.message
        });
    }
});

app.get('/resenas/usuario/:id', verificarToken, async (req, res) => {
    const { id } = req.params;

    try {
        const resenas = await Resena.findAll({
            where: { UsuarioId: id },
            include: [{
                model: Pelicula,
                attributes: ['titulo']
            }],
            order: [['fecha', 'DESC']]
        });

        const resenasFormateadas = resenas.map(resena => ({
            id: resena.id,
            fecha: resena.fecha,
            puntuacion: resena.puntuacion,
            comentario: resena.comentario,
            pelicula: resena.Pelicula.titulo
        }));

        res.json(resenasFormateadas);
    } catch (error) {
        console.error('Error al obtener reseñas del usuario:', error);
        res.status(500).json({
            mensaje: 'Error al obtener las reseñas del usuario',
            error: error.message
        });
    }
});

// Endpoints para reportes
app.get('/reportes/peliculas-puntuacion', verificarToken, verificarAdmin, async (req, res) => {
    try {
        console.log('Ejecutando sp_PeliculasMejorPuntuadas...');
        const resultados = await sequelize.query(
            'EXEC sp_PeliculasMejorPuntuadas',
            {
                type: QueryTypes.SELECT
            }
        );
        console.log('Resultados:', resultados);
        res.json(resultados || []); // Enviar array vacío si no hay resultados
    } catch (error) {
        console.error('Error al obtener reporte por puntuación:', error);
        res.status(500).json({
            mensaje: 'Error al obtener el reporte por puntuación',
            error: error.message
        });
    }
});

app.get('/reportes/peliculas-genero/:idGenero', verificarToken, verificarAdmin, async (req, res) => {
    const { idGenero } = req.params;
    
    if (!idGenero || isNaN(idGenero)) {
        return res.status(400).json({ mensaje: 'ID de género inválido' });
    }

    try {
        console.log('Ejecutando sp_PeliculasPorGenero con idGenero:', idGenero);
        const resultados = await sequelize.query(
            'EXEC sp_PeliculasPorGenero @IdGenero = :idGenero',
            {
                replacements: { idGenero: parseInt(idGenero) },
                type: QueryTypes.SELECT
            }
        );
        console.log('Resultados:', resultados);
        res.json(resultados || []); // Enviar array vacío si no hay resultados
    } catch (error) {
        console.error('Error al obtener reporte por género:', error);
        res.status(500).json({
            mensaje: 'Error al obtener el reporte por género',
            error: error.message
        });
    }
});

// Endpoint para obtener géneros
app.get('/generos', async (req, res) => {
    try {
        const generos = await Genero.findAll({
            attributes: ['IdGenero', 'NombreGenero'],
            order: [['NombreGenero', 'ASC']]
        });
        res.json(generos);
    } catch (error) {
        console.error('Error al obtener géneros:', error);
        res.status(500).json({
            mensaje: 'Error al obtener la lista de géneros',
            error: error.message
        });
    }
});

// Inicializar servidor
sequelize.authenticate()
    .then(() => {
        console.log("Conexión exitosa a SQL Server");
        return sequelize.sync({ force: false });
    })
    .then(() => {
        console.log('Modelo sincronizado con la base de datos');
        const PORT = 5000;
        app.listen(PORT, () => {
            console.log(`Servidor corriendo en el puerto ${PORT}`);
        });
    })
    .catch(err => {
        console.error("Error de conexión o sincronización:", err);
    });



