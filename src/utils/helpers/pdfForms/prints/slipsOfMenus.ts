import jsPDF from 'jspdf';
import 'jspdf-autotable';
import autoTable, { type UserOptions, type Color, type CellDef } from 'jspdf-autotable';
import { truncateText } from '@/services/utils';
import headerPortrait from '../includes/headerPortrait';
import footerPortrait from '../includes/footerPortrait';
import signature from '../includes/signature';

// Types
interface OrderItem {
    item: {
        name: string;
        unite: string;
        image: string;
        price: number;
    };
    quantity: number;
}

interface OrderData {
    ref: string;
    last_name: string;
    contact: string;
    created_at: string;
    modified_at: string;
    address: string;
    orders: OrderItem[];
}

// Extension de jsPDF pour inclure la propriété lastAutoTable
declare module 'jspdf' {
    interface jsPDF {
        lastAutoTable?: {
            finalY: number;
        };
    }
}

type FontStyle = 'normal' | 'bold' | 'italic' | 'bolditalic';

const STYLES = {
    colors: {
        primary: [0, 48, 135],
        secondary: [0, 102, 204],
        accent: [240, 240, 250],
        white: [255, 255, 255],
        black: [0, 0, 0]
    } as const,
    fonts: {
        header: { size: 16, style: 'bold' as FontStyle },
        subHeader: { size: 12, style: 'bold' as FontStyle },
        normal: { size: 11, style: 'normal' as FontStyle },
        section: { size: 14, style: 'bold' as FontStyle }
    },
    spacing: {
        margin: 0.3,
        lineHeight: 0.3,
        sectionGap: 0.5
    },
    table: {
        width: 7.67,
        columnWidths: {
            no: 0.06, // 5%
            image: 0.12, // 12%
            article: 0.17, // 17%
            quantity: 0.12, // 12%
            unite: 0.13, // 13%
            unitPrice: 0.18, // 18%
            totalPrice: 0.22 // 20% (augmenté pour accommoder les grands nombres)
        }
    }
};
let itemsTotal: any;

const ICONS = {
    REF: '•',
    CLIENT: '•',
    CONTACT: '•',
    ADDRESS: '•',
    PACKAGE: '•',
    EXPENSE: '•'
} as const;

const toColor = (color: readonly [number, number, number]): Color => color as Color;

/**
 * Génère un PDF pour un formulaire de bon de commande.
 * @param title - Titre du document
 * @param heading - En-tête du document
 * @param data - Données de la commande
 * @param signators - Signataires de la commande
 * @param currentDate - Date actuelle
 */
const slipsOfMenus = async (title: string, data: any[], signators: any[], currentDate: string) => {
    const doc = new jsPDF({
        unit: 'in',
        format: 'a4'
    });

    // Dans slipsOfMenus()
    data.forEach((item: any, index: number) => {
        if (index > 0) {
            doc.addPage();
        }

        headerPortrait(doc, title, currentDate, item.unit.name);

        // Position initiale après l'en-tête avec plus d'espace
        let yCoord = 2.8; // Augmenté de 2.5 à 2.8

        drawClientInfoBox(doc, item, yCoord);
        yCoord += 1.2; // Augmenté de 1 à 1.2

        // Dessiner les détails de commande avec espacement accru
        yCoord = drawOrderDetails(doc, item, yCoord + 0.5) ; // Ajout de 0.5 d'espace

        // Dessiner les tableaux de dépenses avec position calculée
        const finalTableY = drawExpensesTables(doc, item, yCoord);

        // Positionner la signature avec espace suffisant
        signature(doc, signators, itemsTotal, formatPrice(itemsTotal), finalTableY + 0.8); // Ajout de 0.8 d'espace

        footerPortrait(doc, data, index + 1, data.length);
        const blob = doc.output('blob');
        const url = URL.createObjectURL(blob);
        window.open(url);
    });

};

const drawClientInfoBox = (doc: jsPDF, item: any, startY: number) => {
    const accent = STYLES.colors.accent;
    doc.setFillColor(accent[0], accent[1], accent[2]);

    doc.roundedRect(STYLES.spacing.margin, startY - 0.2, STYLES.table.width, 1.3, 0.1, 0.1, 'F');

    const primary = STYLES.colors.primary;
    doc.setFontSize(STYLES.fonts.subHeader.size);
    doc.setTextColor(primary[0], primary[1], primary[2]);
    doc.setFont('helvetica', STYLES.fonts.subHeader.style);

    const clientInfo = [
        // { icon: ICONS.REF, label: 'Référence', value: item.ref },
        { icon: ICONS.CLIENT, label: 'Destinateur', value: "Monsieur le commandant de l'unité" },
        { icon: ICONS.CONTACT, label: 'Contact', value: 35335533 },
        { icon: ICONS.ADDRESS, label: 'Adresse', value: 'Quartier yimbaya' }
    ];

    let y = startY;
    clientInfo.forEach((info) => {
        doc.text(`${info.icon} ${info.label}: ${info.value}`, STYLES.spacing.margin + 0.2, y);
        y += STYLES.spacing.lineHeight;
    });
};

