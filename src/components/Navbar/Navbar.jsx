import {
    Boxes,
    FileText,
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
    useCallback,
    useEffect,
    useMemo,
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
    useLanguage
} from "../../context/LanguageContext.jsx";

import {
    supabase
} from "../../lib/supabase.js";

import "./Navbar.css";


function Navbar() {

    const {
        cartCount
    } = useCart();


    const {
        user,
        authLoading,
        signOut
    } = useAuth();


    const {
        isArabic,
        toggleLanguage
    } = useLanguage();


    const location =
        useLocation();


    const navigate =
        useNavigate();


    const [
        menuOpen,
        setMenuOpen
    ] = useState(false);


    const [
        profile,
        setProfile
    ] = useState(null);


    const [
        roleLoading,
        setRoleLoading
    ] = useState(true);


    const [
        orderNotifications,
        setOrderNotifications
    ] = useState(0);


    const [
        prescriptionNotifications,
        setPrescriptionNotifications
    ] = useState(0);


    /*
    ========================================================
    TRANSLATIONS
    ========================================================
    */

    const text =
        isArabic
            ? {
                pharmacy:
                    "صيدلية نبيل",

                since:
                    "منذ عام ١٩٧٥",

                home:
                    "الرئيسية",

                products:
                    "المنتجات",

                services:
                    "خدماتنا",

                story:
                    "قصتنا",

                contact:
                    "تواصل معنا",

                account:
                    "حسابي",

                login:
                    "تسجيل الدخول",

                cart:
                    "السلة",

                prescription:
                    "رفع الروشتة",

                prescriptions:
                    "الروشتات",

                myPrescriptions:
                    "روشتاتي",

                myOrders:
                    "طلباتي",

                english:
                    "English",

                arabic:
                    "العربية",

                adminPortal:
                    "بوابة الإدارة",

                dashboard:
                    "لوحة التحكم",

                inventory:
                    "المخزون",

                orders:
                    "الطلبات",

                viewWebsite:
                    "عرض الموقع",

                signOut:
                    "تسجيل الخروج",

                menu:
                    "فتح القائمة",

                profile:
                    "الملف الشخصي"
            }
            : {
                pharmacy:
                    "Nabil Pharmacy",

                since:
                    "Since 1975",

                home:
                    "Home",

                products:
                    "Products",

                services:
                    "Services",

                story:
                    "Our Story",

                contact:
                    "Contact",

                account:
                    "My Account",

                login:
                    "Login / Create Account",

                cart:
                    "Cart",

                prescription:
                    "Upload Prescription",

                prescriptions:
                    "Prescriptions",

                myPrescriptions:
                    "My Prescriptions",

                myOrders:
                    "My Orders",

                english:
                    "English",

                arabic:
                    "العربية",

                adminPortal:
                    "Admin Portal",

                dashboard:
                    "Dashboard",

                inventory:
                    "Inventory",

                orders:
                    "Orders",

                viewWebsite:
                    "View Website",

                signOut:
                    "Sign Out",

                menu:
                    "Toggle navigation",

                profile:
                    "My Profile"
            };


    /*
    ========================================================
    LOAD PROFILE
    ========================================================
    */

    useEffect(
        () => {

            let mounted =
                true;


            const loadProfile =
                async () => {

                    if (
                        !user?.id
                    ) {

                        if (
                            mounted
                        ) {

                            setProfile(
                                null
                            );


                            setRoleLoading(
                                false
                            );

                        }


                        return;

                    }


                    setRoleLoading(
                        true
                    );


                    try {

                        const {
                            data,
                            error
                        } =
                            await supabase
                                .from(
                                    "profiles"
                                )
                                .select(`
                                    id,
                                    full_name,
                                    username,
                                    avatar_url,
                                    role
                                `)
                                .eq(
                                    "id",
                                    user.id
                                )
                                .maybeSingle();


                        if (
                            error
                        ) {

                            throw error;

                        }


                        if (
                            mounted
                        ) {

                            setProfile(
                                data ||
                                null
                            );

                        }

                    } catch (
                        loadError
                    ) {

                        console.error(
                            "Navbar profile error:",
                            loadError
                        );


                        if (
                            mounted
                        ) {

                            setProfile(
                                null
                            );

                        }

                    } finally {

                        if (
                            mounted
                        ) {

                            setRoleLoading(
                                false
                            );

                        }

                    }

                };


            loadProfile();


            return () => {

                mounted =
                    false;

            };

        },
        [
            user
        ]
    );


    /*
    ========================================================
    LOAD UNREAD NOTIFICATIONS
    ========================================================
    */

    const loadNotifications =
        useCallback(
            async () => {

                if (
                    !user?.id
                ) {

                    setOrderNotifications(
                        0
                    );


                    setPrescriptionNotifications(
                        0
                    );


                    return;

                }


                try {

                    const {
                        data,
                        error
                    } =
                        await supabase
                            .from(
                                "customer_notifications"
                            )
                            .select(`
                                id,
                                notification_type
                            `)
                            .eq(
                                "user_id",
                                user.id
                            )
                            .eq(
                                "is_read",
                                false
                            );


                    if (
                        error
                    ) {

                        throw error;

                    }


                    const rows =
                        data ||
                        [];


                    setOrderNotifications(
                        rows.filter(
                            item =>
                                item.notification_type ===
                                "order_status"
                        ).length
                    );


                    setPrescriptionNotifications(
                        rows.filter(
                            item =>
                                item.notification_type ===
                                "prescription_status"
                        ).length
                    );

                } catch (
                    notificationError
                ) {

                    console.error(
                        "Navbar notifications error:",
                        notificationError
                    );

                }

            },
            [
                user?.id
            ]
        );


    useEffect(
        () => {

            loadNotifications();

        },
        [
            loadNotifications
        ]
    );


    /*
    ========================================================
    NOTIFICATION REALTIME
    ========================================================
    */

    useEffect(
        () => {

            if (
                !user?.id
            ) {

                return undefined;

            }


            const channel =
                supabase
                    .channel(
                        `navbar-notifications-${user.id}`
                    )
                    .on(
                        "postgres_changes",
                        {
                            event:
                                "*",

                            schema:
                                "public",

                            table:
                                "customer_notifications",

                            filter:
                                `user_id=eq.${user.id}`
                        },
                        () => {

                            loadNotifications();

                        }
                    )
                    .subscribe();


            return () => {

                supabase
                    .removeChannel(
                        channel
                    );

            };

        },
        [
            user?.id,
            loadNotifications
        ]
    );


    /*
    ========================================================
    MARK NOTIFICATIONS READ
    ========================================================
    */

    const markNotificationsRead =
        async (
            type
        ) => {

            if (
                !user?.id
            ) {

                return;

            }


            if (
                type ===
                "order_status"
            ) {

                setOrderNotifications(
                    0
                );

            }


            if (
                type ===
                "prescription_status"
            ) {

                setPrescriptionNotifications(
                    0
                );

            }


            try {

                const {
                    error
                } =
                    await supabase
                        .from(
                            "customer_notifications"
                        )
                        .update({
                            is_read:
                                true
                        })
                        .eq(
                            "user_id",
                            user.id
                        )
                        .eq(
                            "notification_type",
                            type
                        )
                        .eq(
                            "is_read",
                            false
                        );


                if (
                    error
                ) {

                    throw error;

                }

            } catch (
                markError
            ) {

                console.error(
                    "Notification read error:",
                    markError
                );


                loadNotifications();

            }

        };


    /*
    ========================================================
    CLOSE MENU AFTER NAVIGATION
    ========================================================
    */

    useEffect(
        () => {

            setMenuOpen(
                false
            );

        },
        [
            location.pathname
        ]
    );


    /*
    ========================================================
    USER INFORMATION
    ========================================================
    */

    const avatarUrl =
        profile?.avatar_url ||
        user?.user_metadata?.avatar_url ||
        "";


    const displayName =
        profile?.full_name ||
        profile?.username ||
        user?.user_metadata?.full_name ||
        user?.email?.split("@")[0] ||
        text.account;


    const initials =
        useMemo(
            () => {

                return String(
                    displayName ||
                    "NP"
                )
                    .trim()
                    .split(/\s+/)
                    .slice(
                        0,
                        2
                    )
                    .map(
                        part =>
                            part[0]
                    )
                    .join("")
                    .toUpperCase() ||
                    "NP";

            },
            [
                displayName
            ]
        );


    /*
    ========================================================
    ADMIN
    ========================================================
    */

    const isAdmin =
        profile?.role ===
            "admin" ||
        profile?.role ===
            "super_admin";


    const onAdminPage =
        location.pathname ===
            "/admin" ||
        location.pathname
            .startsWith(
                "/admin/"
            );


    const onProfilePage =
        location.pathname ===
        "/account";


    const useAdminNavbar =
        !authLoading &&
        !roleLoading &&
        Boolean(
            user
        ) &&
        isAdmin &&
        (
            onAdminPage ||
            onProfilePage
        );


    /*
    ========================================================
    LOGOUT
    ========================================================
    */

    const handleLogout =
        async () => {

            try {

                await signOut();


                setProfile(
                    null
                );


                setOrderNotifications(
                    0
                );


                setPrescriptionNotifications(
                    0
                );


                setMenuOpen(
                    false
                );


                navigate(
                    "/",
                    {
                        replace:
                            true
                    }
                );

            } catch (
                logoutError
            ) {

                console.error(
                    "Logout error:",
                    logoutError
                );

            }

        };


    /*
    ========================================================
    PROFILE AVATAR
    ========================================================
    */

    const ProfileAvatar = ({
        small = false
    }) => (

        <span
            className={
                small
                    ? "navbar-profile-avatar small"
                    : "navbar-profile-avatar"
            }
        >

            {
                avatarUrl
                    ? (

                        <img
                            src={
                                avatarUrl
                            }
                            alt={
                                displayName
                            }
                        />

                    )
                    : (

                        <strong>

                            {
                                initials
                            }

                        </strong>

                    )
            }

        </span>

    );


    /*
    ========================================================
    NOTIFICATION BADGE
    ========================================================
    */

    const NotificationBadge = ({
        count
    }) => {

        if (
            !count
        ) {

            return null;

        }


        return (

            <span
                style={{
                    minWidth:
                        "19px",

                    height:
                        "19px",

                    padding:
                        "0 5px",

                    display:
                        "inline-grid",

                    placeItems:
                        "center",

                    borderRadius:
                        "999px",

                    background:
                        "#aa1018",

                    color:
                        "#ffffff",

                    fontSize:
                        "0.48rem",

                    fontWeight:
                        "900",

                    lineHeight:
                        "1"
                }}
            >

                {
                    count >
                    99
                        ? "99+"
                        : count
                }

            </span>

        );

    };


    /*
    ========================================================
    ADMIN NAVBAR
    ========================================================
    */

    if (
        useAdminNavbar
    ) {

        return (

            <header
                className="navbar navbar-admin"
                dir={
                    isArabic
                        ? "rtl"
                        : "ltr"
                }
            >

                <div className="container navbar-inner">


                    <Link
                        to="/admin"
                        className="navbar-brand navbar-admin-brand"
                    >

                        <img
                            src="/nabil-logo.png"
                            alt={
                                text.pharmacy
                            }
                        />


                        <div>

                            <strong>
                                {text.pharmacy}
                            </strong>

                            <span>
                                {text.adminPortal}
                            </span>

                        </div>

                    </Link>


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

                            <LayoutDashboard size={17} />

                            {text.dashboard}

                        </Link>


                        <Link
                            to="/admin/products"
                            className={
                                location.pathname.startsWith(
                                    "/admin/products"
                                )
                                    ? "active"
                                    : ""
                            }
                        >

                            <Package size={17} />

                            {text.products}

                        </Link>


                        <Link
                            to="/admin/inventory"
                            className={
                                location.pathname.startsWith(
                                    "/admin/inventory"
                                )
                                    ? "active"
                                    : ""
                            }
                        >

                            <Boxes size={17} />

                            {text.inventory}

                        </Link>


                        <Link
                            to="/admin/orders"
                            className={
                                location.pathname.startsWith(
                                    "/admin/orders"
                                )
                                    ? "active"
                                    : ""
                            }
                        >

                            <ShoppingBag size={17} />

                            {text.orders}

                        </Link>


                        <Link
                            to="/admin/prescriptions"
                            className={
                                location.pathname.startsWith(
                                    "/admin/prescriptions"
                                )
                                    ? "active"
                                    : ""
                            }
                        >

                            <FileText size={17} />

                            {text.prescriptions}

                        </Link>

                    </nav>


                    <div className="navbar-actions navbar-admin-actions">

                        <button
                            type="button"
                            className="navbar-language"
                            onClick={
                                toggleLanguage
                            }
                        >

                            <span className="navbar-language-symbol">
                                A
                            </span>

                            {
                                isArabic
                                    ? text.english
                                    : text.arabic
                            }

                        </button>


                        <Link
                            to="/"
                            className="navbar-view-site"
                        >

                            <Store size={17} />

                            {text.viewWebsite}

                        </Link>


                        <Link
                            to="/account"
                            className="navbar-profile-button"
                            aria-label={
                                text.profile
                            }
                            title={
                                displayName
                            }
                        >

                            <ProfileAvatar />

                        </Link>


                        <button
                            type="button"
                            className="navbar-admin-logout"
                            onClick={
                                handleLogout
                            }
                        >

                            <LogOut size={17} />

                            {text.signOut}

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
                            aria-label={
                                text.menu
                            }
                        >

                            {
                                menuOpen
                                    ? <X size={22} />
                                    : <Menu size={22} />
                            }

                        </button>

                    </div>

                </div>


                {
                    menuOpen && (

                        <div className="navbar-mobile-menu navbar-admin-mobile-menu">

                            <Link
                                to="/account"
                                className="navbar-mobile-profile"
                            >

                                <ProfileAvatar small />


                                <div>

                                    <strong>
                                        {displayName}
                                    </strong>

                                    <span>
                                        {text.profile}
                                    </span>

                                </div>

                            </Link>


                            <Link to="/admin">

                                <LayoutDashboard size={18} />

                                {text.dashboard}

                            </Link>


                            <Link to="/admin/products">

                                <Package size={18} />

                                {text.products}

                            </Link>


                            <Link to="/admin/inventory">

                                <Boxes size={18} />

                                {text.inventory}

                            </Link>


                            <Link to="/admin/orders">

                                <ShoppingBag size={18} />

                                {text.orders}

                            </Link>


                            <Link to="/admin/prescriptions">

                                <FileText size={18} />

                                {text.prescriptions}

                            </Link>


                            <Link to="/">

                                <Store size={18} />

                                {text.viewWebsite}

                            </Link>


                            <button
                                type="button"
                                onClick={
                                    handleLogout
                                }
                            >

                                <LogOut size={18} />

                                {text.signOut}

                            </button>

                        </div>

                    )
                }

            </header>

        );

    }


    /*
    ========================================================
    CUSTOMER NAVBAR
    ========================================================
    */

    return (

        <header
            className="navbar"
            dir={
                isArabic
                    ? "rtl"
                    : "ltr"
            }
        >

            <div className="container navbar-inner">


                <Link
                    to="/"
                    className="navbar-brand"
                >

                    <img
                        src="/nabil-logo.png"
                        alt={
                            text.pharmacy
                        }
                    />


                    <div>

                        <strong>
                            {text.pharmacy}
                        </strong>

                        <span>
                            {text.since}
                        </span>

                    </div>

                </Link>


                <nav className="navbar-links">

                    <Link to="/">
                        {text.home}
                    </Link>

                    <Link to="/products">
                        {text.products}
                    </Link>

                    <a href="/#services">
                        {text.services}
                    </a>

                    <a href="/#story">
                        {text.story}
                    </a>

                    <a href="/#contact">
                        {text.contact}
                    </a>

                </nav>


                <div className="navbar-actions">


                    <button
                        type="button"
                        className="navbar-language"
                        onClick={
                            toggleLanguage
                        }
                    >

                        <span className="navbar-language-symbol">
                            A
                        </span>


                        {
                            isArabic
                                ? text.english
                                : text.arabic
                        }

                    </button>


                    {
                        user
                            ? (

                                <Link
                                    to="/account"
                                    className="navbar-profile-button"
                                    aria-label={
                                        text.profile
                                    }
                                    title={
                                        displayName
                                    }
                                >

                                    <ProfileAvatar />

                                </Link>

                            )
                            : (

                                <Link
                                    to="/account"
                                    className="navbar-account"
                                >

                                    <UserRound size={18} />

                                    <span>
                                        {text.login}
                                    </span>

                                </Link>

                            )
                    }


                    {
                        user && (

                            <Link
                                to="/account/orders"
                                className="navbar-account"
                                title={
                                    text.myOrders
                                }
                                onClick={() =>
                                    markNotificationsRead(
                                        "order_status"
                                    )
                                }
                            >

                                <ShoppingBag size={18} />

                                <span>
                                    {text.myOrders}
                                </span>


                                <NotificationBadge
                                    count={
                                        orderNotifications
                                    }
                                />

                            </Link>

                        )
                    }


                    {
                        user && (

                            <Link
                                to="/account/prescriptions"
                                className="navbar-account"
                                title={
                                    text.myPrescriptions
                                }
                                onClick={() =>
                                    markNotificationsRead(
                                        "prescription_status"
                                    )
                                }
                            >

                                <FileText size={18} />

                                <span>
                                    {text.myPrescriptions}
                                </span>


                                <NotificationBadge
                                    count={
                                        prescriptionNotifications
                                    }
                                />

                            </Link>

                        )
                    }


                    <Link
                        to="/cart"
                        className="navbar-cart"
                        aria-label={
                            text.cart
                        }
                    >

                        <ShoppingBag size={19} />


                        {
                            cartCount >
                            0 && (

                                <span>
                                    {cartCount}
                                </span>

                            )
                        }

                    </Link>


                    <Link
                        to="/prescription"
                        className="navbar-prescription"
                    >

                        <Upload size={17} />

                        {text.prescription}

                    </Link>


                    <button
                        type="button"
                        className="navbar-menu-button"
                        onClick={() =>
                            setMenuOpen(
                                current =>
                                    !current
                            )
                        }
                        aria-label={
                            text.menu
                        }
                    >

                        {
                            menuOpen
                                ? <X size={22} />
                                : <Menu size={22} />
                        }

                    </button>

                </div>

            </div>


            {
                menuOpen && (

                    <div className="navbar-mobile-menu">

                        {
                            user && (

                                <Link
                                    to="/account"
                                    className="navbar-mobile-profile"
                                >

                                    <ProfileAvatar small />


                                    <div>

                                        <strong>
                                            {displayName}
                                        </strong>

                                        <span>
                                            {text.profile}
                                        </span>

                                    </div>

                                </Link>

                            )
                        }


                        <Link to="/">
                            {text.home}
                        </Link>


                        <Link to="/products">
                            {text.products}
                        </Link>


                        <a href="/#services">
                            {text.services}
                        </a>


                        <a href="/#story">
                            {text.story}
                        </a>


                        <a href="/#contact">
                            {text.contact}
                        </a>


                        {
                            !user && (

                                <Link to="/account">

                                    <UserRound size={17} />

                                    {text.login}

                                </Link>

                            )
                        }


                        {
                            user && (

                                <Link
                                    to="/account/orders"
                                    onClick={() =>
                                        markNotificationsRead(
                                            "order_status"
                                        )
                                    }
                                >

                                    <ShoppingBag size={17} />

                                    {text.myOrders}

                                    <NotificationBadge
                                        count={
                                            orderNotifications
                                        }
                                    />

                                </Link>

                            )
                        }


                        {
                            user && (

                                <Link
                                    to="/account/prescriptions"
                                    onClick={() =>
                                        markNotificationsRead(
                                            "prescription_status"
                                        )
                                    }
                                >

                                    <FileText size={17} />

                                    {text.myPrescriptions}

                                    <NotificationBadge
                                        count={
                                            prescriptionNotifications
                                        }
                                    />

                                </Link>

                            )
                        }


                        <Link to="/cart">

                            <ShoppingBag size={17} />

                            {text.cart}

                            {
                                cartCount >
                                0
                                    ? ` (${cartCount})`
                                    : ""
                            }

                        </Link>


                        <Link
                            to="/prescription"
                            className="navbar-mobile-prescription"
                        >

                            <Upload size={17} />

                            {text.prescription}

                        </Link>

                    </div>

                )
            }

        </header>

    );

}


export default Navbar;