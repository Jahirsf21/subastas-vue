const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const multer = require('multer');

const app = express();
const PORT = 3000;

app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const dir = 'public/uploads/';
    if (!fs.existsSync(dir)){
        fs.mkdirSync(dir, { recursive: true });
    }
    cb(null, dir);
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + '-' + file.originalname);
  }
});
const upload = multer({ storage: storage });

const DB_FILE = path.join(__dirname, 'db.json');

const getDefaultData = () => ({
  users: [],
  subastas: [],
  subastasPendientes: [],
  subastasRechazadas: [],
  admins: []
});

const readDB = () => {
    try {
        if (fs.existsSync(DB_FILE)) {
            const data = fs.readFileSync(DB_FILE, 'utf8');
            return { ...getDefaultData(), ...JSON.parse(data) };
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

function migrarEstructuraDatos(database) {
  let modificado = false;
  
  const listasDeSubastas = [
    database.subastas, 
    database.subastasPendientes, 
    database.subastasRechazadas
  ];

  listasDeSubastas.forEach(lista => {
    if (Array.isArray(lista)) {
      lista.forEach(subasta => {
        if (!subasta.historialPujas) { subasta.historialPujas = []; modificado = true; }
        if (typeof subasta.ganador === 'undefined') { subasta.ganador = null; modificado = true; }
        if (subasta.fechaFinal && !subasta.duracion) { subasta.duracion = { valor: 7, unidad: 'dias'}; modificado = true; }
      });
    }
  });

  // CAMBIO: Migración para usuarios. Asegura que cada usuario tenga un array de 'paymentMethods'.
  if (Array.isArray(database.users)) {
    database.users.forEach(user => {
      if (!user.paymentMethods) {
        user.paymentMethods = [];
        modificado = true;
      }
    });
  }

  if (modificado) {
    console.log('Estructura de datos actualizada automáticamente.');
    writeDB(database);
  }
}

migrarEstructuraDatos(db);

// --- Rutas de Autenticación ---
app.post('/api/auth/login', (req, res) => {
    const { email, password } = req.body;
    const admin = db.admins.find(a => a.email === email && a.password === password);
    if (admin) {
        const adminData = { ...admin, rol: 'admin' };
        return res.json({ token: 'fake-admin-jwt-token', user: adminData });
    }
    const user = db.users.find(u => u.email === email && u.password === password);
    if (user) {
        const userData = { ...user, rol: 'user' };
        return res.json({ token: 'fake-jwt-token-for-dev', user: userData });
    }
    res.status(401).json({ message: 'Credenciales inválidas' });
});

app.post('/api/auth/register', (req, res) => {
    const { email, password, tipoCuenta, ...profileData } = req.body;
    if (!email || !tipoCuenta || Object.keys(profileData).length === 0) {
        return res.status(400).json({ message: "Faltan datos para el registro." });
    }
    let user = db.users.find(u => u.email === email);
    if (!user) {
        if (!password) return res.status(400).json({ message: "La contraseña es requerida." });
        // CAMBIO: Se inicializa el usuario con el array de métodos de pago vacío.
        user = { id: Date.now(), email, password, perfilPersonal: null, perfilGanaderia: null, paymentMethods: [] };
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

// --- RUTAS DE SUBASTAS ---
app.post('/api/subastas', upload.array('imagenes', 5), (req, res) => {
    const newAuctionData = req.body;
    const files = req.files;

    if (!newAuctionData.titulo || !newAuctionData.precioInicial || !newAuctionData.duracionValor || !newAuctionData.duracionUnidad) {
        return res.status(400).json({ message: "Faltan datos esenciales (título, precio, duración) para crear la subasta." });
    }
    if (!newAuctionData.vendedorId) {
        return res.status(400).json({ message: "Falta el ID del vendedor para crear la subasta." });
    }

    const imagePaths = files ? files.map(file => `/uploads/${file.filename}`) : [];

    const newPendingAuction = {
        id: Date.now(),
        ...newAuctionData,
        precioInicial: parseFloat(newAuctionData.precioInicial),
        imagenes: imagePaths,
        imagen: imagePaths.length > 0 ? imagePaths[0] : '/img/placeholder.jpg',
        fechaInicio: null,
        fechaFinal: null,
        estado: 'pendiente',
        duracion: {
            valor: parseInt(newAuctionData.duracionValor, 10),
            unidad: newAuctionData.duracionUnidad
        },
        vendedor: {
            id: parseInt(newAuctionData.vendedorId, 10),
            tipo: newAuctionData.vendedorTipo,
            nombre: newAuctionData.vendedorNombre,
        },
        historialPujas: [],
        ganador: null
    };

    delete newPendingAuction.vendedorId; 
    delete newPendingAuction.vendedorTipo;
    delete newPendingAuction.vendedorNombre;
    delete newPendingAuction.duracionValor;
    delete newPendingAuction.duracionUnidad;

    db.subastasPendientes.push(newPendingAuction);
    writeDB(db);

    res.status(201).json({ 
        message: "Subasta registrada y pendiente de aprobación.", 
        subasta: newPendingAuction 
    });
});

app.get('/api/subastas', (req, res) => {
  res.status(200).json(db.subastas);
});

app.get('/api/subastas/:id', (req, res) => {
  const subastaId = parseInt(req.params.id, 10);
  const subasta = db.subastas.find(s => s.id === subastaId) || 
                  db.subastasPendientes.find(s => s.id === subastaId) ||
                  db.subastasRechazadas.find(s => s.id === subastaId);
  if (subasta) res.status(200).json(subasta);
  else res.status(404).json({ message: "Subasta no encontrada" });
});

app.post('/api/subastas/:id/pujar', (req, res) => {
  const subastaId = parseInt(req.params.id, 10);
  const { montoPuja, pujador } = req.body;
  if (!montoPuja || !pujador || !pujador.id || !pujador.nombre) {
    return res.status(400).json({ message: "Faltan datos de la puja o del pujador." });
  }
  const subasta = db.subastas.find(s => s.id === subastaId);
  if (!subasta) return res.status(404).json({ message: "Subasta no encontrada." });
  if (new Date(subasta.fechaFinal) < new Date() || subasta.estado !== 'activa') return res.status(400).json({ message: "Esta subasta no está activa o ya finalizó." });
  
  const pujaActual = subasta.puja || subasta.precioInicial;
  if (montoPuja <= pujaActual) return res.status(400).json({ message: `La puja debe ser mayor a ${pujaActual}` });

  subasta.puja = montoPuja;
  subasta.pujador = pujador;
  if (!subasta.historialPujas) { subasta.historialPujas = []; }
  subasta.historialPujas.push({
    usuarioId: pujador.id,
    nombrePujador: pujador.nombre,
    monto: montoPuja,
    fecha: new Date().toISOString()
  });
  writeDB(db);
  res.status(200).json(subasta);
});

app.post('/api/subastas/:id/finalizar', (req, res) => {
  const subastaId = parseInt(req.params.id, 10);
  const { ganadorInfo } = req.body;
  if (!ganadorInfo || !ganadorInfo.usuarioId || !ganadorInfo.monto) {
    return res.status(400).json({ message: "Se requieren los datos del ganador." });
  }
  const subasta = db.subastas.find(s => s.id === subastaId);
  if (!subasta) return res.status(404).json({ message: "Subasta no encontrada." });
  subasta.estado = 'finalizada';
  subasta.ganador = ganadorInfo;
  writeDB(db);
  res.status(200).json({ message: "Subasta finalizada y ganador seleccionado.", subasta });
});

// --- RUTAS DE USUARIO ---
app.get('/api/user/subastas', (req, res) => {
  const { nombreVendedor } = req.query;
  if (!nombreVendedor) return res.status(400).json({ message: "Se requiere el nombre del vendedor." });
  const activas = db.subastas.filter(s => s.vendedor?.nombre === nombreVendedor);
  const pendientes = db.subastasPendientes.filter(s => s.vendedor?.nombre === nombreVendedor);
  const rechazadas = db.subastasRechazadas.filter(s => s.vendedor?.nombre === nombreVendedor);
  res.status(200).json([...pendientes, ...rechazadas, ...activas]);
});

app.get('/api/user/:userId/pujas', (req, res) => {
    const userId = parseInt(req.params.userId, 10);
    if (!userId) return res.status(400).json({ message: "ID de usuario no válido." });
    const todasLasSubastas = [...db.subastas, ...db.subastasPendientes, ...db.subastasRechazadas];
    const pujasDelUsuario = [];
    todasLasSubastas.forEach(subasta => {
        const pujasEnEstaSubasta = subasta.historialPujas?.filter(p => p.usuarioId === userId) || [];
        if (pujasEnEstaSubasta.length > 0) {
            const miPujaMasAlta = pujasEnEstaSubasta.reduce((max, p) => p.monto > max.monto ? p : max, pujasEnEstaSubasta[0]);
            let estadoPuja = 'pendiente';
            if (subasta.estado === 'finalizada') {
                if (subasta.ganador && subasta.ganador.usuarioId === userId) {
                    estadoPuja = 'aceptado';
                } else {
                    estadoPuja = 'rechazado';
                }
            } else if (subasta.estado === 'cancelada' || subasta.estado === 'rechazada') {
                estadoPuja = 'cancelado';
            }
            pujasDelUsuario.push({
                subastaId: subasta.id,
                titulo: subasta.titulo,
                imagen: subasta.imagen,
                miPuja: miPujaMasAlta.monto,
                pujaActual: subasta.puja || subasta.precioInicial,
                estadoPuja: estadoPuja,
            });
        }
    });
    res.status(200).json(pujasDelUsuario);
});

// CAMBIO: NUEVAS RUTAS PARA MÉTODOS DE PAGO
app.get('/api/user/:userId/payment-methods', (req, res) => {
  const userId = parseInt(req.params.userId, 10);
  const user = db.users.find(u => u.id === userId);
  if (!user) {
    return res.status(404).json({ message: 'Usuario no encontrado.' });
  }
  res.status(200).json(user.paymentMethods || []);
});

app.post('/api/user/:userId/payment-methods', (req, res) => {
  const userId = parseInt(req.params.userId, 10);
  const user = db.users.find(u => u.id === userId);
  if (!user) {
    return res.status(404).json({ message: 'Usuario no encontrado.' });
  }
  
  const newCard = req.body;
  if (!newCard.number || !newCard.expiry || !newCard.cvc) {
    return res.status(400).json({ message: 'Datos de la tarjeta incompletos.' });
  }

  if(!user.paymentMethods) user.paymentMethods = [];

  newCard.id = Date.now();
  user.paymentMethods.push(newCard);
  
  writeDB(db);
  res.status(201).json({ message: 'Tarjeta agregada.', user: user });
});

app.delete('/api/user/:userId/payment-methods/:cardId', (req, res) => {
  const userId = parseInt(req.params.userId, 10);
  const cardId = parseInt(req.params.cardId, 10);
  const user = db.users.find(u => u.id === userId);
  if (!user) {
    return res.status(404).json({ message: 'Usuario no encontrado.' });
  }

  const cardIndex = user.paymentMethods.findIndex(c => c.id === cardId);
  if (cardIndex === -1) {
    return res.status(404).json({ message: 'Tarjeta no encontrada.' });
  }
  
  user.paymentMethods.splice(cardIndex, 1);
  
  writeDB(db);
  res.status(200).json({ message: 'Tarjeta eliminada.', user: user });
});


// --- RUTAS DE ADMINISTRADOR ---
app.get('/api/admin/subastas-pendientes', (req, res) => {
  res.status(200).json(db.subastasPendientes || []);
});

app.post('/api/admin/subastas/:id/manage', (req, res) => {
  const subastaId = parseInt(req.params.id, 10);
  const { action } = req.body;
  const subastaIndex = db.subastasPendientes.findIndex(s => s.id === subastaId);
  if (subastaIndex === -1) return res.status(404).json({ message: "Subasta pendiente no encontrada." });
  
  const [subastaGestionada] = db.subastasPendientes.splice(subastaIndex, 1);
  
  if (action === 'aprobar') {
    subastaGestionada.estado = 'activa';
    subastaGestionada.fechaInicio = new Date().toISOString();
    
    const ahora = new Date();
    const valor = subastaGestionada.duracion.valor;
    const unidad = subastaGestionada.duracion.unidad;

    if (unidad === 'dias') {
      ahora.setDate(ahora.getDate() + valor);
    } else if (unidad === 'horas') {
      ahora.setHours(ahora.getHours() + valor);
    } else {
        ahora.setDate(ahora.getDate() + 7);
    }
    
    subastaGestionada.fechaFinal = ahora.toISOString();

    db.subastas.push(subastaGestionada);
    writeDB(db);
    return res.status(200).json({ message: "Subasta aprobada exitosamente." });

  } else if (action === 'rechazar') {
    subastaGestionada.estado = 'rechazada';
    db.subastasRechazadas.push(subastaGestionada);
    writeDB(db);
    return res.status(200).json({ message: "Subasta rechazada exitosamente." });
  
  } else {
    db.subastasPendientes.push(subastaGestionada);
    return res.status(400).json({ message: "Acción no válida." });
  }
});

// --- INICIO DEL SERVIDOR ---
app.listen(PORT, () => {
  console.log(`Servidor backend de Subastas corriendo en http://localhost:${PORT}`);
});