const formatPrice = (price: number): string => {
    try {
        // Convertir le nombre en entier pour éviter les décimales
        const priceInt = Math.round(price);

        // Formatter le nombre avec des espaces comme séparateurs de milliers
        const formattedNumber = priceInt
            .toString()
            .split('')
            .reverse()
            .reduce((acc, digit, i) => {
                if (i > 0 && i % 3 === 0) {
                    return digit + ' ' + acc;
                }
                return digit + acc;
            }, '');

        return `${formattedNumber} GNF`;
    } catch (error) {
        console.error('Erreur lors du formatage du prix:', error);
        return `${price} GNF`; // Fallback au cas où
    }
};

//  const tableConfig: UserOptions = {
//         startY: 3.6,
//         margin: { left: marginLeft },
//         tableWidth: tableWidth,
//         head: [['N°', 'Image', 'Article', ' Quantité', 'Unité', 'Obs']],
//         body: [
//             ...items.map((item, index) => [
//                 (index + 1).toString(),
//                 { content: '', image: item.item.image }, // Format spécial pour les images
//                 item.item.name,
//                 item.item.quantite,
//                 item.unite,
//                 ''
//             ])
//         ],
//         styles: {
//             fontSize: STYLES.table.fontSize,
//             cellPadding: 0.1,
//             lineColor: toColor(STYLES.colors.separator),
//             lineWidth: 0.001,
//             halign: 'center'
//         },
//         headStyles: {
//             fillColor: toColor(STYLES.colors.secondary),
//             textColor: toColor(STYLES.colors.white),
//             fontSize: STYLES.table.headerFontSize,
//             fontStyle: 'bold',
//             halign: 'center'
//         },
//         columnStyles: {
//             0: { cellWidth: 0.4, halign: 'center' },
//             1: { cellWidth: 0.8, halign: 'center' },
//             2: { cellWidth: 3.0, halign: 'left' },
//             3: { cellWidth: 0.8, halign: 'center' },
//             4: { cellWidth: 0.8, halign: 'center' },
//             5: { cellWidth: 1.07, halign: 'left' }
//         },
//         didDrawCell: (data: any) => {
//             if (data.column.index === 1 && data.cell.raw?.image) {
//                 try {
//                     // Ajouter l'image directement (sans passer par un objet Image)
//                     const imgWidth = data.cell.width - 0.2;
//                     const imgHeight = data.cell.height - 0.2;

//                     doc.addImage(
//                         data.cell.raw.image,
//                         'PNG', // ou 'JPEG' selon le format
//                         data.cell.x + 0.1,
//                         data.cell.y + 0.1,
//                         imgWidth,
//                         imgHeight
//                     );
//                 } catch (error) {
//                     console.error("Erreur de chargement de l'image:", error);
//                     // Afficher un placeholder si l'image ne charge pas
//                     doc.setTextColor(150, 150, 150);
//                     doc.text('Image', data.cell.x + data.cell.width / 2, data.cell.y + data.cell.height / 2, { align: 'center' });
//                 }
//             }
//         }
//     };

