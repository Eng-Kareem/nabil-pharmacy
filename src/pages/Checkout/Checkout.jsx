import ContactPhone
    from "../../components/ContactPhone/ContactPhone.jsx";

import DeliveryMap
    from "../../components/DeliveryMap/DeliveryMap.jsx";

import OrderSuccessButton
    from "../../components/OrderSuccessButton/OrderSuccessButton.jsx";

import PaymentCard
    from "../../components/PaymentCard/PaymentCard.jsx";


import {
    ArrowLeft,
    ArrowRight,
    Check,
    CreditCard,
    Edit3,
    MapPin,
    PackageCheck,
    ShieldCheck,
    Store,
    Truck
} from "lucide-react";


import {
    AnimatePresence,
    motion
} from "framer-motion";


import {
    Link,
    useNavigate
} from "react-router-dom";


import {
    useState
} from "react";


import {
    useCart
} from "../../context/CartContext.jsx";


import {
    useLanguage
} from "../../context/LanguageContext.jsx";


import checkoutTranslations
    from "../../i18n/checkoutTranslations.js";


import {
    supabase
} from "../../lib/supabase.js";


import "./Checkout.css";


/*
========================================================
CREATE CHECKOUT TOKEN
========================================================
*/

function createCheckoutToken() {

    if (
        globalThis.crypto?.randomUUID
    ) {

        return globalThis.crypto
            .randomUUID();

    }


    if (
        globalThis.crypto
            ?.getRandomValues
    ) {

        const bytes =
            new Uint8Array(
                16
            );


        globalThis.crypto
            .getRandomValues(
                bytes
            );


        bytes[6] =
            (
                bytes[6] &
                0x0f
            ) |
            0x40;


        bytes[8] =
            (
                bytes[8] &
                0x3f
            ) |
            0x80;


        const hex =
            Array.from(
                bytes,
                byte =>
                    byte
                        .toString(16)
                        .padStart(
                            2,
                            "0"
                        )
            );


        return (
            `${hex.slice(0, 4).join("")}-` +
            `${hex.slice(4, 6).join("")}-` +
            `${hex.slice(6, 8).join("")}-` +
            `${hex.slice(8, 10).join("")}-` +
            `${hex.slice(10, 16).join("")}`
        );

    }


    return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx"
        .replace(
            /[xy]/g,
            character => {

                const random =
                    Math.floor(
                        Math.random() *
                        16
                    );


                const value =
                    character === "x"
                        ? random
                        : (
                            random &
                            0x3
                        ) |
                        0x8;


                return value
                    .toString(16);

            }
        );

}


/*
========================================================
CHECKOUT
========================================================
*/

