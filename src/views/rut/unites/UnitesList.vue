<script setup lang="ts">
import { ref } from 'vue';
// common components
import BaseBreadcrumb from '@/components/shared/BaseBreadcrumb.vue';
import EditableTableUnit from '@/components/rut/unites/EditableTableUnit.vue';
// theme breadcrumb
const page = ref({ title: 'Liste des Unites' });

const breadcrumbs = ref([
    {
        text: 'Dashboard',
        disabled: true,
        href: '#'
    },
    {
        text: 'Les unites/services',
        disabled: false,
        href: '#'
    }
]);
</script>

<template>
    <BaseBreadcrumb :title="page.title" :breadcrumbs="breadcrumbs"></BaseBreadcrumb>
    <v-card elevation="10">
        <v-card-text>
            <EditableTableUnit />
        </v-card-text>
    </v-card>
</template>
