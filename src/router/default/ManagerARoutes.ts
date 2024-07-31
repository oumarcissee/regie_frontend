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
            path: '/rut/users/list',
            component: () => import('@/views/dashboard/modern/rut/ProviderUserList.vue')
        },

        {
            name: 'AddProviders',
            path: '/rut/users/add',
            component: () => import('@/views/providers/AddProvider.vue')
        },
        {
            name: 'EditProvider',
            path: '/rut/users/edit/:param',
            component: () => import('@/views/providers/EditProvider.vue')
        },

        //Les urls de produits
        {
            name: 'ProductList',
            path: '/rut/products',
            component: () => import('@/views/rut/products/ProductsList.vue')
        },

         //Les urls des commandes /rut/settings
        {
            name: 'OrdersList',
            path: '/rut/orders/list',
            component: () => import('@/views/rut/orders/OrderList.vue')
        },


        /**LA GESTION DE PARAMETRE */
        {
            name: 'SettingsRUT',
            path: '/rut/settings',
            component: () => import('@/views/rut/settings/SettingsDashboard.vue')
        },
        
       
    ]
};

export default ManagerARoutes;
