
import { Outlet } from 'react-router-dom';
import {CartSheet} from './CartSheet';
import WishlistSheet from './WishlistSheet';
import UserAuthDialog from './UserAuthDialog';
import BackToTopButton from './ui/BackToTopButton';

const Layout = () => {
  return (
    <div className="min-h-screen bg-gray-50 text-gray-800 dark:bg-gray-950 dark:text-gray-200 font-sans transition-colors duration-300">
      <Outlet />
      <UserAuthDialog />
      <CartSheet />
      <WishlistSheet />
      <BackToTopButton />
    </div>
  );
};

export default Layout;