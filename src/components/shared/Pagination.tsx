// src/components/shared/Pagination.tsx
import { Button } from '../ui/Button';

interface PaginationProps {
    page: number;
    pages: number;
    onPageChange: (p: number) => void;
}

export const Pagination = ({ page, pages, onPageChange }: PaginationProps) => (
    <div className="mt-10 flex items-center justify-center gap-2">
        <Button variant="outline" onClick={() => onPageChange(Math.max(1, page - 1))} disabled={page <= 1}>Previous</Button>
        <span className="text-sm text-gray-600 dark:text-gray-300 font-medium px-4">Page {page} of {pages}</span>
        <Button variant="outline" onClick={() => onPageChange(Math.min(pages, page + 1))} disabled={page >= pages}>Next</Button>
    </div>
);