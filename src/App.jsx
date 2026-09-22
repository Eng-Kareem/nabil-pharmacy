import {
    useEffect,
    useLayoutEffect,
    useState
} from "react";


import {
    Route,
    Routes,
    useLocation
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

import AccountPage
    from "./pages/AccountPage/AccountPage.jsx";

import NotFound
    from "./pages/NotFound.jsx";


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



/*
========================================================
GLOBAL SCROLL TO TOP
========================================================
*/

function ScrollToTop() {

    const {
        pathname,
        search,
        hash
    } = useLocation();


    useLayoutEffect(
        () => {

            window.scrollTo(
                0,
                0
            );


            document.documentElement.scrollTop =
                0;


            document.body.scrollTop =
                0;


            const frame =
                window.requestAnimationFrame(
                    () => {

                        window.scrollTo(
                            0,
                            0
                        );


                        document.documentElement.scrollTop =
                            0;


                        document.body.scrollTop =
                            0;

                    }
                );


            return () => {

                window.cancelAnimationFrame(
                    frame
                );

            };

        },
        [
            pathname,
            search,
            hash
        ]
    );


    return null;

}



function App() {

    const [
        websiteLoading,
        setWebsiteLoading
    ] = useState(
        true
    );


    const [
        loaderLeaving,
        setLoaderLeaving
    ] = useState(
        false
    );



    /*
    ========================================================
    WEBSITE STARTUP LOADER
    ========================================================
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
    DISABLE BROWSER SCROLL RESTORATION
    ========================================================
    */

    useEffect(
        () => {

            if (
                !(
                    "scrollRestoration" in
                    window.history
                )
            ) {

                return undefined;

            }


            const previousValue =
                window.history
                    .scrollRestoration;


            window.history
                .scrollRestoration =
                "manual";


            return () => {

                window.history
                    .scrollRestoration =
                    previousValue;

            };

        },
        []
    );



    /*
    ========================================================
    DEVELOPMENT SUPABASE TEST
    ========================================================
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

                <ScrollToTop />


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


                    {/* =========================================
                        ACCOUNT

                        NOT LOGGED IN:
                        Login / Register

                        LOGGED IN:
                        Profile + Interactive ID
                    ========================================= */}

                    <Route
                        path="/account"
                        element={
                            <AccountPage />
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


                    {/* =========================================
                        404
                    ========================================= */}

                    <Route
                        path="*"
                        element={
                            <NotFound />
                        }
                    />


                </Routes>


                <Footer />

            </div>

        </>

    );

}


export default App;