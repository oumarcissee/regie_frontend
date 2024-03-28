import { useAuthStore } from '@/stores/auth';
import type { AxiosError } from 'axios';

import moment from 'moment';




// const appStore = useAppStore()

// /**
//  *Cette fonction permet d'effectuer une notification
//  * @param {String} title
//  * @param {String} text
//  * @param {String} type
//  * @param {String} url
//  */

// const flash = async (title: any, text: any, type: any) => {

//   if (appStore.isAuthenticated) {
//     appStore.notification.admin.title = title
//     appStore.notification.admin.text = text
//     appStore.notification.admin.type = type
//     appStore.notification.admin.state = true
//     setTimeout(() => {
//       appStore.notification.admin.state = false
//     }, 5000)

//   } else {
//     appStore.notification.main.title = title
//     appStore.notification.main.text = text
//     appStore.notification.main.type = type
//     appStore.notification.main.state = true
//     setTimeout(() => {
//       appStore.notification.main.state = false
//     }, 5000)
//   }

// }

/**
 *
 * @param {String} text
 * @param {Number} limit
 * @returns
 */

const truncateText = (text: string | any[], limit: number) => {
  if (text.length > limit) {
    let truncated = text.slice(0, limit);
    // Trouver l'index du dernier espace dans la partie tronquée du texte
    const lastSpaceIndex = truncated.lastIndexOf(' ');
    if (lastSpaceIndex !== -1) {
      // Tronquer jusqu'au dernier espace pour ne pas couper un mot
      truncated = truncated.slice(0, lastSpaceIndex);
    }
    return truncated + '...'; // Ajouter les points de suspension à la fin
  }
  return text;
};

/**
 *
 * @param {String} date
 * @param {String} type
 * @returns
 */
const formatDate = (customDate: moment.MomentInput, type: string = 'number') => {
  moment.locale('fr')

  if (type === 'number') {
    const formattedDate = moment(customDate).format('L')
    return formattedDate
  } else if (type === 'ago') {
    return moment(customDate, "YYYYMMDD").fromNow()
  }else {
    // const date = new Date(customDate);

    // const options = {
    //   weekday: "long",
    //   year: "numeric",
    //   month: "long",
    //   day: "numeric",
    //   hour: "2-digit",
    //   minute: "2-digit",
    // };
    // const formattedDate = date.toLocaleString("fr-FR", options);
    const formattedDate = moment(customDate).format('llll')
    return formattedDate

  }

};

const formatSlug = (chaine: string) => {
    // Convertir en minuscules
    chaine = chaine.toLowerCase();

    // Remplacer les caractères non alphanumériques par des tirets
    chaine = chaine.replace(/[^a-z0-9]+/g, '-');

    // Supprimer les tirets en début et fin de chaîne
    chaine = chaine.replace(/^-|-$/g, '');

    return chaine;
}


// const dateISOFormated = (dateISO8601: string | number | Date) => {

//   // Créer un objet Date à partir de la date ISO 8601
//   const dateObj = new Date(dateISO8601);

//   // Extraire l'année, le mois et le jour de l'objet Date
//   const year = dateObj.getFullYear();
//   const month = String(dateObj.getMonth() + 1).padStart(2, '0'); // Mois de 0 à 11, donc +1 et formaté sur 2 chiffres
//   const day = String(dateObj.getDate()).padStart(2, '0'); // Jour du mois, formaté sur 2 chiffres

//   // Former la date au format "yyyy-mm-dd"
//   const dateFormatted = `${year}-${month}-${day}`;

//   return dateFormatted

// }


// Fonction utilitaire pour vérifier si c'est une erreur Axios
function isAxiosError(error: any): error is AxiosError {
    return (error as AxiosError).isAxiosError !== undefined;
}



let selected: any;


function setItemSelected(item: any): void { 
  selected = item;
}

const getItemSelected = () => {
  return selected && selected
}


export {
  truncateText, formatDate, formatSlug, isAxiosError,
  setItemSelected,getItemSelected

}
