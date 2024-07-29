import jsPDF from 'jspdf';
import 'jspdf-autotable';
import autoTable from 'jspdf-autotable';

import {  get_full_unite } from '@/services/utils';
import headerPortrait from './includes/headerPortrait';
import footerPortrait from './includes/footerPortrait';
import signature from './includes/signature';



const orderFormPdf = async (heading: string, data: any []) => {

    const doc = new jsPDF({
        unit: 'in',
        format: 'a4'
    });

    data.forEach((item: { ref: any; last_name: any; contact: any; created_at: any; modified_at: any; address: any; orders: any[]; }, index: number) => {
        if (index > 0) {
            doc.addPage();
        }
        
        //Entête du page
        headerPortrait(doc, "Bon de Commande");
        //Pie du page
        footerPortrait(doc, data, index + 1, data.length);


        //Contenu de page

        let yCoord = 2.5; // Initial y coordinate after header
        doc.setFontSize(12);
        doc.text(`Reference: ${item.ref}`, 1, yCoord);
        yCoord += 0.30; // Adjust the increment to fit your layout

        doc.text(`Nom du destinateur: ${item.last_name}`, 1, yCoord);
        yCoord += 0.30;

        doc.text(`Contact: ${item.contact}`, 1, yCoord);
        yCoord += 0.30;

        doc.text(`Adresse: ${item.address}`, 1, yCoord);
        yCoord += 0.50;

        doc.setFontSize(14);
        doc.text(`Fourniture(s) :`, 1, yCoord);
        yCoord += 0.30;

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
                fontSize: 12 // Increase the font size as needed,
                
            },
            // theme: "plain",

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
            },
            
        })

        // const imgSrc = '../../../public/assets/apps/armoirie-guinée-1024x513.png';
        // const imgWidth = 12; // Width of the image in units
        // const imgHeight = 5; // Height of the image in units

        // const pageWidth = doc.internal.pageSize.getWidth();
        // const imgX = (pageWidth - imgWidth) / 2; // Calculate the x position to center the image

        // // Create a canvas to draw the image with reduced opacity
        // const canvas = document.createElement('canvas');
        // const ctx = canvas.getContext('2d') 
        // const img = new Image();

        // img.onload = function() {
        //     // Set canvas dimensions to match the image
        //     canvas.width = img.width;
        //     canvas.height = img.height;

        //     // Draw the image on the canvas with reduced opacity
        //     ctx.globalAlpha = 0.05; // Set the opacity (0.05 = 5% opacity)
        //     ctx.drawImage(img, 0, 0);

        //     // Convert the canvas to a data URL
        //     const imgData = canvas.toDataURL('image/png');

        //     // Add the image to the PDF
        //     doc.addImage(imgData, 'PNG', imgX, 4, imgWidth, imgHeight);

        //     // Save and open the PDF
        //     const blob = doc.output('blob');
        //     const url = URL.createObjectURL(blob);
        //     window.open(url);
        // };

        // img.src = imgSrc;

        //Section de la signature
        signature(doc);

 
    });

    // Save and open the PDF
    const blob = doc.output('blob');
    const url = URL.createObjectURL(blob);
    window.open(url);

    // doc.save(`${heading}.pdf`);
};


export { orderFormPdf }