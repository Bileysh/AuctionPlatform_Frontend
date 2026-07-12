import { useAuth0 } from "@auth0/auth0-react";
import { useQuery } from "@tanstack/react-query";
import { Link, Outlet } from "react-router-dom";
import { axiosClient } from "../api/axiosClient";
import { Button } from "@/components/ui/button";

interface UserProfile {
    id: string;
    userName: string;
    auth0Id: string;
    totalBalance: number;
    availableBalance: number;
}

export function Layout() {
 const { isAuthenticated, loginWithRedirect, logout, user, isLoading } = useAuth0();
  
 const {data: userProfile} = useQuery({
    queryKey: ['userProfile'],
    queryFn: async () => {
      const response = await axiosClient.get<UserProfile>('/Users/me');
      return response.data;
    },
    enabled: isAuthenticated
  });
 
 return (

    <div className="min-h-screen flex flex-col bg-gray-50 text-gray-900">
      <header className="bg-white shadow-sm sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <Link to="/" className="text-2xl font-black text-blue-600 tracking-tight hover:text-blue-700 transition">
            AuctionPlatform
          </Link>       
          <nav className="flex gap-8">
            <Link to="/" className="font-medium text-gray-600 hover:text-blue-600 transition">
              Головна
            </Link>
            <Link to="/auctions" className="font-medium text-gray-600 hover:text-blue-600 transition">
              Всі аукціони
            </Link>
          </nav>
          <div className="flex items-center border-l pl-8 border-gray-200">
            {isLoading ? (
              <span className="text-sm text-gray-500">Завантаження...</span>
            ) : isAuthenticated ? (
                <div className="flex items-center gap-4">
                      {userProfile && (
                        <div className="text-sm bg-gray-100 px-3 py-1.5 rounded-md font-medium text-gray-800 border border-gray-200">
                              Доступно: <span className="text-green-600 font-bold">{userProfile.availableBalance} ₴</span>
                        </div>
                      )}
                      <div className="flex items-center gap-2">
                        <img 
                          src={user?.picture} 
                          alt={user?.name} 
                          className="w-8 h-8 rounded-full border border-gray-200" 
                        />
                        <span className="text-sm font-medium text-gray-700">{user?.name}</span>
                  </div>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => logout({ logoutParams: { returnTo: window.location.origin } })}
                  >
                    Вийти
                  </Button>
                </div>
            ) : (
              <button 
                onClick={() => loginWithRedirect()}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-blue-700 transition"
              >
                Увійти
              </button>
            )}
          </div>

        </div>
      </header>
      
      <main className="flex-grow max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">
        <Outlet /> 
      </main>

      <footer className="bg-white border-t border-gray-200 py-6 mt-auto">
        <div className="max-w-7xl mx-auto px-4 text-center text-sm text-gray-500">
          © {new Date().getFullYear()} AuctionPlatform. Всі права захищені.
        </div>
      </footer>

    </div>
  );
}