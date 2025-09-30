import { useState, useMemo } from 'react';

const usePagination = (data, itemsPerPage = 10) => {
    const [currentPage, setCurrentPage] = useState(1);

    const maxPage = Math.ceil(data.length / itemsPerPage);

    const currentData = useMemo(() => {
        const startIndex = (currentPage - 1) * itemsPerPage;
        const endIndex = startIndex + itemsPerPage;
        return data.slice(0, endIndex); 
    }, [data, currentPage, itemsPerPage]);

    const next = () => {
        setCurrentPage(currentPage => Math.min(currentPage + 1, maxPage));
    };

    const prev = () => {
        setCurrentPage(currentPage => Math.max(currentPage - 1, 1));
    };

    const jump = (page) => {
        const pageNumber = Math.max(1, page);
        setCurrentPage(() => Math.min(pageNumber, maxPage));
    };

    const hasMore = currentPage < maxPage;
    const isFirstPage = currentPage === 1;

    return {
        next,
        prev,
        jump,
        currentData,
        currentPage,
        maxPage,
        hasMore,
        isFirstPage,
        itemsPerPage,
        totalItems: data.length
    };
};

export default usePagination;