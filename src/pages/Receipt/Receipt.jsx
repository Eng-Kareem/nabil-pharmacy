import {
    ArrowLeft,
    ArrowRight,
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

import {
    useLanguage
} from "../../context/LanguageContext.jsx";

import receiptTranslations
    from "../../i18n/receiptTranslations.js";

import "./Receipt.css";


function Receipt() {

    const {
        orderId
    } =
        useParams();


    const [
        searchParams
    ] =
        useSearchParams();


    const {
        language,
        isArabic
    } =
        useLanguage();


    const text =
        receiptTranslations[
            language
        ] ||
        receiptTranslations.en;


    const BackIcon =
        isArabic
            ? ArrowRight
            : ArrowLeft;


    const [
        receipt,
        setReceipt
    ] =
        useState(
            null
        );


    const [
        loading,
        setLoading
    ] =
        useState(
            true
        );


    const [
        error,
        setError
    ] =
        useState(
            ""
        );


    const receiptToken =
        searchParams.get(
            "token"
        );


    /*
    ========================================================
    ORDER STATUS TRANSLATION
    ========================================================
    */

    const translateOrderStatus = (
        status
    ) => {

        const normalized =
            String(
                status ||
                "pending"
            )
                .trim()
                .toLowerCase();


        const statusMap = {

            pending:
                text.statusPending,

            confirmed:
                text.statusConfirmed,

            preparing:
                text.statusPreparing,

            ready:
                text.statusReady,

            out_for_delivery:
                text.statusOutForDelivery,

            delivered:
                text.statusDelivered,

            cancelled:
                text.statusCancelled,

            completed:
                text.statusCompleted

        };


        return (
            statusMap[
                normalized
            ] ||
            normalized
                .replaceAll(
                    "_",
                    " "
                )
        );

    };


    /*
    ========================================================
    PAYMENT STATUS TRANSLATION
    ========================================================
    */

    const translatePaymentStatus = (
        status
    ) => {

        const normalized =
            String(
                status ||
                "pending"
            )
                .trim()
                .toLowerCase();


        const statusMap = {

            paid:
                text.paid,

            pending:
                text.pending,

            failed:
                text.failed,

            refunded:
                text.refunded

        };


        return (
            statusMap[
                normalized
            ] ||
            normalized
        );

    };


    /*
    ========================================================
    LOAD ARABIC PRODUCT NAMES
    ========================================================

    Existing order snapshots contain the product name that
    was stored when the order was created.

    For Arabic display, we look up matching products and
    use name_ar without modifying the receipt/order itself.
    ========================================================
    */

    const addArabicProductNames =
        async (
            receiptData
        ) => {

            if (
                !isArabic ||
                !receiptData ||
                !Array.isArray(
                    receiptData.items
                ) ||
                receiptData.items.length ===
                    0
            ) {

                return receiptData;

            }


            const englishNames =
                [
                    ...new Set(

                        receiptData
                            .items
                            .map(
                                item =>
                                    item.product_name
                            )
                            .filter(
                                Boolean
                            )

                    )
                ];


            if (
                englishNames.length ===
                0
            ) {

                return receiptData;

            }


            try {

                const {
                    data,
                    error:
                        productError
                } =
                    await supabase
                        .from(
                            "products"
                        )
                        .select(
                            "name, name_ar"
                        )
                        .in(
                            "name",
                            englishNames
                        );


                if (
                    productError
                ) {

                    console.error(
                        "Arabic receipt product name error:",
                        productError
                    );


                    return receiptData;

                }


                const translationMap =
                    new Map(
                        (
                            data ||
                            []
                        ).map(
                            product => [

                                product.name,

                                product.name_ar ||
                                product.name

                            ]
                        )
                    );


                return {

                    ...receiptData,

                    items:
                        receiptData
                            .items
                            .map(
                                item => ({

                                    ...item,

                                    product_name_display:
                                        translationMap.get(
                                            item.product_name
                                        ) ||
                                        item.product_name

                                })
                            )

                };

            } catch (
                lookupError
            ) {

                console.error(
                    "Arabic receipt lookup error:",
                    lookupError
                );


                return receiptData;

            }

        };


    /*
    ========================================================
    LOAD RECEIPT
    ========================================================
    */

    useEffect(
        () => {

            let mounted =
                true;


            const loadReceipt =
                async () => {

                    setLoading(
                        true
                    );


                    setError(
                        ""
                    );


                    try {

                        const {
                            data,
                            error:
                                receiptError
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


                        if (
                            receiptError
                        ) {

                            throw receiptError;

                        }


                        const translatedReceipt =
                            await addArabicProductNames(
                                data
                            );


                        if (
                            mounted
                        ) {

                            setReceipt(
                                translatedReceipt
                            );

                        }

                    } catch (
                        loadError
                    ) {

                        console.error(
                            "Receipt load error:",
                            loadError
                        );


                        if (
                            mounted
                        ) {

                            setError(

                                isArabic
                                    ? text.couldNotLoad
                                    : (
                                        loadError?.message ||
                                        text.couldNotLoad
                                    )

                            );

                        }

                    } finally {

                        if (
                            mounted
                        ) {

                            setLoading(
                                false
                            );

                        }

                    }

                };


            loadReceipt();


            return () => {

                mounted =
                    false;

            };

        },
        [
            orderId,
            receiptToken,
            language
        ]
    );


    /*
    ========================================================
    MONEY
    ========================================================
    */

    const formatPrice = (
        value
    ) => {

        const amount =
            Number(
                value ||
                0
            );


        const formatted =
            amount.toLocaleString(
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
                    "long",

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

    const getReceiptNumber =
        () => {

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

            <main
                className="receipt-page"
                dir={
                    isArabic
                        ? "rtl"
                        : "ltr"
                }
            >

                <div className="receipt-state">

                    <ReceiptText
                        size={42}
                    />


                    <h1>

                        {
                            text.loadingReceipt
                        }

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

            <main
                className="receipt-page"
                dir={
                    isArabic
                        ? "rtl"
                        : "ltr"
                }
            >

                <div className="receipt-state error">

                    <ReceiptText
                        size={44}
                    />


                    <h1>

                        {
                            text.receiptUnavailable
                        }

                    </h1>


                    <p>

                        {
                            error ||
                            text.receiptNotFound
                        }

                    </p>


                    <Link
                        to="/"
                        className="receipt-back-home"
                    >

                        {
                            text.backHome
                        }

                    </Link>

                </div>

            </main>

        );

    }


    /*
    ========================================================
    RECEIPT
    ========================================================
    */

    return (

        <main
            className="receipt-page"
            dir={
                isArabic
                    ? "rtl"
                    : "ltr"
            }
        >


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

                    <BackIcon
                        size={17}
                    />

                    {
                        text.back
                    }

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

                    {
                        text.printReceipt
                    }

                </button>

            </div>


            {/* =================================================
                PAPER
            ================================================= */}

            <section className="receipt-paper">


                {/* HEADER */}

                <header className="receipt-header">

                    <img
                        src="/nabil-logo.png"
                        alt={
                            text.nabilPharmacy
                        }
                    />


                    <div>

                        <span>

                            {
                                text.since1975
                            }

                        </span>


                        <h1>

                            {
                                text.nabilPharmacy
                            }

                        </h1>


                        <p>

                            {
                                text.officialReceipt
                            }

                        </p>

                    </div>

                </header>


                <div className="receipt-divider">
                </div>


                {/* =================================================
                    INFORMATION
                ================================================= */}

                <section className="receipt-information">


                    <div>

                        <span>

                            {
                                text.receiptNumber
                            }

                        </span>


                        <strong
                            dir="ltr"
                        >

                            {
                                getReceiptNumber()
                            }

                        </strong>

                    </div>


                    <div>

                        <span>

                            {
                                text.date
                            }

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

                            {
                                text.orderStatus
                            }

                        </span>


                        <strong
                            className={
                                `receipt-status ${
                                    receipt.status ||
                                    "pending"
                                }`
                            }
                        >

                            {
                                translateOrderStatus(
                                    receipt.status
                                )
                            }

                        </strong>

                    </div>


                    <div>

                        <span>

                            {
                                text.payment
                            }

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
                                translatePaymentStatus(
                                    receipt.payment_status
                                )
                            }

                        </strong>

                    </div>

                </section>


                {/* =================================================
                    CUSTOMER
                ================================================= */}

                <section className="receipt-section">

                    <h2>

                        {
                            text.customer
                        }

                    </h2>


                    <div className="receipt-detail-grid">

                        <ReceiptDetail
                            label={
                                text.name
                            }
                            value={
                                receipt.full_name
                            }
                        />


                        <ReceiptDetail
                            label={
                                text.phone
                            }
                            value={
                                receipt.phone
                            }
                            ltr
                        />


                        <ReceiptDetail
                            label={
                                text.email
                            }
                            value={
                                receipt.email ||
                                text.notProvided
                            }
                            ltr={
                                Boolean(
                                    receipt.email
                                )
                            }
                        />

                    </div>

                </section>


                {/* =================================================
                    DELIVERY
                ================================================= */}

                <section className="receipt-section">

                    <h2>

                        {
                            text.fulfilment
                        }

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
                                        ? text.pharmacyPickup
                                        : text.homeDelivery
                                }

                            </strong>


                            <span>

                                {
                                    receipt.delivery_method ===
                                        "pickup"
                                        ? (
                                            isArabic
                                                ? text.nabilPharmacy
                                                : (
                                                    receipt.branch_name ||
                                                    text.nabilPharmacy
                                                )
                                        )
                                        : (

                                            [
                                                receipt.address,
                                                receipt.area,
                                                receipt.city
                                            ]
                                                .filter(
                                                    Boolean
                                                )
                                                .join(
                                                    isArabic
                                                        ? "، "
                                                        : ", "
                                                )

                                        )
                                }

                            </span>

                        </div>

                    </div>

                </section>


                {/* =================================================
                    ITEMS
                ================================================= */}

                <section className="receipt-section">

                    <h2>

                        {
                            text.items
                        }

                    </h2>


                    <div className="receipt-products">


                        <div className="receipt-product-header">

                            <span>
                                {text.product}
                            </span>

                            <span>
                                {text.quantity}
                            </span>

                            <span>
                                {text.unitPrice}
                            </span>

                            <span>
                                {text.total}
                            </span>

                        </div>


                        {
                            (
                                receipt.items ||
                                []
                            ).map(
                                (
                                    item,
                                    index
                                ) => (

                                    <div
                                        className="receipt-product-row"
                                        key={
                                            item.id ||
                                            `${item.product_name}-${index}`
                                        }
                                    >

                                        <div>

                                            <Package
                                                size={17}
                                            />


                                            <strong>

                                                {
                                                    item.product_name_display ||
                                                    item.product_name
                                                }

                                            </strong>

                                        </div>


                                        <span
                                            className="receipt-product-quantity"
                                            data-label={
                                                text.quantity
                                            }
                                        >

                                            {
                                                formatNumber(
                                                    item.quantity
                                                )
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


                {/* =================================================
                    TOTALS
                ================================================= */}

                <section className="receipt-totals">


                    <div>

                        <span>

                            {
                                text.subtotal
                            }

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

                            {
                                text.deliveryFee
                            }

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

                            {
                                text.total
                            }

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


                {/* =================================================
                    PAYMENT
                ================================================= */}

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
                                    ? text.cashOnDelivery
                                    : text.cardPayment
                            }

                        </strong>


                        <span>

                            {
                                receipt.payment_status ===
                                    "paid"
                                    ? text.paymentCompleted
                                    : receipt.payment_status ===
                                        "failed"
                                        ? text.paymentFailed
                                        : receipt.payment_status ===
                                            "refunded"
                                            ? text.paymentRefunded
                                            : text.paymentPending
                            }

                        </span>

                    </div>

                </section>


                {/* =================================================
                    NOTES
                ================================================= */}

                {
                    receipt.notes && (

                        <section className="receipt-notes">

                            <strong>

                                {
                                    text.orderNotes
                                }

                            </strong>


                            <p>

                                {
                                    receipt.notes
                                }

                            </p>

                        </section>

                    )
                }


                {/* =================================================
                    FOOTER
                ================================================= */}

                <footer className="receipt-footer">

                    <strong>

                        {
                            text.thankYou
                        }

                    </strong>


                    <span>

                        {
                            text.since1975
                        }

                    </span>


                    <p>

                        {
                            text.keepReceipt
                        }

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
    value,
    ltr = false

}) {

    return (

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
                    value ||
                    "-"
                }

            </strong>

        </div>

    );

}


export default Receipt;