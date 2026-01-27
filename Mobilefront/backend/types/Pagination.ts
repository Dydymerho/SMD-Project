export type Sort = {
    sorted: boolean;
    unsorted: boolean;
    empty: boolean;
};

export type Pageable = {
    pageNumber: number;
    pageSize: number;
    sort: Sort;
    offset: number;
    paged: boolean;
    unpaged: boolean;
};

// Type Generic <T> chấp nhận bất kỳ kiểu dữ liệu nào vào content
export type PaginatedResponse<T> = {
    content: T[];
    pageable: Pageable;
    totalPages: number;
    totalElements: number;
    last: boolean;
    first: boolean;
    size: number;
    number: number;
    sort: Sort;
    numberOfElements: number;
    empty: boolean;
};