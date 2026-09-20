import {
    Activity,
    Baby,
    HeartPulse,
    Pill,
    Plus,
    Sparkles
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

import "./ProductCard.css";


function ProductIcon({
    category
}) {

    if (
        category === "Medicine"
    ) {
        return <Pill size={48} />;
    }


    if (
        category === "Vitamins"
    ) {
        return (
            <HeartPulse
                size={48}
            />
        );
    }


    if (
        category === "Baby Care"
    ) {
        return (
            <Baby size={48} />
        );
    }


    if (
        category ===
        "Health Devices"
    ) {
        return (
            <Activity
                size={48}
            />
        );
    }


    return (
        <Sparkles
            size={48}
        />
    );
}


function formatPrice(
    price
) {

    return (
        `EGP ${price.toLocaleString()}`
    );
}


function ProductCard({
    product,
    onAdd
}) {

    const {
        addToCart
    } = useCart();


    const handleAdd = () => {

        addToCart(
            product,
            1
        );


        if (onAdd) {
            onAdd(product);
        }
    };


    return (
        <motion.article
            className="product-card"
            initial={{
                opacity: 0,
                y: 30
            }}
            whileInView={{
                opacity: 1,
                y: 0
            }}
            viewport={{
                once: true,
                amount: 0.2
            }}
            whileHover={{
                y: -10
            }}
            transition={{
                duration: 0.45
            }}
        >

            {product.offer && (

                <span className="product-offer">
                    {product.offer}
                </span>

            )}


            {!product.inStock && (

                <span className="product-stock-badge">
                    Out of stock
                </span>

            )}


            <Link
                to={
                    `/products/${product.id}`
                }
                className="product-card-link"
            >

                <div className="product-image-area">

                    <motion.div
                        className="product-icon-box"
                        whileHover={{
                            scale: 1.12,
                            rotate: -4
                        }}
                    >

                        <ProductIcon
                            category={
                                product.category
                            }
                        />

                    </motion.div>

                </div>

            </Link>


            <div className="product-info">

                <span className="product-category">
                    {product.category}
                </span>


                <span className="product-brand">
                    {product.brand}
                </span>


                <Link
                    to={
                        `/products/${product.id}`
                    }
                    className="product-title-link"
                >

                    <h3>
                        {product.name}
                    </h3>

                </Link>


                <p>
                    {product.description}
                </p>


                <div className="product-bottom">

                    <div className="product-price">

                        <strong>
                            {
                                formatPrice(
                                    product.price
                                )
                            }
                        </strong>


                        {product.oldPrice && (

                            <span>
                                {
                                    formatPrice(
                                        product.oldPrice
                                    )
                                }
                            </span>

                        )}

                    </div>


                    <motion.button
                        type="button"
                        className="product-add-button"
                        disabled={
                            !product.inStock
                        }
                        onClick={
                            handleAdd
                        }
                        whileHover={
                            product.inStock
                                ? {
                                    scale: 1.08
                                }
                                : {}
                        }
                        whileTap={
                            product.inStock
                                ? {
                                    scale: 0.88
                                }
                                : {}
                        }
                        aria-label={
                            product.inStock
                                ? `Add ${product.name} to cart`
                                : `${product.name} is out of stock`
                        }
                    >

                        <Plus size={21} />

                    </motion.button>

                </div>

            </div>

        </motion.article>
    );
}


export default ProductCard;