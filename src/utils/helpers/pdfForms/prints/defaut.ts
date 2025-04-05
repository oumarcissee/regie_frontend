import { convertNumberToWords } from '@/services/utils';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import footerPortrait from '@/utils/helpers/pdfForms/includes/footerPortrait';
import signature from '@/utils/helpers/pdfForms/includes/signature';
import autoTable, { type UserOptions, type Color } from 'jspdf-autotable';

// Déclaration du type pour lastAutoTable
declare module 'jspdf' {
    interface jsPDF {
        lastAutoTable?: {
            finalY: number;
        };
    }
}

// Données dynamiques
const dynamicData = {
    unit: {
        name: 'BATAILLON DU QUARTIER GENERAL'
    },
    items: [
        { item: { name: 'Tomate', quantite: 212 }, unite: 'Carton(s)', image: '../../../public/assets/apps/armoirie-guinée-1024x513.png' },
        { item: { name: 'Huile', quantite: 22 }, unite: 'Bidon(s)', image: '../../../public/assets/apps/armoirie-guinée-1024x513.png' },
        { item: { name: 'Riz du pays', quantite: 155 }, unite: 'Sac(s)', image: '../../../public/assets/apps/armoirie-guinée-1024x513.png' }
    ],
    spends: [
        { name: 'TRANSPORT ET MANUTENTION QR', amount: 477777777 },
        { name: 'AMELIORATION', amount: 5000 }
    ],
    fuelAmount: 6600000
};

// Configuration des styles
const STYLES = {
    colors: {
        primary: [0, 48, 135] as [number, number, number],
        secondary: [0, 102, 204] as [number, number, number],
        accent: [240, 240, 250] as [number, number, number],
        white: [255, 255, 255] as [number, number, number],
        black: [0, 0, 0] as [number, number, number],
        travail: [204, 0, 0] as [number, number, number],
        justice: [204, 163, 0] as [number, number, number],
        solidarite: [0, 153, 0] as [number, number, number],
        separator: [0, 0, 0] as [number, number, number]
    },
    fonts: {
        header: { size: 16, style: 'bold' as const },
        subHeader: { size: 12, style: 'bold' as const },
        normal: { size: 11, style: 'normal' as const },
        section: { size: 14, style: 'bold' as const }
    },
    spacing: {
        margin: 0.4,
        lineHeight: 0.35,
        sectionGap: 0.2
    },
    table: {
        cellPadding: 0.05, // Réduit de 0.1 à 0.05
        minCellHeight: 0.15, // Réduit de 0.2 à 0.15
        fontSize: 9, // Réduit de 11 à 9 pour le texte dans les cellules
        headerFontSize: 10 // Réduit de 12 à 10 pour les en-têtes
    },
    layout: {
        clientInfoWidth: 7.67,
        tableWidthRatio: 0.9, // 90%
        // Largeurs des colonnes (en ratio ou valeurs absolues)
        columnWidths: {
            num: 0.4,
            img: 0.6,
            article: 3.2,
            qty: 0.7,
            unit: 0.7,
            obs: 'auto' // Calculé dynamiquement
        }
    }
};


// Formater les prix
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

        return `${formattedNumber} FG`;
    } catch (error) {
        console.error('Erreur lors du formatage du prix:', error);
        return `${price} GNF`; // Fallback au cas où
    }
};

