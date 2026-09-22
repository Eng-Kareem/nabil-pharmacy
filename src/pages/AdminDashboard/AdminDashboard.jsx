import {
    AlertTriangle,
    Boxes,
    CheckCircle2,
    ChevronLeft,
    ChevronRight,
    CircleDollarSign,
    Clock3,
    Package,
    PackageCheck,
    ReceiptText,
    RefreshCw,
    ShoppingBag,
    TrendingUp
} from "lucide-react";

import {
    useCallback,
    useEffect,
    useMemo,
    useState
} from "react";

import {
    Link
} from "react-router-dom";

import {
    supabase
} from "../../lib/supabase.js";

import {
    useLanguage
} from "../../context/LanguageContext.jsx";

import adminTranslations
    from "../../i18n/adminTranslations.js";

import "./AdminDashboard.css";
import "./AdminDashboardRTL.css";


function AdminDashboard() {

    const {
        language,
        isArabic
    } = useLanguage();


    const text =
        adminTranslations[
            language
        ] ||
        adminTranslations.en;


    const ArrowIcon =
        isArabic
            ? ChevronLeft
            : ChevronRight;


    const [
        products,
        setProducts
    ] = useState([]);


    const [
        stockRows,
        setStockRows
    ] = useState([]);


    const [
        orders,
        setOrders
    ] = useState([]);


    const [
        loading,
        setLoading
    ] = useState(true);


    const [
        refreshing,
        setRefreshing
    ] = useState(false);


    const [
        error,
        setError
    ] = useState("");


    const [
        realtimeConnected,
        setRealtimeConnected
    ] = useState(false);


    /*
    ========================================================
    REPLACE TRANSLATION VARIABLES
    ========================================================
    */

    const replaceText = (
        value,
        replacements = {}
    ) => {

        let result =
            value;


        Object.entries(
            replacements
        ).forEach(
            ([
                key,
                replacement
            ]) => {

                result =
                    result.replaceAll(
                        `{${key}}`,
                        String(
                            replacement
                        )
                    );

            }
        );


        return result;

    };


    /*
    ========================================================
    FORMAT NUMBER
    ========================================================
    */

    const formatNumber = (
        value
    ) => {

        return Number(
            value ||
            0
        ).toLocaleString(
            isArabic
                ? "ar-EG"
                : "en-US"
        );

    };


    /*
    ========================================================
    FORMAT PRICE
    ========================================================
    */

    const formatPrice = (
        value
    ) => {

        const formatted =
            Number(
                value ||
                0
            ).toLocaleString(
                isArabic
                    ? "ar-EG"
                    : "en-US"
            );


        return isArabic
            ? `${formatted} ج.م`
            : `EGP ${formatted}`;

    };


    /*
    ========================================================
    FORMAT DATE
    ========================================================
    */

    const formatDate = (
        value
    ) => {

        if (
            !value
        ) {

            return "-";

        }


        return new Date(
            value
        ).toLocaleString(
            isArabic
                ? "ar-EG"
                : "en-US",
            {
                month:
                    "short",

                day:
                    "numeric",

                hour:
                    "2-digit",

                minute:
                    "2-digit"
            }
        );

    };


    /*
    ========================================================
    PRODUCT LANGUAGE
    ========================================================
    */

    const productName = (
        product
    ) => {

        if (
            isArabic &&
            product?.name_ar
        ) {

            return product.name_ar;

        }


        return (
            product?.name ||
            "-"
        );

    };


    const productBrand = (
        product
    ) => {

        if (
            isArabic &&
            product?.brand_ar
        ) {

            return product.brand_ar;

        }


        return (
            product?.brand ||
            text.noBrand
        );

    };


    /*
    ========================================================
    STATUS LANGUAGE
    ========================================================
    */

    const translateStatus = (
        status
    ) => {

        const value =
            String(
                status ||
                "pending"
            )
                .toLowerCase()
                .trim();


        const map = {

            pending:
                text.pending,

            confirmed:
                text.confirmed,

            preparing:
                text.preparing,

            ready:
                text.ready,

            out_for_delivery:
                text.outForDelivery,

            delivered:
                text.delivered,

            completed:
                text.completed,

            cancelled:
                text.cancelled

        };


        return (
            map[value] ||
            value.replaceAll(
                "_",
                " "
            )
        );

    };


    /*
    ========================================================
    ORDER NUMBER
    ========================================================
    */

    const orderNumber = (
        order
    ) => {

        if (
            !order?.id
        ) {

            return "NAB-ORDER";

        }


        return (
            `NAB-${order.id
                .replaceAll(
                    "-",
                    ""
                )
                .slice(
                    0,
                    8
                )
                .toUpperCase()}`
        );

    };


    /*
    ========================================================
    LOAD DASHBOARD
    ========================================================
    */

    const loadDashboard =
        useCallback(
            async (
                showLoader = false
            ) => {

                if (
                    showLoader
                ) {

                    setRefreshing(
                        true
                    );

                }


                setError(
                    ""
                );


                try {

                    const [
                        productsResponse,
                        stockResponse,
                        ordersResponse
                    ] =
                        await Promise.all([


                            supabase
                                .from(
                                    "products"
                                )
                                .select(`
                                    id,
                                    name,
                                    name_ar,
                                    brand,
                                    brand_ar,
                                    image_url,
                                    price,
                                    is_active,
                                    featured,
                                    created_at
                                `)
                                .order(
                                    "created_at",
                                    {
                                        ascending:
                                            false
                                    }
                                ),


                            supabase
                                .from(
                                    "branch_stock"
                                )
                                .select(`
                                    id,
                                    branch_id,
                                    product_id,
                                    quantity
                                `),


                            supabase
                                .from(
                                    "orders"
                                )
                                .select(`
                                    id,
                                    full_name,
                                    phone,
                                    total,
                                    status,
                                    payment_status,
                                    payment_method,
                                    delivery_method,
                                    created_at
                                `)
                                .order(
                                    "created_at",
                                    {
                                        ascending:
                                            false
                                    }
                                )

                        ]);


                    if (
                        productsResponse.error
                    ) {

                        throw productsResponse.error;

                    }


                    if (
                        stockResponse.error
                    ) {

                        throw stockResponse.error;

                    }


                    if (
                        ordersResponse.error
                    ) {

                        throw ordersResponse.error;

                    }


                    setProducts(
                        productsResponse.data ||
                        []
                    );


                    setStockRows(
                        stockResponse.data ||
                        []
                    );


                    setOrders(
                        ordersResponse.data ||
                        []
                    );

                } catch (
                    dashboardError
                ) {

                    console.error(
                        "Admin dashboard error:",
                        dashboardError
                    );


                    setError(
                        isArabic
                            ? text.dashboardLoadError
                            : (
                                dashboardError?.message ||
                                text.dashboardLoadError
                            )
                    );

                } finally {

                    setLoading(
                        false
                    );


                    setRefreshing(
                        false
                    );

                }

            },
            [
                isArabic,
                text.dashboardLoadError
            ]
        );


    /*
    ========================================================
    FIRST LOAD
    ========================================================
    */

    useEffect(
        () => {

            loadDashboard();

        },
        [
            loadDashboard
        ]
    );


    /*
    ========================================================
    REALTIME
    ========================================================
    */

    useEffect(
        () => {

            const channel =
                supabase
                    .channel(
                        "admin-dashboard-live"
                    )

                    .on(
                        "postgres_changes",
                        {
                            event:
                                "*",

                            schema:
                                "public",

                            table:
                                "orders"
                        },
                        () => {

                            loadDashboard();

                        }
                    )

                    .on(
                        "postgres_changes",
                        {
                            event:
                                "*",

                            schema:
                                "public",

                            table:
                                "branch_stock"
                        },
                        () => {

                            loadDashboard();

                        }
                    )

                    .on(
                        "postgres_changes",
                        {
                            event:
                                "*",

                            schema:
                                "public",

                            table:
                                "products"
                        },
                        () => {

                            loadDashboard();

                        }
                    )

                    .subscribe(
                        status => {

                            setRealtimeConnected(
                                status ===
                                "SUBSCRIBED"
                            );

                        }
                    );


            return () => {

                supabase.removeChannel(
                    channel
                );

            };

        },
        [
            loadDashboard
        ]
    );


    /*
    ========================================================
    PRODUCT STOCK MAP
    ========================================================
    */

    const productStock =
        useMemo(
            () => {

                const map = {};


                products.forEach(
                    product => {

                        map[
                            product.id
                        ] = 0;

                    }
                );


                stockRows.forEach(
                    row => {

                        map[
                            row.product_id
                        ] =
                            (
                                map[
                                    row.product_id
                                ] ||
                                0
                            ) +
                            Number(
                                row.quantity ||
                                0
                            );

                    }
                );


                return map;

            },
            [
                products,
                stockRows
            ]
        );


    /*
    ========================================================
    STATISTICS
    ========================================================
    */

    const stats =
        useMemo(
            () => {

                const activeProducts =
                    products.filter(
                        product =>
                            product.is_active
                    );


                const totalStock =
                    Object.values(
                        productStock
                    ).reduce(
                        (
                            sum,
                            quantity
                        ) =>
                            sum +
                            Number(
                                quantity ||
                                0
                            ),
                        0
                    );


                const lowStock =
                    activeProducts.filter(
                        product => {

                            const quantity =
                                productStock[
                                    product.id
                                ] ||
                                0;


                            return (
                                quantity >=
                                    1 &&
                                quantity <=
                                    5
                            );

                        }
                    );


                const outOfStock =
                    activeProducts.filter(
                        product =>
                            (
                                productStock[
                                    product.id
                                ] ||
                                0
                            ) ===
                            0
                    );


                const pendingOrders =
                    orders.filter(
                        order =>
                            order.status ===
                            "pending"
                    );


                const preparingOrders =
                    orders.filter(
                        order =>
                            order.status ===
                            "preparing"
                    );


                const readyOrders =
                    orders.filter(
                        order =>
                            order.status ===
                            "ready"
                    );


                const deliveredOrders =
                    orders.filter(
                        order =>
                            order.status ===
                            "delivered"
                    );


                const cancelledOrders =
                    orders.filter(
                        order =>
                            order.status ===
                            "cancelled"
                    );


                const deliveredRevenue =
                    deliveredOrders.reduce(
                        (
                            total,
                            order
                        ) =>
                            total +
                            Number(
                                order.total ||
                                0
                            ),
                        0
                    );


                return {

                    products:
                        activeProducts.length,

                    totalProducts:
                        products.length,

                    totalStock,

                    lowStock:
                        lowStock.length,

                    outOfStock:
                        outOfStock.length,

                    orders:
                        orders.length,

                    pending:
                        pendingOrders.length,

                    preparing:
                        preparingOrders.length,

                    ready:
                        readyOrders.length,

                    delivered:
                        deliveredOrders.length,

                    cancelled:
                        cancelledOrders.length,

                    revenue:
                        deliveredRevenue

                };

            },
            [
                products,
                productStock,
                orders
            ]
        );


    /*
    ========================================================
    STOCK ALERTS
    ========================================================
    */

    const stockAlerts =
        useMemo(
            () => {

                return products
                    .filter(
                        product =>
                            product.is_active
                    )
                    .map(
                        product => ({

                            ...product,

                            stock:
                                productStock[
                                    product.id
                                ] ||
                                0

                        })
                    )
                    .filter(
                        product =>
                            product.stock <=
                            5
                    )
                    .sort(
                        (
                            a,
                            b
                        ) =>
                            a.stock -
                            b.stock
                    )
                    .slice(
                        0,
                        6
                    );

            },
            [
                products,
                productStock
            ]
        );


    /*
    ========================================================
    RECENT ORDERS
    ========================================================
    */

    const recentOrders =
        useMemo(
            () =>
                orders.slice(
                    0,
                    6
                ),
            [
                orders
            ]
        );


    /*
    ========================================================
    LAST 7 DAYS SALES
    ========================================================
    */

    const salesData =
        useMemo(
            () => {

                const days = [];


                for (
                    let offset = 6;
                    offset >= 0;
                    offset -= 1
                ) {

                    const date =
                        new Date();


                    date.setHours(
                        0,
                        0,
                        0,
                        0
                    );


                    date.setDate(
                        date.getDate() -
                        offset
                    );


                    const nextDate =
                        new Date(
                            date
                        );


                    nextDate.setDate(
                        nextDate.getDate() +
                        1
                    );


                    const total =
                        orders
                            .filter(
                                order => {

                                    if (
                                        order.status !==
                                        "delivered"
                                    ) {

                                        return false;

                                    }


                                    const created =
                                        new Date(
                                            order.created_at
                                        );


                                    return (
                                        created >=
                                            date &&
                                        created <
                                            nextDate
                                    );

                                }
                            )
                            .reduce(
                                (
                                    sum,
                                    order
                                ) =>
                                    sum +
                                    Number(
                                        order.total ||
                                        0
                                    ),
                                0
                            );


                    days.push({

                        label:
                            date.toLocaleDateString(
                                isArabic
                                    ? "ar-EG"
                                    : "en-US",
                                {
                                    weekday:
                                        "short"
                                }
                            ),

                        total

                    });

                }


                return days;

            },
            [
                orders,
                isArabic
            ]
        );


    const maximumDailySales =
        useMemo(
            () =>
                Math.max(
                    1,
                    ...salesData.map(
                        day =>
                            day.total
                    )
                ),
            [
                salesData
            ]
        );


    /*
    ========================================================
    LOADING
    ========================================================
    */

    if (
        loading
    ) {

        return (

            <main
                className="admin-dashboard-page"
                dir={
                    isArabic
                        ? "rtl"
                        : "ltr"
                }
            >

                <div className="container">

                    <div className="admin-dashboard-loading">

                        <RefreshCw
                            size={36}
                            className="admin-dashboard-spinner"
                        />


                        <span>

                            {
                                text.loadingDashboard
                            }

                        </span>

                    </div>

                </div>

            </main>

        );

    }


    /*
    ========================================================
    PAGE
    ========================================================
    */

    return (

        <main
            className="admin-dashboard-page"
            dir={
                isArabic
                    ? "rtl"
                    : "ltr"
            }
        >

            <div className="container">


                {/* =========================================
                    HEADER
                ========================================= */}

                <header className="admin-dashboard-header">

                    <div>

                        <span className="admin-dashboard-label">

                            {
                                text.administration
                            }

                        </span>


                        <h1>

                            {
                                text.pharmacyDashboard
                            }

                        </h1>


                        <p>

                            {
                                text.dashboardDescription
                            }

                        </p>

                    </div>


                    <div className="admin-dashboard-header-actions">


                        <div
                            className={
                                realtimeConnected
                                    ? "admin-dashboard-live connected"
                                    : "admin-dashboard-live"
                            }
                        >

                            <span>
                            </span>


                            {
                                realtimeConnected
                                    ? text.liveData
                                    : text.connecting
                            }

                        </div>


                        <button
                            type="button"
                            className="admin-dashboard-refresh"
                            disabled={
                                refreshing
                            }
                            onClick={() =>
                                loadDashboard(
                                    true
                                )
                            }
                        >

                            <RefreshCw
                                size={17}
                                className={
                                    refreshing
                                        ? "admin-dashboard-spinner"
                                        : ""
                                }
                            />


                            {
                                refreshing
                                    ? text.refreshing
                                    : text.refresh
                            }

                        </button>

                    </div>

                </header>


                {/* =========================================
                    ERROR
                ========================================= */}

                {
                    error && (

                        <div className="admin-dashboard-error">

                            <AlertTriangle
                                size={18}
                            />

                            {
                                error
                            }

                        </div>

                    )
                }


                {/* =========================================
                    MAIN STATS
                ========================================= */}

                <section className="admin-dashboard-stat-grid">


                    <DashboardStat
                        icon={
                            <Package />
                        }
                        label={
                            text.activeProducts
                        }
                        value={
                            formatNumber(
                                stats.products
                            )
                        }
                        helper={
                            replaceText(
                                text.totalProductsHelper,
                                {
                                    count:
                                        formatNumber(
                                            stats.totalProducts
                                        )
                                }
                            )
                        }
                        link="/admin/products"
                        className="products"
                        ArrowIcon={
                            ArrowIcon
                        }
                    />


                    <DashboardStat
                        icon={
                            <Boxes />
                        }
                        label={
                            text.stockUnits
                        }
                        value={
                            formatNumber(
                                stats.totalStock
                            )
                        }
                        helper={
                            text.acrossInventory
                        }
                        link="/admin/inventory"
                        className="stock"
                        ArrowIcon={
                            ArrowIcon
                        }
                    />


                    <DashboardStat
                        icon={
                            <AlertTriangle />
                        }
                        label={
                            text.lowStock
                        }
                        value={
                            formatNumber(
                                stats.lowStock
                            )
                        }
                        helper={
                            replaceText(
                                text.outOfStockHelper,
                                {
                                    count:
                                        formatNumber(
                                            stats.outOfStock
                                        )
                                }
                            )
                        }
                        link="/admin/inventory"
                        className="warning"
                        ArrowIcon={
                            ArrowIcon
                        }
                    />


                    <DashboardStat
                        icon={
                            <ShoppingBag />
                        }
                        label={
                            text.totalOrders
                        }
                        value={
                            formatNumber(
                                stats.orders
                            )
                        }
                        helper={
                            replaceText(
                                text.waitingOrders,
                                {
                                    count:
                                        formatNumber(
                                            stats.pending
                                        )
                                }
                            )
                        }
                        link="/admin/orders"
                        className="orders"
                        ArrowIcon={
                            ArrowIcon
                        }
                    />


                    <DashboardStat
                        icon={
                            <CircleDollarSign />
                        }
                        label={
                            text.deliveredSales
                        }
                        value={
                            formatPrice(
                                stats.revenue
                            )
                        }
                        helper={
                            replaceText(
                                text.deliveredOrdersHelper,
                                {
                                    count:
                                        formatNumber(
                                            stats.delivered
                                        )
                                }
                            )
                        }
                        link="/admin/orders"
                        className="revenue"
                        ArrowIcon={
                            ArrowIcon
                        }
                    />

                </section>


                {/* =========================================
                    ORDER PIPELINE
                ========================================= */}

                <section className="admin-dashboard-order-pipeline">

                    <div className="admin-dashboard-section-heading">

                        <div>

                            <span>

                                {
                                    text.fulfilment
                                }

                            </span>


                            <h2>

                                {
                                    text.orderPipeline
                                }

                            </h2>

                        </div>


                        <Link to="/admin/orders">

                            {
                                text.manageOrders
                            }

                            <ArrowIcon
                                size={16}
                            />

                        </Link>

                    </div>


                    <div className="admin-dashboard-pipeline-grid">


                        <PipelineCard
                            icon={
                                <Clock3 />
                            }
                            label={
                                text.pending
                            }
                            value={
                                formatNumber(
                                    stats.pending
                                )
                            }
                            className="pending"
                        />


                        <PipelineCard
                            icon={
                                <Package />
                            }
                            label={
                                text.preparing
                            }
                            value={
                                formatNumber(
                                    stats.preparing
                                )
                            }
                            className="preparing"
                        />


                        <PipelineCard
                            icon={
                                <PackageCheck />
                            }
                            label={
                                text.ready
                            }
                            value={
                                formatNumber(
                                    stats.ready
                                )
                            }
                            className="ready"
                        />


                        <PipelineCard
                            icon={
                                <CheckCircle2 />
                            }
                            label={
                                text.delivered
                            }
                            value={
                                formatNumber(
                                    stats.delivered
                                )
                            }
                            className="delivered"
                        />

                    </div>

                </section>


                {/* =========================================
                    SALES + STOCK
                ========================================= */}

                <div className="admin-dashboard-middle-grid">


                    {/* SALES */}

                    <section className="admin-dashboard-panel">

                        <div className="admin-dashboard-section-heading">

                            <div>

                                <span>

                                    {
                                        text.performance
                                    }

                                </span>


                                <h2>

                                    {
                                        text.lastSevenDaysSales
                                    }

                                </h2>

                            </div>


                            <TrendingUp
                                size={22}
                            />

                        </div>


                        <div className="admin-dashboard-sales-chart">

                            {
                                salesData.map(
                                    day => {

                                        const percentage =
                                            (
                                                day.total /
                                                maximumDailySales
                                            ) *
                                            100;


                                        return (

                                            <div
                                                className="admin-dashboard-sales-day"
                                                key={
                                                    day.label
                                                }
                                            >

                                                <div className="admin-dashboard-sales-value">

                                                    {
                                                        day.total >
                                                        0
                                                            ? formatPrice(
                                                                day.total
                                                            )
                                                            : formatNumber(
                                                                0
                                                            )
                                                    }

                                                </div>


                                                <div className="admin-dashboard-sales-track">

                                                    <div
                                                        className="admin-dashboard-sales-bar"
                                                        style={{
                                                            height:
                                                                `${Math.max(
                                                                    percentage,
                                                                    day.total >
                                                                        0
                                                                        ? 7
                                                                        : 0
                                                                )}%`
                                                        }}
                                                    >
                                                    </div>

                                                </div>


                                                <span>

                                                    {
                                                        day.label
                                                    }

                                                </span>

                                            </div>

                                        );

                                    }
                                )
                            }

                        </div>

                    </section>


                    {/* STOCK */}

                    <section className="admin-dashboard-panel">

                        <div className="admin-dashboard-section-heading">

                            <div>

                                <span>

                                    {
                                        text.inventory
                                    }

                                </span>


                                <h2>

                                    {
                                        text.stockAlerts
                                    }

                                </h2>

                            </div>


                            <Link to="/admin/inventory">

                                {
                                    text.inventory
                                }

                                <ArrowIcon
                                    size={16}
                                />

                            </Link>

                        </div>


                        <div className="admin-dashboard-stock-list">

                            {
                                stockAlerts.length >
                                0
                                    ? (

                                        stockAlerts.map(
                                            product => (

                                                <div
                                                    className="admin-dashboard-stock-item"
                                                    key={
                                                        product.id
                                                    }
                                                >

                                                    <div className="admin-dashboard-stock-image">

                                                        {
                                                            product.image_url
                                                                ? (

                                                                    <img
                                                                        src={
                                                                            product.image_url
                                                                        }
                                                                        alt={
                                                                            productName(
                                                                                product
                                                                            )
                                                                        }
                                                                    />

                                                                )
                                                                : (

                                                                    <Package
                                                                        size={19}
                                                                    />

                                                                )
                                                        }

                                                    </div>


                                                    <div className="admin-dashboard-stock-info">

                                                        <strong>

                                                            {
                                                                productName(
                                                                    product
                                                                )
                                                            }

                                                        </strong>


                                                        <span>

                                                            {
                                                                productBrand(
                                                                    product
                                                                )
                                                            }

                                                        </span>

                                                    </div>


                                                    <div
                                                        className={
                                                            product.stock ===
                                                                0
                                                                ? "admin-dashboard-stock-count out"
                                                                : "admin-dashboard-stock-count low"
                                                        }
                                                    >

                                                        {
                                                            product.stock ===
                                                            0
                                                                ? text.out
                                                                : replaceText(
                                                                    text.unitsLeft,
                                                                    {
                                                                        count:
                                                                            formatNumber(
                                                                                product.stock
                                                                            )
                                                                    }
                                                                )
                                                        }

                                                    </div>

                                                </div>

                                            )
                                        )

                                    )
                                    : (

                                        <div className="admin-dashboard-all-good">

                                            <CheckCircle2
                                                size={30}
                                            />


                                            <strong>

                                                {
                                                    text.inventoryHealthy
                                                }

                                            </strong>


                                            <span>

                                                {
                                                    text.noLowStock
                                                }

                                            </span>

                                        </div>

                                    )
                            }

                        </div>

                    </section>

                </div>


                {/* =========================================
                    RECENT ORDERS
                ========================================= */}

                <section className="admin-dashboard-recent">

                    <div className="admin-dashboard-section-heading">

                        <div>

                            <span>

                                {
                                    text.latestActivity
                                }

                            </span>


                            <h2>

                                {
                                    text.recentOrders
                                }

                            </h2>

                        </div>


                        <Link to="/admin/orders">

                            {
                                text.viewAll
                            }

                            <ArrowIcon
                                size={16}
                            />

                        </Link>

                    </div>


                    {
                        recentOrders.length >
                        0
                            ? (

                                <div className="admin-dashboard-order-table-wrapper">

                                    <table className="admin-dashboard-order-table">

                                        <thead>

                                            <tr>

                                                <th>
                                                    {text.order}
                                                </th>

                                                <th>
                                                    {text.customer}
                                                </th>

                                                <th>
                                                    {text.date}
                                                </th>

                                                <th>
                                                    {text.total}
                                                </th>

                                                <th>
                                                    {text.status}
                                                </th>

                                                <th>
                                                    {text.receipt}
                                                </th>

                                            </tr>

                                        </thead>


                                        <tbody>

                                            {
                                                recentOrders.map(
                                                    order => (

                                                        <tr
                                                            key={
                                                                order.id
                                                            }
                                                        >

                                                            <td>

                                                                <strong
                                                                    dir="ltr"
                                                                >

                                                                    {
                                                                        orderNumber(
                                                                            order
                                                                        )
                                                                    }

                                                                </strong>

                                                            </td>


                                                            <td>

                                                                <div className="admin-dashboard-customer">

                                                                    <strong>

                                                                        {
                                                                            order.full_name ||
                                                                            text.guestCustomer
                                                                        }

                                                                    </strong>


                                                                    <span
                                                                        dir="ltr"
                                                                    >

                                                                        {
                                                                            order.phone ||
                                                                            "-"
                                                                        }

                                                                    </span>

                                                                </div>

                                                            </td>


                                                            <td>

                                                                {
                                                                    formatDate(
                                                                        order.created_at
                                                                    )
                                                                }

                                                            </td>


                                                            <td>

                                                                <strong>

                                                                    {
                                                                        formatPrice(
                                                                            order.total
                                                                        )
                                                                    }

                                                                </strong>

                                                            </td>


                                                            <td>

                                                                <span
                                                                    className={
                                                                        `admin-dashboard-order-status ${
                                                                            order.status ||
                                                                            "pending"
                                                                        }`
                                                                    }
                                                                >

                                                                    {
                                                                        translateStatus(
                                                                            order.status
                                                                        )
                                                                    }

                                                                </span>

                                                            </td>


                                                            <td>

                                                                <Link
                                                                    to={
                                                                        `/receipt/${order.id}`
                                                                    }
                                                                    className="admin-dashboard-receipt"
                                                                    aria-label={
                                                                        text.openReceipt
                                                                    }
                                                                >

                                                                    <ReceiptText
                                                                        size={17}
                                                                    />

                                                                </Link>

                                                            </td>

                                                        </tr>

                                                    )
                                                )
                                            }

                                        </tbody>

                                    </table>

                                </div>

                            )
                            : (

                                <div className="admin-dashboard-no-orders">

                                    <ShoppingBag
                                        size={36}
                                    />


                                    <strong>

                                        {
                                            text.noOrdersYet
                                        }

                                    </strong>


                                    <span>

                                        {
                                            text.ordersAppearHere
                                        }

                                    </span>

                                </div>

                            )
                    }

                </section>


                {/* =========================================
                    QUICK ACTIONS
                ========================================= */}

                <section className="admin-dashboard-quick-actions">


                    <Link to="/admin/products">

                        <Package
                            size={22}
                        />


                        <div>

                            <strong>

                                {
                                    text.manageProducts
                                }

                            </strong>


                            <span>

                                {
                                    text.manageProductsDescription
                                }

                            </span>

                        </div>


                        <ArrowIcon />

                    </Link>


                    <Link to="/admin/inventory">

                        <Boxes
                            size={22}
                        />


                        <div>

                            <strong>

                                {
                                    text.manageInventory
                                }

                            </strong>


                            <span>

                                {
                                    text.manageInventoryDescription
                                }

                            </span>

                        </div>


                        <ArrowIcon />

                    </Link>


                    <Link to="/admin/orders">

                        <ShoppingBag
                            size={22}
                        />


                        <div>

                            <strong>

                                {
                                    text.manageOrders
                                }

                            </strong>


                            <span>

                                {
                                    text.manageOrdersDescription
                                }

                            </span>

                        </div>


                        <ArrowIcon />

                    </Link>

                </section>

            </div>

        </main>

    );

}


/*
========================================================
STAT CARD
========================================================
*/

function DashboardStat({

    icon,
    label,
    value,
    helper,
    link,
    className,
    ArrowIcon

}) {

    return (

        <Link
            to={
                link
            }
            className={
                `admin-dashboard-stat-card ${className}`
            }
        >

            <div className="admin-dashboard-stat-icon">

                {icon}

            </div>


            <div className="admin-dashboard-stat-content">

                <span>
                    {label}
                </span>


                <strong>
                    {value}
                </strong>


                <small>
                    {helper}
                </small>

            </div>


            <ArrowIcon
                className="admin-dashboard-stat-arrow"
            />

        </Link>

    );

}


/*
========================================================
PIPELINE CARD
========================================================
*/

function PipelineCard({

    icon,
    label,
    value,
    className

}) {

    return (

        <div
            className={
                `admin-dashboard-pipeline-card ${className}`
            }
        >

            <div>
                {icon}
            </div>


            <span>
                {label}
            </span>


            <strong>
                {value}
            </strong>

        </div>

    );

}


export default AdminDashboard;