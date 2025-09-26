
import { Outlet } from 'react-router-dom';
import Header from './Header';
import Footer from './Footer';

const CustomerLayout = () => (
    <>
        <Header />
        <main className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8">
            <Outlet />
        </main>
        <Footer />
    </>
);

export default CustomerLayout;