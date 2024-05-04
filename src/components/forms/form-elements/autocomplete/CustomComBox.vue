<script setup lang="ts">
import { ref } from 'vue';


const   friends = ref(['Sandra Adams'])
const   isUpdating = ref(false);

const srcs = {
  1: 'https://cdn.vuetifyjs.com/images/lists/1.jpg',
  2: 'https://cdn.vuetifyjs.com/images/lists/2.jpg',
  3: 'https://cdn.vuetifyjs.com/images/lists/3.jpg',
  4: 'https://cdn.vuetifyjs.com/images/lists/4.jpg',
  5: 'https://cdn.vuetifyjs.com/images/lists/5.jpg',
}

const  people  = [
    // { header: 'Group 1' },
    { name: 'Sandra Adams', group: 'Group 1', avatar: srcs[1] },
    { name: 'Ali Connors', group: 'Group 1', avatar: srcs[2] },
    { name: 'Trevor Hansen', group: 'Group 1', avatar: srcs[3] },
    { name: 'Tucker Smith', group: 'Group 1', avatar: srcs[2] },
    // { divider: true },
    // { header: 'Group 2' },
    { name: 'Britta Holt', group: 'Group 2', avatar: srcs[4] },
    { name: 'Jane Smith ', group: 'Group 2', avatar: srcs[5] },
    { name: 'John Smith', group: 'Group 2', avatar: srcs[1] },
    { name: 'Sandra Williams', group: 'Group 2', avatar: srcs[3] },
]


</script>
<template>
  <v-autocomplete
      v-model="friends"
      :disabled="isUpdating"
      :items="people"
      color="blue-grey-lighten-2"
      item-title="name"
      item-value="name"
      label="Selectionner un fournisseur (Client)"
      chips
    >
      <template v-slot:chip="{ props, item }">
        <v-chip
          v-bind="props"
          :prepend-avatar="item.raw.avatar"
          :text="item.raw.name"
        ></v-chip>
      </template>

      <template v-slot:item="{ props, item }">
        <v-list-item
          v-bind="props"
          :prepend-avatar="item.raw.avatar"
          :subtitle="item.raw.group"
          :title="item.raw.name"
        ></v-list-item>
      </template>
  </v-autocomplete>
</template>
