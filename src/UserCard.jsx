import { useNavigate } from 'react-router-dom';

function UserCard({ user }) {
    const navigate = useNavigate();
    return (
        <div
            onClick={() => navigate(`/profile/${user.username}`)}
            className="bg-white p-4 rounded-2xl shadow-md flex flex-col items-center text-center cursor-pointer hover:shadow-lg transition-shadow"
        >
            <img
                src={user.avatarUrl ? `http://localhost:8082${user.avatarUrl}` : 'https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_960_720.png'}
                alt={user.username}
                className="w-24 h-24 rounded-full object-cover mb-4"
            />
            <p className="font-bold text-gray-800">{user.username}</p>
            {user.fullName && <p className="text-sm text-gray-500">{user.fullName}</p>}
        </div>
    );
}
export default UserCard;