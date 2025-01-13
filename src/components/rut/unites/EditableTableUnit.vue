<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue';
import { useUnitStore } from '@/stores/rutStore/unit/unitStore';
import { truncateText ,notif, formatDate, showNotification, get_staffs, get_unite_type, get_areas} from '@/services/utils';
import fr from 'date-fns/locale/fr';
import { format } from 'date-fns';

const themeColor = ref('rgb(var(--v-theme-secondary))');
const itemsSelected = ref<Item[]>([]);
const searchField = ref(['ref','item.name']);
const searchValue = ref('');
import { EyeIcon } from 'lucide-vue-next';

// Add these new refs
const viewDialog = ref(false);
const selectedProduct = ref(null);

const locale = fr; // or en, or es
const isLoading = ref(false);
const error = ref<string | null>(null);


import { useField, useForm } from 'vee-validate';

import type { Items } from '@/types/rut/SignatorType';

import contact from '@/_mockApis/apps/contact';
import type { Item } from 'vue3-easy-data-table';


const { addOrUpdateUnit, errors, getUnites, fetchUnites } = useUnitStore();
const store = useUnitStore();


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

        short_name(value: string | any[]) {
            if (value?.length <= 2 || !value) {
                return 'Le libéllé doit avoir au moins 2 lettres.';
            } else if (errors.nameError && errors.nameText === value) {
                return errors.nameError;
            }
            return true;
        },

        type_of_unit(value: string | any[]) {
            if (value) return true;
            return "Choisissez un type.";
        },
        g_staff(value: string | any[]) {
            if (value) return true;
            return "Choisissez un Etat-Major.";
        },

        area(value: string | any[]) {
            if (value) return true;
            return "Choisissez une Region-Militaire.";
        },

        effective(value: string | any[]) {
            if (!/^[0-9]*[1-9][0-9]*$/.test(value as any)) {
                // La chaîne ne contient que des chiffres et a une longueur de 9 caractères
                return "Entrer l'effectif de l'unité";
            }
            return true;
        },

        description(value: string | any[]) {
            if (value) return true;
            return true;
        }
    }
});


const g_staffs = ref([
    { title: 'EMAT', value: 'emat' },
    { title: 'EMAA', value: 'emaa' },
    { title: 'EMAM', value: 'emam' },
    { title: 'HCGN-DJM', value: 'hcgn' }
]);

const areas = ref([
    { title: 'ZONE SPECIALE', value: 'speciale' },
    { title: '1ere RM', value: 'first' },
    { title: '2eme RM', value: 'second' },
    { title: '3eme RM', value: 'third' },
    { title: '4eme RM', value: 'fourth' }
]);

const type_of_unites = ref([
    { title: 'COURANT', value: 'current' },
    { title: 'MISSION', value: 'mission' },
    // { title: '4eme RM', value: 'single' }
]);


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


const getUnite: any = computed(async () => {
    return await getUnites;
});

import type { AxiosError } from 'axios';

const selected = ref<string | null | undefined | number>(null);

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


const name          = useField('name');
const short_name    = useField('short_name');
const g_staff       = useField('g_staff');
const area          = useField('area');
const effective     = useField('effective');
const type_of_unit  = useField('type_of_unit');
const description = useField('description');


const count = ref(0);

// Modifier la fonction submit

const submit = handleSubmit(async (values) => {
    
    try {

        const submitFormData = new FormData();
        
        submitFormData.append('name', values.name);
        submitFormData.append('short_name', values.short_name);
        submitFormData.append('g_staff', values.g_staff);
        submitFormData.append('area', values.area);
        submitFormData.append('type_of_unit', values.type_of_unit);
        submitFormData.append('effective', values.effective);
        submitFormData.append('category', 'unit'); // Categorie de l'unité
        submitFormData.append('description', values.description);
      
        isLoading.value = true;
        error.value = null;
        
        if (editedIndex.value !== -1) {
            await addOrUpdateUnit(submitFormData, editedIndex.value);
        } else {
            await addOrUpdateUnit(submitFormData);
        }

        await refreshTable();
        dialog.value = false;
        showNotification(
            editedIndex.value === -1 ? 'Unite/service ajouté avec succès' : 'Unite/service modifié avec succès',
            'success'
        );
    } catch (err) {
        // error.value = err.message;
        console.log(error)
        showNotification('Erreur lors de l\'opération', 'error');
    } finally {
        isLoading.value = false;
    }
});

