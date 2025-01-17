<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue';
import { useSubAreStore } from '@/stores/rutStore/subArea/subAreaStore';
import { useUnitStore } from '@/stores/rutStore/unit/unitStore';
import { truncateText, notif, formatDate, showNotification, get_staffs, get_unite_type, get_areas } from '@/services/utils';
import fr from 'date-fns/locale/fr';
import { format } from 'date-fns';

const themeColor = ref('rgb(var(--v-theme-secondary))');
const itemsSelected = ref<Item[]>([]);
const searchField = ref(['ref', 'name']);
const searchValue = ref('');
import { EyeIcon } from 'lucide-vue-next';

// Add these new refs
const viewDialog = ref(false);
const selectedUnited = ref(null);

const locale = fr; // or en, or es
const isLoading = ref(false);
const error = ref<string | null>(null);

import { useField, useForm } from 'vee-validate';

import type { Items } from '@/types/rut/SignatorType';

import contact from '@/_mockApis/apps/contact';
import type { Item } from 'vue3-easy-data-table';

const unitStore = useUnitStore();

const { addOrUpdateSubArea, errors, getUnites, fetchSoubArea } = useSubAreStore();
const store = useSubAreStore();

const { handleSubmit, handleReset, isSubmitting } = useForm({
    validationSchema: {
        name(value: string | any[]) {
            if (value?.length <= 4 || !value) {
                return 'Le libéllé doit avoir au moins 4 lettres.';
            } else if (store.errors.nameError && store.errors.nameText === value) {
                // Utiliser store.errors au lieu de errors
                return store.errors.nameError;
            }
            return true;
        },
        area(value: string | any[]) {
            if (value) return true;
            return 'Choisissez une Region-Militaire.';
        },

        description(value: string | any[]) {
            if (value) return true;
            return true;
        }
    }
});

const areas = ref([
    { title: 'ZONE SPECIALE (CONAKRY)', value: 'speciale' },
    { title: 'PREMIÈRE REGION MILITAIRE', value: 'first' },
    { title: 'DEUXIÈME REGION MILITAIRE', value: 'second' },
    { title: 'TROISIÈME REGION MILITAIRE', value: 'third' },
    { title: 'QUATRIÈME REGION MILITAIRE', value: 'fourth' }
]);

onMounted(async () => {
    isLoading.value = true;
    // unitStore.fetchAllAreas();
    await refreshTable();
    isLoading.value = false;
});

const getSubAreas: any = computed(async () => {
    return await store.sub_areas;
});

import type { AxiosError } from 'axios';

const selected = ref<string | null | undefined | number>(null);

const loading = ref(false);

// // Add this new method
const viewItem = (item: any) => {
    // console.log('Item clicked:', item); // Pour le debug
    selectedUnited.value = { ...item }; // Faire une copie de l'objet
    viewDialog.value = true;
};

const closeViewDialog = () => {
    viewDialog.value = false;
    selectedUnited.value = null;
};

const name = useField('name');
const area = useField('area');
const description = useField('description');

const count = ref(0);
const pError = ref();

// Modifier la fonction submit

const submit = handleSubmit(async (values, { setErrors }: any) => {
    try {
        pError.value = null;
        errors.nameError = null;

        const submitFormData = new FormData();

        submitFormData.append('name', values.name);
        submitFormData.append('area', values.area);
        submitFormData.append('description', values.description);

        isLoading.value = true;
        error.value = null;

        if (editedIndex.value !== -1) {
            await addOrUpdateSubArea(submitFormData, editedIndex.value);
        } else {
            await addOrUpdateSubArea(submitFormData);
        }
        handleReset();//reset

        await refreshTable();
        dialog.value = false;
        showNotification(editedIndex.value === -1 ? 'Sous-region ajouté avec succès' : 'Sous-region modifié avec succès', 'success');
    } catch (err) {
        pError.value = error;
        count.value++;
        if (count.value <= 1) submit();

        return setErrors({ apiError: error });

        // showNotification('Erreur lors de l\'opération', 'error');
    } finally {
        isLoading.value = false;
        
    }
});

// Modifier la fonction refreshTable pour être plus robuste
const refreshTable = async () => {
    try {
        loading.value = true;
        await fetchSoubArea();
        // Forcer la réactivité en créant une nouvelle référence
        store.sub_areas = [...store.sub_areas];
    } catch (error) {
        console.error('Erreur lors du rafraîchissement :', error);
        showNotification('Erreur lors du rafraîchissement des données', 'error');
    } finally {
        loading.value = false;
    }
};

