import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';

import { truncateText, get_full_unite } from '@/services/utils';
import headerPortrait from './includes/headerPortrait';
import footerPortrait from './includes/footerPortrait';



const orderFormPdf = async (heading: string, data: any []) => {

    const doc = new jsPDF({
        unit: 'in',
        format: 'a4'
    });

    data.forEach((item: { ref: any; last_name: any; contact: any; created_at: any; modified_at: any; orders: any[]; }, index: number) => {
        if (index > 0) {
            doc.addPage();
        }
        
        //Entête du page
        headerPortrait(doc);
        //Pie du page
        footerPortrait(doc, data, index + 1, data.length);

        //Contenu de page

        let yCoord = 2.75; // Initial y coordinate after header
        doc.setFontSize(12);
        doc.text(`Reference: ${item.ref}`, 1, yCoord);
        yCoord += 0.5; // Adjust the increment to fit your layout

        doc.text(`Nom du destinateur: ${item.last_name}`, 1, yCoord);
        yCoord += 0.5;

        doc.text(`Contact: ${item.contact}`, 1, yCoord);
        yCoord += 0.5;

        doc.text(`Crée le: ${item.created_at}`, 1, yCoord);
        yCoord += 0.5;

        doc.text(`Modifiée le: ${item.modified_at}`, 1, yCoord);
        yCoord += 0.5;


       
        
        yCoord += 0.5;

        const body = item.orders.map((value: { item: { name: any; unite: any; }; quantity: any; }, i: number) => {
            return [
                i + 1,
                {
                    content: '',
                    styles: {
                        cellWidth: 1,
                        cellHeight: 0.5
                    }
                },
                value.item.name,
                value.quantity,
                get_full_unite(value.item.unite),
            ];
        });

        autoTable(doc, {
            startY: yCoord, // Start the table below the text
            head: [['N°', 'Image', 'Article', 'Quantité', 'Unité', 'Obs']],
            body: body,
            styles: {
                fontSize: 14 // Increase the font size as needed
            },
            didDrawCell: function(data) {
                if (data.column.index === 1 && data.cell.section === 'body') {
                    const value = item.orders[data.row.index];
                    const imgData = value.item.image;

                    if (imgData) {
                        const padding = 0.1;
                        const cellHeight = data.cell.height - padding * 2;
                        const cellWidth = data.cell.width - padding * 2;
                        let imgWidth = cellWidth;
                        let imgHeight = cellHeight;

                        // Calculate x and y to center the image in the cell
                        const xOffset = (data.cell.width - imgWidth) / 2;
                        const yOffset = (data.cell.height - imgHeight) / 2;

                        doc.addImage(imgData, 'PNG', data.cell.x + xOffset, data.cell.y + yOffset, imgWidth, imgHeight);
                    }
                }
            }
        });
 
    });

    // Save and open the PDF
    const blob = doc.output('blob');
    const url = URL.createObjectURL(blob);
    window.open(url);

    // doc.save(`${heading}.pdf`);
};


export { orderFormPdf }