<script setup lang="ts">
import { router } from '@/router';
import { useField, useForm } from 'vee-validate';
import { ref } from 'vue';
import { Volume2Icon, VolumeIcon } from 'vue-tabler-icons';



const { handleSubmit, handleReset } = useForm({
    validationSchema: {
        username(value: string | any[]) {
            if (value?.length >= 4) return true;
            return "Le nom d'utilisateur doit avoir au moins 4 caractères.";
        },

        email(value: string | any[]) {
            if (value?.length >= 2) return true;false
            return "L'adresse doit être valide.";
        },

        first_name(value: string | any[]) {
            if (value?.length >= 2) return true;
            return "Le prénom doit avoir au moins 2 caractères.";
        },

        last_name(value: string | any[]) {
            if (value?.length >= 2) return true;
            return "Le nom doit avoir au moins 2 caractères.";
        },

        phone_number(value: string | any[]) {
            if (value?.length >= 9) return true;
            return "Le numéro doit être 9 chiffres.";
        },

        address(value: string | any[]) {
            if (value?.length >= 3) return true;
            return "L'adresse doit avoir au moins 3 caractères.";
        },
        
       
    },
});

const select = ref('One');
const items = ref(['One', 'Two', 'Three', 'Four']);
const radios = ref('Male');
const checked = ref(true);
const range = ref([20, 40]);
const sel1 = ref('750');
const sel2 = ref('950');    
const select1 = ref(['750', '850', '950']);
const select2 = ref(['950', '1050', '1150']);
const volume = ref(40);
const model = ref(true);


const email = useField("email");
const username = useField("username");
const first_name = useField("first_name");
const last_name = useField("last_name");
const phone_number = useField("phone_number");
const address = useField("address");


const submit = handleSubmit(async (data: any , {setErrors}: any) => {

     try {
        // UserError.value = null
        // return await login(data.username, data.password);
    } catch (error) {
        // UserError.value = error
        return setErrors({ apiError: error });
    }

});


