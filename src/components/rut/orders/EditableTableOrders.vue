<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, watch } from 'vue';
import { truncateText, currentUser, currentProduct, currentMonth, get_full_unite } from '@/services/utils';

import { useField, useForm } from 'vee-validate';

import type { Header, Item } from 'vue3-easy-data-table';
import 'vue3-easy-data-table/dist/style.css';

import { useOrderStore } from '@/stores/rutStore/orders/orderStore';
import { useProviderStore } from '@/stores/rutStore/providerStore';
import { useProductsList } from '@/stores/rutStore/products/productsListStore';

const useProduct = useProductsList();
const userStore = useProviderStore();
const store = useOrderStore();

import CustomComBox from '@/components/forms/form-elements/autocomplete/CustomComBox.vue';
import CustomComBoxProduct from '@/components/forms/form-elements/autocomplete/CustomComBoxProduct.vue';

import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';

import html2canvas from 'html2canvas';

const { addOrUpdateOrder, errors } = useOrderStore();

onMounted(async () => {
    await store.fetchOrdersLine();
    await store.fetchOrders();
    //Les lignes de commande

    // loadingProvider.value = false;
    //Chargement des fournisseurs
    await userStore.fetchProviders();
    loadingProvider.value = true;

    // loadingProducts.value = false;
    await useProduct.fetchItems();

    loadingProducts.value = true;
    // console.log(providers.value)
});

const getStatus = (value: any) => {
    status.value = value;
    return value;
};

const { handleSubmit, handleReset, isSubmitting } = useForm({
    validationSchema: {
        provider(value: string | any[]) {
            if (value) return true;
            return 'Selectionnez un fournisseur.';
        },
        products(value: string | any[]) {
            if (!value) {
                return 'Selectionnez un article.';
            }
            return true;
        },
        quantity(value: string | any[]) {
            if (!/^\d+$/.test(value as any)) {
                // La chaîne ne contient que des chiffres et a une longueur de 9 caractères
                return 'Entrer la quantité en chiffre entier.';
            }
            return true;
        }
    }
});

let increment = 0;
const productsSubmit = handleSubmit(async (data: any, { setErrors }: any) => {
    increment++;
    try {
        const product = useProduct.items.find((item: { id?: any }) => item?.id === data.products);
        // const user = userStore.providers.find((item: { id?: any }) => item?.id === data.provider);

        //Ajout d'un nouveau produit
        productSelected.value.push({ id: increment, item: product, quantity: parseInt(data.quantity) });

        //Desactivation du champ user
        if (productSelected.value.length >= 0) isSelected.value = true;
        //Mettre à jour le tableau
        updateTableData();
        // console.log(productSelected.value)
        useProduct.items = useProduct.items.filter((item: { id: string }) => item.id !== data.products);
        products.resetField();
    } catch (error) {
        console.log(error);
    }
});

//La fonction pour mettre à jour les données de myTable
const updateTableData = () => {
    productSelected.value = productSelected.value;
};

//Affichage des commandes en fonction du mois

const providersFiltred: any = computed(() => {
    const orders = store.orders.filter(
        (item: any) => item.created_at.includes(currentMonth.value) || item.modified_at.includes(currentMonth.value)
    );
    const providersIds = orders.map((item: any) => item.provider.id);

    //Ignore les fournissseur ayant une commande
    return userStore.getProviders.filter((item: any) => !providersIds.includes(item.id));
});

//Affichage des commandes en fonction de mois
const getOrders: any = computed(() => {
    return store.orders.filter(
        (item: any) => item.created_at.includes(currentMonth.value) || item.modified_at.includes(currentMonth.value)
    );
});

const getOrdersLine: any = computed(() => {
    return store.ordersLine;
});

const formData = new FormData();

const selected = ref<string | null | undefined | number>(null);

const refProduct = ref();

const provider = useField('provider');
const products = useField('products');
const quantity = useField('quantity');

const status = ref(false);

const quantityItem = ref('');

