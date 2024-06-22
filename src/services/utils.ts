import { useAuthStore } from '@/stores/auth';
import type { AxiosError } from 'axios';
import ApiAxios from './ApiAxios';
import Swal from 'sweetalert2';
import { ref } from 'vue';


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

const get_full_role = (role: string) => {

  let selected_role = role;
  switch (role) {
    case 'manager_a':
      selected_role = "Regisseur des Unités Territoriales";
      break;
    case 'manager_b':
      selected_role = "Regisseur des Centres de formations et OPEX";
      break;
    default:
      selected_role= "Autre role"
      break;
  }

  return selected_role;
}


//Cette fonctin qui affiche les données a travers les mois selectionés
const dateSelected = ref();

const dateChanged = (value: string | any[]) => {
  dateSelected.value = value;
  return dateSelected;
}


const itemChanged = ref();
const ProductChanged = ref();

const changed = (value: string | any[]) => {
  itemChanged.value = value;
  return value
}

const changedProduct = (value: string | any[]) => {
  ProductChanged.value = value;
  return value
}

export {
  truncateText, formatSlug, isAxiosError,
  setItemSelected,getItemSelected, deleteItem,
  confirmButton,changed, itemChanged,changedProduct, ProductChanged, get_full_role, dateChanged,dateSelected
}
