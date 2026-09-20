import {
    ChevronLeft,
    ChevronRight,
    PackageSearch,
    RefreshCw,
    Search,
    SlidersHorizontal,
    X
} from "lucide-react";


import {
    AnimatePresence,
    motion
} from "framer-motion";


import {
    useCallback,
    useEffect,
    useMemo,
    useRef,
    useState
} from "react";


import ProductCard
    from "../../components/ProductCard/ProductCard.jsx";


import LogoLoader
    from "../../components/LogoLoader/LogoLoader.jsx";


import {
    supabase
} from "../../lib/supabase.js";


import "./Products.css";



const PAGE_SIZE =
    24;


const FILTER_CACHE_KEY =
    "nabil-product-filter-meta-v2";


const FILTER_CACHE_TIME =
    10 *
    60 *
    1000;



function Products() {

    /*
    ========================================================
    PRODUCT DATA
    ========================================================
    */

    const [
        products,
        setProducts
    ] = useState([]);


    const [
        categories,
        setCategories
    ] = useState([]);


    const [
        brands,
        setBrands
    ] = useState([]);



    /*
    ========================================================
    LOADING / ERROR
    ========================================================
    */

    const [
        loading,
        setLoading
    ] = useState(true);


    const [
        filtersReady,
        setFiltersReady
    ] = useState(false);


    const [
        error,
        setError
    ] = useState("");



    /*
    ========================================================
    FILTERS
    ========================================================
    */

    const [
        searchTerm,
        setSearchTerm
    ] = useState("");


    const [
        debouncedSearchTerm,
        setDebouncedSearchTerm
    ] = useState("");


    const [
        selectedCategory,
        setSelectedCategory
    ] = useState("All");


    const [
        selectedBrand,
        setSelectedBrand
    ] = useState("All");


    const [
        highestAvailablePrice,
        setHighestAvailablePrice
    ] = useState(1000);


    const [
        maxPrice,
        setMaxPrice
    ] = useState(1000);


    const [
        debouncedMaxPrice,
        setDebouncedMaxPrice
    ] = useState(1000);


    const [
        inStockOnly,
        setInStockOnly
    ] = useState(false);


    const [
        offersOnly,
        setOffersOnly
    ] = useState(false);


    const [
        sortBy,
        setSortBy
    ] = useState(
        "recommended"
    );


    const [
        filtersOpen,
        setFiltersOpen
    ] = useState(false);



    /*
    ========================================================
    PAGINATION
    ========================================================
    */

    const [
        page,
        setPage
    ] = useState(1);


    const [
        totalCount,
        setTotalCount
    ] = useState(0);



    /*
    ========================================================
    NOTIFICATION
    ========================================================
    */

    const [
        notification,
        setNotification
    ] = useState("");



    /*
    ========================================================
    REQUEST RACE PROTECTION
    ========================================================
    */

    const requestIdRef =
        useRef(0);



    /*
    ========================================================
    FORMAT PRODUCT FROM DATABASE VIEW
    ========================================================
    */

    const formatProduct = (
        product
    ) => {

        const stockQuantity =
            Number(
                product.stock_quantity ||
                0
            );


        return {

            id:
                product.id,

            slug:
                product.slug,

            name:
                product.name,

            category:
                product.category_name ||
                "Other",

            categorySlug:
                product.category_slug ||
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
                ) ||
                0,

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

            stockQuantity,

            inStock:
                stockQuantity >
                0,

            lowStock:
                stockQuantity >
                0 &&
                stockQuantity <=
                5,

            discountAmount:
                Number(
                    product.discount_amount ||
                    0
                ),

            createdAt:
                product.created_at
        };
    };



    /*
    ========================================================
    LOAD FILTER METADATA
    ========================================================

    Categories + brands + highest price are cached for
    ten minutes in the customer's browser.

    Navigating away and returning to Products therefore
    does not immediately repeat these metadata requests.
    */

    const loadFilterMetadata =
        useCallback(
            async () => {

                try {

                    const cached =
                        sessionStorage.getItem(
                            FILTER_CACHE_KEY
                        );


                    if (
                        cached
                    ) {

                        const parsed =
                            JSON.parse(
                                cached
                            );


                        const cacheStillFresh =

                            Date.now() -
                            Number(
                                parsed.savedAt ||
                                0
                            ) <

                            FILTER_CACHE_TIME;


                        if (
                            cacheStillFresh
                        ) {

                            setCategories(
                                parsed.categories ||
                                []
                            );


                            setBrands(
                                parsed.brands ||
                                []
                            );


                            const cachedMaximum =
                                Number(
                                    parsed.highestAvailablePrice
                                ) ||
                                1000;


                            setHighestAvailablePrice(
                                cachedMaximum
                            );


                            setMaxPrice(
                                cachedMaximum
                            );


                            setDebouncedMaxPrice(
                                cachedMaximum
                            );


                            setFiltersReady(
                                true
                            );


                            return;
                        }
                    }



                    const [
                        categoriesResponse,
                        metadataResponse
                    ] =
                        await Promise.all([

                            supabase
                                .from(
                                    "categories"
                                )
                                .select(`
                                    id,
                                    name,
                                    slug
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
                                ),


                            supabase
                                .rpc(
                                    "get_product_filter_meta"
                                )

                        ]);



                    if (
                        categoriesResponse.error
                    ) {

                        throw (
                            categoriesResponse.error
                        );
                    }


                    if (
                        metadataResponse.error
                    ) {

                        throw (
                            metadataResponse.error
                        );
                    }



                    const loadedCategories =
                        categoriesResponse.data ||
                        [];


                    const metadata =
                        metadataResponse.data ||
                        {};


                    const loadedBrands =
                        Array.isArray(
                            metadata.brands
                        )
                            ? metadata.brands
                            : [];


                    const rawMaximum =
                        Number(
                            metadata.max_price
                        ) ||
                        0;


                    const roundedMaximum =
                        Math.max(

                            100,

                            Math.ceil(
                                rawMaximum /
                                100
                            ) *
                            100

                        );


                    setCategories(
                        loadedCategories
                    );


                    setBrands(
                        loadedBrands
                    );


                    setHighestAvailablePrice(
                        roundedMaximum
                    );


                    setMaxPrice(
                        roundedMaximum
                    );


                    setDebouncedMaxPrice(
                        roundedMaximum
                    );



                    sessionStorage.setItem(

                        FILTER_CACHE_KEY,

                        JSON.stringify({

                            savedAt:
                                Date.now(),

                            categories:
                                loadedCategories,

                            brands:
                                loadedBrands,

                            highestAvailablePrice:
                                roundedMaximum

                        })

                    );

                } catch (
                    metadataError
                ) {

                    console.error(
                        "Product filter metadata error:",
                        metadataError
                    );


                    /*
                    The Products page can still load
                    using safe default filters.
                    */

                    setCategories(
                        []
                    );


                    setBrands(
                        []
                    );


                    setHighestAvailablePrice(
                        1000
                    );


                    setMaxPrice(
                        1000
                    );


                    setDebouncedMaxPrice(
                        1000
                    );

                } finally {

                    setFiltersReady(
                        true
                    );
                }
            },
            []
        );



    useEffect(
        () => {

            loadFilterMetadata();

        },
        [
            loadFilterMetadata
        ]
    );



    /*
    ========================================================
    DEBOUNCE PRODUCT SEARCH
    ========================================================

    Without this, typing:

    p
    pa
    pan
    pana
    panad
    panado
    panadol

    could create seven database requests.

    Now we wait briefly for the customer to stop typing.
    */

    useEffect(
        () => {

            const timer =
                window.setTimeout(
                    () => {

                        setDebouncedSearchTerm(
                            searchTerm
                                .trim()
                        );

                    },
                    350
                );


            return () => {

                window.clearTimeout(
                    timer
                );
            };

        },
        [
            searchTerm
        ]
    );



    /*
    ========================================================
    DEBOUNCE PRICE SLIDER
    ========================================================
    */

    useEffect(
        () => {

            const timer =
                window.setTimeout(
                    () => {

                        setDebouncedMaxPrice(
                            maxPrice
                        );

                    },
                    300
                );


            return () => {

                window.clearTimeout(
                    timer
                );
            };

        },
        [
            maxPrice
        ]
    );



    /*
    ========================================================
    RESET PAGE WHEN FILTER CHANGES
    ========================================================
    */

    useEffect(
        () => {

            setPage(
                1
            );

        },
        [
            debouncedSearchTerm,
            selectedCategory,
            selectedBrand,
            debouncedMaxPrice,
            inStockOnly,
            offersOnly,
            sortBy
        ]
    );



    /*
    ========================================================
    LOAD ONE PRODUCT PAGE
    ========================================================
    */

    const loadProducts =
        useCallback(
            async () => {

                if (
                    !filtersReady
                ) {

                    return;
                }


                const requestId =
                    requestIdRef.current +
                    1;


                requestIdRef.current =
                    requestId;


                setLoading(
                    true
                );


                setError(
                    ""
                );


                try {

                    const from =
                        (
                            page -
                            1
                        ) *
                        PAGE_SIZE;


                    const to =
                        from +
                        PAGE_SIZE -
                        1;



                    let query =
                        supabase
                            .from(
                                "product_catalog"
                            )
                            .select(
                                `
                                    id,
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
                                    category_id,
                                    category_name,
                                    category_slug,
                                    stock_quantity,
                                    discount_amount
                                `,
                                {
                                    count:
                                        "exact"
                                }
                            )
                            .eq(
                                "is_active",
                                true
                            );



                    /*
                    =========================================
                    SEARCH
                    =========================================
                    */

                    const safeSearch =
                        debouncedSearchTerm
                            .replace(
                                /[(),%]/g,
                                " "
                            )
                            .replace(
                                /\s+/g,
                                " "
                            )
                            .trim();


                    if (
                        safeSearch
                    ) {

                        query =
                            query.or(

                                [
                                    `name.ilike.%${safeSearch}%`,
                                    `brand.ilike.%${safeSearch}%`,
                                    `description.ilike.%${safeSearch}%`,
                                    `category_name.ilike.%${safeSearch}%`
                                ]
                                    .join(
                                        ","
                                    )

                            );
                    }



                    /*
                    =========================================
                    CATEGORY
                    =========================================
                    */

                    if (
                        selectedCategory !==
                        "All"
                    ) {

                        query =
                            query.eq(
                                "category_id",
                                selectedCategory
                            );
                    }



                    /*
                    =========================================
                    BRAND
                    =========================================
                    */

                    if (
                        selectedBrand !==
                        "All"
                    ) {

                        query =
                            query.eq(
                                "brand",
                                selectedBrand
                            );
                    }



                    /*
                    =========================================
                    PRICE
                    =========================================
                    */

                    query =
                        query.lte(
                            "price",
                            debouncedMaxPrice
                        );



                    /*
                    =========================================
                    STOCK
                    =========================================
                    */

                    if (
                        inStockOnly
                    ) {

                        query =
                            query.gt(
                                "stock_quantity",
                                0
                            );
                    }



                    /*
                    =========================================
                    OFFERS
                    =========================================
                    */

                    if (
                        offersOnly
                    ) {

                        query =
                            query.or(
                                "badge_text.not.is.null,old_price.not.is.null"
                            );
                    }



                    /*
                    =========================================
                    SORT
                    =========================================
                    */

                    switch (
                        sortBy
                    ) {

                        case "newest":

                            query =
                                query.order(
                                    "created_at",
                                    {
                                        ascending:
                                            false
                                    }
                                );

                            break;


                        case "price-low":

                            query =
                                query.order(
                                    "price",
                                    {
                                        ascending:
                                            true
                                    }
                                );

                            break;


                        case "price-high":

                            query =
                                query.order(
                                    "price",
                                    {
                                        ascending:
                                            false
                                    }
                                );

                            break;


                        case "name":

                            query =
                                query.order(
                                    "name",
                                    {
                                        ascending:
                                            true
                                    }
                                );

                            break;


                        case "discount":

                            query =
                                query
                                    .order(
                                        "discount_amount",
                                        {
                                            ascending:
                                                false
                                        }
                                    )
                                    .order(
                                        "created_at",
                                        {
                                            ascending:
                                                false
                                        }
                                    );

                            break;


                        default:

                            query =
                                query
                                    .order(
                                        "featured",
                                        {
                                            ascending:
                                                false
                                        }
                                    )
                                    .order(
                                        "created_at",
                                        {
                                            ascending:
                                                false
                                        }
                                    );
                    }



                    /*
                    =========================================
                    PAGINATION
                    =========================================
                    */

                    query =
                        query.range(
                            from,
                            to
                        );



                    const {
                        data,
                        error:
                            queryError,
                        count
                    } =
                        await query;



                    /*
                    A newer search/filter request finished
                    before this one.

                    Ignore the old response.
                    */

                    if (
                        requestId !==
                        requestIdRef.current
                    ) {

                        return;
                    }



                    if (
                        queryError
                    ) {

                        throw (
                            queryError
                        );
                    }



                    const numberOfProducts =
                        Number(
                            count ||
                            0
                        );


                    const totalPages =
                        Math.max(

                            1,

                            Math.ceil(
                                numberOfProducts /
                                PAGE_SIZE
                            )

                        );



                    /*
                    If a filter reduces the number of pages
                    while the customer is on a later page,
                    automatically move to the last valid page.
                    */

                    if (
                        page >
                        totalPages
                    ) {

                        setPage(
                            totalPages
                        );

                        return;
                    }



                    setTotalCount(
                        numberOfProducts
                    );


                    setProducts(

                        (
                            data ||
                            []
                        )
                            .map(
                                formatProduct
                            )

                    );

                } catch (
                    loadError
                ) {

                    if (
                        requestId !==
                        requestIdRef.current
                    ) {

                        return;
                    }


                    console.error(
                        "Products loading error:",
                        loadError
                    );


                    setProducts(
                        []
                    );


                    setTotalCount(
                        0
                    );


                    setError(
                        "We could not load the pharmacy products. Please try again."
                    );

                } finally {

                    if (
                        requestId ===
                        requestIdRef.current
                    ) {

                        setLoading(
                            false
                        );
                    }
                }
            },
            [
                filtersReady,
                page,
                debouncedSearchTerm,
                selectedCategory,
                selectedBrand,
                debouncedMaxPrice,
                inStockOnly,
                offersOnly,
                sortBy
            ]
        );



    useEffect(
        () => {

            loadProducts();

        },
        [
            loadProducts
        ]
    );



    /*
    ========================================================
    RESET FILTERS
    ========================================================
    */

    const resetFilters =
        () => {

            setSearchTerm(
                ""
            );


            setDebouncedSearchTerm(
                ""
            );


            setSelectedCategory(
                "All"
            );


            setSelectedBrand(
                "All"
            );


            setMaxPrice(
                highestAvailablePrice
            );


            setDebouncedMaxPrice(
                highestAvailablePrice
            );


            setInStockOnly(
                false
            );


            setOffersOnly(
                false
            );


            setSortBy(
                "recommended"
            );


            setPage(
                1
            );
        };



    /*
    ========================================================
    CART NOTIFICATION
    ========================================================
    */

    const showProductNotification = (
        product
    ) => {

        if (
            !product.inStock
        ) {

            setNotification(
                `${product.name} is currently out of stock`
            );

        } else {

            setNotification(
                `${product.name} added to your cart`
            );
        }


        window.setTimeout(
            () => {

                setNotification(
                    ""
                );

            },
            2200
        );
    };



    /*
    ========================================================
    PAGINATION INFORMATION
    ========================================================
    */

    const totalPages =
        Math.max(

            1,

            Math.ceil(
                totalCount /
                PAGE_SIZE
            )

        );


    const firstVisibleProduct =
        totalCount ===
        0
            ? 0
            : (
                (
                    page -
                    1
                ) *
                PAGE_SIZE
            ) +
            1;


    const lastVisibleProduct =
        Math.min(

            page *
            PAGE_SIZE,

            totalCount

        );



    const visiblePages =
        useMemo(
            () => {

                if (
                    totalPages <=
                    5
                ) {

                    return Array.from(
                        {
                            length:
                                totalPages
                        },
                        (
                            _,
                            index
                        ) =>
                            index +
                            1
                    );
                }


                let start =
                    Math.max(
                        1,
                        page -
                        2
                    );


                let end =
                    Math.min(
                        totalPages,
                        start +
                        4
                    );


                if (
                    end -
                    start <
                    4
                ) {

                    start =
                        Math.max(
                            1,
                            end -
                            4
                        );
                }


                return Array.from(
                    {
                        length:
                            end -
                            start +
                            1
                    },
                    (
                        _,
                        index
                    ) =>
                        start +
                        index
                );

            },
            [
                page,
                totalPages
            ]
        );



    /*
    ========================================================
    CHANGE PAGE
    ========================================================
    */

    const changePage = (
        newPage
    ) => {

        if (
            newPage <
            1 ||
            newPage >
            totalPages ||
            newPage ===
            page
        ) {

            return;
        }


        setPage(
            newPage
        );


        window.setTimeout(
            () => {

                document
                    .querySelector(
                        ".products-results"
                    )
                    ?.scrollIntoView({

                        behavior:
                            "smooth",

                        block:
                            "start"

                    });

            },
            50
        );
    };



    /*
    ========================================================
    PAGE
    ========================================================
    */

    return (

        <main className="products-page">


            {/* =========================================
                HERO
            ========================================= */}

            <section className="products-hero">

                <div className="container">

                    <motion.div

                        initial={{
                            opacity:
                                0,
                            y:
                                20
                        }}

                        animate={{
                            opacity:
                                1,
                            y:
                                0
                        }}

                        transition={{
                            duration:
                                0.5
                        }}

                    >

                        <span className="section-label">
                            Nabil Pharmacy
                        </span>


                        <h1>

                            Pharmacy essentials

                            <span>
                                {" "}for everyday care.
                            </span>

                        </h1>


                        <p>

                            Browse medicines,
                            vitamins, personal care,
                            baby care and health
                            products available through
                            Nabil Pharmacy.

                        </p>

                    </motion.div>

                </div>

            </section>



            {/* =========================================
                PRODUCTS
            ========================================= */}

            <section className="products-content">

                <div className="container">


                    {/* =====================================
                        SEARCH TOOLBAR
                    ===================================== */}

                    <div className="products-toolbar">

                        <div className="products-search">

                            <Search
                                size={19}
                            />


                            <input

                                type="search"

                                placeholder="Search products, brands or categories..."

                                value={
                                    searchTerm
                                }

                                onChange={
                                    event =>
                                        setSearchTerm(
                                            event.target.value
                                        )
                                }

                            />


                            {
                                searchTerm && (

                                    <button

                                        type="button"

                                        onClick={
                                            () =>
                                                setSearchTerm(
                                                    ""
                                                )
                                        }

                                        aria-label="Clear search"

                                    >

                                        <X
                                            size={17}
                                        />

                                    </button>

                                )
                            }

                        </div>


                        <button

                            type="button"

                            className="products-mobile-filter-button"

                            onClick={
                                () =>
                                    setFiltersOpen(
                                        current =>
                                            !current
                                    )
                            }

                        >

                            <SlidersHorizontal
                                size={18}
                            />

                            Filters

                        </button>

                    </div>



                    <div className="products-layout">


                        {/* =================================
                            FILTERS
                        ================================= */}

                        <aside
                            className={
                                filtersOpen
                                    ? "products-filters open"
                                    : "products-filters"
                            }
                        >

                            <div className="products-filter-header">

                                <div>

                                    <span>
                                        Refine
                                    </span>


                                    <h2>
                                        Filters
                                    </h2>

                                </div>


                                <button
                                    type="button"
                                    onClick={
                                        resetFilters
                                    }
                                >
                                    Reset
                                </button>

                            </div>



                            {/* CATEGORY */}

                            <div className="products-filter-group">

                                <label>
                                    Category
                                </label>


                                <div className="products-category-list">

                                    <button

                                        type="button"

                                        className={
                                            selectedCategory ===
                                                "All"
                                                ? "active"
                                                : ""
                                        }

                                        onClick={
                                            () =>
                                                setSelectedCategory(
                                                    "All"
                                                )
                                        }

                                    >
                                        All
                                    </button>


                                    {
                                        categories.map(
                                            category => (

                                                <button

                                                    type="button"

                                                    key={
                                                        category.id
                                                    }

                                                    className={
                                                        selectedCategory ===
                                                            category.id
                                                            ? "active"
                                                            : ""
                                                    }

                                                    onClick={
                                                        () =>
                                                            setSelectedCategory(
                                                                category.id
                                                            )
                                                    }

                                                >

                                                    {
                                                        category.name
                                                    }

                                                </button>

                                            )
                                        )
                                    }

                                </div>

                            </div>



                            {/* BRAND */}

                            <div className="products-filter-group">

                                <label htmlFor="brand-filter">
                                    Brand
                                </label>


                                <select

                                    id="brand-filter"

                                    value={
                                        selectedBrand
                                    }

                                    onChange={
                                        event =>
                                            setSelectedBrand(
                                                event.target.value
                                            )
                                    }

                                >

                                    <option value="All">
                                        All
                                    </option>


                                    {
                                        brands.map(
                                            brand => (

                                                <option
                                                    key={
                                                        brand
                                                    }
                                                    value={
                                                        brand
                                                    }
                                                >

                                                    {
                                                        brand
                                                    }

                                                </option>

                                            )
                                        )
                                    }

                                </select>

                            </div>



                            {/* PRICE */}

                            <div className="products-filter-group">

                                <div className="products-price-heading">

                                    <label htmlFor="price-filter">
                                        Maximum Price
                                    </label>


                                    <strong>

                                        EGP{" "}

                                        {
                                            Number(
                                                maxPrice
                                            )
                                                .toLocaleString()
                                        }

                                    </strong>

                                </div>


                                <input

                                    id="price-filter"

                                    type="range"

                                    min="0"

                                    max={
                                        highestAvailablePrice
                                    }

                                    step="25"

                                    value={
                                        maxPrice
                                    }

                                    onChange={
                                        event =>
                                            setMaxPrice(
                                                Number(
                                                    event.target.value
                                                )
                                            )
                                    }

                                />

                            </div>



                            {/* STOCK */}

                            <label className="products-check-filter">

                                <input

                                    type="checkbox"

                                    checked={
                                        inStockOnly
                                    }

                                    onChange={
                                        event =>
                                            setInStockOnly(
                                                event.target.checked
                                            )
                                    }

                                />


                                <span>
                                    In stock only
                                </span>

                            </label>



                            {/* OFFERS */}

                            <label className="products-check-filter">

                                <input

                                    type="checkbox"

                                    checked={
                                        offersOnly
                                    }

                                    onChange={
                                        event =>
                                            setOffersOnly(
                                                event.target.checked
                                            )
                                    }

                                />


                                <span>
                                    Offers only
                                </span>

                            </label>

                        </aside>



                        {/* =================================
                            RESULTS
                        ================================= */}

                        <div className="products-results">


                            <div className="products-results-header">

                                <div>

                                    <span>
                                        Showing
                                    </span>


                                    <strong>

                                        {
                                            loading
                                                ? "Loading..."
                                                : totalCount ===
                                                    0
                                                    ? "0 products"
                                                    : `${firstVisibleProduct}-${lastVisibleProduct} of ${totalCount} products`
                                        }

                                    </strong>

                                </div>


                                <select

                                    aria-label="Sort products"

                                    value={
                                        sortBy
                                    }

                                    onChange={
                                        event =>
                                            setSortBy(
                                                event.target.value
                                            )
                                    }

                                >

                                    <option value="recommended">
                                        Recommended
                                    </option>


                                    <option value="newest">
                                        Newest
                                    </option>


                                    <option value="price-low">
                                        Price: Low to High
                                    </option>


                                    <option value="price-high">
                                        Price: High to Low
                                    </option>


                                    <option value="name">
                                        Name A-Z
                                    </option>


                                    <option value="discount">
                                        Biggest Discount
                                    </option>

                                </select>

                            </div>



                            {/* =================================
                                LOADER
                            ================================= */}

                            {
                                loading && (

                                    <LogoLoader
                                        text="Loading products"
                                    />

                                )
                            }



                            {/* =================================
                                ERROR
                            ================================= */}

                            {
                                !loading &&
                                error && (

                                    <div className="products-status products-error">

                                        <PackageSearch
                                            size={40}
                                        />


                                        <h3>
                                            Products unavailable
                                        </h3>


                                        <p>
                                            {error}
                                        </p>


                                        <button

                                            type="button"

                                            className="primary-button"

                                            onClick={
                                                loadProducts
                                            }

                                        >

                                            <RefreshCw
                                                size={17}
                                            />

                                            Try Again

                                        </button>

                                    </div>

                                )
                            }



                            {/* =================================
                                PRODUCT GRID
                            ================================= */}

                            {
                                !loading &&
                                !error &&
                                products.length >
                                0 && (

                                    <>

                                        <motion.div

                                            layout

                                            className="products-grid"

                                        >

                                            <AnimatePresence
                                                mode="popLayout"
                                            >

                                                {
                                                    products.map(
                                                        product => (

                                                            <motion.div

                                                                layout

                                                                key={
                                                                    product.id
                                                                }

                                                                initial={{
                                                                    opacity:
                                                                        0,
                                                                    y:
                                                                        20,
                                                                    scale:
                                                                        0.98
                                                                }}

                                                                animate={{
                                                                    opacity:
                                                                        1,
                                                                    y:
                                                                        0,
                                                                    scale:
                                                                        1
                                                                }}

                                                                exit={{
                                                                    opacity:
                                                                        0,
                                                                    scale:
                                                                        0.96
                                                                }}

                                                                transition={{
                                                                    duration:
                                                                        0.25
                                                                }}

                                                            >

                                                                <ProductCard

                                                                    product={
                                                                        product
                                                                    }

                                                                    onAdd={
                                                                        showProductNotification
                                                                    }

                                                                />

                                                            </motion.div>

                                                        )
                                                    )
                                                }

                                            </AnimatePresence>

                                        </motion.div>



                                        {/* =============================
                                            PAGINATION
                                        ============================= */}

                                        {
                                            totalPages >
                                            1 && (

                                                <nav

                                                    aria-label="Product pages"

                                                    style={{

                                                        marginTop:
                                                            "34px",

                                                        display:
                                                            "flex",

                                                        alignItems:
                                                            "center",

                                                        justifyContent:
                                                            "center",

                                                        flexWrap:
                                                            "wrap",

                                                        gap:
                                                            "8px"

                                                    }}

                                                >

                                                    <button

                                                        type="button"

                                                        onClick={
                                                            () =>
                                                                changePage(
                                                                    page -
                                                                    1
                                                                )
                                                        }

                                                        disabled={
                                                            page ===
                                                            1
                                                        }

                                                        style={
                                                            paginationArrowStyle(
                                                                page ===
                                                                1
                                                            )
                                                        }

                                                    >

                                                        <ChevronLeft
                                                            size={17}
                                                        />

                                                        Previous

                                                    </button>



                                                    {
                                                        visiblePages.map(
                                                            pageNumber => (

                                                                <button

                                                                    type="button"

                                                                    key={
                                                                        pageNumber
                                                                    }

                                                                    onClick={
                                                                        () =>
                                                                            changePage(
                                                                                pageNumber
                                                                            )
                                                                    }

                                                                    aria-current={
                                                                        pageNumber ===
                                                                        page
                                                                            ? "page"
                                                                            : undefined
                                                                    }

                                                                    style={
                                                                        paginationNumberStyle(
                                                                            pageNumber ===
                                                                            page
                                                                        )
                                                                    }

                                                                >

                                                                    {
                                                                        pageNumber
                                                                    }

                                                                </button>

                                                            )
                                                        )
                                                    }



                                                    <button

                                                        type="button"

                                                        onClick={
                                                            () =>
                                                                changePage(
                                                                    page +
                                                                    1
                                                                )
                                                        }

                                                        disabled={
                                                            page ===
                                                            totalPages
                                                        }

                                                        style={
                                                            paginationArrowStyle(
                                                                page ===
                                                                totalPages
                                                            )
                                                        }

                                                    >

                                                        Next

                                                        <ChevronRight
                                                            size={17}
                                                        />

                                                    </button>

                                                </nav>

                                            )
                                        }

                                    </>

                                )
                            }



                            {/* =================================
                                EMPTY
                            ================================= */}

                            {
                                !loading &&
                                !error &&
                                products.length ===
                                0 && (

                                    <div className="products-status">

                                        <PackageSearch
                                            size={42}
                                        />


                                        <h3>
                                            No products found
                                        </h3>


                                        <p>

                                            Try changing your
                                            search or filters.

                                        </p>


                                        <button

                                            type="button"

                                            className="primary-button"

                                            onClick={
                                                resetFilters
                                            }

                                        >

                                            Reset Filters

                                        </button>

                                    </div>

                                )
                            }

                        </div>

                    </div>

                </div>

            </section>



            {/* =========================================
                CART NOTIFICATION
            ========================================= */}

            <AnimatePresence>

                {
                    notification && (

                        <motion.div

                            className="products-toast"

                            initial={{
                                opacity:
                                    0,
                                y:
                                    20
                            }}

                            animate={{
                                opacity:
                                    1,
                                y:
                                    0
                            }}

                            exit={{
                                opacity:
                                    0,
                                y:
                                    15
                            }}

                        >

                            {
                                notification
                            }

                        </motion.div>

                    )
                }

            </AnimatePresence>

        </main>
    );
}



/*
========================================================
PAGINATION STYLES

Kept inside this file so you do NOT need to manually
modify Products.css.
========================================================
*/

function paginationArrowStyle(
    disabled
) {

    return {

        minHeight:
            "42px",

        padding:
            "0 14px",

        display:
            "inline-flex",

        alignItems:
            "center",

        justifyContent:
            "center",

        gap:
            "6px",

        border:
            "1px solid rgba(170, 16, 24, 0.14)",

        borderRadius:
            "12px",

        background:
            disabled
                ? "#f5f5f5"
                : "#ffffff",

        color:
            disabled
                ? "#aaa"
                : "#9c1019",

        font:
            "inherit",

        fontSize:
            "12px",

        fontWeight:
            "800",

        cursor:
            disabled
                ? "not-allowed"
                : "pointer",

        opacity:
            disabled
                ? 0.65
                : 1

    };
}



function paginationNumberStyle(
    active
) {

    return {

        width:
            "42px",

        height:
            "42px",

        display:
            "grid",

        placeItems:
            "center",

        border:
            active
                ? "1px solid #a81019"
                : "1px solid rgba(170, 16, 24, 0.13)",

        borderRadius:
            "12px",

        background:
            active
                ? "linear-gradient(135deg, #b5161f, #810a11)"
                : "#ffffff",

        color:
            active
                ? "#ffffff"
                : "#761017",

        font:
            "inherit",

        fontSize:
            "12px",

        fontWeight:
            "900",

        cursor:
            "pointer",

        boxShadow:
            active
                ? "0 8px 18px rgba(170, 16, 24, 0.18)"
                : "none"

    };
}


export default Products;