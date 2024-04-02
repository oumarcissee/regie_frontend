<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { router } from '@/router';
import { setItemSelected } from '@/services/utils';

import { useProviderStore } from '@/stores/rutStore/providerStore';

import UiParentCard from '@/components/shared/UiParentCard.vue';
import type { Header, Item } from 'vue3-easy-data-table';
import 'vue3-easy-data-table/dist/style.css';

import fr from 'date-fns/locale/fr';
import { format } from 'date-fns';

const locale = fr; // or en, or es

const store = useProviderStore();

onMounted(async() => {
    await store.fetchUsers();
});

const getProducts = computed(() => {
    return store.users;
});

const editedIndex = ref(-1);



const searchField = ref(['last_name', 'first_name', 'role']);
const searchValue = ref('');



const headers: Header[] = [
    { text: '#', value: 'image' },
    { text: 'Nom et prénom', value: 'last_name', sortable: true },
    { text: 'Créer le', value: 'date_joined', sortable: true },
    { text: 'Téléphone', value: 'phoneNumber', sortable: true },
    { text: 'Rôle', value: 'role', sortable: true },
    { text: 'Statut', value: 'is_active' , sortable: true },
    { text: 'Action', value: 'operation' }
];
const items = ref(getProducts);


// Méthode pour modifier un élément
const editItem = (index: any) => {
    store.item = index;
    setItemSelected(index)
    console.log(index);

    return router.push({name: 'EditProvider', params:{param: index.id}})
};



const themeColor = ref('rgb(var(--v-theme-secondary))');

const itemsSelected = ref<Item[]>([]);
</script>

<template>
    <v-row>
        <v-col cols="12" md="12">
            <UiParentCard title="Liste des utilisateurs">
                <v-row justify="space-between" class="align-center mb-3">
                    <v-col cols="12" md="3">
                        <v-text-field
                            type="text"
                            variant="outlined"
                            placeholder="Rechercher utilisateur"
                            v-model="searchValue"
                            density="compact"
                            hide-details
                            prepend-inner-icon="mdi-magnify"
                        />
                    </v-col>
                    <v-col cols="12" md="3">
                        <div class="d-flex gap-2 justify-end">
                            <v-btn icon variant="text">
                                <CopyIcon size="20" />
                            </v-btn>
                            <v-btn icon variant="text">
                                <PrinterIcon size="20" />
                            </v-btn>
                            <v-btn icon variant="text">
                                <FilterIcon size="20" />
                            </v-btn>
                        </div>
                    </v-col>
                </v-row>
                <EasyDataTable
                    :headers="headers"
                    :items="items"
                    table-class-name="customize-table"
                    :theme-color="themeColor"
                    :search-field="searchField"
                    :search-value="searchValue"
                    :rows-per-page="5"
                    v-model:items-selected="itemsSelected"
                >
                    <template #item-image="{ image }">
                        <div class="player-wrapper">
                            <img alt="user" width="70" class="rounded-circle img-fluid" :src="image" />
                        </div>
                    </template>
                    <template #item-last_name="{first_name, last_name}">
                        <div class="player-wrapper">
                            <h5 class="text-h5">{{ last_name }}</h5>
                            <span class="text-subtitle-1 d-block mt-1 textSecondary">{{ first_name }}</span>
                        </div>
                    </template>
                    <template #item-date_joined="{ date_joined }">
                        <div class="player-wrapper">
                            {{ date_joined }}
                        </div>
                    </template>
                    <template #item-phoneNumber="{ phone_number}">
                        <div class="player-wrapper">
                            <h5 class="text-h5">{{ phone_number }}</h5>
                        </div>
                    </template>
                    <template #item-salePrice="{ role }">
                        <div class="player-wrapper">
                            <h5 class="text-h5">{{role}}</h5>
                           
                        </div>
                    </template>
                    <template #item-is_active="{ is_active }">
                        <div class="player-wrapper">
                            <v-chip color="success" v-if="is_active" size="small"> Activé </v-chip>
                            <v-chip color="error" v-else size="small"> Desactivé</v-chip>
                        </div>
                    </template>

                    <template #item-operation="item">
                        <div class="operation-wrapper"><div class="d-flex align-center">
                            <v-tooltip text="Editer">
                                <template v-slot:activator="{ props }">
                                    <v-btn icon flat @click="editItem(item)" v-bind="props"
                                        ><PencilIcon stroke-width="1.5" size="20" class="text-primary"
                                    /></v-btn>
                                </template>
                            </v-tooltip>
                            <v-tooltip text="Supprimer">
                                <template v-slot:activator="{ props }">
                                    <v-btn icon flat  v-bind="props"
                                        ><TrashIcon stroke-width="1.5" size="20" class="text-error"
                                    /></v-btn>
                                </template>
                            </v-tooltip>
                        </div>

                        </div>
                    </template>
                </EasyDataTable>
            </UiParentCard>
        </v-col>
    </v-row>
</template>
