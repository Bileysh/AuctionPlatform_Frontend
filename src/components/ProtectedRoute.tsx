import { useEffect, type ReactNode } from "react";
import { useAuth0 } from "@auth0/auth0-react";

export function ProtectedRoute({ children }: { children: ReactNode }) {
    const { isAuthenticated, isLoading, loginWithRedirect } = useAuth0();
    
    useEffect(() => {
        if (!isLoading && !isAuthenticated) loginWithRedirect();
    }, [isLoading, isAuthenticated, loginWithRedirect]);

    if (isLoading || !isAuthenticated) return null;
    return <>{children}</>;
}
