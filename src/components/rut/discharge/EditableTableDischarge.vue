<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, watch, watchEffect } from 'vue';
import { useDischargeStore } from '@/stores/rutStore/discharge/dischargeStore';
import { useUnitStore } from '@/stores/rutStore/unit/unitStore';
import {
    truncateText,
    notif,
    formatDate,
    showNotification,
    get_staffs,
    get_unite_type,
    get_areas,
    get_category_of_unite,
    get_full_unite,
    formatGuineanFrancs,
    slipCategory
} from '@/services/utils';
import { get_quantity, repartirBudgetAvecTauxPrecis } from '@/services/utilsMoment';
import CustomComBox from '@/components/forms/form-elements/autocomplete/CustomComBoxUnites.vue';
import CustomComBoxSpend from '@/components/forms/form-elements/autocomplete/CustomComBoxSpend.vue'; //
import 'v-calendar/dist/style.css';
import UiChildCard from '@/components/shared/UiChildCard.vue';

const themeColor = ref('rgb(var(--v-theme-secondary))');
const itemsSelected = ref<Item[]>([]);
const searchField = ref(['name', 'type_of_unit']);
const printPreviewDialog = ref(false);
const quantityDialog = ref(false);
const quantityItem = ref('');
const myIndex = ref(null);

const searchValue = ref('');
import { EyeIcon } from 'lucide-vue-next';

// Add these new refs
const viewDialog = ref(false);
const selectedUnited = ref(null);

const isLoading = ref(false);
const error = ref<string | null>(null);

import { useField, useForm } from 'vee-validate';

import type { Item } from 'vue3-easy-data-table';

const { addOrUpdateDischarge, errors, getTotalWeight , fetchAllDischLines} = useDischargeStore();
const store = useDischargeStore();
const unitStore = useUnitStore();

const { handleSubmit, handleReset, isSubmitting } = useForm({
    validationSchema: {
        unite(value: string | any[]) {
            if (value) return true;
            return 'Séléctionner une unité.';
        },
        curent_type_of_slip(value: string | any[]) {
            if (value) return true;
            return 'Selectionnez une catégorie.';
        },
       
    }
});

const curent_type_of_slip = useField('curent_type_of_slip');
const unite = useField('unite');

const current_unit = ref(null);
const current_category = ref(null);

const type_of_unites = ref([
    { title: 'COURANT', value: 'current' },
    { title: 'MISSION', value: 'mission' }
    // { title: '4eme RM', value: 'single' }
]);

// Les types des bordereaux
const type_of_slip = ref([
    { title: 'COMPLETE', value: 'full' },
    { title: 'ESPECE', value: 'espece' }
]);

