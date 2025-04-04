import jsPDF from 'jspdf';
import 'jspdf-autotable';
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

// Fonction de conversion de couleur corrigée
const toColor = (color: readonly [number, number, number] | number[]): Color => {
    if (color.length !== 3) throw new Error('Color array must have exactly 3 elements');
    return [color[0], color[1], color[2]];
};

// Formater les prix
const formatPrice = (price: number): string => {
    return new Intl.NumberFormat('fr-FR').format(price) + ' GNF';
};

// Convertir les nombres en lettres
const numberToWords = (num: number): string => {
    return formatPrice(num); // Version simplifiée
};

// Créer l'en-tête du document
const createHeader = (doc: jsPDF, title: string, unitName: string) => {
    const pageWidth = doc.internal.pageSize.width;

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

    // Center emblem with enhanced positioning
    const img = '../../../public/assets/apps/armoirie-guinée-1024x513.png';
    const imgWidth = 1.75;
    const imgHeight = 1.1;
    const imgX = (pageWidth - imgWidth) / 2;

    // // Add shadow effect for the image
    // doc.setFillColor(200, 200, 200);
    // doc.roundedRect(imgX + 0.05, 0.35, imgWidth, imgHeight, 0.1, 0.1, 'F');

    // Add the image
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
        // doc.setTextColor(styles.subtitle.r, styles.subtitle.g, styles.subtitle.b);

        // Calculate if text needs wrapping
        const maxWidth = pageWidth - 2; // Leave margins on both sides
        const nameWidth = doc.getTextWidth(unitName);

        if (nameWidth > maxWidth) {
            // Text needs wrapping
            const splitText = doc.splitTextToSize(unitName, maxWidth);
            doc.text(splitText, pageWidth / 2, 2, { align: 'center' });
        } else {
            // Text fits on one line
            doc.text(unitName, pageWidth / 2, 2, { align: 'center' });
        }
    }

};

