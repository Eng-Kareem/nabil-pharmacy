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


function Checkout() {

    const navigate =
        useNavigate();


    const {
        cartItems,
        cartCount,
        subtotal,
        clearCart
    } = useCart();


    /*
    ========================================================
    CHECKOUT STEP
    ========================================================
    */

    const [
        checkoutStep,
        setCheckoutStep
    ] = useState(
        "details"
    );


    /*
    ========================================================
    DELIVERY METHOD
    ========================================================
    */

    const [
        deliveryMethod,
        setDeliveryMethod
    ] = useState(
        "delivery"
    );


    /*
    ========================================================
    PAYMENT METHOD
    ========================================================
    */

    const [
        paymentMethod,
        setPaymentMethod
    ] = useState(
        "cash"
    );


    /*
    ========================================================
    ORDER STATES
    ========================================================
    */

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


    /*
    ========================================================
    CHECKOUT TOKEN
    ========================================================
    */

    const [
        checkoutToken
    ] = useState(
        () =>
            createCheckoutToken()
    );


    /*
    ========================================================
    CUSTOMER FORM
    ========================================================
    */

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
    PRICE FORMATTER
    ========================================================
    */

    const formatPrice = (
        price
    ) => {

        const safePrice =
            Number(
                price ||
                0
            );


        return (
            `EGP ${safePrice.toLocaleString()}`
        );
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
    PAYMENT METHOD CHANGE
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


        /*
        Required contact fields
        */

        if (
            !formData
                .fullName
                .trim()
        ) {

            setSubmitError(
                "Please enter your full name."
            );


            return;
        }


        if (
            !formData
                .phone
                .trim()
        ) {

            setSubmitError(
                "Please enter your phone number."
            );


            return;
        }


        /*
        Address required only
        for home delivery.
        */

        if (
            deliveryMethod ===
            "delivery" &&
            !formData
                .address
                .trim()
        ) {

            setSubmitError(
                "Please enter your delivery address."
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
            =================================================
            CART VALIDATION
            =================================================
            */

            if (
                cartItems.length ===
                0
            ) {

                setSubmitError(
                    "Your cart is empty."
                );


                return;
            }


            /*
            =================================================
            CARD PAYMENT PROTECTION
            =================================================

            The interactive card is intentionally
            visual only until a real payment
            provider is connected.

            Card number / expiry / CVV are never
            sent to Supabase.
            */

            if (
                paymentMethod ===
                "card"
            ) {

                setSubmitError(
                    "The interactive card is currently a payment preview only. Real card charging is not connected yet. Please choose Cash on Delivery to place this order."
                );


                window.scrollTo({

                    top: 0,

                    behavior:
                        "smooth"

                });


                return;
            }


            /*
            =================================================
            DELIVERY VALIDATION
            =================================================
            */

            if (
                deliveryMethod ===
                "delivery" &&
                !formData
                    .address
                    .trim()
            ) {

                setSubmitError(
                    "Delivery address is required."
                );


                return;
            }


            setIsSubmitting(
                true
            );


            try {

                /*
                =================================================
                SEND ONLY PRODUCT ID + QUANTITY
                =================================================

                Browser prices are not trusted.

                Supabase reads the real price
                directly from products.price.
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
                =================================================
                SECURE ORDER RPC
                =================================================

                Because card payments are blocked
                above, only genuine cash orders
                reach the database.
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


                /*
                =================================================
                SUPABASE ERROR
                =================================================
                */

                if (
                    error
                ) {

                    throw error;
                }


                /*
                =================================================
                NORMALIZE RESPONSE
                =================================================
                */

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
                        "Order was processed but no order ID was returned."
                    );
                }


                /*
                =================================================
                ORDER SUCCESS
                =================================================
                */

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
                =================================================
                WAIT FOR SUCCESS ANIMATION
                =================================================
                */

                await new Promise(
                    resolve => {

                        window.setTimeout(

                            resolve,

                            4600

                        );

                    }
                );


                /*
                =================================================
                CLEAR CART
                =================================================
                */

                clearCart();


                /*
                =================================================
                OPEN RECEIPT
                =================================================
                */

                navigate(

                    `/receipt/${orderId}?token=${encodeURIComponent(
                        checkoutToken
                    )}`,

                    {
                        replace:
                            true
                    }

                );

            } catch (error) {

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


                setSubmitError(

                    error?.message ||
                    "Unable to place your order. Please try again."

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
                            Your cart is empty
                        </h1>


                        <p>

                            Add products to your
                            cart before proceeding
                            to checkout.

                        </p>


                        <Link
                            to="/products"
                            className="primary-button"
                        >

                            Browse Products

                        </Link>

                    </div>

                </div>

            </main>
        );
    }


    /*
    ========================================================
    MAIN CHECKOUT
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

                        <ArrowLeft
                            size={18}
                        />

                        Back to Cart

                    </Link>


                    <span className="section-label">
                        Secure Checkout
                    </span>


                    <h1>

                        Complete your

                        <span>
                            {" "}order.
                        </span>

                    </h1>


                    <p>

                        Review your information,
                        delivery method and pharmacy
                        items before submitting your
                        final order.

                    </p>


                    {
                        submitError && (

                            <div
                                className="checkout-page-error"
                                role="alert"
                            >

                                {submitError}

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
                                        : "1"
                                }

                            </span>


                            <strong>
                                Details
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
                                2
                            </span>


                            <strong>
                                Review
                            </strong>

                        </div>

                    </div>

                </div>

            </section>


            {/* =================================================
                CHECKOUT STEPS
            ================================================= */}

            <AnimatePresence
                mode="wait"
            >

                {
                    checkoutStep ===
                    "details"
                        ? (

                            /*
                            =================================================
                            STEP 1 - DETAILS
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


                                    {/* =====================================
                                        LEFT SIDE
                                    ===================================== */}

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
                                                    02
                                                </span>


                                                <div>

                                                    <h2>
                                                        Delivery Method
                                                    </h2>


                                                    <p>

                                                        Choose how you
                                                        want to receive
                                                        your order.

                                                    </p>

                                                </div>

                                            </div>


                                            <div className="checkout-option-grid">


                                                {/* HOME DELIVERY */}

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
                                                            Home Delivery
                                                        </strong>


                                                        <span>

                                                            Choose your
                                                            location on
                                                            the map

                                                        </span>

                                                    </div>

                                                </button>


                                                {/* PICKUP */}

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
                                                            Pharmacy Pickup
                                                        </strong>


                                                        <span>
                                                            Collect from Nabil Pharmacy
                                                        </span>

                                                    </div>

                                                </button>

                                            </div>


                                            {/* =====================================
                                                MAP
                                            ===================================== */}

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


                                            {/* =====================================
                                                PICKUP MESSAGE
                                            ===================================== */}

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

                                                            transition={{
                                                                duration: 0.3
                                                            }}

                                                        >

                                                            <div className="checkout-review-address">

                                                                <Store />


                                                                <div>

                                                                    <strong>
                                                                        Nabil Pharmacy
                                                                    </strong>


                                                                    <span>

                                                                        Your order will
                                                                        be prepared for
                                                                        pharmacy pickup.

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
                                                    03
                                                </span>


                                                <div>

                                                    <h2>
                                                        Payment Method
                                                    </h2>


                                                    <p>
                                                        Select your preferred payment option.
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
                                                            Cash on Delivery
                                                        </strong>


                                                        <span>
                                                            Pay when your order arrives
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
                                                            Card Payment
                                                        </strong>


                                                        <span>
                                                            Interactive Preview
                                                        </span>

                                                    </div>

                                                </button>

                                            </div>


                                            {/* =====================================
                                                INTERACTIVE CARD
                                            ===================================== */}

                                            <AnimatePresence>

                                                {
                                                    paymentMethod ===
                                                    "card" && (

                                                        <motion.div

                                                            key="interactive-payment-card"

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

                                                            transition={{
                                                                duration: 0.35
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
                                                            ? (
                                                                <>
                                                                    This is an interactive
                                                                    card-payment preview.
                                                                    Card number, expiry date
                                                                    and CVV are not stored and
                                                                    are never sent to Supabase.
                                                                    Real card charging will be
                                                                    enabled only after a secure
                                                                    payment provider is connected.
                                                                </>
                                                            )
                                                            : (
                                                                <>
                                                                    Cash on Delivery is currently
                                                                    the active payment method.
                                                                    Product prices and stock are
                                                                    still verified securely by
                                                                    the backend.
                                                                </>
                                                            )
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
                                                    04
                                                </span>


                                                <div>

                                                    <h2>
                                                        Order Notes
                                                    </h2>


                                                    <p>

                                                        Optional instructions
                                                        for the pharmacy.

                                                    </p>

                                                </div>

                                            </div>


                                            <div className="checkout-field">

                                                <label htmlFor="notes">
                                                    Notes
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

                                                    placeholder="Add any useful instructions..."

                                                />

                                            </div>

                                        </section>

                                    </div>


                                    {/* =====================================
                                        ORDER SUMMARY
                                    ===================================== */}

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

                                    />

                                </form>

                            </motion.section>

                        )
                        : (

                            /*
                            =================================================
                            STEP 2 - REVIEW
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

                                transition={{
                                    duration: 0.3
                                }}

                            >

                                <div className="container checkout-review-layout">


                                    {/* =====================================
                                        LEFT REVIEW
                                    ===================================== */}

                                    <div className="checkout-review-main">


                                        {/* CUSTOMER */}

                                        <section className="checkout-review-card">


                                            <div className="checkout-review-heading">

                                                <div>

                                                    <span>
                                                        Customer
                                                    </span>


                                                    <h2>
                                                        Contact Information
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

                                                    Edit

                                                </button>

                                            </div>


                                            <div className="checkout-review-details">

                                                <div>

                                                    <span>
                                                        Name
                                                    </span>


                                                    <strong>
                                                        {formData.fullName}
                                                    </strong>

                                                </div>


                                                <div>

                                                    <span>
                                                        Phone
                                                    </span>


                                                    <strong>
                                                        {formData.phone}
                                                    </strong>

                                                </div>


                                                <div>

                                                    <span>
                                                        Email
                                                    </span>


                                                    <strong>

                                                        {
                                                            formData.email ||
                                                            "Not provided"
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
                                                        Delivery
                                                    </span>


                                                    <h2>

                                                        {
                                                            deliveryMethod ===
                                                                "delivery"
                                                                ? "Home Delivery"
                                                                : "Pharmacy Pickup"
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

                                                    Edit

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
                                                                            "Address not entered"
                                                                        }

                                                                    </strong>


                                                                    <span>

                                                                        {
                                                                            formData.area
                                                                        }


                                                                        {
                                                                            formData.area &&
                                                                            formData.city
                                                                                ? ", "
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
                                                                                Map Pin
                                                                            </strong>


                                                                            <span>

                                                                                {
                                                                                    Number(
                                                                                        formData.latitude
                                                                                    ).toFixed(
                                                                                        5
                                                                                    )
                                                                                }

                                                                                ,{" "}

                                                                                {
                                                                                    Number(
                                                                                        formData.longitude
                                                                                    ).toFixed(
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
                                                                    Nabil Pharmacy
                                                                </strong>


                                                                <span>
                                                                    Pharmacy pickup selected.
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
                                                        Payment
                                                    </span>


                                                    <h2>

                                                        {
                                                            paymentMethod ===
                                                                "card"
                                                                ? "Card Payment Preview"
                                                                : "Cash on Delivery"
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

                                                    Edit

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
                                                                ? "Card Payment Preview"
                                                                : "Cash on Delivery"
                                                        }

                                                    </strong>


                                                    <span>

                                                        {
                                                            paymentMethod ===
                                                                "card"
                                                                ? (
                                                                    "Interactive card selected. Real card charging is not connected yet, so switch to Cash on Delivery before submitting the order."
                                                                )
                                                                : (
                                                                    "Payment will be collected when your order arrives."
                                                                )
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
                                                        Products
                                                    </span>


                                                    <h2>
                                                        Your Pharmacy Items
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
                                                                        {item.name}
                                                                    </strong>


                                                                    <span>

                                                                        {
                                                                            item.brand ||
                                                                            "Nabil Pharmacy"
                                                                        }

                                                                        {" • Qty "}

                                                                        {
                                                                            item.quantity
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
                                                                Notes
                                                            </span>


                                                            <h2>
                                                                Order Instructions
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
                                            Final Review
                                        </span>


                                        <h2>
                                            Order Summary
                                        </h2>


                                        <div className="checkout-summary-row">

                                            <span>
                                                Items
                                            </span>


                                            <strong>
                                                {cartCount}
                                            </strong>

                                        </div>


                                        <div className="checkout-summary-row">

                                            <span>
                                                Subtotal
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
                                                Delivery
                                            </span>


                                            <strong>

                                                {
                                                    deliveryMethod ===
                                                        "delivery"
                                                        ? "Home Delivery"
                                                        : "Pickup"
                                                }

                                            </strong>

                                        </div>


                                        <div className="checkout-summary-row">

                                            <span>
                                                Payment
                                            </span>


                                            <strong>

                                                {
                                                    paymentMethod ===
                                                        "card"
                                                        ? "Card Preview"
                                                        : "Cash"
                                                }

                                            </strong>

                                        </div>


                                        <div className="checkout-summary-divider">
                                        </div>


                                        <div className="checkout-summary-total">

                                            <span>
                                                Total
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
                                                        ? (
                                                            <>
                                                                Card preview mode is active.
                                                                No card information is sent
                                                                to Nabil Pharmacy or Supabase.
                                                                Select Cash on Delivery to
                                                                submit the order until a real
                                                                payment gateway is connected.
                                                            </>
                                                        )
                                                        : (
                                                            <>
                                                                Product prices and
                                                                stock are independently
                                                                verified by the secure
                                                                order backend before
                                                                your order is accepted.
                                                            </>
                                                        )
                                                }

                                            </p>

                                        </div>


                                        {/* =====================================
                                            DOCTOR + CAR BUTTON
                                        ===================================== */}

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

                                                    Card payment is currently
                                                    preview-only. Choose Cash
                                                    on Delivery to place the
                                                    real order.

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

                                                    Order successfully created.
                                                    Your receipt will open
                                                    automatically.

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

                                            Edit Checkout Details

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
ORDER SUMMARY COMPONENT
========================================================
*/

function CheckoutSummary({

    cartItems,
    cartCount,
    subtotal,
    formatPrice

}) {

    return (

        <aside className="checkout-summary">


            <span className="checkout-summary-label">
                Order Summary
            </span>


            <h2>

                {cartCount}

                {" "}

                item

                {
                    cartCount !==
                    1
                        ? "s"
                        : ""
                }

            </h2>


            {/* =========================================
                PRODUCTS
            ========================================= */}

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
                                        {item.name}
                                    </strong>


                                    <span>

                                        Qty:{" "}

                                        {
                                            item.quantity
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


            {/* =========================================
                SUBTOTAL
            ========================================= */}

            <div className="checkout-summary-row">

                <span>
                    Subtotal
                </span>


                <strong>

                    {
                        formatPrice(
                            subtotal
                        )
                    }

                </strong>

            </div>


            {/* =========================================
                DELIVERY
            ========================================= */}

            <div className="checkout-summary-row">

                <span>
                    Delivery
                </span>


                <strong>
                    Calculated later
                </strong>

            </div>


            <div className="checkout-summary-divider">
            </div>


            {/* =========================================
                TOTAL
            ========================================= */}

            <div className="checkout-summary-total">

                <span>
                    Total
                </span>


                <strong>

                    {
                        formatPrice(
                            subtotal
                        )
                    }

                </strong>

            </div>


            {/* =========================================
                REVIEW BUTTON
            ========================================= */}

            <button

                type="submit"

                className="checkout-place-order"

            >

                <ShieldCheck
                    size={20}
                />

                Review Order

            </button>


            <p className="checkout-demo-note">

                You will review your
                order before final
                submission.

            </p>

        </aside>
    );
}


export default Checkout;