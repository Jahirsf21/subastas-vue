import { createRouter, createWebHistory } from 'vue-router';
import { useAuthStore } from '../store/auth'; 

import HomePage from '../views/HomePage.vue';
import Login from '../views/Login.vue';
import RegisterGanaderia from '../views/RegisterGanaderia.vue';
import RegisterPersonal from '../views/RegisterPersonal.vue';
import SelectTypeAccount from '../components/SelectTypeAccount.vue';
import PurchaseView from '../views/PurchaseView.vue'

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
        meta: { requiresNoFullProfile: true }
    },
    {
        path: '/registerGanaderia',
        name: 'registerGanaderia',
        component: RegisterGanaderia,
        meta: { profileType: 'Ganaderia' } 
    },
    {
        path: '/registerPersonal',
        name: 'registerPersonal',
        component: RegisterPersonal,
        meta: { profileType: 'Personal' } 
    },
    {
        path: '/Purchase/:id',
        name: 'Purchase',
        component: PurchaseView,
        meta: { requiresAuth: true }
    }
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
    if (isLoggedIn) {
        const hasPersonalProfile = !!user?.perfilPersonal;
        const hasRanchProfile = !!user?.perfilGanaderia;

        if (to.meta.profileType === 'Personal' && hasPersonalProfile) {
            console.log('Acceso bloqueado: Ya tienes un perfil Personal.');
            return next({ name: 'home' }); 
        }
        if (to.meta.profileType === 'Ganaderia' && hasRanchProfile) {
            console.log('Acceso bloqueado: Ya tienes un perfil de Ganadería.');
            return next({ name: 'home' }); 
        }
        if (to.meta.requiresNoFullProfile && hasPersonalProfile && hasRanchProfile) {
            console.log('Acceso bloqueado: Ya tienes ambos perfiles.');
            return next({ name: 'home' });
        }
    }

    next();
});

export default router;