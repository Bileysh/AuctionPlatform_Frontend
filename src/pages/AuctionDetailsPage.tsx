/* eslint-disable @typescript-eslint/no-explicit-any */
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { axiosClient } from "../api/axiosClient";
import { useParams, Link } from "react-router-dom";
import type { Auction } from '../types/auction';
import { useAuth0 } from '@auth0/auth0-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import type { AxiosError } from 'axios';
import { Button, buttonVariants } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner"; 
import { useEffect } from 'react'; 
import { useSignalR } from '../hooks/useSignalR';

const bidSchema = z.object({
    amount: z.number({ 
        message: "Введіть коректну суму" 
    }).min(0.01, "Ставка має бути більшою за нуль")
});

type BidFormValues = z.infer<typeof bidSchema>

export function AuctionDetailsPage() {
    const { id } = useParams<{id: string}>();
    const queryClient = useQueryClient();
    const { isAuthenticated, loginWithRedirect } = useAuth0();
    const {
        register,
        handleSubmit,
        formState: {errors},
        reset,
        setError
    } = useForm<BidFormValues>({
        resolver: zodResolver(bidSchema),
    });

    const { connection, isConnected } = useSignalR(`${import.meta.env.VITE_API_URL}/hubs/auction`);

    useEffect(() => {
            if (!connection || !id || !isConnected) return;

            connection.invoke("JoinAuctionGroup", id)
                .then(() => console.log(`Joined auction group for auction ${id}`))
                .catch(err => console.error('Error joining auction group: ', err));

            connection.on("ReceiveNewBid", () => {
                queryClient.invalidateQueries({ queryKey: ['auction', id] });
            });

            connection.on("AuctionClosed", (closedAuctionId: string) => {
                if (closedAuctionId === id) {
                    console.log('Цей аукціон щойно завершився!');
                    queryClient.invalidateQueries({ queryKey: ['auction', id] });
                }
            });
            
            return () => {
                connection.invoke("LeaveAuctionGroup", id)
                    .then(() => console.log(`Left auction group for auction ${id}`))
                    .catch(err => console.error('Error leaving auction group: ', err));
                connection.off("ReceiveNewBid");
                connection.off("AuctionClosed");
            };
    }, [connection, id, isConnected, queryClient]);


    const { data: auction, isLoading, isError: isPageError } = useQuery({
        queryKey: ['auction', id],
        queryFn: async() =>{
            const response = await axiosClient.get<Auction>(`/Auctions/${id}`);
            return response.data;
        },
        enabled: !!id
    });

    const getBackendErrorMessage = (err: AxiosError<{ detail?: string; Detail?: string }>) => {
        const data = err?.response?.data;
        return data?.detail || data?.Detail || 'Сталася помилка при відправці ставки.';
    };

    const placeBidMutation = useMutation({
        mutationFn: async (amount: number) =>{
            await axiosClient.post(`/Auctions/${id}/bid`, {amount});
        },
        retry: (failureCount, error: any) => {
            const status = error.response?.status;
            if ((status === 409 || status === 429) && failureCount < 3) {
                return true; 
            }
            return false;
        },
        retryDelay: (attemptIndex) => {
            return Math.min(500 * (2 ** attemptIndex), 30000); 
        },
        onSuccess: () => {
            toast.success('Ставка успішно зроблена!'); 
            reset();
            queryClient.invalidateQueries({queryKey: ['auction', id]});
            queryClient.invalidateQueries({queryKey: ['userProfile']});
        },
        onError: (error: any) => {
            const status = error.response?.status;
            if (status === 409) {
                toast.error("Хтось щойно перебив вашу ставку! Оновіть сторінку та спробуйте ще раз.");
            } else if (status === 429) {
                toast.error("Ви робите ставки занадто швидко. Зачекайте пару секунд.");
            } else {
                toast.error(getBackendErrorMessage(error));
            }
        }
    });

    const onSubmit = (data: BidFormValues) => {
        if (!isAuthenticated) {
            loginWithRedirect();
            return;
        }

        if (auction && data.amount <= auction.currentPrice) {
            setError("amount", { 
                type: "manual", 
                message: "Сума ставки має бути більшою за поточну ціну." 
            });
            return;
        }

        placeBidMutation.mutate(data.amount);
    };

    if (isLoading) return <div className="text-gray-500 p-8 text-xl text-center font-medium">Завантаження деталей...</div>;
    if (isPageError || !auction) return <div className="text-red-500 p-8 text-xl text-center font-medium">Не вдалося завантажити деталі аукціону.</div>;
    
    return (
        <div className="max-w-3xl mx-auto bg-white p-8 rounded-xl shadow-sm border border-gray-100 my-8">
            <Link to="/auctions" className={buttonVariants({ variant: "link", className: "mb-6 pl-0" })}>
                &larr; Назад до списку
            </Link>
            
            <h2 className="text-3xl font-bold text-gray-900 mb-4">{auction.title}</h2>
            
            <div className="bg-gray-50 p-6 rounded-lg mb-6 border border-gray-100">
                <p className="text-gray-600 text-lg mb-2">
                    Поточна ціна: <span className="text-3xl font-bold text-green-600">{auction.currentPrice} ₴</span>
                </p>
                <p className="text-gray-500">
                    Завершується: {new Date(auction.endsAt).toLocaleString('uk-UA')}
                </p>
            </div>
            
            {auction.status === 'Active' ? (
                <form onSubmit={handleSubmit(onSubmit)} className="mb-4">
                    <div className="mb-4">
                        <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="bid">
                            Ваша ставка
                        </label>
                        <Input 
                            id="bid"
                            type="number" 
                            step="0.01" 
                            {...register("amount", { valueAsNumber: true })}
                            placeholder={`Більше ніж ${auction.currentPrice}`}
                            className={errors.amount ? 'border-red-500 focus-visible:ring-red-200' : ''}
                        />
                        {errors.amount && (
                            <p className="text-red-500 text-sm mt-1">{errors.amount.message}</p>
                        )}
                    </div>

                    <Button 
                        type="submit"
                        disabled={placeBidMutation.isPending}
                        className="w-full text-lg h-12"
                    >
                        {placeBidMutation.isPending ? 'Обробка...' : (isAuthenticated ? 'Підтвердити ставку' : 'Увійти, щоб зробити ставку')}
                    </Button>
                </form>
            ) : (
                <div className="bg-green-50 border border-green-200 p-6 rounded-xl text-center shadow-sm mt-6">
                    <h3 className="text-2xl font-bold text-green-800 mb-2">🎉 Аукціон завершено!</h3>
                    <p className="text-lg text-green-700 mb-1">
                        Фінальна ціна: <span className="font-bold">{auction.currentPrice} ₴</span>
                    </p>
                    
                    {auction.bids && auction.bids.length > 0 ? (
                        <p className="text-md text-green-600 mt-2">
                            Переможець: <span className="font-bold border-b border-green-600 pb-0.5">{auction.bids[0].bidderName}</span>
                        </p>
                    ) : (
                        <p className="text-md text-gray-500 mt-2">
                            На жаль, аукціон завершився без жодної ставки.
                        </p>
                    )}
                </div>
            )}

            <div className="mt-8 border-t border-gray-200 pt-6">
                <h3 className="text-xl font-bold text-gray-900 mb-4">Історія ставок</h3>
                
                {!auction.bids || auction.bids.length === 0 ? (
                    <p className="text-gray-500 italic text-center py-4 bg-gray-50 rounded-lg border border-gray-100">
                        Ставок ще немає. Будьте першим!
                    </p>
                ) : (
                    <div className="bg-white rounded-lg border border-gray-200 overflow-hidden shadow-sm">
                        <ul className="divide-y divide-gray-200">
                            {auction.bids.map((bid) => (
                                <li key={bid.id} className="p-4 hover:bg-gray-50 flex justify-between items-center transition-colors">
                                    <div className="flex flex-col">
                                        <span className="font-semibold text-gray-800">
                                            {bid.bidderName}
                                        </span>
                                        <span className="text-sm text-gray-500">
                                            {new Date(bid.createdAt).toLocaleString('uk-UA')}
                                        </span>
                                    </div>
                                    <div className="text-lg font-bold text-blue-600">
                                        {bid.amount} ₴
                                    </div>
                                </li>
                            ))}
                        </ul>
                    </div>
                )}
            </div>
        </div>
    );
}