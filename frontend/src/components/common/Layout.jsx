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
        <div className="min-h-screen bg-gray-50 dark:bg-black text-gray-900 dark:text-white transition-colors duration-200 flex flex-col">
            {/* Workspace Navigation (Vertical Rail on desktop, Top Header on mobile) */}
            <Navbar />

            {/* Main Content Area: Offset beside vertical rail on desktop, below header on mobile */}
            <div className="flex-1 md:pl-[72px] transition-[padding] duration-200">
                <main className="pt-20 md:pt-8 px-4 sm:px-6 lg:px-10 pb-12 mx-auto max-w-[1440px] w-full">
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
