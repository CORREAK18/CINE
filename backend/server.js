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
    if (req.usuario.rol !== 1) { // Asumiendo que IdRol 1 es para administradores
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
            IdRol: 2, // Rol normal de usuario
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
        });

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



