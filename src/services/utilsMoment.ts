import { ref } from 'vue';
import BigNumber from 'decimal.js';

import { useAuthStore } from '@/stores/auth';
const { moments  } = useAuthStore();

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




type Item = {
    created_at: any;
    id: number;
    name: string;
    price: number;
    description: string;
    image: string;
    modified_at: string;
    status: boolean
    type_menu: string;
    taux: string;
    proportion: string;
    montantAlloue: number;
};

// const items: Item[] = [
//     { id: 1, name: "Viande rouge", price: 28000, description: "Viande rouge"},
//     { id: 2, name: "Menus-Depenses", price: 1000 , description: "Viande rouge"},
//     { id: 3, name: "Poisson", price: 10000, description: "Viande rouge"},
//     { id: 4, name: "Pain", price: 1200 , description: "Viande rouge"},
// ];


interface ItemRepartition {
    id: number;
    ref: string;
    name: string;
    price: number;
    taux: number;
    proportion: string;
    montantAlloue: number;
    created_at: number; 
    description: string;
    image: string;
    modified_at: string;
    status: boolean
    type_menu: string;
}



/**
 * 
 * @param items 
 * @param GlobalEffectif 
 * @param GlobalTime 
 * @returns 
 */
const repartirBudgetAvecTauxPrecis = async (items: Item[], GlobalEffectif: number, GlobalTime: number= parseInt(currentDays.value)) => {
  try {
    if (!GlobalEffectif || GlobalEffectif <= 0) {
      return;
    }

    
    // Conversion en BigNumber pour haute précision
    const BN = BigNumber;
    const effectif = new BN(GlobalEffectif);
    const time = new BN(GlobalTime);
    const tauxBudget = new BN(7000);
    
    // Calcul du budget total avec précision
    const budgetTotal = tauxBudget.times(time).times(effectif);
    const budgetTotalInt = budgetTotal.round().toNumber();
    
    // Calcul de la somme pondérée avec précision
    let sommePonderee = new BN(0);
      for (const item of items) {
        
        const taux = item.price <= 1200 ? new BN(1) : new BN(0.3);
        sommePonderee = sommePonderee.plus(new BN(item.price).times(taux));
    }
    
    // Répartition initiale avec montants exacts
      const repartitionInitiale  = items.map((item) => {
         
         const taux = item.price <= 1200 ? 1 : 0.3;
         const bnTaux = new BN(taux);
          const bnPrice = new BN(item.price);
        
        
        // Proportion du budget basée sur le prix pondéré par le taux
        const proportion = bnPrice.times(bnTaux).div(sommePonderee);
        const montantExact = budgetTotal.times(proportion);
        const montantArrondi = montantExact.floor().toNumber();
    
        
        return {
            id: item.id,
            name: item.name,
            price: item.price,
            taux: taux,
            proportion: proportion.times(100).toFixed(2) + '%',
            montantExact: montantExact,
            montantArrondi: montantArrondi,
            created_at: item.created_at,
            image: item.image,
            description: item.description,
            modified_at: item.modified_at,
            status: item.status,
            type_menu: item.type_menu,
        };
    });
    
    // Calculer le montant total alloué après arrondi
    let totalAlloueInitial = 0;
    for (const item of repartitionInitiale) {
        totalAlloueInitial += item.montantArrondi;
    }
    
    // Calculer la différence à distribuer
    let difference = budgetTotalInt - totalAlloueInitial;
    
    // Trier les articles par le montant fractionnaire décroissant
    const itemsAvecFraction = repartitionInitiale.map((item, index) => {
        return {
            index: index,
            fraction: item.montantExact.minus(new BN(item.montantArrondi)).toNumber()
        };
    }).sort((a, b) => b.fraction - a.fraction);

    // Créer la répartition finale
      const repartition = repartitionInitiale.map((item, index) => {
         
        const progress = Math.round(((item.montantArrondi * 100) / budgetTotalInt))
          
        return {
            id: item.id,
            name: item.name,
            price: item.price,
            taux: item.taux,
            proportion: item.proportion,
            montantAlloue: item.montantArrondi,
            
            progress: progress,
            image: item.image,
            description: item.description,
            modified_at: item.modified_at,
            created_at: item.created_at,
            type_menu: item.type_menu,
            status: item.status,
        };
    })
    
    // Distribuer la différence
    for (let i = 0; i < difference; i++) {
        const indexAAjuster = itemsAvecFraction[i % itemsAvecFraction.length].index;
        repartition[indexAAjuster].montantAlloue++;
    }
    
    // Vérification finale et correction de toute erreur résiduelle
    const sommeAllouee = repartition.reduce((sum, item) => sum + item.montantAlloue, 0);
    const differenceFinale = budgetTotalInt - sommeAllouee;
    
    // S'il reste une différence minime due à des erreurs d'arrondi
    if (differenceFinale !== 0) {
        if (differenceFinale > 0) {
            // Ajouter le reste au premier élément
            repartition[0].montantAlloue += differenceFinale;
        } else if (differenceFinale < 0) {
            // Soustraire la différence négative du premier élément ayant suffisamment de budget
            for (let i = 0; i < repartition.length; i++) {
                if (repartition[i].montantAlloue >= Math.abs(differenceFinale)) {
                    repartition[i].montantAlloue += differenceFinale; // Ajouter une valeur négative = soustraire
                    break;
                }
            }
        }
    }
    
    // Recalculer la somme finale après correction
      const sommeFinaleBudget = repartition.reduce((sum, item) => sum + item.montantAlloue, 0);
      
      const progressTotal = Math.round(((sommeFinaleBudget * 100) / budgetTotalInt))
    
    return {
        budgetTotal: budgetTotalInt,
        repartition: repartition,
        sommeAllouee: sommeFinaleBudget,
        progressTotal: progressTotal,
        // difference: budgetTotalInt - sommeFinaleBudget // Sera toujours zéro après correction
    };

  } catch (error) {
    console.error('Error in budget distribution:', error);
    throw error; // Re-throw to be caught by the watch handler
  }
};



export {
    fullMoments,
    months,
    currentMoment,
    currentDays,
    loadCurrentMoment,
    getcurrentMoment,
    get_quantity,
    repartirBudgetAvecTauxPrecis,
}

