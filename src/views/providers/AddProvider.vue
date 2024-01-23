<script setup lang="ts">
import { ref } from 'vue';
// common components
import BaseBreadcrumb from '@/components/shared/BaseBreadcrumb.vue';
import UiParentCard from '@/components/shared/UiParentCard.vue';
import ProvidersForm from '@/components/providers/ProvidersForm.vue';
// theme breadcrumb
const page = ref({ title: 'Formulaire fournisseurs' });
const breadcrumbs = ref([
    {
        text: 'Dashboard',
        disabled: false,
        href: '#'
    },
    {
        text: 'Nouveau fournisseur',
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
                <ProvidersForm/>
            </UiParentCard>           
        </v-col>
   </v-row>           
</template>
