<script setup lang="ts">
import { ref, computed, onMounted, provide } from 'vue';
import { truncateText, currentMonth, get_full_unite, formatDate, showNotification } from '@/services/utils';
import { orderFormPdf } from '@/utils/helpers/pdfForms/orderFormPdf';
import { useField, useForm } from 'vee-validate';
import type { Header, Item } from 'vue3-easy-data-table';
import 'vue3-easy-data-table/dist/style.css';
import { useOrderStore } from '@/stores/rutStore/orders/orderStore';
import { useProviderStore } from '@/stores/rutStore/providerStore';
import { useProductsList } from '@/stores/rutStore/products/productsListStore';
// import { PrinterIcon, FilterIcon, PencilIcon, TrashIcon } from 'lucide-vue-next';
import CustomComBox from '@/components/forms/form-elements/autocomplete/CustomComBox.vue';
import CustomComBoxProduct from '@/components/forms/form-elements/autocomplete/CustomComBoxProduct.vue';
import type { AxiosError } from 'axios';
import { useSettingStore } from '@/stores/rutStore/settings/settingStore';

const { fetchSignators, getSignators } = useSettingStore();

// Store initialization
const useProduct = useProductsList();
const userStore = useProviderStore();
const store = useOrderStore();

// Reactive references
const loadingProvider = ref(false);
const loadingProducts = ref(false);
const valid = ref(true);
const status = ref(false);
const increment = ref(0);
const productSelected = ref<Array<{ id: number; item: any; quantity: number; order?: any }>>([]);
const isSelected = ref(false);
const dialog = ref(false);
const quantityDialog = ref(false);
const editedIndex = ref(-1);
const myIndex = ref(null);
const quantityItem = ref('');
const searchField = ref(['ref', 'last_name', 'created_at']);
const searchValue = ref('');
const themeColor = ref('rgb(var(--v-theme-secondary))');
const itemsSelected = ref<Item[]>([]);
const printPreviewDialog = ref(false);
const printableArea = ref();
const heading = ref('');
const isSubmittingPdf = ref(false);
const refProduct = ref();
const isLoading = ref(false);

// Form validation
const { handleSubmit, handleReset, isSubmitting } = useForm({
    validationSchema: {
        provider(value: string | any[]) {
            if (value) return true;
            return 'Selectionnez un fournisseur.';
        },
        products(value: string | any[]) {
            if (!value) return 'Selectionnez un article.';
            return true;
        },
        quantity(value: string | any[]) {
            if (!/^\d+$/.test(value as string)) {
                return 'Entrer la quantité en chiffre entier.';
            }
            return true;
        }
    }
});

const provider = useField('provider');
const products = useField('products');
const quantity = useField('quantity');

// Computed properties
const providersFiltred = computed(() => {
    const orders = store.orders.filter(
        (item: any) => formatDate(item.created_at, 'chaine').includes(currentMonth.value)
    );
    const providersIds = orders.map((item: any) => item.provider.id);
    return userStore.getProviders.filter((item: any) => !providersIds.includes(item.id));
});

const getOrders = computed(() => {
    return store.orders.filter(
        (item: any) =>  formatDate(item.created_at, 'chaine').includes(currentMonth.value)
    );
});

const formTitle = computed(() => {
    return editedIndex.value === -1 ? 'Nouvelle Commande' : 'Editer une commande';
});

const formButton = computed(() => {
    return editedIndex.value === -1 ? 'Enregistrer' : 'Modifier';
});

// Table headers
const headers: Header[] = [
    { text: '', value: 'image', sortable: true },
    { text: 'Destinateur', value: 'last_name', sortable: true },
    { text: 'Contact', value: 'contact', sortable: true },
    { text: 'Faite le', value: 'created_at', sortable: true },
    { text: 'Modifiée le', value: 'modified_at', sortable: true },
    { text: 'Statut', value: 'status', sortable: true },
    { text: 'Actions', value: 'operation' }
];

// Methods
const getStatus = (value: boolean) => {
    status.value = value;
    return value;
};

const productsSubmit = handleSubmit(async (data: any, { setErrors }: any) => {
    increment.value++;
    
    try {
        const product = useProduct.items.find((item: { id?: any }) => item?.id === data.products);
        
        if (productSelected.value.length > 11) {
            setErrors({ products: 'Le maximum de produits sélectionnés est atteint.' });
            return;
        }

        productSelected.value = [...productSelected.value, {
            id: increment.value,
            item: product,
            quantity: parseInt(data.quantity)
        }];

        isSelected.value = productSelected.value.length > 0;
        useProduct.items = useProduct.items.filter((item: { id: string }) => item.id !== data.products);
        products.resetField();
        
    } catch (error) {
        console.error("Erreur lors de l'ajout du produit:", error);
    }
});

