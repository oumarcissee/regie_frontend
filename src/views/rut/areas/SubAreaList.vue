<script setup lang="ts">
import { ref } from 'vue';
// common components
import BaseBreadcrumb from '@/components/shared/BaseBreadcrumb.vue';
import EditableTableArea from '@/components/rut/areas/EditableTableArea.vue';
// theme breadcrumb
const page = ref({ title: 'Liste des Sous Regions' });

const breadcrumbs = ref([
    {
        text: 'Dashboard',
        disabled: true,
        href: '#'
    },
    {
        text: 'Les sous-regions',
        disabled: false,
        href: '#'
    }
]);
</script>

<template>
    <BaseBreadcrumb :title="page.title" :breadcrumbs="breadcrumbs"></BaseBreadcrumb>
    <v-card elevation="10">
        <v-card-text>
            <EditableTableArea />
        </v-card-text>
    </v-card>
</template>
