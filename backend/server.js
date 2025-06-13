const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = 3000;

app.use(cors());
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, 'public')));


const DB_FILE = path.join(__dirname, 'db.json');

const generateAuctionDates = (daysUntilEnd) => {
  const now = new Date();
  const endDate = new Date();
  endDate.setDate(now.getDate() + daysUntilEnd);
  return {
    fechaInicio: now.toISOString(),
    fechaFinal: endDate.toISOString(),
  };
};

const getDefaultData = () => ({
  users: [],
  subastas: [],
  subastasPendientes: [],
  admins: [] // Valor por defecto para administradores
});

const readDB = () => {
    try {
        if (fs.existsSync(DB_FILE)) {
            const data = fs.readFileSync(DB_FILE, 'utf8');
            // Parseamos los datos, pero si falta alguna clave, usamos el valor por defecto.
            const jsonData = { ...getDefaultData(), ...JSON.parse(data) };
            return jsonData;
        }
    } catch (error) {
        console.error("Error al leer db.json:", error);
    }
    return getDefaultData();
};

const writeDB = (data) => {
    try {
        fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2));
    } catch (error) {
        console.error("Error al escribir en db.json:", error);
    }
};

let db = readDB();


// --- RUTA DE LOGIN MODIFICADA PARA MANEJAR ADMINS ---
app.post('/api/auth/login', (req, res) => {
    const { email, password } = req.body;

    // 1. Primero, buscar en la lista de administradores
    const admin = db.admins.find(a => a.email === email && a.password === password);
    if (admin) {
        console.log(`Administrador ${email} autenticado.`);
        // Creamos un objeto de respuesta para el admin con su rol
        const adminData = {
            id: admin.id,
            email: admin.email,
            nombre: admin.nombre,
            rol: 'admin' // Propiedad clave para el frontend
        };
        return res.json({ token: 'fake-admin-jwt-token', user: adminData });
    }

    // 2. Si no es admin, buscar en la lista de usuarios normales
    const user = db.users.find(u => u.email === email && u.password === password);
    if (user) {
        console.log(`Usuario ${email} autenticado.`);
        // Añadimos rol de 'user' al objeto de usuario para consistencia
        const userData = { ...user, rol: 'user' };
        return res.json({ token: 'fake-jwt-token-for-dev', user: userData });
    }

    // 3. Si no se encuentra en ninguna lista, credenciales inválidas
    res.status(401).json({ message: 'Credenciales inválidas' });
});
// --- FIN DE LA RUTA DE LOGIN MODIFICADA ---


app.post('/api/auth/register', (req, res) => {
    const { email, password, tipoCuenta, ...profileData } = req.body;

    if (!email || !tipoCuenta || Object.keys(profileData).length === 0) {
        return res.status(400).json({ message: "Faltan datos para el registro." });
    }

    let user = db.users.find(u => u.email === email);

    if (!user) {
        if (!password) return res.status(400).json({ message: "La contraseña es requerida." });
        user = { id: Date.now(), email, password, perfilPersonal: null, perfilGanaderia: null };
        db.users.push(user);
    }

    if (tipoCuenta === 'Personal') {
        if (user.perfilPersonal) return res.status(409).json({ message: 'Ya existe un perfil personal.' });
        user.perfilPersonal = profileData;
    } else if (tipoCuenta === 'Ganaderia') {
        if (user.perfilGanaderia) return res.status(409).json({ message: 'Ya existe un perfil de ganadería.' });
        user.perfilGanaderia = profileData;
    } else {
        return res.status(400).json({ message: 'Tipo de cuenta no válido.' });
    }
    
    writeDB(db);
    res.status(201).json({ message: `Registro de perfil '${tipoCuenta}' exitoso`, user: user });
});

app.delete('/api/auth/account', (req, res) => {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ message: "Email y contraseña requeridos." });

    const userIndex = db.users.findIndex(u => u.email === email && u.password === password);
    if (userIndex === -1) return res.status(404).json({ message: "Usuario no encontrado o credenciales incorrectas." });

    db.users.splice(userIndex, 1);
    writeDB(db);
    res.status(200).json({ message: "Cuenta eliminada exitosamente." });
});

app.get('/api/subastas', (req, res) => {
  res.status(200).json(db.subastas);
});


