import type jsPDF from "jspdf";

/**
 * Add a decorative header to the PDF document in portrait mode.
 * 
 * @param {jsPDF} doc The jsPDF document instance
 * @param {string} title The title of the document
 * @param {string} currentDate The current date to display
 */
const headerPortrait = (doc: jsPDF, title: string, currentDate: string) => {
    const pageWidth = doc.internal.pageSize.width;
    const pageHeight = doc.internal.pageSize.height;
    
    // Styles constants
    const styles = {
        primary: {
            fontSize: 11,
            r: 0,
            g: 0,
            b: 0
        },
        secondary: {
            fontSize: 10,
            r: 40,
            g: 40,
            b: 40
        },
        title: {
            fontSize: 20,
            r: 0,
            g: 51,
            b: 102
        },
        subtitle: {
            fontSize: 15,
            r: 0,
            g: 82,
            b: 164
        },
        headerBox: {
            fill: {
                r: 245,
                g: 247,
                b: 250
            },
            border: {
                r: 0,
                g: 82,
                b: 164
            },
            radius: 0.1
        }
    };

    // Add decorative header background
    doc.setFillColor(styles.headerBox.fill.r, styles.headerBox.fill.g, styles.headerBox.fill.b);
    doc.setDrawColor(styles.headerBox.border.r, styles.headerBox.border.g, styles.headerBox.border.b);
    doc.roundedRect(0.3, 0.2, pageWidth - 0.6, 2.1, styles.headerBox.radius, styles.headerBox.radius, 'F');
    doc.setLineWidth(0.01);
    doc.roundedRect(0.3, 0.2, pageWidth - 0.6, 2.1, styles.headerBox.radius, styles.headerBox.radius, 'S');

    // Top section with national information
    doc.setFontSize(styles.primary.fontSize);
    doc.setTextColor(styles.primary.r, styles.primary.g, styles.primary.b);
    doc.setFont('helvetica', 'bold');
    doc.text("République de Guinée", pageWidth - 0.5, 0.5, { align: 'right' });

    // National motto with colored text and better spacing
    let xPos = (pageWidth - 2) + 0.4;
    
    doc.setFontSize(10);
    // Travail in Red
    doc.setTextColor(204, 0, 0);
    doc.text("Travail", xPos, 0.75, { align: 'right' });
    const travailWidth = doc.getTextWidth("Travail - ");
    
    // Justice in Yellow
    doc.setTextColor(204, 163, 0);
    doc.text("Justice", xPos + travailWidth * 0.9, 0.75, { align: 'right' });
    const justiceWidth = doc.getTextWidth("Justice - ");
    
    // Solidarité in Green
    doc.setTextColor(0, 153, 0);
    doc.text("Solidarité", xPos + (travailWidth + justiceWidth) * 1, 0.75, { align: 'right' });

    // Ministry information
    doc.setTextColor(styles.primary.r, styles.primary.g, styles.primary.b);
    doc.setFont('helvetica', 'bold');
    doc.text("Ministère de la Défense Nationale", 0.5, 0.5);

    // Department information with enhanced typography
    doc.setFontSize(styles.secondary.fontSize);
    doc.setFont('helvetica', 'normal');
    doc.text("Direction Générale de l'Intendance Militaire", 0.5, 0.75);

    // Center emblem with enhanced positioning
    const img = '../../../public/assets/apps/armoirie-guinée-1024x513.png';
    const imgWidth = 1.75;
    const imgHeight = 1.1;
    const imgX = (pageWidth - imgWidth) / 2;
    
    // Add shadow effect for the image
    doc.setFillColor(200, 200, 200);
    doc.roundedRect(imgX + 0.05, 0.35, imgWidth, imgHeight, 0.1, 0.1, 'F');
    
    // Add the image
    doc.addImage(img, "PNG", imgX, 0.3, imgWidth, imgHeight);

    // Unit information with enhanced styling
    doc.setFontSize(styles.secondary.fontSize);
    doc.setFont('helvetica', 'bold');
    doc.text("Régie des Unités Territoriales", 0.5, 1);

    // Reference number with decorative line
    doc.setFont('helvetica', 'normal');
    const refText = "No______/Régie UT/2024";
    doc.text(refText, 0.5, 1.25);
    doc.setLineWidth(0.01);
    doc.line(0.5, 1.3, 0.5 + doc.getTextWidth(refText), 1.3);

    // Title section with enhanced styling
    doc.setFontSize(styles.title.fontSize);
    doc.setTextColor(styles.title.r, styles.title.g, styles.title.b);
    doc.setFont('helvetica', 'bold');
    
    // Add background highlight for title
    const titleWidth = doc.getTextWidth(title);
    doc.setFillColor(240, 242, 245);
    doc.roundedRect((pageWidth - titleWidth) / 2 - 0.2, 1.55, titleWidth + 0.4, 0.3, 0.05, 0.05, 'F');
    
    // Add title text
    doc.text(title, pageWidth / 2, 1.75, { align: 'center' });

    // Month display with enhanced styling
    doc.setFontSize(styles.subtitle.fontSize);
    doc.setTextColor(styles.subtitle.r, styles.subtitle.g, styles.subtitle.b);
    doc.text(currentDate, pageWidth / 2, 2, { align: 'center' });

    // Add decorative bottom border
    doc.setDrawColor(styles.headerBox.border.r, styles.headerBox.border.g, styles.headerBox.border.b);
    doc.setLineWidth(0.02);
    doc.line(0.5, 2.2, pageWidth - 0.5, 2.2);
};

export default headerPortrait;