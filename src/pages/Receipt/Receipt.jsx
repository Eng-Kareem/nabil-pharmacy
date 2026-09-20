import {
    ArrowLeft,
    Check,
    Package,
    Printer,
    ReceiptText,
    Store,
    Truck
} from "lucide-react";

import {
    useEffect,
    useState
} from "react";

import {
    Link,
    useParams,
    useSearchParams
} from "react-router-dom";

import {
    supabase
} from "../../lib/supabase.js";

import "./Receipt.css";


function Receipt() {

    const {
        orderId
    } = useParams();


    const [
        searchParams
    ] = useSearchParams();


    const [
        receipt,
        setReceipt
    ] = useState(null);


    const [
        loading,
        setLoading
    ] = useState(true);


    const [
        error,
        setError
    ] = useState("");


    const receiptToken =
        searchParams.get(
            "token"
        );


    /*
    ========================================================
    LOAD RECEIPT
    ========================================================
    */

    useEffect(() => {

        const loadReceipt =
            async () => {

                setLoading(true);

                setError("");


                try {

                    const {
                        data,
                        error
                    } =
                        await supabase
                            .rpc(
                                "get_order_receipt",
                                {

                                    p_order_id:
                                        orderId,

                                    p_checkout_token:
                                        receiptToken ||
                                        null

                                }
                            );


                    if (error) {
                        throw error;
                    }


                    setReceipt(
                        data
                    );

                } catch (error) {

                    console.error(
                        "Receipt load error:",
                        error
                    );


                    setError(
                        error?.message ||
                        "Could not load this receipt."
                    );

                } finally {

                    setLoading(false);
                }
            };


        loadReceipt();

    }, [
        orderId,
        receiptToken
    ]);


    /*
    ========================================================
    MONEY
    ========================================================
    */

    const formatPrice = (
        value
    ) => {

        return (
            `EGP ${Number(
                value || 0
            ).toLocaleString(
                undefined,
                {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2
                }
            )}`
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
    RECEIPT NUMBER
    ========================================================
    */

    const getReceiptNumber = () => {

        if (
            !receipt?.id
        ) {

            return "";
        }


        return (
            `NAB-${receipt.id
                .replaceAll(
                    "-",
                    ""
                )
                .slice(
                    0,
                    10
                )
                .toUpperCase()}`
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

            <main className="receipt-page">

                <div className="receipt-state">

                    <ReceiptText
                        size={42}
                    />


                    <h1>
                        Loading receipt...
                    </h1>

                </div>

            </main>
        );
    }


    /*
    ========================================================
    ERROR
    ========================================================
    */

    if (
        error ||
        !receipt
    ) {

        return (

            <main className="receipt-page">

                <div className="receipt-state error">

                    <ReceiptText
                        size={44}
                    />


                    <h1>
                        Receipt unavailable
                    </h1>


                    <p>

                        {
                            error ||
                            "This receipt could not be found."
                        }

                    </p>


                    <Link
                        to="/"
                        className="receipt-back-home"
                    >

                        Back Home

                    </Link>

                </div>

            </main>
        );
    }


    return (

        <main className="receipt-page">


            {/* =================================================
                ACTIONS
            ================================================= */}

            <div className="receipt-actions">


                <button
                    type="button"
                    className="receipt-back-button"
                    onClick={() =>
                        window.history.back()
                    }
                >

                    <ArrowLeft
                        size={17}
                    />

                    Back

                </button>


                <button
                    type="button"
                    className="receipt-print-button"
                    onClick={() =>
                        window.print()
                    }
                >

                    <Printer
                        size={18}
                    />

                    Print Receipt

                </button>

            </div>



            {/* =================================================
                RECEIPT
            ================================================= */}

            <section className="receipt-paper">


                {/* HEADER */}

                <header className="receipt-header">


                    <img
                        src="/nabil-logo.png"
                        alt="Nabil Pharmacy"
                    />


                    <div>

                        <span>
                            Since 1975
                        </span>


                        <h1>
                            Nabil Pharmacy
                        </h1>


                        <p>
                            Official Pharmacy Order Receipt
                        </p>

                    </div>

                </header>



                <div className="receipt-divider">
                </div>



                {/* INFORMATION */}

                <section className="receipt-information">


                    <div>

                        <span>
                            Receipt Number
                        </span>


                        <strong>

                            {
                                getReceiptNumber()
                            }

                        </strong>

                    </div>


                    <div>

                        <span>
                            Date
                        </span>


                        <strong>

                            {
                                formatDate(
                                    receipt.created_at
                                )
                            }

                        </strong>

                    </div>


                    <div>

                        <span>
                            Order Status
                        </span>


                        <strong
                            className={
                                `receipt-status ${receipt.status}`
                            }
                        >

                            {
                                (
                                    receipt.status ||
                                    "pending"
                                )
                                    .replaceAll(
                                        "_",
                                        " "
                                    )
                                    .toUpperCase()
                            }

                        </strong>

                    </div>


                    <div>

                        <span>
                            Payment
                        </span>


                        <strong
                            className={
                                receipt.payment_status ===
                                    "paid"
                                    ? "receipt-paid"
                                    : "receipt-pending"
                            }
                        >

                            {
                                receipt.payment_status ===
                                    "paid"
                                    ? "PAID"
                                    : "PENDING"
                            }

                        </strong>

                    </div>

                </section>



                {/* CUSTOMER */}

                <section className="receipt-section">


                    <h2>
                        Customer
                    </h2>


                    <div className="receipt-detail-grid">


                        <ReceiptDetail
                            label="Name"
                            value={
                                receipt.full_name
                            }
                        />


                        <ReceiptDetail
                            label="Phone"
                            value={
                                receipt.phone
                            }
                        />


                        <ReceiptDetail
                            label="Email"
                            value={
                                receipt.email ||
                                "Not provided"
                            }
                        />

                    </div>

                </section>



                {/* DELIVERY */}

                <section className="receipt-section">


                    <h2>
                        Fulfilment
                    </h2>


                    <div className="receipt-delivery">


                        <div className="receipt-delivery-icon">

                            {
                                receipt.delivery_method ===
                                    "pickup"
                                    ? (
                                        <Store />
                                    )
                                    : (
                                        <Truck />
                                    )
                            }

                        </div>


                        <div>

                            <strong>

                                {
                                    receipt.delivery_method ===
                                        "pickup"
                                        ? "Pharmacy Pickup"
                                        : "Home Delivery"
                                }

                            </strong>


                            <span>

                                {
                                    receipt.delivery_method ===
                                        "pickup"
                                        ? (
                                            receipt.branch_name ||
                                            "Nabil Pharmacy"
                                        )
                                        : (
                                            [
                                                receipt.address,
                                                receipt.area,
                                                receipt.city
                                            ]
                                                .filter(Boolean)
                                                .join(", ")
                                        )
                                }

                            </span>

                        </div>

                    </div>

                </section>



                {/* ITEMS */}

                <section className="receipt-section">


                    <h2>
                        Items
                    </h2>


                    <div className="receipt-products">


                        <div className="receipt-product-header">

                            <span>
                                Product
                            </span>

                            <span>
                                Qty
                            </span>

                            <span>
                                Unit Price
                            </span>

                            <span>
                                Total
                            </span>

                        </div>


                        {
                            (
                                receipt.items ||
                                []
                            ).map(
                                item => (

                                    <div
                                        className="receipt-product-row"
                                        key={
                                            item.id
                                        }
                                    >

                                        <div>

                                            <Package
                                                size={17}
                                            />


                                            <strong>

                                                {
                                                    item.product_name
                                                }

                                            </strong>

                                        </div>


                                        <span>

                                            {
                                                item.quantity
                                            }

                                        </span>


                                        <span>

                                            {
                                                formatPrice(
                                                    item.unit_price
                                                )
                                            }

                                        </span>


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

                </section>



                {/* TOTALS */}

                <section className="receipt-totals">


                    <div>

                        <span>
                            Subtotal
                        </span>


                        <strong>

                            {
                                formatPrice(
                                    receipt.subtotal
                                )
                            }

                        </strong>

                    </div>


                    <div>

                        <span>
                            Delivery Fee
                        </span>


                        <strong>

                            {
                                formatPrice(
                                    receipt.delivery_fee
                                )
                            }

                        </strong>

                    </div>


                    <div className="receipt-grand-total">

                        <span>
                            Total
                        </span>


                        <strong>

                            {
                                formatPrice(
                                    receipt.total
                                )
                            }

                        </strong>

                    </div>

                </section>



                {/* PAYMENT */}

                <section className="receipt-payment-box">

                    {
                        receipt.payment_status ===
                            "paid"
                            ? (
                                <Check
                                    size={22}
                                />
                            )
                            : (
                                <ReceiptText
                                    size={22}
                                />
                            )
                    }


                    <div>

                        <strong>

                            {
                                receipt.payment_method ===
                                    "cash"
                                    ? "Cash on Delivery"
                                    : "Card Payment"
                            }

                        </strong>


                        <span>

                            {
                                receipt.payment_status ===
                                    "paid"
                                    ? "Payment completed"
                                    : "Payment pending"
                            }

                        </span>

                    </div>

                </section>



                {/* NOTES */}

                {
                    receipt.notes && (

                        <section className="receipt-notes">


                            <strong>
                                Order Notes
                            </strong>


                            <p>

                                {
                                    receipt.notes
                                }

                            </p>

                        </section>

                    )
                }



                {/* FOOTER */}

                <footer className="receipt-footer">


                    <strong>
                        Thank you for choosing Nabil Pharmacy
                    </strong>


                    <span>
                        Since 1975
                    </span>


                    <p>
                        Please keep this receipt for your records.
                    </p>

                </footer>

            </section>

        </main>
    );
}



/*
========================================================
RECEIPT DETAIL
========================================================
*/

function ReceiptDetail({

    label,

    value

}) {

    return (

        <div>

            <span>
                {label}
            </span>


            <strong>

                {
                    value ||
                    "-"
                }

            </strong>

        </div>

    );
}


export default Receipt;