const submit = async () => {
    try {
        isLoading.value = true;

        if (productSelected.value.length === 0) {
            return productsSubmit();
        }


        const order = {
            provider: provider.value.value,
            status: status.value
        };

        const data = {
            order,
            orderLine: productSelected.value
        };

        if (editedIndex.value !== -1) {
            const ordersLine = store.ordersLine.filter(
                (item: { order?: any }) => item?.order?.id === editedIndex.value
            );
            const itemIds = ordersLine.map((item: any) => item.item.id);
            useProduct.items = useProduct.items.filter((item: any) => !itemIds.includes(item.id));
            
            await store.addOrUpdateOrder(data, editedIndex.value);
            showNotification('Commande ajoutée avec succès');
        } else {
            await store.addOrUpdateOrder(data);
            showNotification('Commande modifiée avec succès');
        }

        await refreshTable();
    } catch (error) {
         if (error instanceof Error) {
            const axiosError = error as AxiosError<{[key: string]: string[]}>;
            if (axiosError.response?.data) {
                const errorMessages = Object.values(axiosError.response.data)
                    .flat()
                    .join(', ');
                showNotification(errorMessages, 'error');
            } else {
                showNotification(error.message, 'error');
            }
        } else {
            showNotification('Une erreur est survenue', 'error');
        }
    } finally {
        isLoading.value = false;
        close();
        await refreshTable();
        
    }
};

const refreshTable = async () => {
    await store.fetchOrders();
    await store.fetchOrdersLine();
    close();
};

const close = () => {
    store.dialog = false;
    editedIndex.value = -1;
    productSelected.value = [];
    isSelected.value = false;
    handleReset();
};

const editItem = async (item: { user: number; id: number; status: boolean }) => {
    try {
        provider.setValue(item.user);
        editedIndex.value = item.id;
        store.dialog = true;
        isSelected.value = true;
        status.value = item.status;

        const arrayProducts = store.ordersLine
            .filter((line: any) => line?.order?.id === item.id)
            .map((line: any) => ({
                id: line.id,
                item: line.item,
                quantity: line.quantity,
                order: line.order
            }));

        productSelected.value = arrayProducts;

        const itemIds = arrayProducts.map((line: any) => line.item?.id).filter(Boolean);
        useProduct.items = useProduct.items.filter((product: any) => !itemIds.includes(product.id));
    } catch (error) {
        console.error('Error editing item:', error);
    }
};

const editQuantity = (newQuantity: any) => {
    quantityDialog.value = true;
    myIndex.value = newQuantity;
    quantityItem.value = String(newQuantity.quantity);
};

const submitQuantity = () => {
    if (myIndex.value) {
        myIndex.value.quantity = parseInt(quantityItem.value) > 0 ? parseInt(quantityItem.value) : 1;
    }
    quantityItem.value = '';
    quantityDialog.value = false;
};

const remove = (item: any) => {
    if (productSelected.value.length > 1) {
        productSelected.value = productSelected.value.filter((i: any) => i.id !== item?.id);
    }
    useProduct.items.push(item.item);
};

const deletion = async (index: any) => {
    try {
        await store.deleteItem(index, 'orders');
        await refreshTable();
    } catch (error) {
        console.error('Erreur lors de la suppression :', error);
    }
};

// PDF related methods
const openPrintPreview = () => {
    printPreviewDialog.value = true;
};

const closePrintPreviewDialog = () => {
    itemsSelected.value = [];
    printPreviewDialog.value = false;
};

const Preview = (item: any) => {
    itemsSelected.value = [item];
    openPrintPreview();
};

const printContent = () => {
    const printDiv = document.getElementById('printableArea');
    if (!printDiv) return;
    
    const newWin = window.open('');
    if (!newWin) return;
    
    newWin.document.write('<html><head><title>Print</title></head><body>');
    newWin.document.write(printDiv.outerHTML);
    newWin.document.write('</body></html>');
    newWin.document.close();
    newWin.print();
    newWin.close();
};

const doPdf = async () => {
    isSubmittingPdf.value = true;
    try {
        const signators = await fetchSignators();
        // console.log(signators);

        await orderFormPdf(heading.value, itemsSelected.value, signators);
    } catch (error) {
        console.error('Error generating PDF:', error);
    } finally {
        isSubmittingPdf.value = false;
        closePrintPreviewDialog();
    }
};

