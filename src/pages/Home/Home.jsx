import {
    ArrowRight,
    Baby,
    HeartPulse,
    MapPin,
    PackageCheck,
    Pill,
    Search,
    ShieldCheck,
    ShoppingBag,
    Sparkles,
    Stethoscope,
    Upload,
    Users,
    Activity
} from "lucide-react";

import {
    motion,
    useReducedMotion
} from "framer-motion";

import {
    Link
} from "react-router-dom";

import {
    useEffect,
    useMemo,
    useState
} from "react";

import ProductCard
    from "../../components/ProductCard/ProductCard.jsx";

import {
    supabase
} from "../../lib/supabase.js";

import "./Home.css";


function Home() {

    const reduceMotion =
        useReducedMotion();


    /*
        =========================================
        SUPABASE DATA
        =========================================
    */

    const [
        featuredProducts,
        setFeaturedProducts
    ] = useState([]);


    const [
        categories,
        setCategories
    ] = useState([]);


    const [
        loadingProducts,
        setLoadingProducts
    ] = useState(true);


    const [
        notification,
        setNotification
    ] = useState("");


    /*
        =========================================
        FORMAT PRODUCT
        =========================================
    */

    const formatProduct = (
        product
    ) => {

        return {
            id:
                product.id,

            slug:
                product.slug,

            name:
                product.name,

            category:
                product.categories?.name ||
                "Pharmacy",

            categorySlug:
                product.categories?.slug ||
                "",

            categoryId:
                product.category_id,

            brand:
                product.brand ||
                "Nabil Pharmacy",

            description:
                product.description ||
                "",

            price:
                Number(
                    product.price
                ) || 0,

            oldPrice:
                product.old_price
                    ? Number(
                        product.old_price
                    )
                    : null,

            offer:
                product.badge_text ||
                null,

            imageUrl:
                product.image_url ||
                null,

            prescriptionRequired:
                Boolean(
                    product.prescription_required
                ),

            featured:
                Boolean(
                    product.featured
                ),

            /*
                Stock database will be
                connected later.
            */
            inStock:
                true,

            createdAt:
                product.created_at
        };
    };


    /*
        =========================================
        LOAD HOME DATA
        =========================================
    */

    const loadHomeData = async () => {

        setLoadingProducts(true);


        try {

            const [
                productsResponse,
                categoriesResponse
            ] = await Promise.all([

                /*
                    FEATURED PRODUCTS
                */

                supabase
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
                        )
                    `)
                    .eq(
                        "is_active",
                        true
                    )
                    .eq(
                        "featured",
                        true
                    )
                    .order(
                        "created_at",
                        {
                            ascending: false
                        }
                    )
                    .limit(4),


                /*
                    ACTIVE CATEGORIES
                */

                supabase
                    .from("categories")
                    .select(`
                        id,
                        name,
                        slug,
                        description,
                        image_url
                    `)
                    .eq(
                        "is_active",
                        true
                    )
                    .order(
                        "name",
                        {
                            ascending: true
                        }
                    )

            ]);


            if (
                productsResponse.error
            ) {

                console.error(
                    "Featured products error:",
                    productsResponse.error
                );

            } else {

                setFeaturedProducts(
                    (
                        productsResponse.data ||
                        []
                    ).map(
                        formatProduct
                    )
                );
            }


            if (
                categoriesResponse.error
            ) {

                console.error(
                    "Categories error:",
                    categoriesResponse.error
                );

            } else {

                setCategories(
                    categoriesResponse.data ||
                    []
                );
            }

        } catch (error) {

            console.error(
                "Home data error:",
                error
            );

        } finally {

            setLoadingProducts(false);
        }
    };


    useEffect(() => {

        loadHomeData();

    }, []);


    /*
        =========================================
        CATEGORY ICONS
        =========================================
    */

    const getCategoryIcon = (
        categoryName
    ) => {

        const name =
            categoryName
                .toLowerCase();


        if (
            name.includes(
                "baby"
            )
        ) {

            return Baby;
        }


        if (
            name.includes(
                "vitamin"
            )
        ) {

            return HeartPulse;
        }


        if (
            name.includes(
                "device"
            )
        ) {

            return Activity;
        }


        if (
            name.includes(
                "personal"
            )
        ) {

            return Sparkles;
        }


        return Pill;
    };


    /*
        =========================================
        ANIMATION
        =========================================
    */

    const revealAnimation =
        useMemo(
            () => {

                if (
                    reduceMotion
                ) {

                    return {
                        initial: false,
                        whileInView: {
                            opacity: 1,
                            y: 0
                        }
                    };
                }


                return {
                    initial: {
                        opacity: 0,
                        y: 25
                    },

                    whileInView: {
                        opacity: 1,
                        y: 0
                    },

                    viewport: {
                        once: true,
                        amount: 0.15
                    },

                    transition: {
                        duration: 0.5
                    }
                };

            },
            [
                reduceMotion
            ]
        );


    /*
        =========================================
        PRODUCT NOTIFICATION
        =========================================
    */

    const showProductNotification = (
        product
    ) => {

        setNotification(
            `${product.name} added to your cart`
        );


        window.setTimeout(
            () => {

                setNotification("");

            },
            2200
        );
    };


    return (
        <main className="home-page">


            {/* =====================================
                HERO
            ===================================== */}

            <section className="home-hero">

                <div className="container home-hero-layout">


                    <motion.div
                        className="home-hero-content"
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
                            duration: 0.6
                        }}
                    >

                        <span className="section-label">
                            Nabil Pharmacy • Since 1975
                        </span>


                        <h1>

                            Trusted pharmacy care

                            <span>
                                {" "}for every generation.
                            </span>

                        </h1>


                        <p>

                            Discover pharmacy essentials,
                            wellness products and convenient
                            healthcare services from a name
                            serving families since 1975.

                        </p>


                        <div className="home-hero-actions">

                            <Link
                                to="/products"
                                className="primary-button"
                            >

                                <ShoppingBag
                                    size={18}
                                />

                                Shop Products

                            </Link>


                            <Link
                                to="/prescription"
                                className="secondary-button"
                            >

                                <Upload
                                    size={18}
                                />

                                Upload Prescription

                            </Link>

                        </div>



                        <div className="home-hero-trust">

                            <div>

                                <ShieldCheck
                                    size={18}
                                />

                                <span>
                                    Pharmacy Care
                                </span>

                            </div>


                            <div>

                                <PackageCheck
                                    size={18}
                                />

                                <span>
                                    Convenient Ordering
                                </span>

                            </div>


                            <div>

                                <Users
                                    size={18}
                                />

                                <span>
                                    Family Focused
                                </span>

                            </div>

                        </div>

                    </motion.div>



                    {/* HERO VISUAL */}

                    <motion.div
                        className="home-hero-visual"
                        initial={
                            reduceMotion
                                ? false
                                : {
                                    opacity: 0,
                                    scale: 0.95
                                }
                        }
                        animate={{
                            opacity: 1,
                            scale: 1
                        }}
                        transition={{
                            duration: 0.65
                        }}
                    >

                        <div className="home-hero-logo-card">

                            <img
                                src="/nabil-logo.png"
                                alt="Nabil Pharmacy"
                            />


                            <span>
                                Since 1975
                            </span>


                            <h2>
                                Nabil Pharmacy
                            </h2>


                            <p>
                                Pharmacy care built
                                around trust.
                            </p>

                        </div>


                        <div className="home-hero-floating-card home-hero-floating-one">

                            <ShieldCheck
                                size={20}
                            />

                            <div>

                                <strong>
                                    Trusted Care
                                </strong>

                                <span>
                                    Since 1975
                                </span>

                            </div>

                        </div>


                        <div className="home-hero-floating-card home-hero-floating-two">

                            <Stethoscope
                                size={20}
                            />

                            <div>

                                <strong>
                                    Pharmacy
                                </strong>

                                <span>
                                    Everyday health
                                </span>

                            </div>

                        </div>

                    </motion.div>

                </div>

            </section>



            {/* =====================================
                TRUST STRIP
            ===================================== */}

            <section className="home-trust-strip">

                <div className="container home-trust-grid">

                    <div>

                        <ShieldCheck />

                        <strong>
                            Pharmacy Trusted
                        </strong>

                        <span>
                            Since 1975
                        </span>

                    </div>


                    <div>

                        <ShoppingBag />

                        <strong>
                            Easy Shopping
                        </strong>

                        <span>
                            Browse online
                        </span>

                    </div>


                    <div>

                        <Upload />

                        <strong>
                            Prescription Service
                        </strong>

                        <span>
                            Secure system coming
                        </span>

                    </div>


                    <div>

                        <MapPin />

                        <strong>
                            Delivery & Pickup
                        </strong>

                        <span>
                            Flexible options
                        </span>

                    </div>

                </div>

            </section>



            {/* =====================================
                SERVICES
            ===================================== */}

            <motion.section
                id="services"
                className="home-section home-services"
                {...revealAnimation}
            >

                <div className="container">

                    <div className="home-section-heading">

                        <div>

                            <span className="section-label">
                                Our Services
                            </span>


                            <h2>
                                Healthcare made simpler.
                            </h2>

                        </div>


                        <p>
                            Convenient pharmacy services
                            designed around everyday
                            health needs.
                        </p>

                    </div>


                    <div className="home-services-grid">


                        <Link
                            to="/products"
                            className="home-service-card"
                        >

                            <div className="home-service-icon">

                                <ShoppingBag />

                            </div>


                            <span>
                                01
                            </span>


                            <h3>
                                Pharmacy Products
                            </h3>


                            <p>
                                Browse medicines,
                                vitamins, baby care,
                                personal care and health
                                devices.
                            </p>


                            <strong>

                                Browse Products

                                <ArrowRight
                                    size={16}
                                />

                            </strong>

                        </Link>



                        <Link
                            to="/prescription"
                            className="home-service-card"
                        >

                            <div className="home-service-icon">

                                <Upload />

                            </div>


                            <span>
                                02
                            </span>


                            <h3>
                                Prescription Service
                            </h3>


                            <p>
                                A secure prescription
                                workflow will allow pharmacy
                                review before fulfilment.
                            </p>


                            <strong>

                                Prescription Page

                                <ArrowRight
                                    size={16}
                                />

                            </strong>

                        </Link>



                        <a
                            href="#branches"
                            className="home-service-card"
                        >

                            <div className="home-service-icon">

                                <MapPin />

                            </div>


                            <span>
                                03
                            </span>


                            <h3>
                                Delivery & Pickup
                            </h3>


                            <p>
                                Choose convenient delivery
                                or collect your order from
                                a pharmacy branch.
                            </p>


                            <strong>

                                Learn More

                                <ArrowRight
                                    size={16}
                                />

                            </strong>

                        </a>

                    </div>

                </div>

            </motion.section>



            {/* =====================================
                DATABASE CATEGORIES
            ===================================== */}

            <motion.section
                className="home-section home-categories"
                {...revealAnimation}
            >

                <div className="container">

                    <div className="home-section-heading">

                        <div>

                            <span className="section-label">
                                Shop by Category
                            </span>


                            <h2>
                                Find what you need.
                            </h2>

                        </div>


                        <Link
                            to="/products"
                            className="home-view-all"
                        >

                            View All Products

                            <ArrowRight
                                size={16}
                            />

                        </Link>

                    </div>



                    <div className="home-category-grid">

                        {
                            categories.map(
                                category => {

                                    const CategoryIcon =
                                        getCategoryIcon(
                                            category.name
                                        );


                                    return (

                                        <Link
                                            to="/products"
                                            className="home-category-card"
                                            key={
                                                category.id
                                            }
                                        >

                                            <div className="home-category-icon">

                                                <CategoryIcon
                                                    size={30}
                                                />

                                            </div>


                                            <h3>
                                                {
                                                    category.name
                                                }
                                            </h3>


                                            <p>

                                                {
                                                    category.description ||
                                                    "Explore pharmacy products."
                                                }

                                            </p>


                                            <span>

                                                Explore

                                                <ArrowRight
                                                    size={15}
                                                />

                                            </span>

                                        </Link>

                                    );
                                }
                            )
                        }

                    </div>

                </div>

            </motion.section>



            {/* =====================================
                FEATURED PRODUCTS FROM SUPABASE
            ===================================== */}

            <motion.section
                className="home-section home-featured"
                {...revealAnimation}
            >

                <div className="container">

                    <div className="home-section-heading">

                        <div>

                            <span className="section-label">
                                Featured Products
                            </span>


                            <h2>
                                Selected pharmacy essentials.
                            </h2>

                        </div>


                        <Link
                            to="/products"
                            className="home-view-all"
                        >

                            Shop All

                            <ArrowRight
                                size={16}
                            />

                        </Link>

                    </div>



                    {
                        loadingProducts
                            ? (

                                <div className="home-products-loading">

                                    <div className="home-loading-dot">
                                    </div>

                                    <span>
                                        Loading pharmacy products...
                                    </span>

                                </div>

                            )
                            : featuredProducts.length >
                                0
                                ? (

                                    <div className="home-featured-grid">

                                        {
                                            featuredProducts.map(
                                                product => (

                                                    <ProductCard
                                                        key={
                                                            product.id
                                                        }
                                                        product={
                                                            product
                                                        }
                                                        onAdd={
                                                            showProductNotification
                                                        }
                                                    />

                                                )
                                            )
                                        }

                                    </div>

                                )
                                : (

                                    <div className="home-products-empty">

                                        <PackageCheck
                                            size={36}
                                        />


                                        <h3>
                                            Featured products coming soon
                                        </h3>


                                        <Link
                                            to="/products"
                                        >
                                            Browse all products
                                        </Link>

                                    </div>

                                )
                    }

                </div>

            </motion.section>



            {/* =====================================
                STORY / HERITAGE
            ===================================== */}

            <motion.section
                id="story"
                className="home-section home-story"
                {...revealAnimation}
            >

                <div className="container home-story-layout">

                    <div className="home-story-visual">

                        <img
                            src="/nabil-logo.png"
                            alt="Nabil Pharmacy logo"
                        />

                        <span>
                            1975
                        </span>

                    </div>


                    <div className="home-story-content">

                        <span className="section-label">
                            Our Story
                        </span>


                        <h2>
                            Serving families since 1975.
                        </h2>


                        <p>
                            Nabil Pharmacy combines its
                            long-standing pharmacy identity
                            with a modern digital experience
                            designed to make everyday
                            pharmacy shopping more
                            convenient.
                        </p>


                        <div className="home-story-stats">

                            <div>

                                <strong>
                                    1975
                                </strong>

                                <span>
                                    Established
                                </span>

                            </div>


                            <div>

                                <strong>
                                    5
                                </strong>

                                <span>
                                    Product Categories
                                </span>

                            </div>


                            <div>

                                <strong>
                                    24/7
                                </strong>

                                <span>
                                    Online Browsing
                                </span>

                            </div>

                        </div>

                    </div>

                </div>

            </motion.section>



            {/* =====================================
                PRESCRIPTION CTA
            ===================================== */}

            <motion.section
                className="home-prescription-cta"
                {...revealAnimation}
            >

                <div className="container">

                    <div className="home-prescription-box">

                        <div>

                            <span className="section-label">
                                Prescription Service
                            </span>


                            <h2>
                                Have a prescription?
                            </h2>


                            <p>
                                Use our prescription page.
                                Secure document upload will
                                be enabled once protected
                                pharmacy storage is
                                configured.
                            </p>

                        </div>


                        <Link
                            to="/prescription"
                            className="primary-button"
                        >

                            <Upload
                                size={18}
                            />

                            Open Prescription Page

                        </Link>

                    </div>

                </div>

            </motion.section>



            {/* =====================================
                BRANCHES
            ===================================== */}

            <motion.section
                id="branches"
                className="home-section home-branches"
                {...revealAnimation}
            >

                <div className="container">

                    <div className="home-section-heading">

                        <div>

                            <span className="section-label">
                                Our Branches
                            </span>


                            <h2>
                                Find Nabil Pharmacy.
                            </h2>

                        </div>

                    </div>


                    <div className="home-branch-placeholder">

                        <div className="home-branch-icon">

                            <MapPin
                                size={30}
                            />

                        </div>


                        <div>

                            <h3>
                                Branch information
                            </h3>


                            <p>
                                Pharmacy branch addresses,
                                opening hours and map
                                locations will appear here
                                once they are added to the
                                Supabase branches database.
                            </p>

                        </div>

                    </div>

                </div>

            </motion.section>



            {/* =====================================
                CONTACT
            ===================================== */}

            <motion.section
                id="contact"
                className="home-section home-contact"
                {...revealAnimation}
            >

                <div className="container home-contact-box">

                    <div>

                        <span className="section-label">
                            Contact Nabil Pharmacy
                        </span>


                        <h2>
                            How can we help?
                        </h2>


                        <p>
                            Contact information and direct
                            pharmacy communication will be
                            connected once the official
                            branch details are added.
                        </p>

                    </div>


                    <Link
                        to="/products"
                        className="secondary-button"
                    >

                        <Search
                            size={18}
                        />

                        Browse Pharmacy

                    </Link>

                </div>

            </motion.section>



            {/* =====================================
                CART TOAST
            ===================================== */}

            {
                notification && (

                    <motion.div
                        className="home-product-toast"
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

                        <PackageCheck
                            size={17}
                        />

                        {
                            notification
                        }

                    </motion.div>

                )
            }

        </main>
    );
}


export default Home;