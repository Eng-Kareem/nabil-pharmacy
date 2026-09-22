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
    useLanguage
} from "../../context/LanguageContext.jsx";

import {
    supabase
} from "../../lib/supabase.js";

import "./Products.css";


const PAGE_SIZE =
    24;


const FILTER_CACHE_KEY =
    "nabil-product-filter-meta-v3";


const FILTER_CACHE_TIME =
    10 *
    60 *
    1000;


function Products() {

    const {
        language,
        isArabic,
        localize,
        t
    } = useLanguage();


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


    const [
        page,
        setPage
    ] = useState(1);


    const [
        totalCount,
        setTotalCount
    ] = useState(0);


    const [
        notification,
        setNotification
    ] = useState("");


    const requestIdRef =
        useRef(0);


    /*
    ========================================================
    NUMBER FORMAT
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


    const formatMoney = (
        value
    ) => {

        const number =
            formatNumber(
                value
            );


        return isArabic
            ? `${number} ج.م`
            : `EGP ${number}`;

    };


    /*
    ========================================================
    LOAD FILTER DATA
    ========================================================
    */

    const loadFilterMetadata =
        useCallback(
            async () => {

                try {

                    const cached =
                        sessionStorage
                            .getItem(
                                FILTER_CACHE_KEY
                            );


                    if (
                        cached
                    ) {

                        const parsed =
                            JSON.parse(
                                cached
                            );


                        const valid =
                            Date.now() -
                            Number(
                                parsed.savedAt ||
                                0
                            ) <
                            FILTER_CACHE_TIME;


                        if (
                            valid
                        ) {

                            setCategories(
                                parsed.categories ||
                                []
                            );


                            setBrands(
                                parsed.brands ||
                                []
                            );


                            const maximum =
                                Number(
                                    parsed.highestAvailablePrice
                                ) ||
                                1000;


                            setHighestAvailablePrice(
                                maximum
                            );

                            setMaxPrice(
                                maximum
                            );

                            setDebouncedMaxPrice(
                                maximum
                            );

                            setFiltersReady(
                                true
                            );

                            return;

                        }

                    }


                    const [
                        categoryResponse,
                        metaResponse,
                        brandArabicResponse
                    ] =
                        await Promise.all([

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
                                    description_ar
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
                                ),


                            supabase
                                .from(
                                    "products"
                                )
                                .select(`
                                    brand,
                                    brand_ar
                                `)
                                .eq(
                                    "is_active",
                                    true
                                )

                        ]);


                    if (
                        categoryResponse.error
                    ) {

                        throw categoryResponse.error;

                    }


                    if (
                        metaResponse.error
                    ) {

                        throw metaResponse.error;

                    }


                    const loadedCategories =
                        categoryResponse.data ||
                        [];


                    const metadata =
                        metaResponse.data ||
                        {};


                    const rawBrands =
                        Array.isArray(
                            metadata.brands
                        )
                            ? metadata.brands
                            : [];


                    const arabicBrandMap =
                        new Map();


                    if (
                        !brandArabicResponse.error
                    ) {

                        (
                            brandArabicResponse.data ||
                            []
                        ).forEach(
                            row => {

                                if (
                                    row.brand
                                ) {

                                    arabicBrandMap.set(
                                        row.brand,
                                        row.brand_ar ||
                                        row.brand
                                    );

                                }

                            }
                        );

                    }


                    const loadedBrands =
                        rawBrands.map(
                            brand => ({

                                value:
                                    brand,

                                labelAr:
                                    arabicBrandMap.get(
                                        brand
                                    ) ||
                                    brand

                            })
                        );


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
    SEARCH DEBOUNCE
    ========================================================
    */

    useEffect(
        () => {

            const timer =
                window.setTimeout(
                    () => {

                        setDebouncedSearchTerm(
                            searchTerm.trim()
                        );

                    },
                    350
                );


            return () =>
                window.clearTimeout(
                    timer
                );

        },
        [
            searchTerm
        ]
    );


    /*
    ========================================================
    PRICE DEBOUNCE
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


            return () =>
                window.clearTimeout(
                    timer
                );

        },
        [
            maxPrice
        ]
    );


    /*
    ========================================================
    RESET PAGE
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
    ARABIC SEARCH IDS
    ========================================================
    */

    const findArabicMatches =
        async (
            search
        ) => {

            if (
                !isArabic ||
                !search
            ) {

                return {
                    productIds: [],
                    categoryIds: []
                };

            }


            try {

                const [
                    productResponse,
                    categoryResponse
                ] =
                    await Promise.all([

                        supabase
                            .from(
                                "products"
                            )
                            .select(
                                "id"
                            )
                            .eq(
                                "is_active",
                                true
                            )
                            .or(
                                [
                                    `name_ar.ilike.%${search}%`,
                                    `brand_ar.ilike.%${search}%`,
                                    `description_ar.ilike.%${search}%`,
                                    `badge_text_ar.ilike.%${search}%`
                                ].join(
                                    ","
                                )
                            )
                            .limit(
                                200
                            ),


                        supabase
                            .from(
                                "categories"
                            )
                            .select(
                                "id"
                            )
                            .eq(
                                "is_active",
                                true
                            )
                            .or(
                                [
                                    `name_ar.ilike.%${search}%`,
                                    `description_ar.ilike.%${search}%`
                                ].join(
                                    ","
                                )
                            )
                            .limit(
                                100
                            )

                    ]);


                return {

                    productIds:
                        (
                            productResponse.data ||
                            []
                        ).map(
                            row =>
                                row.id
                        ),

                    categoryIds:
                        (
                            categoryResponse.data ||
                            []
                        ).map(
                            row =>
                                row.id
                        )

                };

            } catch (
                searchError
            ) {

                console.error(
                    "Arabic search error:",
                    searchError
                );


                return {
                    productIds: [],
                    categoryIds: []
                };

            }

        };


    /*
    ========================================================
    LOAD PRODUCTS
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


                    const safeSearch =
                        debouncedSearchTerm
                            .replace(
                                /[^\p{L}\p{N}\s-]/gu,
                                " "
                            )
                            .replace(
                                /\s+/g,
                                " "
                            )
                            .trim();


                    const arabicMatches =
                        await findArabicMatches(
                            safeSearch
                        );


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

                    if (
                        safeSearch
                    ) {

                        const searchParts = [

                            `name.ilike.%${safeSearch}%`,
                            `brand.ilike.%${safeSearch}%`,
                            `description.ilike.%${safeSearch}%`,
                            `category_name.ilike.%${safeSearch}%`

                        ];


                        if (
                            arabicMatches
                                .productIds
                                .length >
                            0
                        ) {

                            searchParts.push(
                                `id.in.(${arabicMatches.productIds.join(",")})`
                            );

                        }


                        if (
                            arabicMatches
                                .categoryIds
                                .length >
                            0
                        ) {

                            searchParts.push(
                                `category_id.in.(${arabicMatches.categoryIds.join(",")})`
                            );

                        }


                        query =
                            query.or(
                                searchParts.join(
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


                    if (
                        requestId !==
                        requestIdRef.current
                    ) {

                        return;

                    }


                    if (
                        queryError
                    ) {

                        throw queryError;

                    }


                    /*
                    =========================================
                    ARABIC PRODUCT CONTENT
                    =========================================
                    */

                    let arabicMap =
                        new Map();


                    if (
                        isArabic &&
                        (
                            data ||
                            []
                        ).length >
                        0
                    ) {

                        const ids =
                            (
                                data ||
                                []
                            ).map(
                                item =>
                                    item.id
                            );


                        const {
                            data:
                                arabicRows,
                            error:
                                arabicError
                        } =
                            await supabase
                                .from(
                                    "products"
                                )
                                .select(`
                                    id,
                                    name_ar,
                                    brand_ar,
                                    description_ar,
                                    badge_text_ar
                                `)
                                .in(
                                    "id",
                                    ids
                                );


                        if (
                            !arabicError
                        ) {

                            arabicMap =
                                new Map(
                                    (
                                        arabicRows ||
                                        []
                                    ).map(
                                        item => [
                                            item.id,
                                            item
                                        ]
                                    )
                                );

                        }

                    }


                    const numberOfProducts =
                        Number(
                            count ||
                            0
                        );


                    const numberOfPages =
                        Math.max(

                            1,

                            Math.ceil(
                                numberOfProducts /
                                PAGE_SIZE
                            )

                        );


                    if (
                        page >
                        numberOfPages
                    ) {

                        setPage(
                            numberOfPages
                        );

                        return;

                    }


                    const formatted =
                        (
                            data ||
                            []
                        ).map(
                            item => {

                                const arabic =
                                    arabicMap.get(
                                        item.id
                                    ) ||
                                    {};


                                const categoryObject =
                                    categories.find(
                                        category =>
                                            category.id ===
                                            item.category_id
                                    ) ||
                                    {};


                                const stockQuantity =
                                    Number(
                                        item.stock_quantity ||
                                        0
                                    );


                                return {

                                    id:
                                        item.id,

                                    slug:
                                        item.slug,

                                    name:
                                        isArabic
                                            ? (
                                                arabic.name_ar ||
                                                item.name
                                            )
                                            : item.name,

                                    category:
                                        isArabic
                                            ? (
                                                categoryObject.name_ar ||
                                                item.category_name ||
                                                t(
                                                    "other"
                                                )
                                            )
                                            : (
                                                item.category_name ||
                                                t(
                                                    "other"
                                                )
                                            ),

                                    categoryOriginal:
                                        item.category_name ||
                                        "",

                                    categorySlug:
                                        item.category_slug ||
                                        "",

                                    categoryId:
                                        item.category_id,

                                    brand:
                                        isArabic
                                            ? (
                                                arabic.brand_ar ||
                                                item.brand ||
                                                t(
                                                    "nabilPharmacy"
                                                )
                                            )
                                            : (
                                                item.brand ||
                                                t(
                                                    "nabilPharmacy"
                                                )
                                            ),

                                    description:
                                        isArabic
                                            ? (
                                                arabic.description_ar ||
                                                item.description ||
                                                ""
                                            )
                                            : (
                                                item.description ||
                                                ""
                                            ),

                                    price:
                                        Number(
                                            item.price
                                        ) ||
                                        0,

                                    oldPrice:
                                        item.old_price
                                            ? Number(
                                                item.old_price
                                            )
                                            : null,

                                    offer:
                                        isArabic
                                            ? (
                                                arabic.badge_text_ar ||
                                                item.badge_text ||
                                                null
                                            )
                                            : (
                                                item.badge_text ||
                                                null
                                            ),

                                    imageUrl:
                                        item.image_url ||
                                        null,

                                    prescriptionRequired:
                                        Boolean(
                                            item.prescription_required
                                        ),

                                    featured:
                                        Boolean(
                                            item.featured
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
                                            item.discount_amount ||
                                            0
                                        ),

                                    createdAt:
                                        item.created_at

                                };

                            }
                        );


                    setTotalCount(
                        numberOfProducts
                    );


                    setProducts(
                        formatted
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
                        t(
                            "productsLoadError"
                        )
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
                sortBy,
                isArabic,
                language,
                categories,
                t
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
    RESET
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

            setFiltersOpen(
                false
            );

        };


    /*
    ========================================================
    CART MESSAGE
    ========================================================
    */

    const showProductNotification = (
        product
    ) => {

        setNotification(

            product.inStock

                ? t(
                    "addedToCart",
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


    /*
    ========================================================
    PAGINATION
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


    const PreviousIcon =
        isArabic
            ? ChevronRight
            : ChevronLeft;


    const NextIcon =
        isArabic
            ? ChevronLeft
            : ChevronRight;


    /*
    ========================================================
    PAGE
    ========================================================
    */

    return (

        <main className="products-page">


            <section className="products-hero">

                <div className="container">

                    <motion.div

                        initial={{
                            opacity: 0,
                            y: 20
                        }}

                        animate={{
                            opacity: 1,
                            y: 0
                        }}

                        transition={{
                            duration: 0.5
                        }}

                    >

                        <span className="section-label">

                            {
                                t(
                                    "nabilPharmacy"
                                )
                            }

                        </span>


                        <h1>

                            {
                                t(
                                    "pharmacyEssentials"
                                )
                            }

                            <span>

                                {" "}

                                {
                                    t(
                                        "forEverydayCare"
                                    )
                                }

                            </span>

                        </h1>


                        <p>

                            {
                                t(
                                    "productsHeroDescription"
                                )
                            }

                        </p>

                    </motion.div>

                </div>

            </section>


            <section className="products-content">

                <div className="container">


                    <div className="products-toolbar">

                        <div className="products-search">

                            <Search
                                size={19}
                            />


                            <input

                                type="search"

                                placeholder={
                                    t(
                                        "searchProductsPlaceholder"
                                    )
                                }

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

                                        onClick={() =>
                                            setSearchTerm(
                                                ""
                                            )
                                        }

                                        aria-label={
                                            t(
                                                "clearSearch"
                                            )
                                        }

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

                            onClick={() =>
                                setFiltersOpen(
                                    current =>
                                        !current
                                )
                            }

                        >

                            <SlidersHorizontal
                                size={18}
                            />

                            {
                                t(
                                    "filters"
                                )
                            }

                        </button>

                    </div>


                    <div className="products-layout">


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

                                        {
                                            t(
                                                "refine"
                                            )
                                        }

                                    </span>


                                    <h2>

                                        {
                                            t(
                                                "filters"
                                            )
                                        }

                                    </h2>

                                </div>


                                <button
                                    type="button"
                                    onClick={
                                        resetFilters
                                    }
                                >

                                    {
                                        t(
                                            "reset"
                                        )
                                    }

                                </button>

                            </div>


                            <div className="products-filter-group">

                                <label>

                                    {
                                        t(
                                            "category"
                                        )
                                    }

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

                                        onClick={() =>
                                            setSelectedCategory(
                                                "All"
                                            )
                                        }

                                    >

                                        {
                                            t(
                                                "all"
                                            )
                                        }

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

                                                    onClick={() =>
                                                        setSelectedCategory(
                                                            category.id
                                                        )
                                                    }

                                                >

                                                    {
                                                        localize(
                                                            category,
                                                            "name",
                                                            category.name
                                                        )
                                                    }

                                                </button>

                                            )
                                        )
                                    }

                                </div>

                            </div>


                            <div className="products-filter-group">

                                <label htmlFor="brand-filter">

                                    {
                                        t(
                                            "brand"
                                        )
                                    }

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

                                        {
                                            t(
                                                "all"
                                            )
                                        }

                                    </option>


                                    {
                                        brands.map(
                                            brand => (

                                                <option
                                                    key={
                                                        brand.value
                                                    }
                                                    value={
                                                        brand.value
                                                    }
                                                >

                                                    {
                                                        isArabic
                                                            ? brand.labelAr
                                                            : brand.value
                                                    }

                                                </option>

                                            )
                                        )
                                    }

                                </select>

                            </div>


                            <div className="products-filter-group">

                                <div className="products-price-heading">

                                    <label htmlFor="price-filter">

                                        {
                                            t(
                                                "maximumPrice"
                                            )
                                        }

                                    </label>


                                    <strong>

                                        {
                                            formatMoney(
                                                maxPrice
                                            )
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

                                    {
                                        t(
                                            "inStockOnly"
                                        )
                                    }

                                </span>

                            </label>


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

                                    {
                                        t(
                                            "offersOnly"
                                        )
                                    }

                                </span>

                            </label>

                        </aside>


                        <div className="products-results">


                            <div className="products-results-header">

                                <div>

                                    <span>

                                        {
                                            t(
                                                "showing"
                                            )
                                        }

                                    </span>


                                    <strong>

                                        {
                                            loading
                                                ? t(
                                                    "loading"
                                                )
                                                : totalCount ===
                                                    0
                                                    ? t(
                                                        "zeroProducts"
                                                    )
                                                    : t(
                                                        "productRange",
                                                        {
                                                            first:
                                                                formatNumber(
                                                                    firstVisibleProduct
                                                                ),

                                                            last:
                                                                formatNumber(
                                                                    lastVisibleProduct
                                                                ),

                                                            total:
                                                                formatNumber(
                                                                    totalCount
                                                                )
                                                        }
                                                    )
                                        }

                                    </strong>

                                </div>


                                <select

                                    aria-label={
                                        t(
                                            "sortProducts"
                                        )
                                    }

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

                                        {
                                            t(
                                                "recommended"
                                            )
                                        }

                                    </option>


                                    <option value="newest">

                                        {
                                            t(
                                                "newest"
                                            )
                                        }

                                    </option>


                                    <option value="price-low">

                                        {
                                            t(
                                                "priceLowHigh"
                                            )
                                        }

                                    </option>


                                    <option value="price-high">

                                        {
                                            t(
                                                "priceHighLow"
                                            )
                                        }

                                    </option>


                                    <option value="name">

                                        {
                                            t(
                                                "nameAZ"
                                            )
                                        }

                                    </option>


                                    <option value="discount">

                                        {
                                            t(
                                                "biggestDiscount"
                                            )
                                        }

                                    </option>

                                </select>

                            </div>


                            {
                                loading && (

                                    <LogoLoader
                                        text={
                                            t(
                                                "loadingProducts"
                                            )
                                        }
                                    />

                                )
                            }


                            {
                                !loading &&
                                error && (

                                    <div className="products-status products-error">

                                        <PackageSearch
                                            size={40}
                                        />


                                        <h3>

                                            {
                                                t(
                                                    "productsUnavailable"
                                                )
                                            }

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

                                            {
                                                t(
                                                    "tryAgain"
                                                )
                                            }

                                        </button>

                                    </div>

                                )
                            }


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
                                                                    opacity: 0,
                                                                    y: 20,
                                                                    scale: 0.98
                                                                }}

                                                                animate={{
                                                                    opacity: 1,
                                                                    y: 0,
                                                                    scale: 1
                                                                }}

                                                                exit={{
                                                                    opacity: 0,
                                                                    scale: 0.96
                                                                }}

                                                                transition={{
                                                                    duration: 0.25
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


                                        {
                                            totalPages >
                                            1 && (

                                                <nav

                                                    aria-label={
                                                        t(
                                                            "productPages"
                                                        )
                                                    }

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

                                                        onClick={() =>
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

                                                        <PreviousIcon
                                                            size={17}
                                                        />

                                                        {
                                                            t(
                                                                "previous"
                                                            )
                                                        }

                                                    </button>


                                                    {
                                                        visiblePages.map(
                                                            pageNumber => (

                                                                <button

                                                                    type="button"

                                                                    key={
                                                                        pageNumber
                                                                    }

                                                                    onClick={() =>
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
                                                                        formatNumber(
                                                                            pageNumber
                                                                        )
                                                                    }

                                                                </button>

                                                            )
                                                        )
                                                    }


                                                    <button

                                                        type="button"

                                                        onClick={() =>
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

                                                        {
                                                            t(
                                                                "next"
                                                            )
                                                        }

                                                        <NextIcon
                                                            size={17}
                                                        />

                                                    </button>

                                                </nav>

                                            )
                                        }

                                    </>

                                )
                            }


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

                                            {
                                                t(
                                                    "noProductsFound"
                                                )
                                            }

                                        </h3>


                                        <p>

                                            {
                                                t(
                                                    "changeSearchFilters"
                                                )
                                            }

                                        </p>


                                        <button

                                            type="button"

                                            className="primary-button"

                                            onClick={
                                                resetFilters
                                            }

                                        >

                                            {
                                                t(
                                                    "resetFilters"
                                                )
                                            }

                                        </button>

                                    </div>

                                )
                            }

                        </div>

                    </div>

                </div>

            </section>


            <AnimatePresence>

                {
                    notification && (

                        <motion.div

                            className="products-toast"

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