import type jsPDF from "jspdf";
import { getcurrentMoment, currentMoment, convertNumberToWords } from '@/services/utils';
import { useSettingStore } from '@/stores/rutStore/settings/settingStore';

const { getSignators, fetchSignators } = useSettingStore();

const signature = (doc: any, signators: any[], montant: number, amount :string, style: any) => {
    // Default Y position if autoTable information is not available
    let finalY = doc.previousAutoTable
        ? doc.previousAutoTable.finalY + 0.25
        : doc.internal.pageSize.height - 3;

    // Get page dimensions
    const pageWidth = doc.internal.pageSize.getWidth();
    const textWidth = pageWidth - (style * 3); // Reduce width to allow for centering
    const centerX = pageWidth / 2; // Calculate center of page

    // Function to wrap text and return array of lines
    const wrapText = (text: string, maxWidth: number): string[] => {
        const words = text.split(' ');
        const lines: string[] = [];
        let currentLine = words[0];

        for (let i = 1; i < words.length; i++) {
            const word = words[i];
            const width = doc.getStringUnitWidth(currentLine + ' ' + word) * doc.internal.getFontSize() / doc.internal.scaleFactor;
            
            if (width < maxWidth) {
                currentLine += ' ' + word;
            } else {
                lines.push(currentLine);
                currentLine = word;
            }
        }
        lines.push(currentLine);
        return lines;
    };

    // Store current font size
    const currentFontSize = doc.internal.getFontSize();
    
    // Set smaller font size for amount text (9 instead of default 11)
    doc.setFontSize(12);

    // Format the amount text
    const amountText = `Arrête ce montant à la somme de : ${convertNumberToWords(montant)} (${amount})`;
    const wrappedLines = wrapText(amountText, textWidth);

    if (montant) {
        
        // Draw each line of the wrapped text centered
        wrappedLines.forEach((line, index) => {
            doc.text(line, centerX, finalY + (index * 0.2), { align: 'center' });
        });
    }

    // Restore original font size
    doc.setFontSize(currentFontSize);

    // Update finalY to account for wrapped text
    finalY += (wrappedLines.length * 0.2);

    // Configuration de la date
    const date = new Date().toLocaleDateString('fr-FR', {
        day: '2-digit',
        month: 'long',
        year: 'numeric'
    });

    // Dimensions and margins
    const leftMargin = 0.5;
    const rightMargin = pageWidth - 0.9;
    const containerWidth = pageWidth / 3;
    const leftContainerX = leftMargin;
    const rightContainerX = rightMargin - containerWidth + 0.4;

    // Configuration du texte
    doc.setFontSize(11);

    // Date (alignée à droite)
    doc.text(`Conakry, ${date}`, rightMargin - 0.07, finalY, { align: 'right' });

    // Ajuster la position Y après la date
    const dateFinalY = finalY + 0.23;

    // Initialize empty arrays for content
    let leftContent: string[] = [];
    let rightContent: string[] = [];

    // Populate arrays based on signators data
    if (signators && signators.length > 0) {
        signators.forEach(element => {
            if (element.position === 'left') {
                leftContent = [
                    element.function_name,
                    element.title,
                    `${element.grade} ${element.first_name} ${element.last_name}`
                ];
            } else if (element.position === 'right') {
                rightContent = [
                    element.function_name,
                    element.title,
                    `${element.grade} ${element.first_name} ${element.last_name}`
                ];
            }
        });
    } else {
        leftContent = ["Fonction", "Titre", "Grade Prénom et Nom"];
        rightContent = ["Fonction", "Titre", "Grade Prénom et Nom"];
    }

    const drawCenteredText = (textArray: string[], x: number, startY: number, containerWidth: number) => {
        let counter = 0;
        let currentY = startY;

        textArray.forEach((text) => {
            const centerX = x + (containerWidth / 2 - 0.1);
            counter++;
            doc.text(text, centerX, currentY, { align: 'center' });
            if (counter === 1) {
                currentY += 1;
            } else {
                currentY += 0.25;
            }
        });
        return currentY;
    };

    // Draw containers and content
    const leftFinalY = drawCenteredText(leftContent, leftContainerX, dateFinalY, containerWidth);
    const rightFinalY = drawCenteredText(rightContent, rightContainerX, dateFinalY, containerWidth);

    return Math.max(leftFinalY, rightFinalY);
};

export default signature;