const uniteSelected = ref();

const changed = (value: string | any) => {
    uniteSelected.value = value;
    return value;
};

const valid = ref(true);
const dialog = ref(false);

const editedIndex = ref(-1);

//Methods

// Ajouter une fonction de nettoyage
function close() {
    dialog.value = false;
    editedIndex.value = -1;
    handleReset();
}

// Méthode pour modifier un élément
const editItem = (item: any) => {
    editedIndex.value = item.id;
    // Remplir le formulaire avec les donnéeses
    name.value.value = item.name;
    area.value.value = item.area;

    description.value.value = item.description;

    dialog.value = true;
};

// Modifier la fonction remove pour gérer le loading state
const remove = async (index: any) => {
    try {
        loading.value = true;
        const isRemove = await store.deleteItem(index, 'subareas');
        if (isRemove) {
            // Attendre que la suppression soit terminée avant de rafraîchir
            await refreshTable();
            showNotification('Sous-région supprimé avec succès', 'success');
        }
    } catch (error) {
        console.error('Erreur lors de la suppression :', error);
        showNotification('Erreur lors de la suppression', 'error');
    } finally {
        loading.value = false;
    }
};

//Computed Property
const formTitle = computed(() => {
    return editedIndex.value === -1 ? 'Nouveau Sous-Region' : 'Editer un Sous-Region';
});

//Computed Property
const formButton = computed(() => {
    return editedIndex.value === -1 ? 'Enregistrer' : 'Modifier';
});

