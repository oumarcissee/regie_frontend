<script setup lang="ts">
import { ref } from 'vue';
import { changed } from '@/services/utils';


const { items, label, title } = defineProps({
  items: Array,
  itemSelected: Array,
  isUpdating: Boolean,
  label: String,
  title: String,

})




</script>
<template>
  <v-autocomplete
      @update:modelValue="changed" 
      :disabled="isUpdating"
      :items="items"
      :item-title="title"
      :label="label"
      item-value="id"
      color="blue-grey-lighten-2"
      variant="outlined"
      density="compact"
      chips
    >
      <template v-slot:chip="{ props, item }">
        <v-chip
          v-bind="props"
          :prepend-avatar="item.raw.image"
          :text="item.raw.first_name + ' ' + item.raw.last_name "
        ></v-chip>
      </template>

      <template v-slot:item="{ props, item }">
        <v-list-item
          v-bind="props"
          :prepend-avatar="item.raw.image"
          :subtitle="item.raw.first_name"
          :title="item.raw.last_name"
        ></v-list-item>
      </template>
  </v-autocomplete>
</template>