const drawOrderDetails = (doc: jsPDF, item: any, startY: number) => {
    const secondary = STYLES.colors.secondary;
    doc.setFontSize(STYLES.fonts.section.size);
    doc.setTextColor(secondary[0], secondary[1], secondary[2]);
    doc.text(`${ICONS.PACKAGE} Denrées :`, STYLES.spacing.margin, startY);

    const totalWidth = STYLES.table.width;
    const columnWidths = {
        no: totalWidth * 0.05, // 5%
        image: totalWidth * 0.12, // 12%
        article: totalWidth * 0.33, // 30%
        quantity: totalWidth * 0.2, // 12%
        unite: totalWidth * 0.2, // 13%
        obs: totalWidth * 0.1 // 28%
    };

    //calcul des montants
    const spendsTotal = item.spends ? item.spends.reduce((total: number, spend: any) => total + spend.amount, 0) : 0;
    const menusTotal = item.menus?.budgetTotal || 0;
    itemsTotal = spendsTotal + menusTotal;

    // Calculer la largeur approximative en caractères pour chaque colonne
    const charWidthEstimate = STYLES.fonts.normal.size / 3.5; // Estimation approximative
    const maxCharsInArticle = Math.floor((columnWidths.article * 72) / charWidthEstimate); // 72 points par pouce

    const tableConfig: UserOptions = {
        startY: startY + 0.3,
        margin: { left: STYLES.spacing.margin },
        head: [['N°', 'Image', 'Article', 'Quantité', 'Unité', 'Obs']],
        body: [
            ...item.items.map((product: { item: { name: string; quantite: number }; unite: string }, i: number) => {
                const row: CellDef[] = [
                    { content: (i + 1).toString() },
                    { content: '', styles: { minCellHeight: 0.4 } },
                    {
                        content: truncateText(product.item.name, maxCharsInArticle),
                        title: product.item.name
                    },
                    { content: product.item.quantite },
                    { content: product.unite },
                    { content: '' } // Colonne pour les observations
                ];
                return row;
            })
        ],
        styles: {
            fontSize: STYLES.fonts.normal.size,
            cellPadding: 0.1,
            lineColor: toColor(STYLES.colors.white),
            lineWidth: 0,
            overflow: 'ellipsize'
        },
        headStyles: {
            fillColor: toColor(STYLES.colors.secondary),
            textColor: toColor(STYLES.colors.white),
            fontSize: STYLES.fonts.subHeader.size,
            fontStyle: 'bold',
            halign: 'center'
        },
        alternateRowStyles: {
            fillColor: toColor(STYLES.colors.accent)
        },
        columnStyles: {
            0: { halign: 'center', cellWidth: columnWidths.no },
            1: { cellWidth: columnWidths.image },
            2: {
                halign: 'left',
                cellWidth: columnWidths.article,
                overflow: 'ellipsize'
            },
            3: {
                halign: 'center',
                cellWidth: columnWidths.quantity
            },
            4: {
                halign: 'center',
                cellWidth: columnWidths.unite
            },
            5: {
                halign: 'left',
                cellWidth: columnWidths.obs
            }
        },
        didParseCell: function (data: any) {
            if (data.section === 'head' && data.column.index === 2) {
                data.cell.styles.halign = 'left';
            }
        },
        didDrawCell: function (data: any) {
            handleImageCell(doc, data, item);
        }
    };

    autoTable(doc, tableConfig);

    // Retourner la position Y finale
    return doc.lastAutoTable?.finalY || startY + 2;
};

