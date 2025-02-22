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




interface Article {
  name: string;
  price: number;
  type: string;
}

interface ParametresCalcul {
  id: number;
  name: string;
  price: number;
  effectif: number;
  dureeGlobal: number;
  articles: Article[];
}

type Item = {
    id: number;
    name: string;
    price: number;
};

function calculateTotal(item: any, GlobalEffectif: number, GlobalTime:number = parseInt(currentDays.value)): number {
    let total = 0;

    let taux = item.price <= 1200 ? 1 : 0.3;
    let duree = (item.price * GlobalEffectif) / GlobalTime;

    let montant = item.price * taux * GlobalEffectif * duree;
    total += montant;
    

    return montant;
}

// Définition des items
const items: Item[] = [
    { id: 1, name: "Viande rouge", price: 28000 },
    { id: 2, name: "Menus-Depenses", price: 1000 },
    { id: 3, name: "Poisson", price: 10000 },
    { id: 4, name: "Pain", price: 1200 }
];

// Paramètres globaux
const GlobalEffectif = 500;
const GlobalTime = 196000 / 28; // 7000

// Calcul du total
const totalAmount = calculateTotal(items, GlobalEffectif, GlobalTime);
console.log(totalAmount); // Devrait afficher 98 000 000



export {
    fullMoments,
    months,
    currentMoment,
    currentDays,
    loadCurrentMoment,
    getcurrentMoment,
  get_quantity,
    calculateTotal
}

