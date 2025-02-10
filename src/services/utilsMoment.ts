import { ref } from 'vue';

import { useOrderStore } from '@/stores/rutStore/orders/orderStore';

const { moments } = useOrderStore()

// Store full moment data including days
const fullMoments = ref<Array<{ months: string, days: number }>>([]);
// Store only month names for display
const months = ref<string[]>([]);
// Current selected month
const currentMoment = ref<string>('');
const currentDays = ref<string>('');

const getcurrentMoment = async (selectedMonth: string) => {
    try {
        // Update the current moment
        currentMoment.value = selectedMonth;       
        // Find the full data for the selected month
        currentDays.value = fullMoments.value.find((moment: { months: string; }) => moment.months === currentMoment.value)?.days.toString();

        // console.log(currentDays.value);

    } catch (error) {
        console.error('Error setting current month:', error);
        // Handle error appropriately
    }
};

const loadCurrentMoment = async () => {
    try {
        // Load full data
        const data = await moments.map((item: any) => item);
        fullMoments.value = data;
        // Extract only month names for display
        months.value = data.map((moment: any) => moment.months);
        
        // Set initial current month if not already set
        if (!currentMoment.value && months.value.length > 0) {
            currentMoment.value = months.value[0];
            currentDays.value = data.find((moment: { months: string; }) => moment.months === currentMoment.value)?.days.toString();
            // console.log(currentDays.value, "Le nombre du jour");
            await getcurrentMoment(months.value[0]);
        }
    } catch (error) {
        console.error('Error loading moments:', error);
        // Handle error appropriately
    }
};


/**
 * 
 * @param taux 
 * @param eff 
 * @param div 
 * @returns 
 */
const get_quantity = ( taux: any, eff: any, div: any): number => {
  const month = 30;
  const total: any = parseFloat(JSON.parse(taux)) * parseInt(currentDays.value) * parseInt(JSON.parse(eff)) / parseInt(div);
 
  return Math.round(total);
}



export {
    fullMoments,
    months,
    currentMoment,
    currentDays,
    loadCurrentMoment,
    getcurrentMoment,
    get_quantity
}

