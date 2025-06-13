import { createRouter, createWebHistory } from 'vue-router';
import { useAuthStore } from '../store/auth'; 

import HomePage from '../views/HomePage.vue';
import Login from '../views/Login.vue';
import RegisterGanaderia from '../views/RegisterGanaderia.vue';
import RegisterPersonal from '../views/RegisterPersonal.vue';
import SelectTypeAccount from '../components/SelectTypeAccount.vue';

const routes = [
    {
        path: '/',
        name: 'home',
        component: HomePage
    },
    {
        path: '/login',
        name: 'login',
        component: Login,
        meta: { guest: true } 
    },
    {
        path: '/SelectTypeAccount', 
        name: 'SelectTypeAccount',
        component: SelectTypeAccount,
    },
    {
        path: '/registerGanaderia',
        name: 'registerGanaderia',
        component: RegisterGanaderia,
        meta: { profileType: 'Ganaderia' } // Añadimos metadatos
    },
    {
        path: '/registerPersonal',
        name: 'registerPersonal',
        component: RegisterPersonal,
        meta: { profileType: 'Personal' } // Añadimos metadatos
    },
];

const router = createRouter({
    history: createWebHistory(),
    routes
});


router.beforeEach((to, from, next) => {
    const authStore = useAuthStore();
    const isLoggedIn = authStore.isLoggedIn;
    const user = authStore.currentUser;
    if (to.meta.requiresAuth && !isLoggedIn) {
        return next({ name: 'login' });
    }


    if (to.meta.guest && isLoggedIn) {
        return next({ name: 'home' });
    }
    if (isLoggedIn && to.meta.profileType) {
        if (to.meta.profileType === 'Personal' && user?.perfilPersonal) {
            return next({ name: 'home' }); 
        }
        if (to.meta.profileType === 'Ganaderia' && user?.perfilGanaderia) {
            console.log('Acceso bloqueado: Ya tienes un perfil de ganadería.');
            return next({ name: 'home' }); 
        }
    }
    if (isLoggedIn && to.name === 'chooseAccount') {
        if (user?.perfilPersonal && user?.perfilGanaderia) {

            return next({ name: 'home' }); 
        }
    }
    next();
});

export default router;