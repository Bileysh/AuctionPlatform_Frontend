export interface Auction {
    id: string;
    title: string;
    currentPrice: number;
    endsAt: string;
}

export interface PaginatedList<T>{
    items: T[];
    pageNumber: number;
    totalPages: number;
    totalCount: number;
}