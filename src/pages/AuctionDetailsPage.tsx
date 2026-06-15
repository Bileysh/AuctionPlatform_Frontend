import {useEffect, useState} from "react";
import {axiosClient} from "../api/axiosClient";
import {useParams, Link} from "react-router-dom";
import type { Auction } from '../types/auction';

export function AuctionDetailsPage() {
    const {id} = useParams<{id: string}>();
    const [auction, setAuction] = useState<Auction | null>(null);
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchAuctionDetails = async () => {
            try {
                const response = await axiosClient.get<Auction>(`/Auctions/${id}`);
                setAuction(response.data);
            } catch (err) {
                console.error('Помилка при завантаженні деталей аукціону:', err);
                setError('Не вдалося завантажити деталі аукціону. Спробуйте пізніше.');
            } finally {
                setIsLoading(false);
            }   
        };
        
        if (id) {
            fetchAuctionDetails();
        }
    }, [id]);

    if (isLoading) return <div className="text-gray-500">Завантаження деталей...</div>;
    if (error || !auction) return <div className="text-red-500">{error}</div>;
    
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

      <button className="w-full bg-blue-600 text-white text-lg font-semibold py-4 rounded-lg hover:bg-blue-700 transition">
        Підтвердити ставку
      </button>
    </div>
  );
}