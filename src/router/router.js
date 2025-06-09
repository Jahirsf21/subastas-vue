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

router.beforeEach((to, from, next) => {

    const isLoggedIn = !!localStorage.getItem('user');


    if (to.meta.requiresAuth && !isLoggedIn) {
        next({ name: 'login' });
    }
    else if (to.meta.guest && isLoggedIn) {
        next({ name: 'profile' });
    }
    else {
        next();
    }
});

export default router;