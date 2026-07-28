import { useQuery } from '@tanstack/react-query';
import { axiosClient } from '../api/axiosClient';
import type { Auction } from '../types/auction'; // Твій існуючий тип
import { useAuth0 } from '@auth0/auth0-react';

export interface PaginatedList<T> {
    items: T[];
    totalCount: number;
    pageNumber: number;
    totalPages: number;
}

export interface BiddedAuction extends Auction {
    myHighestBid: number;
}

export const useMyAuctions = (pageNumber = 1) => {
    const { isAuthenticated } = useAuth0();
    return useQuery({
        queryKey: ['my-auctions', pageNumber],
        queryFn: async () => {
            const response = await axiosClient.get<PaginatedList<Auction>>(`/Auctions/my?pageNumber=${pageNumber}`);
            return response.data;
        },
        enabled: isAuthenticated
    });
};

export const useMyBids = (pageNumber = 1) => {
    const { isAuthenticated } = useAuth0();
    return useQuery({
        queryKey: ['my', pageNumber],
        queryFn: async () => {
            const response = await axiosClient.get<PaginatedList<BiddedAuction>>(`/Bids/my?pageNumber=${pageNumber}`);
            return response.data;
        },
        enabled: isAuthenticated
    });
};