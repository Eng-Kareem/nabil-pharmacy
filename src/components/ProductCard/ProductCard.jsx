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

import {
    useLanguage
} from "../../context/LanguageContext.jsx";

import "./ProductCard.css";


function ProductIcon({
    category
}) {

    const normalizedCategory =
        String(
            category ||
            ""
        );


    if (
        normalizedCategory ===
        "Medicine"
    ) {

        return (
            <Pill
                size={48}
            />
        );

    }


    if (
        normalizedCategory ===
        "Vitamins"
    ) {

        return (
            <HeartPulse
                size={48}
            />
        );

    }


    if (
        normalizedCategory ===
        "Baby Care"
    ) {

        return (
            <Baby
                size={48}
            />
        );

    }


    if (
        normalizedCategory ===
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


function ProductCard({
    product,
    onAdd
}) {

    const {
        addToCart
    } = useCart();


    const {
        language,
        t
    } = useLanguage();


    const formatPrice = (
        price
    ) => {

        const safePrice =
            Number(
                price ||
                0
            );


        if (
            language ===
            "ar"
        ) {

            return (
                `${safePrice.toLocaleString(
                    "ar-EG"
                )} ج.م`
            );

        }


        return (
            `EGP ${safePrice.toLocaleString(
                "en-US"
            )}`
        );

    };


    const handleAdd =
        () => {

            addToCart(
                product,
                1
            );


            if (
                onAdd
            ) {

                onAdd(
                    product
                );

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


            {
                product.offer && (

                    <span className="product-offer">

                        {
                            product.offer
                        }

                    </span>

                )
            }


            {
                !product.inStock && (

                    <span className="product-stock-badge">

                        {
                            t(
                                "outOfStock"
                            )
                        }

                    </span>

                )
            }


            <Link
                to={
                    `/products/${product.id}`
                }
                className="product-card-link"
            >

                <div className="product-image-area">

                    {
                        product.imageUrl
                            ? (

                                <img
                                    src={
                                        product.imageUrl
                                    }
                                    alt={
                                        product.name
                                    }
                                />

                            )
                            : (

                                <motion.div
                                    className="product-icon-box"
                                    whileHover={{
                                        scale: 1.12,
                                        rotate: -4
                                    }}
                                >

                                    <ProductIcon
                                        category={
                                            product.categoryOriginal ||
                                            product.category
                                        }
                                    />

                                </motion.div>

                            )
                    }

                </div>

            </Link>


            <div className="product-info">


                <span className="product-category">

                    {
                        product.category
                    }

                </span>


                <span className="product-brand">

                    {
                        product.brand
                    }

                </span>


                <Link
                    to={
                        `/products/${product.id}`
                    }
                    className="product-title-link"
                >

                    <h3>

                        {
                            product.name
                        }

                    </h3>

                </Link>


                {
                    product.description && (

                        <p>

                            {
                                product.description
                            }

                        </p>

                    )
                }


                <div className="product-bottom">


                    <div className="product-price">


                        <strong>

                            {
                                formatPrice(
                                    product.price
                                )
                            }

                        </strong>


                        {
                            product.oldPrice && (

                                <span>

                                    {
                                        formatPrice(
                                            product.oldPrice
                                        )
                                    }

                                </span>

                            )
                        }

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
                                ? t(
                                    "addProductToCart",
                                    {
                                        product:
                                            product.name
                                    }
                                )
                                : t(
                                    "productOutOfStock",
                                    {
                                        product:
                                            product.name
                                    }
                                )
                        }

                    >

                        <Plus
                            size={21}
                        />

                    </motion.button>

                </div>

            </div>

        </motion.article>

    );

}


export default ProductCard;