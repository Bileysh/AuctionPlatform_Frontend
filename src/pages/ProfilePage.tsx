import { useState } from 'react';
import { useMyAuctions, useMyBids } from '../hooks/useProfile';
import { Link } from 'react-router-dom';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export function ProfilePage() {
    const [myAuctionsPage, setMyAuctionsPage] = useState(1);
    const [myBidsPage, setMyBidsPage] = useState(1);

    const { data: myAuctionsData, isLoading: loadingAuctions } = useMyAuctions(myAuctionsPage);
    const { data: myBidsData, isLoading: loadingBids } = useMyBids(myBidsPage);

    return (
        <div className="max-w-4xl mx-auto p-6 mt-8 bg-white rounded-xl shadow-sm border border-gray-100">
            <h1 className="text-3xl font-bold mb-8">Особистий кабінет</h1>

            <Tabs defaultValue="bids" className="w-full">
                <TabsList className="grid w-full grid-cols-2 mb-8">
                    <TabsTrigger value="bids">Мої ставки</TabsTrigger>
                    <TabsTrigger value="auctions">Мої лоти</TabsTrigger>
                </TabsList>

                <TabsContent value="bids">
                    {loadingBids ? (
                        <p>Завантаження...</p>
                    ) : myBidsData?.items.length === 0 && myBidsPage === 1 ? (
                        <div className="text-center p-8 text-gray-500 bg-gray-50 rounded-lg">
                            Ви ще не робили ставок. <Link to="/auctions" className="text-blue-600 underline">Знайти цікаві лоти</Link>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {myBidsData?.items.map((auction) => (
                                <div key={auction.id} className="p-4 border border-gray-200 rounded-lg flex justify-between items-center hover:bg-gray-50">
                                    <div>
                                        <Link to={`/auctions/${auction.id}`} className="text-xl font-semibold text-blue-600 hover:underline">
                                            {auction.title}
                                        </Link>
                                        <p className="text-sm text-gray-500 mt-1">
                                            Поточна ціна: <span className="font-medium text-gray-900">{auction.currentPrice} ₴</span> | 
                                            Завершується: {new Date(auction.endsAt).toLocaleString('uk-UA')}
                                        </p>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-sm text-gray-500">Ваша найвища ставка</p>
                                        <p className="text-lg font-bold text-green-600">{auction.myHighestBid} ₴</p>
                                    </div>
                                </div>
                            ))}
                            
                            {myBidsData?.items && myBidsData.items.length > 0 && (
                                <div className="flex justify-between items-center mt-6 pt-4 border-t border-gray-100">
                                    <button 
                                        disabled={myBidsPage === 1} 
                                        onClick={() => setMyBidsPage(p => p - 1)}
                                        className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        Попередня
                                    </button>
                                    <span className="text-sm text-gray-500">Сторінка {myBidsPage}</span>
                                    <button 
                                        // Якщо бекенд повертає hasNextPage або totalPages, краще використовувати їх тут. 
                                        // Поки що просто перевіряємо, чи є елементи на поточній сторінці.
                                        disabled={myBidsData.items.length === 0} 
                                        onClick={() => setMyBidsPage(p => p + 1)}
                                        className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        Наступна
                                    </button>
                                </div>
                            )}
                        </div>
                    )}
                </TabsContent>

                <TabsContent value="auctions">
                    {loadingAuctions ? (
                        <p>Завантаження...</p>
                    ) : myAuctionsData?.items.length === 0 && myAuctionsPage === 1 ? (
                        <div className="text-center p-8 text-gray-500 bg-gray-50 rounded-lg">
                            Ви ще не створили жодного лота. <Link to="/auctions/create" className="text-blue-600 underline">Створити зараз</Link>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {myAuctionsData?.items.map((auction) => (
                                <div key={auction.id} className="p-4 border border-gray-200 rounded-lg flex justify-between items-center hover:bg-gray-50">
                                    <div>
                                        <Link to={`/auctions/${auction.id}`} className="text-xl font-semibold text-blue-600 hover:underline">
                                            {auction.title}
                                        </Link>
                                        <p className="text-sm text-gray-500 mt-1">
                                            Поточна ціна: <span className="font-medium text-gray-900">{auction.currentPrice} ₴</span>
                                        </p>
                                    </div>
                                    <div className="text-right">
                                        <span className={`px-3 py-1 text-sm font-medium rounded-full ${
                                            new Date(auction.endsAt) < new Date() ? 'bg-gray-200 text-gray-700' : 'bg-green-100 text-green-800'
                                        }`}>
                                            {new Date(auction.endsAt) < new Date() ? 'Завершено' : 'Активний'}
                                        </span>
                                    </div>
                                </div>
                            ))}

                            {/* 3. Додано кнопки пагінації для лотів */}
                            {myAuctionsData?.items && myAuctionsData.items.length > 0 && (
                                <div className="flex justify-between items-center mt-6 pt-4 border-t border-gray-100">
                                    <button 
                                        disabled={myAuctionsPage === 1} 
                                        onClick={() => setMyAuctionsPage(p => p - 1)}
                                        className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        Попередня
                                    </button>
                                    <span className="text-sm text-gray-500">Сторінка {myAuctionsPage}</span>
                                    <button 
                                        disabled={myAuctionsData.items.length === 0} 
                                        onClick={() => setMyAuctionsPage(p => p + 1)}
                                        className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        Наступна
                                    </button>
                                </div>
                            )}
                        </div>
                    )}
                </TabsContent>
            </Tabs>
        </div>
    );
}