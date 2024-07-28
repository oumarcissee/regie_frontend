import type jsPDF from "jspdf";

const headerPortrait = (doc: jsPDF) => {
        const pageWidth = doc.internal.pageSize.width;

        doc.setFontSize(10);
        doc.text("République de Guinée", pageWidth - 0.5, 0.5, { align: 'right' }); // Texte aligné à droite

        doc.setFontSize(10);
        doc.setTextColor(255, 0, 0); // Rouge
        doc.text("Travail", pageWidth - 1.5, 0.75, { align: 'right' }); // Texte aligné à droite
        
        const travailWidth = doc.getTextWidth("Travail-");
        doc.setTextColor(255, 255, 0); // Jaune
        doc.text("Justice", pageWidth - 1.4 + travailWidth, 0.75, { align: 'right' }); // Texte aligné à droite
        
        const justiceWidth = doc.getTextWidth("Justice- ");
        doc.setTextColor(0, 255, 0); // Vert
        doc.text("Solidarité", pageWidth - 1.3 + travailWidth + justiceWidth, 0.75, { align: 'right' }); // Texte aligné à droite

        doc.setTextColor(0, 0, 0); // Noir
        doc.text("Ministère de la Défense Nationale", 0.5, 0.5); // Texte aligné à gauche
        
        doc.setFontSize(10);
        doc.text("Direction Générale de l'Intendance Militaire", 0.5, 0.75); // Texte aligné à gauche


        const img = '../../../public/assets/apps/armoirie-guinée-1024x513.png';
        const imgWidth = 1.75; // Largeur de l'image en unités
        const imgX = (pageWidth - imgWidth) / 2; // Calcul de la position x pour centrer l'image

        doc.addImage(img, "PNG", imgX , 0.3, imgWidth, 1); // Image centrée
    

        doc.setFontSize(10);
        doc.text("Régie des Unités Territoriales", 0.5, 1);

        doc.setFontSize(10);
        doc.text("No______/Régie UT/2024", 0.5, 1.25);

        doc.setFontSize(25);
        
        doc.text("Bon de Commande", pageWidth / 2, 2, { align: 'center' });
};

export default headerPortrait;

