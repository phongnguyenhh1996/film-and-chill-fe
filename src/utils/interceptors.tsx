import Axios from 'axios';

// axios config setup
const apiConfig = {
    baseURL: "https://film-and-chill.herokuapp.com/",
    headers: {
        'Access-Control-Allow-Origin': '*'
    }
};
const protectedApiConfig = {};

// axios initilize with config provided
export const API = Axios.create(apiConfig);
export const protectedAPI = Axios.create(protectedApiConfig);

// protected api interceptor
protectedAPI.interceptors.request.use((reqConfig) => {
    // request configuration can be set here to set on all protecter api's
    return reqConfig;
});

protectedAPI.interceptors.response.use((resConfig) => {
    // All protectedApi response will be passed through here
    return resConfig;
});