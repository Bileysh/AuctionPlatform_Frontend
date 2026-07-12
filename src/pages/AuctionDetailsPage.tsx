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

    const { connection, isConnected } = useSignalR('http://localhost:5130/hubs/auction');

    useEffect(() => {
            if (!connection || !id || !isConnected) return;

            connection.invoke("JoinAuctionGroup", id)
                .then(() => console.log(`Joined auction group for auction ${id}`))
                .catch(err => console.error('Error joining auction group: ', err));

            connection.on("ReceiveNewBid", (newAmount: number) => {
                queryClient.setQueryData(['auction', id], (oldData: Auction | undefined) => {
                    if(!oldData) return oldData;
                    return {
                        ...oldData,
                        currentPrice: newAmount
                    };
                });
            });

            return () => {
                connection.invoke("LeaveAuctionGroup", id)
                    .then(() => console.log(`Left auction group for auction ${id}`))
                    .catch(err => console.error('Error leaving auction group: ', err));
                connection.off("ReceiveNewBid");
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

    const placeBidMutation = useMutation({
        mutationFn: async (amount: number) =>{
            await axiosClient.post(`/Auctions/${id}/bid`, {amount});
        },
        onSuccess: () => {
            toast.success('Ставка успішно зроблена!'); 
            reset();
            queryClient.invalidateQueries({queryKey: ['auction', id]});
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

    const getBackendErrorMessage = (err: AxiosError<{ detail?: string; Detail?: string }>) => {
        const data = err?.response?.data;
        return data?.detail || data?.Detail || 'Сталася помилка при відправці ставки.';
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

                {placeBidMutation.isError && (
                    <div className="text-red-500 mb-4 font-medium p-3 bg-red-50 rounded-md border border-red-100">
                        {getBackendErrorMessage(placeBidMutation.error as AxiosError<{ detail?: string; Detail?: string }>)}
                    </div>
                )}

                <Button 
                    type="submit"
                    disabled={placeBidMutation.isPending}
                    className="w-full text-lg h-12"
                >
                    {placeBidMutation.isPending ? 'Обробка...' : (isAuthenticated ? 'Підтвердити ставку' : 'Увійти, щоб зробити ставку')}
                </Button>
            </form>
        </div>
    );
}