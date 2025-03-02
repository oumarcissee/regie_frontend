<template>
    <div class="d-flex align-center gap-4 mb-4">
        <!-- Zone de recherche -->
        <v-text-field 
            density="compact" 
            v-model="searchValue" 
            label="Rechercher par nom" 
            variant="outlined"
            placeholder="Entrez un nom..."
            prepend-inner-icon="mdi-magnify"
            clearable
            class="flex-grow-1"
            hide-details
        ></v-text-field>
        
        <!-- Filtre par type -->
        <v-select
            density="compact"
            v-model="typeFilter"
            :items="types"
            label="Filtrer par type"
            variant="outlined"
            clearable
            hide-details
            style="min-width: 200px;"
        ></v-select>

        <!-- Bouton d'ajout -->
        <v-btn 
            color="primary" 
            prepend-icon="mdi-account-multiple-plus"
            @click="dialog = true"
            class="ml-auto"
        >
            Ajouter une une dépense
        </v-btn>
    </div>

    <!-- Dialogue d'ajout -->
    <template>
         <v-row class="align-center">
             <v-dialog v-model="dialog" max-width="800" persistent>
                 <v-card>
                     <v-card-title class="pa-4 bg-secondary d-flex align-center justify-space-between">
                         <span class="title text-white">{{ formTitle }}</span>
                         <v-icon @click="close()" class="ml-auto">mdi-close</v-icon>
                     </v-card-title>
         
                     <v-card-text>
                         <v-form ref="form" v-model="valid" @submit.prevent="submit">
                             <v-row>
                                 <v-col cols="12" sm="12">
                                     <v-text-field placeholder="Saisissez le nom en integralité" variant="outlined"
                                         v-model="name.value.value" 
                                           @input="name.value.value = $event.target.value.toUpperCase()"     
                                            :error-messages="name.errorMessage.value" label="Libéllé">
                                     </v-text-field>
                                 </v-col>
         
                                 <v-col cols="12" sm="12">
                                     <v-file-input chips label="Importer une image" variant="outlined" accept=".jpeg,.jpg,.png"
                                         v-model="imag" :error-messages="errorMessage" @change="setImage"></v-file-input>
                                     <!-- Cropper -->
                                 </v-col>
         
                                 <v-col cols="12" sm="12">
                                     <v-select label="Type de menu" :items="types" @update:modelValue="changed" single-line
                                         variant="outlined" v-model="type_menu.value.value"
                                         :error-messages="type_menu.errorMessage.value">
                                     </v-select>
                                 </v-col>
         
                                 <v-col cols="12" sm="12" v-if="isOtherMenu">
                                     <v-text-field variant="outlined" v-model="price.value.value"
                                         :error-messages="price.errorMessage.value" label="Prix unitaire"></v-text-field>
                                 </v-col>
                                 <v-col cols="12" sm="12" v-if="isOtherMenu">
                                     <v-text-field variant="outlined" v-model="rate.value.value"
                                         :error-messages="rate.errorMessage.value" label="Le taux par jour"></v-text-field>
                                 </v-col>
         
                                 <v-col cols="12" sm="12">
                                     <VTextarea label="Description" auto-grow placeholder="Salut, avez-vous quel que chose a dire?"
                                         rows="2" color="primary" row-height="25" shaped v-model="description.value.value"
                                         :error-messages="description.errorMessage.value"></VTextarea>
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

         </v-row>

    </template>


    <!-- Dialogue pour afficher les détails -->
    <v-dialog v-model="viewDialog" max-width="1000" persistent>
        <v-card>
            <v-card-title class="pa-4 bg-secondary d-flex align-center justify-space-between">
                <span class="title text-white">Détails de la dépense</span>
                <v-icon @click="closeViewDialog" class="ml-auto">mdi-close</v-icon>
            </v-card-title>

            <v-card-text class="pa-4">
                <v-row>
                    <v-col cols="12" class="d-flex align-center">
                        <v-avatar :color="stringToColor(selectedUnited.name)" size="80" class="mr-4">
                            <span class="text-h4 font-weight-bold white--text">{{ selectedUnited.name.substring(0, 2).toUpperCase() }}</span>
                        </v-avatar>
                        <div>
                            <h2 class="text-h5 font-weight-bold">{{ selectedUnited.name }}</h2>
                            <p class="text-subtitle-1 textSecondary">{{ selectedUnited.description }}</p>
                        </div>
                    </v-col>

                    <v-col cols="12">
                        <v-divider></v-divider>
                    </v-col>

                    <v-col cols="12" sm="6">
                        <v-list>
                            <v-list-item>
                                <v-list-item-title class="font-weight-bold">Type de dépense</v-list-item-title>
                                <v-list-item-subtitle>{{ type_of_spending(selectedUnited.type_menu) }}</v-list-item-subtitle>
                            </v-list-item>
                            <v-list-item>
                                <v-list-item-title class="font-weight-bold">Prix unitaire</v-list-item-title>
                                <v-list-item-subtitle>{{ selectedUnited.price || '-' }}</v-list-item-subtitle>
                            </v-list-item>
                            <v-list-item>
                                <v-list-item-title class="font-weight-bold">Taux par jour</v-list-item-title>
                                <v-list-item-subtitle>{{ selectedUnited.rate || '-' }}</v-list-item-subtitle>
                            </v-list-item>
                        </v-list>
                    </v-col>

                    <v-col cols="12" sm="6">
                        <v-img 
                            v-if="selectedUnited.image" 
                            :src="selectedUnited.image" 
                            class="rounded"
                            height="200"
                            cover
                        ></v-img>
                        <v-img 
                            v-else 
                            :src="getInitialsImageUrl(selectedUnited.name)" 
                            class="rounded"
                            height="200"
                            cover
                        ></v-img>
                    </v-col>
                </v-row>
            </v-card-text>

            <v-card-actions class="pa-4">
                <v-btn color="secondary" variant="flat" @click="closeViewDialog" block>Fermer</v-btn>
            </v-card-actions>
        </v-card>
    </v-dialog>


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

    <EasyDataTable
        :headers="headers"
        :items="filteredMenus"
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
                    <!-- Utiliser l'image téléchargée ou générer l'image avec les initiales -->
                    <v-img 
                        v-if="item.image" 
                        :lazy-src="item.image" 
                        :src="item.image" 
                        width="60px" 
                        class="rounded img-fluid"
                    ></v-img>
                    <v-avatar
                        v-else
                        :color="stringToColor(item.name)"
                        size="60"
                        class="rounded"
                    >
                        <span class="text-h5 font-weight-bold white--text">{{ item.name.substring(0, 2).toUpperCase() }}</span>
                    </v-avatar>
                </div>
                <div class="ml-5">
                    <h4 class="text-h6 font-weight-semibold">{{ item.name }}</h4>
                    <span class="text-subtitle-1 d-block mt-1 textSecondary" v-if="item.description">
                        {{ truncateText(item.description, 20) }}
                    </span>
                </div>
            </div>
        </template>
        <template #item-type_menu="{ type_menu }">
            <div class="d-flex align-center">
                <div class="ml-5">
                    <h4 class="">{{ type_of_spending(type_menu)}}</h4>
                </div>
            </div>
        </template>

        <template #item-item-price="{ price }">
            <div class="d-flex align-center">
                <div class="ml-5">
                    <h4 class="">{{ price || '-' }}</h4>
                </div>
            </div>
        </template>

        <template #item-item-rate="{ rate }">
            <div class="d-flex align-center">
                <div class="ml-5">
                    <h4 class="">{{ rate || '-' }}</h4>
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
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue';
import { useMenuStore } from '@/stores/rutStore/menu/menuStore';
import { truncateText, notif, showNotification, type_of_spending } from '@/services/utils';

