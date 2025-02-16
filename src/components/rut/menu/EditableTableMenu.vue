<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue';
import { useMenuStore } from '@/stores/rutStore/menu/menuStore';
import { truncateText, notif, showNotification, type_of_spending } from '@/services/utils';

const themeColor = ref('rgb(var(--v-theme-secondary))');
const itemsSelected = ref<Item[]>([]);
const searchField = ref(['ref', 'name']);
const searchValue = ref('');
import { EyeIcon } from 'lucide-vue-next';

// Add these new refs
const viewDialog = ref(false);
const selectedUnited = ref(null);

const isLoading = ref(false);
const error = ref<string | null>(null);

import { useField, useForm } from 'vee-validate';


import type { Item } from 'vue3-easy-data-table';
import type { VueCropperMethods } from 'vue-cropperjs';
import VueCropper from 'vue-cropperjs';


const { addOrUpdateMenu, errors, getMenus, fetchMenus } = useMenuStore();
const store = useMenuStore();

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

        image(value: File[] | null) {
            // Pour la création d'un nouvel article
            if (editedIndex.value === -1) {
                // Si aucune image n'est sélectionnée
                if (!value || !Array.isArray(value) || value.length === 0) {
                    return 'Veuillez sélectionner une image';
                }

                // Vérifie si le premier fichier existe et est une image
                const file = value[0];
                if (!file) {
                    return 'Veuillez sélectionner une image';
                }

                // Vérifie si c'est bien une image
                if (!file.type || !file.type.startsWith('image/')) {
                    return 'Le fichier sélectionné doit être une image';
                }

                // Vérifie la taille de l'image (par exemple, max 5MB)
                const maxSize = 5 * 1024 * 1024; // 5MB
                if (file.size > maxSize) {
                    return "L'image ne doit pas dépasser 5MB";
                }

                // Si toutes les validations passent
                return true;
            }

            // Pour la modification d'un article existant
            if (value && Array.isArray(value) && value.length > 0) {
                const file = value[0];
                if (!file.type || !file.type.startsWith('image/')) {
                    return 'Le fichier sélectionné doit être une image';
                }
                // Vérifie la taille de l'image
                const maxSize = 5 * 1024 * 1024; // 5MB
                if (file.size > maxSize) {
                    return "L'image ne doit pas dépasser 5MB";
                }
            }

            // Si aucune nouvelle image n'est sélectionnée en mode édition, c'est OK
            return true;
        },

        price(value: string | any[]) {
            if (!/^[0-9]*[1-9][0-9]*$/.test(value as any)) {
                // La chaîne ne contient que des chiffres et a une longueur de 9 caractères
                return "Entrer le prix de l'article avec des chiffres.";
            }
            return true;
        },
        rate(value: string | any[]) {
            if (!/^\d+\.\d+$/.test(value as any)) {
                // La chaîne ne contient que des chiffres et a une longueur de 9 caractères
                return 'Entrer le taux (en nombre decimal).';
            }

            return true;
        },
        type_menu(value: string | any[]) {
            if (value) return true;
            return "Choisissez l'unité.";
        },

        description(value: string | any[]) {
            if (value) return true;
            return true;
        }
    }
});

const types = ref([
    { title: 'Menu', value: 'food' },
    { title: 'Autre', value: 'other' }
]);

onMounted(async () => {
    isLoading.value = true;
    // unitStore.fetchAllAreas();
    await refreshTable();
    isLoading.value = false;
});

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
const image = useField('image');
const price = useField('price');
const rate = useField('rate');
const type_menu = useField('type_menu');
const description = useField('description');

const imag = ref<File[] | null>(null);
const { errorMessage } = useField('image');
const croppedImage = computed(() => formData.value.get('image'));

let cropper = ref<VueCropperMethods | null>(null);
const dialogImg = ref(false) as any;
const imageSrc = ref('');
const formData = ref(new FormData());

const count = ref(0);
const pError = ref();

// Modifier la fonction submit

