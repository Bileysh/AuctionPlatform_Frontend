import {useEffect, useState} from "react";
import {axiosClient} from "../api/axiosClient";
import type { Auction, PaginatedList } from '../types/auction';
import { Link } from 'react-router-dom';

export function AuctionsPage(){
    const [auctions, setAuctions] = useState<Auction[]>([]);
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchAuctions = async () => {
            try {
                const response = await axiosClient.get<PaginatedList<Auction>>('/Auctions/active');
                setAuctions(response.data.items);
            } catch (err) {
                console.error('Помилка при завантаженні аукціонів:', err);
                setError('Не вдалося завантажити аукціони. Спробуйте пізніше.');
            } finally {
                setIsLoading(false);
            }
        };
    fetchAuctions();
    }, []);
    
    if (isLoading) {
        return <div className="p-8 text-xl font-bold text-gray-500">Завантаження аукціонів...</div>;
    }

    if (error) {
        return <div className="p-8 text-xl font-bold text-red-500">{error}</div>;
    }

    return (
        <div>
            <h2 className="text-3xl font-bold text-gray-800">Всі аукціони</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">  
                {auctions.map((auction) => (
                   <div key={auction.id} className="bg-white border rounded-xl p-5 shadow-sm hover:shadow-md transition-shadow">
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">{auction.title}</h3>
                    <p className="text-gray-600 mb-1">
                        Поточна ціна: <span className="font-bold text-green-600 text-lg">{auction.currentPrice} ₴</span>
                    </p>
                    <p className="text-sm text-gray-500">
                        Закінчується: {new Date(auction.endsAt).toLocaleString('uk-UA')}
                    </p>

                    <Link 
                        to={`/auctions/${auction.id}`} 
                        className="mt-4 block text-center w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition-colors"
                    >
                        Зробити ставку
                    </Link>
                </div>
            ))}
        </div>
        {auctions.length === 0 && (
            <div className="text-gray-500 text-lg">Наразі немає активних аукціонів.</div>
        )}
        </div>
    );

}