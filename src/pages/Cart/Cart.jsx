import {
    ArrowLeft,
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


    const formatPrice = (
        price
    ) => {

        return (
            `EGP ${price.toLocaleString()}`
        );
    };


    if (
        cartItems.length === 0
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
                            Your cart is empty
                        </h1>


                        <p>
                            Browse our products and add
                            something to your cart.
                        </p>


                        <Link
                            to="/products"
                            className="primary-button"
                        >

                            Explore Products

                        </Link>

                    </div>

                </div>

            </main>
        );
    }


    return (
        <main className="cart-page">

            <section className="cart-header">

                <div className="container">

                    <Link
                        to="/products"
                        className="cart-back-link"
                    >

                        <ArrowLeft
                            size={18}
                        />

                        Continue Shopping

                    </Link>


                    <span className="section-label">
                        Your Basket
                    </span>


                    <h1>
                        Shopping Cart
                    </h1>


                    <p>

                        You currently have{" "}

                        <strong>
                            {cartCount}
                        </strong>

                        {" "}
                        item
                        {
                            cartCount !== 1
                                ? "s"
                                : ""
                        }
                        {" "}
                        in your cart.

                    </p>

                </div>

            </section>


            <section className="cart-content">

                <div className="container cart-layout">


                    {/* ITEMS */}

                    <div className="cart-items-area">

                        <div className="cart-items-heading">

                            <h2>
                                Cart Items
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

                                Clear Cart

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


                                            <div className="cart-item-quantity">

                                                <button
                                                    type="button"
                                                    aria-label="Decrease quantity"
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
                                                        item.quantity
                                                    }
                                                </span>


                                                <button
                                                    type="button"
                                                    aria-label="Increase quantity"
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


                                            <div className="cart-item-price">

                                                <strong>
                                                    {
                                                        formatPrice(
                                                            item.price *
                                                                item.quantity
                                                        )
                                                    }
                                                </strong>


                                                {item.quantity >
                                                    1 && (

                                                    <small>

                                                        {
                                                            formatPrice(
                                                                item.price
                                                            )
                                                        }

                                                        {" "}
                                                        each

                                                    </small>

                                                )}

                                            </div>


                                            <button
                                                type="button"
                                                className="cart-remove-button"
                                                aria-label={`Remove ${item.name}`}
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



                    {/* SUMMARY */}

                    <aside className="cart-summary">

                        <span className="cart-summary-label">
                            Order Summary
                        </span>


                        <h2>
                            Your Total
                        </h2>


                        <div className="cart-summary-row">

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


                        <div className="cart-summary-row">

                            <span>
                                Delivery
                            </span>

                            <strong>
                                Calculated later
                            </strong>

                        </div>


                        <div className="cart-summary-divider">
                        </div>


                        <div className="cart-summary-total">

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


                        <Link
    to="/checkout"
    className="cart-checkout-button"
>
    Proceed to Checkout
</Link>


                        <div className="cart-secure-note">

                            <ShieldCheck />

                            <span>

                                Secure checkout will
                                be connected when the
                                production payment and
                                order backend is ready.

                            </span>

                        </div>

                    </aside>

                </div>

            </section>

        </main>
    );
}


export default Cart;