const headers = [
    { text: 'Libéllé', value: 'name', sortable: true },
    { text: 'Region', value: 'area', sortable: true },
    { text: 'Crée le', value: 'created_at', sortable: true },
    { text: 'Modifiée le', value: 'modified_at', sortable: true },
    { text: 'Actions', value: 'actions' }
];
</script>
<template>
    <v-row>
        <v-col cols="6" lg="4" md="6">
            <!-- Modification du champ de recherche -->
            <v-text-field
                density="compact"
                v-model="searchValue"
                label="Rechercher par nom ou référence"
                variant="outlined"
                placeholder="Entrez un nom ou une référence..."
                prepend-inner-icon="mdi-magnify"
                clearable
            ></v-text-field>
        </v-col>
        <v-col cols="6" lg="8" md="6" class="text-right">
            <v-dialog v-model="dialog" max-width="800" persistent>
                <template v-slot:activator="{ props }">
                    <v-btn color="primary" v-bind="props" flat class="ml-auto">
                        <v-icon class="mr-2">mdi-account-multiple-plus</v-icon>Ajouter un sous-region
                    </v-btn>
                </template>
                <v-card>
                    <v-card-title class="pa-4 bg-secondary d-flex align-center justify-space-between">
                        <span class="title text-white">{{ formTitle }}</span>
                        <v-icon @click="close()" class="ml-auto">mdi-close</v-icon>
                    </v-card-title>

                    <v-card-text>
                        <v-form ref="form" v-model="valid" @submit.prevent="submit">
                            <v-row>
                                <v-col cols="12" sm="12">
                                    <v-text-field
                                        placeholder="Saisissez le nom en integralité"
                                        variant="outlined"
                                        v-model="name.value.value"
                                        :error-messages="name.errorMessage.value"
                                        label="Libéllé"
                                    >
                                    </v-text-field>
                                </v-col>

                                <v-col cols="12" sm="12">
                                    <v-select
                                        label="Region-Militaire"
                                        :items="areas"
                                        @update:modelValue="changed"
                                        single-line
                                        variant="outlined"
                                        v-model="area.value.value"
                                        :error-messages="area.errorMessage.value"
                                    >
                                    </v-select>
                                </v-col>

                                <v-col cols="12" sm="12">
                                    <VTextarea
                                        label="Description"
                                        auto-grow
                                        placeholder="Salut, avez-vous quel que chose a dire?"
                                        rows="2"
                                        color="primary"
                                        row-height="25"
                                        shaped
                                        v-model="description.value.value"
                                        :error-messages="description.errorMessage.value"
                                    ></VTextarea>
                                </v-col>
                            </v-row>
                        </v-form>
                    </v-card-text>
                    <v-card-actions class="pa-4">
                        <v-btn color="secondary" variant="flat" @click="submit" block :loading="isSubmitting">
                            {{ formButton }}
                        </v-btn>
                    </v-card-actions>
                </v-card>
            </v-dialog>
        </v-col>
    </v-row>

    <!-- Replace v-table with EasyDataTable -->
    <EasyDataTable
        :headers="headers"
        :items="store.sub_areas"
        :loading="loading"
        :theme-color="themeColor"
        table-class-name="customize-table"
        :search-field="searchField"
        :search-value="searchValue"
        :rows-per-page="8"
        v-model:items-selected="itemsSelected"
        buttons-pagination
        show-index
    >
        <!-- Custom template for Article column -->
        <template #item-name="{ name }">
            <div class="d-flex align-center">
                <div class="ml-5">
                    <h4 class="text-h6 font-weight-semibold">{{ name }}</h4>
                </div>
            </div>
        </template>

        <template #item-area="{ area }">
            <div class="d-flex align-center">
                <div class="ml-5">
                    <h4 class="text-h6 font-weight-semibold">{{ get_areas(area) }}</h4>
                </div>
            </div>
        </template>

        <template #item-created_at="{ created_at }">
            <div class="d-flex align-center">
                <div class="ml-5">
                    <h4 class=" ">{{ formatDate(created_at) }}</h4>
                </div>
            </div>
        </template>

        <template #item-modified_at="{ modified_at }">
            <div class="d-flex align-center">
                <div class="ml-5">
                    <h4 class=" ">{{ formatDate(modified_at) }}</h4>
                </div>
            </div>
        </template>

        <!-- Custom template for Actions column -->
        <template #item-actions="{ raw }">
            <div class="d-flex align-center">
                <v-tooltip text="Voir">
                    <template v-slot:activator="{ props }">
                        <v-btn icon flat @click="viewItem(raw)" v-bind="props">
                            <EyeIcon stroke-width="1.5" :size="20" class="text-success" />
                        </v-btn>
                    </template>
                </v-tooltip>
                <v-tooltip text="Editer">
                    <template v-slot:activator="{ props }">
                        <v-btn icon flat @click="editItem(raw)" v-bind="props">
                            <PencilIcon stroke-width="1.5" size="20" class="text-primary" />
                        </v-btn>
                    </template>
                </v-tooltip>
                <v-tooltip text="Supprimer">
                    <template v-slot:activator="{ props }">
                        <v-btn icon flat @click="remove(raw)" v-bind="props">
                            <TrashIcon stroke-width="1.5" size="20" class="text-error" />
                        </v-btn>
                    </template>
                </v-tooltip>
            </div>
        </template>
    </EasyDataTable>

    <!-- Add the View Dialog -->
    <!-- Remplacez le dialogue de visualisation existant par celui-ci -->
    <template>
        <v-dialog v-model="viewDialog" fullscreen :scrim="false" transition="dialog-bottom-transition">
            <v-card>
                <v-card-title class="pa-4 bg-primary d-flex align-center justify-space-between">
                    <span class="text-h5 text-white">Détails de l'unité</span>
                    <v-icon @click="closeViewDialog" class="ml-auto text-white" size="large">mdi-close</v-icon>
                </v-card-title>

                <v-card-text class="pa-4" v-if="selectedUnited">
                    <v-container fluid>
                        <v-row>
                            <!-- Informations principales -->
                            <v-col cols="12" md="6">
                                <v-card class="mb-4" elevation="2">
                                    <v-card-text>
                                        <h3 class="text-h5 mb-4">Informations principales</h3>
                                        <v-list density="comfortable">
                                            <v-list-item>
                                                <template v-slot:prepend>
                                                    <v-icon color="primary" size="large">mdi-identifier</v-icon>
                                                </template>
                                                <v-list-item-title class="text-body-1 font-weight-medium">Référence</v-list-item-title>
                                                <v-list-item-subtitle class="text-subtitle-1">{{
                                                    selectedUnited.ref
                                                }}</v-list-item-subtitle>
                                            </v-list-item>

                                            <v-list-item>
                                                <template v-slot:prepend>
                                                    <v-icon color="primary" size="large">mdi-office-building</v-icon>
                                                </template>
                                                <v-list-item-title class="text-body-1 font-weight-medium">Nom complet</v-list-item-title>
                                                <v-list-item-subtitle class="text-subtitle-1">{{
                                                    selectedUnited.name
                                                }}</v-list-item-subtitle>
                                            </v-list-item>

                                            <v-list-item>
                                                <template v-slot:prepend>
                                                    <v-icon color="primary" size="large">mdi-format-letter-case</v-icon>
                                                </template>
                                                <v-list-item-title class="text-body-1 font-weight-medium">Nom abrégé</v-list-item-title>
                                                <v-list-item-subtitle class="text-subtitle-1">{{
                                                    selectedUnited.short_name
                                                }}</v-list-item-subtitle>
                                            </v-list-item>
                                        </v-list>
                                    </v-card-text>
                                </v-card>
                            </v-col>

                            <!-- Informations organisationnelles -->
                            <v-col cols="12" md="6">
                                <v-card class="mb-4" elevation="2">
                                    <v-card-text>
                                        <h3 class="text-h5 mb-4">Détails organisationnels</h3>
                                        <v-list density="comfortable">
                                            <v-list-item>
                                                <template v-slot:prepend>
                                                    <v-icon color="success" size="large">mdi-army</v-icon>
                                                </template>
                                                <v-list-item-title class="text-body-1 font-weight-medium">État-Major</v-list-item-title>
                                                <v-list-item-subtitle class="text-subtitle-1">{{
                                                    get_staffs(selectedUnited.g_staff, true)
                                                }}</v-list-item-subtitle>
                                            </v-list-item>

                                            <v-list-item>
                                                <template v-slot:prepend>
                                                    <v-icon color="success" size="large">mdi-map-marker</v-icon>
                                                </template>
                                                <v-list-item-title class="text-body-1 font-weight-medium"
                                                    >Région Militaire</v-list-item-title
                                                >
                                                <v-list-item-subtitle class="text-subtitle-1">{{
                                                    get_areas(selectedUnited.area, true)
                                                }}</v-list-item-subtitle>
                                            </v-list-item>

                                            <v-list-item>
                                                <template v-slot:prepend>
                                                    <v-icon color="success" size="large">mdi-account-group</v-icon>
                                                </template>
                                                <v-list-item-title class="text-body-1 font-weight-medium">Effectif</v-list-item-title>
                                                <v-list-item-subtitle class="text-subtitle-1">{{
                                                    selectedUnited.effective
                                                }}</v-list-item-subtitle>
                                            </v-list-item>
                                        </v-list>
                                    </v-card-text>
                                </v-card>
                            </v-col>

                            <!-- Dates et description -->
                            <v-col cols="12">
                                <v-card elevation="2">
                                    <v-card-text>
                                        <h3 class="text-h5 mb-4">Informations complémentaires</h3>

                                        <div class="d-flex mb-4">
                                            <div class="flex-grow-1">
                                                <v-icon color="info" size="large">mdi-calendar</v-icon>
                                                <span class="ml-2 text-subtitle-1"
                                                    >Créé le: {{ formatDate(selectedUnited.created_at) }}</span
                                                >
                                            </div>
                                            <div>
                                                <v-icon color="warning" size="large">mdi-calendar-clock</v-icon>
                                                <span class="ml-2 text-subtitle-1"
                                                    >Modifié le: {{ formatDate(selectedUnited.modified_at) }}</span
                                                >
                                            </div>
                                        </div>

                                        <v-divider class="mb-4"></v-divider>

                                        <div>
                                            <div class="text-h6 font-weight-bold mb-2">
                                                <v-icon color="deep-purple" size="large">mdi-text-box</v-icon>
                                                <span class="ml-2">Description</span>
                                            </div>
                                            <v-card class="pa-4 bg-grey-lighten-4">
                                                <p class="text-body-1">
                                                    {{ selectedUnited.description || 'Aucune description disponible' }}
                                                </p>
                                            </v-card>
                                        </div>
                                    </v-card-text>
                                </v-card>
                            </v-col>
                        </v-row>
                    </v-container>
                </v-card-text>
            </v-card>
        </v-dialog>
    </template>

    <!-- Snackbar pour les notifications -->
    <v-snackbar v-model="notif.snackbar.value" :color="notif.snackbarColor.value" :timeout="3000" location="top">
        {{ notif.snackbarMessage }}

        <template v-slot:actions>
            <v-btn color="white" variant="text" @click="notif.snackbar.value = false"> Fermer </v-btn>
        </template>
    </v-snackbar>

    <!-- Loading Overlay -->
    <v-overlay :model-value="isLoading" class="align-center justify-center">
        <v-progress-circular color="primary" indeterminate size="64"></v-progress-circular>
    </v-overlay>

    <!-- Error Alert -->
    <!-- <v-alert
        v-if="error"
        type="error"
        closable
        class="mb-4"
        @click:close="error = null"
    >
        {{ error }}
    </v-alert> -->
</template>

<style scoped>
/* ... (previous styles remain the same) */
/* .v-list-item-title {
    color: rgba(0, 0, 0, 0.87);
}

.v-list-item-subtitle {
    color: rgba(0, 0, 0, 0.6);
    font-size: 1rem;
    margin-top: 4px;
} */
</style>
