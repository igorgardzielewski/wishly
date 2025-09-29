// src/pages/SearchPage.jsx
import { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import api from './api';
import NavBar from './NavBar';
import UserCard from './UserCard';
import Pagination from './Pagination';
import { useTranslation } from 'react-i18next';

function SearchPage() {
    const { t } = useTranslation();
    const [searchParams, setSearchParams] = useSearchParams();
    const navigate = useNavigate();

    const query = searchParams.get('q') || '';
    const page = parseInt(searchParams.get('page') || '0', 10);

    const [results, setResults] = useState(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        if (!query) {
            navigate('/');
            return;
        }
        const fetchResults = async () => {
            setIsLoading(true);
            try {
                const response = await api.get(`/api/users/search`, {
                    params: { q: query, page: page, size: 8 }
                });
                setResults(response.data);
            } catch (error) {
                console.error("Failed to fetch search results:", error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchResults();
    }, [query, page, navigate]);

    const handlePageChange = (newPage) => {
        setSearchParams({ q: query, page: newPage });
    };

    return (
        <div className="flex flex-col h-screen bg-gray-50">
            <NavBar />
            <main className="w-full max-w-6xl mx-auto p-4 mt-[10vh] overflow-y-hidden">
                <h1 className="text-3xl font-bold mb-6">
                    {t('searchPage.title')} <span className="text-black">{query}</span>
                </h1>

                {isLoading ? (
                    <div className="flex justify-center items-center h-64">
                        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-black" aria-label={t('searchPage.loading')}></div>
                    </div>
                ) : results && results.content.length > 0 ? (
                    <>
                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                            {results.content.map(user => (
                                <UserCard key={user.id} user={user} />
                            ))}
                        </div>
                        <Pagination
                            currentPage={results.number}
                            totalPages={results.totalPages}
                            onPageChange={handlePageChange}
                        />
                    </>
                ) : (
                    <p className="text-center text-gray-500 mt-16">{t('searchPage.noResults', { query })}</p>
                )}
            </main>
        </div>
    );
}

export default SearchPage;