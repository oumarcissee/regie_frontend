
type Item = {
    id: number;
    name: string;
    price: number;
};

const items: Item[] = [
    { id: 1, name: "Viande rouge", price: 28000 },
    { id: 2, name: "Menus-Depenses", price: 1000 },
    { id: 3, name: "Poisson", price: 10000 },
    { id: 4, name: "Pain", price: 1200 }
];


function repartirBudget(items: Item[], GlobalEffectif: number, GlobalTime: number): any {
    // Calcul du budget total
    const budgetTotal = 7000 * GlobalTime * GlobalEffectif;
    
    // Calcul de la somme des prix pour déterminer les proportions
    const sommePrix = items.reduce((sum, item) => sum + item.price, 0);
    
    // Répartition du budget pour chaque article
    const repartition = items.map(item => {
        // Proportion du budget basée sur le prix relatif de l'article
        const proportion = item.price / sommePrix;
        const montantAlloue = Math.round(budgetTotal * proportion);
        
        return {
            id: item.id,
            name: item.name,
            price: item.price,
            proportion: (proportion * 100).toFixed(2) + '%',
            montantAlloue: montantAlloue
        };
    });
    
    // Vérification que la somme des montants alloués égale le budget total
    const sommeAllouee = repartition.reduce((sum, item) => sum + item.montantAlloue, 0);
    
    return {
        budgetTotal: budgetTotal,
        repartition: repartition,
        sommeAllouee: sommeAllouee
    };
}