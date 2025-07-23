// Script para insertar roles básicos
const insertarRoles = async () => {
    try {
        // Verificar si ya existen roles
        const rolesExistentes = await Rol.findAll();
        if (rolesExistentes.length === 0) {
            // Insertar roles básicos
            await Rol.bulkCreate([
                { NombreRol: 'Administrador' },
                { NombreRol: 'Cliente' }
            ]);
            console.log('Roles básicos insertados correctamente');
        } else {
            console.log('Los roles ya existen en la base de datos');
        }
    } catch (error) {
        console.error('Error al insertar roles:', error);
    }
};

module.exports = { insertarRoles };
