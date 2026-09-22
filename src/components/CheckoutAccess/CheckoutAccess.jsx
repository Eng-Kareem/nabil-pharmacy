import {
    ArrowLeft,
    ArrowRight,
    ShieldCheck,
    ShoppingBag,
    UserRound
} from "lucide-react";

import {
    useState
} from "react";

import {
    Link
} from "react-router-dom";

import {
    motion
} from "framer-motion";

import {
    useAuth
} from "../../context/AuthContext.jsx";

import {
    useLanguage
} from "../../context/LanguageContext.jsx";

import checkoutTranslations
    from "../../i18n/checkoutTranslations.js";

import Checkout
    from "../../pages/Checkout/Checkout.jsx";

import "./CheckoutAccess.css";


function CheckoutAccess() {

    const {
        user,
        authLoading
    } = useAuth();


    const {
        language,
        isArabic
    } = useLanguage();


    const text =
        checkoutTranslations[
            language
        ] ||
        checkoutTranslations.en;


    const ContinueIcon =
        isArabic
            ? ArrowLeft
            : ArrowRight;


    const [
        guestCheckout,
        setGuestCheckout
    ] =
        useState(
            () =>
                sessionStorage.getItem(
                    "nabil-checkout-guest"
                ) ===
                "true"
        );


    /*
    ========================================================
    LOADING
    ========================================================
    */

    if (
        authLoading
    ) {

        return (

            <main className="checkout-access-page">

                <div className="checkout-access-loading">

                    <ShieldCheck
                        size={36}
                    />


                    <span>

                        {
                            text.preparingCheckout
                        }

                    </span>

                </div>

            </main>

        );

    }


    /*
    ========================================================
    LOGGED IN / GUEST
    ========================================================
    */

    if (
        user ||
        guestCheckout
    ) {

        return (
            <Checkout />
        );

    }


    /*
    ========================================================
    GUEST
    ========================================================
    */

    const continueAsGuest =
        () => {

            sessionStorage.setItem(
                "nabil-checkout-guest",
                "true"
            );


            setGuestCheckout(
                true
            );

        };


    /*
    ========================================================
    PAGE
    ========================================================
    */

    return (

        <main className="checkout-access-page">


            <motion.section

                className="checkout-access-card"

                initial={{
                    opacity: 0,
                    y: 22
                }}

                animate={{
                    opacity: 1,
                    y: 0
                }}

            >

                <div className="checkout-access-icon">

                    <ShoppingBag
                        size={29}
                    />

                </div>


                <span>

                    {
                        text.pharmacyCheckout
                    }

                </span>


                <h1>

                    {
                        text.howContinue
                    }

                </h1>


                <p>

                    {
                        text.continueDescription
                    }

                </p>


                {/* =====================================
                    OPTIONS
                ===================================== */}

                <div className="checkout-access-options">


                    {/* LOGIN */}

                    <Link
                        to="/account?redirect=/checkout"
                        className="checkout-access-login"
                    >

                        <div>

                            <UserRound
                                size={23}
                            />

                        </div>


                        <section>

                            <strong>

                                {
                                    text.loginCreateAccount
                                }

                            </strong>


                            <span>

                                {
                                    text.loginDescription
                                }

                            </span>

                        </section>


                        <ContinueIcon
                            size={19}
                        />

                    </Link>


                    {/* GUEST */}

                    <button
                        type="button"
                        className="checkout-access-guest"
                        onClick={
                            continueAsGuest
                        }
                    >

                        <div>

                            <ShoppingBag
                                size={23}
                            />

                        </div>


                        <section>

                            <strong>

                                {
                                    text.continueGuest
                                }

                            </strong>


                            <span>

                                {
                                    text.guestDescription
                                }

                            </span>

                        </section>


                        <ContinueIcon
                            size={19}
                        />

                    </button>

                </div>


                {/* =====================================
                    SECURITY
                ===================================== */}

                <div className="checkout-access-security">

                    <ShieldCheck
                        size={17}
                    />


                    <span>

                        {
                            text.secureGuest
                        }

                    </span>

                </div>


                {/* =====================================
                    BACK
                ===================================== */}

                <Link
                    to="/cart"
                    className="checkout-access-cart"
                >

                    {
                        text.backToCart
                    }

                </Link>

            </motion.section>

        </main>

    );

}


export default CheckoutAccess;