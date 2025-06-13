
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
  subastas: []
});

const readDB = () => {
    try {
        if (fs.existsSync(DB_FILE)) {
            const data = fs.readFileSync(DB_FILE, 'utf8');
            const jsonData = JSON.parse(data);
            jsonData.users = jsonData.users || [];
            jsonData.subastas = jsonData.subastas || getDefaultData().subastas;
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


app.post('/api/auth/login', (req, res) => {
    const { email, password } = req.body;
    const user = db.users.find(u => u.email === email && u.password === password);
    if (user) {
        console.log(`Usuario ${email} autenticado.`);
        return res.json({ token: 'fake-jwt-token-for-dev', user });
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

app.listen(PORT, () => {
  console.log(`Servidor backend de Subastas corriendo en http://localhost:${PORT}`);
});