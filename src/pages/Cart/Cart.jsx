import {
    ArrowLeft,
    ArrowRight,
    Minus,
    PackageOpen,
    Plus,
    ShieldCheck,
    ShoppingBag,
    Trash2
} from "lucide-react";

import {
    motion
} from "framer-motion";

import {
    Link
} from "react-router-dom";

import {
    useCart
} from "../../context/CartContext.jsx";

import {
    useLanguage
} from "../../context/LanguageContext.jsx";

import checkoutTranslations
    from "../../i18n/checkoutTranslations.js";

import "./Cart.css";


function Cart() {

    const {
        cartItems,
        cartCount,
        subtotal,
        removeFromCart,
        updateQuantity,
        clearCart
    } = useCart();


    const {
        language,
        isArabic
    } = useLanguage();


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
    PRICE
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
    EMPTY CART
    ========================================================
    */

    if (
        cartItems.length ===
        0
    ) {

        return (

            <main className="cart-page">

                <div className="container">

                    <div className="empty-cart">


                        <motion.div
                            className="empty-cart-icon"
                            initial={{
                                scale: 0.8,
                                opacity: 0
                            }}
                            animate={{
                                scale: 1,
                                opacity: 1
                            }}
                        >

                            <PackageOpen
                                size={50}
                            />

                        </motion.div>


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

        <main className="cart-page">


            {/* =========================================
                HEADER
            ========================================= */}

            <section className="cart-header">

                <div className="container">


                    <Link
                        to="/products"
                        className="cart-back-link"
                    >

                        <BackIcon
                            size={18}
                        />

                        {
                            text.continueShopping
                        }

                    </Link>


                    <span className="section-label">

                        {
                            text.yourBasket
                        }

                    </span>


                    <h1>

                        {
                            text.shoppingCart
                        }

                    </h1>


                    <p>

                        {
                            replaceText(
                                text.cartCount,
                                {
                                    count:
                                        formatNumber(
                                            cartCount
                                        ),

                                    item:
                                        cartCount ===
                                            1
                                            ? text.item
                                            : text.items
                                }
                            )
                        }

                    </p>

                </div>

            </section>


            {/* =========================================
                CONTENT
            ========================================= */}

            <section className="cart-content">

                <div className="container cart-layout">


                    {/* =====================================
                        ITEMS
                    ===================================== */}

                    <div className="cart-items-area">


                        <div className="cart-items-heading">

                            <h2>

                                {
                                    text.cartItems
                                }

                            </h2>


                            <button
                                type="button"
                                onClick={
                                    clearCart
                                }
                            >

                                <Trash2
                                    size={16}
                                />

                                {
                                    text.clearCart
                                }

                            </button>

                        </div>


                        <div className="cart-items">

                            {
                                cartItems.map(
                                    item => (

                                        <motion.article
                                            layout
                                            key={
                                                item.id
                                            }
                                            className="cart-item"
                                        >

                                            <Link
                                                to={
                                                    `/products/${item.id}`
                                                }
                                                className="cart-item-visual"
                                            >

                                                <ShoppingBag
                                                    size={35}
                                                />

                                            </Link>


                                            {/* =========================
                                                PRODUCT INFO
                                            ========================= */}

                                            <div className="cart-item-info">

                                                <span>

                                                    {
                                                        item.category
                                                    }

                                                </span>


                                                <Link
                                                    to={
                                                        `/products/${item.id}`
                                                    }
                                                >

                                                    <h3>

                                                        {
                                                            item.name
                                                        }

                                                    </h3>

                                                </Link>


                                                <small>

                                                    {
                                                        item.brand
                                                    }

                                                </small>

                                            </div>


                                            {/* =========================
                                                QUANTITY
                                            ========================= */}

                                            <div className="cart-item-quantity">

                                                <button
                                                    type="button"
                                                    aria-label={
                                                        text.decreaseQuantity
                                                    }
                                                    onClick={() =>
                                                        updateQuantity(
                                                            item.id,
                                                            item.quantity -
                                                                1
                                                        )
                                                    }
                                                    disabled={
                                                        item.quantity <=
                                                        1
                                                    }
                                                >

                                                    <Minus
                                                        size={16}
                                                    />

                                                </button>


                                                <span>

                                                    {
                                                        formatNumber(
                                                            item.quantity
                                                        )
                                                    }

                                                </span>


                                                <button
                                                    type="button"
                                                    aria-label={
                                                        text.increaseQuantity
                                                    }
                                                    onClick={() =>
                                                        updateQuantity(
                                                            item.id,
                                                            item.quantity +
                                                                1
                                                        )
                                                    }
                                                    disabled={
                                                        item.quantity >=
                                                        20
                                                    }
                                                >

                                                    <Plus
                                                        size={16}
                                                    />

                                                </button>

                                            </div>


                                            {/* =========================
                                                PRICE
                                            ========================= */}

                                            <div className="cart-item-price">

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


                                                {
                                                    item.quantity >
                                                    1 && (

                                                        <small>

                                                            {
                                                                formatPrice(
                                                                    item.price
                                                                )
                                                            }

                                                            {" "}

                                                            {
                                                                text.each
                                                            }

                                                        </small>

                                                    )
                                                }

                                            </div>


                                            {/* =========================
                                                REMOVE
                                            ========================= */}

                                            <button
                                                type="button"
                                                className="cart-remove-button"
                                                aria-label={
                                                    replaceText(
                                                        text.removeProduct,
                                                        {
                                                            product:
                                                                item.name
                                                        }
                                                    )
                                                }
                                                onClick={() =>
                                                    removeFromCart(
                                                        item.id
                                                    )
                                                }
                                            >

                                                <Trash2
                                                    size={18}
                                                />

                                            </button>

                                        </motion.article>

                                    )
                                )
                            }

                        </div>

                    </div>


                    {/* =====================================
                        SUMMARY
                    ===================================== */}

                    <aside className="cart-summary">


                        <span className="cart-summary-label">

                            {
                                text.orderSummary
                            }

                        </span>


                        <h2>

                            {
                                text.yourTotal
                            }

                        </h2>


                        <div className="cart-summary-row">

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


                        <div className="cart-summary-row">

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


                        <div className="cart-summary-divider">
                        </div>


                        <div className="cart-summary-total">

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


                        <Link
                            to="/checkout"
                            className="cart-checkout-button"
                        >

                            {
                                text.proceedCheckout
                            }

                        </Link>


                        <div className="cart-secure-note">

                            <ShieldCheck />

                            <span>

                                {
                                    text.secureCheckoutNote
                                }

                            </span>

                        </div>

                    </aside>

                </div>

            </section>

        </main>

    );

}


export default Cart;