// Add type filter
const typeFilter = ref('current'); //
const filteredSlip = computed(() => {
    let slips = store.boredereaux;

    // Filter by type if a type is selected
    if (typeFilter.value) {
        slips = slips?.filter((unit: any) => unit.type_of_unit === typeFilter.value);
    }

    // Filter by search value if present
    if (searchValue.value) {
        const searchTerm = searchValue.value.toLowerCase();
        slips = slips.filter(
            (unit: any) => unit.name.toLowerCase().includes(searchTerm) || get_unite_type(unit.type_of_unit).toLowerCase().includes(searchTerm)
        );
    }
    return slips;
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

const count = ref(0);
const pError = ref();

// Modifier la fonction submit
const submit = handleSubmit(async (values, { setErrors }: any) => {
    try {
        // const submitFormData = new FormData();
    

        const submitData = {
            slip: { // Les bordereaux
                category: values.curent_type_of_slip,
                start:  typeFilter.value === 'mission' ? range.value.start : null,
                end: typeFilter.value === 'mission' ? range.value.end : null,
                effective: effective.value
            },
         
            unit: unitedId.value,
            products: store.products,
            otherDepenses: addedSpends.value,
        }

        pError.value = null;    
        errors.nameError = null;
        errors.shortNameError = null;


        isLoading.value = true;
        error.value = null;

        if (editedIndex.value !== -1) {
            await addOrUpdateDischarge(submitData, editedIndex.value);
        } else {
            await addOrUpdateDischarge(submitData);
        }

        //
        handleReset();

        await refreshTable();
        dialog.value = false;
        showNotification(editedIndex.value === -1 ? 'Bordereau ajouté avec succès' : 'Bordereau modifié avec succès', 'success');
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
        await unitStore.fetchUnites();
        store.fetchMenus();
        //On passe les unites dans la fonction
        await store.fetchDischarge();
        // Forcer la réactivité en créant une nouvelle référence
        store.boredereaux = [...store.boredereaux];
    } catch (error) {
        console.error('Erreur lors du rafraîchissement :', error);
        showNotification('Erreur lors du rafraîchissement des données', 'error');
    } finally {
        loading.value = false;
    }
};

const uniteSelected = ref();

const valid = ref(true);
const dialog = ref(false);

const editedIndex = ref(-1);

//Methods

// Ajouter une fonction de nettoyage
function close() {
    dialog.value = false;
    editedIndex.value = -1;
    effective.value = null;
    store.products = [];
    menusData.value = null;
    addedSpends.value = [];
    unitedId.value = null;
    typeFilter.value = 'current';
    range.value.start = null;
    range.value.end = null;

    current_unit.value = null;
    current_category.value = null;
    quantityItem.value = '';

    // Réinitialiser les champs de formulaire
    unite.value.value = null;
    curent_type_of_slip.value.value = null;

    handleReset();
}
function openDialog() {
    dialog.value = true;
}

// Méthode pour modifier un élément
const editItem = async (item: any) => {
    try {
        console.log(item);
        // On récupère les données de l'unité pour remplir le formulaire
        current_unit.value = item.unite?.short_name;
        effective.value = item.effective;
        current_category.value = item.category;
        menusData.value = await repartirBudgetAvecTauxPrecis(item.menus, effective.value);
        // store.products = [...item?.items];
        addedSpends.value = [...item.spends];
        typeFilter.value = item.unit?.type_of_unit;
        // quantityItem.value = '';

        // Mettre à jour les valeurs de l'unité et de la catégorie
        unite.value.value = item.unit?.short_name;
        curent_type_of_slip.value.value = item.category;

        openDialog();
    } catch (error) {
        console.error('Erreur lors de l\'édition :', error);
        showNotification('Erreur lors de l\'édition', 'error');
    }
};
//Computed Property
const storeProducts = computed(() => {
    return editedIndex.value === -1 ? store.products : 'Editer un Bordereau';
});

// PDF related methods
const openPrintPreview = () => {
    printPreviewDialog.value = true;
};

const remove = (item: any) => {
    if (store.products.length > 1) {
        store.products = [...store.products.filter((i: any) => i.ref !== item?.ref)];
    }
};

const deletion = async (index: any) => {
    try {
        await store.deleteItem(index, 'discharges');
        await refreshTable();
    } catch (error) {
        console.error('Erreur lors de la suppression :', error);
    }
};

//Computed Property
const formTitle = computed(() => {
    return editedIndex.value === -1 ? 'Nouveau Bordereaux' : 'Editer un Bordereau';
});

//Computed Property
const formButton = computed(() => {
    return editedIndex.value === -1 ? 'Enregistrer' : 'Modifier';
});

const headers = [
    { text: "Réf", value: "ref", sortable:true},
    { text: 'Région', value: 'area', sortable: true },
    { text: 'Categorie', value: 'category', sortable: true },
    { text: 'Crée le', value: 'created_at', sortable: true },
    { text: 'Effectif', value: 'effective', sortable: true },
    { text: 'Actions', value: 'actions' }
];

// Add this new computed property
const unitesFiltred = computed(() => {
    return  unitStore.unites.filter((unit: any) => unit.type_of_unit === typeFilter.value && !unit.raw.is_created);
});

// editedIndex === -1 ? unite.value.value : current_category.value

// const unitedSelected = computed(() => {
//     return  editedIndex.value === -1 ? unite.value.value : current_category.value
// });

// Add new ref for selected unite details
const selectedUniteDetails = ref(null);
const effective = ref(null);
const unitedId = ref(null);
const menusData = ref();
const otherDepenses = ref();

const onSpendChange = async (value: any) => {
    if (!value) {
        selectedUniteDetails.value = null;
        return;
    }
};

// Update the unitedChanged function to handle selection
const unitedChanged = async (value: any) => {
    if (!value) {
        selectedUniteDetails.value = null;
        return;
    }

    loading.value = true;
    isLoading.value = true;

    // Find the selected unite in the unites array
    const selectedUnite = unitStore.unites.find((unite: { short_name: any }) => unite.short_name === value);
    if (selectedUnite) {
        selectedUniteDetails.value = selectedUnite;
        
        unitedId.value = selectedUnite.raw.id;
        effective.value = selectedUnite.effective;

        // Mettre à jour la valeur de l'unité
        unite.value.value = selectedUnite.short_name;

        // Gestion des opérations dans le store.
        await store.fetchProducts(selectedUnite.effective);

        // Filter uniquement des food
        const menusArrays = store.menus.filter((item: { type_menu: string }) => item.type_menu === 'food');
        
        otherDepenses.value = await store.menus.filter((item: { type_menu: string }) => item.type_menu === 'other');
        // console.log(otherDepenses.value);

        menusData.value = await repartirBudgetAvecTauxPrecis(menusArrays, effective.value);
    }

    isLoading.value = false;
    loading.value = false;
};
const productsHeaders = [
    { text: 'Article', value: 'item', sortable: true },
    { text: 'Taux', value: 'rate_per_days', sortable: true },
    { text: 'Quantité', value: 'item.quantite', sortable: true },
    { text: 'Unités', value: 'unite', sortable: true },
    { text: 'Forfait', value: 'forfait', sortable: true },
    { text: 'Actions', value: 'actions' }
];

const MenuHeaders = [
    { text: 'Designation', value: 'item', sortable: true },
    { text: 'Type', value: 'type_menu', sortable: true },
    { text: 'Montant', value: 'montantAlloue', sortable: true },
    { text: 'Pourcentage', value: 'progress', sortable: true }
    // { text: "Forfait", value: "forfait", sortable: true },
    // { text: "Actions", value: "actions"}
];

const editQuantity = (newQuantity: any) => {
    quantityDialog.value = true;
    myIndex.value = newQuantity;
    if (myIndex.value) {
        myIndex.value = parseInt(quantityItem.value) > 0 ? parseInt(quantityItem.value) : 1;
    }
    myIndex.value = store.products.find((p: { ref: any }) => p.ref === newQuantity.ref);
};

// Update the submitQuantity function
const submitQuantity = () => {
    if (myIndex.value) {
        const newQuantity = parseInt(quantityItem.value) || 0;
        if (newQuantity) {
            store.updateProductQuantity(myIndex.value.ref, newQuantity);
        }
    }
    quantityItem.value = '';
    myIndex.value = null;
    quantityDialog.value = false;
};
// Add new ref for controlling all products
const allProductsEnabled = ref(false);

// Add this new computed property
const emit = defineEmits(['update:modelValue']);

// Functions
const handleToggle = async (product: any) => {
    try {
        const currentProduct = store.products.find((p: { ref: any }) => p.ref === product.ref);
        const newValue = !currentProduct.item.forfait;

        const productIndex = store.products.findIndex((p: { ref: any }) => p.ref === product.ref);
        if (productIndex !== -1) {
            // Calculate base quantity
            const baseQuantity = effective.value ? get_quantity(currentProduct.rate_per_days, effective.value, currentProduct.divider) : 0;

            const updatedProduct = {
                ...store.products[productIndex],
                item: {
                    ...store.products[productIndex].item,
                    forfait: newValue,
                    quantite: newValue ? baseQuantity : baseQuantity
                }
            };

            // Update store
            store.products = [...store.products.slice(0, productIndex), updatedProduct, ...store.products.slice(productIndex + 1)];

            emit('update:modelValue', newValue);
        }
    } catch (error) {
        console.error('Error toggling status:', error);
    }
};
// Computed
const initialAllProductsState = computed(() => {
    return store.products.every((product: { forfait: boolean }) => product.forfait);
});

const toggleAllProducts = (value: boolean) => {
    allProductsEnabled.value = value;
    store.products = store.products.map((product: any) => ({
        ...product,
        forfait: value
    }));
};

// Lifecycle hooks
onMounted(async () => {
    try {
        isLoading.value = true;
        await refreshTable();
        console.log(unitStore.unites);
        allProductsEnabled.value = initialAllProductsState.value;
    } catch (err) {
        error.value = 'Error loading data';
    } finally {
        isLoading.value = false;
    }
});

// Ajoutez ces nouvelles refs pour gérer les dépenses
const selectedSpend = ref(null);
const spendAmount = ref(null);
const addedSpends = ref([]);

// Méthode pour ajouter une dépense au tableau
const addSpend = () => {
    if (selectedSpend.value && spendAmount.value) {
        addedSpends.value.push({
            name: selectedSpend.value,
            amount: parseFloat(spendAmount.value) 
        });

        // Reset both selectedSpend and spendAmount
        selectedSpend.value = null;
        spendAmount.value = null;
    } else {
        showNotification('Veuillez sélectionner une dépense et entrer un montant', 'error');
    }
};

// Add this computed property in the script setup section
const availableSpends = computed(() => {
    return (
        otherDepenses.value?.filter((spend: { name: any }) => !addedSpends.value.some((addedSpend) => addedSpend.name === spend.name)) || []
    );
});

// Méthode pour supprimer une dépense du tableau
const removeSpend = (index: number) => {
    addedSpends.value.splice(index, 1);
};

const date = ref(new Date());
const timezone = ref('');

const range = ref({
    start: new Date(),
    end: new Date()
});

// Le changement de la plage
// watch(range, (newRange) => {
//     const formatDate = (date: string | number | Date) => {
//         if (!date) return null;
//         return new Date(date).toLocaleDateString('fr-FR', {
//             day: '2-digit',
//             month: '2-digit',
//             year: 'numeric'
//         });
//     };

//     console.log("Date range changed:", {
//         start: formatDate(newRange.start),
//         end: formatDate(newRange.end)
//     });
// }, { deep: true });

watchEffect(() => {
  console.log("Range", {
    start: range.value.start ? new Date(range.value.start).toISOString() : date,
    end: range.value.end ? new Date(range.value.end).toISOString() : date,
  });
});


</script>
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
            :items="type_of_unites"
            label="Filtrer par catégorie"
            variant="outlined"
            clearable
            hide-details
            style="min-width: 200px"
        ></v-select>

        <!-- Bouton d'ajout -->
        <v-btn v-if="!itemsSelected.length" color="primary" prepend-icon="mdi-account-multiple-plus" @click="openDialog()" class="ml-auto">
            Ajouter un boredereau
        </v-btn>

        <v-btn v-else="itemsSelected.length" icon variant="text" @click="openPrintPreview()" flat class="ml-auto">
            <PrinterIcon size="20" />
        </v-btn>
    </div>

    <template>
        <v-row class="align-center">
            <!-- Colonne pour le bouton -->
            <v-col cols="12" md="4" class="d-flex justify-end">
                <v-dialog v-model="dialog" persistent fullscreen :scrim="false" transition="dialog-bottom-transition">
                    <v-card>
                        <v-card-title class="pa-4 bg-secondary d-flex align-center justify-space-between">
                            <span class="title text-white">{{ formTitle }}</span>
                            <v-icon @click="close()" class="ml-auto">mdi-close</v-icon>
                        </v-card-title>

                        <v-card-text>
                            <v-form ref="form" v-model="valid" @submit.prevent="submit">
                                <v-row>
                                    <v-col cols="12" sm="8">
                                        <v-col cols="12">
                                            <!-- Filtre par type -->
                                            <v-row>
                                                <v-col cols="12" md="6">
                                                    <UiChildCard title="Type d'unité">
                                                        <v-select
                                                            density="compact"
                                                            v-model="typeFilter"
                                                            :items="type_of_unites"
                                                            label="Selectionnez le type d'unité"
                                                            variant="outlined"
                                                            hide-details
                                                            style="min-width: 200px"
                                                            :disabled="!effective ? false : true"
                                                        ></v-select>
                                                    </UiChildCard>
                                                </v-col>
                                                <v-col cols="12" md="6">
                                                    <UiChildCard title="Categorie">
                                                       <v-select
                                                            label="Sélectionnez une catégorie"
                                                            density="compact"
                                                            v-model="curent_type_of_slip.value.value"
                                                            :error-messages="curent_type_of_slip.errorMessage.value"
                                                            :items="type_of_slip"
                                                            hide-details
                                                            variant="outlined"
                                                            style="min-width: 200px"
                                                            :disabled="!effective ? false : true"
                                                        ></v-select>
                                                    </UiChildCard>
                                                </v-col>
                                            </v-row>

                                            <!-- Bouton d'ajout -->
                                        </v-col>
                                        <v-col cols="12">
                                            <CustomComBox
                                                :items="editedIndex === -1 ? unitesFiltred : unitesFiltred"
                                                label="Séletionnez une unité"
                                                title="short_name"
                                                v-model="unite.value.value"
                                                :error-messages="unite.errorMessage.value"
                                                @update:modelValue="unitedChanged"
                                                :disabled="!curent_type_of_slip.value.value ? true : false"
                                            />
                                        </v-col>

                                        <v-col cols="12">
                                            <v-row>
                                                <v-col cols="12" sm="6">
                                                    Effectif: <span class="text-h5 text-white">{{ effective }}</span> Hommes
                                                </v-col>

                                                <v-col cols="12" sm="6">
                                                    <!-- <v-btn color="primary" variant="outlined" size="large" block flat @click="productsSubmit">
                                                        Ajouter
                                                    </v-btn> -->
                                                </v-col>
                                            </v-row>
                                        </v-col>

                                        <v-col cols="12" sm="12">
                                            <!-- Replace v-table with EasyDataTable -->
                                            <v-row>
                                                <v-col cols="12" sm="12" v-if="effective">
                                                    <EasyDataTable
                                                        :headers="productsHeaders"
                                                        :items="storeProducts"
                                                        :loading="loading"
                                                        :theme-color="themeColor"
                                                        table-class-name="customize-table"
                                                        :search-field="searchField"
                                                        :search-value="searchValue"
                                                        :rows-per-page="7"
                                                        buttons-pagination
                                                        show-index
                                                    >
                                                        <!-- Add before the existing templates -->

                                                        <!-- Update the forfait column template -->
                                                        <template #item-forfait="{ raw }">
                                                            <div class="d-flex align-center justify-center">
                                                                <v-switch
                                                                    color="primary"
                                                                    :model-value="raw.forfait"
                                                                    @change="() => handleToggle(raw)"
                                                                    hide-details
                                                                    dense
                                                                    :disabled="!effective ? true : false"
                                                                ></v-switch>
                                                            </div>
                                                        </template>
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

                                                        <template #unite="{ unite }">
                                                            <div class="d-flex align-center">
                                                                <h4 class="text-h6 font-weight-semibold">{{ unite }}</h4>
                                                            </div>
                                                        </template>

                                                        <template #item-actions="{ raw }">
                                                            <div class="d-flex align-center">
                                                                <v-tooltip text="Modifier la quantité">
                                                                    <template v-slot:activator="{ props }">
                                                                        <v-btn
                                                                            icon
                                                                            flat
                                                                            @click="editQuantity(raw)"
                                                                            v-bind="props"
                                                                            :disabled="!effective ? true : false"
                                                                        >
                                                                            <PencilIcon stroke-width="1.5" size="20" class="text-primary" />
                                                                        </v-btn>
                                                                    </template>
                                                                </v-tooltip>
                                                                <v-tooltip text="Retirer">
                                                                    <template v-slot:activator="{ props }">
                                                                        <v-btn icon flat @click="remove(raw)" v-bind="props">
                                                                            <TrashIcon stroke-width="1.5" size="20" class="text-error" />
                                                                        </v-btn>
                                                                    </template>
                                                                </v-tooltip>
                                                            </div>
                                                        </template>
                                                    </EasyDataTable>
                                                </v-col>

                                                <v-col cols="12" sm="12" class="text-h1" v-else> 
                                                    veuillez selectionner une unité
                                                </v-col>
                                            </v-row>
                                        </v-col>
                                    </v-col>

                                    <v-col cols="12" sm="4">
                                        <v-card class="mt-4" elevation="2">
                                            <v-card-text>
                                                <div class="d-flex justify-space-between align-center">
                                                    <div class="d-flex align-center">
                                                        <v-icon color="primary" class="mr-3">mdi-cash-multiple</v-icon>
                                                        <span class="text-h6 font-weight-bold">Montant Global</span>
                                                    </div>
                                                    <div class="text-right">
                                                        <div class="d-flex align-center justify-end">
                                                            <v-chip color="primary" variant="outlined" class="mr-2">
                                                                <v-icon start>mdi-food</v-icon>
                                                                Menus
                                                            </v-chip>
                                                            <span class="text-h6 font-weight-medium">
                                                                {{ formatGuineanFrancs(menusData?.budgetTotal || 0) }}
                                                            </span>
                                                        </div>
                                                        <div class="d-flex align-center justify-end mt-2">
                                                            <v-chip color="secondary" variant="outlined" class="mr-2">
                                                                <v-icon start>mdi-plus-circle</v-icon>
                                                                Autres Dépenses
                                                            </v-chip>
                                                            <span class="text-h6 font-weight-medium">
                                                                {{
                                                                    formatGuineanFrancs(
                                                                        addedSpends.reduce((total, spend) => total + spend.amount, 0)
                                                                    )
                                                                }}
                                                            </span>
                                                        </div>
                                                        <v-divider class="my-2"></v-divider>
                                                        <div class="d-flex align-center justify-end">
                                                            <v-chip color="success" class="mr-2">
                                                                <v-icon start>mdi-sigma</v-icon>
                                                                Total
                                                            </v-chip>
                                                            <span class="text-h5 font-weight-bold text-success">
                                                                {{
                                                                    formatGuineanFrancs(
                                                                        (menusData?.budgetTotal || 0) +
                                                                            addedSpends.reduce((total, spend) => total + spend.amount, 0)
                                                                    )
                                                                }}
                                                            </span>
                                                        </div>
                                                    </div>
                                                </div>
                                            </v-card-text>
                                        </v-card>

                                        <v-expansion-panels>
                                            <v-expansion-panel elevation="10">
                                                <v-expansion-panel-title class="text-h6" v-if="typeFilter === 'mission' && effective">
                                                    La durée de la mission</v-expansion-panel-title
                                                >
                                                <v-expansion-panel-text >
                                                    <UiChildCard>
                                                        <v-row>
                                                            <v-col cols="12" lg="6" sm="12">
                                                                <v-date-picker
                                                                    v-model="range"
                                                                    is-range
                                                                    transition="picker-transition"
                                                                    class="custom-date-picker"
                                                                />
                                                            </v-col>
                                                        </v-row>
                                                    </UiChildCard>
                                                </v-expansion-panel-text>
                                            </v-expansion-panel>
                                            <v-divider></v-divider>

                                            <v-expansion-panel elevation="10">
                                                <v-expansion-panel-title class="text-h6"> Menus-dépenses</v-expansion-panel-title>
                                                <v-expansion-panel-text v-if="effective">
                                                    <v-card elevation="0" class="mt-6 border">
                                                        <v-table class="month-table">
                                                            <thead>
                                                                <tr>
                                                                    <th class="text-h6">Désignation</th>
                                                                    <th class="text-h6">Type</th>
                                                                    <th class="text-h6">Montant</th>
                                                                    <th class="text-h6">Pourcentage</th>
                                                                </tr>
                                                            </thead>
                                                            <tbody>
                                                                <tr
                                                                    v-for="item in menusData?.repartition"
                                                                    :key="item.name"
                                                                    class="month-item"
                                                                >
                                                                    <td>
                                                                        <div class="d-flex align-center">
                                                                            <v-avatar size="42" rounded="md">
                                                                                <img :src="item.image" alt="avatar" height="42" />
                                                                            </v-avatar>
                                                                            <div class="ml-4">
                                                                                <h6 class="text-subtitle-1 font-weight-bold">
                                                                                    {{ item.name }}
                                                                                </h6>
                                                                                <div class="text-subtitle-1 text-medium-emphasis mt-1">
                                                                                    {{ item.description }}
                                                                                </div>
                                                                            </div>
                                                                        </div>
                                                                    </td>
                                                                    <td>
                                                                        <div class="d-flex align-center">
                                                                            <div class="d-flex">
                                                                                <v-chip rounded="lg" class="mr-2" size="small">
                                                                                    {{ item.type_menu }}
                                                                                </v-chip>
                                                                            </div>
                                                                        </div>
                                                                    </td>
                                                                    <td>
                                                                        <div class="text-subtitle-1 text-small-emphasis">
                                                                            {{ formatGuineanFrancs(item.montantAlloue) }}
                                                                        </div>
                                                                    </td>
                                                                    <td>
                                                                        <div class="d-flex align-center">
                                                                            <v-progress-linear
                                                                                color="primary"
                                                                                rounded="sm"
                                                                                :model-value="item.progress"
                                                                            ></v-progress-linear>
                                                                            <span class="text-subtitle-1 text-medium-emphasis ml-5"
                                                                                >{{ item.progress }}%</span
                                                                            >
                                                                        </div>
                                                                    </td>
                                                                </tr>
                                                                <tr class="font-weight-bold">
                                                                    <td colspan="2">Total Menus</td>
                                                                    <td colspan="2">
                                                                        {{ formatGuineanFrancs(menusData?.budgetTotal) }}
                                                                    </td>
                                                                </tr>
                                                            </tbody>
                                                        </v-table>
                                                    </v-card>
                                                </v-expansion-panel-text>
                                            </v-expansion-panel>
                                            <v-divider></v-divider>
                                        </v-expansion-panels>
                                            
                                        <!-- Tableau pour afficher les dépenses ajoutées -->
                                        <v-row v-if="effective">
                                            <v-col cols="12">
                                                <v-card elevation="2" class="pa-4" >
                                                    <v-card-title class="text-h6">Ajoutez d'autre dépenses</v-card-title>
    
                                                    <!-- Champ de sélection pour les dépenses -->
                                                    <v-col cols="12">
                                                        <CustomComBoxSpend
                                                            :items="availableSpends"
                                                            label="Sélectionnez une dépense"
                                                            title="name"
                                                            v-model="selectedSpend"
                                                            @update:modelValue="onSpendChange"
                                                            :disabled="!effective"
                                                        />
                                                    </v-col>
    
                                                    <!-- Champ pour le montant -->
                                                    <v-col cols="12">
                                                        <v-text-field
                                                            density="compact"
                                                            v-model="spendAmount"
                                                            label="Entrez le montant"
                                                            variant="outlined"
                                                            placeholder="Entrez le montant..."
                                                            type="number"
                                                        ></v-text-field>
                                                    </v-col>
    
                                                    <!-- Bouton pour ajouter la dépense -->
                                                    <v-btn color="primary" variant="outlined" block flat @click="addSpend">
                                                        Ajouter
                                                    </v-btn>
                                                </v-card>

                                            </v-col>

                                            <v-col cols="12">
                                                <!-- Tableau pour afficher les dépenses ajoutées -->
                                                <v-card elevation="2" class="mt-4 pa-4">
                                                    <v-card-title class="text-h6">Dépenses ajoutées</v-card-title>
    
                                                    <v-table>
                                                        <thead>
                                                            <tr>
                                                                <th class="text-h6">Désignation</th>
                                                                <th class="text-h6">Montant</th>
                                                                <th class="text-h6">Actions</th>
                                                            </tr>
                                                        </thead>
                                                        <tbody>
                                                            <tr v-for="(spend, index) in addedSpends" :key="index">
                                                                <td>{{ spend.name }}</td>
                                                                <td>{{ formatGuineanFrancs(spend.amount) }}</td>
                                                                <td>
                                                                    <v-btn icon flat @click="removeSpend(index)">
                                                                        <TrashIcon stroke-width="1.5" size="20" class="text-error" />
                                                                    </v-btn>
                                                                </td>
                                                            </tr>
                                                            <tr class="font-weight-bold">
                                                                <td>Total</td>
                                                                <td colspan="2">
                                                                    {{
                                                                        formatGuineanFrancs(
                                                                            addedSpends.reduce(
                                                                                (total, spend) => total + spend.amount,
                                                                                0
                                                                            )
                                                                        )
                                                                    }}
                                                                </td>
                                                            </tr>
                                                        </tbody>
                                                    </v-table>
                                                </v-card>

                                            </v-col>

                                        </v-row>
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
    </template>

    <!-- Replace v-table with EasyDataTable -->
    <EasyDataTable
        :headers="headers"
        :items="store.boredereaux"
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
        <template #item-category="{ category }">
            <div class="d-flex align-center">
                <div class="ml-5">
                    <h4 class="text-h6 font-weight-semibold">{{ slipCategory(category) }}</h4>
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
                        <v-btn icon flat @click="deletion(raw)" v-bind="props">
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

    <v-dialog v-model="quantityDialog" max-width="300" class="dialog-mw">
        <v-card>
            <v-card-title class="pa-4 bg-secondary d-flex align-center justify-space-between">
                <span class="title text-white">Nouvelle Quantité</span>
            </v-card-title>

            <v-card-text>
                <v-form ref="form" v-model="valid" lazy-validation>
                    <v-row>
                        <v-col cols="12">
                            <v-text-field variant="outlined" placeholder ="Entrez la nouvlle quantité" v-model="quantityItem" label="La quantité" type="number" block></v-text-field>
                        </v-col>
                    </v-row>
                </v-form>
            </v-card-text>

            <v-card-actions class="pa-4">
                <v-btn color="secondary" variant="flat" @click="submitQuantity" block>Modifier</v-btn>
            </v-card-actions>
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
