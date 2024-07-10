<script setup lang="ts">
import { ref } from 'vue';
// common components
import BaseBreadcrumb from '@/components/shared/BaseBreadcrumb.vue';
import EditablePrint from '@/components/rut/orders/EditablePrint.vue';
// theme breadcrumb
const page = ref({ title: 'Impression de la commande' });

const breadcrumbs = ref([
    {
        text: '',
        disabled: true,
        href: '#'
    }
]);
</script>

<template>
    <BaseBreadcrumb :title="page.title" :breadcrumbs="breadcrumbs"></BaseBreadcrumb>
    <v-card elevation="10">
        <v-card-text>
            <EditablePrint />
        </v-card-text>
    </v-card>
</template>
