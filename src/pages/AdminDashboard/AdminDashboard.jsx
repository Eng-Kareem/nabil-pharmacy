import {
    AlertTriangle,
    Boxes,
    CheckCircle2,
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

import "./AdminDashboard.css";


function AdminDashboard() {

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
    LOAD DASHBOARD DATA
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
                    setRefreshing(true);
                }


                setError("");


                try {

                    const [
                        productsResponse,
                        stockResponse,
                        ordersResponse
                    ] = await Promise.all([


                        /*
                        PRODUCTS
                        */

                        supabase
                            .from("products")
                            .select(`
                                id,
                                name,
                                brand,
                                image_url,
                                price,
                                is_active,
                                featured,
                                created_at
                            `)
                            .order(
                                "created_at",
                                {
                                    ascending: false
                                }
                            ),



                        /*
                        INVENTORY
                        */

                        supabase
                            .from("branch_stock")
                            .select(`
                                id,
                                branch_id,
                                product_id,
                                quantity
                            `),



                        /*
                        ORDERS
                        */

                        supabase
                            .from("orders")
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
                                    ascending: false
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

                } catch (error) {

                    console.error(
                        "Admin dashboard error:",
                        error
                    );


                    setError(
                        error?.message ||
                        "Could not load dashboard information."
                    );

                } finally {

                    setLoading(false);

                    setRefreshing(false);
                }
            },
            []
        );


    /*
    ========================================================
    FIRST LOAD
    ========================================================
    */

    useEffect(() => {

        loadDashboard();

    }, [
        loadDashboard
    ]);


    /*
    ========================================================
    REALTIME DASHBOARD
    ========================================================
    */

    useEffect(() => {

        const channel =
            supabase
                .channel(
                    "admin-dashboard-live"
                )

                .on(
                    "postgres_changes",
                    {
                        event: "*",
                        schema: "public",
                        table: "orders"
                    },
                    () => {

                        loadDashboard();

                    }
                )

                .on(
                    "postgres_changes",
                    {
                        event: "*",
                        schema: "public",
                        table: "branch_stock"
                    },
                    () => {

                        loadDashboard();

                    }
                )

                .on(
                    "postgres_changes",
                    {
                        event: "*",
                        schema: "public",
                        table: "products"
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

    }, [
        loadDashboard
    ]);


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

                        const quantity =
                            Number(
                                row.quantity
                            ) || 0;


                        map[
                            row.product_id
                        ] =
                            (
                                map[
                                    row.product_id
                                ] ||
                                0
                            ) +
                            quantity;

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
    DASHBOARD STATISTICS
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
                    )
                        .reduce(
                            (
                                total,
                                quantity
                            ) =>
                                total +
                                Number(
                                    quantity
                                ),
                            0
                        );


                const lowStock =
                    activeProducts.filter(
                        product => {

                            const quantity =
                                productStock[
                                    product.id
                                ] || 0;


                            return (
                                quantity >= 1 &&
                                quantity <= 5
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
                            ) === 0
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
    STOCK ALERT PRODUCTS
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
                                ] || 0

                        })
                    )

                    .filter(
                        product =>
                            product.stock <= 5
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
            () => {

                return orders.slice(
                    0,
                    6
                );

            },
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
                                        created >= date &&
                                        created < nextDate
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
                                undefined,
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
                orders
            ]
        );


    const maximumDailySales =
        useMemo(
            () => {

                return Math.max(
                    1,
                    ...salesData.map(
                        day =>
                            day.total
                    )
                );

            },
            [
                salesData
            ]
        );


    /*
    ========================================================
    FORMAT PRICE
    ========================================================
    */

    const formatPrice = (
        value
    ) => {

        return (
            `EGP ${Number(
                value ||
                0
            ).toLocaleString()}`
        );
    };


    /*
    ========================================================
    FORMAT ORDER NUMBER
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
            undefined,
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
    LOADING
    ========================================================
    */

    if (
        loading
    ) {

        return (

            <main className="admin-dashboard-page">

                <div className="container">

                    <div className="admin-dashboard-loading">

                        <RefreshCw
                            size={36}
                            className="admin-dashboard-spinner"
                        />


                        <span>
                            Loading pharmacy dashboard...
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

        <main className="admin-dashboard-page">

            <div className="container">


                {/* =================================================
                    HEADER
                ================================================= */}

                <header className="admin-dashboard-header">


                    <div>

                        <span className="admin-dashboard-label">
                            Administration
                        </span>


                        <h1>
                            Pharmacy Dashboard
                        </h1>


                        <p>

                            Monitor pharmacy products,
                            inventory, orders and sales
                            from one place.

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
                                    ? "Live Data"
                                    : "Connecting..."
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
                                    ? "Refreshing"
                                    : "Refresh"
                            }

                        </button>

                    </div>

                </header>



                {/* =================================================
                    ERROR
                ================================================= */}

                {
                    error && (

                        <div className="admin-dashboard-error">

                            <AlertTriangle
                                size={18}
                            />

                            {error}

                        </div>

                    )
                }



                {/* =================================================
                    MAIN STATS
                ================================================= */}

                <section className="admin-dashboard-stat-grid">


                    <DashboardStat
                        icon={
                            <Package />
                        }
                        label="Active Products"
                        value={
                            stats.products
                        }
                        helper={
                            `${stats.totalProducts} total products`
                        }
                        link="/admin/products"
                        className="products"
                    />


                    <DashboardStat
                        icon={
                            <Boxes />
                        }
                        label="Stock Units"
                        value={
                            stats.totalStock
                        }
                        helper="Across pharmacy inventory"
                        link="/admin/inventory"
                        className="stock"
                    />


                    <DashboardStat
                        icon={
                            <AlertTriangle />
                        }
                        label="Low Stock"
                        value={
                            stats.lowStock
                        }
                        helper={
                            `${stats.outOfStock} out of stock`
                        }
                        link="/admin/inventory"
                        className="warning"
                    />


                    <DashboardStat
                        icon={
                            <ShoppingBag />
                        }
                        label="Total Orders"
                        value={
                            stats.orders
                        }
                        helper={
                            `${stats.pending} waiting`
                        }
                        link="/admin/orders"
                        className="orders"
                    />


                    <DashboardStat
                        icon={
                            <CircleDollarSign />
                        }
                        label="Delivered Sales"
                        value={
                            formatPrice(
                                stats.revenue
                            )
                        }
                        helper={
                            `${stats.delivered} delivered orders`
                        }
                        link="/admin/orders"
                        className="revenue"
                    />

                </section>



                {/* =================================================
                    ORDER PIPELINE
                ================================================= */}

                <section className="admin-dashboard-order-pipeline">


                    <div className="admin-dashboard-section-heading">

                        <div>

                            <span>
                                Fulfilment
                            </span>


                            <h2>
                                Order Pipeline
                            </h2>

                        </div>


                        <Link
                            to="/admin/orders"
                        >

                            Manage Orders

                            <ChevronRight
                                size={16}
                            />

                        </Link>

                    </div>


                    <div className="admin-dashboard-pipeline-grid">


                        <PipelineCard
                            icon={
                                <Clock3 />
                            }
                            label="Pending"
                            value={
                                stats.pending
                            }
                            className="pending"
                        />


                        <PipelineCard
                            icon={
                                <Package />
                            }
                            label="Preparing"
                            value={
                                stats.preparing
                            }
                            className="preparing"
                        />


                        <PipelineCard
                            icon={
                                <PackageCheck />
                            }
                            label="Ready"
                            value={
                                stats.ready
                            }
                            className="ready"
                        />


                        <PipelineCard
                            icon={
                                <CheckCircle2 />
                            }
                            label="Delivered"
                            value={
                                stats.delivered
                            }
                            className="delivered"
                        />

                </div>

                </section>



                {/* =================================================
                    SALES + STOCK
                ================================================= */}

                <div className="admin-dashboard-middle-grid">


                    {/* SALES */}

                    <section className="admin-dashboard-panel">

                        <div className="admin-dashboard-section-heading">

                            <div>

                                <span>
                                    Performance
                                </span>


                                <h2>
                                    Last 7 Days Sales
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
                                                            : "0"
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



                    {/* STOCK ALERTS */}

                    <section className="admin-dashboard-panel">

                        <div className="admin-dashboard-section-heading">

                            <div>

                                <span>
                                    Inventory
                                </span>


                                <h2>
                                    Stock Alerts
                                </h2>

                            </div>


                            <Link
                                to="/admin/inventory"
                            >

                                Inventory

                                <ChevronRight
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
                                                                            product.name
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
                                                                product.name
                                                            }

                                                        </strong>


                                                        <span>

                                                            {
                                                                product.brand ||
                                                                "No brand"
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
                                                                ? "Out"
                                                                : `${product.stock} left`
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
                                                Inventory looks healthy
                                            </strong>


                                            <span>

                                                No products currently
                                                have low stock.

                                            </span>

                                        </div>

                                    )
                            }

                        </div>

                    </section>

                </div>



                {/* =================================================
                    RECENT ORDERS
                ================================================= */}

                <section className="admin-dashboard-recent">


                    <div className="admin-dashboard-section-heading">

                        <div>

                            <span>
                                Latest Activity
                            </span>


                            <h2>
                                Recent Orders
                            </h2>

                        </div>


                        <Link
                            to="/admin/orders"
                        >

                            View All

                            <ChevronRight
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
                                                    Order
                                                </th>

                                                <th>
                                                    Customer
                                                </th>

                                                <th>
                                                    Date
                                                </th>

                                                <th>
                                                    Total
                                                </th>

                                                <th>
                                                    Status
                                                </th>

                                                <th>
                                                    Receipt
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

                                                                <strong>

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
                                                                            "Guest Customer"
                                                                        }

                                                                    </strong>


                                                                    <span>

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
                                                                        `admin-dashboard-order-status ${order.status || "pending"}`
                                                                    }
                                                                >

                                                                    {
                                                                        order.status ||
                                                                        "pending"
                                                                    }

                                                                </span>

                                                            </td>


                                                            <td>

                                                                <Link
                                                                    to={
                                                                        `/receipt/${order.id}`
                                                                    }
                                                                    className="admin-dashboard-receipt"
                                                                    aria-label="Open receipt"
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
                                        No orders yet
                                    </strong>


                                    <span>

                                        Customer orders will
                                        appear here automatically.

                                    </span>

                                </div>

                            )
                    }

                </section>



                {/* =================================================
                    QUICK ACTIONS
                ================================================= */}

                <section className="admin-dashboard-quick-actions">


                    <Link
                        to="/admin/products"
                    >

                        <Package
                            size={22}
                        />


                        <div>

                            <strong>
                                Manage Products
                            </strong>


                            <span>
                                Add, edit and publish products
                            </span>

                        </div>


                        <ChevronRight />

                    </Link>



                    <Link
                        to="/admin/inventory"
                    >

                        <Boxes
                            size={22}
                        />


                        <div>

                            <strong>
                                Manage Inventory
                            </strong>


                            <span>
                                Update pharmacy stock
                            </span>

                        </div>


                        <ChevronRight />

                    </Link>



                    <Link
                        to="/admin/orders"
                    >

                        <ShoppingBag
                            size={22}
                        />


                        <div>

                            <strong>
                                Manage Orders
                            </strong>


                            <span>
                                Process customer orders
                            </span>

                        </div>


                        <ChevronRight />

                    </Link>

                </section>

            </div>

        </main>
    );
}



/*
========================================================
MAIN STAT CARD
========================================================
*/

function DashboardStat({

    icon,

    label,

    value,

    helper,

    link,

    className

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


            <ChevronRight
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