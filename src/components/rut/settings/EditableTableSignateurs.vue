<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useSettingStore } from '@/stores/rutStore/settings/settingStore';
import { format } from 'date-fns';
import { useField, useForm } from 'vee-validate';
import type { Signator } from '@/types/rut/SignatorType';

import { PencilIcon, TrashIcon } from 'lucide-vue-next';

const store = useSettingStore();
const { addOrUpdateProduct } = store;

const positions = ref([
    { title: 'Rien', value: 'default' },
    { title: 'A gauche', value: 'left' },
    { title: 'A droite', value: 'right' },
    { title: 'Au milieu', value: 'center' }
]);

const { handleSubmit, handleReset, isSubmitting } = useForm({
    validationSchema: {
        first_name(value: string) {
            if (!value || value.length < 2) {
                return 'Le prénom doit avoir au moins 2 lettres.';
            }
            return true;
        },
        last_name(value: string) {
            if (!value || value.length < 2) {
                return 'Le nom doit avoir au moins 2 lettres.';
            }
            return true;
        },
        position(value: string) {
            if (!value) {
                return 'Veuillez choisir une position.';
            }
            return true;
        },
        function_name(value: string) {
            if (!value || value.length < 2) {
                return 'La fonction doit avoir au moins 2 lettres.';
            }
            return true;
        },
        title(value: string) {
            if (!value || value.length < 2) {
                return 'Le titre doit avoir au moins 2 lettres.';
            }
            return true;
        }
    }
});

const search = ref('');
const dialog = ref(false);
const editedIndex = ref(-1);

const first_name = useField('first_name');
const last_name = useField('last_name');
const title = useField('title');
const function_name = useField('function_name');
const position = useField('position');

const formatDate = (date: string | Date) => {
    return date ? format(new Date(date), 'dd/MM/yyyy HH:mm') : '-';
};

onMounted(async () => {
    try {
        await refreshTable();
    } catch (error) {
        console.error('Error initializing component:', error);
    }
});

const getItems = computed(() => {
    return items.value.filter(
        (item: Signator) =>
            item.first_name.toLowerCase().includes(search.value.toLowerCase()) ||
            item.last_name.toLowerCase().includes(search.value.toLowerCase())
    );
});

const formTitle = computed(() => (editedIndex.value === -1 ? 'Nouveau signataire' : 'Modifier un signataire'));

const formButton = computed(() => (editedIndex.value === -1 ? 'Enregistrer' : 'Modifier'));

const submit = handleSubmit(async (data: any, { setErrors }: any) => {
    const formData = new FormData();

    Object.keys(data).forEach((key) => {
        formData.append(key, data[key]);
    });

    try {
        if (editedIndex.value !== -1) {
            await addOrUpdateProduct(formData, editedIndex.value);
        } else {
            await addOrUpdateProduct(formData);
        }

        await refreshTable();
        dialog.value = false; // Fermer le dialogue après soumission réussie
    } catch (error: any) {
        console.error('Erreur lors de la soumission :', error);

        if (error.response?.data) {
            const apiErrors = error.response.data;
            const errorMessages: Record<string, string> = {};

            Object.keys(apiErrors).forEach((key) => {
                errorMessages[key] = apiErrors[key][0];
            });

            setErrors(errorMessages);
        } else {
            setErrors({ apiError: "Une erreur est survenue lors de l'enregistrement." });
        }
    }
});

const items = ref<Signator[]>([]);

const refreshTable = async () => {
    try {
        const fetchedSignators = await store.fetchSignators();
        console.log(fetchedSignators);
        

        items.value = fetchedSignators;
        close();
    } catch (error) {
        console.error('Erreur lors du rafraîchissement :', error);
        items.value = [];
    }
};

const close = () => {
    dialog.value = false;
    editedIndex.value = -1;
    handleReset();
};

const editItem = (item: Signator) => {
    dialog.value = true;
    editedIndex.value = item.id;

    first_name.value.value = item.first_name;
    last_name.value.value = item.last_name;
    function_name.value.value = item.function_name;
    position.value.value = item.position;
    title.value.value = item.title;
};

