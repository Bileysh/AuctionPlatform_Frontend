import { useState, useEffect } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { axiosClient } from "../api/axiosClient";
import type { Auction, PaginatedList } from '../types/auction';
import { Link } from 'react-router-dom';
import { Button, buttonVariants } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { useSignalR } from '@/hooks/useSignalR';
import { useDebounce } from '@/hooks/useDebounce';

export function AuctionsPage() {
    const queryClient = useQueryClient();
    const [pageNumber, setPageNumber] = useState(1);
    const [searchTerm, setSearchTerm] = useState('');
    const debouncedSearch = useDebounce(searchTerm, 500);
    const pageSize = 9; 

    useEffect(() => {
        setPageNumber(1);
    }, [debouncedSearch]);

    const fetchAuctions = async (page: number, search: string): Promise<PaginatedList<Auction>> => {
        const response = await axiosClient.get<PaginatedList<Auction>>(`/Auctions/active`, {
            params: { 
                pageNumber: page, 
                pageSize,
                searchTerm: search || undefined 
            }
        });
        return response.data;
    };

    const { data, isLoading, isError } = useQuery({
        queryKey: ['auctions', 'active', pageNumber, debouncedSearch],
        queryFn: () => fetchAuctions(pageNumber, debouncedSearch),
        placeholderData: (previousData) => previousData,
    });

    const { connection, isConnected } = useSignalR(`${import.meta.env.VITE_API_URL}/hubs/auction`);

   useEffect(() => {
    if (!connection || !isConnected) return;

    connection.on("AuctionCreated", () => {
        queryClient.invalidateQueries({ queryKey: ['auctions', 'active'] });
    });

    connection.on("AuctionPriceUpdated", (auctionId: string, newPrice: number) => {
        queryClient.setQueriesData(
            { queryKey: ['auctions', 'active'] },
            (oldData: PaginatedList<Auction> | undefined) => {
                if (!oldData) return oldData;
                return {
                    ...oldData,
                    items: oldData.items.map(auction =>
                        auction.id === auctionId
                            ? { ...auction, currentPrice: newPrice }
                            : auction
                    )
                };
            }
        );
    });

    connection.on("AuctionClosed", (auctionId: string) => {
        console.log(`Auction ${auctionId} closed by background worker. Removing from UI...`);
                queryClient.setQueriesData(
            { queryKey: ['auctions', 'active'] },
            (oldData: PaginatedList<Auction> | undefined) => {
                if (!oldData) return oldData;
                return {
                    ...oldData,
                    items: oldData.items.filter(auction => auction.id !== auctionId)
                };
            }
        );
    });

    connection.invoke("JoinActiveAuctionsGroup").catch(console.error);

    return () => {
        connection.off("AuctionCreated");
        connection.off("AuctionPriceUpdated"); 
        connection.off("AuctionClosed");
        connection.invoke("LeaveActiveAuctionsGroup").catch(console.error);
        };
    }, [connection, isConnected, queryClient]);

    return (
        <div className="max-w-7xl mx-auto px-4 py-8">
            <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
                <h2 className="text-3xl font-bold text-gray-900">Всі аукціони</h2>
                
                <div className="w-full md:w-1/3">
                    <Input 
                        type="text" 
                        placeholder="Пошук аукціонів..." 
                        value={searchTerm}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchTerm(e.target.value)}                        
                        className="w-full"
                    />
                </div>
            </div>
            
            {isLoading && <div className="p-8 text-xl font-bold text-gray-500 text-center">Завантаження аукціонів...</div>}
            {isError && <div className="p-8 text-xl font-bold text-red-500 text-center">Не вдалося завантажити аукціони. Спробуйте пізніше.</div>}

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">  
                {data?.items?.map((auction) => (
                    <Card key={auction.id} className="flex flex-col justify-between hover:shadow-lg transition-shadow">
                        <CardHeader>
                            <CardTitle className="text-xl line-clamp-1" title={auction.title}>
                                {auction.title}
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-gray-600 mb-2">
                                Поточна ціна: <span className="font-bold text-green-600 text-2xl">{auction.currentPrice} ₴</span>
                            </p>
                            <p className="text-sm text-gray-500">
                                Закінчується: {new Date(auction.endsAt).toLocaleString('uk-UA')}
                            </p>
                        </CardContent>
                        <CardFooter>
                       <Link 
                            to={`/auctions/${auction.id}`} 
                            className={buttonVariants({ variant: "default", className: "w-full" })}
                        >
                            Зробити ставку
                        </Link>
                        </CardFooter>
                    </Card>
                ))}
            </div>

            {data?.items?.length === 0 && !isLoading && (
                <div className="text-gray-500 text-lg mt-10 text-center bg-gray-50 p-8 rounded-lg border border-dashed">
                    За вашим запитом нічого не знайдено.
                </div>
            )}

            {data && data.totalPages > 1 && (
                <div className="flex items-center justify-between mt-10 p-4 bg-white border rounded-lg shadow-sm">
                    <Button 
                        variant="outline"
                        onClick={() => setPageNumber(old => Math.max(old - 1, 1))}
                        disabled={!data.hasPreviousPage}
                    >
                        &larr; Попередня
                    </Button>
                    
                    <span className="font-medium text-gray-600 text-sm">
                        Сторінка {data.pageNumber} з {data.totalPages}
                    </span>
                    
                    <Button 
                        variant="outline"
                        onClick={() => setPageNumber(old => old + 1)}
                        disabled={!data.hasNextPage}
                    >
                        Наступна &rarr;
                    </Button>
                </div>
            )}
        </div>
    );
}