// Créer l'en-tête du document
const createHeader = (doc: jsPDF, title: string, unitName: string, signators?: any) => {
    const pageWidth = doc.internal.pageSize.width;

    // Dessiner une ligne horizontale
    const drawCenteredText = (textArray: string[], x: number, startY: number, containerWidth: number) => {
        let counter = 0;
        let currentY = startY;

        textArray.forEach((text, index) => {
            const centerX = x + (containerWidth / 2 - 0.1);
            counter++;
            doc.text(text, centerX, currentY, { align: 'center' });
            if (counter === 1) {
                currentY += 0.72;
            } else {
                currentY += 0.15;
            }
        });
        return currentY;
    };

    // Informations nationales
    doc.setFontSize(STYLES.fonts.subHeader.size);
    doc.setTextColor(...STYLES.colors.primary);
    doc.setFont('helvetica', 'bold');
    doc.text('République de Guinée', pageWidth - 0.5, 0.5, { align: 'right' });
    doc.text('Ministère de la Défense Nationale', 0.5, 0.5);

    // Devise nationale avec couleurs spécifiques
    doc.setFontSize(10);
    const startX = pageWidth - 0.5;
    let currentX = startX - 1.2;

    doc.setFontSize(10);
    // Travail in Red
    doc.setTextColor(...STYLES.colors.travail);
    doc.text('Travail', currentX, 0.75, { align: 'right' });
    const travailWidth = doc.getTextWidth('Travail - ');

    // Justice in Yellow
    doc.setTextColor(...STYLES.colors.justice);
    doc.text('Justice', currentX + travailWidth * 0.9, 0.75, { align: 'right' });
    const justiceWidth = doc.getTextWidth('Justice - ');

    // Solidarité in Green
    doc.setTextColor(...STYLES.colors.solidarite);
    doc.text('Solidarité', currentX + (travailWidth + justiceWidth) * 1, 0.75, { align: 'right' });

    doc.setTextColor(...STYLES.colors.black);
    doc.setFont(undefined, 'normal');
    doc.setFontSize(STYLES.fonts.normal.size);

    // Positionnement des signataires
    if (signators) {
        const containerWidth = pageWidth / 4; // Ajustez selon vos besoins
        const rightContainerX = pageWidth - containerWidth - 0.5; // Aligné à droite avec marge
        const startY = 1.0; // Position Y juste en dessous de la devise (0.75 + 0.25 d'espace)

        drawCenteredText(signators, rightContainerX + 0.2, startY, containerWidth);
    }

    // Centre emblem
    const img = '../../../public/assets/apps/armoirie-guinée-1024x513.png';
    const imgWidth = 1.75;
    const imgHeight = 1.1;
    const imgX = (pageWidth - imgWidth) / 2;
    doc.addImage(img, 'PNG', imgX, 0.3, imgWidth, imgHeight);

    // Informations ministérielles
    doc.setTextColor(...STYLES.colors.primary);
    doc.setFontSize(STYLES.fonts.normal.size);
    doc.setFont('helvetica', 'normal');
    doc.text("Direction Générale de l'Intendance Militaire", 0.5, 0.75);
    doc.setFont('helvetica', 'bold');
    doc.text('Régie des Unités Territoriales', 0.5, 1);

    // Titre principal
    doc.setFontSize(STYLES.fonts.header.size);
    doc.setTextColor(...STYLES.colors.primary);
    doc.text(title, pageWidth / 2, 1.75, { align: 'center' });

    if (unitName) {
        doc.setFontSize(STYLES.fonts.subHeader.size);
        const maxWidth = pageWidth - 2;
        const nameWidth = doc.getTextWidth(unitName);

        if (nameWidth > maxWidth) {
            const splitText = doc.splitTextToSize(unitName, maxWidth);
            doc.text(splitText, pageWidth / 2, 2, { align: 'center' });
        } else {
            doc.text(unitName, pageWidth / 2, 2, { align: 'center' });
        }
    }
};

// Créer la section des informations client
const createClientInfo = (doc: jsPDF) => {
    doc.setFillColor(...STYLES.colors.accent);
    doc.roundedRect(STYLES.spacing.margin, 2.3, 7.5, 1.1, 0.1, 0.1, 'F');

    doc.setFontSize(STYLES.fonts.subHeader.size);
    doc.setTextColor(...STYLES.colors.primary);
    doc.setFont('helvetica', STYLES.fonts.subHeader.style);

    let y = 2.5;
    doc.text(`• Destinateur: Monsieur le commandant de l'unité`, STYLES.spacing.margin + 0.2, y);
    y += STYLES.spacing.lineHeight;
    doc.text(`• Contact: 35335533`, STYLES.spacing.margin + 0.2, y);
    y += STYLES.spacing.lineHeight;
    doc.text(`• Adresse: Quartier yimbaya`, STYLES.spacing.margin + 0.2, y);
};

