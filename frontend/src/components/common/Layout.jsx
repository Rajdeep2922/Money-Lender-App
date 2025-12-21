import { Outlet } from 'react-router-dom';
import Navbar from './Navbar';

export const Layout = () => {
    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
            {/* Top Navbar */}
            <Navbar />

            {/* Main content - Add top padding to account for fixed navbar */}
            <main className="pt-20 px-4 md:px-6 pb-8 mx-auto max-w-7xl">
                <Outlet />
            </main>
        </div>
    );
};

export default Layout;
