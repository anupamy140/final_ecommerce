import { createHashRouter } from "react-router-dom";
import { Layout } from "./context/AppContext";
import { HomePage } from "./pages/HomePage";
import { ProductDetailPage } from "./pages/ProductDetailPage";
import { ProfileLayout } from "./pages/ProfileLayout";
import { ProfilePage } from "./pages/ProfilePage";
import { OrdersPage } from "./pages/OrdersPage";
import { AddressManagementPage } from "./pages/AddressManagementPage";
import { SuccessPage } from "./pages/SuccessPage";
import { CancelPage } from "./pages/CancelPage";

export const router = createHashRouter([
  {
    // The root path "/" will render the Layout component
    path: "/",
    element: <Layout />,
    // The children are the pages that will be rendered inside the Layout's <Outlet />
    children: [
      {
        index: true, // This makes HomePage the default child route for "/"
        element: <HomePage />,
      },
      {
        path: "product/:productId",
        element: <ProductDetailPage />,
      },
      {
        // The /profile path renders its own layout for nested profile pages
        path: "profile",
        element: <ProfileLayout />,
        children: [
          { index: true, element: <ProfilePage /> },
          { path: "orders", element: <OrdersPage /> },
          { path: "addresses", element: <AddressManagementPage /> },
          { 
            path: "settings", 
            element: (
              <div>
                <h2 className="text-2xl font-bold">Settings</h2>
                <p>Settings page is under construction.</p>
              </div>
            ) 
          },
        ],
      },
      {
        path: "success",
        element: <SuccessPage />,
      },
      {
        path: "cancel",
        element: <CancelPage />,
      },
    ],
  },
]);