const themeColor = ref('rgb(var(--v-theme-secondary))');
const itemsSelected = ref<Item[]>([]);
const searchField = ref(['item.name', 'type_menu']);
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
import UiMenus from '@/views/ui-elements/UiMenus.vue';

const { addOrUpdateMenu, errors, getMenus, fetchMenus } = useMenuStore();
const store = useMenuStore();

const { handleSubmit, handleReset, isSubmitting } = useForm({
    validationSchema: {
        name(value: string | any[]) {
            if (value?.length <= 4 || !value) {
                return 'Le libéllé doit avoir au moins 4 lettres.';
            } else if (store.errors.nameError && store.errors.nameText === value) {
                return store.errors.nameError;
            }
            return true;
        },
        image(value: File[] | null) {
            if (editedIndex.value === -1) {
                return true;
            }
            if (value && Array.isArray(value) && value.length > 0) {
                const file = value[0];
                if (!file.type || !file.type.startsWith('image/')) {
                    return 'Le fichier sélectionné doit être une image';
                }
                const maxSize = 5 * 1024 * 1024;
                if (file.size > maxSize) {
                    return "L'image ne doit pas dépasser 5MB";
                }
            }
            return true;
        },
        price(value: string | any[]) {
            if (uniteSelected.value === 'food' && (!/^[0-9]*[1-9][0-9]*$/.test(value as any))) {
                return "Entrer le prix de l'article avec des chiffres.";
            }
            return true;
        },
        rate(value: string | any[]) {
            if (uniteSelected.value === 'food' && (!/^\d+\.\d+$/.test(value as any))) {
                return 'Entrer le taux (en nombre decimal).';
            }
            return true;
        },
        type_menu(value: string | any[]) {
            if (value) return true;
            return "Choisissez l'unité.";
        },
        description(value: string | any[]) {
            return true;
        }
    }
});

const types = ref([
    { title: 'Menu', value: 'food' },
    { title: 'Autre', value: 'other' }
]);

const typeFilter = ref<string | null>('food');