const remove = async (item: Signator) => {
    try {
        await store.deleteItem(item, 'operators');
        await refreshTable();
    } catch (error) {
        console.error('Erreur lors de la suppression :', error);
    }
};
</script>
<template>
    <v-row>
        <v-col cols="12" lg="4" md="6">
            <v-text-field density="compact" v-model="search" label="Rechercher par nom ou prénom" variant="outlined"></v-text-field>
        </v-col>
        <v-col cols="12" lg="8" md="6" class="text-right">
            <v-dialog v-model="dialog" max-width="800">
                <template v-slot:activator="{ props }">
                    <v-btn color="primary" v-bind="props" flat class="ml-auto">
                        <v-icon class="mr-2">mdi-account-multiple-plus</v-icon>
                        Ajouter un signataire
                    </v-btn>
                </template>
                <v-card>
                    <v-card-title class="pa-4 bg-secondary d-flex align-center justify-space-between">
                        <span class="title text-white">{{ formTitle }}</span>
                        <v-icon @click="close()" class="ml-auto">mdi-close</v-icon>
                    </v-card-title>

                    <v-card-text>
                        <v-form>
                            <v-row>
                                <v-col cols="12" sm="6">
                                    <v-text-field
                                        variant="outlined"
                                        v-model="first_name.value.value"
                                        :error-messages="first_name.errorMessage.value"
                                        label="Prénoms"
                                    ></v-text-field>
                                </v-col>

                                <v-col cols="12" sm="6">
                                    <v-text-field
                                        variant="outlined"
                                        v-model="last_name.value.value"
                                        :error-messages="last_name.errorMessage.value"
                                        label="Nom"
                                    ></v-text-field>
                                </v-col>
                                <v-col cols="12">
                                    <v-text-field
                                        variant="outlined"
                                        v-model="title.value.value"
                                        :error-messages="title.errorMessage.value"
                                        label="Titre"
                                    ></v-text-field>
                                </v-col>
                                <v-col cols="12">
                                    <v-text-field
                                        variant="outlined"
                                        v-model="function_name.value.value"
                                        :error-messages="function_name.errorMessage.value"
                                        label="Fonction"
                                    ></v-text-field>
                                </v-col>
                                <v-col cols="12">
                                    <v-select
                                        label="Position"
                                        :items="positions"
                                        variant="outlined"
                                        v-model="position.value.value"
                                        :error-messages="position.errorMessage.value"
                                    ></v-select>
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
    <v-table class="mt-5">
        <thead>
            <tr>
                <th class="text-subtitle-1 font-weight-semibold">#</th>
                <th class="text-subtitle-1 font-weight-semibold">Référence</th>
                <th class="text-subtitle-1 font-weight-semibold">Prénoms</th>
                <th class="text-subtitle-1 font-weight-semibold">Nom</th>
                <th class="text-subtitle-1 font-weight-semibold">Titre</th>
                <th class="text-subtitle-1 font-weight-semibold">Fonction</th>
                <th class="text-subtitle-1 font-weight-semibold">Créé le</th>
                <th class="text-subtitle-1 font-weight-semibold">Modifié le</th>
                <th class="text-subtitle-1 font-weight-semibold">Actions</th>
            </tr>
        </thead>
        <tbody>
            <tr v-for="(item, index) in getItems" :key="item.id">
                <td class="text-subtitle-1">{{ index + 1 }}</td>
                <td class="text-subtitle-1">{{ item.ref }}</td>
                <td>
                    <div class="d-flex align-center py-4">
                        <div class="ml-5">
                            <h4 class="text-h6 font-weight-semibold">{{ item.first_name }}</h4>
                        </div>
                    </div>
                </td>
                <td class="text-subtitle-1">{{ item.last_name }}</td>
                <td class="text-subtitle-1">{{ item.title }}</td>
                <td class="text-subtitle-1">{{ item.function_name }}</td>
                <td class="text-subtitle-1">{{ formatDate(item.created_at) }}</td>
                <td class="text-subtitle-1">{{ formatDate(item.modified_at) }}</td>
                <td>
                    <div class="d-flex align-center">
                        <v-tooltip text="Modifier">
                            <template v-slot:activator="{ props }">
                                <v-btn icon flat @click="editItem(item)" v-bind="props">
                                    <PencilIcon :stroke-width="1.5" :size="20" class="text-primary" />//+
                                </v-btn>
                            </template>
                        </v-tooltip>

                        <v-tooltip text="Supprimer">
                            <template v-slot:activator="{ props }">
                                <v-btn icon flat @click="remove(item)" v-bind="props">
                                    <TrashIcon stroke-width="1.5" :size="20" class="text-error" />
                                </v-btn>
                            </template>
                        </v-tooltip>
                    </div>
                </td>
            </tr>
        </tbody>
    </v-table>
</template>
