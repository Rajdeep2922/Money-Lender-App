import { Outlet, useLocation } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import Navbar from './Navbar';

// Simple fade transition - no movement to prevent jitter
const pageVariants = {
    initial: { opacity: 0 },
    animate: {
        opacity: 1,
        transition: { duration: 0.15, ease: 'easeOut' }
    },
    exit: {
        opacity: 0,
        transition: { duration: 0.1, ease: 'easeIn' }
    },
};

export const Layout = () => {
    const location = useLocation();

    return (
        <div className="min-h-screen bg-[#e8f1fc] dark:bg-[#0c0e14] text-gray-900 dark:text-white transition-colors duration-200 flex flex-col">
            {/* Workspace Navigation (Vertical Rail on desktop, Top Header on mobile) */}
            <Navbar />

            {/* Main Content Area: Offset beside floating sidebar on desktop, below header on mobile */}
            <div className="flex-1 md:pl-[256px] transition-[padding] duration-200">
                <main className="pt-20 md:pt-4 px-4 sm:px-6 lg:px-7 pb-10 mx-auto max-w-[1280px] w-full">
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
        </div>
    );
};

export default Layout;