const submit = async () => {
    try {
        if (productSelected.value.length === 0) {
            //Si rien n'est selectioné
            return productsSubmit();
        } else {
            const order = {
                provider: provider.value.value,
                status: status.value
            };

            const data = {
                order: order,
                orderLine: productSelected.value
            };

            if (editedIndex.value != -1) {
                //Recuperation des articles liées à la commande
                const ordersLine = store.ordersLine.filter((item: { order?: any }) => item?.order?.id === editedIndex.value);

                //filtrer les articles non selectonés
                const itemIds = ordersLine.map((item: any) => item.item.id);
                useProduct.items.filter((item: any) => !itemIds.includes(item.id));

                //Modification de commande
                await addOrUpdateOrder(data, data.orderLine[0].order.id);
            } else {
                //Ajout d'une nouvelle de la commande
                await addOrUpdateOrder(data);
            }

            await refreshTable();
        }
    } catch (error) {
        console.log(error);
    }
};

// Fonction pour réinitialiser les champs
const refreshTable = async () => {
    await store.fetchOrders();
    //Les lignes des commandes
    store.fetchOrdersLine();
    close();
};

// const providers = ref([]);
let productSelected: Object | any = ref([]);

const isSelected = ref(false);
const loadingProvider = ref(false);
const loadingProducts = ref(false);

const valid = ref(true);
const dialog = ref(false);
const QuantityDialog = ref(false);

const editedIndex = ref(-1);

function close() {
    dialog.value = false;
    editedIndex.value = -1;
    productSelected.value = [];
    isSelected.value = false;
    handleReset();
}

// Méthode pour modifier un élément
const editItem = async (index: any) => {
    provider.value.value = index.provider?.id || null;

    dialog.value = true;
    editedIndex.value = index.id;
    isSelected.value = true;

    //Selection de fournisseur.
    status.value = index.status;

    //Recuperation des articles liées à la commande
    const ordersLine = store.ordersLine.filter((item: { order?: any }) => item?.order?.id === index.id);
    productSelected.value = ordersLine;

    //filtrer les articles non selectonés
    const itemIds = ordersLine.map((item: any) => item.item.id);
    useProduct.items = useProduct.items.filter((item: any) => !itemIds.includes(item.id));

    updateTableData();
};

// Suppression d'un element
const deletion = async (index: any) => {
    try {
        await store.deleteItem(index, 'orders');

        await refreshTable(); // Rafraîchir les données après la suppression
    } catch (error) {
        console.error('Erreur lors de la suppression :', error);
    }
};

// Méthode pour modifier un élément
const myIndex = ref();
const editQuantity = (index: any) => {
    QuantityDialog.value = true;

    myIndex.value = index;

    quantityItem.value = index.quantity;
};

//le changement de quantité
const submitQuantity = () => {
    myIndex.value.quantity = parseInt(quantityItem.value) > 0 ? quantityItem.value : 1;
    updateTableData();

    quantityItem.value = '';
    QuantityDialog.value = false;
};

// Suppression d'un element
const remove = async (item: any) => {
    // console.log(item)
    //Si le conteneur des articles n'est pas vide
    if (productSelected.value.length > 1) {
        //Suppression de l'élement supprimé
        productSelected.value = productSelected.value.filter((i: any) => i.id !== item?.id);
    }

    // console.log(productSelected.value);//

    //Mettre à jour le tableau
    useProduct.items.push(item.item); // Add the removed item back to the product list
    updateTableData();
};

//Computed Property
const formTitle = computed(() => {
    return editedIndex.value === -1 ? 'Nouvelle Commande' : 'Editer une commande';
});

//Computed Property
const formButton = computed(() => {
    return editedIndex.value === -1 ? 'Enregistrer' : 'Modifier';
});

const searchField = ref(['ref', 'last_name', 'created_at']);
const searchValue = ref('');

const headers: Header[] = [
    // { text: 'Référence', value: 'ref' },
    { text: '', value: 'image', sortable: true },
    { text: 'Destinateur', value: 'last_name', sortable: true },
    { text: 'Contact', value: 'contact', sortable: true },
    { text: 'Faite le', value: 'created_at', sortable: true },
    { text: 'Modifiée le', value: 'modified_at', sortable: true },
    { text: 'Statut', value: 'status', sortable: true },
    { text: 'Actions', value: 'operation' }
];