// Nouvelle fonction pour dessiner les tableaux de dépenses
const drawExpensesTables = (doc: jsPDF, item: any, startY: number) => {
    // Titre de la section dépenses avec espacement réduit
    const secondary = STYLES.colors.secondary;
    doc.setFontSize(STYLES.fonts.section.size);
    doc.setTextColor(secondary[0], secondary[1], secondary[2]);
    doc.text(`${ICONS.EXPENSE} Dépenses :`, STYLES.spacing.margin, startY);

    // Données pour la table de dépenses
    const expensesData = item.spends || [
        { name: 'Viande et poisson', amount: 4851000 },
        { name: 'Pain (TN)', amount: 792000 },
        { name: 'Menus-Dépenses (TN)', amount: 660000 }
    ];

    // Largeur totale disponible
    const totalWidth = STYLES.table.width;

    // Largeur pour la première table (dépenses)
    const expensesTableWidth = totalWidth * 0.45;

    // Première table (dépenses) - Hauteur fortement réduite
    const expensesTableConfig: UserOptions = {
        startY: startY + 0.15, // Espacement avant tableau réduit
        margin: { left: STYLES.spacing.margin },
        tableWidth: expensesTableWidth,
        head: [['N/O', 'Dépenses', 'Montant']],
        body: expensesData.map((expense: any, i: number) => [i + 1, expense.name, formatPrice(expense.amount)]),
        styles: {
            fontSize: STYLES.fonts.normal.size - 0.5, // Police légèrement réduite
            cellPadding: 0.03, // Padding très minimal
            lineColor: [0, 0, 0],
            lineWidth: 0.01,
            minCellHeight: 0.2 // Hauteur de cellule minimale
        },
        headStyles: {
            fillColor: toColor(STYLES.colors.secondary),
            textColor: toColor(STYLES.colors.white),
            fontSize: STYLES.fonts.subHeader.size - 0.5, // En-tête plus petit
            fontStyle: 'bold',
            halign: 'center',
            minCellHeight: 0.25 // Hauteur d'en-tête réduite
        },
        columnStyles: {
            0: { halign: 'center', cellWidth: expensesTableWidth * 0.15 },
            1: { halign: 'left', cellWidth: expensesTableWidth * 0.5 },
            2: { halign: 'right', cellWidth: expensesTableWidth * 0.35 }
        }
    };

    autoTable(doc, expensesTableConfig);

    // Largeur pour la deuxième table (carburant)
    const fuelTableWidth = totalWidth * 0.35;

    // Décalage pour la deuxième table
    const fuelTableX = STYLES.spacing.margin + expensesTableWidth + 0.4;

    // Deuxième table (carburant) - Hauteur fortement réduite
    const fuelTableConfig: UserOptions = {
        startY: startY + 0.15, // Alignement avec la première table
        margin: { left: fuelTableX },
        tableWidth: fuelTableWidth,
        head: [['Carburant']],
        body: [['6 600 000']],
        styles: {
            fontSize: STYLES.fonts.normal.size - 0.5, // Police légèrement réduite
            cellPadding: 0.03, // Padding très minimal
            lineColor: [0, 0, 0],
            lineWidth: 0.01,
            minCellHeight: 0.2 // Hauteur de cellule minimale
        },
        headStyles: {
            fillColor: toColor(STYLES.colors.secondary),
            textColor: toColor(STYLES.colors.white),
            fontSize: STYLES.fonts.subHeader.size - 0.5, // En-tête plus petit
            fontStyle: 'bold',
            halign: 'center',
            minCellHeight: 0.25 // Hauteur d'en-tête réduite
        },
        bodyStyles: {
            halign: 'center'
        }
    };

    autoTable(doc, fuelTableConfig);

    // Calcul du total des dépenses
    const totalExpenses = expensesData.reduce((total: number, expense: any) => total + expense.amount, 0);
    const fuelExpense = 6600000; // Montant pour le carburant
    const grandTotal = totalExpenses + fuelExpense;

    // Vérifie la position finale des tableaux et ajuste la position du texte
    const finalY = Math.max(
        doc.lastAutoTable?.finalY || startY + 0.6,
        startY + 0.6 // Minimum pour assurer un espacement
    );

    // Texte du montant total en toutes lettres - position optimisée
    doc.setFontSize(STYLES.fonts.normal.size - 0.5); // Police légèrement réduite
    doc.setTextColor(0, 0, 0);
    doc.setFont('helvetica', 'normal');

    // // Ajout du montant total à la position optimisée pour éviter les chevauchements
    // const amountInWords = `Soit un Montant Total de: ${numberToWords(grandTotal)} Francs Guinéens`;
    // doc.text(amountInWords, STYLES.spacing.margin, finalY + 0.15);

    // itemsTotal = grandTotal; // Mettre à jour le total global

    // Retourner la position Y finale pour que la fonction appelante puisse positionner la signature
    return finalY + 0.4; // Position Y suggérée pour commencer la signature
};

// Fonction simple pour convertir un nombre en toutes lettres (à améliorer selon besoins)
const numberToWords = (num: number): string => {
    // Cette fonction pourrait être beaucoup plus complexe pour couvrir tous les cas
    // Ici c'est une version simplifiée
    const units = ['', 'un', 'deux', 'trois', 'quatre', 'cinq', 'six', 'sept', 'huit', 'neuf'];
    const teens = ['dix', 'onze', 'douze', 'treize', 'quatorze', 'quinze', 'seize', 'dix-sept', 'dix-huit', 'dix-neuf'];
    const tens = ['', 'dix', 'vingt', 'trente', 'quarante', 'cinquante', 'soixante', 'soixante-dix', 'quatre-vingt', 'quatre-vingt-dix'];

    if (num === 0) return 'zéro';

    // Formater le nombre avec des espaces comme séparateurs
    const formattedNumber = num
        .toString()
        .split('')
        .reverse()
        .reduce((acc, digit, i) => {
            if (i > 0 && i % 3 === 0) {
                return digit + ' ' + acc;
            }
            return digit + acc;
        }, '');

    // Pour cet exemple, on renvoie simplement le nombre formaté
    return formattedNumber;
};

const handleImageCell = (doc: jsPDF, data: any, item: any) => {
    if (data.column.index === 1 && data.cell.section === 'body' && data.row.index < item.items.length) {
        const product = item.items[data.row.index];
        const imgData = product.item.image;

        if (imgData) {
            const padding = 0.05;
            const dimensions = {
                width: data.cell.width - padding * 2,
                height: data.cell.height - padding * 2
            };

            const position = {
                x: data.cell.x + (data.cell.width - dimensions.width) / 2,
                y: data.cell.y + (data.cell.height - dimensions.height) / 2
            };

            try {
                doc.addImage(imgData, 'PNG', position.x, position.y, dimensions.width, dimensions.height);
            } catch (error) {
                console.warn("Erreur de chargement de l'image:", error);
            }
        }
    }
};

export { slipsOfMenus };
