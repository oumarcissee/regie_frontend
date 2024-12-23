<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useField, useForm } from 'vee-validate';
import type { Header, Item } from 'vue3-easy-data-table';
import { useSettingStore } from '@/stores/rutStore/settings/settingStore';
import { formatDate, signatorPosition, truncateText } from '@/services/utils';

// Store initialization
const store = useSettingStore();

// Reactive references pour les états d'erreur et de chargement
const valid = ref(true);
const dialog = ref(false);
const viewDialog = ref(false);
const editedIndex = ref(-1);
const selectedSignator = ref(null);
const searchField = ref(['first_name', 'last_name', 'title', 'function_name']);
const searchValue = ref('');
const themeColor = ref('rgb(var(--v-theme-secondary))');
const itemsSelected = ref<Item[]>([]);
const isLoading = ref(false);
const error = ref<string | null>(null);
const snackbar = ref(false);
const snackbarMessage = ref('');
const snackbarColor = ref('');

// Position options
const position = ref([
    { title: 'RIEN', value: 'default' },
    { title: 'GAUCHE', value: 'left' },
    { title: 'DROITE', value: 'right' },
    { title: 'CENTRE', value: 'center' },
]);

// Validation améliorée
const { handleSubmit, handleReset, isSubmitting } = useForm({
    validationSchema: {
        position(value: string) {
            if (!value) return 'Sélectionnez une position.';
            if (!['default', 'left', 'right', 'center'].includes(value)) {
                return 'Position invalide.';
            }
            return true;
        },
        first_name(value: string) {
            if (!value) return 'Entrer le prénom du signateur.';
            if (value.length < 2) return 'Le prénom doit contenir au moins 2 caractères.';
            if (value.length > 50) return 'Le prénom ne peut pas dépasser 50 caractères.';
            if (!/^[a-zA-ZÀ-ÿ\s'-]+$/.test(value)) return 'Le prénom contient des caractères invalides.';
            return true;
        },
        last_name(value: string) {
            if (!value) return 'Entrer le nom du signateur.';
            if (value.length < 2) return 'Le nom doit contenir au moins 2 caractères.';
            if (value.length > 50) return 'Le nom ne peut pas dépasser 50 caractères.';
            if (!/^[a-zA-ZÀ-ÿ\s'-]+$/.test(value)) return 'Le nom contient des caractères invalides.';
            return true;
        },
        function_name(value: string) {
            if (!value) return 'Entrer la fonction.';
            if (value.length > 100) return 'La fonction ne peut pas dépasser 100 caractères.';
            return true;
        },
        title(value: string) {
            if (!value) return 'Entrer le titre de la personne.';
            if (value.length > 100) return 'Le titre ne peut pas dépasser 100 caractères.';
            return true;
        }
    }
});

// Form fields
const first_name = useField('first_name');
const last_name = useField('last_name');
const function_name = useField('function_name');
const title = useField('title');
const positionField = useField('position');

// Headers restent les mêmes...

// Gestion des notifications
const showNotification = (message: string, color: string = 'success') => {
    snackbarMessage.value = message;
    snackbarColor.value = color;
    snackbar.value = true;
};

// Methods avec gestion d'erreurs
const submit = handleSubmit(async (values) => {
    try {
        isLoading.value = true;
        error.value = null;
        
        const formData = Object.fromEntries(
            Object.entries(values).map(([key, value]) => [key, value?.trim()])
        );

        if (editedIndex.value === -1) {
            await store.addOrUpdateSignator(formData);
            showNotification('Signateur ajouté avec succès');
        } else {
            await store.addOrUpdateSignator(formData, editedIndex.value);
            showNotification('Signateur modifié avec succès');
        }

    } catch (err) {
      
        error.value = err instanceof Error ? err.message : 'Une erreur est survenue';
        showNotification(error.value, 'error');
    } finally {
        isLoading.value = false;
        close();
        await refreshTable();
        
    }
});

// Table headers
const headers: Header[] = [
    { text: 'Prénom', value: 'first_name', sortable: true },
    { text: 'Nom', value: 'last_name', sortable: true },
    { text: 'Titre', value: 'title', sortable: true },
    { text: 'Fonction', value: 'function_name', sortable: true },
    { text: 'Position', value: 'position', sortable: true },
    { text: 'Actions', value: 'operation' }
];

// Computed properties
const formTitle = computed(() => {
    return editedIndex.value === -1 ? 'Nouveau signateur' : 'Editer un signateur';
});

const formButton = computed(() => {
    return editedIndex.value === -1 ? 'Enregistrer' : 'Modifier';
});


const viewItem = (item: any) => {
    selectedSignator.value = item;
    viewDialog.value = true;
};

const closeViewDialog = () => {
    viewDialog.value = false;
    selectedSignator.value = null;
    editedIndex.value = -1;
    handleReset();
};

const refreshTable = async () => {
    await store.fetchSignators();
};

const close = () => {
    dialog.value = false;
    editedIndex.value = -1;
    handleReset();
};

const editItem = (item: any) => {
    editedIndex.value = item.id;
    first_name.value.value = item.first_name;
    last_name.value.value = item.last_name;
    function_name.value.value = item.function_name;
    title.value.value = item.title;
    positionField.value.value = item.position;

    dialog.value = true;
};

const deleteItem = async (item: any) => {
    try {
        await store.deleteItem(item, 'operators');
        await refreshTable();
    } catch (error) {
        console.error('Error deleting item:', error);
    }
};

onMounted(async () => {
    await refreshTable();
});
</script>

<template>
    <v-row class="mb-4">
        <!-- Rest of the existing template code remains the same until the EasyDataTable actions template -->

        <v-col cols="12" lg="4" md="6">
            <v-text-field
                v-model="searchValue"
                type="text"
                variant="outlined"
                placeholder="Rechercher un signateur"
                density="compact"
                hide-details
                prepend-inner-icon="mdi-magnify"
                class="ml-auto"
            />
        </v-col>
        <v-col cols="12" lg="8" md="6" class="text-right">
            <v-dialog v-model="dialog" max-width="800" persistent>
                <template v-slot:activator="{ props }">
                    <v-btn color="primary" v-bind="props" flat class="ml-auto">
                        <v-icon class="mr-2">mdi-account-multiple-plus</v-icon>
                        Nouveau signateur
                    </v-btn>
                </template>

                <v-card>
                    <v-card-title class="pa-4 bg-secondary d-flex align-center justify-space-between">
                        <span class="title text-white">{{ formTitle }}</span>
                        <v-icon @click="close" class="ml-auto">mdi-close</v-icon>
                    </v-card-title>

                    <v-card-text>
                        <v-form ref="form" v-model="valid" @submit.prevent="submit">
                            <v-row>
                                <v-col cols="12" sm="6">
                                    <v-text-field
                                        v-model="first_name.value.value"
                                        :error-messages="first_name.errorMessage.value"
                                        label="Prénom"
                                        variant="outlined"
                                        required
                                    />
                                </v-col>

                                <v-col cols="12" sm="6">
                                    <v-text-field
                                        v-model="last_name.value.value"
                                        :error-messages="last_name.errorMessage.value"
                                        label="Nom"
                                        variant="outlined"
                                        required
                                    />
                                </v-col>

                                <v-col cols="12" sm="6">
                                    <v-text-field
                                        v-model="title.value.value"
                                       :error-messages="title.errorMessage.value"
                                        label="Titre"
                                        variant="outlined"
                                        required
                                    />
                                </v-col>

                                <v-col cols="12" sm="6">
                                    <v-text-field
                                        v-model="function_name.value.value"
                                        :error-messages="function_name.errorMessage.value"
                                        label="Fonction"
                                        variant="outlined"
                                        required
                                    />
                                </v-col>

                                <v-col cols="12">
                                    <v-select
                                        v-model="positionField.value.value"
                                        :items="position"
                                        item-title="title"
                                        item-value="value"
                                        :error-messages="positionField.errorMessage.value"
                                        label="Position"
                                        variant="outlined"
                                        required
                                    />
                                </v-col>
                            </v-row>
                        </v-form>
                    </v-card-text>

                    <v-card-actions class="pa-4">
                        <v-btn
                            color="secondary"
                            variant="flat"
                            @click="submit"
                            block
                            :loading="isSubmitting"
                        >
                            {{ formButton }}
                        </v-btn>
                    </v-card-actions>
                </v-card>
            </v-dialog>
        </v-col>
    </v-row>

    <EasyDataTable
        :headers="headers"
        :items="store.getSignators"
        :theme-color="themeColor"
        table-class-name="customize-table"
        :search-field="searchField"
        :search-value="searchValue"
        :rows-per-page="8"
        v-model:items-selected="itemsSelected"
        show-index
        buttons-pagination
    >

        <template #item-position="{ position }">
            <div class="player-wrapper">
                <span class="text-subtitle-1 d-block mt-1 textSecondary">{{ signatorPosition(position) }}</span>
            </div>
        </template>

         <template #item-title="{ title }">
            <div class="player-wrapper">
                <span class="text-subtitle-1 d-block mt-1 textSecondary">{{ truncateText(title, 20) }}</span>
            </div>
        </template>

         <template #item-function_name="{ function_name }">
            <div class="player-wrapper">
                <span class="text-subtitle-1 d-block mt-1 textSecondary">{{ truncateText(function_name, 20) }}</span>
            </div>
        </template>
        
        <template #item-operation="item">
            <div class="d-flex align-center">
                <v-tooltip text="Visualiser">
                    <template v-slot:activator="{ props }">
                        <v-btn icon flat @click="viewItem(item)" v-bind="props">
                            <v-icon color="info">mdi-eye</v-icon>
                        </v-btn>
                    </template>
                </v-tooltip>

                <v-tooltip text="Editer">
                    <template v-slot:activator="{ props }">
                        <v-btn icon flat @click="editItem(item)" v-bind="props">
                            <v-icon color="primary">mdi-pencil</v-icon>
                        </v-btn>
                    </template>
                </v-tooltip>

                <v-tooltip text="Supprimer">
                    <template v-slot:activator="{ props }">
                        <v-btn icon flat @click="deleteItem(item)" v-bind="props">
                            <v-icon color="error">mdi-delete</v-icon>
                        </v-btn>
                    </template>
                </v-tooltip>
            </div>
        </template>
    </EasyDataTable>

    <!-- View Dialog -->
    <v-dialog v-model="viewDialog" max-width="800">
        <v-card>
            <v-card-title class="pa-4 bg-info d-flex align-center justify-space-between">
                <span class="title text-white">Détails du signateur</span>
                <v-icon @click="closeViewDialog" class="ml-auto text-white">mdi-close</v-icon>
            </v-card-title>

            <v-card-text class="pa-4">
                <v-list v-if="selectedSignator">
                    <v-list-item>
                        <v-list-item-title class="font-weight-bold mb-2">Prénom</v-list-item-title>
                        <v-list-item-subtitle>{{ selectedSignator.first_name }}</v-list-item-subtitle>
                    </v-list-item>

                    <v-list-item>
                        <v-list-item-title class="font-weight-bold mb-2">Nom</v-list-item-title>
                        <v-list-item-subtitle>{{ selectedSignator.last_name }}</v-list-item-subtitle>
                    </v-list-item>

                    <v-list-item>
                        <v-list-item-title class="font-weight-bold mb-2">Titre</v-list-item-title>
                        <v-list-item-subtitle>{{ selectedSignator.title }}</v-list-item-subtitle>
                    </v-list-item>

                    <v-list-item>
                        <v-list-item-title class="font-weight-bold mb-2">Fonction</v-list-item-title>
                        <v-list-item-subtitle>{{ selectedSignator.function_name }}</v-list-item-subtitle>
                    </v-list-item>

                    <v-list-item>
                        <v-list-item-title class="font-weight-bold mb-2">Position</v-list-item-title>
                        <v-list-item-subtitle>{{ signatorPosition(selectedSignator.position) }}</v-list-item-subtitle>
                    </v-list-item>
                </v-list>
            </v-card-text>
        </v-card>
    </v-dialog>

    <!-- Existing dialogs remain the same -->


     <!-- Snackbar pour les notifications -->
 <v-snackbar
    v-model="snackbar"
    :color="snackbarColor"
    :timeout="3000"
    location="top"
>
    {{ snackbarMessage }}
    
    <template v-slot:actions>
        <v-btn
            color="white"
            variant="text"
            @click="snackbar = false"
        >
            Fermer
        </v-btn>
    </template>
</v-snackbar>

    <!-- Loading Overlay -->
    <v-overlay
        :model-value="isLoading"
        class="align-center justify-center"
    >
        <v-progress-circular
            color="primary"
            indeterminate
            size="64"
        ></v-progress-circular>
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
.v-card-title {
    font-size: 1.25rem;
}
</style>