import jsPDF from 'jspdf';
import 'jspdf-autotable';
import autoTable, { type UserOptions, type Color, type CellDef } from 'jspdf-autotable';
import { get_full_unite } from '@/services/utils';
import headerPortrait from './includes/headerPortrait';
import footerPortrait from './includes/footerPortrait';
import signature from './includes/signature';

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
        width: 7.67
    }
};

const ICONS = {
    REF: '•',
    CLIENT: '•',
    CONTACT: '•',
    ADDRESS: '•',
    PACKAGE: '•'
} as const;

const toColor = (color: readonly [number, number, number]): Color => color as Color;

const orderFormPdf = async (heading: string, data: any[], signators: any[]) => {
    const doc = new jsPDF({
        unit: 'in',
        format: 'a4'
    });

    data.forEach((item: OrderData, index: number) => {
        if (index > 0) {
            doc.addPage();
        }

        headerPortrait(doc, "BON DE COMMANDE");
        let yCoord = 2.5;
        drawClientInfoBox(doc, item, yCoord);
        yCoord += 1.5;
        drawOrderDetails(doc, item, yCoord);
        signature(doc, signators);
        footerPortrait(doc, data, index + 1, data.length);
    });

    const blob = doc.output('blob');
    const url = URL.createObjectURL(blob);
    window.open(url);
};

const drawClientInfoBox = (doc: jsPDF, item: OrderData, startY: number) => {
    const accent = STYLES.colors.accent;
    doc.setFillColor(accent[0], accent[1], accent[2]);
    
    doc.roundedRect(
        STYLES.spacing.margin,
        startY - 0.2,
        STYLES.table.width,
        1.3,
        0.1,
        0.1,
        'F'
    );

    const primary = STYLES.colors.primary;
    doc.setFontSize(STYLES.fonts.subHeader.size);
    doc.setTextColor(primary[0], primary[1], primary[2]);
    doc.setFont('helvetica', STYLES.fonts.subHeader.style);

    const clientInfo = [
        { icon: ICONS.REF, label: 'Référence', value: item.ref },
        { icon: ICONS.CLIENT, label: 'Client', value: item.last_name },
        { icon: ICONS.CONTACT, label: 'Contact', value: item.contact },
        { icon: ICONS.ADDRESS, label: 'Adresse', value: item.address }
    ];

    let y = startY;
    clientInfo.forEach(info => {
        doc.text(
            `${info.icon} ${info.label}: ${info.value}`,
            STYLES.spacing.margin + 0.2,
            y
        );
        y += STYLES.spacing.lineHeight;
    });
};

const formatPrice = (price: number): string => {
    // Formatter le nombre avec des espaces comme séparateurs de milliers
    const formattedNumber = price.toString().replace(/\B(?=(\d{3})+(?!\d))/g, " ");
    return `${formattedNumber} GNF`;
};

const truncateText = (text: string, maxLength: number): string => {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength - 3) + '...';
};

const drawOrderDetails = (doc: jsPDF, item: OrderData, startY: number) => {
    const secondary = STYLES.colors.secondary;
    doc.setFontSize(STYLES.fonts.section.size);
    doc.setTextColor(secondary[0], secondary[1], secondary[2]);
    doc.text(`${ICONS.PACKAGE} Détails de la commande:`, STYLES.spacing.margin, startY);

    const totalWidth = STYLES.table.width;
    const columnWidths = {
        no: totalWidth * 0.05,        // 5%
        image: totalWidth * 0.12,     // 12%
        article: totalWidth * 0.23,    // 23%
        quantity: totalWidth * 0.12,   // 12%
        unite: totalWidth * 0.13,     // 13%
        unitPrice: totalWidth * 0.17,  // 17%
        totalPrice: totalWidth * 0.18  // 18%
    };

    const orderTotal = item.orders.reduce((sum, order) =>
        sum + (order.quantity * order.item.price), 0
    );

    // Calculer la largeur approximative en caractères pour chaque colonne
    const charWidthEstimate = STYLES.fonts.normal.size / 3.5; // Estimation approximative
    const maxCharsInArticle = Math.floor((columnWidths.article * 72) / charWidthEstimate); // 72 points par pouce

    const tableConfig: UserOptions = {
        startY: startY + 0.3,
        margin: { left: STYLES.spacing.margin },
        head: [['N°', 'Image', 'Article', 'Quantité', 'Unité', 'Prix unit.', 'Total']],
        body: [
            ...item.orders.map((order, i) => {
                const totalPrice = order.quantity * order.item.price;
                const row: CellDef[] = [
                    { content: (i + 1).toString() },
                    { content: '', styles: { minCellHeight: 0.4 } },
                    {
                        content: truncateText(order.item.name, maxCharsInArticle),
                        title: order.item.name // Pour afficher le texte complet au survol
                    },
                    { content: order.quantity.toString() },
                    { content: get_full_unite(order.item.unite) },
                    { content: formatPrice(order.item.price) },
                    { content: formatPrice(totalPrice) }
                ];
                return row;
            }),
            [{
                content: 'Total',
                colSpan: 6,
                styles: {
                    fontStyle: 'bold',
                    halign: 'right'
                }
            }, {
                content: formatPrice(orderTotal),
                styles: {
                    fontStyle: 'bold'
                }
            }]
        ],
        styles: {
            fontSize: STYLES.fonts.normal.size,
            cellPadding: 0.1,
            lineColor: toColor(STYLES.colors.white),
            lineWidth: 0,
            overflow: 'hidden' // Empêcher le débordement du texte
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
                overflow: 'hidden'
            },
            3: { halign: 'center', cellWidth: columnWidths.quantity },
            4: { halign: 'center', cellWidth: columnWidths.unite },
            5: { halign: 'right', cellWidth: columnWidths.unitPrice },
            6: { halign: 'right', cellWidth: columnWidths.totalPrice }
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
};

const handleImageCell = (doc: jsPDF, data: any, item: OrderData) => {
    if (data.column.index === 1 && data.cell.section === 'body' && data.row.index < item.orders.length) {
        const order = item.orders[data.row.index];
        const imgData = order.item.image;

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
                doc.addImage(
                    imgData,
                    'PNG',
                    position.x,
                    position.y,
                    dimensions.width,
                    dimensions.height
                );
            } catch (error) {
                console.warn('Erreur de chargement de l\'image:', error);
            }
        }
    }
};

export { orderFormPdf };