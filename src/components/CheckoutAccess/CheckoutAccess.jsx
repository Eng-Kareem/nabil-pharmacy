import {
    ArrowRight,
    LogIn,
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

import Checkout
    from "../../pages/Checkout/Checkout.jsx";

import "./CheckoutAccess.css";


function CheckoutAccess() {

    const {
        user,
        authLoading
    } = useAuth();


    const [
        guestCheckout,
        setGuestCheckout
    ] =
        useState(
            () =>
                sessionStorage.getItem(
                    "nabil-checkout-guest"
                ) === "true"
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
                        Preparing checkout...
                    </span>

                </div>

            </main>
        );
    }


    /*
    ========================================================
    LOGGED IN OR GUEST ALREADY SELECTED
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
    ASK USER
    ========================================================
    */

    const continueAsGuest = () => {

        sessionStorage.setItem(
            "nabil-checkout-guest",
            "true"
        );


        setGuestCheckout(
            true
        );
    };


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
                    Nabil Pharmacy Checkout
                </span>


                <h1>
                    How would you like to continue?
                </h1>


                <p>

                    Sign in for a personalized
                    pharmacy experience or continue
                    without creating an account.

                </p>



                <div className="checkout-access-options">


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
                                Login or Create Account
                            </strong>


                            <span>

                                Keep your orders and
                                receipts connected to
                                your customer account.

                            </span>

                        </section>


                        <ArrowRight
                            size={19}
                        />

                    </Link>



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
                                Continue as Guest
                            </strong>


                            <span>

                                Place your order without
                                creating an account.

                            </span>

                        </section>


                        <ArrowRight
                            size={19}
                        />

                    </button>

                </div>



                <div className="checkout-access-security">

                    <ShieldCheck
                        size={17}
                    />


                    <span>

                        Both customers and guests
                        use the same secure checkout
                        and inventory validation.

                    </span>

                </div>



                <Link
                    to="/cart"
                    className="checkout-access-cart"
                >

                    Back to Cart

                </Link>

            </motion.section>

        </main>
    );
}


export default CheckoutAccess;