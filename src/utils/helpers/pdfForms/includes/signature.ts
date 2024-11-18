import type jsPDF from "jspdf";
import { getCurrentMonth , currentMonth} from '@/services/utils';

const signature = (doc: any) => {

  //Section de la signature
  let finalY = doc?.autoTable.previous.finalY + 0.25;

  const date = new Date().toLocaleDateString('fr-FR', {
    day: '2-digit',
    month: 'long',
    year: 'numeric'
  }); // Adjust locale as needed (e.g., 'en-US' for US format)
  const text = `Conakry, ${date}`;
  const textWidth = doc.getTextWidth(text);
  const pageWidth = doc.internal.pageSize.getWidth();
  doc.setFontSize(12);

  doc.text(text, pageWidth - 0.5, finalY, {
    align: 'right'
  });

  // doc.text("Vue", 1.2, finalY, {
  //   align: 'left'
  // });

  finalY += 0.25


  doc.text("Le DG l'intendance Militaire", pageWidth - 0.5, finalY ,{ align: 'right'}); // Adjust the x-coordinate to the right

  doc.text("Régisseur des unités territorials", 0.5, finalY, {
    align: 'left'
  });
  
  finalY += 1

  doc.text("Intendant Militaire", pageWidth - 0.8, finalY, {
    align: 'right'
  });

  doc.text("Chef Service Administratifs et Financiers", 0.5, finalY, {
    align: 'left'
  });

  finalY += 0.25

  doc.text("Colonel Gassime TRAORE", pageWidth - 0.5, finalY, {
    align: 'right'
  });

  doc.text("Colonel Younoussa MAGASSOUBA", 0.5, finalY, {
    align: 'left'
  });




}

export default signature;