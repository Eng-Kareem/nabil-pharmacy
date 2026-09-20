import {
    useEffect,
    useState
} from "react";


import {
    Route,
    Routes
} from "react-router-dom";


import Navbar
    from "./components/Navbar/Navbar.jsx";

import Footer
    from "./components/Footer/Footer.jsx";

import AdminRoute
    from "./components/AdminRoute/AdminRoute.jsx";

import CheckoutAccess
    from "./components/CheckoutAccess/CheckoutAccess.jsx";

import WebsiteLoader
    from "./components/WebsiteLoader/WebsiteLoader.jsx";


import Home
    from "./pages/Home/Home.jsx";

import Products
    from "./pages/Products/Products.jsx";

import ProductDetails
    from "./pages/ProductDetails/ProductDetails.jsx";

import Prescription
    from "./pages/Prescription/Prescription.jsx";

import Cart
    from "./pages/Cart/Cart.jsx";

import Receipt
    from "./pages/Receipt/Receipt.jsx";

import CustomerAccount
    from "./pages/CustomerAccount/CustomerAccount.jsx";


import AdminLogin
    from "./pages/AdminLogin/AdminLogin.jsx";

import AdminDashboard
    from "./pages/AdminDashboard/AdminDashboard.jsx";

import AdminProducts
    from "./pages/AdminProducts/AdminProducts.jsx";

import AdminInventory
    from "./pages/AdminInventory/AdminInventory.jsx";

import AdminOrders
    from "./pages/AdminOrders/AdminOrders.jsx";



function App() {

    const [
        websiteLoading,
        setWebsiteLoading
    ] = useState(true);


    const [
        loaderLeaving,
        setLoaderLeaving
    ] = useState(false);



    /*
    ========================================================
    WEBSITE STARTUP LOADER
    ========================================================

    This loader is visual only.

    It does NOT wait for a Supabase query.

    That means 100 visitors do not generate 100 pointless
    "connection test" requests when opening the website.
    */

    useEffect(
        () => {

            const fadeTimer =
                window.setTimeout(
                    () => {

                        setLoaderLeaving(
                            true
                        );

                    },
                    900
                );


            const removeTimer =
                window.setTimeout(
                    () => {

                        setWebsiteLoading(
                            false
                        );

                    },
                    1400
                );


            return () => {

                window.clearTimeout(
                    fadeTimer
                );


                window.clearTimeout(
                    removeTimer
                );
            };

        },
        []
    );



    /*
    ========================================================
    DEVELOPMENT SUPABASE TEST
    ========================================================

    The test runs on localhost only.

    It is removed from the production traffic path.
    */

    useEffect(
        () => {

            if (
                !import.meta.env.DEV
            ) {

                return;
            }


            let active =
                true;


            const runDevelopmentTest =
                async () => {

                    try {

                        const {
                            testSupabaseConnection
                        } =
                            await import(
                                "./lib/testSupabase.js"
                            );


                        if (
                            active
                        ) {

                            await testSupabaseConnection();
                        }

                    } catch (
                        error
                    ) {

                        console.error(
                            "Development Supabase test failed:",
                            error
                        );
                    }
                };


            runDevelopmentTest();


            return () => {

                active =
                    false;
            };

        },
        []
    );



    return (

        <>

            {
                websiteLoading && (

                    <WebsiteLoader

                        leaving={
                            loaderLeaving
                        }

                    />

                )
            }


            <div
                className={
                    websiteLoading
                        ? "website-app-loading"
                        : "website-app-ready"
                }
            >

                <Navbar />


                <Routes>


                    {/* =========================================
                        CUSTOMER
                    ========================================= */}

                    <Route
                        path="/"
                        element={
                            <Home />
                        }
                    />


                    <Route
                        path="/products"
                        element={
                            <Products />
                        }
                    />


                    <Route
                        path="/products/:productId"
                        element={
                            <ProductDetails />
                        }
                    />


                    <Route
                        path="/prescription"
                        element={
                            <Prescription />
                        }
                    />


                    <Route
                        path="/cart"
                        element={
                            <Cart />
                        }
                    />


                    <Route
                        path="/account"
                        element={
                            <CustomerAccount />
                        }
                    />


                    <Route
                        path="/checkout"
                        element={
                            <CheckoutAccess />
                        }
                    />


                    <Route
                        path="/receipt/:orderId"
                        element={
                            <Receipt />
                        }
                    />



                    {/* =========================================
                        ADMIN LOGIN
                    ========================================= */}

                    <Route
                        path="/admin/login"
                        element={
                            <AdminLogin />
                        }
                    />



                    {/* =========================================
                        ADMIN DASHBOARD
                    ========================================= */}

                    <Route
                        path="/admin"
                        element={

                            <AdminRoute>

                                <AdminDashboard />

                            </AdminRoute>

                        }
                    />



                    {/* =========================================
                        ADMIN PRODUCTS
                    ========================================= */}

                    <Route
                        path="/admin/products"
                        element={

                            <AdminRoute>

                                <AdminProducts />

                            </AdminRoute>

                        }
                    />



                    {/* =========================================
                        ADMIN INVENTORY
                    ========================================= */}

                    <Route
                        path="/admin/inventory"
                        element={

                            <AdminRoute>

                                <AdminInventory />

                            </AdminRoute>

                        }
                    />



                    {/* =========================================
                        ADMIN ORDERS
                    ========================================= */}

                    <Route
                        path="/admin/orders"
                        element={

                            <AdminRoute>

                                <AdminOrders />

                            </AdminRoute>

                        }
                    />


                </Routes>


                <Footer />

            </div>

        </>
    );
}


export default App;