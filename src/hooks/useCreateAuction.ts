import {useMutation, useQueryClient} from "@tanstack/react-query";
import {useNavigate} from "react-router-dom";
import {toast} from "sonner";
import {axiosClient} from "../api/axiosClient";

export interface CreateAuctionRequest {
    title: string;
    description: string;
    startingPrice: number;
    endsAt: string;     
    categoryId: number;
}

export const useCreateAuction = () => {
    const queryClient = useQueryClient();
    const navigate = useNavigate();

    return useMutation({
        mutationFn: async (data: CreateAuctionRequest) => {
            const response = await axiosClient.post("/Auctions", data);
            return response.data; 
        },

        onSuccess: (newAuctionId) => {
            queryClient.invalidateQueries({ queryKey: ['auctions'] });
            toast.success('Аукціон успішно створено!');
            navigate(`/auctions/${newAuctionId}`);
        },
        onError: (error: unknown) => {
            console.error('Error creating auction: ', error);
            toast.error('Помилка при створенні аукціону. Спробуйте ще раз.');
        }
    });
};