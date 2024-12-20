<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useField, useForm } from 'vee-validate';
import type { Header, Item } from 'vue3-easy-data-table';
import { useSettingStore } from '@/stores/rutStore/settings/settingStore';
import { formatDate ,signatorPosition} from '@/services/utils';

// Store initialization
const store = useSettingStore();

// Reactive references
const valid = ref(true);
const dialog = ref(false);
const editedIndex = ref(-1);
const searchField = ref(['first_name', 'last_name', 'title', 'function_name']);
const searchValue = ref('');
const themeColor = ref('rgb(var(--v-theme-secondary))');
const itemsSelected = ref<Item[]>([]);

// Position options
const position = ref([
    { title: 'RIEN', value: 'default' },
    { title: 'GAUCHE', value: 'left' },
    { title: 'DROITE', value: 'right' },
    { title: 'CENTRE', value: 'center' },
]);

// Form validation
const { handleSubmit, handleReset, isSubmitting } = useForm({
    validationSchema: {
        position(value: string) {
            if (!value) return 'Sélectionnez une position.';
            return true;
        },
        first_name(value: string) {
            if (!value) return 'Entrer le prénom du signateur.';
            if (value.length < 2) return 'Le prénom doit contenir au moins 2 caractères.';
            return true;
        },
        last_name(value: string) {
            if (!value) return 'Entrer le nom du signateur.';
            if (value.length < 2) return 'Le nom doit contenir au moins 2 caractères.';
            return true;
        },
        function_name(value: string) {
            if (!value) return 'Entrer la fonction.';
            return true;
        },
        title(value: string) {
            if (!value) return 'Entrer le titre de la personne.';
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

// Methods
const submit = handleSubmit(async (values) => {
    try {
     
        //Chargement des données
        const formData = Object.fromEntries(
            Object.entries(values).map(([key, value]) => [key, value?.trim()])
        );

        if (editedIndex.value === -1) {
            await store.addOrUpdateSignator(formData);
        } else {
            await store.addOrUpdateSignator(formData, editedIndex.value);
        }

        close();
        await refreshTable();
    } catch (error) {
        console.error('Error submitting form:', error);
    }
});

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

        <template #item-operation="item">
            <div class="d-flex align-center">
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
</template>

<style scoped>
.v-card-title {
    font-size: 1.25rem;
}
</style>