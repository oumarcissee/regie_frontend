<script setup lang="ts">
import { ref } from 'vue';
import BaseBreadcrumb from '@/components/shared/BaseBreadcrumb.vue';
import UiParentCard from '@/components/shared/UiParentCard.vue';
import { BasicDatatables } from '@/_mockApis/components/datatable/dataTable';
const page = ref({ title: 'Data Table Slots' });
const breadcrumbs = ref([
    {
        text: 'Dashboard',
        disabled: false,
        href: '#'
    },
    {
        text: 'Data Table Slots',
        disabled: true,
        href: '#'
    }
]);

/*Header Data*/
interface TableHeader {
  title: string;
  align?: 'start' | 'center' | 'end';
  key: string;
}

interface TableHeaderExpand extends TableHeader {
    sortable?: boolean;
}

/* Header Data */
const headers = ref<readonly TableHeader[]>([
    { title: 'Name', align: 'start', key: 'name' },
    { title: 'Project Name', align: 'start', key: 'project' },
    { title: 'Post', align: 'start', key: 'post' },
    { title: 'Status', align: 'start', key: 'status' },
    { title: 'Budget', align: 'end', key: 'budget' },
] as const);


</script>
<template>
    <BaseBreadcrumb :title="page.title" :breadcrumbs="breadcrumbs"></BaseBreadcrumb>
    <v-row>
        <v-col cols="12">
            <UiParentCard title="Item Slot">
                <v-data-table :headers="headers" :items="BasicDatatables" item-value="name" class="border rounded-md">
                    <template v-slot:item="{ item }">
                        <tr>
                            <td class="text-subtitle-1">{{ item.columns.name }}</td>
                            <td class="text-subtitle-1">{{ item.columns.project }}</td>
                            <td class="text-subtitle-1">{{ item.columns.post }}</td>
                            <td class="text-subtitle-1">{{ item.columns.status }}</td>
                            <td class="d-flex justify-end align-center text-subtitle-1">{{ item.columns.budget }}</td>
                        </tr>
                    </template>
                </v-data-table>
            </UiParentCard>
        </v-col>
    </v-row>
</template>

