import axios from 'axios';
import type { AxiosRequestConfig, AxiosResponse } from 'axios';

import { useAuthStore } from '@/stores/auth';

const myDomain = '127.0.0.1:8000'

type RequestMethod = 'GET' | 'POST' | 'PUT' | 'DELETE';

interface RequestOptions extends AxiosRequestConfig {
    headers: any;
}

export const fetchWrapper = {
    add:  request('POST'),
    find: request('GET'),
    update: request('PUT'),
    delete: request('DELETE'),
    addForm: requestForm('POST'),
    updateForm: requestForm('PUT')
};


function axiosInstance() {
    const { accessToken , isAuthenticated } = useAuthStore()
    
    if (isAuthenticated) {
        return axios.create({
            baseURL: (window.location.protocol === 'https:' ? 'https' : 'http') + `://${myDomain}/api`,
            headers:{
                Authorization: `JWT ${accessToken}`
            }
        })      
    } 

    return axios.create({
        baseURL: (window.location.protocol === 'https:' ? 'https' : 'http') + `://${myDomain}/api`
    })

}
  

function request(method: RequestMethod) {
    return async (url: string, body?: any) => {
        const { user } = useAuthStore();
        const isLoggedIn = !!user?.token;
        const isApiUrl = url.startsWith(import.meta.env.VITE_API_URL);
       

        const headers: any = {};
        if (isLoggedIn && isApiUrl) {
            headers['Authorization'] = `JWT ${user.token}`;
        }

        const axiosConfig: RequestOptions = {
            method,
            headers,
            url
        };

        if (body) {
            axiosConfig.headers['Content-Type'] = 'application/json';
            axiosConfig['data'] = body;
        }

        try {
            const response: AxiosResponse = await axios(axiosConfig);
            return handleResponse(response);
        } catch (error) {
            if (axios.isAxiosError(error)) {
                const { user, logout } = useAuthStore();
                if ([401, 403].includes(error.response?.status || 0) && user) {
                    logout();
                }
                const errorMessage =
                    (error.response?.data && error.response.data.message) || error.message;
                return Promise.reject(errorMessage);
            } else {
                return Promise.reject('Error with the request');
            }
        }
    };
}

function requestForm(method: RequestMethod) {
    return async (url: string, body?: any) => {
        const { user } = useAuthStore();
        const isLoggedIn = !!user?.token;
        const isApiUrl = url.startsWith(import.meta.env.VITE_API_URL);

        const headers: any = {};
        if (isLoggedIn && isApiUrl) {
            headers['Authorization'] = `JWT ${user.token}`;
        }

        const axiosConfig: RequestOptions = {
            method,
            headers,
            url
        };

        if (body) {
            axiosConfig.headers['Content-Type'] = 'multipart/form-data';
            axiosConfig.headers['X-CSRFToken'] = '{{ csrf_token }}';
            axiosConfig['data'] = body;
        }

        try {
            const response: AxiosResponse = await axios(axiosConfig);
            return handleResponse(response);
        } catch (error) {
            if (axios.isAxiosError(error)) {
                const { user, logout } = useAuthStore();
                if ([401, 403].includes(error.response?.status || 0) && user) {
                    logout();
                }
                const errorMessage = (error.response?.data && error.response.data.message) || error.message;
                return Promise.reject(errorMessage);
            } else {
                return Promise.reject('Error with the request');
            }
        }
    };
}

function handleResponse(response: AxiosResponse) {
    const data = response.data;

    if (!response.status.toString().startsWith('2')) {
        const { user, logout } = useAuthStore();
        if ([401, 403].includes(response.status) && user) {
            logout();
        }

        const error = (data && data.message) || response.statusText;
        return Promise.reject(error);
    }

    return data;
}
