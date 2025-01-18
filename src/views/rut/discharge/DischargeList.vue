<script setup lang="ts">
import { ref } from 'vue';
// common components
import BaseBreadcrumb from '@/components/shared/BaseBreadcrumb.vue';
import EditableTableDischarge from '@/components/rut/discharge/EditableTableDischarge.vue';
// theme breadcrumb
const page = ref({ title: 'Liste des Boredereaux' });

// document.title = `${document.title} - Bordereaux`

const breadcrumbs = ref([
    {
        text: 'Dashboard',
        disabled: true,
        href: '#'
    },
    {
        text: 'Les boredereaux',
        disabled: false,
        href: '#'
    }
]);
</script>

<template>
    <BaseBreadcrumb :title="page.title" :breadcrumbs="breadcrumbs"></BaseBreadcrumb>
    <v-card elevation="10">
        <v-card-text>
            <EditableTableDischarge />
        </v-card-text>
    </v-card>
</template>
