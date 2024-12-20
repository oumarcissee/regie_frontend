import { useAuthStore } from '@/stores/auth';
import type { AxiosError } from 'axios';
import ApiAxios from './ApiAxios';
import Swal from 'sweetalert2';
import { ref } from 'vue';
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


export {
  truncateText, formatSlug, isAxiosError,
  setItemSelected,getItemSelected, deleteItem,
  confirmButton, getCurrentUser, currentUser, getCurrentProduct, currentProduct, get_full_role, getCurrentMonth, currentMonth,
  get_full_unite, formatDate, signatorPosition
}
