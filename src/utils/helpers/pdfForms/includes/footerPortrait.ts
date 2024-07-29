import jsPDF from "jspdf";  

const footerPortrait = (doc: jsPDF, data: any,  pageNumber: number, totalPages: number) => {
    const pageWidth = doc.internal.pageSize.width;
    const pageHeight = doc.internal.pageSize.height;

     // Ajouter le texte "DOC CONFIDENTIEL"
   
    
    // Dessiner la ligne horizontale
    doc.setDrawColor(150); // Couleur gris clair pour le filigrane
    doc.setLineWidth(0.05); // Largeur de la ligne
    const lineYOffset = 0.5; // Adjust this value to move the line down
    doc.line(0.5, pageHeight - 1 + lineYOffset, pageWidth - 0.5, pageHeight - 1 + lineYOffset); // Ligne horizontale au début du pied de page

    const domain = window.location.hostname; // Capturer le domaine dynamiquement

    // Ajouter le texte "DGIM"
    
    // Obtenir la date et l'heure actuelles
    const now = new Date();
    const date = now.toLocaleDateString();
    const time = now.toLocaleTimeString();
    doc.setFontSize(10);
    doc.text(`${date} ${time}`, 0.2, pageHeight - 0.2, { align: 'left' });

    


    // Sauvegarder l'état graphique actuel
    doc.saveGraphicsState();

    // Définir l'opacité
    doc.setGState( doc.GState({ opacity: 0.05 }));

    // Ajouter le filigrane
    doc.setFontSize(150);
    doc.setTextColor(150); // Couleur claire pour le filigrane
    doc.text("DGIM", pageWidth / 1.5, pageHeight / 2, {
        align: 'center',
        angle: 45
    });

    // Restaurer l'état graphique d'origine
    doc.restoreGraphicsState();



    //Si c'est pas du tableau
    if (data.length > 1) {
        
        // Ajouter le texte de la page
        doc.setFontSize(10);
        doc.text(`Page ${pageNumber} sur ${totalPages}`, pageWidth / 2, pageHeight - 0.2, {
            align: 'center'
        });
    }

    // Ajouter le texte "DOC CONFIDENTIEL"
    doc.setFontSize(10);
    doc.text(`${domain}`, pageWidth - 0.2, pageHeight - 0.2, {
        align: 'right'
    });
};

export default footerPortrait;