// Initialization
onMounted(async () => {
    try {
        if (!store.getOrders.length) { 
            isLoading.value = true;
    
            await Promise.all([
                userStore.fetchProviders(),
                store.fetchOrders(),
                useProduct.fetchItems()
            ]);
    
            loadingProvider.value = true;
            loadingProducts.value = true;
            isLoading.value = false;

        }

    } catch (error) {
        console.error('Error initializing component:', error);
    }
});
</script>


<template>
    <v-row class="mb-4">
        <v-col cols="12" lg="4" md="6">
            <v-text-field
                type="text"
                variant="outlined"
                placeholder="Rechercher une commande"
                v-model="searchValue"
                density="compact"
                hide-details
                prepend-inner-icon="mdi-magnify"
                class="ml-auto"
            />
        </v-col>
        <v-col cols="12" lg="8" md="6" class="text-right">
            <v-dialog v-model="store.dialog" max-width="800" persistent class="dialog-mw">
                <template v-slot:activator="{ props }">
                    <v-col v-if="itemsSelected.length">
                        <div class="d-flex gap-2 justify-end">
                            <!-- <v-btn icon variant="text" >
                                    <CopyIcon size="20" />
                                </v-btn> -->
                            <v-btn icon variant="text" @click="openPrintPreview()" flat class="ml-auto">
                                <PrinterIcon size="20" />
                            </v-btn>
                            <v-btn icon variant="text" @click="printContent">
                                <FilterIcon size="20" />
                            </v-btn>
                        </div>
                    </v-col>

                    <v-col v-else>
                        <v-btn color="primary" v-bind="props" flat class="ml-auto">
                            <v-icon class="mr-2">mdi-account-multiple-plus</v-icon>Passer une commande
                        </v-btn>
                    </v-col>
                </template>

                <!-- Formulaire de commande -->
                <v-card>
                    <v-card-title class="pa-4 bg-secondary d-flex align-center justify-space-between">
                        <span class="title text-white">{{ formTitle }}</span>
                        <v-icon @click="close()" class="ml-auto">mdi-close</v-icon>
                    </v-card-title>

                    <v-card-text>
                        <v-form ref="form" v-model="valid" lazy-validation>
                            <v-row>
                                <v-col cols="12">
                                    <CustomComBox
                                        :items="editedIndex === -1 ? providersFiltred : userStore.getProviders"
                                        label="Selectionner un fournisseur (Client)"
                                        title="last_name"
                                        v-model="provider.value.value"
                                        :error-messages="provider.errorMessage.value"
                                        :isDisabled="isSelected"
                                    />
                                </v-col>

                                <v-col cols="12" sm="6">
                                    <CustomComBoxProduct
                                        ref="refProduct"
                                        :items="useProduct.getProducts"
                                        label="Selectionner un article"
                                        title="name"
                                        v-model="products.value.value"
                                        :error-messages="products.errorMessage.value"
                                    />
                                </v-col>
                                <v-col cols="12" sm="6">
                                    <v-row>
                                        <v-col cols="12" sm="6">
                                            <v-text-field
                                                variant="outlined"
                                                v-model="quantity.value.value"
                                                :error-messages="quantity.errorMessage.value"
                                                label="La quantité"
                                            ></v-text-field>
                                        </v-col>

                                        <v-col cols="12" sm="6">
                                            <!-- Méthode pour modifier un élément -->
                                            <v-btn color="primary" variant="outlined" size="large" block flat @click="productsSubmit">
                                                Ajouter
                                            </v-btn>
                                        </v-col>
                                    </v-row>
                                </v-col>
                                <v-col cols="12">
                                    <v-switch
                                        color="primary"
                                        @update:model-value="getStatus(status)"
                                        v-model="status"
                                        label="Statut"
                                    ></v-switch>
                                </v-col>

                                <v-col cols="12" sm="12">
                                    <v-table class="mt-5" id="myTable">
                                        <thead>
                                            <tr>
                                                <th class="text-subtitle-1 font-weight-semibold">N°</th>
                                                <!-- <th class="text-subtitle-1 font-weight-semibold">Réference</th> -->
                                                <th class="text-subtitle-1 font-weight-semibold">Article</th>
                                                <th class="text-subtitle-1 font-weight-semibold">Quantité</th>
                                                <th class="text-subtitle-1 font-weight-semibold">Unité</th>

                                                <th class="text-subtitle-1 font-weight-semibold">Actions</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            <tr v-if="!productSelected">
                                                <td colspan="4" class="text-subtitle-1 text-center">Aucun article</td>
                                            </tr>
                                            <tr v-else v-for="(item, index) in productSelected" :key="index">
                                                <td class="text-subtitle-1">{{ index + 1 }}</td>
                                                <!-- <td class="text-subtitle-1">{{ item.product.ref }}</td> -->

                                                <td class="text-subtitle-1">
                                                    <div class="d-flex align-center py-4">
                                                        <div class="hoverable">
                                                            <v-img
                                                                :lazy-src="item.item?.image"
                                                                :src="item.item?.image"
                                                                :title="item.item?.name"
                                                                width="65px"
                                                                class="rounded img-fluid"
                                                            ></v-img>
                                                        </div>

                                                        <div class="ml-5">
                                                            <h4 class="text-h6 font-weight-semibold">{{ item.item.name }}</h4>
                                                            <span class="text-subtitle-1 d-block mt-1 textSecondary">{{
                                                                truncateText(item.item?.description, 20)
                                                            }}</span>
                                                        </div>
                                                    </div>
                                                </td>

                                                <td class="text-subtitle-1">{{ item.quantity }}</td>
                                                <td class="text-subtitle-1">{{ get_full_unite(item?.item?.unite) }}</td>

                                                <td>
                                                    <div class="d-flex align-center">
                                                        <v-tooltip text="Editer">
                                                            <template v-slot:activator>
                                                                <v-btn icon flat @click="editQuantity(item)"
                                                                    ><PencilIcon stroke-width="1.5" size="20" class="text-primary"
                                                                /></v-btn>
                                                            </template>
                                                        </v-tooltip>
                                                        <v-tooltip text="Retirer">
                                                            <template v-slot:activator>
                                                                <v-btn icon flat @click="remove(item)"
                                                                    ><TrashIcon stroke-width="1.5" size="20" class="text-error"
                                                                /></v-btn>
                                                            </template>
                                                        </v-tooltip>
                                                    </div>
                                                </td>
                                            </tr>
                                        </tbody>
                                    </v-table>
                                </v-col>
                            </v-row>
                        </v-form>
                    </v-card-text>

                    <v-card-actions class="pa-4">
                        <v-btn color="secondary" variant="flat" @click="submit" block :loading="isSubmitting">{{ formButton }}</v-btn>
                    </v-card-actions>
                </v-card>
                <!-- END Formulaire de commande -->
            </v-dialog>

            <v-dialog v-model="quantityDialog" max-width="300" persistent class="dialog-mw">
                <v-card>
                    <v-card-title class="pa-4 bg-secondary d-flex align-center justify-space-between">
                        <span class="title text-white">Nouvelle Quantité</span>
                    </v-card-title>

                    <v-card-text>
                        <v-form ref="form" v-model="valid" lazy-validation>
                            <v-row>
                                <v-col cols="12">
                                    <v-text-field
                                        variant="outlined"
                                        v-model="quantityItem"
                                        label="La quantité"
                                        type="number"
                                        block
                                    ></v-text-field>
                                </v-col>
                            </v-row>
                        </v-form>
                    </v-card-text>

                    <v-card-actions class="pa-4">
                        <v-btn color="secondary" variant="flat" @click="submitQuantity" block>Modifier</v-btn>
                    </v-card-actions>
                </v-card>
            </v-dialog>
        </v-col>
    </v-row>
    <!-- Liste des commandes par mois -->
    <EasyDataTable
        :headers="headers"
        :items="getOrders"
        table-class-name="customize-table"
        :theme-color="themeColor"
        :search-field="searchField"
        :search-value="searchValue"
        :rows-per-page="8"
        v-model:items-selected="itemsSelected"
        show-index
        buttons-pagination
        itemKey="ref"
    >
        <template #item-image="{ image }">
            <div class="player-wrapper">
                <img alt="user" width="70" class="rounded-circle img-fluid" :src="image" />
            </div>
        </template>

        <template #item-last_name="{ first_name, last_name }">
            <div class="player-wrapper">
                <h5 class="text-h5">{{ last_name }}</h5>
                <span class="text-subtitle-1 d-block mt-1 textSecondary">{{ first_name }}</span>
            </div>
        </template>

        <template #item-contact="{ contact, email }">
            <div class="player-wrapper">
                <h5 class="text-h5">{{ contact }}</h5>
                <span class="text-subtitle-1 d-block mt-1 textSecondary">{{ email }}</span>
            </div>
        </template>

        <template #item-created_at="{ created_at }">
            <div class="player-wrapper">
                <h5 class="text-h5">{{ formatDate(created_at) }}</h5>
            </div>
        </template>

        <template #item-modified_at="{ modified_at }">
            <div class="player-wrapper">
                <h5 class="text-h5">{{ formatDate(modified_at) }}</h5>
            </div>
        </template>

        <template #item-status="{ status }">
            <div class="player-wrapper">
                <v-chip color="success" v-if="status" size="small"> En cours </v-chip>
                <v-chip color="error" v-else size="small"> Cloturée</v-chip>
            </div>
        </template>

        <template #item-operation="item">
            <div class="operation-wrapper">
                <div class="d-flex align-center">
                    <v-tooltip text="Editer">
                        <template v-slot:activator="{ props }">
                            <v-btn icon flat @click="editItem({ user: parseInt(item?.provider?.id), id: parseInt(item.id) ,status: item.status})" v-bind="props"
                                ><PencilIcon stroke-width="1.5" size="20" class="text-primary"
                            /></v-btn>
                        </template>
                    </v-tooltip>

                    <v-tooltip text="Voir">
                        <template v-slot:activator="{ props }">
                            <v-btn icon flat @click="Preview(item)" v-bind="props"
                                ><PrinterIcon stroke-width="1.5" size="20" class="text-primary"
                            /></v-btn>
                        </template>
                    </v-tooltip>
                    <v-tooltip text="Supprimer">
                        <template v-slot:activator="{ props }">
                            <v-btn icon flat @click="deletion(item)" v-bind="props"
                                ><TrashIcon stroke-width="1.5" size="20" class="text-error"
                            /></v-btn>
                        </template>
                    </v-tooltip>
                </div>
            </div>
        </template>
    </EasyDataTable>

    <!-- Print Preview Dialog -->
    <v-dialog v-model="printPreviewDialog" max-width="800px" persistent>
        <v-card>
            <v-card-title class="h2">Aperçu de l'impression</v-card-title>
            <v-card-text>
                <div id="printableArea" ref="printableArea">
                    <div v-for="item in itemsSelected" :key="item.id">
                        <v-row>
                            <v-col>
                                <h3>Detail de la commande N° {{ item.id }}</h3>
                                <p>Référence: {{ item.ref }}</p>
                                <p>Destinateur: {{ item.first_name }} {{ item.last_name }}</p>
                                <p>Contact: {{ item.contact }}</p>
                                <p>Faite le: {{ formatDate(item.created_at, 'chaine') }}</p>
                                <p>Modifiée le: {{ formatDate(item.modified_at, 'chaine') }}</p>
                                <p>Statut: {{ item.status ? 'En cours' : 'Cloturée' }}</p>
                            </v-col>
                        </v-row>

                        <v-row>
                            <v-col>
                                <v-table class="mt-5" id="myTabledd">
                                    <thead>
                                        <tr>
                                            <th class="text-subtitle-1 font-weight-semibold">N°</th>
                                            <!-- <th class="text-subtitle-1 font-weight-semibold">Réference</th> -->
                                            <th class="text-subtitle-1 font-weight-semibold">Article</th>
                                            <th class="text-subtitle-1 font-weight-semibold">Quantité</th>
                                            <th class="text-subtitle-1 font-weight-semibold">Unité</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        <tr v-for="(order, index) in item.orders" :key="index">
                                            <td class="text-subtitle-1">{{ index + 1 }}</td>
                                            <!-- <td class="text-subtitle-1">{{ item.product.ref }}</td> -->

                                            <td class="text-subtitle-1">
                                                <div class="d-flex align-center py-4">
                                                    <div class="hoverable">
                                                        <v-img
                                                            :lazy-src="order?.item?.image"
                                                            :src="order?.item?.image"
                                                            :title="order.item.name"
                                                            width="65px"
                                                            class="rounded img-fluid"
                                                        ></v-img>
                                                    </div>

                                                    <div class="ml-5">
                                                        <h4 class="text-h6 font-weight-semibold">{{ order.item.name }}</h4>
                                                        <span class="text-subtitle-1 d-block mt-1 textSecondary">{{
                                                            truncateText(order.item.description, 20)
                                                        }}</span>
                                                    </div>
                                                </div>
                                            </td>

                                            <td class="text-subtitle-1">{{ order.quantity }}</td>
                                            <td class="text-subtitle-1">{{ get_full_unite(order.item?.unite) }}</td>
                                        </tr>
                                    </tbody>
                                </v-table>
                            </v-col>
                        </v-row>

                        <br />

                        <hr />

                        <br />
                    </div>
                </div>
            </v-card-text>
            <v-card-actions>
                <!-- <v-btn color="primary" @click="doPdf">Print</v-btn> -->
                <v-btn color="secondary" variant="flat" @click="doPdf" block :loading="isSubmittingPdf">Impression</v-btn>
                <!-- <v-btn @click="closePrintPreviewDialog">Close</v-btn> -->
            </v-card-actions>
        </v-card>
    </v-dialog>


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
</template>

<style></style>