// Créer le tableau des denrées// Créer le tableau des denrées (version corrigée)
const createItemsTable = (doc: jsPDF, items: any[]) => {
    doc.setFontSize(STYLES.fonts.section.size);
    doc.setTextColor(...STYLES.colors.secondary);
    doc.text(`• Denrées :`, STYLES.spacing.margin, 3.5);

    const clientInfoWidth = STYLES.layout.clientInfoWidth;
    const tableWidth = clientInfoWidth * STYLES.layout.tableWidthRatio;
    const marginLeft = STYLES.spacing.margin + (clientInfoWidth - tableWidth) / 2;

    const tableConfig: UserOptions = {
        startY: 3.6,
        margin: { left: marginLeft },
        tableWidth: tableWidth,
        head: [['N°', 'Image', 'Article', ' Quantité', 'Unité', 'Obs']],
        body: [
            ...items.map((item, index) => [
                (index + 1).toString(),
                { content: '', image: item.item.image }, // Format spécial pour les images
                item.item.name,
                item.item.quantite,
                item.unite,
                ''
            ])
        ],
        styles: {
            fontSize: STYLES.table.fontSize,
            cellPadding: 0.05,
            lineColor: [0, 0, 0],
            lineWidth: 0.001,
            halign: 'center',
            minCellHeight: 0.3 // Augmentez cette valeur si nécessaire
        },
        columnStyles: {
            0: { cellWidth: 0.4, halign: 'center' },
            1: { cellWidth: 0.6, halign: 'center' }, // Colonne image légèrement plus large
            2: { cellWidth: 3.0, halign: 'left' },
            3: { cellWidth: 0.7, halign: 'center' },
            4: { cellWidth: 0.7, halign: 'center' },
            5: { cellWidth: 'auto', halign: 'left' }
        },
        didDrawCell: (data: any) => {
            if (data.column.index === 1 && data.cell.raw?.image) {
                try {
                    // Ajouter l'image directement (sans passer par un objet Image)
                    const imgWidth = data.cell.width - 0.2;
                    const imgHeight = data.cell.height - 0.2;

                    doc.addImage(
                        data.cell.raw.image,
                        'PNG', // ou 'JPEG' selon le format
                        data.cell.x + 0.1,
                        data.cell.y + 0.1,
                        imgWidth,
                        imgHeight
                    );
                } catch (error) {
                    console.error("Erreur de chargement de l'image:", error);
                    // Afficher un placeholder si l'image ne charge pas
                    doc.setTextColor(150, 150, 150);
                    doc.text('Image', data.cell.x + data.cell.width / 2, data.cell.y + data.cell.height / 2, { align: 'center' });
                }
            }
        }
    };

    autoTable(doc, tableConfig);
    return doc.lastAutoTable?.finalY || 6;
};

