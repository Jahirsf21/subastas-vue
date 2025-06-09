// ARCHIVO DE TU SERVIDOR BACKEND (index.js o server.js)

const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');

const app = express();
const PORT = 3000;

// Middlewares
app.use(cors()); // Permite peticiones desde otros orígenes (como tu frontend en localhost:5173)
app.use(bodyParser.json()); // Parsea los cuerpos de las peticiones a JSON

// --- "Base de Datos" Temporal en Memoria ---
const users = []; 

// Función para generar fechas dinámicas para las subastas
const generateAuctionDates = (daysUntilEnd) => {
  const now = new Date();
  const endDate = new Date();
  endDate.setDate(now.getDate() + daysUntilEnd);
  return {
    fechaInicio: now.toISOString(),
    fechaFinal: endDate.toISOString(),
  };
};

// Datos de muestra para las subastas con la estructura completa
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
    imagenes: ["/img/ganado/brahman-gris-toro.jpg", "/img/ganado/brahman-gris-toro-2.jpg"],
    pujador: "Ganadería El Sol",
    puja: 1250000.00,
    tipo: "Toro",
    estado: "Nuevo",
    imagen: "/img/ganado/brahman-gris-toro.jpg",
    ganaderia: { nombre: "Ganadería El Sol", logo: "/icons/ganaderia-logo.png" },
    ...generateAuctionDates(3) // Termina en 3 días
  },
  {
    id: 2,
    titulo: "Brahman blanco",
    descripcion: "Lote de vacas productoras, probadas en campo. Gran habilidad materna.",
    precioInicial: 900000.00,
    raza: "Brahman",
    edad: "4 años",
    peso: "1000 kg",
    genetica: "Pura",
    certificaciones: "/certificados/cert2.pdf",
    imagenes: ["/img/ganado/brahman-blanco-vacas.jpg"],
    pujador: "Finca La Esperanza",
    puja: 920000.00,
    tipo: "Vaca",
    estado: "Nuevo",
    imagen: "/img/ganado/brahman-blanco-vacas.jpg",
    ganaderia: { nombre: "Finca La Esperanza", logo: "" },
    ...generateAuctionDates(1) // Termina en 1 día
  },
  {
    id: 4,
    titulo: "Brahman blanco",
    descripcion: "Ternera de destete con excelente potencial para futura madre. Línea genética de campeones.",
    precioInicial: 240000.00,
    raza: "Brahman",
    edad: "8 meses",
    peso: "70 kg",
    genetica: "Pura",
    certificaciones: "/certificados/cert4.pdf",
    imagenes: ["/img/ganado/brahman-blanco-ternera.jpg"],
    pujador: "",
    puja: 0,
    tipo: "Ternera",
    estado: "Nuevo",
    imagen: "/img/ganado/brahman-blanco-ternera.jpg",
    ganaderia: { nombre: "Ganadería Colono Real S.A.", logo: "/icons/ganaderia-logo.png" },
    ...generateAuctionDates(5) // Termina en 5 días
  },
    { 
    id: 8, 
    titulo: "Brahman rojo", 
    descripcion: "Toro semental de linaje superior. Famoso por transmitir color y masa muscular a su progenie.",
    precioInicial: 1150000.00,
    raza: "Brahman",
    edad: "5 años",
    peso: "1260 kg",
    genetica: "Pura",
    certificaciones: "/certificados/cert8.pdf",
    imagenes: ["/img/ganado/brahman-rojo-toro.jpg"],
    pujador: "Hacienda San Pedro",
    puja: 1180000.00,
    tipo: "Toro",
    estado: "Viejo",
    imagen: "/img/ganado/brahman-rojo-toro.jpg",
    ganaderia: { nombre: "Hacienda San Pedro", logo: "" },
    ...generateAuctionDates(2) // Termina en 2 días
  }
  // Puedes añadir más objetos de subastas aquí si quieres
];


// --- Rutas de Autenticación ---

// Endpoint de Registro
app.post('/api/auth/register', (req, res) => {
  const newUser = req.body;
  console.log('Intento de registro recibido:', newUser);

  // Validar si el correo ya existe
  const emailExists = users.some(user => user.email === newUser.email);
  if (emailExists) {
    console.log(`Error: El correo ${newUser.email} ya está en uso.`);
    return res.status(409).json({ message: 'El correo electrónico ya está en uso.' });
  }

  // Si no existe, se añade al array
  users.push(newUser); 
  console.log('Usuario registrado exitosamente:', newUser);
  console.log('Lista de usuarios actualizada:', users); 
  
  res.status(201).json({ message: 'Usuario registrado exitosamente' });
});

// Endpoint de Login
app.post('/api/auth/login', (req, res) => {
  const { email, password } = req.body;
  console.log(`Intento de login para el correo: ${email}`);

  const user = users.find(u => u.email === email && u.password === password);

  if (user) {
    console.log(`Usuario ${email} autenticado exitosamente.`);
    return res.json({ 
      token: 'fake-jwt-token-for-development', 
      user: { 
        email: user.email, 
        nombre: user.nombreCompleto 
      } 
    });
  }

  console.log(`Error de autenticación para el correo: ${email}. Credenciales inválidas.`);
  res.status(401).json({ message: 'Credenciales inválidas' });
});


// --- Rutas de Subastas ---

// Endpoint para obtener TODAS las subastas
app.get('/api/subastas', (req, res) => {
  console.log('Petición GET a /api/subastas recibida.');
  res.status(200).json(subastas);
});

// Endpoint para obtener UNA subasta por su ID
app.get('/api/subastas/:id', (req, res) => {
  const subastaId = parseInt(req.params.id, 10);
  console.log(`Petición GET a /api/subastas/${subastaId} recibida.`);
  const subasta = subastas.find(s => s.id === subastaId);
  
  if (subasta) {
    res.status(200).json(subasta);
  } else {
    res.status(404).json({ message: "Subasta no encontrada" });
  }
});


// --- Iniciar el Servidor ---
app.listen(PORT, () => {
  console.log(`Servidor backend de Subastas corriendo en http://localhost:${PORT}`);
});