function Checkout() {

    const navigate =
        useNavigate();


    const {
        cartItems,
        cartCount,
        subtotal,
        clearCart
    } =
        useCart();


    const {
        language,
        isArabic
    } =
        useLanguage();


    const text =
        checkoutTranslations[
            language
        ] ||
        checkoutTranslations.en;


    const BackIcon =
        isArabic
            ? ArrowRight
            : ArrowLeft;


    /*
    ========================================================
    STATE
    ========================================================
    */

    const [
        checkoutStep,
        setCheckoutStep
    ] = useState(
        "details"
    );


    const [
        deliveryMethod,
        setDeliveryMethod
    ] = useState(
        "delivery"
    );


    const [
        paymentMethod,
        setPaymentMethod
    ] = useState(
        "cash"
    );


    const [
        isSubmitting,
        setIsSubmitting
    ] = useState(
        false
    );


    const [
        isSuccess,
        setIsSuccess
    ] = useState(
        false
    );


    const [
        submitError,
        setSubmitError
    ] = useState(
        ""
    );


    const [
        completedOrder,
        setCompletedOrder
    ] = useState(
        null
    );


    const [
        checkoutToken
    ] = useState(
        () =>
            createCheckoutToken()
    );


    const [
        formData,
        setFormData
    ] = useState({

        fullName: "",

        phone: "",

        email: "",

        address: "",

        area: "",

        city: "",

        latitude: null,

        longitude: null,

        notes: ""

    });


    /*
    ========================================================
    NUMBER FORMAT
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
    PRICE FORMAT
    ========================================================
    */

    const formatPrice = (
        price
    ) => {

        const value =
            Number(
                price ||
                0
            ).toLocaleString(
                isArabic
                    ? "ar-EG"
                    : "en-US"
            );


        return isArabic
            ? `${value} ج.م`
            : `EGP ${value}`;

    };


    /*
    ========================================================
    FORM CHANGE
    ========================================================
    */

    const handleChange = (
        event
    ) => {

        const {
            name,
            value
        } =
            event.target;


        setFormData(
            current => ({

                ...current,

                [name]:
                    value

            })
        );

    };


    /*
    ========================================================
    PAYMENT METHOD
    ========================================================
    */

    const choosePaymentMethod = (
        method
    ) => {

        setPaymentMethod(
            method
        );


        setSubmitError(
            ""
        );

    };


    /*
    ========================================================
    REVIEW ORDER
    ========================================================
    */

    const handleReview = (
        event
    ) => {

        event.preventDefault();


        setSubmitError(
            ""
        );


        if (
            !formData
                .fullName
                .trim()
        ) {

            setSubmitError(
                text.enterFullName
            );

            return;

        }


        if (
            !formData
                .phone
                .trim()
        ) {

            setSubmitError(
                text.enterPhone
            );

            return;

        }


        if (
            deliveryMethod ===
            "delivery" &&
            !formData
                .address
                .trim()
        ) {

            setSubmitError(
                text.enterDeliveryAddress
            );

            return;

        }


        setCheckoutStep(
            "review"
        );


        window.scrollTo({

            top: 0,

            behavior:
                "smooth"

        });

    };


    /*
    ========================================================
    RETURN TO DETAILS
    ========================================================
    */

    const returnToDetails =
        () => {

            if (
                isSubmitting ||
                isSuccess
            ) {

                return;

            }


            setSubmitError(
                ""
            );


            setCheckoutStep(
                "details"
            );


            window.scrollTo({

                top: 0,

                behavior:
                    "smooth"

            });

        };


    /*
    ========================================================
    CONFIRM ORDER
    ========================================================
    */

    const handleConfirmOrder =
        async () => {

            if (
                isSubmitting ||
                isSuccess
            ) {

                return;

            }


            setSubmitError(
                ""
            );


            /*
            ================================================
            CART
            ================================================
            */

            if (
                cartItems.length ===
                0
            ) {

                setSubmitError(
                    text.cartEmpty
                );

                return;

            }


            /*
            ================================================
            CARD IS PREVIEW ONLY
            ================================================
            */

            if (
                paymentMethod ===
                "card"
            ) {

                setSubmitError(
                    text.cardPreviewOnlyError
                );


                window.scrollTo({

                    top: 0,

                    behavior:
                        "smooth"

                });


                return;

            }


            /*
            ================================================
            ADDRESS
            ================================================
            */

            if (
                deliveryMethod ===
                "delivery" &&
                !formData
                    .address
                    .trim()
            ) {

                setSubmitError(
                    text.deliveryAddressRequired
                );

                return;

            }


            setIsSubmitting(
                true
            );


            try {

                /*
                ============================================
                ONLY SEND PRODUCT ID + QUANTITY

                Product prices are verified by Supabase.
                ============================================
                */

                const orderItems =
                    cartItems.map(
                        item => ({

                            product_id:
                                item.id,

                            quantity:
                                Number(
                                    item.quantity
                                )

                        })
                    );


                /*
                ============================================
                PLACE ORDER RPC
                ============================================
                */

                const {
                    data,
                    error
                } =
                    await supabase
                        .rpc(
                            "place_order",
                            {

                                p_items:
                                    orderItems,

                                p_full_name:
                                    formData
                                        .fullName
                                        .trim(),

                                p_phone:
                                    formData
                                        .phone
                                        .trim(),

                                p_delivery_method:
                                    deliveryMethod,

                                p_payment_method:
                                    "cash",

                                p_checkout_token:
                                    checkoutToken,

                                p_email:
                                    formData
                                        .email
                                        .trim() ||
                                    null,

                                p_address:
                                    deliveryMethod ===
                                        "delivery"
                                        ? (
                                            formData
                                                .address
                                                .trim() ||
                                            null
                                        )
                                        : null,

                                p_area:
                                    deliveryMethod ===
                                        "delivery"
                                        ? (
                                            formData
                                                .area
                                                .trim() ||
                                            null
                                        )
                                        : null,

                                p_city:
                                    deliveryMethod ===
                                        "delivery"
                                        ? (
                                            formData
                                                .city
                                                .trim() ||
                                            null
                                        )
                                        : null,

                                p_latitude:
                                    deliveryMethod ===
                                        "delivery"
                                        ? formData
                                            .latitude
                                        : null,

                                p_longitude:
                                    deliveryMethod ===
                                        "delivery"
                                        ? formData
                                            .longitude
                                        : null,

                                p_notes:
                                    formData
                                        .notes
                                        .trim() ||
                                    null,

                                p_branch_id:
                                    null

                            }
                        );


                if (
                    error
                ) {

                    throw error;

                }


                const result =
                    Array.isArray(
                        data
                    )
                        ? data[0]
                        : data;


                const orderId =
                    result
                        ?.order_id ||
                    result
                        ?.id;


                if (
                    !orderId
                ) {

                    throw new Error(
                        text.noOrderId
                    );

                }


                setCompletedOrder({

                    ...result,

                    order_id:
                        orderId

                });


                setIsSubmitting(
                    false
                );


                setIsSuccess(
                    true
                );


                /*
                ============================================
                SUCCESS ANIMATION
                ============================================
                */

                await new Promise(
                    resolve => {

                        window.setTimeout(

                            resolve,

                            4600

                        );

                    }
                );


                clearCart();


                navigate(

                    `/receipt/${orderId}?token=${encodeURIComponent(
                        checkoutToken
                    )}`,

                    {
                        replace:
                            true
                    }

                );

            } catch (
                error
            ) {

                console.error(
                    "Order placement error:",
                    error
                );


                setCompletedOrder(
                    null
                );


                setIsSuccess(
                    false
                );


                /*
                Never show untranslated backend errors
                in Arabic mode.
                */

                setSubmitError(

                    isArabic
                        ? text.orderFailed
                        : (
                            error?.message ||
                            text.orderFailed
                        )

                );


                setIsSubmitting(
                    false
                );

            }

        };


    /*
    ========================================================
    EMPTY CART
    ========================================================
    */

    if (
        cartItems.length ===
        0 &&
        !completedOrder
    ) {

        return (

            <main className="checkout-empty-page">

                <div className="container">

                    <div className="checkout-empty-card">

                        <PackageCheck
                            size={48}
                        />


                        <h1>

                            {
                                text.emptyCart
                            }

                        </h1>


                        <p>

                            {
                                text.emptyCartDescription
                            }

                        </p>


                        <Link
                            to="/products"
                            className="primary-button"
                        >

                            {
                                text.exploreProducts
                            }

                        </Link>

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

        <main className="checkout-page">


            {/* =================================================
                HEADER
            ================================================= */}

            <section className="checkout-heading-section">

                <div className="container">


                    <Link
                        to="/cart"
                        className="checkout-back-link"
                    >

                        <BackIcon
                            size={18}
                        />

                        {
                            text.backToCart
                        }

                    </Link>


                    <span className="section-label">

                        {
                            text.secureCheckout
                        }

                    </span>


                    <h1>

                        {
                            text.completeOrder
                        }

                        <span>

                            {" "}

                            {
                                text.completeOrderAccent
                            }

                        </span>

                    </h1>


                    <p>

                        {
                            text.checkoutDescription
                        }

                    </p>


                    {
                        submitError && (

                            <div
                                className="checkout-page-error"
                                role="alert"
                            >

                                {
                                    submitError
                                }

                            </div>

                        )
                    }


                    {/* =========================================
                        PROGRESS
                    ========================================= */}

                    <div className="checkout-progress">


                        <div
                            className={
                                checkoutStep ===
                                    "details"
                                    ? "checkout-progress-step active"
                                    : "checkout-progress-step completed"
                            }
                        >

                            <span>

                                {
                                    checkoutStep ===
                                        "review"
                                        ? (
                                            <Check
                                                size={16}
                                            />
                                        )
                                        : formatNumber(
                                            1
                                        )
                                }

                            </span>


                            <strong>

                                {
                                    text.details
                                }

                            </strong>

                        </div>


                        <div className="checkout-progress-line">
                        </div>


                        <div
                            className={
                                checkoutStep ===
                                    "review"
                                    ? "checkout-progress-step active"
                                    : "checkout-progress-step"
                            }
                        >

                            <span>

                                {
                                    formatNumber(
                                        2
                                    )
                                }

                            </span>


                            <strong>

                                {
                                    text.review
                                }

                            </strong>

                        </div>

                    </div>

                </div>

            </section>


            <AnimatePresence
                mode="wait"
            >

                {
                    checkoutStep ===
                    "details"
                        ? (

                            /*
                            =================================================
                            DETAILS STEP
                            =================================================
                            */

                            <motion.section

                                key="details"

                                className="checkout-content"

                                initial={{
                                    opacity: 0,
                                    y: 15
                                }}

                                animate={{
                                    opacity: 1,
                                    y: 0
                                }}

                                exit={{
                                    opacity: 0,
                                    y: -15
                                }}

                                transition={{
                                    duration: 0.3
                                }}

                            >

                                <form

                                    className="container checkout-layout"

                                    onSubmit={
                                        handleReview
                                    }

                                >


                                    <div className="checkout-form-area">


                                        {/* =====================================
                                            01 CONTACT
                                        ===================================== */}

                                        <ContactPhone

                                            formData={
                                                formData
                                            }

                                            handleChange={
                                                handleChange
                                            }

                                        />


                                        {/* =====================================
                                            02 DELIVERY
                                        ===================================== */}

                                        <section className="checkout-card">


                                            <div className="checkout-card-heading">

                                                <span>

                                                    {
                                                        formatNumber(
                                                            2
                                                        )
                                                    }

                                                </span>


                                                <div>

                                                    <h2>

                                                        {
                                                            text.deliveryMethod
                                                        }

                                                    </h2>


                                                    <p>

                                                        {
                                                            text.chooseReceiveMethod
                                                        }

                                                    </p>

                                                </div>

                                            </div>


                                            <div className="checkout-option-grid">


                                                <button

                                                    type="button"

                                                    className={
                                                        deliveryMethod ===
                                                            "delivery"
                                                            ? "checkout-option active"
                                                            : "checkout-option"
                                                    }

                                                    onClick={() =>
                                                        setDeliveryMethod(
                                                            "delivery"
                                                        )
                                                    }

                                                >

                                                    <Truck />


                                                    <div>

                                                        <strong>

                                                            {
                                                                text.homeDelivery
                                                            }

                                                        </strong>


                                                        <span>

                                                            {
                                                                text.chooseLocationMap
                                                            }

                                                        </span>

                                                    </div>

                                                </button>


                                                <button

                                                    type="button"

                                                    className={
                                                        deliveryMethod ===
                                                            "pickup"
                                                            ? "checkout-option active"
                                                            : "checkout-option"
                                                    }

                                                    onClick={() =>
                                                        setDeliveryMethod(
                                                            "pickup"
                                                        )
                                                    }

                                                >

                                                    <Store />


                                                    <div>

                                                        <strong>

                                                            {
                                                                text.pharmacyPickup
                                                            }

                                                        </strong>


                                                        <span>

                                                            {
                                                                text.collectFromPharmacy
                                                            }

                                                        </span>

                                                    </div>

                                                </button>

                                            </div>


                                            {/* MAP */}

                                            <AnimatePresence>

                                                {
                                                    deliveryMethod ===
                                                    "delivery" && (

                                                        <motion.div

                                                            key="delivery-map"

                                                            initial={{
                                                                opacity: 0,
                                                                y: 20,
                                                                scale: 0.99
                                                            }}

                                                            animate={{
                                                                opacity: 1,
                                                                y: 0,
                                                                scale: 1
                                                            }}

                                                            exit={{
                                                                opacity: 0,
                                                                y: 15,
                                                                scale: 0.99
                                                            }}

                                                            transition={{
                                                                duration: 0.4
                                                            }}

                                                        >

                                                            <DeliveryMap

                                                                formData={
                                                                    formData
                                                                }

                                                                setFormData={
                                                                    setFormData
                                                                }

                                                                handleChange={
                                                                    handleChange
                                                                }

                                                            />

                                                        </motion.div>

                                                    )
                                                }

                                            </AnimatePresence>


                                            {/* PICKUP */}

                                            <AnimatePresence>

                                                {
                                                    deliveryMethod ===
                                                    "pickup" && (

                                                        <motion.div

                                                            key="pickup"

                                                            className="checkout-address-area"

                                                            initial={{
                                                                opacity: 0,
                                                                y: 15
                                                            }}

                                                            animate={{
                                                                opacity: 1,
                                                                y: 0
                                                            }}

                                                            exit={{
                                                                opacity: 0,
                                                                y: 10
                                                            }}

                                                        >

                                                            <div className="checkout-review-address">

                                                                <Store />


                                                                <div>

                                                                    <strong>

                                                                        {
                                                                            isArabic
                                                                                ? "صيدلية نبيل"
                                                                                : "Nabil Pharmacy"
                                                                        }

                                                                    </strong>


                                                                    <span>

                                                                        {
                                                                            text.pickupPrepared
                                                                        }

                                                                    </span>

                                                                </div>

                                                            </div>

                                                        </motion.div>

                                                    )
                                                }

                                            </AnimatePresence>

                                        </section>


                                        {/* =====================================
                                            03 PAYMENT
                                        ===================================== */}

                                        <section className="checkout-card">


                                            <div className="checkout-card-heading">

                                                <span>

                                                    {
                                                        formatNumber(
                                                            3
                                                        )
                                                    }

                                                </span>


                                                <div>

                                                    <h2>

                                                        {
                                                            text.paymentMethod
                                                        }

                                                    </h2>


                                                    <p>

                                                        {
                                                            text.selectPayment
                                                        }

                                                    </p>

                                                </div>

                                            </div>


                                            <div className="checkout-payment-options">


                                                {/* CASH */}

                                                <button

                                                    type="button"

                                                    className={
                                                        paymentMethod ===
                                                            "cash"
                                                            ? "checkout-payment active"
                                                            : "checkout-payment"
                                                    }

                                                    onClick={() =>
                                                        choosePaymentMethod(
                                                            "cash"
                                                        )
                                                    }

                                                >

                                                    <Truck />


                                                    <div>

                                                        <strong>

                                                            {
                                                                text.cashOnDelivery
                                                            }

                                                        </strong>


                                                        <span>

                                                            {
                                                                text.payOnArrival
                                                            }

                                                        </span>

                                                    </div>

                                                </button>


                                                {/* CARD */}

                                                <button

                                                    type="button"

                                                    className={
                                                        paymentMethod ===
                                                            "card"
                                                            ? "checkout-payment active"
                                                            : "checkout-payment"
                                                    }

                                                    onClick={() =>
                                                        choosePaymentMethod(
                                                            "card"
                                                        )
                                                    }

                                                >

                                                    <CreditCard />


                                                    <div>

                                                        <strong>

                                                            {
                                                                text.cardPayment
                                                            }

                                                        </strong>


                                                        <span>

                                                            {
                                                                text.interactivePreview
                                                            }

                                                        </span>

                                                    </div>

                                                </button>

                                            </div>


                                            <AnimatePresence>

                                                {
                                                    paymentMethod ===
                                                    "card" && (

                                                        <motion.div

                                                            key="interactive-card"

                                                            initial={{
                                                                opacity: 0,
                                                                y: 20,
                                                                scale: 0.98
                                                            }}

                                                            animate={{
                                                                opacity: 1,
                                                                y: 0,
                                                                scale: 1
                                                            }}

                                                            exit={{
                                                                opacity: 0,
                                                                y: 15,
                                                                scale: 0.98
                                                            }}

                                                        >

                                                            <PaymentCard />

                                                        </motion.div>

                                                    )
                                                }

                                            </AnimatePresence>


                                            <div className="checkout-payment-security">

                                                <ShieldCheck />


                                                <span>

                                                    {
                                                        paymentMethod ===
                                                            "card"
                                                            ? text.cardSecurity
                                                            : text.cashSecurity
                                                    }

                                                </span>

                                            </div>

                                        </section>


                                        {/* =====================================
                                            04 NOTES
                                        ===================================== */}

                                        <section className="checkout-card">


                                            <div className="checkout-card-heading">

                                                <span>

                                                    {
                                                        formatNumber(
                                                            4
                                                        )
                                                    }

                                                </span>


                                                <div>

                                                    <h2>

                                                        {
                                                            text.orderNotes
                                                        }

                                                    </h2>


                                                    <p>

                                                        {
                                                            text.notesDescription
                                                        }

                                                    </p>

                                                </div>

                                            </div>


                                            <div className="checkout-field">

                                                <label htmlFor="notes">

                                                    {
                                                        text.notes
                                                    }

                                                </label>


                                                <textarea

                                                    id="notes"

                                                    name="notes"

                                                    rows="5"

                                                    value={
                                                        formData.notes
                                                    }

                                                    onChange={
                                                        handleChange
                                                    }

                                                    placeholder={
                                                        text.notesPlaceholder
                                                    }

                                                />

                                            </div>

                                        </section>

                                    </div>


                                    <CheckoutSummary

                                        cartItems={
                                            cartItems
                                        }

                                        cartCount={
                                            cartCount
                                        }

                                        subtotal={
                                            subtotal
                                        }

                                        formatPrice={
                                            formatPrice
                                        }

                                        formatNumber={
                                            formatNumber
                                        }

                                        text={
                                            text
                                        }

                                    />

                                </form>

                            </motion.section>

                        )
                        : (

                            /*
                            =================================================
                            REVIEW STEP
                            =================================================
                            */

                            <motion.section

                                key="review"

                                className="checkout-review-section"

                                initial={{
                                    opacity: 0,
                                    y: 15
                                }}

                                animate={{
                                    opacity: 1,
                                    y: 0
                                }}

                                exit={{
                                    opacity: 0,
                                    y: -15
                                }}

                            >

                                <div className="container checkout-review-layout">


                                    <div className="checkout-review-main">


                                        {/* CUSTOMER */}

                                        <section className="checkout-review-card">

                                            <div className="checkout-review-heading">

                                                <div>

                                                    <span>

                                                        {
                                                            text.customer
                                                        }

                                                    </span>


                                                    <h2>

                                                        {
                                                            text.contactInformation
                                                        }

                                                    </h2>

                                                </div>


                                                <button
                                                    type="button"
                                                    onClick={
                                                        returnToDetails
                                                    }
                                                >

                                                    <Edit3
                                                        size={16}
                                                    />

                                                    {
                                                        text.edit
                                                    }

                                                </button>

                                            </div>


                                            <div className="checkout-review-details">

                                                <div>

                                                    <span>

                                                        {
                                                            text.name
                                                        }

                                                    </span>


                                                    <strong>

                                                        {
                                                            formData.fullName
                                                        }

                                                    </strong>

                                                </div>


                                                <div>

                                                    <span>

                                                        {
                                                            text.phone
                                                        }

                                                    </span>


                                                    <strong
                                                        dir="ltr"
                                                    >

                                                        {
                                                            formData.phone
                                                        }

                                                    </strong>

                                                </div>


                                                <div>

                                                    <span>

                                                        {
                                                            text.email
                                                        }

                                                    </span>


                                                    <strong>

                                                        {
                                                            formData.email ||
                                                            text.notProvided
                                                        }

                                                    </strong>

                                                </div>

                                            </div>

                                        </section>


                                        {/* DELIVERY */}

                                        <section className="checkout-review-card">

                                            <div className="checkout-review-heading">

                                                <div>

                                                    <span>

                                                        {
                                                            text.delivery
                                                        }

                                                    </span>


                                                    <h2>

                                                        {
                                                            deliveryMethod ===
                                                                "delivery"
                                                                ? text.homeDelivery
                                                                : text.pharmacyPickup
                                                        }

                                                    </h2>

                                                </div>


                                                <button
                                                    type="button"
                                                    onClick={
                                                        returnToDetails
                                                    }
                                                >

                                                    <Edit3
                                                        size={16}
                                                    />

                                                    {
                                                        text.edit
                                                    }

                                                </button>

                                            </div>


                                            {
                                                deliveryMethod ===
                                                "delivery"
                                                    ? (

                                                        <>

                                                            <div className="checkout-review-address">

                                                                <MapPin />


                                                                <div>

                                                                    <strong>

                                                                        {
                                                                            formData.address ||
                                                                            text.addressNotEntered
                                                                        }

                                                                    </strong>


                                                                    <span>

                                                                        {
                                                                            formData.area
                                                                        }


                                                                        {
                                                                            formData.area &&
                                                                            formData.city
                                                                                ? "، "
                                                                                : ""
                                                                        }


                                                                        {
                                                                            formData.city
                                                                        }

                                                                    </span>

                                                                </div>

                                                            </div>


                                                            {
                                                                formData.latitude !==
                                                                null &&
                                                                formData.longitude !==
                                                                null && (

                                                                    <div
                                                                        className="checkout-review-address"
                                                                        style={{
                                                                            marginTop:
                                                                                "12px"
                                                                        }}
                                                                    >

                                                                        <MapPin />


                                                                        <div>

                                                                            <strong>

                                                                                {
                                                                                    text.mapPin
                                                                                }

                                                                            </strong>


                                                                            <span
                                                                                dir="ltr"
                                                                            >

                                                                                {
                                                                                    Number(
                                                                                        formData.latitude
                                                                                    )
                                                                                        .toFixed(
                                                                                            5
                                                                                        )
                                                                                }

                                                                                ,{" "}

                                                                                {
                                                                                    Number(
                                                                                        formData.longitude
                                                                                    )
                                                                                        .toFixed(
                                                                                            5
                                                                                        )
                                                                                }

                                                                            </span>

                                                                        </div>

                                                                    </div>

                                                                )
                                                            }

                                                        </>

                                                    )
                                                    : (

                                                        <div className="checkout-review-address">

                                                            <Store />


                                                            <div>

                                                                <strong>

                                                                    {
                                                                        isArabic
                                                                            ? "صيدلية نبيل"
                                                                            : "Nabil Pharmacy"
                                                                    }

                                                                </strong>


                                                                <span>

                                                                    {
                                                                        text.pickupPrepared
                                                                    }

                                                                </span>

                                                            </div>

                                                        </div>

                                                    )
                                            }

                                        </section>


                                        {/* PAYMENT */}

                                        <section className="checkout-review-card">

                                            <div className="checkout-review-heading">

                                                <div>

                                                    <span>

                                                        {
                                                            text.paymentMethod
                                                        }

                                                    </span>


                                                    <h2>

                                                        {
                                                            paymentMethod ===
                                                                "card"
                                                                ? text.cardPaymentPreview
                                                                : text.cashOnDelivery
                                                        }

                                                    </h2>

                                                </div>


                                                <button
                                                    type="button"
                                                    onClick={
                                                        returnToDetails
                                                    }
                                                >

                                                    <Edit3
                                                        size={16}
                                                    />

                                                    {
                                                        text.edit
                                                    }

                                                </button>

                                            </div>


                                            <div className="checkout-review-address">

                                                {
                                                    paymentMethod ===
                                                        "card"
                                                        ? (
                                                            <CreditCard />
                                                        )
                                                        : (
                                                            <Truck />
                                                        )
                                                }


                                                <div>

                                                    <strong>

                                                        {
                                                            paymentMethod ===
                                                                "card"
                                                                ? text.cardPaymentPreview
                                                                : text.cashOnDelivery
                                                        }

                                                    </strong>


                                                    <span>

                                                        {
                                                            paymentMethod ===
                                                                "card"
                                                                ? text.cardReviewDescription
                                                                : text.cashReviewDescription
                                                        }

                                                    </span>

                                                </div>

                                            </div>

                                        </section>


                                        {/* PRODUCTS */}

                                        <section className="checkout-review-card">

                                            <div className="checkout-review-heading">

                                                <div>

                                                    <span>

                                                        {
                                                            text.products
                                                        }

                                                    </span>


                                                    <h2>

                                                        {
                                                            text.pharmacyItems
                                                        }

                                                    </h2>

                                                </div>

                                            </div>


                                            <div className="checkout-review-products">

                                                {
                                                    cartItems.map(
                                                        item => (

                                                            <div
                                                                className="checkout-review-product"
                                                                key={
                                                                    item.id
                                                                }
                                                            >

                                                                <div className="checkout-review-product-icon">

                                                                    <PackageCheck
                                                                        size={23}
                                                                    />

                                                                </div>


                                                                <div>

                                                                    <strong>

                                                                        {
                                                                            item.name
                                                                        }

                                                                    </strong>


                                                                    <span>

                                                                        {
                                                                            item.brand ||
                                                                            (
                                                                                isArabic
                                                                                    ? "صيدلية نبيل"
                                                                                    : "Nabil Pharmacy"
                                                                            )
                                                                        }

                                                                        {" • "}

                                                                        {
                                                                            text.quantityShort
                                                                        }

                                                                        {" "}

                                                                        {
                                                                            formatNumber(
                                                                                item.quantity
                                                                            )
                                                                        }

                                                                    </span>

                                                                </div>


                                                                <strong>

                                                                    {
                                                                        formatPrice(

                                                                            Number(
                                                                                item.price
                                                                            ) *

                                                                            Number(
                                                                                item.quantity
                                                                            )

                                                                        )
                                                                    }

                                                                </strong>

                                                            </div>

                                                        )
                                                    )
                                                }

                                            </div>

                                        </section>


                                        {/* NOTES */}

                                        {
                                            formData.notes && (

                                                <section className="checkout-review-card">

                                                    <div className="checkout-review-heading">

                                                        <div>

                                                            <span>

                                                                {
                                                                    text.notes
                                                                }

                                                            </span>


                                                            <h2>

                                                                {
                                                                    text.orderInstructions
                                                                }

                                                            </h2>

                                                        </div>

                                                    </div>


                                                    <p className="checkout-review-notes">

                                                        {
                                                            formData.notes
                                                        }

                                                    </p>

                                                </section>

                                            )
                                        }

                                    </div>


                                    {/* =====================================
                                        FINAL SUMMARY
                                    ===================================== */}

                                    <aside className="checkout-final-summary">

                                        <span className="checkout-summary-label">

                                            {
                                                text.finalReview
                                            }

                                        </span>


                                        <h2>

                                            {
                                                text.orderSummary
                                            }

                                        </h2>


                                        <div className="checkout-summary-row">

                                            <span>

                                                {
                                                    text.itemsLabel
                                                }

                                            </span>


                                            <strong>

                                                {
                                                    formatNumber(
                                                        cartCount
                                                    )
                                                }

                                            </strong>

                                        </div>


                                        <div className="checkout-summary-row">

                                            <span>

                                                {
                                                    text.subtotal
                                                }

                                            </span>


                                            <strong>

                                                {
                                                    formatPrice(
                                                        subtotal
                                                    )
                                                }

                                            </strong>

                                        </div>


                                        <div className="checkout-summary-row">

                                            <span>

                                                {
                                                    text.delivery
                                                }

                                            </span>


                                            <strong>

                                                {
                                                    deliveryMethod ===
                                                        "delivery"
                                                        ? text.homeDelivery
                                                        : text.pickup
                                                }

                                            </strong>

                                        </div>


                                        <div className="checkout-summary-row">

                                            <span>

                                                {
                                                    text.paymentMethod
                                                }

                                            </span>


                                            <strong>

                                                {
                                                    paymentMethod ===
                                                        "card"
                                                        ? text.cardPreview
                                                        : text.cash
                                                }

                                            </strong>

                                        </div>


                                        <div className="checkout-summary-divider">
                                        </div>


                                        <div className="checkout-summary-total">

                                            <span>

                                                {
                                                    text.total
                                                }

                                            </span>


                                            <strong>

                                                {
                                                    formatPrice(
                                                        subtotal
                                                    )
                                                }

                                            </strong>

                                        </div>


                                        <div className="checkout-review-security">

                                            <ShieldCheck />


                                            <p>

                                                {
                                                    paymentMethod ===
                                                        "card"
                                                        ? text.cardBackendSecurity
                                                        : text.cashBackendSecurity
                                                }

                                            </p>

                                        </div>


                                        <OrderSuccessButton

                                            isSubmitting={
                                                isSubmitting
                                            }

                                            isSuccess={
                                                isSuccess
                                            }

                                            error={
                                                submitError
                                            }

                                            onClick={
                                                handleConfirmOrder
                                            }

                                            disabled={
                                                cartItems.length ===
                                                0
                                            }

                                        />


                                        {
                                            paymentMethod ===
                                            "card" && (

                                                <small
                                                    className="checkout-confirm-note"
                                                    style={{
                                                        color:
                                                            "#8d0b12",

                                                        fontWeight:
                                                            "700"
                                                    }}
                                                >

                                                    {
                                                        text.cardPreviewNotice
                                                    }

                                                </small>

                                            )
                                        }


                                        {
                                            isSuccess && (

                                                <small
                                                    className="checkout-confirm-note"
                                                    style={{
                                                        color:
                                                            "#19723d",

                                                        fontWeight:
                                                            "700"
                                                    }}
                                                >

                                                    {
                                                        text.orderCreated
                                                    }

                                                </small>

                                            )
                                        }


                                        <button

                                            type="button"

                                            className="checkout-edit-order"

                                            onClick={
                                                returnToDetails
                                            }

                                            disabled={
                                                isSubmitting ||
                                                isSuccess
                                            }

                                        >

                                            <Edit3
                                                size={16}
                                            />

                                            {
                                                text.editCheckout
                                            }

                                        </button>

                                    </aside>

                                </div>

                            </motion.section>

                        )
                }

            </AnimatePresence>

        </main>

    );

}


/*
========================================================
ORDER SUMMARY
========================================================
*/

function CheckoutSummary({

    cartItems,
    cartCount,
    subtotal,
    formatPrice,
    formatNumber,
    text

}) {

    return (

        <aside className="checkout-summary">


            <span className="checkout-summary-label">

                {
                    text.orderSummary
                }

            </span>


            <h2>

                {
                    formatNumber(
                        cartCount
                    )
                }

                {" "}

                {
                    cartCount ===
                    1
                        ? text.item
                        : text.items
                }

            </h2>


            <div className="checkout-summary-products">

                {
                    cartItems.map(
                        item => (

                            <div
                                className="checkout-summary-product"
                                key={
                                    item.id
                                }
                            >

                                <div className="checkout-summary-product-icon">

                                    <PackageCheck
                                        size={22}
                                    />

                                </div>


                                <div>

                                    <strong>

                                        {
                                            item.name
                                        }

                                    </strong>


                                    <span>

                                        {
                                            text.quantityShort
                                        }

                                        :{" "}

                                        {
                                            formatNumber(
                                                item.quantity
                                            )
                                        }

                                    </span>

                                </div>


                                <strong>

                                    {
                                        formatPrice(

                                            Number(
                                                item.price
                                            ) *

                                            Number(
                                                item.quantity
                                            )

                                        )
                                    }

                                </strong>

                            </div>

                        )
                    )
                }

            </div>


            <div className="checkout-summary-divider">
            </div>


            <div className="checkout-summary-row">

                <span>

                    {
                        text.subtotal
                    }

                </span>


                <strong>

                    {
                        formatPrice(
                            subtotal
                        )
                    }

                </strong>

            </div>


            <div className="checkout-summary-row">

                <span>

                    {
                        text.delivery
                    }

                </span>


                <strong>

                    {
                        text.calculatedLater
                    }

                </strong>

            </div>


            <div className="checkout-summary-divider">
            </div>


            <div className="checkout-summary-total">

                <span>

                    {
                        text.total
                    }

                </span>


                <strong>

                    {
                        formatPrice(
                            subtotal
                        )
                    }

                </strong>

            </div>


            <button

                type="submit"

                className="checkout-place-order"

            >

                <ShieldCheck
                    size={20}
                />

                {
                    text.reviewOrder
                }

            </button>


            <p className="checkout-demo-note">

                {
                    text.reviewBeforeSubmit
                }

            </p>

        </aside>

    );

}


export default Checkout;