import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { axiosClient } from "../api/axiosClient";
import { useParams, Link } from "react-router-dom";
import type { Auction } from '../types/auction';
import { useAuth0 } from '@auth0/auth0-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';


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

    const {data: auction, isLoading, isError: isPageError} = useQuery({
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
            alert('Ставка успішно зроблена!')
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

    const getBackendErrorMessage = (err: any) => {
        const data = err?.response?.data;
        return data?.detail || data?.Detail || 'Сталася помилка при відправці ставки.';
    };

    if (isLoading) return <div className="text-gray-500 p-8">Завантаження деталей...</div>;
    if (isPageError || !auction) return <div className="text-red-500 p-8">Не вдалося завантажити деталі аукціону. Спробуйте пізніше.</div>;
    
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

            <form onSubmit={handleSubmit(onSubmit)} className="mb-4">
                <div className="mb-4">
                    <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="bid">
                        Ваша ставка
                    </label>
                    <input 
                        id="bid"
                        type="number" 
                        step="0.01" 
                        {...register("amount", { valueAsNumber: true })} // <--- ЗМІНА ТУТ
                        placeholder={`Більше ніж ${auction.currentPrice}`}
                        className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 ${
                            errors.amount ? 'border-red-500 focus:ring-red-200' : 'border-gray-300 focus:ring-blue-600'
                        }`}
                    />
                    {errors.amount && (
                        <p className="text-red-500 text-sm mt-1">{errors.amount.message}</p>
                    )}
                </div>

                {placeBidMutation.isError && (
                    <div className="text-red-500 mb-4 font-medium">
                        {getBackendErrorMessage(placeBidMutation.error)}
                    </div>
                )}

                <button 
                    type="submit"
                    disabled={placeBidMutation.isPending}
                    className="w-full bg-blue-600 text-white text-lg font-semibold py-4 rounded-lg hover:bg-blue-700 transition disabled:bg-blue-400"
                >
                    {placeBidMutation.isPending ? 'Обробка...' : (isAuthenticated ? 'Підтвердити ставку' : 'Увійти, щоб зробити ставку')}
                </button>
            </form>
        </div>
    );
}