// ARCHIVO DE TU SERVIDOR BACKEND (index.js o server.js)

// --- 1. Importaciones y Configuración Inicial ---
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const path = require('path');

const app = express();
const PORT = 3000;

// --- 2. Middleware ---
app.use(cors()); 
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, 'public')));


// --- 3. Base de Datos en Memoria (con estructura de vendedor actualizada) ---
const users = []; 

const generateAuctionDates = (daysUntilEnd) => {
  const now = new Date();
  const endDate = new Date();
  endDate.setDate(now.getDate() + daysUntilEnd);
  return {
    fechaInicio: now.toISOString(),
    fechaFinal: endDate.toISOString(),
  };
};

const subastas = [
  { 
    id: 1, 
    titulo: "Brahman gris", 
    descripcion: "Toro de alta genética, ideal para reproducción. Excelente temperamento y desarrollo muscular.", 
    precioInicial: 1200000.00, 
    raza: "Brahman", 
    edad: "3 años", 
    peso: "1300 kg", 
    genetica: "Pura", 
    certificaciones: "/certificados/cert1.pdf", 
    imagenes: ["/brahman-gris-toro.png"], 
    pujador: "Jose Emilio", 
    puja: 1250000.00, 
    genero: "Macho",
    categoria: "Toro",
    estado: "Nuevo", 
    imagen: "/brahman-gris-toro.png", 
    vendedor: {
      tipo: 'Ganaderia', // 'Ganaderia' o 'Personal'
      nombre: "Ganadería El Sol",
      logo: "/logo-ganaderia.png" 
    },
    ...generateAuctionDates(3) 
  },
  { 
    id: 2, 
    titulo: "Vaca Jersey Lechera", 
    descripcion: "Vaca de primer parto, excelente producción lechera.", 
    precioInicial: 900000.00, 
    raza: "Jersey", 
    edad: "4 años", 
    peso: "450 kg", 
    genetica: "Pura", 
    certificaciones: "/certificados/cert2.pdf", 
    imagenes: ["/brahman-blanco.png"], 
    pujador: "Ernesto", 
    puja: 920000.00, 
    genero: "Hembra",
    categoria: "Vaca",
    estado: "Nuevo", 
    imagen: "/brahman-blanco.png", 
    vendedor: {
      tipo: 'Personal',
      nombre: "Carlos Rojas Vega",
      logo: null // O un avatar genérico '/avatar-personal.png'
    },
    ...generateAuctionDates(1) 
  },
  { 
    id: 4, 
    titulo: "Brahman rojo", 
    descripcion: "Ternera de destete con excelente potencial para futura madre.", 
    precioInicial: 1140000.00, 
    raza: "Brahman", 
    edad: "10 meses", 
    peso: "250 kg", 
    genetica: "7/8 Brahman", 
    certificaciones: "/certificados/cert4.pdf", 
    imagenes: ["/vaca4.png"], 
    pujador: null, 
    puja: 0, 
    genero: "Hembra",
    categoria: "Ternera",
    estado: "Nuevo", 
    imagen: "/vaca4.png", 
    vendedor: {
      tipo: 'Ganaderia',
      nombre: "Ganadería Colono Real S.A.",
      logo: "/logo-ganaderia.png"
    },
    ...generateAuctionDates(5) 
  },
  { 
    id: 8, 
    titulo: "Novillo Gyr", 
    descripcion: "Novillo listo para engorde, excelente conversión alimenticia.", 
    precioInicial: 240000.00, 
    raza: "Gyr", 
    edad: "18 meses", 
    peso: "350 kg", 
    genetica: "F1 (Gyr x Holstein)", 
    certificaciones: "/certificados/cert8.pdf", 
    imagenes: ["/vaca7.png"], 
    pujador: "Hacienda San Pedro", 
    puja: 240000.00, 
    genero: "Macho",
    categoria: "Novillo",
    estado: "Nuevo", 
    imagen: "/vaca7.png", 
    vendedor: {
      tipo: 'Ganaderia',
      nombre: "Hacienda San Pedro",
      logo: "/logo-ganaderia.png"
    },
    ...generateAuctionDates(2) 
  }
];


// --- 4. Rutas de la API (Endpoints) ---
app.post('/api/auth/register', (req, res) => {
    const newUser = req.body;
    const emailExists = users.some(user => user.email === newUser.email);
    if (emailExists) {
        return res.status(409).json({ message: 'El correo electrónico ya está en uso.' });
    }
    users.push(newUser); 
    res.status(201).json({ message: 'Usuario registrado exitosamente' });
});

app.post('/api/auth/login', (req, res) => {
    const { email, password } = req.body;
    const user = users.find(u => u.email === email && u.password === password);
    if (user) {
        return res.json({ token: 'fake-jwt-token-for-development', user: { email: user.email, nombre: user.nombreCompleto } });
    }
    res.status(401).json({ message: 'Credenciales inválidas' });
});

app.get('/api/subastas', (req, res) => {
  res.status(200).json(subastas);
});

app.get('/api/subastas/:id', (req, res) => {
  const subastaId = parseInt(req.params.id, 10);
  const subasta = subastas.find(s => s.id === subastaId);
  if (subasta) {
    res.status(200).json(subasta);
  } else {
    res.status(404).json({ message: "Subasta no encontrada" });
  }
});

app.post('/api/subastas/:id/pujar', (req, res) => {
  const subastaId = parseInt(req.params.id, 10);
  const { montoPuja, pujador } = req.body;

  if (!montoPuja || !pujador) {
    return res.status(400).json({ message: "Faltan datos para realizar la puja." });
  }
  
  const subastaIndex = subastas.findIndex(s => s.id === subastaId);
  if (subastaIndex === -1) {
    return res.status(404).json({ message: "Subasta no encontrada" });
  }

  const subasta = subastas[subastaIndex];
  
  if (new Date(subasta.fechaFinal) < new Date()) {
    return res.status(400).json({ message: "Esta subasta ya ha finalizado." });
  }

  const pujaActual = subasta.puja || subasta.precioInicial;
  if (montoPuja <= pujaActual) {
    return res.status(400).json({ message: `Tu puja debe ser mayor a la puja actual de ${pujaActual}` });
  }

  subasta.puja = montoPuja;
  subasta.pujador = pujador;

  console.log(`Nueva puja en subasta ${subastaId}: ${montoPuja} por ${pujador}`);
  res.status(200).json(subasta);
});


// --- 5. Iniciar el Servidor ---
app.listen(PORT, () => {
  console.log(`Servidor backend de Subastas corriendo en http://localhost:${PORT}`);
});