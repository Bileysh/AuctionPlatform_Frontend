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
}

export interface PaginatedList<T>{
    items: T[];
    pageNumber: number;
    totalPages: number;
    totalCount: number;
}