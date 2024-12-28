import type jsPDF from "jspdf";
import { getCurrentMonth, currentMonth } from '@/services/utils';
import { useSettingStore } from '@/stores/rutStore/settings/settingStore';

const { getSignators, fetchSignators } = useSettingStore();
fetchSignators();

const signature = (doc: any, signators: any[]) => {
    // Default Y position if autoTable information is not available
    let finalY = doc.previousAutoTable
        ? doc.previousAutoTable.finalY + 0.25
        : doc.internal.pageSize.height - 3; // Fallback to near bottom of page

    // Configuration de la date
    const date = new Date().toLocaleDateString('fr-FR', {
        day: '2-digit',
        month: 'long',
        year: 'numeric'
    });

    // Dimensions de la page
    const pageWidth = doc.internal.pageSize.getWidth();
    const leftMargin = 0.5;
    const rightMargin = pageWidth - 0.5;

    // Largeur des conteneurs (environ 1/3 de la page pour chaque conteneur)
    const containerWidth = pageWidth / 3;

    // Positions des conteneurs
    const leftContainerX = leftMargin;
    const rightContainerX = rightMargin - containerWidth + 0.3;

    // Configuration du texte
    doc.setFontSize(12);

    // Date (alignée à droite)
    doc.text(`Conakry, ${date}`, rightMargin, finalY, { align: 'right' });

    // Ajuster la position Y après la date
    const dateFinalY = finalY + 0.30;

    // Conteneur gauche
    const leftContent: any[] = [];
    const rightContent: any[] = [];
    const centerContent: any[] = [];

    signators.forEach(element => {
        if (element.position === 'left') {
            leftContent.push([
                element.function_name,
                element.title,
                `${element.grade} ${element.first_name} ${element.last_name}`
            ]);
        } else if (element.position === 'right') {
            rightContent.push([
                element.function_name,
                element.title,
                `${element.grade} ${element.first_name} ${element.last_name}`
            ]);
        }
    });

   const drawCenteredText = (textArray: string[], x: number, startY: number, containerWidth: number) => {
    let counter = 0;
    let currentY = startY;
    
    textArray.forEach((text, index) => {
        const centerX = x + (containerWidth / 2);
        counter++;

        // Après le premier élément (titre du poste)
        if (counter === 1) {
            doc.text(text, centerX, currentY, { align: 'center' });
            currentY += 0.25; // Espace normal après le premier élément
        }
        // Pour le deuxième élément (fonction)
        else if (counter === 2) {
            doc.text(text, centerX, currentY, { align: 'center' });
            currentY += 1.5; // Grand espace avant le nom
        }
        // Pour le dernier élément (nom complet)
        else if (counter === 3) {
            doc.text(text, centerX, currentY, { align: 'center' });
            currentY += 0.25;
        }
    });
    
    return currentY;
};

    // Dessiner les conteneurs et leur contenu
    const leftFinalY = drawCenteredText(leftContent, leftContainerX, dateFinalY, containerWidth);
    const rightFinalY = drawCenteredText(rightContent, rightContainerX, dateFinalY, containerWidth);

    // Retourner la position Y finale (la plus grande des deux conteneurs)
    return Math.max(leftFinalY, rightFinalY);
};

export default signature;