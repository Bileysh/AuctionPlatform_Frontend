import { BrowserRouter, Routes, Route } from "react-router-dom";
import {Layout} from "./components/Layout";
import { HomePage } from "./pages/HomePage";
import { AuctionsPage } from "./pages/AuctionsPage";
import { AuctionDetailsPage } from "./pages/AuctionDetailsPage";

function App(){
  return(
    <BrowserRouter>        
        <Routes>
          <Route path="/" element={<Layout />}>
            <Route index element={<HomePage />} />
            <Route path="auctions" element={<AuctionsPage />} />
            <Route path="auctions/:id" element={<AuctionDetailsPage />} />
          </Route>
        </Routes>
    </BrowserRouter>
  );
}
  
export default App