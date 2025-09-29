// MainView.jsx
import Post from "./Post";
import { useEffect, useState } from "react";
import api from './api';
import NavBar from "./NavBar.jsx";
import { useAuth } from './AuthContext';
import ExploreOverlay from './ExploreOverlay.jsx';

function MainView() {
    const { isExploreOpen, closeExplore } = useAuth();
    const [posts, setPosts] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchPosts = async () => {
            setIsLoading(true);
            try {
                const response = await api.get("/api/posts/feed");
                const data = response.data;
                data.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
                setPosts(data);
            } catch (e) {
                console.error("Failed to fetch feed:", e);
                setPosts([]);
            } finally {
                setIsLoading(false);
            }
        }
        fetchPosts();
    }, []);

    return (
        <div className="flex flex-col h-screen bg-gray-50">
            <NavBar />
            <main className="mt-[10vh] pt-10 overflow-y-auto flex-grow">
                {isLoading ? (
                    <div className="flex justify-center items-center h-full">...</div>
                ) : posts.length > 0 ? (
                    <div className="grid w-full gap-10 mb-10">
                        {posts.map((post) => <Post key={post.id} postData={post} />)}
                    </div>
                ) : (
                    <div className="text-center text-gray-500 mt-20">...</div>
                )}
            </main>

            <ExploreOverlay isOpen={isExploreOpen} onClose={closeExplore} />
        </div>
    )
}

export default MainView;