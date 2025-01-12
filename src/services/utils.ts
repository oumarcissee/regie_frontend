import { useAuthStore } from '@/stores/auth';
import type { AxiosError } from 'axios';
import ApiAxios from './ApiAxios';
import Swal from 'sweetalert2';
import { reactive, ref } from 'vue';
import { format } from 'date-fns';

import fr from 'date-fns/locale/fr';
const locale = fr; // or en, or es





/**
 *
 * @param {Date} date
 * @param {String} type
 * @returns Date
 * **/
const formatDate = (date: string | Date, type: string = '') => {
  if (type === 'chaine') {
    return date ? format(new Date(date), "dd,MMMM yyyy HH'h'mm", { locale }) : '-';
  } else {
    return date ? format(new Date(date), 'dd/MM/yyyy') : '-';
  }
};


/**
 *
 * @param {String} chaine
 * @returns String
 * **/

const signatorPosition = (chaine: string): string => {
    switch (chaine) {
        case 'left': return "GAUCHE";
        case 'right': return "DROITE";
        case 'center': return "CENTRE";
        default: return "RIEN";
    }
}


/**
 *
 * @param {String} text
 * @param {Number} limit
 * @returns
 */

const truncateText = (text: string | any, limit: number) => {
  if (text && text.length > limit) {
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


const formatSlug = (chaine: string) => {
    // Convertir en minuscules
    chaine = chaine.toLowerCase();

    // Remplacer les caractères non alphanumériques par des tirets
    chaine = chaine.replace(/[^a-z0-9]+/g, '-');

    // Supprimer les tirets en début et fin de chaîne
    chaine = chaine.replace(/^-|-$/g, '');

    return chaine;
}

// Fonction utilitaire pour vérifier si c'est une erreur Axios
function isAxiosError(error: any): error is AxiosError {
    return (error as AxiosError).isAxiosError !== undefined;
}

let selected: any;
let confirmButton = false;

function setItemSelected(item: any): void { 
  selected = item;
}

const getItemSelected = () => {
  return selected && selected
}

/**
 * @param  {String} item 
 * @param  {String} url 
 */
const deleteItem = async (item: any, url: string, data: Array<any> ) => {
    Swal.fire({
    title: "Êtes vous sûr ?",
    text: "Vous ne pourrez plus revenir en arrière!",
    icon: "warning",
    showCancelButton: true,
    cancelButtonText: "Annuler",
    confirmButtonColor: "#3085d6",
    cancelButtonColor: "#d33",
    confirmButtonText: "Oui, Je le supprime!"
    }).then(async (result) => {
    if (result.isConfirmed) {
        try {
            const response = await new ApiAxios().delete(`/${url}/${item.id}/`, item.id);
            Swal.fire({
                title: "Supprimé!",
                text: "Votre objet a bien été supprimé.",
                icon: "success"
            });
            //
            return data?.filter((user: any) => user.id !== item.id);
            
        } catch (error) {
            console.log(error);
            Swal.fire({
                title: "Erreur!",
                text: "Votre objet ne peut pas être supprimé.",
                icon: "warning"
            });
            return error;
        }
        
    }
        
    });
}


//Affichge des rôles des utilisateurs
const get_full_role = (role: string) => {

  switch (role) {
    case 'manager_a': return "Regisseur des Unités Territoriales";
    case 'manager_b': return "Regisseur des Centres de formations et OPEX";
    case 'admin': return "Administrateur";
    case 'user': return "Utilisateur";
    default: return "Unknown";
    
  }
}

//Affichge de type des produits
const get_full_unite = (unite: any): string => {
  switch (unite) {
    case 'cardboard':
        unite = 'Carton(s)'
        break;
    case 'can':
        unite = 'Bidon(s)'
        break;
    case 'bag':
        unite = 'Sac(s)'
        break;
    default:
        unite = 'Pas de type'
        break;
  }

  return unite;
}


const currentMonth = ref();

const getCurrentMonth = (value: string | any[]) => {
  currentMonth.value = value;
  return currentMonth;
}


const currentUser = ref();
const currentProduct = ref();

const getCurrentUser = (value: string | any[]) => {
  currentUser.value = value;
  return value
}

const getCurrentProduct = (value: string | any[]) => {
  currentProduct.value = value;
  return value;
}


// État pour les notifications avec la structure correcte
const notif = reactive({
  snackbar: { value: false },
  snackbarColor: { value: '' },
  snackbarMessage: ''  // String direct, pas un ref
});



// Gestion des notifications
const showNotification = (message: string, color: string = 'success') => {
    notif.snackbarMessage = message;
    notif.snackbarColor.value = color;
    notif.snackbar.value = true;
};


function convertNumberToWords(number: number) {
    // Constantes
    const units = ["", "un", "deux", "trois", "quatre", "cinq", "six", "sept", "huit", "neuf"];
    const teens = ["dix", "onze", "douze", "treize", "quatorze", "quinze", "seize", "dix-sept", "dix-huit", "dix-neuf"];
    const tens = ["", "dix", "vingt", "trente", "quarante", "cinquante", "soixante", "soixante", "quatre-vingt", "quatre-vingt"];

    // Cas particuliers
    if (number === 0) return "zéro GNF";
    if (isNaN(number)) return "Nombre invalide";

    // Fonction interne pour gérer les nombres < 1000
    function convertLessThanOneThousand(num: number) {
        let result = "";
        
        // Gestion des centaines
        const hundreds = Math.floor(num / 100);
        if (hundreds > 0) {
            result += (hundreds > 1 ? units[hundreds] + " " : "") + "cent" + (hundreds > 1 && num % 100 === 0 ? "s" : "") + " ";
            num = num % 100;
        }
        
        // Gestion des dizaines et unités
        if (num >= 80) {
            result += "quatre-vingt";
            num -= 80;
            if (num === 0) {
                result += "s";
            } else {
                result += "-" + convertLessThanOneThousand(num);
            }
        } else if (num >= 70) {
            result += "soixante";
            num -= 60;
            result += "-" + convertLessThanOneThousand(num);
        } else if (num >= 20) {
            const tenIndex = Math.floor(num / 10);
            result += tens[tenIndex];
            const unitsNum = num % 10;
            if (unitsNum > 0) {
                result += "-" + units[unitsNum];
            }
        } else if (num >= 10) {
            result += teens[num - 10];
        } else if (num > 0) {
            result += units[num];
        }
        
        return result.trim();
    }

    let result = "";
    
    // Gestion des mille milliards
    if (number >= 1000000000000) {
        const thousandBillions = Math.floor(number / 1000000000000);
        if (thousandBillions > 1) {
            result += convertLessThanOneThousand(thousandBillions) + " ";
        }
        result += "mille milliards ";
        number = number % 1000000000000;
    }
    
    // Gestion des milliards
    if (number >= 1000000000) {
        const billions = Math.floor(number / 1000000000);
        result += convertLessThanOneThousand(billions) + " milliard" + (billions > 1 ? "s" : "") + " ";
        number = number % 1000000000;
    }
    
    // Gestion des millions
    if (number >= 1000000) {
        const millions = Math.floor(number / 1000000);
        result += convertLessThanOneThousand(millions) + " million" + (millions > 1 ? "s" : "") + " ";
        number = number % 1000000;
    }
    
    // Gestion des milliers
    if (number >= 1000) {
        const thousands = Math.floor(number / 1000);
        if (thousands > 1) {
            result += convertLessThanOneThousand(thousands) + " ";
        }
        result += "mille ";
        number = number % 1000;
    }
    
    // Gestion du reste
    if (number > 0) {
        result += convertLessThanOneThousand(number);
    }
    
    return result.trim() + " GNF";
}

export {
  truncateText, formatSlug, isAxiosError,
  setItemSelected,getItemSelected, deleteItem,
  confirmButton, getCurrentUser, currentUser, getCurrentProduct, currentProduct, get_full_role, getCurrentMonth, currentMonth,
  get_full_unite, formatDate, signatorPosition,showNotification,notif,convertNumberToWords
}
