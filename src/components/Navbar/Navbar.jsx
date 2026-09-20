import {
    Boxes,
    LayoutDashboard,
    LogOut,
    Menu,
    Package,
    ShoppingBag,
    Store,
    Upload,
    UserRound,
    X
} from "lucide-react";

import {
    useEffect,
    useState
} from "react";

import {
    Link,
    useLocation,
    useNavigate
} from "react-router-dom";

import {
    useCart
} from "../../context/CartContext.jsx";

import {
    useAuth
} from "../../context/AuthContext.jsx";

import {
    supabase
} from "../../lib/supabase.js";

import "./Navbar.css";


function Navbar() {

    /*
    ========================================================
    CART
    ========================================================
    */

    const {
        cartCount
    } = useCart();


    /*
    ========================================================
    CUSTOMER AUTH
    ========================================================
    */

    const {
        user,
        authLoading,
        signOut
    } = useAuth();


    /*
    ========================================================
    ROUTER
    ========================================================
    */

    const location =
        useLocation();


    const navigate =
        useNavigate();


    /*
    ========================================================
    STATES
    ========================================================
    */

    const [
        menuOpen,
        setMenuOpen
    ] = useState(false);


    const [
        isAdmin,
        setIsAdmin
    ] = useState(false);


    const [
        roleLoading,
        setRoleLoading
    ] = useState(true);



    /*
    ========================================================
    CHECK ADMIN ROLE
    ========================================================
    */

    useEffect(() => {

        let mounted = true;


        const checkRole =
            async () => {

                /*
                No logged-in user
                */

                if (
                    !user
                ) {

                    if (
                        mounted
                    ) {

                        setIsAdmin(false);

                        setRoleLoading(false);
                    }


                    return;
                }


                setRoleLoading(true);


                try {

                    const {
                        data,
                        error
                    } =
                        await supabase
                            .from("profiles")
                            .select("role")
                            .eq(
                                "id",
                                user.id
                            )
                            .maybeSingle();


                    if (
                        error
                    ) {

                        console.error(
                            "Navbar profile error:",
                            error
                        );


                        if (
                            mounted
                        ) {

                            setIsAdmin(false);
                        }


                        return;
                    }


                    if (
                        mounted
                    ) {

                        setIsAdmin(
                            data?.role ===
                            "admin"
                        );
                    }

                } catch (error) {

                    console.error(
                        "Navbar role check error:",
                        error
                    );


                    if (
                        mounted
                    ) {

                        setIsAdmin(false);
                    }

                } finally {

                    if (
                        mounted
                    ) {

                        setRoleLoading(false);
                    }
                }
            };


        checkRole();


        return () => {

            mounted = false;
        };

    }, [
        user
    ]);



    /*
    ========================================================
    CLOSE MOBILE MENU WHEN ROUTE CHANGES
    ========================================================
    */

    useEffect(() => {

        setMenuOpen(false);

    }, [
        location.pathname
    ]);



    /*
    ========================================================
    ADMIN LOGOUT
    ========================================================
    */

    const handleAdminLogout =
        async () => {

            try {

                await signOut();


                setIsAdmin(false);

                setMenuOpen(false);


                navigate(
                    "/",
                    {
                        replace: true
                    }
                );

            } catch (error) {

                console.error(
                    "Admin logout error:",
                    error
                );
            }
        };



    /*
    ========================================================
    ADMIN NAVBAR
    ========================================================
    */

    if (
        !authLoading &&
        !roleLoading &&
        user &&
        isAdmin
    ) {

        return (

            <header className="navbar navbar-admin">


                <div className="container navbar-inner">


                    {/* =================================================
                        ADMIN BRAND
                    ================================================= */}

                    <Link
                        to="/admin"
                        className="navbar-brand navbar-admin-brand"
                    >

                        <img
                            src="/nabil-logo.png"
                            alt="Nabil Pharmacy"
                        />


                        <div>

                            <strong>
                                Nabil Pharmacy
                            </strong>


                            <span>
                                Admin Portal
                            </span>

                        </div>

                    </Link>



                    {/* =================================================
                        DESKTOP ADMIN NAV
                    ================================================= */}

                    <nav className="navbar-links navbar-admin-links">


                        <Link
                            to="/admin"
                            className={
                                location.pathname ===
                                    "/admin"
                                    ? "active"
                                    : ""
                            }
                        >

                            <LayoutDashboard
                                size={17}
                            />

                            Dashboard

                        </Link>



                        <Link
                            to="/admin/products"
                            className={
                                location.pathname
                                    .startsWith(
                                        "/admin/products"
                                    )
                                    ? "active"
                                    : ""
                            }
                        >

                            <Package
                                size={17}
                            />

                            Products

                        </Link>



                        <Link
                            to="/admin/inventory"
                            className={
                                location.pathname
                                    .startsWith(
                                        "/admin/inventory"
                                    )
                                    ? "active"
                                    : ""
                            }
                        >

                            <Boxes
                                size={17}
                            />

                            Inventory

                        </Link>



                        <Link
                            to="/admin/orders"
                            className={
                                location.pathname
                                    .startsWith(
                                        "/admin/orders"
                                    )
                                    ? "active"
                                    : ""
                            }
                        >

                            <ShoppingBag
                                size={17}
                            />

                            Orders

                        </Link>

                    </nav>



                    {/* =================================================
                        ADMIN ACTIONS
                    ================================================= */}

                    <div className="navbar-actions navbar-admin-actions">


                        <Link
                            to="/"
                            className="navbar-view-site"
                        >

                            <Store
                                size={17}
                            />

                            View Website

                        </Link>



                        <button
                            type="button"
                            className="navbar-admin-logout"
                            onClick={
                                handleAdminLogout
                            }
                        >

                            <LogOut
                                size={17}
                            />

                            Sign Out

                        </button>



                        <button
                            type="button"
                            className="navbar-menu-button"
                            onClick={() =>
                                setMenuOpen(
                                    current =>
                                        !current
                                )
                            }
                            aria-label="Toggle admin menu"
                        >

                            {
                                menuOpen
                                    ? (
                                        <X
                                            size={22}
                                        />
                                    )
                                    : (
                                        <Menu
                                            size={22}
                                        />
                                    )
                            }

                        </button>

                    </div>

                </div>



                {/* =================================================
                    MOBILE ADMIN MENU
                ================================================= */}

                {
                    menuOpen && (

                        <div className="navbar-mobile-menu navbar-admin-mobile-menu">


                            <Link
                                to="/admin"
                            >

                                <LayoutDashboard
                                    size={18}
                                />

                                Dashboard

                            </Link>



                            <Link
                                to="/admin/products"
                            >

                                <Package
                                    size={18}
                                />

                                Products

                            </Link>



                            <Link
                                to="/admin/inventory"
                            >

                                <Boxes
                                    size={18}
                                />

                                Inventory

                            </Link>



                            <Link
                                to="/admin/orders"
                            >

                                <ShoppingBag
                                    size={18}
                                />

                                Orders

                            </Link>



                            <Link
                                to="/"
                            >

                                <Store
                                    size={18}
                                />

                                View Website

                            </Link>



                            <button
                                type="button"
                                onClick={
                                    handleAdminLogout
                                }
                            >

                                <LogOut
                                    size={18}
                                />

                                Sign Out

                            </button>

                        </div>

                    )
                }

            </header>
        );
    }



    /*
    ========================================================
    NORMAL CUSTOMER NAVBAR
    ========================================================
    */

    return (

        <header className="navbar">


            <div className="container navbar-inner">


                {/* =================================================
                    BRAND
                ================================================= */}

                <Link
                    to="/"
                    className="navbar-brand"
                >

                    <img
                        src="/nabil-logo.png"
                        alt="Nabil Pharmacy"
                    />


                    <div>

                        <strong>
                            Nabil Pharmacy
                        </strong>


                        <span>
                            Since 1975
                        </span>

                    </div>

                </Link>



                {/* =================================================
                    DESKTOP CUSTOMER NAV
                ================================================= */}

                <nav className="navbar-links">


                    <Link
                        to="/"
                        className={
                            location.pathname ===
                                "/"
                                ? "active"
                                : ""
                        }
                    >

                        Home

                    </Link>



                    <Link
                        to="/products"
                        className={
                            location.pathname
                                .startsWith(
                                    "/products"
                                )
                                ? "active"
                                : ""
                        }
                    >

                        Products

                    </Link>



                    <a href="/#services">
                        Services
                    </a>



                    <a href="/#story">
                        Our Story
                    </a>



                    <a href="/#contact">
                        Contact
                    </a>

                </nav>



                {/* =================================================
                    CUSTOMER ACTIONS
                ================================================= */}

                <div className="navbar-actions">


                    {/* ACCOUNT */}

                    <Link
                        to="/account"
                        className="navbar-account"
                        aria-label={
                            user
                                ? "My account"
                                : "Customer login"
                        }
                    >

                        <UserRound
                            size={18}
                        />


                        <span>

                            {
                                authLoading
                                    ? "Account"
                                    : user
                                        ? "My Account"
                                        : "Login"
                            }

                        </span>

                    </Link>



                    {/* CART */}

                    <Link
                        to="/cart"
                        className="navbar-cart"
                        aria-label="Shopping cart"
                    >

                        <ShoppingBag
                            size={19}
                        />


                        {
                            cartCount > 0 && (

                                <span>

                                    {
                                        cartCount > 99
                                            ? "99+"
                                            : cartCount
                                    }

                                </span>

                            )
                        }

                    </Link>



                    {/* PRESCRIPTION */}

                    <Link
                        to="/prescription"
                        className="navbar-prescription"
                    >

                        <Upload
                            size={17}
                        />

                        Upload Prescription

                    </Link>



                    {/* MOBILE MENU */}

                    <button
                        type="button"
                        className="navbar-menu-button"
                        onClick={() =>
                            setMenuOpen(
                                current =>
                                    !current
                            )
                        }
                        aria-label="Toggle navigation"
                    >

                        {
                            menuOpen
                                ? (
                                    <X
                                        size={22}
                                    />
                                )
                                : (
                                    <Menu
                                        size={22}
                                    />
                                )
                        }

                    </button>

                </div>

            </div>



            {/* =================================================
                MOBILE CUSTOMER MENU
            ================================================= */}

            {
                menuOpen && (

                    <div className="navbar-mobile-menu">


                        <Link to="/">
                            Home
                        </Link>


                        <Link to="/products">
                            Products
                        </Link>


                        <a href="/#services">
                            Services
                        </a>


                        <a href="/#story">
                            Our Story
                        </a>


                        <a href="/#contact">
                            Contact
                        </a>



                        {/* ACCOUNT */}

                        <Link
                            to="/account"
                            className="navbar-mobile-account"
                        >

                            <UserRound
                                size={17}
                            />

                            {
                                user
                                    ? "My Account"
                                    : "Login / Create Account"
                            }

                        </Link>



                        {/* CART */}

                        <Link to="/cart">

                            <ShoppingBag
                                size={17}
                            />

                            Cart

                            {
                                cartCount > 0 &&
                                ` (${cartCount})`
                            }

                        </Link>



                        {/* PRESCRIPTION */}

                        <Link
                            to="/prescription"
                            className="navbar-mobile-prescription"
                        >

                            <Upload
                                size={17}
                            />

                            Upload Prescription

                        </Link>

                    </div>

                )
            }

        </header>
    );
}


export default Navbar;