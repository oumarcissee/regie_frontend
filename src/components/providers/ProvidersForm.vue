<script setup lang="ts">
import { router } from '@/router';
import { useField, useForm } from 'vee-validate';
import { ref } from 'vue';
import { Volume2Icon, VolumeIcon } from 'vue-tabler-icons';
import { useProdiverStore } from '@/stores/providerStore';

const { errors, add } = useProdiverStore()




const { handleSubmit, handleReset } = useForm({
    validationSchema: {
        username(value: string | any[]) {
            // if (value?.length >= 4) return true;
            // return "Le nom d'utilisateur doit avoir au moins 4 caractères.";
        if (value?.length <= 4 || !value) {
                return "Le nom d'utilisateur doit être au moins 4 lettres.";
            } else if(errors.usernameError && errors.usernameText === value){

                return errors.usernameError
            }

            return true;
        },

        email(value: string | any[]) {
            if (value?.length <= 2 || !value) {
                return "L'adresse doit être valide.";
            } else if (!(/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(value as any))) {
                return "L'adresse doit être valide.";
            } else if (errors.emailError && errors.emailText === value) {
                return errors.emailError
            }

            return true;
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
            // Vérifier si la valeur est une chaîne de caractères
            // Utiliser une expression régulière pour vérifier si la chaîne contient exactement 9 chiffres
            if (!(/^\d{9}$/.test(value as any))) {
                // La chaîne ne contient que des chiffres et a une longueur de 9 caractères
                return "Le numéro doit être exactement de 9 chiffres.";
            } else if (errors.phone_numberError && errors.phone_numberText === value) {
                return errors.phone_numberError
            }

            return true;
        },


        address(value: string | any[]) {
            if (value?.length >= 3) return true;
            return true
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

const pError = ref();


const submit = handleSubmit(async (data: any, { setErrors }: any) => {

    const formData = {
        email: data.email,
        username: data.username,
        first_name: data.first_name,
        last_name: data.last_name,
        phone_number: data.phone_number,
        address: data.address,
        password: data.first_name+data.phone_number,
    }

    try {
        pError.value = null
        errors.usernameError = null
        errors.emailError = null

        return await add(formData);
        // UserError.value = null
    } catch (error: any) {
        // UserError.value = error
      
        // alert(error?.usernameError + "   "+ error?.emailError)
        pError.value = error
        submit()
        return;
    }

});


</script>
<template>
    <v-form @submit.prevent="submit" v-slot="{ errors, isSubmitting }">
        <v-row>
        
            <v-col cols="12" sm="4">
                <v-label class="mb-2 font-weight-medium">Nom d'utilisateur</v-label>
                <v-text-field variant="outlined" placeholder="Nom d'utilisateur" color="primary"
                 :error-messages="username.errorMessage.value" v-model="username.value.value"></v-text-field>
                <v-label class="mb-2 font-weight-medium">Prénoms</v-label>
                <v-text-field variant="outlined" placeholder="Prénom"  color="primary" 
                :error-messages="first_name.errorMessage.value" v-model="first_name.value.value"></v-text-field>
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

            <v-btn size="large" :loading="isSubmitting" color="primary"  block type="submit" flat>Ajouter</v-btn>  
            <!-- <div v-if="errors.apiError " class="mt-2"> 
                <v-alert color="error">{{ errors.apiError }} </v-alert>
            </div>

            <div v-else-if="pError" class="mt-2">
                <v-alert color="error">{{ pError }} </v-alert>
            </div> -->
        </v-row>
    </v-form>
</template>
