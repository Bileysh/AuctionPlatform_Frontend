import { BrowserRouter, Routes, Route } from "react-router-dom";
import {Layout} from "./components/Layout";
import { HomePage } from "./pages/HomePage";
import { AuctionsPage } from "./pages/AuctionsPage";
import { AuctionDetailsPage } from "./pages/AuctionDetailsPage";
import { AxiosInterceptorSetup } from './components/AxiosInterceptorSetup';
import CreateAuctionPage from './pages/CreateAuctionPage';
import { ProfilePage } from "./pages/ProfilePage";
import { ProtectedRoute } from "./components/ProtectedRoute";

function App(){
  return(
    <BrowserRouter>     
        <AxiosInterceptorSetup />   
        <Routes>
          <Route path="/" element={<Layout />}>
            <Route index element={<HomePage />} />
            <Route path="auctions" element={<AuctionsPage />} />
            <Route path="auctions/:id" element={<AuctionDetailsPage />} />
            <Route path="/auctions/create" element={<ProtectedRoute><CreateAuctionPage /></ProtectedRoute>} />
            <Route path="/profile" element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} /></Route>
        </Routes>
    </BrowserRouter>
  );
}
  
export default App