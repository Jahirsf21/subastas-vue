// src/router/index.js

import { createRouter, createWebHistory } from 'vue-router';
import HomePage from '../views/HomePage.vue';
import SubastaDetails from '../views/subastaDetails.vue';
import Login from '../views/Login.vue';
import Register from '../views/Register.vue';
import Profile from '../views/Profile.vue';

const routes = [
    {
        path: '/',
        name: 'home',
        component: HomePage
    },
    {
        path: '/subastas/:subastaTitulo',
        name: 'subastaDetails',
        component: SubastaDetails
    },

    {
        path: '/login',
        name: 'login',
        component: Login,
        meta: { guest: true } 
    },
 
    {
        path: '/register',
        name: 'register',
        component: Register,
        meta: { guest: true }
    },
    {
        path: '/perfil',
        name: 'profile',
        component: Profile,
        meta: { requiresAuth: true }
    }
];

const router = createRouter({
    history: createWebHistory(),
    routes
});

// --- AHORA VIENE LA MAGIA: El Navigation Guard ---
// Este código se ejecuta ANTES de cada cambio de ruta.
router.beforeEach((to, from, next) => {
    // 1. Comprueba si el usuario está logueado.
    //    La forma más común es mirar si hay un token/usuario en localStorage.
    //    (Esto debe ser consistente con cómo guardas la sesión en tu store de Pinia/Vuex o servicio de auth).
    const isLoggedIn = !!localStorage.getItem('user');

    // 2. Si la ruta a la que se intenta acceder (to) requiere autenticación Y el usuario NO está logueado...
    if (to.meta.requiresAuth && !isLoggedIn) {
        // ...redirige al usuario a la página de login.
        next({ name: 'login' });
    }
    // 3. (Opcional pero recomendado) Si el usuario YA está logueado e intenta acceder a Login o Register...
    else if (to.meta.guest && isLoggedIn) {
        // ...redirígelo a su perfil o al home.
        next({ name: 'profile' });
    }
    // 4. Si ninguna de las condiciones anteriores se cumple, permite que la navegación continúe.
    else {
        next();
    }
});

export default router;