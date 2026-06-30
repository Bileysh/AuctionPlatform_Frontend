import { useEffect, useState, useCallback } from "react";
import { axiosClient } from "../api/axiosClient";
import { useParams, Link } from "react-router-dom";
import type { Auction } from '../types/auction';
import { useAuth0 } from '@auth0/auth0-react';

export function AuctionDetailsPage() {
    const { id } = useParams<{id: string}>();
    const [auction, setAuction] = useState<Auction | null>(null);
    const [isLoading, setIsLoading] = useState<boolean>(true);
    
    const [pageError, setPageError] = useState<string | null>(null);
    const [bidError, setBidError] = useState<string | null>(null);
    
    const { isAuthenticated, loginWithRedirect } = useAuth0();
    const [bidAmount, setBidAmount] = useState('');

    const fetchAuctionDetails = useCallback(async () => {
        try {
            const response = await axiosClient.get<Auction>(`/Auctions/${id}`);
            setAuction(response.data);
        } catch (err) {
            console.error('Помилка при завантаженні деталей аукціону:', err);
            setPageError('Не вдалося завантажити деталі аукціону. Спробуйте пізніше.');
        } finally {
            setIsLoading(false);
        }   
    }, [id]);

    useEffect(() => {
        if (id) {
            (async () => {
                await fetchAuctionDetails();
            })();
        }
    }, [fetchAuctionDetails, id]);

    const handlePlaceBid = async () => {
        if (!isAuthenticated) {
            loginWithRedirect();
            return;
        }
        
        if (!bidAmount || parseFloat(bidAmount) <= (auction?.currentPrice || 0)) {
            setBidError('Сума ставки має бути більшою за поточну ціну.');
            return;
        }

        try {
            setBidError(null); 
            
            await axiosClient.post(`/Auctions/${id}/bid`, { 
                amount: parseFloat(bidAmount) 
            });
            
            alert('Ставка успішно зроблена!');
            setBidAmount(''); 
            fetchAuctionDetails(); 
            
       } catch (err: unknown) {
            if (typeof err === 'object' && err !== null && 'response' in err) {
                const response = err as { response?: { data?: { detail?: string; Detail?: string } } };
                const responseData = response.response?.data;
                
                const errorMessage = responseData?.detail || responseData?.Detail;
                
                if (errorMessage) {
                    setBidError(errorMessage);
                } else {
                    setBidError('Сталася помилка при відправці ставки. (Перевір Network в F12)');
                }
            } else {
                setBidError('Сталася помилка при відправці ставки.');
            }
        }
    };

    if (isLoading) return <div className="text-gray-500">Завантаження деталей...</div>;
    if (pageError || !auction) return <div className="text-red-500">{pageError}</div>;
    
    return (
    <div className="max-w-3xl mx-auto bg-white p-8 rounded-xl shadow-sm border border-gray-100">
        <Link to="/auctions" className="text-blue-600 hover:underline mb-6 inline-block">
            &larr; Назад до списку
        </Link>
        
        <h2 className="text-3xl font-bold text-gray-900 mb-4">{auction.title}</h2>
        
        <div className="bg-gray-50 p-6 rounded-lg mb-6">
            <p className="text-gray-600 text-lg mb-2">
                Поточна ціна: <span className="text-3xl font-bold text-green-600">{auction.currentPrice} ₴</span>
            </p>
            <p className="text-gray-500">
                Завершується: {new Date(auction.endsAt).toLocaleString('uk-UA')}
            </p>
        </div>

        <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="bid">
                Ваша ставка
            </label>
            <input 
                id="bid"
                type="number" 
                value={bidAmount}
                onChange={(e) => setBidAmount(e.target.value)}
                placeholder={`Більше ніж ${auction.currentPrice}`}
                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
            />
        </div>

        {bidError && <div className="text-red-500 mb-4 font-medium">{bidError}</div>}

        <button 
            onClick={handlePlaceBid}
            className="w-full bg-blue-600 text-white text-lg font-semibold py-4 rounded-lg hover:bg-blue-700 transition"
        >
            {isAuthenticated ? 'Підтвердити ставку' : 'Увійти, щоб зробити ставку'}
        </button>
    </div>
  );
}