// Créer les tableaux des dépenses avec entête séparé pour les dépenses supplémentaires
const createExpensesTables = (doc: jsPDF, menus: any[], spends: any[]) => {
    let startY = doc.lastAutoTable?.finalY + 0.2;

    // Entête principal
    doc.setFontSize(STYLES.fonts.section.size - 3);
    doc.setTextColor(...STYLES.colors.secondary);
    doc.text(`• Dépenses :`, STYLES.spacing.margin, startY);
    startY += 0.15;

    // Calculer la largeur totale disponible
    const clientInfoWidth = STYLES.layout.clientInfoWidth;
    const tableWidth = clientInfoWidth * STYLES.layout.tableWidthRatio;
    const marginLeft = STYLES.spacing.margin + (clientInfoWidth - tableWidth) / 2;

    // Largeur des deux petits tableaux
    const smallTableWidth = (tableWidth - 0.2) / 2;

    // Calcul des totaux
    const totalMenus = menus.reduce((total, menu) => total + menu.montantAlloue, 0);
    const totalSpends = spends.reduce((total, spend) => total + spend.amount, 0);
    const totalExpenses = totalMenus + totalSpends;

    // Tableau des dépenses principales (gauche)
    const menusTableConfig: UserOptions = {
        startY: startY,
        margin: { left: marginLeft },
        tableWidth: smallTableWidth,
        head: [['N°', 'Désignation', 'Montant']],
        body: [
            ...menus.map((menu, index) => [(index + 1).toString(), menu.name, formatPrice(menu.montantAlloue)]),
            ...(menus.length > 0 ? [['', 'TOTAL', formatPrice(totalMenus)]] : []) // Ligne de total
        ],
        styles: {
            fontSize: STYLES.table.fontSize - 0.5,
            cellPadding: 0.03,
            lineColor: [0, 0, 0],
            lineWidth: 0.001,
            halign: 'center'
        },
        columnStyles: {
            0: { halign: 'center', cellWidth: 0.4 },
            1: { halign: 'left', cellWidth: 'auto' },
            2: { halign: 'right', cellWidth: 1.0 }
        },
        willDrawCell: (data) => {
            if (data.row.index === menus.length) {
                doc.setFont(undefined, 'bold'); // Total en gras
            }
        }
    };

    autoTable(doc, menusTableConfig);

    // Position pour l'entête et le tableau des dépenses supplémentaires
    const secondTableLeft = marginLeft + smallTableWidth + 0.2;

    // Entête séparé pour les dépenses supplémentaires
    doc.setFontSize(STYLES.fonts.section.size - 3);
    doc.setTextColor(...STYLES.colors.secondary);
    doc.text(`• Dépenses supplémentaires :`, secondTableLeft, startY - 0.15);

    // Tableau des dépenses supplémentaires (sans entête intégré)
    const expensesTableConfig: UserOptions = {
        startY: startY,
        margin: { left: secondTableLeft },
        tableWidth: smallTableWidth,
        head: [['N°', 'Désignation', 'Montant']],
        body: [
            ...spends.map((spend, index) => [(index + 1).toString(), spend.name, formatPrice(spend.amount)]),
            ...(spends.length > 0 ? [['', 'TOTAL', formatPrice(totalSpends)]] : []) // Ligne de total
        ],
        styles: {
            fontSize: STYLES.table.fontSize - 0.5,
            cellPadding: 0.03,
            lineColor: [0, 0, 0],
            lineWidth: 0.001,
            halign: 'center'
        },
        columnStyles: {
            0: { halign: 'center', cellWidth: 0.4 },
            1: { halign: 'left', cellWidth: 'auto' },
            2: { halign: 'right', cellWidth: 1.0 }
        },
        willDrawCell: (data) => {
            if (spends.length > 0 && data.row.index === spends.length) {
                doc.setFont(undefined, 'bold'); // Total en gras
            }
        }
    };

    if (spends.length > 0) {
        autoTable(doc, expensesTableConfig);
    }

    // Position finale
    const finalY = Math.max(doc.lastAutoTable?.finalY || startY + 1, startY + Math.max(menus.length, spends.length) * 0.15 + 0.5) + 0.3;

    // Cadre autour du total général
    doc.setFillColor(...STYLES.colors.accent);
    doc.rect(marginLeft, finalY - 0.1, tableWidth, 0.5, 'F');

    // Total général (en gras)
    doc.setFontSize(STYLES.fonts.normal.size);
    doc.setTextColor(0, 0, 0);
    doc.setFont(undefined, 'bold');

    // Format the total text
    const totalText = `Soit un Montant Total de: ${convertNumberToWords(totalExpenses)} (${formatPrice(totalExpenses)}).`;

    // Split the text to fit within the available width
    const availableWidth = tableWidth - 0.2; // Leaving a small margin
    const splitText = doc.splitTextToSize(totalText, availableWidth);

    // Calculate if we need to adjust the height of our box
    const textHeight = splitText.length * 0.15; // Approximate height per line
    const boxHeight = Math.max(0.5, textHeight + 0.2); // Min height 0.5, or text height plus margin

    // Adjust the box size to fit the text
    doc.setFillColor(...STYLES.colors.accent);
    doc.rect(marginLeft, finalY - 0.1, tableWidth, boxHeight, 'F');

    // Center the text vertically and horizontally
    const textY = finalY - 0.1 + 0.15 + (boxHeight - textHeight) / 2;
    for (let i = 0; i < splitText.length; i++) {
        doc.text(splitText[i], marginLeft + tableWidth / 2, textY + i * 0.15, {
            align: 'center'
        });
    }

    // Update the final Y position based on the actual box height
    return {
        finalY: finalY + boxHeight + 0.2, // Add some margin after the box
        totalAmount: totalExpenses
    };
};

// Créer la section de signature
const createSignature = (doc: jsPDF, signators: any, finalY: number) => {
    const date = new Date().toLocaleDateString('fr-FR', {
        day: '2-digit',
        month: 'long',
        year: 'numeric'
    });
    doc.setFont(undefined, 'normal');
    doc.setFontSize(STYLES.fonts.normal.size);
    doc.text(`Conakry, ${date}`, doc.internal.pageSize.width - 1.2, finalY- 0.1, { align: 'right' });

    // Ajuster la position Y après la date
    const dateFinalY = finalY + 0.13;

    const pageHeight = doc.internal.pageSize.height;
    const pageWidth = doc.internal.pageSize.width;

    // Dimensions and margins
    const leftMargin = 0.5;
    const rightMargin = pageWidth - 0.9;
    const containerWidth = pageWidth / 3;
    const leftContainerX = leftMargin;
    const rightContainerX = rightMargin - containerWidth + 0.4;

    // Initialize empty arrays for content
    let leftContent: string[] = [];
    let rightContent: string[] = [];

   

    const drawCenteredText = (textArray: string[], x: number, startY: number, containerWidth: number) => {
        let currentY = startY;

        textArray.forEach((text,index) => {
            const centerX = x + (containerWidth / 2 - 0.1);
            doc.text(text, centerX, currentY, { align: 'center' });

            currentY += index === 1 ? 0.2: 0.93;

        });
        return currentY;
    };

    // Draw containers and content
    const leftFinalY = drawCenteredText(signators, leftContainerX, dateFinalY, containerWidth);
    const rightFinalY = drawCenteredText(signators, rightContainerX, dateFinalY, containerWidth);

    return Math.max(leftFinalY, rightFinalY);
};