// Modifier la fonction refreshTable pour être plus robuste
const refreshTable = async () => {
    try {
        loading.value = true;
        await store.fetchUnites();
        // Forcer la réactivité en créant une nouvelle référence
        store.unites = [...store.unites];
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
const editItem = (index: any) => {
    dialog.value = true;
    editedIndex.value = index.id;

    name.value.value = index.name;
    description.value.value = index.description;
};

// Modifier la fonction remove pour gérer le loading state
const remove = async (index: any) => {
    try {
        loading.value = true;
        const isRemove = await store.deleteItem(index, 'unites');
        if(isRemove){
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
    return editedIndex.value === -1 ? 'Nouvelle Unite/service' : 'Editer un Unite/service';
});

//Computed Property
const formButton = computed(() => {
    return editedIndex.value === -1 ? 'Enregistrer' : 'Modifier';
});



const headers = [
    { text: "Réf", value: "ref", sortable:true},
    { text: "Unité", value: "short_name" , sortable:true},
    { text: "Armée", value: "area", sortable:true },
    { text: "Type", value: "type_of_unit",sortable:true},
    { text: "Effectif", value: "effective",sortable:true},
    { text: "Actions", value: "actions"}
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
            <!-- Dialogue img -->
            <!-- <v-dialog v-model="dialogImg" max-width="1000">
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
            </v-dialog> -->
            <!-- End dialogue img -->

            <v-dialog v-model="dialog" max-width="800">
                <template v-slot:activator="{ props }">
                    <v-btn color="primary" v-bind="props" flat class="ml-auto">
                        <v-icon class="mr-2">mdi-account-multiple-plus</v-icon>Ajouter une unite/service
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
                                    <v-text-field
                                        placeholder="nom abrégé"
                                        variant="outlined"
                                        v-model="short_name.value.value"
                                        :error-messages="short_name.errorMessage.value"
                                        label="Libéllé abrégé"
                                    >
                                    </v-text-field>
                                </v-col>
                               
                               
                                
                                <v-col cols="12" sm="6">
                                    <v-select
                                        label="Etat-Major"
                                        :items="g_staffs"
                                        @update:modelValue="changed"
                                        single-line
                                        variant="outlined"
                                        v-model="g_staff.value.value"
                                        :error-messages="g_staff.errorMessage.value"
                                    >
                                    </v-select>
                                </v-col>

                                 <v-col cols="12" sm="6">
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

                                 <v-col cols="12" sm="6">
                                    <v-select
                                        label="Type de l'unité"
                                        :items="type_of_unites"
                                        @update:modelValue="changed"
                                        single-line
                                        variant="outlined"
                                        v-model="type_of_unit.value.value"
                                        :error-messages="type_of_unit.errorMessage.value"
                                    >
                                    </v-select>
                                </v-col>

                                 <v-col cols="12" sm="6">
                                    <v-text-field
                                        variant="outlined"
                                        v-model="effective.value.value"
                                        :error-messages="effective.errorMessage.value"
                                        label="Effectif"
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
        :items="store.unites"
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
                    <!-- <span class="text-subtitle-1 d-block mt-1 textSecondary">
                        {{ truncateText(item.description, 20) }}
                    </span> -->
                </div>
            </div>
        </template>
        <!-- Custom template for Article column -->
        <template #item-type_of_unit="{ type_of_unit }">
            <div class="d-flex align-center">
                <div class="ml-5">
                    <h4 class="text-h6 font-weight-semibold">{{ get_unite_type(type_of_unit)}}</h4>
                   
                </div>
            </div>
        </template>
         <template #item-area="{ area }">
            <div class="d-flex align-center">
                <div class="ml-5">
                    <h4 class="text-h6 font-weight-semibold">{{ get_areas(area)}}</h4>
                   
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
</v-dialog>
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