const filteredMenus = computed(() => {
    let menus = store.menus;

    // Filter by type if a type is selected
    if (typeFilter.value) {
        menus = menus.filter((menu: { type_menu: string }) => menu.type_menu === typeFilter.value);
    }

    // Filter by search value if present
    if (searchValue.value) {
        const searchTerm = searchValue.value.toLowerCase();
        menus = menus.filter((menu: any) => 
            menu.type_menu.toLowerCase().includes(searchTerm) ||
            menu.type_menu.toLowerCase().includes(searchTerm)
        );
    }

    return menus;
});

onMounted(async () => {
    isLoading.value = true;
    await refreshTable();
    isLoading.value = false;
});

const selected = ref<string | null | undefined | number>(null);
const loading = ref(false);

const viewItem = (item: any) => {
    selectedUnited.value = { ...item };
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

const getInitialsImageUrl = (itemName: string) => {
    if (!itemName) return '';
    const initials = itemName.substring(0, 2).toUpperCase();
    const bgColor = stringToColor(itemName);
    return `data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='100' height='100' viewBox='0 0 100 100'%3E%3Crect width='100' height='100' fill='${encodeURIComponent(bgColor)}'/%3E%3Ctext x='50' y='50' font-family='Arial' font-size='40' fill='white' text-anchor='middle' dominant-baseline='central'%3E${encodeURIComponent(initials)}%3C/text%3E%3C/svg%3E`;
};

const stringToColor = (str: string) => {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
        hash = str.charCodeAt(i) + ((hash << 5) - hash);
    }
    let color = '#';
    for (let i = 0; i < 3; i++) {
        const value = (hash >> (i * 8)) & 0xFF;
        color += ('00' + value.toString(16)).substr(-2);
    }
    return color;
};

const submit = handleSubmit(async (values, { setErrors }: any) => {
    try {
        pError.value = null;
        errors.nameError = null;

        const submitFormData = new FormData();

        submitFormData.append('name', values.name);
        submitFormData.append('type_menu', values.type_menu);
        
        if (values.type_menu === 'food') {
            submitFormData.append('price', values.price || '0');
            submitFormData.append('rate', values.rate || '0.0');
            submitFormData.append('description', values.description || '');
        }

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
        handleReset();

        await refreshTable();
        dialog.value = false;
        showNotification(editedIndex.value === -1 ? 'Menu ajouté avec succès' : 'Menu modifié avec succès', 'success');
    } catch (err) {
        pError.value = error;
        count.value++;
        if (count.value <= 1) submit();

        return setErrors({ apiError: error });
    } finally {
        isLoading.value = false;
    }
});

function closeImg() {
    dialogImg.value = false;
}

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

                        formData.value = new FormData();
                        formData.value.append('image', blob, fileName);

                        dialogImg.value = false;
                    }
                },
                'image/jpeg',
                0.8
            );
    }
}

const refreshTable = async () => {
    try {
        loading.value = true;
        await fetchMenus("food");
        store.menus = [...store.menus];
    } catch (error) {
        console.error('Erreur lors du rafraîchissement :', error);
        showNotification('Erreur lors du rafraîchissement des données', 'error');
    } finally {
        loading.value = false;
    }
};

const uniteSelected = ref();
const isOtherMenu = ref(false);

const changed = (value: string | any) => {
    isOtherMenu.value = value === 'food' ? true : false;
    uniteSelected.value = value;
    return value;
};

const valid = ref(true);
const dialog = ref(false);

const editedIndex = ref(-1);

function close() {
    dialog.value = false;
    editedIndex.value = -1;
    handleReset();
}

const editItem = (item: any) => {
    editedIndex.value = item.id;
    name.value.value = item.name;
    type_menu.value.value = item.type_menu;
    
    if (item.type_menu === 'food') {
        price.value.value = item.price;
        rate.value.value = item.rate;
        description.value.value = item.description;
        isOtherMenu.value = true;
    } else {
        isOtherMenu.value = false;
    }
    
    dialog.value = true;
};

const remove = async (index: any) => {
    try {
        loading.value = true;
        const isRemove = await store.deleteItem(index);
        if (isRemove) {
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

const formTitle = computed(() => {
    return editedIndex.value === -1 ? 'Nouveau menu' : 'Editer un menu';
});

const formButton = computed(() => {
    return editedIndex.value === -1 ? 'Enregistrer' : 'Modifier';
});

const headers = [
    { text: 'Libéllé', value: 'item', sortable: true },
    { text: 'Type', value: 'type_menu', sortable: true },
    { text: 'Prix Unitaire', value: 'item.price', sortable: true },
    { text: 'T/J', value: 'item.rate', sortable: true },
    { text: 'Actions', value: 'actions' }
];
</script>

<style scoped>
.img-cropper {
    max-width: 100%;
    margin: 0 auto;
}


.v-card-title {
    background-color: var(--v-theme-secondary);
    color: white;
}

.v-list-item-title {
    font-weight: bold;
}



.v-img {
    border-radius: 8px;
}

.v-avatar {
    border-radius: 8px;
}


.v-input {
    margin-bottom: 16px;
}

</style>