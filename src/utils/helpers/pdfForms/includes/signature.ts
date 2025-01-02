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
    const rightMargin = pageWidth - 0.9;

    // Largeur des conteneurs (environ 1/3 de la page pour chaque conteneur)
    const containerWidth = pageWidth / 3;

    // Positions des conteneurs
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
        // Fallback content if no signators provided
        leftContent = [
            "Fonction",
            "Titre",
            "Grade Prénom et Nom"
        ];
        
        rightContent = [
            "Fonction",
            "Titre",
            "Grade Prénom et Nom"
        ];
    }

    const drawCenteredText = (textArray: string[], x: number, startY: number, containerWidth: number) => {
    let counter = 0;
    let currentY = startY;
    
    textArray.forEach((text, index) => {
        const centerX = x + (containerWidth / 2 - 0.1);
        counter++;
        // Après le premier élément (titre du poste)
        doc.text(text, centerX, currentY, { align: 'center' });
        if (counter === 1) {
            currentY += 1; // Espace normal après le premier élément
        } else {
            currentY += 0.25; // Espace normal entre les éléments
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