<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useSettingStore } from '@/stores/rutStore/settings/settingStore';
import { truncateText } from '@/services/utils';
import fr from 'date-fns/locale/fr';
import { format } from 'date-fns';

const locale = fr; // or en, or es

import type { VueCropperMethods } from 'vue-cropperjs';
import VueCropper from 'vue-cropperjs';

import { useField, useForm } from 'vee-validate';

import type { Items } from '@/types/rut/ProductsType';

import contact from '@/_mockApis/apps/contact';

const { addOrUpdateProduct, errors } = useSettingStore();
const store = useSettingStore();

const { handleSubmit, handleReset, isSubmitting } = useForm({
    validationSchema: {
        first_name(value: string | any[]) {
            if (value?.length <= 4 || !value) {
                return 'Le prenom doit avoir au moins 4 lettres.';
            } else if (errors.nameError && errors.nameText === value) {
                return errors.nameError;
            }
            return true;
        },

        last_name(value: string | any[]) {
            if (value?.length <= 4 || !value) {
                return 'Le nom doit avoir au moins 4 lettres.';
            } else if (errors.nameError && errors.nameText === value) {
                return errors.nameError;
            }
            return true;
        },

        position(value: string | any[]) {
            if (value) return true;
            return 'Choisissez la position.';
        },

        function_name(value: string | any[]) {
            if (value?.length <= 4 || !value) {
                return 'La fonction doit avoir au moins 4 lettres.';
            }
            return true;
        },

        title(value: string | any[]) {
            if (value?.length <= 4 || !value) {
                return 'Le titre doit avoir au moins 4 lettres.';
            }
            return true;
        },

       
    }
});

onMounted(async () => {
    await refreshTable();
});

const getItems: any = computed(() => {
    return store.items;
});

let form: Items = Object();

const formData = new FormData();

const imageSrc = ref('');

const selected = ref<string | null | undefined | number>(null);
let cropper = ref<VueCropperMethods | null>(null);

function setImage(e: Event) {
    dialogImg.value = true;
    const target = e.target as HTMLInputElement;
    const file = (target.files as FileList)[0];

    if (!file || file.type.indexOf('image/') === -1) {
        dialogImg.value = false;
        return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
        if (event.target && event.target.result) {
            imageSrc.value = event.target.result.toString();
            if (cropper.value) {
                cropper.value.replace(imageSrc.value);
            }
        }
    };

    reader.readAsDataURL(file);
}

const dialogImg = ref(false) as any;

const first_name    = useField('first_name');
const last_name     = useField('last_name');
const title         = useField('title');
const function_name = useField('function_name');
const position      = useField('position');

// const divider     = useField('divider');
// const description = useField('description');

// const rate_per_days = useField('rate_per_days');
// const image = useField('image');
// const price = useField('price');

const count = ref(0);

const submit = handleSubmit(async (data: any, { setErrors }: any) => {
    try {
        formData.append('first_name', data.first_name);
        formData.append('last_name', data.last_name);
        formData.append('title', data.title);
        formData.append('function_name', data.function_name);
        formData.append('position', data.position);

        if (editedIndex.value !== -1) {
            console.log(selected.value, 'selected');
            //Si un élément est selectioné
            await addOrUpdateProduct(formData, editedIndex.value);
            await refreshTable();
        } else {
            // if (!formData.get('image')) formData.set('image', data.image[0]);
            await addOrUpdateProduct(formData);
            await refreshTable();
        }
    } catch (error) {
        console.log(error);
        count.value++;
        if (count.value >= 5) {
            // Arrêter l'exécution du script ou effectuer une action appropriée
            console.log(error);
            return;
        }

        submit();
        return setErrors({ apiError: error });
    }
});

// Fonction pour réinitialiser les champs
const refreshTable = async () => {
    await store.fetchSignators();
    close();
};

const positionSelected = ref();

const changed = (value: string | any) => {
    positionSelected.value = value;
    return value;
};

const positions = ref([
    { title: 'Rien', value: 'default' },
    { title: 'A gauche', value: 'left' },
    { title: 'A droite', value: 'right' },
    { title: 'Au milieu', value: 'center'}
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

    first_name.value.value = index.first_name;
    last_name.value.value = index.last_name.name;
    function_name.value.value = index.function_name;
    position.value.value = index.position;
    title.value.value = index.title;

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
</script>
<template>
    <v-row>
        <v-col cols="12" lg="4" md="6">
            <v-text-field density="compact" v-model="search" label="Rechercher par nom ou rôle" variant="outlined"></v-text-field>
        </v-col>
        <v-col cols="12" lg="8" md="6" class="text-right">
            <v-dialog v-model="dialog" max-width="800">
                <template v-slot:activator="{ props }">
                    <v-btn color="primary" v-bind="props" flat class="ml-auto">
                        <v-icon class="mr-2">mdi-account-multiple-plus</v-icon>Ajouter un signateur
                    </v-btn>
                </template>
                <v-card>
                    <v-card-title class="pa-4 bg-secondary d-flex align-center justify-space-between">
                        <span class="title text-white">{{ formTitle }}</span>
                        <v-icon @click="close()" class="ml-auto">mdi-close</v-icon>
                    </v-card-title>

                    <v-card-text>
                        <v-form ref="form" v-model="valid" lazy-validation>
                            <v-row>
                                <v-col cols="12" sm="6">
                                    <v-text-field
                                        variant="outlined"
                                        v-model="first_name.value.value"
                                        :error-messages="first_name.errorMessage.value"
                                        label="Prénoms"
                                    >
                                    </v-text-field>
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
                                        @update:modelValue="changed"
                                        single-line
                                        variant="outlined"
                                        v-model="position.value.value"
                                        :error-messages="position.errorMessage.value"
                                    >
                                    </v-select>
                                </v-col>
                            </v-row>
                        </v-form>
                    </v-card-text>

                    <v-card-actions class="pa-4">
                        <v-btn color="secondary" variant="flat" @click="submit" block :loading="isSubmitting">{{ formButton }}</v-btn>
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
                        <!-- <div class="hoverable">
                            <v-img :lazy-src="item.image" :src="item.image" width="65px" class="rounded img-fluid"></v-img>
                        </div> -->

                        <div class="ml-5">
                            <h4 class="text-h6 font-weight-semibold">{{ item.first_name }}</h4>
                            <!-- <span class="text-subtitle-1 d-block mt-1 textSecondary">{{ truncateText(item.last_name, 20) }}</span> -->
                        </div>
                    </div>
                </td>
                <td class="text-subtitle-1">{{ item.last_name }}</td>
                <!-- {{ format(new Date(date), 'E, MMM d') }} -->
                <td class="text-subtitle-1">{{ item.title }}</td>
                <td class="text-subtitle-1">{{ item.divider }}</td>
                <!-- <td>
                    <v-chip :color="item.rolestatus" size="small" label>{{ item.role }}</v-chip>
                </td>  -->
                <td>
                    <div class="d-flex align-center">
                        <v-tooltip text="Edit">
                            <template v-slot:activator="{ props }">
                                <v-btn icon flat @click="editItem(item)" v-bind="props"
                                    ><PencilIcon stroke-width="1.5" size="20" class="text-primary"
                                /></v-btn>
                            </template>
                        </v-tooltip>
                        <v-tooltip text="Delete">
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
</template>
