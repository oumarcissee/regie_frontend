<script setup lang="ts">
import { useRoute } from 'vue-router';
import { ref, computed, onMounted } from 'vue';
// common components
import BaseBreadcrumb from '@/components/shared/BaseBreadcrumb.vue';
import UiParentCard from '@/components/shared/UiParentCard.vue';
import ProvidersForm from '@/components/providers/ProvidersForm.vue';
// theme breadcrumb
const page = ref({ title: 'Formulaire fournisseurs' });

const route = useRoute()
const breadcrumbs :any = []

if (route.params.param) {
    const breadcrumbs = ref([
        {
            text: 'Dashboard',
            disabled: false,
            href: '#'
        },
        {
            text: 'Modification',
            disabled: true,
            href: '#'
        }
    ]);
    
} else {

    const breadcrumbs = ref([
        {
            text: 'Dashboard',
            disabled: false,
            href: '#'
        },
        {
            text: 'Nouvel Utilisateur',
            disabled: true,
            href: '#'
        }
    ]);
}


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
