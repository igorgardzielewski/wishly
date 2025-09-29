import {useTranslation} from "react-i18next";

function Pagination({ currentPage, totalPages, onPageChange }) {
    if (totalPages <= 1) return null;
    const {t} = useTranslation();
    const pages = Array.from({ length: totalPages }, (_, i) => i);

    return (
        <div className="flex justify-center items-center space-x-2 mt-8">
            <button onClick={() => onPageChange(currentPage - 1)} disabled={currentPage === 0} className="px-4 py-2 bg-gray-200 rounded-lg disabled:opacity-50">
                {t('pagination.prev')}
            </button>
            {pages.map(page => (
                <button
                    key={page}
                    onClick={() => onPageChange(page)}
                    className={`px-4 py-2 rounded-lg ${currentPage === page ? 'bg-black text-white' : 'bg-gray-200'}`}
                >
                    {page + 1}
                </button>
            ))}
            <button onClick={() => onPageChange(currentPage + 1)} disabled={currentPage >= totalPages - 1} className="px-4 py-2 bg-gray-200 rounded-lg disabled:opacity-50">
                {t('pagination.next')}
            </button>
        </div>
    );
}
export default Pagination;