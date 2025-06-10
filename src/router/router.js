import { createRouter, createWebHistory } from 'vue-router';
import HomePage from '../views/HomePage.vue';
import Login from '../views/Login.vue';
import Profile from '../views/Profile.vue';
import RegisterGanaderia from '../components/forms/RegisterGanaderia.vue'
import RegisterPersonal from '../components/forms/RegisterPersonal.vue';
import SelectTypeAccount from '../components/SelectTypeAccount.vue'

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
        path: '/selectTypeAccount',
        name: 'typeAccount',
        component:SelectTypeAccount,
        meta: { guest: true } 
    },
    {
        path: '/registerGanaderia',
        name: 'registerGanaderia',
        component: RegisterGanaderia,
        meta: { guest: true }
    },
    {
        path: '/registerPersonal',
        name: 'registerPersonal',
        component: RegisterPersonal,
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
        next({ name: 'home' });
    }
    else {
        next();
    }
});

export default router;