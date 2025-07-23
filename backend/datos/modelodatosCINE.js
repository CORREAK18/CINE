require('dotenv').config();
const { Sequelize, DataTypes } = require('sequelize');

// Configuración de diagnóstico
const config = {
    host: process.env.DB_SERVER,
    dialect: "mssql",
    dialectOptions: {
        options: {
            encrypt: true,
            trustServerCertificate: true,
            enableArithAbort: true,
            validateBulkLoadParameters: false,
            connectTimeout: 60000, // 60 segundos
            requestTimeout: 60000,
            port: 1433  // Especificar el puerto explícitamente
        }
    },
    pool: {
        max: 5,
        min: 0,
        acquire: 60000,
        idle: 10000
    },
    logging: (msg) => console.log('Sequelize Log:', msg)
};

console.log('Intentando conectar a la base de datos con la siguiente configuración:', {
    host: config.host,
    database: process.env.DB_NAME,
    user: process.env.DB_USER,
    dialect: config.dialect,
    port: config.dialectOptions.options.port
});

const sequelize = new Sequelize(
    process.env.DB_NAME,
    process.env.DB_USER,
    process.env.DB_PASSWORD,
    config
);

// Prueba de conexión inicial
sequelize.authenticate()
    .then(() => {
        console.log('✅ Conexión establecida correctamente a:', process.env.DB_SERVER);
        console.log('   Base de datos:', process.env.DB_NAME);
        console.log('   Usuario:', process.env.DB_USER);
    })
    .catch(err => {
        console.error('❌ Error al conectar a la base de datos:');
        console.error('   Servidor:', process.env.DB_SERVER);
        console.error('   Base de datos:', process.env.DB_NAME);
        console.error('   Usuario:', process.env.DB_USER);
        console.error('   Error:', err.message);
        if (err.parent) {
            console.error('   Error detallado:', err.parent.message);
        }
    });

// Definición de modelos
const Rol = sequelize.define('Rol', {
    IdRol: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    NombreRol: {
        type: DataTypes.STRING(30),
        allowNull: false,
        unique: true
    }
}, {
    tableName: 'Roles',
    timestamps: false
});

const Usuario = sequelize.define('Usuario', {
    IdUsuario: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    NombreUsuario: {
        type: DataTypes.STRING(50),
        allowNull: false,
        unique: true
    },
    Correo: {
        type: DataTypes.STRING(100),
        allowNull: false,
        unique: true
    },
    ClaveHash: {
        type: DataTypes.STRING(256),
        allowNull: false
    },
    IdRol: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    FechaRegistro: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('GETDATE()')
    },
    EstaActivo: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: true
    }
}, {
    tableName: 'Usuarios',
    timestamps: false
});

const Director = sequelize.define('Director', {
    IdDirector: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    Nombres: {
        type: DataTypes.STRING(50),
        allowNull: false
    },
    Apellidos: {
        type: DataTypes.STRING(50),
        allowNull: false
    },
    FechaNacimiento: {
        type: DataTypes.DATE,
        allowNull: true
    }
}, {
    tableName: 'Directores',
    timestamps: false
});

const Actor = sequelize.define('Actor', {
    IdActor: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    Nombres: {
        type: DataTypes.STRING(50),
        allowNull: false
    },
    Apellidos: {
        type: DataTypes.STRING(50),
        allowNull: false
    },
    FechaNacimiento: {
        type: DataTypes.DATE,
        allowNull: true
    }
}, {
    tableName: 'Actores',
    timestamps: false
});

const Genero = sequelize.define('Genero', {
    IdGenero: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    NombreGenero: {
        type: DataTypes.STRING(30),
        allowNull: false,
        unique: true
    }
}, {
    tableName: 'Generos',
    timestamps: false
});

const Pelicula = sequelize.define('Pelicula', {
    IdPelicula: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    Titulo: {
        type: DataTypes.STRING(200),
        allowNull: false
    },
    Sinopsis: {
        type: DataTypes.TEXT,
        allowNull: true
    },
    AnioEstreno: {
        type: DataTypes.SMALLINT,
        allowNull: false
    },
    IdDirector: {
        type: DataTypes.INTEGER,
        allowNull: true
    },
    UrlPoster: {
        type: DataTypes.STRING(500),
        allowNull: true
    },
    UrlTrailer: {
        type: DataTypes.STRING(500),
        allowNull: true
    },
    FechaPublicacion: {
        type: DataTypes.DATE,
        allowNull: true
    },
    Estado: {
        type: DataTypes.STRING(20),
        allowNull: false,
        defaultValue: 'Borrador'
    },
    CalificacionPromedio: {
        type: DataTypes.DECIMAL(3, 2),
        allowNull: true
    }
}, {
    tableName: 'Peliculas',
    timestamps: false
});

const PeliculaGenero = sequelize.define('PeliculaGenero', {
    IdPelicula: {
        type: DataTypes.INTEGER,
        primaryKey: true
    },
    IdGenero: {
        type: DataTypes.INTEGER,
        primaryKey: true
    }
}, {
    tableName: 'PeliculaGenero',
    timestamps: false
});

const PeliculaActor = sequelize.define('PeliculaActor', {
    IdPelicula: {
        type: DataTypes.INTEGER,
        primaryKey: true
    },
    IdActor: {
        type: DataTypes.INTEGER,
        primaryKey: true
    },
    NombrePersonaje: {
        type: DataTypes.STRING(100),
        allowNull: true
    }
}, {
    tableName: 'PeliculaActor',
    timestamps: false
});

const Resena = sequelize.define('Resena', {
    IdResena: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    IdPelicula: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    IdUsuario: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    TituloResena: {
        type: DataTypes.STRING(200),
        allowNull: false
    },
    CuerpoResena: {
        type: DataTypes.TEXT,
        allowNull: false
    },
    Puntuacion: {
        type: DataTypes.TINYINT,
        allowNull: false,
        validate: {
            min: 1,
            max: 10
        }
    },
    FechaCreacion: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: Sequelize.NOW
    },
    Estado: {
        type: DataTypes.STRING(20),
        allowNull: false,
        defaultValue: 'Pendiente'
    }
}, {
    tableName: 'Resenas',
    timestamps:  false
});

// Definir las relaciones
Usuario.belongsTo(Rol, { foreignKey: 'IdRol' });
Rol.hasMany(Usuario, { foreignKey: 'IdRol' });

Pelicula.belongsTo(Director, { foreignKey: 'IdDirector' });
Director.hasMany(Pelicula, { foreignKey: 'IdDirector' });

Pelicula.belongsToMany(Genero, { through: PeliculaGenero, foreignKey: 'IdPelicula' });
Genero.belongsToMany(Pelicula, { through: PeliculaGenero, foreignKey: 'IdGenero' });

Pelicula.belongsToMany(Actor, { through: PeliculaActor, foreignKey: 'IdPelicula' });
Actor.belongsToMany(Pelicula, { through: PeliculaActor, foreignKey: 'IdActor' });

Resena.belongsTo(Pelicula, { foreignKey: 'IdPelicula' });
Pelicula.hasMany(Resena, { foreignKey: 'IdPelicula' });

Resena.belongsTo(Usuario, { foreignKey: 'IdUsuario' });
Usuario.hasMany(Resena, { foreignKey: 'IdUsuario' });

// Exportar los modelos y la conexión
module.exports = {
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
};