// Créer la section des informations client
const createClientInfo = (doc: jsPDF) => {
    doc.setFillColor(...STYLES.colors.accent);
    doc.roundedRect(STYLES.spacing.margin, 2.3, 7.50, 1.1, 0.1, 0.1, 'F');

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
            ]),
        ],
        styles: {
            fontSize: STYLES.table.fontSize,
            cellPadding: 0.1,
            lineColor: toColor(STYLES.colors.separator),
            lineWidth: 0.001,
            halign: 'center'
        },
        headStyles: {
            fillColor: toColor(STYLES.colors.secondary),
            textColor: toColor(STYLES.colors.white),
            fontSize: STYLES.table.headerFontSize,
            fontStyle: 'bold',
            halign: 'center'
        },
        columnStyles: {
            0: { cellWidth: 0.4, halign: 'center' },
            1: { cellWidth: 0.8, halign: 'center' },
            2: { cellWidth: 3.0, halign: 'left' },
            3: { cellWidth: 0.8, halign: 'center' },
            4: { cellWidth: 0.8, halign: 'center' },
            5: { cellWidth: 1.07, halign: 'left' }
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


// Créer les tableaux des dépenses
const createExpensesTables = (doc: jsPDF, spends: any[], fuelAmount: number = 0) => {
    let startY = (doc.lastAutoTable?.finalY) + 0.2;

    doc.setFontSize(STYLES.fonts.section.size - 1.5);
    doc.setTextColor(...STYLES.colors.secondary);
    doc.text(`• Dépenses :`, STYLES.spacing.margin, startY);
    startY += 0.15;

    // Tableau des dépenses principales
    const expensesTableConfig: UserOptions = {
        startY: startY,
        margin: { left: STYLES.spacing.margin },
        tableWidth: 3.5,
        head: [['N/O', 'Dépenses', 'Montant']],
        body: spends.map((spend, index) => [(index + 1).toString(), spend.name, formatPrice(spend.amount)]),
        styles: {
            fontSize: STYLES.table.fontSize - 0.5, // Taille très compacte
            cellPadding: 0.03, // Padding minimal
            lineColor: [0, 0, 0],
            lineWidth: 0.03, // Lignes très fines
            minCellHeight: 0.12 // Hauteur minimale réduite
        },
        headStyles: {
            fillColor: toColor(STYLES.colors.secondary),
            textColor: toColor(STYLES.colors.white),
            fontSize: STYLES.fonts.subHeader.size - 0.5,
            fontStyle: 'bold',
            halign: 'center',
            minCellHeight: 0.15 // En-tête plus compact
        },
        columnStyles: {
            0: { halign: 'center', cellWidth: 0.5 },
            1: { halign: 'left', cellWidth: 2.0 },
            2: { halign: 'right', cellWidth: 1.0 }
        }
    };

    autoTable(doc, expensesTableConfig);

    // Tableau du carburant
    // const fuelTableConfig: UserOptions = {
    //     startY: startY,
    //     margin: { left: STYLES.spacing.margin + 4.0 },
    //     tableWidth: 2.0,
    //     head: [['Carburant']],
    //     body: [[formatPrice(fuelAmount)]],
    //     styles: {
    //         fontSize: STYLES.table.fontSize - 0.5,
    //         cellPadding: 0.03,
    //         lineColor: [0, 0, 0],
    //         lineWidth: 0.03,
    //         minCellHeight: 0.12
    //     },
    //     headStyles: {
    //         minCellHeight: 0.15,
    //         fillColor: toColor(STYLES.colors.secondary),
    //         textColor: toColor(STYLES.colors.white),
    //         fontSize: STYLES.fonts.subHeader.size - 0.5,
    //         fontStyle: 'bold',
    //         halign: 'center'
    //     },
    //     bodyStyles: {
    //         halign: 'center'
    //     }
    // };

    // autoTable(doc, fuelTableConfig);

    // Calcul du total
    const totalExpenses = spends.reduce((total, spend) => total + spend.amount, 0) + fuelAmount;
    const finalY = (doc.lastAutoTable?.finalY || startY + 1) + 0.3;

    doc.setFontSize(STYLES.fonts.normal.size);
    doc.setTextColor(0, 0, 0);
    doc.text(`Soit un Montant Total: ${numberToWords(totalExpenses)} (${formatPrice(totalExpenses)})`, STYLES.spacing.margin, finalY);

    return {
        finalY: finalY + 0.5,
        totalAmount: totalExpenses
    };
};

// Créer la section de signature
const createSignature = (doc: jsPDF, finalY: number) => {
    const date = new Date().toLocaleDateString('fr-FR', {
        day: '2-digit',
        month: 'long',
        year: 'numeric'
    });

    doc.setFontSize(STYLES.fonts.normal.size);
    doc.text(`Conakry, ${date}`, doc.internal.pageSize.width - 0.5, finalY, { align: 'right' });

    const signatureY = finalY + 0.8;
    const centerX = doc.internal.pageSize.width / 2;

    // Signature gauche
    doc.text('Fonction', centerX - 2.5, signatureY, { align: 'center' });
    doc.text('Titre', centerX - 2.5, signatureY + 0.5, { align: 'center' });
    doc.text('Grade Prénom et Nom', centerX - 2.5, signatureY + 1.0, { align: 'center' });

    // Signature droite
    doc.text('Fonction', centerX + 2.5, signatureY, { align: 'center' });
    doc.text('Titre', centerX + 2.5, signatureY + 0.5, { align: 'center' });
    doc.text('Grade Prénom et Nom', centerX + 2.5, signatureY + 1.0, { align: 'center' });
};

// Créer le pied de page
const createFooter = (doc: jsPDF) => {
    const pageHeight = doc.internal.pageSize.height;
    const pageWidth = doc.internal.pageSize.width;

    doc.setDrawColor(150);
    doc.setLineWidth(0.05);
    doc.line(0.5, pageHeight - 1.0, pageWidth - 0.5, pageHeight - 1.0);

    const now = new Date();
    doc.setFontSize(10);
    doc.text(now.toLocaleString('fr-FR'), 0.5, pageHeight - 0.5);
    doc.text('Page 1/1', pageWidth / 2, pageHeight - 0.5, { align: 'center' });
    doc.text('localhost', pageWidth - 0.5, pageHeight - 0.5, { align: 'right' });
};

const loadImages = async (items: any[]) => {
    const promises = items.map((item) => {
        return new Promise((resolve) => {
            if (!item.image) return resolve(null);
            const img = new Image();
            img.onload = () => resolve(img);
            img.onerror = () => resolve(null);
            img.src = item.image;
        });
    });
    return Promise.all(promises);
};



// Fonction principale pour générer le PDF
export const generatePDF = async (data: any) => {
    const doc = new jsPDF({
        unit: 'in',
        format: 'a4',
        compress: true // Active la compression du PDF
    });

    data.forEach((dynamicData: any, index: number) => {
        if (index > 0) {
            doc.addPage();
        }

        createHeader(doc, "BORDEREAU D'ENVOI", dynamicData.unit.name);
        createClientInfo(doc);

        // Passez directement dynamicData.items sans pré-traitement
        createItemsTable(doc, dynamicData.items);

        const { finalY } = createExpensesTables(doc, dynamicData.spends);
        createSignature(doc, finalY);
        createFooter(doc);
    });



    const blob = doc.output('blob');
    const url = URL.createObjectURL(blob);
    window.open(url);
};
export default generatePDF;
