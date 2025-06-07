// ARCHIVO DE TU SERVIDOR BACKEND (index.js o server.js)

const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');

const app = express();
const PORT = 3000;

app.use(cors());
app.use(bodyParser.json());

const users = []; 

app.post('/api/auth/register', (req, res) => {
  const newUser = req.body;

  const emailExists = users.some(user => user.email === newUser.email);

  
  if (emailExists) {
   
    return res.status(409).json({ message: 'El correo electrónico ya está en uso.' });
  }

  
  users.push(newUser); 
  console.log('Usuario registrado:', newUser);
  console.log('Lista de usuarios actualizada:', users); 
  res.status(201).json({ message: 'Usuario registrado exitosamente' });
});




app.post('/api/auth/login', (req, res) => {
  const { email, password } = req.body;
  const user = users.find(u => u.email === email && u.password === password);

  if (user) {
    return res.json({ token: 'fake-jwt-token', user: { email: user.email, nombre: user.nombreCompleto } });
  }

  res.status(401).json({ message: 'Credenciales inválidas' });
});

app.listen(PORT, () => {
  console.log(`Servidor backend corriendo en http://localhost:${PORT}`);
});