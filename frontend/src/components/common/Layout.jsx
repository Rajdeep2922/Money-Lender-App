import { Outlet, useLocation } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import Navbar from './Navbar';

// Page transition variants - slide up from bottom on mobile
const pageVariants = {
    initial: {
        opacity: 0,
        y: 30,
        scale: 0.98
    },
    animate: {
        opacity: 1,
        y: 0,
        scale: 1,
        transition: {
            duration: 0.3,
            ease: [0.25, 0.46, 0.45, 0.94]
        }
    },
    exit: {
        opacity: 0,
        y: -20,
        transition: {
            duration: 0.2,
            ease: 'easeIn'
        }
    },
};

export const Layout = () => {
    const location = useLocation();

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
            {/* Top Navbar */}
            <Navbar />

            {/* Main content - Add top padding to account for fixed navbar */}
            <main className="pt-20 px-4 md:px-6 pb-8 mx-auto max-w-7xl">
                <AnimatePresence mode="wait">
                    <motion.div
                        key={location.pathname}
                        variants={pageVariants}
                        initial="initial"
                        animate="animate"
                        exit="exit"
                    >
                        <Outlet />
                    </motion.div>
                </AnimatePresence>
            </main>
        </div>
    );
};

export default Layout;
