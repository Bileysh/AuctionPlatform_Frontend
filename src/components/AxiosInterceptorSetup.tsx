import { useAuth0 } from "@auth0/auth0-react";
import { useEffect } from "react";
import { axiosClient } from "../api/axiosClient";

export function AxiosInterceptorSetup() {
  const { getAccessTokenSilently, loginWithRedirect } = useAuth0();

  useEffect(() => {
    const requestInterceptor = axiosClient.interceptors.request.use(
      async (config) => {
        try {
          const token = await getAccessTokenSilently();
          
          if (token) {
            config.headers.Authorization = `Bearer ${token}`;
          }
        } catch(e){
          console.error('Error fetching access token: ', e);
        }
        return config;
      },
      (error) => {
        return Promise.reject(error);
      }
    );

    const responseInterceptor = axiosClient.interceptors.response.use(
      (response) => response,
      async (error) => {
        if (error.response && error.response.status === 401) {
          await loginWithRedirect({
            appState: {targetUrl: window.location.pathname}
          });
        }
        return Promise.reject(error);
      }
    );

    return () => {
      axiosClient.interceptors.request.eject(requestInterceptor);
      axiosClient.interceptors.response.eject(responseInterceptor);
    };
  }, [getAccessTokenSilently, loginWithRedirect]);

  return null; 
}