<script setup lang="ts">
import { useAuthStore } from '@/stores/auth';
import { ref, shallowRef } from 'vue';
import { useCustomizerStore } from '@/stores/customizer';
import sidebarItems from './sidebarItem';
import sidebarItemsMangerA from './sidebarItemManagerA';

import NavGroup from './NavGroup/index.vue';
import NavItem from './NavItem/index.vue';
import NavCollapse from './NavCollapse/NavCollapse.vue';
import Profile from './profile/Profile.vue';
import Logo from '../logo/Logo.vue';
import RtlLogo from '../logo/RtlLogo.vue';

const { user, isAuthenticated } = useAuthStore();


const customizer = useCustomizerStore();
const sidebarMenu = shallowRef(sidebarItems);
const sidebarMenuManagerA = shallowRef(sidebarItemsMangerA);
</script>

<template>
    <v-navigation-drawer
        left
        v-model="customizer.Sidebar_drawer"
        elevation="0"
        rail-width="75"
        mobile-breakpoint="960"
        app
        class="leftSidebar"
        :rail="customizer.mini_sidebar"
        expand-on-hover width="270"
    >
        <!---Logo part -->
        <v-locale-provider  v-if="customizer.setRTLLayout"  rtl >
        <div class="pa-5">
            <RtlLogo />
        </div>
        </v-locale-provider>
        <v-locale-provider  v-else>
        <div class="pa-5">
            <Logo />
        </div>
        </v-locale-provider>

        
        <!-- ---------------------------------------------- -->
        <!---Navigation -->
        <!-- ---------------------------------------------- -->
        <perfect-scrollbar class="scrollnavbar">
            <v-list class="pa-6">
                <!---Menu Loop -->

                <!-- SI L'UTILISATEUR EST LE RUT -->
               <template v-if="isAuthenticated && user?.role === 'manager_a'">
                    <template v-for="(item, i) in sidebarMenuManagerA">
                        <!---Item Sub Header -->
                        <NavGroup :item="item" v-if="item.header" :key="item.title" />
                        <!---If Has Child -->
                        <NavCollapse class="leftPadding" :item="item" :level="0" v-else-if="item.children" />
                        <!---Single Item-->
                        <NavItem :item="item" v-else class="leftPadding" />
                        <!---End Single Item-->
                    </template>
               </template>
               <!-- END RUT -->


               <!-- SI L'UTILISATEUR EST LE CHEF DE L'ECOLE -->
               <template v-if="isAuthenticated && user?.role === 'manger_b'">
                
               </template>
               <!-- END ECOLE CHEF DE L'ECOLE -->

               <!-- SI L'UTILISATEUR EST LE SUPER ADMINISTRATEUR -->
               <template v-if="isAuthenticated && user?.role === 'admin'">
                    <template v-for="(item, i) in sidebarMenu">
                        <!---Item Sub Header -->
                        <NavGroup :item="item" v-if="item.header" :key="item.title" />
                        <!---If Has Child -->
                        <NavCollapse class="leftPadding" :item="item" :level="0" v-else-if="item.children" />
                        <!---Single Item-->
                        <NavItem :item="item" v-else class="leftPadding" />
                        <!---End Single Item-->
                    </template>
               </template>
               <!-- END SUPER ADMIN -->
    
            </v-list>
            <div class="pa-6 userbottom">
                <Profile />
            </div>
        </perfect-scrollbar>
    </v-navigation-drawer>
</template>