// Créer le pied de page
// Modifier la fonction createFooter pour mieux gérer la pagination
const createFooter = (doc: jsPDF, data: any, pageNumber: number, totalPages: number) => {
    const pageHeight = doc.internal.pageSize.height;
    const pageWidth = doc.internal.pageSize.width;

    // Configuration des espacements
    const marginX = 0.5; // Marge latérale
    const lineYPosition = pageHeight - 0.4; // Position Y de la ligne
    const textYPosition = pageHeight - 0.2; // Position Y du texte (en dessous de la ligne)
    const linePadding = 0.1; // Espace entre la ligne et le texte

    // Dessiner la ligne horizontale en premier
    doc.setDrawColor(150); // Couleur grise
    doc.setLineWidth(0.05); // Épaisseur de la ligne
    doc.line(marginX, lineYPosition, pageWidth - marginX, lineYPosition);

    // Sauvegarder l'état graphique actuel
    doc.saveGraphicsState();

    // Définir l'opacité
    doc.setGState(doc.GState({ opacity: 0.05 }));

    // Ajouter le filigrane
    doc.setFontSize(150);
    doc.setTextColor(150); // Couleur claire pour le filigrane
    doc.text('DGIM', pageWidth / 1.5, pageHeight / 2, {
        align: 'center',
        angle: 45
    });

    // Restaurer l'état graphique d'origine
    doc.restoreGraphicsState();

    // Préparer les textes à afficher
    const now = new Date().toLocaleString('fr-FR', {
        // day: '2-digit',
        // month: '2-digit',
        // year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
    const domain = window.location.hostname;
    const pagination = `Page ${pageNumber} sur ${totalPages}`;

    // Configurer la police
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');

    // Afficher la date à gauche
    doc.text(`Heure: ${now}`, marginX, textYPosition);

    // Afficher la pagination au centre
    doc.text(pagination, pageWidth / 2, textYPosition, { align: 'center' });

    // Afficher le domaine à droite
    doc.text(domain, pageWidth - marginX, textYPosition, { align: 'right' });

    // Option: Ajouter un petit espacement vertical si nécessaire
    // doc.text('', marginX, textYPosition + 0.2);
};

// Fonction principale pour générer le PDF


/**
  * 
  * @param data 
  * @param signators 
  */
export const generatePDF = async (data: any, signators: any) => {
    const doc = new jsPDF({
        unit: 'in',
        format: 'a4',
        compress: true // Active la compression du PDF
    });

    data.forEach((dynamicData: any, index: number) => {
        if (index > 0) {
            doc.addPage();
        }

        // Initialize empty arrays for content
        let leftContent: string[] = [];
        let rightContent: string[] = [];

        // Populate arrays based on signators data
        if (signators && signators.length > 0) {
            signators.forEach(
                (element: { position: string; function_name: string; title: string; grade: any; first_name: any; last_name: any }) => {
                    if (element.position === 'left') {
                        leftContent = [element.function_name, element.title, `${element.grade} ${element.first_name} ${element.last_name}`];
                    } else if (element.position === 'right') {
                        rightContent = [
                            element.function_name,
                            element.title,
                            `${element.grade} ${element.first_name} ${element.last_name}`
                        ];
                    }
                }
            );
        } else {
            leftContent = ['Fonction', 'Titre', 'Grade Prénom et Nom'];
            rightContent = ['Fonction', 'Titre', 'Grade Prénom et Nom'];
        }

        createHeader(doc, "BORDEREAU D'ENVOI", dynamicData.unit.name, rightContent);

        createClientInfo(doc);

        // Passez directement dynamicData.items sans pré-traitement
        createItemsTable(doc, dynamicData.items);

        const { finalY } = createExpensesTables(doc, dynamicData.menus.repartition, dynamicData.spends);

        createSignature(doc, rightContent, finalY);

        createFooter(doc, dynamicData, index + 1, data.length); // Remplacez par le numéro de page réel
    });

    const blob = doc.output('blob');
    const url = URL.createObjectURL(blob);
    window.open(url);
};