const submit = handleSubmit(async (values, { setErrors }: any) => {
    try {
        pError.value = null;
        errors.nameError = null;

        const submitFormData = new FormData();

        submitFormData.append('name', values.name);
        submitFormData.append('price', values.price);
        submitFormData.append('rate', values.rate);
        submitFormData.append('type_menu', values.type_menu);
        submitFormData.append('description', values.description);

        if (croppedImage.value) {
            submitFormData.append('image', croppedImage.value);
        } else if (values.image?.[0]) {
            submitFormData.append('image', values.image[0]);
        }

        isLoading.value = true;
        error.value = null;

        if (editedIndex.value !== -1) {
            await addOrUpdateMenu(submitFormData, editedIndex.value);
        } else {
            await addOrUpdateMenu(submitFormData);
        }
        handleReset(); //reset

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

function closeImg() {
    dialogImg.value = false;
}
// Modifier la fonction setImage
function setImage(event: Event) {
    const target = event.target as HTMLInputElement;
    const files = target.files;
    if (files && files[0]?.type.startsWith('image/')) {
        imag.value = Array.from(files);
        image.value.value = [...Array.from(files)];

        dialogImg.value = true;
        const reader = new FileReader();
        reader.onload = (e) => {
            if (e.target && e.target.result) {
                imageSrc.value = e.target.result.toString();
                if (cropper.value) {
                    cropper.value.replace(imageSrc.value);
                }
            }
        };
        reader.readAsDataURL(files[0]);
    } else {
        dialogImg.value = false;
    }
}

// Modifier la fonction handleImage
function handleImage() {
    if (cropper.value) {
        cropper.value
            .getCroppedCanvas({
                width: 400,
                height: 400
            })
            .toBlob(
                (blob: Blob) => {
                    if (blob) {
                        const timestamp = new Date().getTime();
                        const fileName = `cropped_image_${timestamp}.jpg`;

                        // Créer un nouveau FormData à chaque fois
                        formData.value = new FormData();
                        formData.value.append('image', blob, fileName);
                        // console.log(formData.value.get('image'), "dans la gestion");

                        // Fermer le dialogue de recadrage
                        dialogImg.value = false;
                    }
                },
                'image/jpeg',
                0.8
            ); // Ajout de la qualité de compression
    }
}
// Modifier la fonction refreshTable pour être plus robuste
const refreshTable = async () => {
    try {
        loading.value = true;
        await fetchMenus();
        console.log(store.menus);
        // Forcer la réactivité en créant une nouvelle référence
        store.menus = [...store.menus];
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
    price.value.value = item.price;
    type_menu.value.value = item.type_menu;
    rate.value.value = item.rate;
    description.value.value = item.description;

    dialog.value = true;
};

// Modifier la fonction remove pour gérer le loading state
const remove = async (index: any) => {
    // console.log(index);
    try {
        loading.value = true;
        const isRemove = await store.deleteItem(index);
        if (isRemove) {
            // Attendre que la suppression soit terminée avant de rafraîchir
            await refreshTable();
            showNotification('Menu supprimé avec succès', 'success');
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
    return editedIndex.value === -1 ? 'Nouveau Menu' : 'Editer un Menu';
});

//Computed Property
const formButton = computed(() => {
    return editedIndex.value === -1 ? 'Enregistrer' : 'Modifier';
});

const headers = [
    { text: 'Libéllé', value: 'item', sortable: true },
    { text: 'Type', value: 'item.type_menu', sortable: true },
    { text: 'Prix Unitaire', value: 'item.price', sortable: true },
    { text: 'T/J', value: 'item.rate', sortable: true },
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
                        <v-icon class="mr-2">mdi-account-multiple-plus</v-icon>Ajouter un menu
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
                                    <v-file-input
                                        chips
                                        label="Importer une image"
                                        variant="outlined"
                                        accept=".jpeg,.jpg,.png"
                                        v-model="imag"
                                        :error-messages="errorMessage"
                                        @change="setImage"
                                    ></v-file-input>
                                    <!-- Cropper -->
                                </v-col>

                                <v-col cols="12" sm="12">
                                    <v-select
                                        label="Type de menu"
                                        :items="types"
                                        @update:modelValue="changed"
                                        single-line
                                        variant="outlined"
                                        v-model="type_menu.value.value"
                                        :error-messages="type_menu.errorMessage.value"
                                    >
                                    </v-select>
                                </v-col>

                                <v-col cols="12" sm="12">
                                    <v-text-field
                                        variant="outlined"
                                        v-model="price.value.value"
                                        :error-messages="price.errorMessage.value"
                                        label="Prix unitaire"
                                    ></v-text-field>
                                </v-col>
                                <v-col cols="12" sm="12">
                                    <v-text-field
                                        variant="outlined"
                                        v-model="rate.value.value"
                                        :error-messages="rate.errorMessage.value"
                                        label="Le taux par jour"
                                    ></v-text-field>
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

     <!-- Dialogue img -->
            <v-dialog v-model="dialogImg" max-width="1000">
                <v-card>
                    <v-card-title class="pa-4 bg-secondary d-flex align-center justify-space-between">
                        <span class="title text-white">Recadrement de l'image</span>
                        <v-icon @click="closeImg()" class="ml-auto">mdi-close</v-icon>
                    </v-card-title>

                    <v-card-text>
                        <v-row>
                            <v-col cols="12">
                                <div class="content">
                                    <div class="img-cropper">
                                        <VueCropper ref="cropper" :aspect-ratio="16 / 9" :src="imageSrc" preview=".preview" />
                                    </div>
                                </div>
                            </v-col>
                        </v-row>
                    </v-card-text>

                    <v-card-actions class="pa-4">
                        <v-btn color="secondary" variant="flat" block @click="handleImage">Recadrer l'image</v-btn>
                    </v-card-actions>
                </v-card>
            </v-dialog>
            <!-- End dialogue img -->

    <!-- Replace v-table with EasyDataTable -->
    <EasyDataTable
        :headers="headers"
        :items="store.menus"
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
        <template #item-item="{ item }">
            <div class="d-flex align-center">
                <div class="hoverable">
                    <v-img :lazy-src="item.image" :src="item.image" width="60px" class="rounded img-fluid"></v-img>
                </div>
                <div class="ml-5">
                    <h4 class="text-h6 font-weight-semibold">{{ item.name }}</h4>
                    <span class="text-subtitle-1 d-block mt-1 textSecondary">
                        {{ truncateText(item.description, 20) }}
                    </span>
                </div>
            </div>
        </template>
        <template #item-item-type_menu="{ type_menu }">
            <div class="d-flex align-center">
                <div class="ml-5">
                    <h4 class=" ">{{ type_menu }}</h4>
                </div>
            </div>
        </template>

        <template #item-item-price="{ price }">
            <div class="d-flex align-center">
                <div class="ml-5">
                    <h4 class=" ">{{ price }}</h4>
                </div>
            </div>
        </template>

          <template #item-item-rate="{ rate }">
            <div class="d-flex align-center">
                <div class="ml-5">
                    <h4 class=" ">{{ rate }}</h4>
                </div>
            </div>
        </template>


        <!-- Custom template for Actions column -->
        <template #item-actions="{ raw }">
            <div class="d-flex align-center">
                <v-tooltip text="View">
                    <template v-slot:activator="{ props }">
                        <v-btn icon flat @click="viewItem(raw)" v-bind="props">
                            <EyeIcon stroke-width="1.5" :size="20" class="text-success" />
                        </v-btn>
                    </template>
                </v-tooltip>
                <v-tooltip text="Edit">
                    <template v-slot:activator="{ props }">
                        <v-btn icon flat @click="editItem(raw)" v-bind="props">
                            <PencilIcon stroke-width="1.5" size="20" class="text-primary" />
                        </v-btn>
                    </template>
                </v-tooltip>
                <v-tooltip text="Delete">
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
                            <!-- <v-col cols="12" md="6">
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
                            </v-col> -->

                            <!-- Informations organisationnelles -->
                            <!-- <v-col cols="12" md="6">
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
                            </v-col> -->

                            <!-- Dates et description -->
                            <!-- <v-col cols="12">
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
                            </v-col> -->
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
