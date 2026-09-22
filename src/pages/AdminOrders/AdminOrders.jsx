import {
    AlertTriangle,
    Banknote,
    Check,
    ChevronDown,
    ChevronUp,
    CircleDollarSign,
    Clock3,
    Mail,
    MapPin,
    Package,
    Phone,
    ReceiptText,
    RefreshCw,
    Search,
    ShoppingBag,
    Truck,
    User,
    XCircle
} from "lucide-react";

import {
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

import adminOrdersTranslations
    from "../../i18n/adminOrdersTranslations.js";

import "./AdminOrders.css";
import "./AdminOrdersRTL.css";


const ORDER_STATUS_VALUES = [

    "pending",

    "preparing",

    "ready",

    "delivered",

    "cancelled"

];


function AdminOrders() {

    const {
        language,
        isArabic
    } = useLanguage();


    const text =
        adminOrdersTranslations[
            language
        ] ||
        adminOrdersTranslations.en;


    const [
        orders,
        setOrders
    ] = useState([]);


    const [
        loading,
        setLoading
    ] = useState(true);


    const [
        updatingOrderId,
        setUpdatingOrderId
    ] = useState(null);


    const [
        expandedOrderId,
        setExpandedOrderId
    ] = useState(null);


    const [
        searchTerm,
        setSearchTerm
    ] = useState("");


    const [
        statusFilter,
        setStatusFilter
    ] = useState("all");


    const [
        paymentFilter,
        setPaymentFilter
    ] = useState("all");


    const [
        error,
        setError
    ] = useState("");


    const [
        success,
        setSuccess
    ] = useState("");


    const [
        realtimeConnected,
        setRealtimeConnected
    ] = useState(false);


    /*
    ========================================================
    TEXT REPLACEMENT
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
    STATUS LABEL
    ========================================================
    */

    const getStatusLabel = (
        status
    ) => {

        const map = {

            pending:
                text.pending,

            preparing:
                text.preparing,

            ready:
                text.ready,

            delivered:
                text.delivered,

            cancelled:
                text.cancelled

        };


        return (
            map[
                status
            ] ||
            status ||
            "-"
        );

    };


    /*
    ========================================================
    PAYMENT STATUS
    ========================================================
    */

    const getPaymentStatusLabel = (
        status
    ) => {

        const map = {

            pending:
                text.paymentPending,

            paid:
                text.paid,

            failed:
                text.failed,

            refunded:
                text.refunded

        };


        return (
            map[
                status
            ] ||
            status ||
            "-"
        );

    };


    /*
    ========================================================
    LOAD ORDERS
    ========================================================
    */

    const loadOrders =
        async (
            showLoading = true
        ) => {

            if (
                showLoading
            ) {

                setLoading(
                    true
                );

            }


            setError(
                ""
            );


            try {

                const {
                    data,
                    error:
                        ordersError
                } =
                    await supabase
                        .from(
                            "orders"
                        )
                        .select(`
                            id,
                            customer_id,
                            full_name,
                            phone,
                            email,

                            delivery_method,
                            payment_method,

                            branch_id,

                            address,
                            area,
                            city,

                            latitude,
                            longitude,

                            notes,

                            subtotal,
                            delivery_fee,
                            total,

                            status,
                            payment_status,

                            created_at,
                            updated_at,

                            branches (
                                id,
                                name
                            ),

                            order_items (
                                id,
                                product_id,
                                product_name,
                                quantity,
                                unit_price,
                                line_total
                            )
                        `)
                        .order(
                            "created_at",
                            {
                                ascending:
                                    false
                            }
                        );


                if (
                    ordersError
                ) {

                    throw ordersError;

                }


                let loadedOrders =
                    data ||
                    [];


                /*
                ================================================
                ARABIC PRODUCT NAMES

                Order items contain a product-name snapshot.
                We keep that snapshot untouched and only replace
                the displayed name in Arabic mode.
                ================================================
                */

                if (
                    isArabic
                ) {

                    const productIds =
                        [
                            ...new Set(

                                loadedOrders
                                    .flatMap(
                                        order =>
                                            order.order_items ||
                                            []
                                    )
                                    .map(
                                        item =>
                                            item.product_id
                                    )
                                    .filter(
                                        Boolean
                                    )

                            )
                        ];


                    if (
                        productIds.length >
                        0
                    ) {

                        const {
                            data:
                                productsData,
                            error:
                                productsError
                        } =
                            await supabase
                                .from(
                                    "products"
                                )
                                .select(`
                                    id,
                                    name_ar
                                `)
                                .in(
                                    "id",
                                    productIds
                                );


                        if (
                            !productsError
                        ) {

                            const arabicNameMap =
                                new Map(
                                    (
                                        productsData ||
                                        []
                                    ).map(
                                        product => [

                                            product.id,

                                            product.name_ar

                                        ]
                                    )
                                );


                            loadedOrders =
                                loadedOrders.map(
                                    order => ({

                                        ...order,

                                        order_items:
                                            (
                                                order.order_items ||
                                                []
                                            ).map(
                                                item => ({

                                                    ...item,

                                                    product_name_display:
                                                        arabicNameMap.get(
                                                            item.product_id
                                                        ) ||
                                                        item.product_name

                                                })
                                            )

                                    })
                                );

                        }

                    }

                }


                setOrders(
                    loadedOrders
                );

            } catch (
                loadError
            ) {

                console.error(
                    "Admin orders load error:",
                    loadError
                );


                setError(
                    isArabic
                        ? text.loadError
                        : (
                            loadError?.message ||
                            text.loadError
                        )
                );

            } finally {

                if (
                    showLoading
                ) {

                    setLoading(
                        false
                    );

                }

            }

        };


    /*
    ========================================================
    INITIAL LOAD / LANGUAGE CHANGE
    ========================================================
    */

    useEffect(
        () => {

            loadOrders();

        },
        [
            language
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
                        "admin-orders-live"
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

                            loadOrders(
                                false
                            );

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
            language
        ]
    );


    /*
    ========================================================
    PRICE
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
                    : "en-US",
                {
                    minimumFractionDigits:
                        2,

                    maximumFractionDigits:
                        2
                }
            );


        return isArabic
            ? `${formatted} ج.م`
            : `EGP ${formatted}`;

    };


    /*
    ========================================================
    NUMBER
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
    DATE
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

                year:
                    "numeric",

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
    ORDER NUMBER
    ========================================================
    */

    const getOrderNumber = (
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
    UPDATE STATUS
    ========================================================
    */

    const updateOrderStatus =
        async (
            order,
            newStatus
        ) => {

            if (
                newStatus ===
                order.status
            ) {

                return;

            }


            if (
                newStatus ===
                "cancelled"
            ) {

                const confirmed =
                    window.confirm(
                        replaceText(
                            text.cancelConfirmation,
                            {
                                order:
                                    getOrderNumber(
                                        order
                                    )
                            }
                        )
                    );


                if (
                    !confirmed
                ) {

                    return;

                }

            }


            setUpdatingOrderId(
                order.id
            );


            setError(
                ""
            );


            setSuccess(
                ""
            );


            try {

                const {
                    error:
                        updateError
                } =
                    await supabase
                        .from(
                            "orders"
                        )
                        .update({

                            status:
                                newStatus,

                            updated_at:
                                new Date()
                                    .toISOString()

                        })
                        .eq(
                            "id",
                            order.id
                        );


                if (
                    updateError
                ) {

                    throw updateError;

                }


                if (
                    newStatus ===
                    "cancelled"
                ) {

                    setSuccess(
                        replaceText(
                            text.cancelledSuccess,
                            {
                                order:
                                    getOrderNumber(
                                        order
                                    )
                            }
                        )
                    );

                } else {

                    setSuccess(
                        replaceText(
                            text.statusChanged,
                            {

                                order:
                                    getOrderNumber(
                                        order
                                    ),

                                status:
                                    getStatusLabel(
                                        newStatus
                                    )

                            }
                        )
                    );

                }


                await loadOrders(
                    false
                );


                window.setTimeout(
                    () => {

                        setSuccess(
                            ""
                        );

                    },
                    3000
                );

            } catch (
                updateError
            ) {

                console.error(
                    "Order update error:",
                    updateError
                );


                setError(
                    isArabic
                        ? text.updateError
                        : (
                            updateError?.message ||
                            text.updateError
                        )
                );

            } finally {

                setUpdatingOrderId(
                    null
                );

            }

        };


    /*
    ========================================================
    FILTER ORDERS
    ========================================================
    */

    const filteredOrders =
        useMemo(
            () => {

                const term =
                    searchTerm
                        .trim()
                        .toLowerCase();


                return orders.filter(
                    order => {

                        const matchesSearch =
                            !term ||
                            [

                                order.id,

                                getOrderNumber(
                                    order
                                ),

                                order.full_name,

                                order.phone,

                                order.email,

                                order.address,

                                order.area,

                                order.city

                            ]
                                .filter(
                                    Boolean
                                )
                                .join(
                                    " "
                                )
                                .toLowerCase()
                                .includes(
                                    term
                                );


                        const matchesStatus =
                            statusFilter ===
                                "all" ||
                            order.status ===
                                statusFilter;


                        const matchesPayment =
                            paymentFilter ===
                                "all" ||
                            order.payment_status ===
                                paymentFilter;


                        return (
                            matchesSearch &&
                            matchesStatus &&
                            matchesPayment
                        );

                    }
                );

            },
            [
                orders,
                searchTerm,
                statusFilter,
                paymentFilter
            ]
        );


    /*
    ========================================================
    SUMMARY
    ========================================================
    */

    const summary =
        useMemo(
            () => {

                const pending =
                    orders.filter(
                        order =>
                            order.status ===
                            "pending"
                    ).length;


                const preparing =
                    orders.filter(
                        order =>
                            order.status ===
                            "preparing"
                    ).length;


                const ready =
                    orders.filter(
                        order =>
                            order.status ===
                            "ready"
                    ).length;


                const delivered =
                    orders.filter(
                        order =>
                            order.status ===
                            "delivered"
                    );


                const deliveredRevenue =
                    delivered.reduce(
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

                    total:
                        orders.length,

                    pending,

                    preparing,

                    ready,

                    deliveredRevenue

                };

            },
            [
                orders
            ]
        );


    /*
    ========================================================
    PAGE
    ========================================================
    */

    return (

        <main
            className="admin-orders-page"
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

                <header className="admin-orders-header">

                    <div>

                        <span>

                            {
                                text.orderManagement
                            }

                        </span>


                        <h1>

                            {
                                text.pharmacyOrders
                            }

                        </h1>


                        <p>

                            {
                                text.pageDescription
                            }

                        </p>

                    </div>


                    <div className="admin-orders-header-actions">

                        <div
                            className={
                                realtimeConnected
                                    ? "admin-orders-live connected"
                                    : "admin-orders-live"
                            }
                        >

                            <span>
                            </span>


                            {
                                realtimeConnected
                                    ? text.liveOrders
                                    : text.connecting
                            }

                        </div>


                        <button
                            type="button"
                            className="admin-orders-refresh"
                            onClick={() =>
                                loadOrders()
                            }
                        >

                            <RefreshCw
                                size={17}
                            />

                            {
                                text.refresh
                            }

                        </button>

                    </div>

                </header>


                {/* =========================================
                    MESSAGES
                ========================================= */}

                {
                    success && (

                        <div className="admin-orders-success">

                            <Check
                                size={17}
                            />

                            {
                                success
                            }

                        </div>

                    )
                }


                {
                    error && (

                        <div className="admin-orders-error">

                            <AlertTriangle
                                size={17}
                            />

                            {
                                error
                            }

                        </div>

                    )
                }


                {/* =========================================
                    SUMMARY
                ========================================= */}

                <section className="admin-orders-summary">

                    <SummaryCard
                        icon={
                            <ShoppingBag />
                        }
                        label={
                            text.totalOrders
                        }
                        value={
                            formatNumber(
                                summary.total
                            )
                        }
                    />


                    <SummaryCard
                        icon={
                            <Clock3 />
                        }
                        label={
                            text.pending
                        }
                        value={
                            formatNumber(
                                summary.pending
                            )
                        }
                        className="pending"
                    />


                    <SummaryCard
                        icon={
                            <Package />
                        }
                        label={
                            text.preparing
                        }
                        value={
                            formatNumber(
                                summary.preparing
                            )
                        }
                        className="preparing"
                    />


                    <SummaryCard
                        icon={
                            <Truck />
                        }
                        label={
                            text.ready
                        }
                        value={
                            formatNumber(
                                summary.ready
                            )
                        }
                        className="ready"
                    />


                    <SummaryCard
                        icon={
                            <CircleDollarSign />
                        }
                        label={
                            text.deliveredSales
                        }
                        value={
                            formatPrice(
                                summary.deliveredRevenue
                            )
                        }
                        className="revenue"
                    />

                </section>


                {/* =========================================
                    FILTERS
                ========================================= */}

                <section className="admin-orders-toolbar">

                    <div className="admin-orders-search">

                        <Search
                            size={18}
                        />


                        <input
                            type="search"
                            placeholder={
                                text.searchPlaceholder
                            }
                            value={
                                searchTerm
                            }
                            onChange={
                                event =>
                                    setSearchTerm(
                                        event.target.value
                                    )
                            }
                        />

                    </div>


                    <select
                        value={
                            statusFilter
                        }
                        onChange={
                            event =>
                                setStatusFilter(
                                    event.target.value
                                )
                        }
                    >

                        <option value="all">

                            {
                                text.allStatuses
                            }

                        </option>


                        {
                            ORDER_STATUS_VALUES.map(
                                status => (

                                    <option
                                        key={
                                            status
                                        }
                                        value={
                                            status
                                        }
                                    >

                                        {
                                            getStatusLabel(
                                                status
                                            )
                                        }

                                    </option>

                                )
                            )
                        }

                    </select>


                    <select
                        value={
                            paymentFilter
                        }
                        onChange={
                            event =>
                                setPaymentFilter(
                                    event.target.value
                                )
                        }
                    >

                        <option value="all">
                            {text.allPayments}
                        </option>

                        <option value="pending">
                            {text.paymentPending}
                        </option>

                        <option value="paid">
                            {text.paid}
                        </option>

                        <option value="failed">
                            {text.failed}
                        </option>

                        <option value="refunded">
                            {text.refunded}
                        </option>

                    </select>

                </section>


                {/* =========================================
                    ORDERS
                ========================================= */}

                {
                    loading
                        ? (

                            <div className="admin-orders-loading">

                                <RefreshCw
                                    size={34}
                                    className="admin-orders-spinner"
                                />

                                {
                                    text.loadingOrders
                                }

                            </div>

                        )
                        : filteredOrders.length ===
                            0
                            ? (

                                <div className="admin-orders-empty">

                                    <ShoppingBag
                                        size={40}
                                    />


                                    <h2>

                                        {
                                            text.noOrdersFound
                                        }

                                    </h2>


                                    <p>

                                        {
                                            text.ordersAppear
                                        }

                                    </p>

                                </div>

                            )
                            : (

                                <div className="admin-orders-list">

                                    {
                                        filteredOrders.map(
                                            order => (

                                                <OrderCard

                                                    key={
                                                        order.id
                                                    }

                                                    order={
                                                        order
                                                    }

                                                    orderNumber={
                                                        getOrderNumber(
                                                            order
                                                        )
                                                    }

                                                    text={
                                                        text
                                                    }

                                                    isArabic={
                                                        isArabic
                                                    }

                                                    statusValues={
                                                        ORDER_STATUS_VALUES
                                                    }

                                                    getStatusLabel={
                                                        getStatusLabel
                                                    }

                                                    getPaymentStatusLabel={
                                                        getPaymentStatusLabel
                                                    }

                                                    formatPrice={
                                                        formatPrice
                                                    }

                                                    formatNumber={
                                                        formatNumber
                                                    }

                                                    formatDate={
                                                        formatDate
                                                    }

                                                    expanded={
                                                        expandedOrderId ===
                                                        order.id
                                                    }

                                                    toggleExpanded={() =>
                                                        setExpandedOrderId(
                                                            current =>
                                                                current ===
                                                                    order.id
                                                                    ? null
                                                                    : order.id
                                                        )
                                                    }

                                                    updating={
                                                        updatingOrderId ===
                                                        order.id
                                                    }

                                                    updateStatus={
                                                        newStatus =>
                                                            updateOrderStatus(
                                                                order,
                                                                newStatus
                                                            )
                                                    }

                                                />

                                            )
                                        )
                                    }

                                </div>

                            )
                }

            </div>

        </main>

    );

}


/*
========================================================
SUMMARY CARD
========================================================
*/

function SummaryCard({

    icon,
    label,
    value,
    className = ""

}) {

    return (

        <div
            className={
                `admin-orders-summary-card ${className}`
            }
        >

            <div className="admin-orders-summary-icon">

                {icon}

            </div>


            <div>

                <span>
                    {label}
                </span>


                <strong>
                    {value}
                </strong>

            </div>

        </div>

    );

}


/*
========================================================
ORDER CARD
========================================================
*/

function OrderCard({

    order,

    orderNumber,

    text,

    isArabic,

    statusValues,

    getStatusLabel,

    getPaymentStatusLabel,

    formatPrice,

    formatNumber,

    formatDate,

    expanded,

    toggleExpanded,

    updating,

    updateStatus

}) {

    const paymentStatus =
        getPaymentStatusLabel(
            order.payment_status
        );


    return (

        <article className="admin-order-card">


            {/* =============================================
                MAIN ROW
            ============================================= */}

            <div className="admin-order-main">


                {/* ORDER */}

                <div className="admin-order-number">

                    <div>

                        <ShoppingBag
                            size={21}
                        />

                    </div>


                    <div>

                        <span>

                            {
                                text.order
                            }

                        </span>


                        <strong
                            dir="ltr"
                        >

                            {
                                orderNumber
                            }

                        </strong>


                        <small>

                            {
                                formatDate(
                                    order.created_at
                                )
                            }

                        </small>

                    </div>

                </div>


                {/* CUSTOMER */}

                <div className="admin-order-customer">

                    <span>

                        {
                            text.customer
                        }

                    </span>


                    <strong>

                        {
                            order.full_name ||
                            text.guestCustomer
                        }

                    </strong>


                    <small
                        dir="ltr"
                    >

                        {
                            order.phone ||
                            text.noPhone
                        }

                    </small>

                </div>


                {/* TOTAL */}

                <div className="admin-order-total">

                    <span>

                        {
                            text.total
                        }

                    </span>


                    <strong>

                        {
                            formatPrice(
                                order.total
                            )
                        }

                    </strong>

                </div>


                {/* PAYMENT */}

                <div className="admin-order-payment">

                    <span>

                        {
                            text.payment
                        }

                    </span>


                    <strong
                        className={
                            order.payment_status ===
                                "paid"
                                ? "paid"
                                : "pending"
                        }
                    >

                        {
                            paymentStatus
                        }

                    </strong>


                    <small>

                        {
                            order.payment_method ===
                                "card"
                                ? text.card
                                : text.cash
                        }

                    </small>

                </div>


                {/* STATUS */}

                <div className="admin-order-status-control">

                    <span>

                        {
                            text.status
                        }

                    </span>


                    <select
                        value={
                            order.status ||
                            "pending"
                        }
                        disabled={
                            updating ||
                            order.status ===
                                "cancelled"
                        }
                        onChange={
                            event =>
                                updateStatus(
                                    event.target.value
                                )
                        }
                        className={
                            `status-${order.status || "pending"}`
                        }
                    >

                        {
                            statusValues.map(
                                status => (

                                    <option
                                        key={
                                            status
                                        }
                                        value={
                                            status
                                        }
                                    >

                                        {
                                            getStatusLabel(
                                                status
                                            )
                                        }

                                    </option>

                                )
                            )
                        }

                    </select>


                    {
                        updating && (

                            <small>

                                {
                                    text.updating
                                }

                            </small>

                        )
                    }

                </div>


                {/* EXPAND */}

                <button
                    type="button"
                    className="admin-order-expand"
                    onClick={
                        toggleExpanded
                    }
                    aria-label={
                        expanded
                            ? text.collapseOrder
                            : text.expandOrder
                    }
                >

                    {
                        expanded
                            ? (
                                <ChevronUp />
                            )
                            : (
                                <ChevronDown />
                            )
                    }

                </button>

            </div>


            {/* =============================================
                DETAILS
            ============================================= */}

            {
                expanded && (

                    <div className="admin-order-details">


                        {/* CUSTOMER DETAILS */}

                        <section className="admin-order-details-section">

                            <h3>

                                {
                                    text.customerDetails
                                }

                            </h3>


                            <DetailRow
                                icon={
                                    <User />
                                }
                                label={
                                    text.name
                                }
                                value={
                                    order.full_name ||
                                    "-"
                                }
                            />


                            <DetailRow
                                icon={
                                    <Phone />
                                }
                                label={
                                    text.phone
                                }
                                value={
                                    order.phone ||
                                    "-"
                                }
                                ltr
                            />


                            <DetailRow
                                icon={
                                    <Mail />
                                }
                                label={
                                    text.email
                                }
                                value={
                                    order.email ||
                                    text.notProvided
                                }
                                ltr={
                                    Boolean(
                                        order.email
                                    )
                                }
                            />

                        </section>


                        {/* DELIVERY */}

                        <section className="admin-order-details-section">

                            <h3>

                                {
                                    text.delivery
                                }

                            </h3>


                            <DetailRow
                                icon={
                                    <Truck />
                                }
                                label={
                                    text.method
                                }
                                value={
                                    order.delivery_method ===
                                        "pickup"
                                        ? text.pharmacyPickup
                                        : text.homeDelivery
                                }
                            />


                            <DetailRow
                                icon={
                                    <MapPin />
                                }
                                label={
                                    text.address
                                }
                                value={
                                    order.delivery_method ===
                                        "pickup"
                                        ? (
                                            order.branches?.name ||
                                            text.pharmacyBranch
                                        )
                                        : (
                                            [

                                                order.address,

                                                order.area,

                                                order.city

                                            ]
                                                .filter(
                                                    Boolean
                                                )
                                                .join(
                                                    isArabic
                                                        ? "، "
                                                        : ", "
                                                ) ||
                                            "-"
                                        )
                                }
                            />


                            {
                                order.notes && (

                                    <div className="admin-order-notes">

                                        <span>

                                            {
                                                text.customerNotes
                                            }

                                        </span>


                                        <p>

                                            {
                                                order.notes
                                            }

                                        </p>

                                    </div>

                                )
                            }

                        </section>


                        {/* PAYMENT */}

                        <section className="admin-order-details-section">

                            <h3>

                                {
                                    text.payment
                                }

                            </h3>


                            <DetailRow
                                icon={
                                    <Banknote />
                                }
                                label={
                                    text.method
                                }
                                value={
                                    order.payment_method ===
                                        "card"
                                        ? text.cardPayment
                                        : text.cashOnDelivery
                                }
                            />


                            <DetailRow
                                icon={
                                    order.payment_status ===
                                        "paid"
                                        ? (
                                            <Check />
                                        )
                                        : (
                                            <Clock3 />
                                        )
                                }
                                label={
                                    text.paymentStatus
                                }
                                value={
                                    paymentStatus
                                }
                            />

                        </section>


                        {/* PRODUCTS */}

                        <section className="admin-order-products">

                            <h3>

                                {
                                    text.orderedProducts
                                }

                            </h3>


                            <div className="admin-order-products-list">

                                {
                                    (
                                        order.order_items ||
                                        []
                                    ).map(
                                        item => (

                                            <div
                                                className="admin-order-product"
                                                key={
                                                    item.id
                                                }
                                            >

                                                <div className="admin-order-product-icon">

                                                    <Package
                                                        size={19}
                                                    />

                                                </div>


                                                <div>

                                                    <strong>

                                                        {
                                                            item.product_name_display ||
                                                            item.product_name ||
                                                            text.product
                                                        }

                                                    </strong>


                                                    <span>

                                                        {
                                                            text.quantityShort
                                                        }

                                                        {" "}

                                                        {
                                                            formatNumber(
                                                                item.quantity
                                                            )
                                                        }

                                                        {" × "}

                                                        {
                                                            formatPrice(
                                                                item.unit_price
                                                            )
                                                        }

                                                    </span>

                                                </div>


                                                <strong>

                                                    {
                                                        formatPrice(
                                                            item.line_total
                                                        )
                                                    }

                                                </strong>

                                            </div>

                                        )
                                    )
                                }

                            </div>


                            {/* MONEY */}

                            <div className="admin-order-money">

                                <div>

                                    <span>

                                        {
                                            text.subtotal
                                        }

                                    </span>


                                    <strong>

                                        {
                                            formatPrice(
                                                order.subtotal
                                            )
                                        }

                                    </strong>

                                </div>


                                <div>

                                    <span>

                                        {
                                            text.deliveryFee
                                        }

                                    </span>


                                    <strong>

                                        {
                                            formatPrice(
                                                order.delivery_fee
                                            )
                                        }

                                    </strong>

                                </div>


                                <div className="total">

                                    <span>

                                        {
                                            text.total
                                        }

                                    </span>


                                    <strong>

                                        {
                                            formatPrice(
                                                order.total
                                            )
                                        }

                                    </strong>

                                </div>

                            </div>

                        </section>


                        {/* RECEIPT */}

                        <Link
                            to={
                                `/receipt/${order.id}`
                            }
                            className="admin-order-receipt-button"
                        >

                            <ReceiptText
                                size={17}
                            />

                            {
                                text.viewPrintReceipt
                            }

                        </Link>


                        {/* CANCELLED */}

                        {
                            order.status ===
                                "cancelled" && (

                                <div className="admin-order-cancelled-note">

                                    <XCircle
                                        size={18}
                                    />


                                    <div>

                                        <strong>

                                            {
                                                text.orderCancelled
                                            }

                                        </strong>


                                        <span>

                                            {
                                                text.cancelledInventory
                                            }

                                        </span>

                                    </div>

                                </div>

                            )
                        }


                        {/* DELIVERED */}

                        {
                            order.status ===
                                "delivered" && (

                                <div className="admin-order-delivered-note">

                                    <Check
                                        size={18}
                                    />


                                    <div>

                                        <strong>

                                            {
                                                text.orderDelivered
                                            }

                                        </strong>


                                        <span>

                                            {
                                                text.deliveredDescription
                                            }

                                        </span>

                                    </div>

                                </div>

                            )
                        }

                    </div>

                )
            }

        </article>

    );

}


/*
========================================================
DETAIL ROW
========================================================
*/

function DetailRow({

    icon,
    label,
    value,
    ltr = false

}) {

    return (

        <div className="admin-order-detail-row">

            <div className="admin-order-detail-icon">

                {icon}

            </div>


            <div>

                <span>

                    {
                        label
                    }

                </span>


                <strong
                    dir={
                        ltr
                            ? "ltr"
                            : undefined
                    }
                >

                    {
                        value
                    }

                </strong>

            </div>

        </div>

    );

}


export default AdminOrders;