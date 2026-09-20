import {
    Activity,
    ArrowLeft,
    Baby,
    Check,
    Heart,
    HeartPulse,
    Minus,
    PackageCheck,
    Pill,
    Plus,
    RefreshCw,
    ShieldCheck,
    ShoppingBag,
    Sparkles,
    Truck
} from "lucide-react";

import {
    AnimatePresence,
    motion,
    useReducedMotion
} from "framer-motion";

import {
    Link,
    useParams
} from "react-router-dom";

import {
    useEffect,
    useMemo,
    useState
} from "react";

import ProductCard
    from "../../components/ProductCard/ProductCard.jsx";

import {
    useCart
} from "../../context/CartContext.jsx";

import {
    supabase
} from "../../lib/supabase.js";

import "./ProductDetails.css";


function ProductDetails() {

    const { productId } =
        useParams();

    const { addToCart } =
        useCart();

    const reduceMotion =
        useReducedMotion();


    const [product, setProduct] =
        useState(null);

    const [
        relatedProducts,
        setRelatedProducts
    ] = useState([]);

    const [loading, setLoading] =
        useState(true);

    const [error, setError] =
        useState("");

    const [quantity, setQuantity] =
        useState(1);

    const [favorite, setFavorite] =
        useState(false);

    const [
        notification,
        setNotification
    ] = useState("");


    const formatProduct = (
        item
    ) => {

        if (!item) {
            return null;
        }


        const stockQuantity =
            (item.branch_stock || [])
                .reduce(
                    (total, stockRow) =>
                        total +
                        Number(
                            stockRow.quantity || 0
                        ),
                    0
                );


        return {
            id: item.id,
            slug: item.slug,
            name: item.name,

            category:
                item.categories?.name ||
                "Pharmacy",

            categorySlug:
                item.categories?.slug ||
                "",

            categoryId:
                item.category_id,

            brand:
                item.brand ||
                "Nabil Pharmacy",

            description:
                item.description ||
                "",

            price:
                Number(item.price) || 0,

            oldPrice:
                item.old_price
                    ? Number(item.old_price)
                    : null,

            offer:
                item.badge_text ||
                null,

            imageUrl:
                item.image_url ||
                null,

            prescriptionRequired:
                Boolean(
                    item.prescription_required
                ),

            featured:
                Boolean(item.featured),

            stockQuantity,

            inStock:
                stockQuantity > 0,

            lowStock:
                stockQuantity > 0 &&
                stockQuantity <= 5,

            createdAt:
                item.created_at
        };
    };


    const loadProduct = async () => {

        setLoading(true);
        setError("");

        setProduct(null);
        setRelatedProducts([]);


        try {

            const {
                data,
                error: productError
            } =
                await supabase
                    .from("products")
                    .select(`
                        id,
                        category_id,
                        name,
                        slug,
                        brand,
                        description,
                        price,
                        old_price,
                        badge_text,
                        image_url,
                        prescription_required,
                        featured,
                        is_active,
                        created_at,

                        categories (
                            id,
                            name,
                            slug
                        ),

                        branch_stock (
                            quantity
                        )
                    `)
                    .eq(
                        "id",
                        productId
                    )
                    .eq(
                        "is_active",
                        true
                    )
                    .single();


            if (productError) {
                throw productError;
            }


            const formattedProduct =
                formatProduct(data);


            setProduct(
                formattedProduct
            );


            if (data.category_id) {

                const {
                    data: relatedData,
                    error: relatedError
                } =
                    await supabase
                        .from("products")
                        .select(`
                            id,
                            category_id,
                            name,
                            slug,
                            brand,
                            description,
                            price,
                            old_price,
                            badge_text,
                            image_url,
                            prescription_required,
                            featured,
                            is_active,
                            created_at,

                            categories (
                                id,
                                name,
                                slug
                            ),

                            branch_stock (
                                quantity
                            )
                        `)
                        .eq(
                            "category_id",
                            data.category_id
                        )
                        .eq(
                            "is_active",
                            true
                        )
                        .neq(
                            "id",
                            data.id
                        )
                        .limit(3);


                if (relatedError) {

                    console.error(
                        "Related products error:",
                        relatedError
                    );

                } else {

                    setRelatedProducts(
                        (relatedData || [])
                            .map(formatProduct)
                    );
                }
            }


            setQuantity(1);

        } catch (error) {

            console.error(
                "Product details error:",
                error
            );


            setError(
                "We could not find this product."
            );

        } finally {

            setLoading(false);
        }
    };


    useEffect(() => {

        loadProduct();

    }, [productId]);


    const ProductIcon =
        useMemo(
            () => {

                if (!product) {
                    return Pill;
                }


                const category =
                    product.category
                        .toLowerCase();


                if (
                    category.includes("baby")
                ) {
                    return Baby;
                }


                if (
                    category.includes("vitamin")
                ) {
                    return HeartPulse;
                }


                if (
                    category.includes("device")
                ) {
                    return Activity;
                }


                if (
                    category.includes("personal")
                ) {
                    return Sparkles;
                }


                return Pill;

            },
            [product]
        );


    const increaseQuantity = () => {

        if (!product) {
            return;
        }


        const maximum =
            Math.min(
                20,
                product.stockQuantity
            );


        setQuantity(
            current =>
                Math.min(
                    current + 1,
                    maximum
                )
        );
    };


    const decreaseQuantity = () => {

        setQuantity(
            current =>
                Math.max(
                    current - 1,
                    1
                )
        );
    };


    const handleAddToCart = () => {

        if (
            !product ||
            !product.inStock
        ) {
            return;
        }


        addToCart(
            product,
            quantity
        );


        setNotification(
            `${quantity} × ${product.name} added to your cart`
        );


        window.setTimeout(
            () => {
                setNotification("");
            },
            2200
        );
    };


    const handleRelatedProductAdd = (
        relatedProduct
    ) => {

        if (!relatedProduct.inStock) {

            setNotification(
                `${relatedProduct.name} is currently out of stock`
            );

        } else {

            setNotification(
                `${relatedProduct.name} added to your cart`
            );
        }


        window.setTimeout(
            () => {
                setNotification("");
            },
            2200
        );
    };


    const formatPrice = (
        price
    ) => {

        return (
            `EGP ${Number(
                price
            ).toLocaleString()}`
        );
    };


    if (loading) {

        return (
            <main className="product-details-page">

                <div className="container">

                    <div className="product-details-status">

                        <RefreshCw
                            size={40}
                            className="product-details-loading-icon"
                        />

                        <h1>
                            Loading product
                        </h1>

                        <p>
                            Getting the latest product
                            information from Nabil Pharmacy.
                        </p>

                    </div>

                </div>

            </main>
        );
    }


    if (
        error ||
        !product
    ) {

        return (
            <main className="product-details-page">

                <div className="container">

                    <div className="product-details-status">

                        <PackageCheck
                            size={48}
                        />

                        <h1>
                            Product not found
                        </h1>

                        <p>
                            This product may no longer
                            be available.
                        </p>

                        <Link
                            to="/products"
                            className="primary-button"
                        >

                            <ArrowLeft
                                size={18}
                            />

                            Back to Products

                        </Link>

                    </div>

                </div>

            </main>
        );
    }


    return (
        <main className="product-details-page">

            <section className="product-details-breadcrumb">

                <div className="container">

                    <Link to="/products">

                        <ArrowLeft
                            size={17}
                        />

                        Back to Products

                    </Link>

                </div>

            </section>


            <section className="product-details-main">

                <div className="container product-details-layout">

                    <motion.div
                        className="product-details-visual"
                        initial={
                            reduceMotion
                                ? false
                                : {
                                    opacity: 0,
                                    x: -25
                                }
                        }
                        animate={{
                            opacity: 1,
                            x: 0
                        }}
                        transition={{
                            duration: 0.5
                        }}
                    >

                        {
                            product.offer && (

                                <span className="product-details-offer">
                                    {product.offer}
                                </span>

                            )
                        }


                        <div className="product-details-image-area">

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

                                        <div className="product-details-icon">

                                            <ProductIcon
                                                size={90}
                                                strokeWidth={1.5}
                                            />

                                        </div>

                                    )
                            }

                        </div>


                        <div className="product-details-visual-brand">

                            <ShieldCheck
                                size={17}
                            />

                            Nabil Pharmacy

                            <span>
                                Since 1975
                            </span>

                        </div>

                    </motion.div>


                    <motion.div
                        className="product-details-info"
                        initial={
                            reduceMotion
                                ? false
                                : {
                                    opacity: 0,
                                    x: 25
                                }
                        }
                        animate={{
                            opacity: 1,
                            x: 0
                        }}
                        transition={{
                            duration: 0.5
                        }}
                    >

                        <div className="product-details-category">
                            {product.category}
                        </div>


                        <div className="product-details-title-row">

                            <div>

                                <span className="product-details-brand">
                                    {product.brand}
                                </span>

                                <h1>
                                    {product.name}
                                </h1>

                            </div>


                            <button
                                type="button"
                                className={
                                    favorite
                                        ? "product-details-favorite active"
                                        : "product-details-favorite"
                                }
                                onClick={() =>
                                    setFavorite(
                                        current =>
                                            !current
                                    )
                                }
                                aria-label="Add product to favorites"
                            >

                                <Heart
                                    size={21}
                                    fill={
                                        favorite
                                            ? "currentColor"
                                            : "none"
                                    }
                                />

                            </button>

                        </div>


                        <p className="product-details-description">
                            {product.description}
                        </p>


                        <div className="product-details-price">

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


                        {/* REAL STOCK */}

                        <div
                            className={
                                !product.inStock
                                    ? "product-details-stock out"
                                    : product.lowStock
                                        ? "product-details-stock low"
                                        : "product-details-stock"
                            }
                        >

                            {
                                product.inStock && (
                                    <Check size={17} />
                                )
                            }


                            <span>

                                {
                                    !product.inStock
                                        ? "Out of Stock"
                                        : product.lowStock
                                            ? `Only ${product.stockQuantity} left`
                                            : `${product.stockQuantity} in stock`
                                }

                            </span>

                        </div>


                        {
                            product.prescriptionRequired && (

                                <div className="product-details-prescription">

                                    <ShieldCheck
                                        size={19}
                                    />

                                    <div>

                                        <strong>
                                            Prescription Required
                                        </strong>

                                        <span>
                                            Pharmacy verification
                                            will be required before
                                            this product can be supplied.
                                        </span>

                                    </div>

                                </div>

                            )
                        }


                        <div className="product-details-purchase">

                            <div className="product-details-quantity">

                                <button
                                    type="button"
                                    onClick={
                                        decreaseQuantity
                                    }
                                    disabled={
                                        !product.inStock ||
                                        quantity <= 1
                                    }
                                    aria-label="Decrease quantity"
                                >

                                    <Minus
                                        size={17}
                                    />

                                </button>


                                <span>
                                    {
                                        product.inStock
                                            ? quantity
                                            : 0
                                    }
                                </span>


                                <button
                                    type="button"
                                    onClick={
                                        increaseQuantity
                                    }
                                    disabled={
                                        !product.inStock ||
                                        quantity >=
                                            Math.min(
                                                20,
                                                product.stockQuantity
                                            )
                                    }
                                    aria-label="Increase quantity"
                                >

                                    <Plus
                                        size={17}
                                    />

                                </button>

                            </div>


                            <button
                                type="button"
                                className="product-details-add-button"
                                onClick={
                                    handleAddToCart
                                }
                                disabled={
                                    !product.inStock
                                }
                            >

                                <ShoppingBag
                                    size={19}
                                />

                                {
                                    product.inStock
                                        ? "Add to Cart"
                                        : "Out of Stock"
                                }

                            </button>

                        </div>


                        <div className="product-details-benefits">

                            <div>

                                <ShieldCheck
                                    size={19}
                                />

                                <div>

                                    <strong>
                                        Pharmacy Checked
                                    </strong>

                                    <span>
                                        Supplied through
                                        Nabil Pharmacy
                                    </span>

                                </div>

                            </div>


                            <div>

                                <Truck
                                    size={19}
                                />

                                <div>

                                    <strong>
                                        Delivery
                                    </strong>

                                    <span>
                                        Delivery options
                                        available at checkout
                                    </span>

                                </div>

                            </div>


                            <div>

                                <PackageCheck
                                    size={19}
                                />

                                <div>

                                    <strong>
                                        Secure Packaging
                                    </strong>

                                    <span>
                                        Prepared carefully
                                        before dispatch
                                    </span>

                                </div>

                            </div>

                        </div>

                    </motion.div>

                </div>

            </section>


            <section className="product-details-information">

                <div className="container">

                    <div className="product-details-information-card">

                        <span className="section-label">
                            Product Information
                        </span>

                        <h2>
                            About this product
                        </h2>

                        <p>
                            {product.description}
                        </p>


                        <div className="product-details-information-grid">

                            <div>

                                <span>
                                    Brand
                                </span>

                                <strong>
                                    {product.brand}
                                </strong>

                            </div>


                            <div>

                                <span>
                                    Category
                                </span>

                                <strong>
                                    {product.category}
                                </strong>

                            </div>


                            <div>

                                <span>
                                    Prescription
                                </span>

                                <strong>

                                    {
                                        product.prescriptionRequired
                                            ? "Required"
                                            : "Not marked as required"
                                    }

                                </strong>

                            </div>


                            <div>

                                <span>
                                    Availability
                                </span>

                                <strong>

                                    {
                                        product.inStock
                                            ? `${product.stockQuantity} available`
                                            : "Out of stock"
                                    }

                                </strong>

                            </div>

                        </div>


                        <div className="product-details-notice">

                            <ShieldCheck
                                size={20}
                            />

                            <p>
                                Product information on this
                                website is for pharmacy
                                shopping purposes and does
                                not replace advice from a
                                pharmacist or healthcare
                                professional.
                            </p>

                        </div>

                    </div>

                </div>

            </section>


            {
                relatedProducts.length > 0 && (

                    <section className="product-details-related">

                        <div className="container">

                            <div className="product-details-related-heading">

                                <div>

                                    <span className="section-label">
                                        You May Also Like
                                    </span>

                                    <h2>
                                        Related products
                                    </h2>

                                </div>

                                <Link to="/products">
                                    View All Products
                                </Link>

                            </div>


                            <div className="product-details-related-grid">

                                {
                                    relatedProducts.map(
                                        relatedProduct => (

                                            <ProductCard
                                                key={
                                                    relatedProduct.id
                                                }
                                                product={
                                                    relatedProduct
                                                }
                                                onAdd={
                                                    handleRelatedProductAdd
                                                }
                                            />

                                        )
                                    )
                                }

                            </div>

                        </div>

                    </section>

                )
            }


            <AnimatePresence>

                {
                    notification && (

                        <motion.div
                            className="product-details-toast"
                            initial={{
                                opacity: 0,
                                y: 20
                            }}
                            animate={{
                                opacity: 1,
                                y: 0
                            }}
                            exit={{
                                opacity: 0,
                                y: 15
                            }}
                        >

                            <Check size={17} />

                            {notification}

                        </motion.div>

                    )
                }

            </AnimatePresence>

        </main>
    );
}


export default ProductDetails;