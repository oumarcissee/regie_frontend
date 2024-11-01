<script setup lang="ts">
import { ref } from 'vue';
import BaseBreadcrumb from '@/components/shared/BaseBreadcrumb.vue';
import UiParentCard from '@/components/shared/UiParentCard.vue';
import { BasicDatatables } from '@/_mockApis/components/datatable/dataTable';
const page = ref({ title: 'Data Table Sorting' });


const breadcrumbs = ref([
    {
        text: 'Dashboard',
        disabled: false,
        href: '#'
    },
    {
        text: 'Data Table Sorting',
        disabled: true,
        href: '#'
    }
]);

interface TableHeader {
    title: string;
    align?: 'start' | 'center' | 'end';
    key: string;
    sortable?: boolean
}

interface TableSortBy { 
    key: string;
    order: string;
}



/*Header Data*/
/*Header Data*/
// Use generic typing for `sortBy` and `groupBy`
const sortBy = ref([{ key: 'name', order: 'asc' as const }])
const groupBy = ref([{ key: 'status', order: 'asc' as const }])


const headers = ref<TableHeader[]>([
    { title: 'Name', align: 'start', key: 'name', sortable: false },
    { title: 'Project Name', align: 'start', key: 'project' },
    { title: 'Post', align: 'start', key: 'post' },
    { title: 'Status', align: 'start', key: 'status' },
    { title: 'Budget', align: 'end', key: 'budget' },
])
</script>
<template>
    <BaseBreadcrumb :title="page.title" :breadcrumbs="breadcrumbs"></BaseBreadcrumb>
    <v-row>
        <v-col cols="12">
            <UiParentCard title="Basic Sorting">
                <v-data-table items-per-page="5" :headers="headers" :items="BasicDatatables" item-value="name"
                    v-model:sort-by="sortBy" class="border rounded-md">
                </v-data-table>
                <v-card class="mt-4 elevation-0 border mt-3 pa-4">
                    <pre>{{ sortBy }}</pre>
                </v-card>
            </UiParentCard>
            <UiParentCard title="Multi Sorting" class="mt-6">
                <v-data-table items-per-page="5" :headers="headers" :items="BasicDatatables"
                    :sort-by="[{ key: 'project', order: 'asc' }, { key: 'post', order: 'desc' }]" multi-sort
                    class="border rounded-md">
                </v-data-table>
            </UiParentCard>
        </v-col>
    </v-row>
</template>