const themeColor = ref('rgb(var(--v-theme-secondary))');

const itemsSelected = ref<Item[]>([]);

// Print Preview and Print Functionality
const printPreviewDialog = ref(false);

const openPrintPreview = () => {
    printPreviewDialog.value = true;
};

const closePrintPreviewDialog = () => {

    itemsSelected.value = [];

    printPreviewDialog.value = false
}

const Preview = (item: any) => {

    itemsSelected.value.push(item);
    openPrintPreview();
 
}


const printableArea = ref();

const printContent = () => {
    const printDiv = document.getElementById('printableArea');
    const newWin = window.open('');
    newWin!.document.write('<html><head><title>Print</title></head><body>');
    newWin!.document.write(printDiv!.outerHTML);
    newWin!.document.write('</body></html>');
    newWin!.document.close();
    newWin!.print();
    newWin!.close();
};

const heading = ref('TEST_heading');

const genererPDF = () => {
    const doc = new jsPDF({
        unit: 'in',
        format: 'a4'
    });

    const totalPages = itemsSelected.value.length;

    const header = () => {
    const pageWidth = doc.internal.pageSize.width;

    doc.setFontSize(10);
    doc.text("République de Guinée", pageWidth - 0.5, 0.5, { align: 'right' }); // Texte aligné à droite

    doc.setFontSize(10);
    doc.setTextColor(255, 0, 0); // Rouge
    doc.text("Travail", pageWidth - 1.5, 0.75, { align: 'right' }); // Texte aligné à droite
    
    const travailWidth = doc.getTextWidth("Travail-");
    doc.setTextColor(255, 255, 0); // Jaune
    doc.text("Justice", pageWidth - 1.4 + travailWidth, 0.75, { align: 'right' }); // Texte aligné à droite
    
    const justiceWidth = doc.getTextWidth("Justice- ");
    doc.setTextColor(0, 255, 0); // Vert
    doc.text("Solidarité", pageWidth - 1.3 + travailWidth + justiceWidth, 0.75, { align: 'right' }); // Texte aligné à droite

    doc.setTextColor(0, 0, 0); // Noir
    doc.text("Ministère de la Défense Nationale", 0.5, 0.5); // Texte aligné à gauche
    
    doc.setFontSize(10);
    doc.text("Direction Générale de l'Intendance Militaire", 0.5, 0.75); // Texte aligné à gauche

    doc.setFontSize(10);
    doc.text("Régie des Unités Territoriales", 0.5, 1);

    doc.setFontSize(10);
    doc.text("No______/Régie UT/2024", 0.5, 1.25);

    // doc.setFontSize(16);
    // doc.text("Bon de Commande", pageWidth / 2, 1, { align: 'center' });
    };



    const footer = (pageNumber: number) => {
        doc.setFontSize(10);
        doc.text(`Page ${pageNumber} of ${totalPages}`, doc.internal.pageSize.width / 2, doc.internal.pageSize.height - 0.5, {
            align: 'center'
        });
    };

    itemsSelected.value.forEach((item, index) => {
        if (index > 0) {
            doc.addPage();
        }
        
        header();
        footer(index + 1);

        let yCoord = 2.75; // Initial y coordinate after header
        doc.setFontSize(12);
        doc.text(`Reference: ${item.ref}`, 1, yCoord);
        yCoord += 0.5; // Adjust the increment to fit your layout

        doc.text(`Nom du destinateur: ${item.last_name}`, 1, yCoord);
        yCoord += 0.5;

        doc.text(`Contact: ${item.contact}`, 1, yCoord);
        yCoord += 0.5;

        doc.text(`Crée le: ${item.created_at}`, 1, yCoord);
        yCoord += 0.5;

        doc.text(`Modifiée le: ${item.modified_at}`, 1, yCoord);
        yCoord += 0.5;

        const body = item.orders.map((value: { item: { name: any; unite: any; }; quantity: any; }, i: number) => {
            return [
                i + 1,
                {
                    content: '',
                    styles: {
                        cellWidth: 1,
                        cellHeight: 0.5
                    }
                },
                value.item.name,
                value.quantity,
                get_full_unite(value.item.unite),
            ];
        });

        autoTable(doc, {
            startY: yCoord, // Start the table below the text
            head: [['N°', 'Image', 'Article', 'Quantité', 'Unité', 'Obs']],
            body: body,
            styles: {
                fontSize: 16 // Increase the font size as needed
            },
            didDrawCell: function(data) {
                if (data.column.index === 1 && data.cell.section === 'body') {
                    const value = item.orders[data.row.index];
                    const imgData = value.item.image;

                    if (imgData) {
                        const padding = 0.1;
                        const cellHeight = data.cell.height - padding * 2;
                        const cellWidth = data.cell.width - padding * 2;
                        let imgWidth = cellWidth;
                        let imgHeight = cellHeight;

                        // Calculate x and y to center the image in the cell
                        const xOffset = (data.cell.width - imgWidth) / 2;
                        const yOffset = (data.cell.height - imgHeight) / 2;

                        doc.addImage(imgData, 'PNG', data.cell.x + xOffset, data.cell.y + yOffset, imgWidth, imgHeight);
                    }
                }
            }
        });
    });

    const blob = doc.output('blob');
    const url = URL.createObjectURL(blob);
    window.open(url);

    doc.save(`${heading.value}.pdf`);
};






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
            <v-dialog v-model="dialog" max-width="800" persistent class="dialog-mw">
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
                                    <v-switch color="primary" @update:modelValue="getStatus" v-model="status" label="Statut"></v-switch>
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
                                                                :lazy-src="item?.item?.image"
                                                                :src="item?.item?.image"
                                                                :title="item.item.name"
                                                                width="65px"
                                                                class="rounded img-fluid"
                                                            ></v-img>
                                                        </div>

                                                        <div class="ml-5">
                                                            <h4 class="text-h6 font-weight-semibold">{{ item.item.name }}</h4>
                                                            <span class="text-subtitle-1 d-block mt-1 textSecondary">{{
                                                                truncateText(item.item.description, 20)
                                                            }}</span>
                                                        </div>
                                                    </div>
                                                </td>

                                                <td class="text-subtitle-1">{{ item.quantity }}</td>
                                                <td class="text-subtitle-1">{{ get_full_unite(item.item.unite) }}</td>

                                                <td>
                                                    <div class="d-flex align-center">
                                                        <v-tooltip text="Editer">
                                                            <template v-slot:activator="{ props }">
                                                                <v-btn icon flat @click="editQuantity(item)" v-bind="props"
                                                                    ><PencilIcon stroke-width="1.5" size="20" class="text-primary"
                                                                /></v-btn>
                                                            </template>
                                                        </v-tooltip>
                                                        <v-tooltip text="Retirer">
                                                            <template v-slot:activator="{ props }">
                                                                <v-btn icon flat @click="remove(item)" v-bind="props"
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

            <v-dialog v-model="QuantityDialog" max-width="300" persistent class="dialog-mw">
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
                <h5 class="text-h5">{{ created_at }}</h5>
            </div>
        </template>

        <template #item-modified_at="{ modified_at }">
            <div class="player-wrapper">
                <h5 class="text-h5">{{ modified_at }}</h5>
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
                            <v-btn icon flat @click="editItem(item)" v-bind="props"
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
                        <v-row >
                            <v-col>

                                <h3>Detail de la commande N° {{ item.id }}</h3>
                                <p>Référence: {{ item.ref }}</p>
                                <p>Destinateur: {{ item.first_name }} {{ item.last_name }}</p>
                                <p>Contact: {{ item.contact }}</p>
                                <p>Faite le: {{ item.created_at }}</p>
                                <p>Modifiée le: {{ item.modified_at }}</p>
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
                                                <td class="text-subtitle-1">{{ get_full_unite(order.item.unite) }}</td>

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
                <v-btn color="primary" @click="genererPDF">Print</v-btn>
                <v-btn @click="closePrintPreviewDialog">Close</v-btn>
            </v-card-actions>
        </v-card>
    </v-dialog>
</template>

<style></style>
