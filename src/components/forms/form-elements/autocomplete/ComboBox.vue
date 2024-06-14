<script setup lang="ts">
import { ref } from 'vue';
// combo data
const value = ref("March 2023");
const items = ref(['March 2023', 'April 2023', 'May 2023']);
</script>
<template>
    <v-autocomplete v-model="value" :items="items" color="primary" variant="inlined" hide-details>
    
    </v-autocomplete>
</template>