const ManagerARoutes = {
    path: '/mainManagerA',
    meta: {
        requiresAuth: true,
        role: 'manager_a'
    },
    redirect: '/mainManagerA',
    component: () => import('@/layouts/full/FullLayout.vue'),
    children: [
        {
            name: 'ManagerADashboard',
            path: '/rut/dashboard',
            component: () => import('@/views/dashboard/modern/rut/indexManagerA.vue')
        },

        {
            name: 'Providers',
            path: '/rut/providers/list',
            component: () => import('@/views/dashboard/modern/rut/Provider.vue')
        },

        {
            name: 'AddProviders',
            path: '/rut/providers/add',
            component: () => import('@/views/providers/AddProvider.vue')
        },
        
       
    ]
};

export default ManagerARoutes;
