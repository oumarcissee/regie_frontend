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
    doc.rect(marginLeft, finalY - 0.1, tableWidth, 0.3, 'F');

    // Total général (en gras)
    doc.setFontSize(STYLES.fonts.normal.size);
    doc.setTextColor(0, 0, 0);
    doc.setFont(undefined, 'bold');
    doc.text(
        `TOTAL GÉNÉRALTOTAL GÉNÉRALTOTAL GÉNÉRALTOTAL GÉNÉRALTOTAL GÉNÉRALTOTAL GÉNÉRALTOTAL GÉNÉRALTOTAL GÉNÉRALTOTAL GÉNÉRAL: ${numberToWords(
            totalExpenses
        )} (${formatPrice(totalExpenses)})`,
        marginLeft + tableWidth / 2,
        finalY + 0.1,
        {
            align: 'center'
        }
    );

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


// Fonction pour redimensionner une image
const resizeImage = (base64Str: string, maxWidth: number, maxHeight: number): Promise<string> => {
    return new Promise((resolve) => {
        const img = new Image();
        img.src = base64Str;
        img.onload = () => {
            const canvas = document.createElement('canvas');
            let width = img.width;
            let height = img.height;

            if (width > height) {
                if (width > maxWidth) {
                    height *= maxWidth / width;
                    width = maxWidth;
                }
            } else {
                if (height > maxHeight) {
                    width *= maxHeight / height;
                    height = maxHeight;
                }
            }

            canvas.width = width;
            canvas.height = height;
            const ctx = canvas.getContext('2d');
            ctx?.drawImage(img, 0, 0, width, height);
            resolve(canvas.toDataURL('image/png'));
        };
        img.onerror = () => resolve(base64Str); // Retourne l'original si erreur
    });
};

// Puis dans votre boucle de données :



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

        const { finalY } = createExpensesTables(doc, dynamicData.menus.repartition, dynamicData.spends);
        createSignature(doc, finalY);
        createFooter(doc);
    });

    const blob = doc.output('blob');
    const url = URL.createObjectURL(blob);
    window.open(url);
};
export default generatePDF;
