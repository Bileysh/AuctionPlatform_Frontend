import { useAuth0 } from "@auth0/auth0-react";
import { useEffect } from "react";
import { axiosClient } from "../api/axiosClient";

export function AxiosInterceptorSetup() {
  const { getAccessTokenSilently } = useAuth0();

  useEffect(() => {
    const requestInterceptor = axiosClient.interceptors.request.use(
      async (config) => {
        try {
          const token = await getAccessTokenSilently();
          
          if (token) {
            config.headers.Authorization = `Bearer ${token}`;
          }
        } catch {
          console.debug("User is not authenticated, sending request without token.");
        }
        return config;
      },
      (error) => {
        return Promise.reject(error);
      }
    );

    return () => {
      axiosClient.interceptors.request.eject(requestInterceptor);
    };
  }, [getAccessTokenSilently]);

  return null; 
}