import React from 'react';
import { useApp } from '../../contexts/AppContext';

const ProfilePage = () => {
    const { user } = useApp();
    return (
        <div>
            <h2 className="text-2xl font-bold mb-4">Hello, {user}!</h2>
            <p className="text-gray-600 dark:text-gray-400">
                From your account dashboard, you can view your recent orders, manage your shipping addresses, and edit your account details. Select an option from the menu to get started.
            </p>
        </div>
    );
};

export default ProfilePage;