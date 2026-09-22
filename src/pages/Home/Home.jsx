import {
    Activity,
    ArrowLeft,
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
    Users
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
    useLanguage
} from "../../context/LanguageContext.jsx";

import {
    supabase
} from "../../lib/supabase.js";

import "./Home.css";


function Home() {

    const reduceMotion =
        useReducedMotion();


    const {
        language,
        isArabic,
        localize,
        t
    } = useLanguage();


    const DirectionArrow =
        isArabic
            ? ArrowLeft
            : ArrowRight;


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


    const formatProduct = (
        product
    ) => {

        const category =
            product.categories ||
            {};


        return {

            id:
                product.id,

            slug:
                product.slug,

            name:
                localize(
                    product,
                    "name",
                    ""
                ),

            category:
                localize(
                    category,
                    "name",
                    t(
                        "pharmacy"
                    )
                ),

            categoryOriginal:
                category.name ||
                "Pharmacy",

            categorySlug:
                category.slug ||
                "",

            categoryId:
                product.category_id,

            brand:
                localize(
                    product,
                    "brand",
                    t(
                        "nabilPharmacy"
                    )
                ),

            description:
                localize(
                    product,
                    "description",
                    ""
                ),

            price:
                Number(
                    product.price
                ) ||
                0,

            oldPrice:
                product.old_price
                    ? Number(
                        product.old_price
                    )
                    : null,

            offer:
                localize(
                    product,
                    "badge_text",
                    ""
                ) ||
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

            inStock:
                true,

            createdAt:
                product.created_at

        };

    };


    const loadHomeData =
        async () => {

            setLoadingProducts(
                true
            );


            try {

                const [
                    productsResponse,
                    categoriesResponse
                ] =
                    await Promise.all([

                        supabase
                            .from(
                                "products"
                            )
                            .select(`
                                id,
                                category_id,
                                name,
                                name_ar,
                                slug,
                                brand,
                                brand_ar,
                                description,
                                description_ar,
                                price,
                                old_price,
                                badge_text,
                                badge_text_ar,
                                image_url,
                                prescription_required,
                                featured,
                                is_active,
                                created_at,
                                categories (
                                    id,
                                    name,
                                    name_ar,
                                    slug,
                                    description,
                                    description_ar
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
                                    ascending:
                                        false
                                }
                            )
                            .limit(
                                4
                            ),


                        supabase
                            .from(
                                "categories"
                            )
                            .select(`
                                id,
                                name,
                                name_ar,
                                slug,
                                description,
                                description_ar,
                                image_url
                            `)
                            .eq(
                                "is_active",
                                true
                            )
                            .order(
                                "name",
                                {
                                    ascending:
                                        true
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

            } catch (
                error
            ) {

                console.error(
                    "Home data error:",
                    error
                );

            } finally {

                setLoadingProducts(
                    false
                );

            }

        };


    useEffect(
        () => {

            loadHomeData();

        },
        [
            language
        ]
    );


    const getCategoryIcon = (
        categoryName
    ) => {

        const name =
            String(
                categoryName ||
                ""
            ).toLowerCase();


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


    const revealAnimation =
        useMemo(
            () => {

                if (
                    reduceMotion
                ) {

                    return {

                        initial:
                            false,

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


    const showProductNotification = (
        product
    ) => {

        setNotification(
            t(
                "addedToCart",
                {
                    product:
                        product.name
                }
            )
        );


        window.setTimeout(
            () => {

                setNotification(
                    ""
                );

            },
            2200
        );

    };


    return (

        <main className="home-page">


            {/* HERO */}

            <section className="home-hero">

                <div className="container home-hero-layout">


                    <motion.div

                        className="home-hero-content"

                        initial={
                            reduceMotion
                                ? false
                                : {
                                    opacity: 0,
                                    x:
                                        isArabic
                                            ? 25
                                            : -25
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

                            {
                                t(
                                    "homeHeroLabel"
                                )
                            }

                        </span>


                        <h1>

                            {
                                t(
                                    "heroTitleLead"
                                )
                            }

                            <span>

                                {" "}

                                {
                                    t(
                                        "heroTitleAccent"
                                    )
                                }

                            </span>

                        </h1>


                        <p>

                            {
                                t(
                                    "heroDescription"
                                )
                            }

                        </p>


                        <div className="home-hero-actions">


                            <Link
                                to="/products"
                                className="primary-button"
                            >

                                <ShoppingBag
                                    size={18}
                                />

                                {
                                    t(
                                        "shopProducts"
                                    )
                                }

                            </Link>


                            <Link
                                to="/prescription"
                                className="secondary-button"
                            >

                                <Upload
                                    size={18}
                                />

                                {
                                    t(
                                        "uploadPrescription"
                                    )
                                }

                            </Link>

                        </div>


                        <div className="home-hero-trust">


                            <div>

                                <ShieldCheck
                                    size={18}
                                />

                                <span>

                                    {
                                        t(
                                            "pharmacyCare"
                                        )
                                    }

                                </span>

                            </div>


                            <div>

                                <PackageCheck
                                    size={18}
                                />

                                <span>

                                    {
                                        t(
                                            "convenientOrdering"
                                        )
                                    }

                                </span>

                            </div>


                            <div>

                                <Users
                                    size={18}
                                />

                                <span>

                                    {
                                        t(
                                            "familyFocused"
                                        )
                                    }

                                </span>

                            </div>

                        </div>

                    </motion.div>


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
                                alt={
                                    t(
                                        "nabilPharmacy"
                                    )
                                }
                            />


                            <span>

                                {
                                    t(
                                        "since1975"
                                    )
                                }

                            </span>


                            <h2>

                                {
                                    t(
                                        "nabilPharmacy"
                                    )
                                }

                            </h2>


                            <p>

                                {
                                    t(
                                        "pharmacyCareBuiltTrust"
                                    )
                                }

                            </p>

                        </div>


                        <div className="home-hero-floating-card home-hero-floating-one">

                            <ShieldCheck
                                size={20}
                            />


                            <div>

                                <strong>

                                    {
                                        t(
                                            "trustedCare"
                                        )
                                    }

                                </strong>


                                <span>

                                    {
                                        t(
                                            "since1975"
                                        )
                                    }

                                </span>

                            </div>

                        </div>


                        <div className="home-hero-floating-card home-hero-floating-two">

                            <Stethoscope
                                size={20}
                            />


                            <div>

                                <strong>

                                    {
                                        t(
                                            "pharmacy"
                                        )
                                    }

                                </strong>


                                <span>

                                    {
                                        t(
                                            "everydayHealth"
                                        )
                                    }

                                </span>

                            </div>

                        </div>

                    </motion.div>

                </div>

            </section>


            {/* TRUST STRIP */}

            <section className="home-trust-strip">

                <div className="container home-trust-grid">


                    <div>

                        <ShieldCheck />

                        <strong>

                            {
                                t(
                                    "pharmacyTrusted"
                                )
                            }

                        </strong>

                        <span>

                            {
                                t(
                                    "since1975"
                                )
                            }

                        </span>

                    </div>


                    <div>

                        <ShoppingBag />

                        <strong>

                            {
                                t(
                                    "easyShopping"
                                )
                            }

                        </strong>

                        <span>

                            {
                                t(
                                    "browseOnline"
                                )
                            }

                        </span>

                    </div>


                    <div>

                        <Upload />

                        <strong>

                            {
                                t(
                                    "prescriptionService"
                                )
                            }

                        </strong>

                        <span>

                            {
                                t(
                                    "secureSystemComing"
                                )
                            }

                        </span>

                    </div>


                    <div>

                        <MapPin />

                        <strong>

                            {
                                t(
                                    "deliveryPickup"
                                )
                            }

                        </strong>

                        <span>

                            {
                                t(
                                    "flexibleOptions"
                                )
                            }

                        </span>

                    </div>

                </div>

            </section>


            {/* SERVICES */}

            <motion.section
                id="services"
                className="home-section home-services"
                {...revealAnimation}
            >

                <div className="container">

                    <div className="home-section-heading">


                        <div>

                            <span className="section-label">

                                {
                                    t(
                                        "ourServices"
                                    )
                                }

                            </span>


                            <h2>

                                {
                                    t(
                                        "healthcareSimpler"
                                    )
                                }

                            </h2>

                        </div>


                        <p>

                            {
                                t(
                                    "convenientServicesDescription"
                                )
                            }

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

                                {
                                    t(
                                        "pharmacyProducts"
                                    )
                                }

                            </h3>


                            <p>

                                {
                                    t(
                                        "pharmacyProductsDescription"
                                    )
                                }

                            </p>


                            <strong>

                                {
                                    t(
                                        "browseProducts"
                                    )
                                }

                                <DirectionArrow
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

                                {
                                    t(
                                        "prescriptionService"
                                    )
                                }

                            </h3>


                            <p>

                                {
                                    t(
                                        "prescriptionWorkflowDescription"
                                    )
                                }

                            </p>


                            <strong>

                                {
                                    t(
                                        "prescriptionPage"
                                    )
                                }

                                <DirectionArrow
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

                                {
                                    t(
                                        "deliveryPickup"
                                    )
                                }

                            </h3>


                            <p>

                                {
                                    t(
                                        "deliveryPickupDescription"
                                    )
                                }

                            </p>


                            <strong>

                                {
                                    t(
                                        "learnMore"
                                    )
                                }

                                <DirectionArrow
                                    size={16}
                                />

                            </strong>

                        </a>

                    </div>

                </div>

            </motion.section>


            {/* CATEGORIES */}

            <motion.section
                className="home-section home-categories"
                {...revealAnimation}
            >

                <div className="container">


                    <div className="home-section-heading">


                        <div>

                            <span className="section-label">

                                {
                                    t(
                                        "shopByCategory"
                                    )
                                }

                            </span>


                            <h2>

                                {
                                    t(
                                        "findWhatYouNeed"
                                    )
                                }

                            </h2>

                        </div>


                        <Link
                            to="/products"
                            className="home-view-all"
                        >

                            {
                                t(
                                    "viewAllProducts"
                                )
                            }

                            <DirectionArrow
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
                                                    localize(
                                                        category,
                                                        "name",
                                                        t(
                                                            "pharmacy"
                                                        )
                                                    )
                                                }

                                            </h3>


                                            <p>

                                                {
                                                    localize(
                                                        category,
                                                        "description",
                                                        t(
                                                            "explorePharmacyProducts"
                                                        )
                                                    )
                                                }

                                            </p>


                                            <span>

                                                {
                                                    t(
                                                        "explore"
                                                    )
                                                }

                                                <DirectionArrow
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


            {/* FEATURED PRODUCTS */}

            <motion.section
                className="home-section home-featured"
                {...revealAnimation}
            >

                <div className="container">


                    <div className="home-section-heading">


                        <div>

                            <span className="section-label">

                                {
                                    t(
                                        "featuredProducts"
                                    )
                                }

                            </span>


                            <h2>

                                {
                                    t(
                                        "selectedEssentials"
                                    )
                                }

                            </h2>

                        </div>


                        <Link
                            to="/products"
                            className="home-view-all"
                        >

                            {
                                t(
                                    "shopAll"
                                )
                            }

                            <DirectionArrow
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

                                        {
                                            t(
                                                "loadingProducts"
                                            )
                                        }

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

                                            {
                                                t(
                                                    "featuredComingSoon"
                                                )
                                            }

                                        </h3>


                                        <Link
                                            to="/products"
                                        >

                                            {
                                                t(
                                                    "browseAllProducts"
                                                )
                                            }

                                        </Link>

                                    </div>

                                )
                    }

                </div>

            </motion.section>


            {/* STORY */}

            <motion.section
                id="story"
                className="home-section home-story"
                {...revealAnimation}
            >

                <div className="container home-story-layout">


                    <div className="home-story-visual">

                        <img
                            src="/nabil-logo.png"
                            alt={
                                t(
                                    "nabilPharmacy"
                                )
                            }
                        />

                        <span>

                            {
                                isArabic
                                    ? "١٩٧٥"
                                    : "1975"
                            }

                        </span>

                    </div>


                    <div className="home-story-content">

                        <span className="section-label">

                            {
                                t(
                                    "ourStory"
                                )
                            }

                        </span>


                        <h2>

                            {
                                t(
                                    "servingFamilies"
                                )
                            }

                        </h2>


                        <p>

                            {
                                t(
                                    "storyDescription"
                                )
                            }

                        </p>


                        <div className="home-story-stats">


                            <div>

                                <strong>

                                    {
                                        isArabic
                                            ? "١٩٧٥"
                                            : "1975"
                                    }

                                </strong>

                                <span>

                                    {
                                        t(
                                            "established"
                                        )
                                    }

                                </span>

                            </div>


                            <div>

                                <strong>

                                    {
                                        isArabic
                                            ? "٥"
                                            : "5"
                                    }

                                </strong>

                                <span>

                                    {
                                        t(
                                            "productCategories"
                                        )
                                    }

                                </span>

                            </div>


                            <div>

                                <strong>

                                    {
                                        isArabic
                                            ? "٢٤/٧"
                                            : "24/7"
                                    }

                                </strong>

                                <span>

                                    {
                                        t(
                                            "onlineBrowsing"
                                        )
                                    }

                                </span>

                            </div>

                        </div>

                    </div>

                </div>

            </motion.section>


            {/* PRESCRIPTION */}

            <motion.section
                className="home-prescription-cta"
                {...revealAnimation}
            >

                <div className="container">

                    <div className="home-prescription-box">


                        <div>

                            <span className="section-label">

                                {
                                    t(
                                        "prescriptionService"
                                    )
                                }

                            </span>


                            <h2>

                                {
                                    t(
                                        "havePrescription"
                                    )
                                }

                            </h2>


                            <p>

                                {
                                    t(
                                        "prescriptionCtaDescription"
                                    )
                                }

                            </p>

                        </div>


                        <Link
                            to="/prescription"
                            className="primary-button"
                        >

                            <Upload
                                size={18}
                            />

                            {
                                t(
                                    "openPrescriptionPage"
                                )
                            }

                        </Link>

                    </div>

                </div>

            </motion.section>


            {/* BRANCHES */}

            <motion.section
                id="branches"
                className="home-section home-branches"
                {...revealAnimation}
            >

                <div className="container">


                    <div className="home-section-heading">

                        <div>

                            <span className="section-label">

                                {
                                    t(
                                        "ourBranches"
                                    )
                                }

                            </span>


                            <h2>

                                {
                                    t(
                                        "findNabilPharmacy"
                                    )
                                }

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

                                {
                                    t(
                                        "branchInformation"
                                    )
                                }

                            </h3>


                            <p>

                                {
                                    t(
                                        "branchInformationDescription"
                                    )
                                }

                            </p>

                        </div>

                    </div>

                </div>

            </motion.section>


            {/* CONTACT */}

            <motion.section
                id="contact"
                className="home-section home-contact"
                {...revealAnimation}
            >

                <div className="container home-contact-box">


                    <div>

                        <span className="section-label">

                            {
                                t(
                                    "contactNabilPharmacy"
                                )
                            }

                        </span>


                        <h2>

                            {
                                t(
                                    "howCanWeHelp"
                                )
                            }

                        </h2>


                        <p>

                            {
                                t(
                                    "contactDescription"
                                )
                            }

                        </p>

                    </div>


                    <Link
                        to="/products"
                        className="secondary-button"
                    >

                        <Search
                            size={18}
                        />

                        {
                            t(
                                "browsePharmacy"
                            )
                        }

                    </Link>

                </div>

            </motion.section>


            {/* TOAST */}

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