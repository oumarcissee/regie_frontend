<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue';
import { useProductsList } from '@/stores/rutStore/products/productsListStore';
import { truncateText ,notif, formatDate, showNotification} from '@/services/utils';
import fr from 'date-fns/locale/fr';
import { format } from 'date-fns';

const themeColor = ref('rgb(var(--v-theme-secondary))');
const itemsSelected = ref<Item[]>([]);
const searchField = ref(['name']);
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

        image(value: string | any[]) {
            if (editedIndex.value === -1) {
                if (!value || value[0]?.type.indexOf('image/') === -1) {
                    return 'Veillez selectionez une image';
                }

              
            }
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
const formData = new FormData();

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


// La fonction `setImage` pour assigner l'image sélectionnée
function setImage(event: Event) {
    const target = event.target as HTMLInputElement;
    const files = target.files;
    if (files && files[0]?.type.startsWith('image/')) {
        image.value = Array.from(files); // On stocke les fichiers dans un tableau
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

function handleImage() {
    if (cropper.value) {
        const canvas = cropper.value
            .getCroppedCanvas({
                width: 400,
                height: 400
            })
            .toBlob((blob: any) => {
                const timestamp = new Date().getTime(); // Obtient un timestamp unique
                const fileName = `cropped_image_${timestamp}.jpg`; // Nom du fichier avec timestamp
                formData.append('image', blob, fileName); // Ajoute le blob avec le nom de fichier unique
            }, 'image/jpg');

        dialogImg.value = false;
    }
}

const dialogImg = ref(false) as any;

const name = useField('name');

const price = useField('price');
const unite = useField('unite');
const rate_per_days = useField('rate_per_days');
const divider = useField('divider');
const description = useField('description');

const image = ref<File[] | null>(null);
const { errorMessage } = useField('image'); // On conserve uniquement le message d'erreur


const count = ref(0);


const submit = handleSubmit(async (values) => {
    try {
        isLoading.value = true;
        error.value = null;
        
        
        // Ajouter les valeurs de base au formData
        formData.append('name', values.name);
        formData.append('price', values.price);
        formData.append('unite', values.unite);
        formData.append('rate_per_days', values.rate_per_days);
        formData.append('divider', values.divider);
        formData.append('description', values.description);
        
        // Gestion de l'image
        if (editedIndex.value === -1) {
            // Cas de création : vérifier si une nouvelle image est fournie
            if (values.image?.[0]) {
                formData.append('image', values.image[0]);
            }
        } else {
            const croppedImage = formData.get('image');
            console.log("Je suis image", formData.get('image'))
            // Cas de modification : vérifier si une nouvelle image a été recadrée
            if (croppedImage) {
                // L'image recadrée est déjà dans le formData depuis handleImage()
                console.log('Image recadrée présente');
            }
        }

        // Appel API avec le bon ID pour la modification
        if (editedIndex.value !== -1) {
            await addOrUpdateProduct(formData, editedIndex.value);
        } else {
            await addOrUpdateProduct(formData);
        }

        // Rafraîchir la table et fermer le dialogue
        await refreshTable();
        dialog.value = false;
        
        // Afficher une notification de succès
        showNotification(
            editedIndex.value === -1 ? 'Article ajouté avec succès' : 'Article modifié avec succès',
            'success'
        );

    } catch (err) {
        if (err instanceof Error) {
            const axiosError = err as AxiosError<{[key: string]: string[]}>;
            if (axiosError.response?.data) {
                const errorMessages = Object.values(axiosError.response.data)
                    .flat()
                    .join(', ');
                showNotification(errorMessages, 'error');
            } else {
                showNotification(err.message, 'error');
            }
        } else {
            showNotification('Une erreur est survenue', 'error');
        }
    } finally {
        isLoading.value = false;
    }
});

// Fonction pour réinitialiser les champs
const refreshTable = async () => {
    await store.fetchItems();
    close();
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
const rolesbg = ref(['primary', 'secondary', 'error', 'success', 'warning']);
const desserts = ref(contact);
const editedIndex = ref(-1);

//Methods
const filteredList = computed(() => {
    return getItems.filter((item: any) => {
        return item.name.toLowerCase().includes(search.value.toLowerCase());
    });
});

function close() {
    dialog.value = false;
    editedIndex.value = -1;
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

// Suppression d'un element
const remove = async (index: any) => {
    try {
        await store.deleteItem(index, 'items');
        await refreshTable(); // Rafraîchir les données après la suppression
    } catch (error) {
        console.error('Erreur lors de la suppression :', error);
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
    { text: "Référence", value: "ref", },
    { text: "Article", value: "item", width: 300 },
    { text: "Prix", value: "price" },
    { text: "Modifié le", value: "modified_at"},
    { text: "Actions", value: "actions"}
];

</script>
<template>
    <v-row>
        <v-col cols="12" lg="4" md="6">
            <v-text-field density="compact" v-model="search" label="Rechercher des articles" variant="outlined"></v-text-field>
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
                                        v-model="image"
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
                    <v-img 
                        :lazy-src="item.image" 
                        :src="item.image" 
                        width="65px" 
                        class="rounded img-fluid"
                    ></v-img>
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
                    <v-btn 
                        icon 
                        flat 
                        @click="viewItem(raw)" 
                        v-bind="props"
                    >
                        <EyeIcon 
                            stroke-width="1.5" 
                            :size="20" 
                            class="text-success"
                        />
                    </v-btn>
                </template>
            </v-tooltip>
            <v-tooltip text="Edit">
                <template v-slot:activator="{ props }">
                    <v-btn 
                        icon 
                        flat 
                        @click="editItem(raw)" 
                        v-bind="props"
                    >
                        <PencilIcon 
                            stroke-width="1.5" 
                            size="20" 
                            class="text-primary"
                        />
                    </v-btn>
                </template>
            </v-tooltip>
            <v-tooltip text="Delete">
                <template v-slot:activator="{ props }">
                    <v-btn 
                        icon 
                        flat 
                        @click="remove(raw)" 
                        v-bind="props"
                    >
                        <TrashIcon 
                            stroke-width="1.5" 
                            size="20" 
                            class="text-error"
                        />
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

        <v-card-text class="pa-4" style="max-height: 80vh; overflow-y: auto;">
            <v-list v-if="selectedProduct" class="bg-grey-lighten-4 rounded-lg">
                <!-- Image Section -->
                <div class="position-relative mb-6 hover-zoom">
                    <v-img
                        :src="selectedProduct.image"
                        height="300"
                        class="rounded-lg"
                        cover
                        @click="showFullImage"
                        style="cursor: pointer;"
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
</v-dialog>a
    <!-- Existing dialogs remain the same -->
    
    <v-dialog v-model="imageDialog" >
        <v-card>
            <v-card-title class="pa-4 bg-grey-darken-3">
                <span class="text-white">{{ selectedProduct?.name }}</span>
                <v-spacer></v-spacer>
                <v-btn icon flat @click="closeImageDialog">
                    <v-icon color="white">mdi-close</v-icon>
                </v-btn>
            </v-card-title>
            <v-card-text class="pa-0">
                <v-img
                    :src="selectedProduct?.image"
                    max-height="80vh"
                    contain
                    class="bg-grey-darken-4"
                >
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
    <v-snackbar
        v-model="notif.snackbar.value"
        :color="notif.snackbarColor.value"
        :timeout="3000"
        location="top"
    >
        {{ notif.snackbarMessage }}
        
        <template v-slot:actions>
            <v-btn
                color="white"
                variant="text"
                @click="notif.snackbar.value = false"
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