app.get('/api/admin/subastas-pendientes', (req, res) => {
  // Aquí podrías añadir lógica para verificar si el que pide es un admin (usando un token/middleware real)
  res.status(200).json(db.subastasPendientes || []);
});

app.post('/api/admin/subastas/:id/manage', (req, res) => {
  const subastaId = parseInt(req.params.id, 10);
  const { action } = req.body; // action puede ser 'aprobar' o 'rechazar'

  const subastaIndex = db.subastasPendientes.findIndex(s => s.id === subastaId);
  if (subastaIndex === -1) {
    return res.status(404).json({ message: "Subasta pendiente no encontrada." });
  }

  // Extraer la subasta de la lista de pendientes
  const [subastaGestionada] = db.subastasPendientes.splice(subastaIndex, 1);

  if (action === 'aprobar') {
    // Si se aprueba, se mueve a la lista de subastas activas
    subastaGestionada.estado = 'activa'; // O 'Nuevo', como prefieras
    subastaGestionada.fechaInicio = new Date().toISOString(); // Se establece la fecha de inicio al aprobar
    db.subastas.push(subastaGestionada);
    writeDB(db);
    console.log(`Subasta ${subastaId} aprobada.`);
    return res.status(200).json({ message: "Subasta aprobada exitosamente." });

  } else if (action === 'rechazar') {
    // Si se rechaza, simplemente se elimina (o se podría mover a otra lista 'rechazadas')
    writeDB(db);
    console.log(`Subasta ${subastaId} rechazada.`);
    return res.status(200).json({ message: "Subasta rechazada exitosamente." });

  } else {
    // Si la acción no es válida, la devolvemos a pendientes
    db.subastasPendientes.push(subastaGestionada);
    return res.status(400).json({ message: "Acción no válida." });
  }
});

app.get('/api/subastas/:id', (req, res) => {
  const subastaId = parseInt(req.params.id, 10);
  const subasta = db.subastas.find(s => s.id === subastaId);
  if (subasta) res.status(200).json(subasta);
  else res.status(404).json({ message: "Subasta no encontrada" });
});

app.post('/api/subastas/:id/pujar', (req, res) => {
  const subastaId = parseInt(req.params.id, 10);
  const { montoPuja, pujador } = req.body;

  if (!montoPuja || !pujador) return res.status(400).json({ message: "Faltan datos." });
  
  const subasta = db.subastas.find(s => s.id === subastaId);
  if (!subasta) return res.status(404).json({ message: "Subasta no encontrada." });
  
  if (new Date(subasta.fechaFinal) < new Date()) return res.status(400).json({ message: "Esta subasta ya finalizó." });

  const pujaActual = subasta.puja || subasta.precioInicial;
  if (montoPuja <= pujaActual) return res.status(400).json({ message: `Puja debe ser mayor a ${pujaActual}` });

  subasta.puja = montoPuja;
  subasta.pujador = pujador;
  writeDB(db);

  res.status(200).json(subasta);
});


app.get('/api/user/subastas', (req, res) => {
  const { nombreVendedor } = req.query;

  if (!nombreVendedor) {
    return res.status(400).json({ message: "Se requiere el nombre del vendedor." });
  }

  // Buscamos en ambas listas: activas y pendientes
  const activas = db.subastas.filter(s => s.vendedor?.nombre === nombreVendedor);
  const pendientes = db.subastasPendientes.filter(s => s.vendedor?.nombre === nombreVendedor);

  // Unimos los resultados
  const misSubastas = [...pendientes, ...activas];

  res.status(200).json(misSubastas);
});


app.post('/api/subastas', (req, res) => {
  const newAuctionData = req.body;

  if (!newAuctionData.raza || !newAuctionData.precioInicial || !newAuctionData.fechaFinal) {
    return res.status(400).json({ message: "Faltan datos esenciales para crear la subasta." });
  }

  const newPendingAuction = {
    id: Date.now(), 
    ...newAuctionData,
    fechaInicio: new Date().toISOString(), 
    estado: 'pendiente' 
  };

  db.subastasPendientes.push(newPendingAuction);
  writeDB(db);

  console.log('Nueva subasta pendiente registrada:', newPendingAuction.id);
  res.status(201).json({ message: "Subasta registrada y pendiente de aprobación.", subasta: newPendingAuction });
});


app.listen(PORT, () => {
  console.log(`Servidor backend de Subastas corriendo en http://localhost:${PORT}`);
});