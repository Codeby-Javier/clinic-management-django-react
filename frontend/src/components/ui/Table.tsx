import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface Column<T> {
    key: string;
    header: string;
    render?: (item: T) => React.ReactNode;
    className?: string;
}

interface TableProps<T> {
    columns: Column<T>[];
    data: T[];
    isLoading?: boolean;
    emptyMessage?: string;
    onRowClick?: (item: T) => void;
}

export function Table<T extends { id: number | string }>({
    columns,
    data,
    isLoading = false,
    emptyMessage = 'Tidak ada data',
    onRowClick,
}: TableProps<T>) {
    if (isLoading) {
        return (
            <div className="bg-white rounded-xl border border-slate-200/60 overflow-hidden">
                <div className="animate-pulse">
                    <div className="h-12 bg-slate-100 border-b border-slate-200" />
                    {[...Array(5)].map((_, i) => (
                        <div key={i} className="h-16 border-b border-slate-100 flex items-center px-6 gap-4">
                            <div className="h-4 bg-slate-200 rounded w-1/4" />
                            <div className="h-4 bg-slate-200 rounded w-1/3" />
                            <div className="h-4 bg-slate-200 rounded w-1/4" />
                        </div>
                    ))}
                </div>
            </div>
        );
    }

    return (
        <div className="bg-white rounded-xl border border-slate-200/60 overflow-hidden">
            <div className="overflow-x-auto">
                <table className="w-full">
                    <thead>
                        <tr className="bg-slate-50 border-b border-slate-200">
                            {columns.map((column) => (
                                <th
                                    key={column.key}
                                    className={`px-6 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider ${column.className || ''}`}
                                >
                                    {column.header}
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                        {data.length === 0 ? (
                            <tr>
                                <td
                                    colSpan={columns.length}
                                    className="px-6 py-12 text-center text-slate-500"
                                >
                                    {emptyMessage}
                                </td>
                            </tr>
                        ) : (
                            data.map((item, index) => (
                                <tr
                                    key={item.id}
                                    onClick={() => onRowClick?.(item)}
                                    className={`
                    ${index % 2 === 0 ? 'bg-white' : 'bg-slate-50/50'}
                    hover:bg-sky-50/50 transition-colors duration-150
                    ${onRowClick ? 'cursor-pointer' : ''}
                  `}
                                >
                                    {columns.map((column) => (
                                        <td
                                            key={column.key}
                                            className={`px-6 py-4 text-sm text-slate-700 ${column.className || ''}`}
                                        >
                                            {column.render
                                                ? column.render(item)
                                                : (item as Record<string, unknown>)[column.key] as React.ReactNode}
                                        </td>
                                    ))}
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

interface PaginationProps {
    currentPage: number;
    totalPages: number;
    totalItems: number;
    itemsPerPage: number;
    onPageChange: (page: number) => void;
}

export const Pagination: React.FC<PaginationProps> = ({
    currentPage,
    totalPages,
    totalItems,
    itemsPerPage,
    onPageChange,
}) => {
    const startItem = (currentPage - 1) * itemsPerPage + 1;
    const endItem = Math.min(currentPage * itemsPerPage, totalItems);

    const getPageNumbers = () => {
        const pages: (number | string)[] = [];
        const maxVisiblePages = 5;

        if (totalPages <= maxVisiblePages) {
            for (let i = 1; i <= totalPages; i++) {
                pages.push(i);
            }
        } else {
            if (currentPage <= 3) {
                for (let i = 1; i <= 4; i++) {
                    pages.push(i);
                }
                pages.push('...');
                pages.push(totalPages);
            } else if (currentPage >= totalPages - 2) {
                pages.push(1);
                pages.push('...');
                for (let i = totalPages - 3; i <= totalPages; i++) {
                    pages.push(i);
                }
            } else {
                pages.push(1);
                pages.push('...');
                for (let i = currentPage - 1; i <= currentPage + 1; i++) {
                    pages.push(i);
                }
                pages.push('...');
                pages.push(totalPages);
            }
        }

        return pages;
    };

    return (
        <div className="flex items-center justify-between px-6 py-4 bg-white border-t border-slate-200">
            <div className="text-sm text-slate-600">
                Menampilkan <span className="font-medium">{startItem}</span> -{' '}
                <span className="font-medium">{endItem}</span> dari{' '}
                <span className="font-medium">{totalItems}</span> data
            </div>
            <div className="flex items-center gap-1">
                <button
                    onClick={() => onPageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                    className="p-2 rounded-lg hover:bg-slate-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                    <ChevronLeft className="w-4 h-4" />
                </button>
                {getPageNumbers().map((page, index) => (
                    <button
                        key={index}
                        onClick={() => typeof page === 'number' && onPageChange(page)}
                        disabled={page === '...'}
                        className={`
              min-w-[36px] h-9 px-3 rounded-lg text-sm font-medium transition-colors
              ${page === currentPage
                                ? 'bg-sky-500 text-white'
                                : page === '...'
                                    ? 'cursor-default'
                                    : 'hover:bg-slate-100 text-slate-700'
                            }
            `}
                    >
                        {page}
                    </button>
                ))}
                <button
                    onClick={() => onPageChange(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    className="p-2 rounded-lg hover:bg-slate-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                    <ChevronRight className="w-4 h-4" />
                </button>
            </div>
        </div>
    );
};
