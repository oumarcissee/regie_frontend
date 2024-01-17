<script setup lang="ts">
import { ref } from 'vue';
// common components
import BaseBreadcrumb from '@/components/shared/BaseBreadcrumb.vue';
import UiParentCard from '@/components/shared/UiParentCard.vue';

//Table
import EditableTableProvider from '@/components/rut/EditableProviders.vue'

// theme breadcrumb
const page = ref({ title: 'Table de fournisseurs' });
const breadcrumbs = ref([
    {
        text: 'Dashboard',
        disabled: false,
        to: '/rut/dashboard'
    },
    {
        text: 'Table de fournisseurs',
        disabled: true,
        to: '#'
    }
]);
</script>

<template>
    <!-- ---------------------------------------------------- -->
    <!-- Table Editable -->
    <!-- ---------------------------------------------------- -->
    <BaseBreadcrumb :title="page.title" :breadcrumbs="breadcrumbs"></BaseBreadcrumb>
    <v-row>
        <v-col cols="12">
            <UiParentCard title="Table des fournisseurs">
                <EditableTableProvider />
            </UiParentCard>
        </v-col>
    </v-row>
</template>
