import axios, { type AxiosResponse } from 'axios';
import { useAuthStore } from '@/stores/auth';

class ApiAxios {
  myDomain = '127.0.0.1:8000'

  /**
   * Initialisation
  */
  axiosInstance() {
    const {isAuthenticated , accessToken} = useAuthStore()

    if(isAuthenticated){// Connexion
      return axios.create({
        baseURL: (window.location.protocol  === 'https:' ? 'https' : 'http') + `://${this.myDomain}/api`,
          headers:{
            Authorization: `JWT ${accessToken}`
          }
      })
    }

    return axios.create({
      baseURL: (window.location.protocol  === 'https:' ? 'https' : 'http') + `://${this.myDomain}/api`,
    })
    
  }

  /**
   * Création d'une requête post
   * @param {String} url
   * @param {Object} data
  */
  addForm(url: string, data: any){
    return this.axiosInstance().post(url, data, {
      headers:{
        "Content-Type": "multipart/form-data",
        "X-CSRFToken"  : "{{ csrf_token }}"
      },
    })
  }

  /**
   * Création d'une requête post
   * @param {String} url
   * @param {Object} data
   * @param {Integer} id?
  */
  updateForm(url: string, data: any, id: any){
    return this.axiosInstance().put(url, data, {
      headers:{
        "Content-Type": "multipart/form-data",
        "X-CSRFToken"  : "{{ csrf_token }}"
      },
      params: { id },

    })
  }

  /**
   * Modification d'une requête partielle
   * @param {String} url
   * @param {Object} data
   * @param {Integer} id?
  */
  updatePartialForm(url: string, data: any, id: any){
    return this.axiosInstance().patch(url, data, {
      headers:{
        "Content-Type": "multipart/form-data",
        "X-CSRFToken"  : "{{ csrf_token }}"
      },
      params: {id},
    })
  }
  /**
   * Création d'une requête post
   * @param {String} url
   * @param {Object} data
  */
  add(url: string, data: any) {
    return this.axiosInstance().post(url, data)
  }

  /**
   * Exécute une réquête de selection par valeur d'un parametre
   * @param {String} url
   * @param {Integer} id?
   */
  find(url: string, id?: any){
    return this.axiosInstance().get(url, {
      params: {id}
    })
  }

  /**
   * Exécute une requête de mise à jour
   * @param {String} url
   * @param {Object} data
   * @param {Integer} id?
   */
  update(url: string, data: any, id: any){
    return this.axiosInstance().put(url, data, {
      params: {id}
    })
  }

  /**
   * Suppression d'une instance de donnée
   * @param {String} url
   * @param {Integer} id?
   */
  delete(url: string, id: any) {
    return this.axiosInstance().delete(url, {
      params: { id }
    });
  }
}

export default ApiAxios;
