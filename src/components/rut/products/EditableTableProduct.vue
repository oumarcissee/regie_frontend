<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue';
import { useProductsList } from '@/stores/rutStore/products/productsListStore';
import { truncateText, notif, formatDate, showNotification } from '@/services/utils';
import fr from 'date-fns/locale/fr';
import { format } from 'date-fns';

const themeColor = ref('rgb(var(--v-theme-secondary))');
const itemsSelected = ref<Item[]>([]);
const searchField = ref(['ref', 'item.name']);
const searchValue = ref('');
import { EyeIcon } from 'lucide-vue-next';

// Add these new refs
const viewDialog = ref(false);
const selectedProduct = ref(null);

const locale = fr; // or en, or es
const isLoading = ref(false);
const error = ref<string | null>(null);

import type { VueCropperMethods } from 'vue-cropperjs';
import VueCropper from 'vue-cropperjs';

import { useField, useForm } from 'vee-validate';

import type { Items } from '@/types/rut/SignatorType';

import contact from '@/_mockApis/apps/contact';
import type { Item } from 'vue3-easy-data-table';

const { addOrUpdateProduct, errors } = useProductsList();
const store = useProductsList();

const { handleSubmit, handleReset, isSubmitting } = useForm({
    validationSchema: {
        name(value: string | any[]) {
            if (value?.length <= 4 || !value) {
                return 'Le libéllé doit avoir au moins 4 lettres.';
            } else if (errors.nameError && errors.nameText === value) {
                return errors.nameError;
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

        unite(value: string | any[]) {
            if (value) return true;
            return "Choisissez l'unité.";
        },

        rate_per_days(value: string | any[]) {
            if (!/^\d+\.\d+$/.test(value as any)) {
                // La chaîne ne contient que des chiffres et a une longueur de 9 caractères
                return 'Entrer le taux (en nombre decimal).';
            }

            return true;
        },

        divider(value: string | any[]) {
            if (!/^[0-9]*[1-9][0-9]*$/.test(value as any)) {
                // La chaîne ne contient que des chiffres et a une longueur de 9 caractères
                return 'Entrer le diviseur.';
            }
            return true;
        },

        description(value: string | any[]) {
            if (value) return true;
            return true;
        }
    }
});

onMounted(async () => {
    isLoading.value = true;
    await refreshTable();
    isLoading.value = false;
});

const imageDialog = ref(false);

const showFullImage = () => {
    imageDialog.value = true;
};

const closeImageDialog = () => {
    imageDialog.value = false;
};

const getItems: any = computed(async () => {
    return await store.items;
});

import type { AxiosError } from 'axios';

const imageSrc = ref('');

const selected = ref<string | null | undefined | number>(null);
let cropper = ref<VueCropperMethods | null>(null);
const formData = ref(new FormData()); // Changé en ref pour réinitialisation

const loading = ref(false);

// Add this new method
const viewItem = (item: any) => {
    selectedProduct.value = item;
    viewDialog.value = true;
};

const closeViewDialog = () => {
    viewDialog.value = false;
    selectedProduct.value = null;
};

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

const dialogImg = ref(false) as any;

const name = useField('name');
const image = useField('image');

const price = useField('price');
const unite = useField('unite');
const rate_per_days = useField('rate_per_days');
const divider = useField('divider');
const description = useField('description');

const imag = ref<File[] | null>(null);
const { errorMessage } = useField('image'); // On conserve uniquement le message d'erreur

const count = ref(0);

// Modifier la fonction submit
const croppedImage = computed(() => formData.value.get('image'));

const submit = handleSubmit(async (values) => {
    const submitFormData = new FormData();

    submitFormData.append('name', values.name);
    submitFormData.append('price', values.price);
    submitFormData.append('unite', values.unite);
    submitFormData.append('rate_per_days', values.rate_per_days);
    submitFormData.append('divider', values.divider);
    submitFormData.append('description', values.description);

    if (croppedImage.value) {
        submitFormData.append('image', croppedImage.value);
    } else if (values.image?.[0]) {
        submitFormData.append('image', values.image[0]);
    }

    try {
        isLoading.value = true;
        error.value = null;

        if (editedIndex.value !== -1) {
            await addOrUpdateProduct(submitFormData, editedIndex.value);
        } else {
            await addOrUpdateProduct(submitFormData);
        }

        await refreshTable();
        dialog.value = false;
        formData.value = new FormData();
        showNotification(editedIndex.value === -1 ? 'Article ajouté avec succès' : 'Article modifié avec succès', 'success');
    } catch (err) {
        // error.value = err.message;
        showNotification("Erreur lors de l'opération", 'error');
    } finally {
        isLoading.value = false;
    }
});

// Modifier la fonction refreshTable pour être plus robuste
const refreshTable = async () => {
    try {
        loading.value = true;
        await store.fetchItems();
        // Forcer la réactivité en créant une nouvelle référence
        store.items = [...store.items];
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

const unites = ref([
    { title: 'Sac(s)', value: 'bag' },
    { title: 'Bidon(s)', value: 'can' },
    { title: 'Carton(s)', value: 'cardboard' }
]);

const valid = ref(true);
const dialog = ref(false);

const search = ref('');
// const rolesbg = ref(['primary', 'secondary', 'error', 'success', 'warning']);
const desserts = ref(contact);
const editedIndex = ref(-1);

//Methods
const filteredList = computed(() => {
    return getItems.filter((item: any) => {
        return item.name.toLowerCase().includes(search.value.toLowerCase());
    });
});

// Ajouter une fonction de nettoyage
function close() {
    dialog.value = false;
    editedIndex.value = -1;
    formData.value = new FormData(); // Réinitialiser le FormData
    handleReset();
}

function closeImg() {
    dialogImg.value = false;
}

// Méthode pour modifier un élément
const editItem = (index: any) => {
    dialog.value = true;
    editedIndex.value = index.id;

    name.value.value = index.name;
    price.value.value = index.price;
    unite.value.value = index.unite;
    rate_per_days.value.value = index.rate_per_days;
    divider.value.value = index.divider;
    description.value.value = index.description;
};

// Modifier la fonction remove pour gérer le loading state
const remove = async (index: any) => {
    try {
        loading.value = true;
        const isRemove = await store.deleteItem(index, 'items');
        if (isRemove) {
            // Attendre que la suppression soit terminée avant de rafraîchir
            await refreshTable();
            showNotification('Article supprimé avec succès', 'success');
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
    return editedIndex.value === -1 ? 'Nouvel Article' : 'Editer un Article';
});

//Computed Property
const formButton = computed(() => {
    return editedIndex.value === -1 ? 'Enregistrer' : 'Modifier';
});

const headers = [
    { text: 'Réf', value: 'ref', sortable: true },
    { text: 'Article', value: 'item', width: 300, sortable: true },
    { text: 'Prix', value: 'price', sortable: true },
    { text: 'Modifié le', value: 'modified_at', sortable: true },
    { text: 'Actions', value: 'actions' }
];
</script>
<template>
    <v-row>
        <v-col cols="12" lg="4" md="6">
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
        <v-col cols="12" lg="8" md="6" class="text-right">
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

            <v-dialog v-model="dialog" max-width="800">
                <template v-slot:activator="{ props }">
                    <v-btn color="primary" v-bind="props" flat class="ml-auto">
                        <v-icon class="mr-2">mdi-account-multiple-plus</v-icon>Ajouter un article
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
                                <v-col cols="12" sm="6">
                                    <v-text-field
                                        variant="outlined"
                                        v-model="name.value.value"
                                        :error-messages="name.errorMessage.value"
                                        label="Libéllé"
                                    >
                                    </v-text-field>
                                </v-col>
                                <v-col cols="12" sm="6">
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
                                <v-col cols="12" sm="6">
                                    <v-text-field
                                        variant="outlined"
                                        v-model="price.value.value"
                                        :error-messages="price.errorMessage.value"
                                        label="Prix unitaire"
                                    ></v-text-field>
                                </v-col>
                                <v-col cols="12" sm="6">
                                    <v-text-field
                                        variant="outlined"
                                        v-model="rate_per_days.value.value"
                                        :error-messages="rate_per_days.errorMessage.value"
                                        label="Le taux par jour"
                                    ></v-text-field>
                                </v-col>
                                <v-col cols="12" sm="6">
                                    <v-text-field
                                        variant="outlined"
                                        v-model="divider.value.value"
                                        :error-messages="divider.errorMessage.value"
                                        label="Le diviseur"
                                    ></v-text-field>
                                </v-col>
                                <v-col cols="12" sm="6">
                                    <v-select
                                        label="Unité"
                                        :items="unites"
                                        @update:modelValue="changed"
                                        single-line
                                        variant="outlined"
                                        v-model="unite.value.value"
                                        :error-messages="unite.errorMessage.value"
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
        :items="store.items"
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
                    <v-img :lazy-src="item.image" :src="item.image" width="65px" class="rounded img-fluid"></v-img>
                </div>
                <div class="ml-5">
                    <h4 class="text-h6 font-weight-semibold">{{ item.name }}</h4>
                    <span class="text-subtitle-1 d-block mt-1 textSecondary">
                        {{ truncateText(item.description, 20) }}
                    </span>
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
    <v-dialog v-model="viewDialog" max-width="900">
        <v-card>
            <v-card-title class="pa-4 bg-success d-flex align-center justify-space-between">
                <span class="title text-white">Détails de l'article</span>
                <v-icon @click="closeViewDialog" class="ml-auto text-white">mdi-close</v-icon>
            </v-card-title>

            <v-card-text class="pa-4" style="max-height: 80vh; overflow-y: auto">
                <v-list v-if="selectedProduct" class="bg-grey-lighten-4 rounded-lg">
                    <!-- Image Section -->
                    <div class="position-relative mb-6 hover-zoom">
                        <v-img
                            :src="selectedProduct.image"
                            height="300"
                            class="rounded-lg"
                            cover
                            @click="showFullImage"
                            style="cursor: pointer"
                        >
                            <template v-slot:placeholder>
                                <v-row class="fill-height ma-0" align="center" justify="center">
                                    <v-progress-circular indeterminate color="primary"></v-progress-circular>
                                </v-row>
                            </template>
                            <div class="image-overlay d-flex align-center justify-center">
                                <v-icon size="40" color="white">mdi-magnify-plus</v-icon>
                            </div>
                        </v-img>
                    </div>

                    <!-- Details Grid -->
                    <v-row class="px-2 ma-0">
                        <v-col cols="12" md="6" class="pa-2">
                            <v-card class="pa-4" elevation="2">
                                <div class="d-flex align-center mb-2">
                                    <v-icon color="primary" class="mr-2">mdi-barcode</v-icon>
                                    <div class="font-weight-bold">Référence</div>
                                </div>
                                <div class="text-body-1 ml-8">{{ selectedProduct.ref }}</div>
                            </v-card>
                        </v-col>

                        <v-col cols="12" md="6" class="pa-2">
                            <v-card class="pa-4" elevation="2">
                                <div class="d-flex align-center mb-2">
                                    <v-icon color="primary" class="mr-2">mdi-tag</v-icon>
                                    <div class="font-weight-bold">Nom</div>
                                </div>
                                <div class="text-body-1 ml-8">{{ selectedProduct.name }}</div>
                            </v-card>
                        </v-col>

                        <v-col cols="12" md="6" class="pa-2">
                            <v-card class="pa-4" elevation="2">
                                <div class="d-flex align-center mb-2">
                                    <v-icon color="success" class="mr-2">mdi-currency-usd</v-icon>
                                    <div class="font-weight-bold">Prix</div>
                                </div>
                                <div class="text-body-1 ml-8">{{ selectedProduct.price }} GNF</div>
                            </v-card>
                        </v-col>

                        <v-col cols="12" md="6" class="pa-2">
                            <v-card class="pa-4" elevation="2">
                                <div class="d-flex align-center mb-2">
                                    <v-icon color="info" class="mr-2">mdi-package-variant</v-icon>
                                    <div class="font-weight-bold">Unité</div>
                                </div>
                                <div class="text-body-1 ml-8">{{ selectedProduct.unite }}</div>
                            </v-card>
                        </v-col>

                        <v-col cols="12" md="6" class="pa-2">
                            <v-card class="pa-4" elevation="2">
                                <div class="d-flex align-center mb-2">
                                    <v-icon color="warning" class="mr-2">mdi-percent</v-icon>
                                    <div class="font-weight-bold">Taux par jour</div>
                                </div>
                                <div class="text-body-1 ml-8">{{ selectedProduct.rate_per_days }}%</div>
                            </v-card>
                        </v-col>

                        <v-col cols="12" md="6" class="pa-2">
                            <v-card class="pa-4" elevation="2">
                                <div class="d-flex align-center mb-2">
                                    <v-icon color="error" class="mr-2">mdi-division</v-icon>
                                    <div class="font-weight-bold">Diviseur</div>
                                </div>
                                <div class="text-body-1 ml-8">{{ selectedProduct.divider }}</div>
                            </v-card>
                        </v-col>

                        <v-col cols="12" md="6" class="pa-2">
                            <v-card class="pa-4" elevation="2">
                                <div class="d-flex align-center mb-2">
                                    <v-icon color="success" class="mr-2">mdi-calendar-plus</v-icon>
                                    <div class="font-weight-bold">Date de création</div>
                                </div>
                                <div class="text-body-1 ml-8">{{ formatDate(selectedProduct.created_at) }}</div>
                            </v-card>
                        </v-col>

                        <v-col cols="12" md="6" class="pa-2">
                            <v-card class="pa-4" elevation="2">
                                <div class="d-flex align-center mb-2">
                                    <v-icon color="info" class="mr-2">mdi-calendar-edit</v-icon>
                                    <div class="font-weight-bold">Dernière modification</div>
                                </div>
                                <div class="text-body-1 ml-8">{{ formatDate(selectedProduct.modified_at) }}</div>
                            </v-card>
                        </v-col>

                        <v-col cols="12" class="pa-2">
                            <v-card class="pa-4" elevation="2">
                                <div class="d-flex align-center mb-2">
                                    <v-icon color="primary" class="mr-2">mdi-text-box</v-icon>
                                    <div class="font-weight-bold">Description</div>
                                </div>
                                <div class="text-body-1 ml-8">{{ selectedProduct.description }}</div>
                            </v-card>
                        </v-col>
                    </v-row>
                </v-list>
            </v-card-text>
        </v-card>
    </v-dialog>
    <!-- Existing dialogs remain the same -->

    <v-dialog v-model="imageDialog">
        <v-card>
            <v-card-title class="pa-4 bg-grey-darken-3">
                <span class="text-white">{{ selectedProduct?.name }}</span>
                <v-spacer></v-spacer>
                <v-btn icon flat @click="closeImageDialog">
                    <v-icon color="white">mdi-close</v-icon>
                </v-btn>
            </v-card-title>
            <v-card-text class="pa-0">
                <v-img :src="selectedProduct?.image" max-height="80vh" contain class="bg-grey-darken-4">
                    <template v-slot:placeholder>
                        <v-row class="fill-height ma-0" align="center" justify="center">
                            <v-progress-circular indeterminate color="primary"></v-progress-circular>
                        </v-row>
                    </template>
                </v-img>
            </v-card-text>
        </v-card>
    </v-dialog>

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
