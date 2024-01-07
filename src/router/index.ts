import { createRouter, createWebHistory, type RouteLocationNormalized } from 'vue-router';
import MainRoutes from './MainRoutes';
import MagasinierA from './MagasinierA';
import AuthRoutes from './AuthRoutes';
import { useAuthStore } from '@/stores/auth';
import ManagerARoutes from './default/ManagerARoutes';

export const router = createRouter({
    history: createWebHistory(import.meta.env.BASE_URL),
    routes: [
        {
            path: '/:pathMatch(.*)*',
            component: () => import('@/views/authentication/Error.vue')
        },
        MainRoutes,
        ManagerARoutes,
        
        MagasinierA,
        AuthRoutes
    ]
});

router.beforeEach(async (to, from, next) => {
    const publicPages = ['/auth/login'];
    const auth: any = useAuthStore();
    const userRole = auth.user?.role;

    if (to.matched.some((record) => record.meta.requiresAuth)) {
        const authRequired = !publicPages.includes(to.path);

        if (authRequired && (!userRole || !hasAccess(userRole, to))) {
            
            auth.returnUrl = to.fullPath;
          
            return next('/auth/login');
        } else {
            next();
        }
    } else {
        next();
    }
});

function hasAccess(userRole: any, to: any) {
    // Vérifier si l'utilisateur a accès au rôle nécessaire pour la route
    return to.meta.role.includes(userRole);
}