</script>
<template>
    <v-form @submit.prevent="submit" v-slot="{ errors, isSubmitting }">
        <v-row>
        
            <v-col cols="12" sm="4">
                <v-label class="mb-2 font-weight-medium">Nom d'utilisateur</v-label>
                <v-text-field variant="outlined" placeholder="Nom d'utilisateur" color="primary" :error-messages="username.errorMessage.value" v-model="username.value.value"></v-text-field>
                <v-label class="mb-2 font-weight-medium">Prénoms</v-label>
                <v-text-field variant="outlined" placeholder="Prénom"  color="primary" :error-messages="first_name.errorMessage.value" v-model="first_name.value.value"></v-text-field>
            </v-col>
            <v-col cols="12" sm="4">
                <v-label class="mb-2 font-weight-medium">Email</v-label>
                <v-text-field variant="outlined" placeholder="E-mail" color="primary" :error-messages="email.errorMessage.value" v-model="email.value.value"></v-text-field>
                <v-label class="mb-2 font-weight-medium">Nom</v-label>
                <v-text-field variant="outlined" placeholder="Nom" color="primary" :error-messages="last_name.errorMessage.value" v-model="last_name.value.value"></v-text-field>
            </v-col>

            <v-col cols="12" sm="4">
                <v-label class="mb-2 font-weight-medium">Adresse</v-label>
                <v-text-field variant="outlined" placeholder="Sonfonia" color="primary" :error-messages="address.errorMessage.value" v-model="address.value.value"></v-text-field>
                <v-label class="mb-2 font-weight-medium">Téléphone</v-label>
                <v-text-field variant="outlined" placeholder="6xxxxxxx" color="primary" :error-messages="phone_number.errorMessage.value" v-model="phone_number.value.value"></v-text-field>
            </v-col>

            <!-- <v-col cols="12">
                <v-label class="mb-2 font-weight-medium">Lorem ipsum dolor sit amet</v-label>
                <v-radio-group inline v-model="radios">
                    <v-row>
                        <v-col cols="12" md="4"><v-radio label="Male" color="primary"  value="Male"></v-radio></v-col>
                        <v-col cols="12" md="4"><v-radio label="Female" color="primary" value="Female"></v-radio></v-col>
                        <v-col cols="12" md="4"><v-radio label="Disabled" color="primary" value="Disabled" disabled></v-radio></v-col>
                    </v-row>
                </v-radio-group>
                <v-label class="mb-2 font-weight-medium">Industry Type</v-label>
                <v-row>
                    <v-col cols="12" md="4">
                        <v-checkbox v-model="checked" color="primary" label="Enter text"></v-checkbox>
                    </v-col>
                    <v-col cols="12" md="4">
                        <v-checkbox label="Enter text" color="primary"></v-checkbox>
                    </v-col>
                    <v-col cols="12" md="4">
                        <v-checkbox label="Disabled" disabled></v-checkbox>
                    </v-col>
                </v-row> 
                <v-row>
                    <v-col cols="12" md="4">
                        <v-label class="mb-2 font-weight-medium">Slider</v-label>
                        <v-range-slider v-model="range" strict color="primary"></v-range-slider>
                        <v-row>
                            <v-col cols="12" md="6">
                                <v-select
                                    :items="select1"
                                    item-title="select1"
                                    item-value="abbr"
                                    return-object
                                    single-line
                                    variant="outlined"
                                    v-model="sel1"
                                ></v-select>
                            </v-col> 
                            <v-col cols="12" md="6">
                                <v-select
                                    :items="select2"
                                    item-title="select2"
                                    item-value="abbr"
                                    return-object
                                    single-line
                                    variant="outlined"
                                    v-model="sel2"
                                ></v-select>
                            </v-col>
                        </v-row>
                        <v-label class="mb-2 font-weight-medium">Volume</v-label>
                        <v-slider v-model="volume"  color="primary">
                            <template v-slot:prepend>
                                <v-btn size="small" variant="text" color="primary">
                                    <Volume2Icon stroke-width="1.5" size="20" />
                                </v-btn>
                            </template>
                            <template v-slot:append>
                                <v-btn size="small" variant="text" color="primary">
                                    <VolumeIcon stroke-width="1.5" size="20" />
                                </v-btn>
                            </template>
                        </v-slider>
                    </v-col>
                </v-row> 
                <v-label class="mb-2 font-weight-medium mt-4">Switch</v-label>
                <v-row>
                    <v-col cols="12" md="3" sm="6">
                        <v-switch v-model="model" size="small" hide-details color="primary" label="Enter text" inset></v-switch>
                    </v-col>
                    <v-col cols="12" md="3" sm="6">
                        <v-switch hide-details color="primary" label="Enter text" inset></v-switch>
                    </v-col>
                    <v-col cols="12" md="3" sm="6">
                        <v-switch  hide-details label="Disabled" disabled inset></v-switch>
                    </v-col>
                    <v-col cols="12" md="3" sm="6">
                        <v-switch hide-details label="Disabled" v-model="model" color="primary" disabled inset></v-switch>
                    </v-col>
                </v-row>
                <v-row class="mt-6 ">
                    <v-col cols="12" md="6">
                        <v-btn color="primary" class="mr-3" flat>add new</v-btn>
                        <v-btn color="primary"  class="mr-3" disabled>add new</v-btn>
                        <v-btn color="primary" variant="outlined"  class="mr-3" >add new</v-btn>
                    </v-col> 
                    <v-col cols="12" md="6" class="d-flex justify-end">
                        <v-btn color="info" class="mr-3" flat>add new</v-btn>
                        <v-btn color="success" flat>add new</v-btn>
                    </v-col>  
                </v-row>      
            </v-col> -->
            <v-btn size="large" :loading="isSubmitting" color="primary"  block type="submit" flat>Ajouter</v-btn>  
              <div v-if="errors.apiError " class="mt-2"> 
                <v-alert color="error">{{ errors.apiError }} </v-alert>
            </div>
        </v-row>
    </v-form>
</template>
