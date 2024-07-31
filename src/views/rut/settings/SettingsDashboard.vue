<script setup lang="ts">
/*Call Components*/
import Topcards from "../../dashboard/dashboardComponents/modern/TopCards.vue";
import RevenueUpdates from "../../dashboard/dashboardComponents/modern/RevenueUpdates.vue";
import YearlyBreakup from "../../dashboard/dashboardComponents/modern/YearlyBreakup.vue";
import MonthlyEarnings from "../../dashboard/dashboardComponents/modern/MonthlyEarnings.vue";
import EmployeeSalary from "../../dashboard/dashboardComponents/modern/EmployeeSalary.vue";
import Customers from "../../dashboard/dashboardComponents/modern/Customers.vue";
import Projects from "../../dashboard/dashboardComponents/modern/Projects.vue";
import UserCard from "../../dashboard/dashboardComponents/modern/UserCard.vue";
import BestSellingProducts from "../../dashboard/dashboardComponents/modern/BestSellingProducts.vue";
import WeeklyStats from "../../dashboard/dashboardComponents/modern/WeeklyStats.vue";
import TopProjects from "../../dashboard/dashboardComponents/modern/TopProjects.vue";

</script>
<template>
    <v-row>
        <!-- Top cards -->
        <v-col cols="12">
            <Topcards/>
        </v-col> 
         <v-col cols="12">
           <v-row>
              
               
                <!-- Top Projects -->
                <v-col cols="12" lg="8" md="8">
                    <TopProjects/>
                </v-col>
           </v-row>
        </v-col>    
    </v-row>
</template>