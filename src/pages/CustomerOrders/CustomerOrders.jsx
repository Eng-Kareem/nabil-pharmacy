import {
    AlertTriangle,
    Ban,
    CheckCircle2,
    Clock3,
    Package,
    PackageCheck,
    ReceiptText,
    RefreshCw,
    ShoppingBag,
    Store,
    Truck,
    XCircle
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
    useAuth
} from "../../context/AuthContext.jsx";

import {
    useLanguage
} from "../../context/LanguageContext.jsx";

import "./CustomerOrders.css";


function CustomerOrders() {

    const {
        user,
        authLoading
    } = useAuth();


    const {
        isArabic
    } = useLanguage();


    const text =
        isArabic
            ? {
                eyebrow:
                    "حسابي",

                title:
                    "طلباتي",

                description:
                    "تابع جميع طلباتك وحالة تجهيزها بشكل مباشر.",

                live:
                    "مباشر",

                connecting:
                    "جاري الاتصال",

                refresh:
                    "تحديث",

                total:
                    "إجمالي الطلبات",

                pending:
                    "قيد الانتظار",

                preparing:
                    "جاري التجهيز",

                ready:
                    "جاهز",

                delivered:
                    "تم التوصيل",

                cancelled:
                    "ملغي",

                delivery:
                    "توصيل",

                pickup:
                    "استلام من الصيدلية",

                payment:
                    "الدفع",

                paymentPending:
                    "في الانتظار",

                paid:
                    "مدفوع",

                receipt:
                    "عرض الإيصال",

                order:
                    "طلب",

                noOrders:
                    "لا توجد طلبات حتى الآن",

                noOrdersText:
                    "بعد إتمام أول طلب سيظهر هنا ويمكنك متابعة حالته.",

                shop:
                    "تصفح المنتجات",

                loadError:
                    "تعذر تحميل الطلبات.",

                signInRequired:
                    "يجب تسجيل الدخول",

                signInText:
                    "سجّل الدخول لعرض الطلبات الخاصة بحسابك.",

                signIn:
                    "تسجيل الدخول",

                placed:
                    "تم الطلب",

                preparingStep:
                    "التجهيز",

                readyStep:
                    "جاهز",

                deliveredStep:
                    "تم التوصيل",

                cancel:
                    "إلغاء الطلب",

                cancelling:
                    "جاري الإلغاء...",

                cancelConfirm:
                    "هل أنت متأكد أنك تريد إلغاء هذا الطلب؟ سيتم إعادة المنتجات إلى المخزون.",

                cancelSuccess:
                    "تم إلغاء الطلب وإعادة المنتجات إلى المخزون.",

                cancelFailed:
                    "تعذر إلغاء الطلب."
            }
            : {
                eyebrow:
                    "MY ACCOUNT",

                title:
                    "My Orders",

                description:
                    "Track all your pharmacy orders and fulfilment status live.",

                live:
                    "Live",

                connecting:
                    "Connecting",

                refresh:
                    "Refresh",

                total:
                    "Total Orders",

                pending:
                    "Pending",

                preparing:
                    "Preparing",

                ready:
                    "Ready",

                delivered:
                    "Delivered",

                cancelled:
                    "Cancelled",

                delivery:
                    "Delivery",

                pickup:
                    "Pharmacy Pickup",

                payment:
                    "Payment",

                paymentPending:
                    "Pending",

                paid:
                    "Paid",

                receipt:
                    "View Receipt",

                order:
                    "Order",

                noOrders:
                    "No orders yet",

                noOrdersText:
                    "Once you place your first order it will appear here and you can track it live.",

                shop:
                    "Browse Products",

                loadError:
                    "Could not load your orders.",

                signInRequired:
                    "Sign in required",

                signInText:
                    "Sign in to see the orders belonging to your account.",

                signIn:
                    "Sign In",

                placed:
                    "Placed",

                preparingStep:
                    "Preparing",

                readyStep:
                    "Ready",

                deliveredStep:
                    "Delivered",

                cancel:
                    "Cancel Order",

                cancelling:
                    "Cancelling...",

                cancelConfirm:
                    "Are you sure you want to cancel this order? The reserved products will be returned to inventory.",

                cancelSuccess:
                    "Order cancelled successfully and the products were returned to inventory.",

                cancelFailed:
                    "Could not cancel this order."
            };


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
        success,
        setSuccess
    ] = useState("");


    const [
        cancellingId,
        setCancellingId
    ] = useState(null);


    const [
        realtimeConnected,
        setRealtimeConnected
    ] = useState(false);


    /*
    ========================================================
    LOAD ORDERS
    ========================================================
    */

    const loadOrders =
        useCallback(
            async (
                showRefresh = false
            ) => {

                if (
                    !user?.id
                ) {

                    setOrders(
                        []
                    );


                    setLoading(
                        false
                    );


                    return;

                }


                if (
                    showRefresh
                ) {

                    setRefreshing(
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
                            loadError
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
                                delivery_method,
                                payment_method,
                                payment_status,
                                status,
                                address,
                                area,
                                city,
                                subtotal,
                                delivery_fee,
                                total,
                                cancelled_at,
                                created_at,
                                updated_at
                            `)
                            .eq(
                                "customer_id",
                                user.id
                            )
                            .order(
                                "created_at",
                                {
                                    ascending:
                                        false
                                }
                            );


                    if (
                        loadError
                    ) {

                        throw loadError;

                    }


                    setOrders(
                        data ||
                        []
                    );

                } catch (
                    loadError
                ) {

                    console.error(
                        "Customer orders error:",
                        loadError
                    );


                    setError(
                        loadError?.message ||
                        text.loadError
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
                user?.id,
                isArabic
            ]
        );


    /*
    ========================================================
    INITIAL LOAD
    ========================================================
    */

    useEffect(
        () => {

            if (
                authLoading
            ) {

                return;

            }


            loadOrders();

        },
        [
            authLoading,
            loadOrders
        ]
    );


    /*
    ========================================================
    REALTIME
    ========================================================
    */

    useEffect(
        () => {

            if (
                !user?.id
            ) {

                setRealtimeConnected(
                    false
                );


                return undefined;

            }


            const channel =
                supabase
                    .channel(
                        `customer-orders-website-${user.id}`
                    )
                    .on(
                        "postgres_changes",
                        {
                            event:
                                "*",

                            schema:
                                "public",

                            table:
                                "orders",

                            filter:
                                `customer_id=eq.${user.id}`
                        },
                        () => {

                            loadOrders();

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

                supabase
                    .removeChannel(
                        channel
                    );

            };

        },
        [
            user?.id,
            loadOrders
        ]
    );


    /*
    ========================================================
    CANCEL ORDER
    ========================================================
    */

    const cancelOrder =
        async (
            order
        ) => {

            if (
                !order?.id ||
                cancellingId
            ) {

                return;

            }


            const confirmed =
                window.confirm(
                    text.cancelConfirm
                );


            if (
                !confirmed
            ) {

                return;

            }


            setCancellingId(
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
                        cancelError
                } =
                    await supabase
                        .rpc(
                            "cancel_my_order",
                            {
                                p_order_id:
                                    order.id
                            }
                        );


                if (
                    cancelError
                ) {

                    throw cancelError;

                }


                setSuccess(
                    text.cancelSuccess
                );


                await loadOrders();

            } catch (
                cancelError
            ) {

                console.error(
                    "Order cancellation error:",
                    cancelError
                );


                setError(
                    isArabic
                        ? text.cancelFailed
                        : (
                            cancelError?.message ||
                            text.cancelFailed
                        )
                );

            } finally {

                setCancellingId(
                    null
                );

            }

        };


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


        return new Intl
            .DateTimeFormat(
                isArabic
                    ? "ar-EG"
                    : "en-GB",
                {
                    dateStyle:
                        "medium",

                    timeStyle:
                        "short"
                }
            )
            .format(
                new Date(
                    value
                )
            );

    };


    /*
    ========================================================
    ORDER NUMBER
    ========================================================
    */

    const orderNumber = (
        id
    ) => {

        return `NAB-${String(
            id ||
            ""
        )
            .replaceAll(
                "-",
                ""
            )
            .slice(
                0,
                8
            )
            .toUpperCase()}`;

    };


    /*
    ========================================================
    STATUS
    ========================================================
    */

    const statusLabel = (
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
            status
        );

    };


    /*
    ========================================================
    STATS
    ========================================================
    */

    const stats =
        useMemo(
            () => ({

                total:
                    orders.length,

                pending:
                    orders.filter(
                        order =>
                            order.status ===
                            "pending"
                    ).length,

                preparing:
                    orders.filter(
                        order =>
                            order.status ===
                            "preparing"
                    ).length,

                ready:
                    orders.filter(
                        order =>
                            order.status ===
                            "ready"
                    ).length,

                delivered:
                    orders.filter(
                        order =>
                            order.status ===
                            "delivered"
                    ).length

            }),
            [
                orders
            ]
        );


    /*
    ========================================================
    LOADING AUTH
    ========================================================
    */

    if (
        authLoading
    ) {

        return (

            <main className="customer-orders-page">

                <div className="customer-orders-loading">

                    <RefreshCw
                        className="customer-orders-spinner"
                        size={35}
                    />

                </div>

            </main>

        );

    }


    /*
    ========================================================
    SIGNED OUT
    ========================================================
    */

    if (
        !user
    ) {

        return (

            <main
                className="customer-orders-page"
                dir={
                    isArabic
                        ? "rtl"
                        : "ltr"
                }
            >

                <div className="container">

                    <div className="customer-orders-auth">

                        <ShoppingBag
                            size={48}
                        />


                        <h1>

                            {
                                text.signInRequired
                            }

                        </h1>


                        <p>

                            {
                                text.signInText
                            }

                        </p>


                        <Link to="/account">

                            {
                                text.signIn
                            }

                        </Link>

                    </div>

                </div>

            </main>

        );

    }


    return (

        <main
            className="customer-orders-page"
            dir={
                isArabic
                    ? "rtl"
                    : "ltr"
            }
        >

            <div className="container">


                {/* HEADER */}

                <header className="customer-orders-header">

                    <div>

                        <span>
                            {text.eyebrow}
                        </span>


                        <h1>
                            {text.title}
                        </h1>


                        <p>
                            {text.description}
                        </p>

                    </div>


                    <div className="customer-orders-actions">

                        <div
                            className={
                                realtimeConnected
                                    ? "customer-orders-live connected"
                                    : "customer-orders-live"
                            }
                        >

                            <span>
                            </span>

                            {
                                realtimeConnected
                                    ? text.live
                                    : text.connecting
                            }

                        </div>


                        <button
                            type="button"
                            onClick={() =>
                                loadOrders(
                                    true
                                )
                            }
                            disabled={
                                refreshing
                            }
                        >

                            <RefreshCw
                                size={17}
                                className={
                                    refreshing
                                        ? "customer-orders-spinner"
                                        : ""
                                }
                            />

                            {text.refresh}

                        </button>

                    </div>

                </header>


                {/* ERROR */}

                {
                    error && (

                        <div className="customer-orders-error">

                            <AlertTriangle
                                size={18}
                            />

                            {error}

                        </div>

                    )
                }


                {/* SUCCESS */}

                {
                    success && (

                        <div
                            style={{
                                marginTop:
                                    "16px",

                                padding:
                                    "13px 15px",

                                display:
                                    "flex",

                                alignItems:
                                    "center",

                                gap:
                                    "8px",

                                border:
                                    "1px solid rgba(28,137,69,0.16)",

                                borderRadius:
                                    "12px",

                                background:
                                    "rgba(28,137,69,0.07)",

                                color:
                                    "#19723d",

                                fontSize:
                                    "0.63rem",

                                fontWeight:
                                    "800"
                            }}
                        >

                            <CheckCircle2
                                size={18}
                            />

                            {success}

                        </div>

                    )
                }


                {/* STATS */}

                <section className="customer-orders-stats">

                    <OrderStat
                        icon={
                            <ShoppingBag />
                        }
                        label={
                            text.total
                        }
                        value={
                            stats.total
                        }
                    />


                    <OrderStat
                        icon={
                            <Clock3 />
                        }
                        label={
                            text.pending
                        }
                        value={
                            stats.pending
                        }
                        type="pending"
                    />


                    <OrderStat
                        icon={
                            <Package />
                        }
                        label={
                            text.preparing
                        }
                        value={
                            stats.preparing
                        }
                        type="preparing"
                    />


                    <OrderStat
                        icon={
                            <PackageCheck />
                        }
                        label={
                            text.ready
                        }
                        value={
                            stats.ready
                        }
                        type="ready"
                    />


                    <OrderStat
                        icon={
                            <CheckCircle2 />
                        }
                        label={
                            text.delivered
                        }
                        value={
                            stats.delivered
                        }
                        type="delivered"
                    />

                </section>


                {
                    loading
                        ? (

                            <div className="customer-orders-loading">

                                <RefreshCw
                                    className="customer-orders-spinner"
                                    size={35}
                                />

                            </div>

                        )
                        : orders.length ===
                            0
                            ? (

                                <section className="customer-orders-empty">

                                    <ShoppingBag
                                        size={52}
                                    />

                                    <strong>
                                        {text.noOrders}
                                    </strong>

                                    <span>
                                        {text.noOrdersText}
                                    </span>

                                    <Link to="/products">
                                        {text.shop}
                                    </Link>

                                </section>

                            )
                            : (

                                <section className="customer-orders-list">

                                    {
                                        orders.map(
                                            order => (

                                                <article
                                                    className="customer-order-card"
                                                    key={
                                                        order.id
                                                    }
                                                >

                                                    <div className="customer-order-card-header">

                                                        <div className="customer-order-icon">

                                                            <ShoppingBag
                                                                size={21}
                                                            />

                                                        </div>


                                                        <div className="customer-order-title">

                                                            <span>
                                                                {text.order}
                                                            </span>

                                                            <strong dir="ltr">

                                                                {
                                                                    orderNumber(
                                                                        order.id
                                                                    )
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


                                                        <span
                                                            className={
                                                                `customer-order-status ${
                                                                    order.status ||
                                                                    "pending"
                                                                }`
                                                            }
                                                        >

                                                            {
                                                                statusLabel(
                                                                    order.status
                                                                )
                                                            }

                                                        </span>

                                                    </div>


                                                    <OrderProgress
                                                        status={
                                                            order.status
                                                        }
                                                        text={
                                                            text
                                                        }
                                                    />


                                                    <div className="customer-order-details">

                                                        <div>

                                                            {
                                                                order.delivery_method ===
                                                                    "pickup"
                                                                    ? (
                                                                        <Store size={18} />
                                                                    )
                                                                    : (
                                                                        <Truck size={18} />
                                                                    )
                                                            }

                                                            <span>

                                                                {
                                                                    order.delivery_method ===
                                                                        "pickup"
                                                                        ? text.pickup
                                                                        : text.delivery
                                                                }

                                                            </span>

                                                        </div>


                                                        <div>

                                                            <ReceiptText
                                                                size={18}
                                                            />

                                                            <span>

                                                                {text.payment}

                                                                {": "}

                                                                {
                                                                    order.payment_status ===
                                                                        "paid"
                                                                        ? text.paid
                                                                        : text.paymentPending
                                                                }

                                                            </span>

                                                        </div>

                                                    </div>


                                                    <div className="customer-order-footer">

                                                        <strong>

                                                            {
                                                                formatPrice(
                                                                    order.total
                                                                )
                                                            }

                                                        </strong>


                                                        <div
                                                            style={{
                                                                display:
                                                                    "flex",

                                                                alignItems:
                                                                    "center",

                                                                gap:
                                                                    "8px",

                                                                flexWrap:
                                                                    "wrap",

                                                                justifyContent:
                                                                    "flex-end"
                                                            }}
                                                        >

                                                            {
                                                                order.status ===
                                                                    "pending" && (

                                                                    <button
                                                                        type="button"
                                                                        onClick={() =>
                                                                            cancelOrder(
                                                                                order
                                                                            )
                                                                        }
                                                                        disabled={
                                                                            cancellingId ===
                                                                            order.id
                                                                        }
                                                                        style={{
                                                                            minHeight:
                                                                                "39px",

                                                                            padding:
                                                                                "0 12px",

                                                                            display:
                                                                                "inline-flex",

                                                                            alignItems:
                                                                                "center",

                                                                            justifyContent:
                                                                                "center",

                                                                            gap:
                                                                                "6px",

                                                                            border:
                                                                                "1px solid rgba(170,16,24,0.20)",

                                                                            borderRadius:
                                                                                "10px",

                                                                            background:
                                                                                "rgba(170,16,24,0.06)",

                                                                            color:
                                                                                "#aa1018",

                                                                            font:
                                                                                "inherit",

                                                                            fontSize:
                                                                                "0.54rem",

                                                                            fontWeight:
                                                                                "900",

                                                                            cursor:
                                                                                cancellingId ===
                                                                                order.id
                                                                                    ? "wait"
                                                                                    : "pointer",

                                                                            opacity:
                                                                                cancellingId ===
                                                                                order.id
                                                                                    ? 0.6
                                                                                    : 1
                                                                        }}
                                                                    >

                                                                        {
                                                                            cancellingId ===
                                                                            order.id
                                                                                ? (
                                                                                    <RefreshCw
                                                                                        size={16}
                                                                                        className="customer-orders-spinner"
                                                                                    />
                                                                                )
                                                                                : (
                                                                                    <Ban
                                                                                        size={16}
                                                                                    />
                                                                                )
                                                                        }


                                                                        {
                                                                            cancellingId ===
                                                                            order.id
                                                                                ? text.cancelling
                                                                                : text.cancel
                                                                        }

                                                                    </button>

                                                                )
                                                            }


                                                            <Link
                                                                to={
                                                                    `/receipt/${order.id}`
                                                                }
                                                            >

                                                                <ReceiptText
                                                                    size={17}
                                                                />

                                                                {
                                                                    text.receipt
                                                                }

                                                            </Link>

                                                        </div>

                                                    </div>

                                                </article>

                                            )
                                        )
                                    }

                                </section>

                            )
                }

            </div>

        </main>

    );

}


/*
========================================================
STAT
========================================================
*/

function OrderStat({
    icon,
    label,
    value,
    type = ""
}) {

    return (

        <div
            className={
                `customer-order-stat ${type}`
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


/*
========================================================
PROGRESS
========================================================
*/

function OrderProgress({
    status,
    text
}) {

    if (
        status ===
        "cancelled"
    ) {

        return (

            <div className="customer-order-cancelled">

                <XCircle
                    size={18}
                />

                {
                    text.cancelled
                }

            </div>

        );

    }


    const indexes = {

        pending:
            0,

        preparing:
            1,

        ready:
            2,

        delivered:
            3

    };


    const active =
        indexes[
            status
        ] ??
        0;


    const steps = [
        {
            icon:
                <Clock3 size={14} />,

            label:
                text.placed
        },
        {
            icon:
                <Package size={14} />,

            label:
                text.preparingStep
        },
        {
            icon:
                <PackageCheck size={14} />,

            label:
                text.readyStep
        },
        {
            icon:
                <CheckCircle2 size={14} />,

            label:
                text.deliveredStep
        }
    ];


    return (

        <div className="customer-order-progress">

            {
                steps.map(
                    (
                        step,
                        index
                    ) => (

                        <div
                            className="customer-order-progress-group"
                            key={
                                step.label
                            }
                        >

                            <div
                                className={
                                    index <=
                                    active
                                        ? "customer-order-progress-step complete"
                                        : "customer-order-progress-step"
                                }
                            >

                                <span>
                                    {step.icon}
                                </span>

                                <small>
                                    {step.label}
                                </small>

                            </div>


                            {
                                index <
                                steps.length -
                                    1 && (

                                    <div
                                        className={
                                            index <
                                            active
                                                ? "customer-order-progress-line complete"
                                                : "customer-order-progress-line"
                                        }
                                    >
                                    </div>

                                )
                            }

                        </div>

                    )
                )
            }

        </div>

    );

}


export default CustomerOrders;