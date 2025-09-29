import { CameraIcon } from '@heroicons/react/24/outline';

function EmptyState({ title, message }) {
    return (
        <div className="col-span-1 md:col-span-2 lg:col-span-3 text-center text-gray-500 py-16">
            <CameraIcon className="h-16 w-16 mx-auto mb-4 text-gray-300" />
            <h3 className="text-xl font-medium text-gray-800 mb-2">{title}</h3>
            <p>{message}</p>
        </div>
    );
}

export default EmptyState;