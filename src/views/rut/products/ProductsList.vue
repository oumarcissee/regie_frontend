<script setup lang="ts">
import { ref } from 'vue';
// common components
import BaseBreadcrumb from '@/components/shared/BaseBreadcrumb.vue';
import EditableTable from '@/components/rut/products/EditableTableProduct.vue';
// theme breadcrumb
const page = ref({ title: 'Liste des Articles' });

const breadcrumbs = ref([
    {
        text: 'Dashboard',
        disabled: true,
        href: '#'
    },
    {
        text: 'Les articles',
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
