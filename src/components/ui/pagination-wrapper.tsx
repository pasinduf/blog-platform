import * as React from "react"
import {
    Pagination,
    PaginationContent,
    PaginationEllipsis,
    PaginationItem,
    PaginationLink,
    PaginationNext,
    PaginationPrevious,
} from "@/components/ui/pagination"

interface PaginationWrapperProps {
    currentPage: number;
    totalPages: number;
    onPageChange: (page: number) => void;
}

export function PaginationWrapper({
    currentPage,
    totalPages,
    onPageChange,
}: PaginationWrapperProps) {
    if (totalPages <= 1) return null;

    const pagesArray = Array.from({ length: totalPages }, (_, i) => i + 1);

    // Simplified logic for MVP: Show all pages if <= 5, otherwise show surrounding pages
    const visiblePages = pagesArray.filter(page => {
        if (totalPages <= 5) return true;
        if (page === 1 || page === totalPages) return true;
        if (page >= currentPage - 1 && page <= currentPage + 1) return true;
        return false;
    });

    return (
        <Pagination className="mt-4">
            <PaginationContent>
                <PaginationItem>
                    {currentPage > 1 ? (
                        <PaginationPrevious
                            href="#"
                            onClick={(e) => { e.preventDefault(); onPageChange(currentPage - 1); }}
                        />
                    ) : (
                        <PaginationPrevious href="#" className="pointer-events-none opacity-50" aria-disabled="true" />
                    )}
                </PaginationItem>

                {visiblePages.map((page, index) => {
                    const isGap = index > 0 && page - visiblePages[index - 1] > 1;

                    return (
                        <React.Fragment key={page}>
                            {isGap && (
                                <PaginationItem>
                                    <PaginationEllipsis />
                                </PaginationItem>
                            )}
                            <PaginationItem>
                                <PaginationLink
                                    href="#"
                                    onClick={(e) => { e.preventDefault(); onPageChange(page); }}
                                    isActive={page === currentPage}
                                >
                                    {page}
                                </PaginationLink>
                            </PaginationItem>
                        </React.Fragment>
                    );
                })}

                <PaginationItem>
                    {currentPage < totalPages ? (
                        <PaginationNext
                            href="#"
                            onClick={(e) => { e.preventDefault(); onPageChange(currentPage + 1); }}
                        />
                    ) : (
                        <PaginationNext href="#" className="pointer-events-none opacity-50" aria-disabled="true" />
                    )}
                </PaginationItem>
            </PaginationContent>
        </Pagination>
    )
}
