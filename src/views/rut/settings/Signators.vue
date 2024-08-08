<script setup lang="ts">
import { ref } from 'vue';
// common components
import BaseBreadcrumb from '@/components/shared/BaseBreadcrumb.vue';
import EditableTable from '@/components/rut/settings/EditableTableSignateurs.vue';
// theme breadcrumb
const page = ref({ title: 'Signateurs' });

const breadcrumbs = ref([
    {
        text: 'Dashboard',
        disabled: true,
        href: '#'
    },
    {
        text: 'Parametres',
        disabled: false,
        href: '/rut/settings'
    },

     {
        text: 'Signateurs',
        disabled: false,
        href: '#'
    }
]);
</script>

<template>
    <BaseBreadcrumb :title="page.title" :breadcrumbs="breadcrumbs"></BaseBreadcrumb>
    <v-card elevation="10">
        <v-card-text>
            <EditableTable />
        </v-card-text>
    </v-card>
</template>
