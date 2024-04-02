<script setup lang="ts">
import { useRoute } from 'vue-router';
import { ref, computed, onMounted } from 'vue';
import { useAuthStore } from '@/stores/auth';
// common components
import BaseBreadcrumb from '@/components/shared/BaseBreadcrumb.vue';
import UiParentCard from '@/components/shared/UiParentCard.vue';
import ProvidersForm from '@/components/providers/ProvidersForm.vue';
// theme breadcrumb
const store = useAuthStore()

const page = ref({ title: 'UTILISATEURS' });

const route = useRoute()



    const breadcrumbs = ref([
        {
            text: 'Dashboard',
            disabled: false,
            href: '/rut/dashboard'
        },
        {
            text: 'Liste',
            disabled: false,
            href: '/rut/users/list'
        },
        {
            text: 'Modifier',
            disabled: true,
            href: '#'
        }
    ]);
    



</script>

<template>
   <BaseBreadcrumb :title="page.title" :breadcrumbs="breadcrumbs"></BaseBreadcrumb>
   <v-row>
        <v-col cols="12" class="mb-12">
            <UiParentCard title="Nouveau formulaire">
                <ProvidersForm />
            </UiParentCard>           
        </v-col>
   </v-row>           
</template>
