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

import "./AdminOrders.css";


const ORDER_STATUSES = [

    {
        value: "pending",
        label: "Pending"
    },

    {
        value: "preparing",
        label: "Preparing"
    },

    {
        value: "ready",
        label: "Ready"
    },

    {
        value: "delivered",
        label: "Delivered"
    },

    {
        value: "cancelled",
        label: "Cancelled"
    }

];


function AdminOrders() {

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

                setLoading(true);
            }


            setError("");


            try {

                const {
                    data,
                    error
                } =
                    await supabase
                        .from("orders")
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
                                ascending: false
                            }
                        );


                if (error) {
                    throw error;
                }


                setOrders(
                    data || []
                );

            } catch (error) {

                console.error(
                    "Admin orders load error:",
                    error
                );


                setError(
                    error?.message ||
                    "Could not load pharmacy orders."
                );

            } finally {

                if (
                    showLoading
                ) {

                    setLoading(false);
                }
            }
        };



    /*
    ========================================================
    INITIAL LOAD
    ========================================================
    */

    useEffect(() => {

        loadOrders();

    }, []);



    /*
    ========================================================
    REALTIME
    ========================================================
    */

    useEffect(() => {

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

    }, []);



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
                value || 0
            ).toLocaleString()}`
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

        if (!value) {
            return "-";
        }


        return new Date(
            value
        ).toLocaleString(
            undefined,
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
    STATUS LABEL
    ========================================================
    */

    const getStatusLabel = (
        status
    ) => {

        return (
            ORDER_STATUSES.find(
                item =>
                    item.value ===
                    status
            )?.label ||
            status ||
            "Unknown"
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
                        `Cancel ${getOrderNumber(order)}?\n\nThe sold quantities will automatically be returned to inventory.`
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


            setError("");

            setSuccess("");


            try {

                const {
                    error
                } =
                    await supabase
                        .from("orders")
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


                if (error) {
                    throw error;
                }


                if (
                    newStatus ===
                    "cancelled"
                ) {

                    setSuccess(
                        `${getOrderNumber(order)} cancelled. Inventory restored automatically.`
                    );

                } else {

                    setSuccess(
                        `${getOrderNumber(order)} changed to ${getStatusLabel(newStatus)}.`
                    );
                }


                await loadOrders(
                    false
                );


                window.setTimeout(
                    () => {

                        setSuccess("");

                    },
                    3000
                );

            } catch (error) {

                console.error(
                    "Order update error:",
                    error
                );


                setError(
                    error?.message ||
                    "Could not update order status."
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
                                .filter(Boolean)
                                .join(" ")
                                .toLowerCase()
                                .includes(term);


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



    return (

        <main className="admin-orders-page">

            <div className="container">


                {/* HEADER */}

                <header className="admin-orders-header">

                    <div>

                        <span>
                            Order Management
                        </span>


                        <h1>
                            Pharmacy Orders
                        </h1>


                        <p>

                            Review customer orders,
                            update preparation status,
                            print receipts and manage
                            pharmacy fulfilment.

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
                                    ? "Live Orders"
                                    : "Connecting..."
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

                            Refresh

                        </button>

                    </div>

                </header>



                {
                    success && (

                        <div className="admin-orders-success">

                            <Check
                                size={17}
                            />

                            {success}

                        </div>

                    )
                }


                {
                    error && (

                        <div className="admin-orders-error">

                            <AlertTriangle
                                size={17}
                            />

                            {error}

                        </div>

                    )
                }



                {/* SUMMARY */}

                <section className="admin-orders-summary">


                    <SummaryCard
                        icon={
                            <ShoppingBag />
                        }
                        label="Total Orders"
                        value={
                            summary.total
                        }
                    />


                    <SummaryCard
                        icon={
                            <Clock3 />
                        }
                        label="Pending"
                        value={
                            summary.pending
                        }
                        className="pending"
                    />


                    <SummaryCard
                        icon={
                            <Package />
                        }
                        label="Preparing"
                        value={
                            summary.preparing
                        }
                        className="preparing"
                    />


                    <SummaryCard
                        icon={
                            <Truck />
                        }
                        label="Ready"
                        value={
                            summary.ready
                        }
                        className="ready"
                    />


                    <SummaryCard
                        icon={
                            <CircleDollarSign />
                        }
                        label="Delivered Sales"
                        value={
                            formatPrice(
                                summary.deliveredRevenue
                            )
                        }
                        className="revenue"
                    />

                </section>



                {/* FILTERS */}

                <section className="admin-orders-toolbar">


                    <div className="admin-orders-search">

                        <Search
                            size={18}
                        />


                        <input
                            type="search"
                            placeholder="Search order, customer, phone or address..."
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
                            All Statuses
                        </option>


                        {
                            ORDER_STATUSES.map(
                                status => (

                                    <option
                                        key={
                                            status.value
                                        }
                                        value={
                                            status.value
                                        }
                                    >

                                        {
                                            status.label
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
                            All Payments
                        </option>

                        <option value="pending">
                            Payment Pending
                        </option>

                        <option value="paid">
                            Paid
                        </option>

                    </select>

                </section>



                {/* ORDERS */}

                {
                    loading
                        ? (

                            <div className="admin-orders-loading">

                                <RefreshCw
                                    size={34}
                                    className="admin-orders-spinner"
                                />

                                Loading orders...

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
                                        No orders found
                                    </h2>


                                    <p>

                                        Orders will appear here
                                        when customers complete
                                        checkout.

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
                                                    formatPrice={
                                                        formatPrice
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



function OrderCard({

    order,

    orderNumber,

    formatPrice,

    formatDate,

    expanded,

    toggleExpanded,

    updating,

    updateStatus

}) {

    return (

        <article className="admin-order-card">


            <div className="admin-order-main">


                <div className="admin-order-number">

                    <div>

                        <ShoppingBag
                            size={21}
                        />

                    </div>


                    <div>

                        <span>
                            Order
                        </span>


                        <strong>
                            {orderNumber}
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



                <div className="admin-order-customer">

                    <span>
                        Customer
                    </span>


                    <strong>

                        {
                            order.full_name ||
                            "Guest Customer"
                        }

                    </strong>


                    <small>

                        {
                            order.phone ||
                            "No phone"
                        }

                    </small>

                </div>



                <div className="admin-order-total">

                    <span>
                        Total
                    </span>


                    <strong>

                        {
                            formatPrice(
                                order.total
                            )
                        }

                    </strong>

                </div>



                <div className="admin-order-payment">

                    <span>
                        Payment
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
                            order.payment_status ===
                                "paid"
                                ? "Paid"
                                : "Pending"
                        }

                    </strong>


                    <small>

                        {
                            order.payment_method ===
                                "card"
                                ? "Card"
                                : "Cash"
                        }

                    </small>

                </div>



                <div className="admin-order-status-control">

                    <span>
                        Status
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
                            ORDER_STATUSES.map(
                                status => (

                                    <option
                                        key={
                                            status.value
                                        }
                                        value={
                                            status.value
                                        }
                                    >

                                        {
                                            status.label
                                        }

                                    </option>

                                )
                            )
                        }

                    </select>


                    {
                        updating && (

                            <small>
                                Updating...
                            </small>

                        )
                    }

                </div>



                <button
                    type="button"
                    className="admin-order-expand"
                    onClick={
                        toggleExpanded
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



            {
                expanded && (

                    <div className="admin-order-details">


                        <section className="admin-order-details-section">

                            <h3>
                                Customer Details
                            </h3>


                            <DetailRow
                                icon={
                                    <User />
                                }
                                label="Name"
                                value={
                                    order.full_name ||
                                    "-"
                                }
                            />


                            <DetailRow
                                icon={
                                    <Phone />
                                }
                                label="Phone"
                                value={
                                    order.phone ||
                                    "-"
                                }
                            />


                            <DetailRow
                                icon={
                                    <Mail />
                                }
                                label="Email"
                                value={
                                    order.email ||
                                    "Not provided"
                                }
                            />

                        </section>



                        <section className="admin-order-details-section">

                            <h3>
                                Delivery
                            </h3>


                            <DetailRow
                                icon={
                                    <Truck />
                                }
                                label="Method"
                                value={
                                    order.delivery_method ===
                                        "pickup"
                                        ? "Pharmacy Pickup"
                                        : "Home Delivery"
                                }
                            />


                            <DetailRow
                                icon={
                                    <MapPin />
                                }
                                label="Address"
                                value={
                                    order.delivery_method ===
                                        "pickup"
                                        ? (
                                            order.branches?.name ||
                                            "Pharmacy Branch"
                                        )
                                        : (
                                            [
                                                order.address,
                                                order.area,
                                                order.city
                                            ]
                                                .filter(Boolean)
                                                .join(", ") ||
                                            "-"
                                        )
                                }
                            />


                            {
                                order.notes && (

                                    <div className="admin-order-notes">

                                        <span>
                                            Customer Notes
                                        </span>


                                        <p>
                                            {order.notes}
                                        </p>

                                    </div>

                                )
                            }

                        </section>



                        <section className="admin-order-details-section">

                            <h3>
                                Payment
                            </h3>


                            <DetailRow
                                icon={
                                    <Banknote />
                                }
                                label="Method"
                                value={
                                    order.payment_method ===
                                        "card"
                                        ? "Card Payment"
                                        : "Cash on Delivery"
                                }
                            />


                            <DetailRow
                                icon={
                                    order.payment_status ===
                                        "paid"
                                        ? <Check />
                                        : <Clock3 />
                                }
                                label="Payment Status"
                                value={
                                    order.payment_status ===
                                        "paid"
                                        ? "Paid"
                                        : "Pending"
                                }
                            />

                        </section>



                        <section className="admin-order-products">

                            <h3>
                                Ordered Products
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
                                                            item.product_name ||
                                                            "Product"
                                                        }

                                                    </strong>


                                                    <span>

                                                        Qty{" "}

                                                        {
                                                            item.quantity
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



                            <div className="admin-order-money">


                                <div>

                                    <span>
                                        Subtotal
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
                                        Delivery
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
                                        Total
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



                        <Link
                            to={
                                `/receipt/${order.id}`
                            }
                            className="admin-order-receipt-button"
                        >

                            <ReceiptText
                                size={17}
                            />

                            View / Print Receipt

                        </Link>



                        {
                            order.status ===
                                "cancelled" && (

                                <div className="admin-order-cancelled-note">

                                    <XCircle
                                        size={18}
                                    />


                                    <div>

                                        <strong>
                                            Order Cancelled
                                        </strong>


                                        <span>

                                            Product quantities were
                                            automatically returned
                                            to inventory.

                                        </span>

                                    </div>

                                </div>

                            )
                        }


                        {
                            order.status ===
                                "delivered" && (

                                <div className="admin-order-delivered-note">

                                    <Check
                                        size={18}
                                    />


                                    <div>

                                        <strong>
                                            Order Delivered
                                        </strong>


                                        <span>

                                            This order has completed
                                            the pharmacy fulfilment
                                            process.

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



function DetailRow({

    icon,

    label,

    value

}) {

    return (

        <div className="admin-order-detail-row">

            <div className="admin-order-detail-icon">

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


export default AdminOrders;