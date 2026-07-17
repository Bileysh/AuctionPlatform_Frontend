export interface Auction {
    id: string;
    title: string;
    description: string;
    currentPrice: number;
    startingPrice: number;
    endsAt: string;
    createdAt: string;
    sellerId: string;
    winnerId?: string | null;
    categoryName?: string;
    status: 'Active' | 'Closed' | 'Cancelled';
    bids: Bid[];
}

export interface PaginatedList<T>{
    hasNextPage: boolean;
    hasPreviousPage: boolean;
    items: T[];
    pageNumber: number;
    totalPages: number;
    totalCount: number;
}

export interface Bid {
    id: string;
    bidderName: string;
    amount: number;
    createdAt: string;
}