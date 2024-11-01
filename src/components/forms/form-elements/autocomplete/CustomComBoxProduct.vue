<script setup lang="ts">
import { ref } from 'vue';
import { getCurrentProduct , truncateText} from '@/services/utils';


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
      @update:modelValue="getCurrentProduct" 
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
          :prepend-avatar="(item as any).raw.image"
          :text="(item as any).raw.name + ' ' + (item as any).raw.description "
        ></v-chip>
      </template>
      
      //@ts-ignore
      <template v-slot:item="{ props, item }">
        <v-list-item
          v-bind="props"
          :prepend-avatar="(item as any).raw.image"
          :subtitle="truncateText((item as any).raw.name, 10)"
          :title="(item as any).raw.name "
        ></v-list-item>
      </template>
  </v-autocomplete>
</template>
