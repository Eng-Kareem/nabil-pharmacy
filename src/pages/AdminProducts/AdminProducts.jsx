import {
    Check,
    Edit3,
    ImagePlus,
    Package,
    Plus,
    RefreshCw,
    Search,
    ShieldCheck,
    Upload,
    X
} from "lucide-react";

import {
    AnimatePresence,
    motion
} from "framer-motion";

import {
    useEffect,
    useMemo,
    useState
} from "react";

import {
    supabase
} from "../../lib/supabase.js";

import {
    useLanguage
} from "../../context/LanguageContext.jsx";

import adminProductsTranslations
    from "../../i18n/adminProductsTranslations.js";

import "./AdminProducts.css";
import "./AdminProductsRTL.css";


const EMPTY_FORM = {

    id: null,

    name: "",
    name_ar: "",

    slug: "",

    brand: "",
    brand_ar: "",

    description: "",
    description_ar: "",

    category_id: "",

    price: "",
    old_price: "",

    badge_text: "",
    badge_text_ar: "",

    image_url: "",

    prescription_required: false,

    featured: false,

    is_active: true

};


const CATEGORY_AR_FALLBACKS = {

    "Baby Care":
        "العناية بالأطفال",

    "Health Devices":
        "الأجهزة الطبية",

    "Medicine":
        "الأدوية",

    "Personal Care":
        "العناية الشخصية",

    "Vitamins":
        "الفيتامينات"

};


function AdminProducts() {

    const {
        language,
        isArabic
    } =
        useLanguage();


    const text =
        adminProductsTranslations[
            language
        ] ||
        adminProductsTranslations.en;


    const [
        products,
        setProducts
    ] =
        useState([]);


    const [
        categories,
        setCategories
    ] =
        useState([]);


    const [
        loading,
        setLoading
    ] =
        useState(true);


    const [
        saving,
        setSaving
    ] =
        useState(false);


    const [
        uploadingImage,
        setUploadingImage
    ] =
        useState(false);


    const [
        error,
        setError
    ] =
        useState("");


    const [
        success,
        setSuccess
    ] =
        useState("");


    const [
        searchTerm,
        setSearchTerm
    ] =
        useState("");


    const [
        modalOpen,
        setModalOpen
    ] =
        useState(false);


    const [
        formData,
        setFormData
    ] =
        useState({
            ...EMPTY_FORM
        });


    const [
        imageFile,
        setImageFile
    ] =
        useState(null);


    const [
        imagePreview,
        setImagePreview
    ] =
        useState("");


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
    LOCALIZED PRODUCT
    ========================================================
    */

    const displayProductName = (
        product
    ) => {

        if (
            isArabic &&
            product?.name_ar
        ) {

            return product.name_ar;

        }


        return (
            product?.name ||
            "-"
        );

    };


    const displayProductBrand = (
        product
    ) => {

        if (
            isArabic &&
            product?.brand_ar
        ) {

            return product.brand_ar;

        }


        return (
            product?.brand ||
            text.noBrand
        );

    };


    const displayCategory = (
        category
    ) => {

        if (
            !category
        ) {

            return text.uncategorized;

        }


        if (
            !isArabic
        ) {

            return (
                category.name ||
                text.uncategorized
            );

        }


        return (
            category.name_ar ||
            CATEGORY_AR_FALLBACKS[
                category.name
            ] ||
            category.name ||
            text.uncategorized
        );

    };


    /*
    ========================================================
    PRICE
    ========================================================
    */

    const formatPrice = (
        value
    ) => {

        const formatted =
            Number(
                value ||
                0
            ).toLocaleString(
                isArabic
                    ? "ar-EG"
                    : "en-US"
            );


        return isArabic
            ? `${formatted} ج.م`
            : `EGP ${formatted}`;

    };


    /*
    ========================================================
    LOAD PRODUCTS + CATEGORIES
    ========================================================
    */

    const loadData =
        async () => {

            setLoading(
                true
            );


            setError(
                ""
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
                                    name_ar
                                )
                            `)
                            .order(
                                "created_at",
                                {
                                    ascending:
                                        false
                                }
                            ),


                        supabase
                            .from(
                                "categories"
                            )
                            .select(`
                                id,
                                name,
                                name_ar,
                                slug
                            `)
                            .eq(
                                "is_active",
                                true
                            )
                            .order(
                                "name"
                            )

                    ]);


                if (
                    productsResponse.error
                ) {

                    throw productsResponse.error;

                }


                if (
                    categoriesResponse.error
                ) {

                    throw categoriesResponse.error;

                }


                setProducts(
                    productsResponse.data ||
                    []
                );


                setCategories(
                    categoriesResponse.data ||
                    []
                );

            } catch (
                loadError
            ) {

                console.error(
                    "Admin products load error:",
                    loadError
                );


                setError(
                    isArabic
                        ? text.loadError
                        : (
                            loadError?.message ||
                            text.loadError
                        )
                );

            } finally {

                setLoading(
                    false
                );

            }

        };


    useEffect(
        () => {

            loadData();

        },
        []
    );


    /*
    ========================================================
    FILTER
    ========================================================
    */

    const filteredProducts =
        useMemo(
            () => {

                const term =
                    searchTerm
                        .trim()
                        .toLowerCase();


                if (
                    !term
                ) {

                    return products;

                }


                return products.filter(
                    product =>

                        [

                            product.name,

                            product.name_ar,

                            product.brand,

                            product.brand_ar,

                            product.categories
                                ?.name,

                            product.categories
                                ?.name_ar

                        ]
                            .filter(
                                Boolean
                            )
                            .join(
                                " "
                            )
                            .toLowerCase()
                            .includes(
                                term
                            )
                );

            },
            [
                products,
                searchTerm
            ]
        );


    /*
    ========================================================
    CREATE SLUG
    ========================================================
    */

    const createSlug = (
        value
    ) => {

        return String(
            value ||
            ""
        )
            .toLowerCase()
            .trim()
            .replace(
                /[^a-z0-9\s-]/g,
                ""
            )
            .replace(
                /\s+/g,
                "-"
            )
            .replace(
                /-+/g,
                "-"
            );

    };


    /*
    ========================================================
    FORM CHANGE
    ========================================================
    */

    const handleChange = (
        event
    ) => {

        const {
            name,
            value,
            checked,
            type
        } =
            event.target;


        setFormData(
            current => {

                const updated = {

                    ...current,

                    [name]:
                        type ===
                        "checkbox"
                            ? checked
                            : value

                };


                if (
                    name ===
                        "name" &&
                    !current.id
                ) {

                    updated.slug =
                        createSlug(
                            value
                        );

                }


                return updated;

            }
        );

    };


    /*
    ========================================================
    IMAGE PREVIEW CLEANUP
    ========================================================
    */

    const revokeLocalPreview = (
        preview
    ) => {

        if (
            preview &&
            preview.startsWith(
                "blob:"
            )
        ) {

            URL.revokeObjectURL(
                preview
            );

        }

    };


    /*
    ========================================================
    IMAGE CHANGE
    ========================================================
    */

    const handleImageChange = (
        event
    ) => {

        setError(
            ""
        );


        const file =
            event.target
                .files?.[0];


        if (
            !file
        ) {

            return;

        }


        const allowedTypes = [

            "image/jpeg",

            "image/png",

            "image/webp"

        ];


        if (
            !allowedTypes.includes(
                file.type
            )
        ) {

            event.target.value =
                "";


            setError(
                text.imageTypeError
            );


            return;

        }


        const maxFileSize =
            5 *
            1024 *
            1024;


        if (
            file.size >
            maxFileSize
        ) {

            event.target.value =
                "";


            setError(
                text.imageSizeError
            );


            return;

        }


        revokeLocalPreview(
            imagePreview
        );


        const preview =
            URL.createObjectURL(
                file
            );


        setImageFile(
            file
        );


        setImagePreview(
            preview
        );

    };


    /*
    ========================================================
    REMOVE IMAGE
    ========================================================
    */

    const removeSelectedImage =
        () => {

            revokeLocalPreview(
                imagePreview
            );


            setImageFile(
                null
            );


            setImagePreview(
                ""
            );


            setFormData(
                current => ({

                    ...current,

                    image_url:
                        ""

                })
            );

        };


    /*
    ========================================================
    UPLOAD PRODUCT IMAGE
    ========================================================
    */

    const uploadProductImage =
        async () => {

            if (
                !imageFile
            ) {

                return (
                    formData.image_url ||
                    null
                );

            }


            setUploadingImage(
                true
            );


            try {

                const extension =
                    imageFile.name
                        .split(
                            "."
                        )
                        .pop()
                        ?.toLowerCase() ||
                    "jpg";


                const uniqueId =
                    typeof crypto !==
                        "undefined" &&
                    crypto.randomUUID
                        ? crypto.randomUUID()
                        : `${Date.now()}-${Math.random()
                            .toString(36)
                            .slice(2)}`;


                const fileName =
                    `${uniqueId}.${extension}`;


                const filePath =
                    `products/${fileName}`;


                const {
                    error:
                        uploadError
                } =
                    await supabase
                        .storage
                        .from(
                            "product-images"
                        )
                        .upload(
                            filePath,
                            imageFile,
                            {

                                cacheControl:
                                    "3600",

                                upsert:
                                    false,

                                contentType:
                                    imageFile.type

                            }
                        );


                if (
                    uploadError
                ) {

                    throw uploadError;

                }


                const {
                    data
                } =
                    supabase
                        .storage
                        .from(
                            "product-images"
                        )
                        .getPublicUrl(
                            filePath
                        );


                if (
                    !data?.publicUrl
                ) {

                    throw new Error(
                        text.imageUrlError
                    );

                }


                return data.publicUrl;

            } finally {

                setUploadingImage(
                    false
                );

            }

        };


    /*
    ========================================================
    ADD MODAL
    ========================================================
    */

    const openAddModal =
        () => {

            revokeLocalPreview(
                imagePreview
            );


            setFormData({
                ...EMPTY_FORM
            });


            setImageFile(
                null
            );


            setImagePreview(
                ""
            );


            setError(
                ""
            );


            setSuccess(
                ""
            );


            setModalOpen(
                true
            );

        };


    /*
    ========================================================
    EDIT MODAL
    ========================================================
    */

    const openEditModal = (
        product
    ) => {

        revokeLocalPreview(
            imagePreview
        );


        setFormData({

            id:
                product.id,

            name:
                product.name ||
                "",

            name_ar:
                product.name_ar ||
                "",

            slug:
                product.slug ||
                "",

            brand:
                product.brand ||
                "",

            brand_ar:
                product.brand_ar ||
                "",

            description:
                product.description ||
                "",

            description_ar:
                product.description_ar ||
                "",

            category_id:
                product.category_id ||
                "",

            price:
                product.price ??
                "",

            old_price:
                product.old_price ??
                "",

            badge_text:
                product.badge_text ||
                "",

            badge_text_ar:
                product.badge_text_ar ||
                "",

            image_url:
                product.image_url ||
                "",

            prescription_required:
                Boolean(
                    product.prescription_required
                ),

            featured:
                Boolean(
                    product.featured
                ),

            is_active:
                Boolean(
                    product.is_active
                )

        });


        setImageFile(
            null
        );


        setImagePreview(
            product.image_url ||
            ""
        );


        setError(
            ""
        );


        setSuccess(
            ""
        );


        setModalOpen(
            true
        );

    };


    /*
    ========================================================
    CLOSE MODAL
    ========================================================
    */

    const closeModal =
        () => {

            if (
                saving ||
                uploadingImage
            ) {

                return;

            }


            revokeLocalPreview(
                imagePreview
            );


            setModalOpen(
                false
            );


            setImageFile(
                null
            );


            setImagePreview(
                ""
            );


            setFormData({
                ...EMPTY_FORM
            });


            setError(
                ""
            );

        };


    /*
    ========================================================
    SAVE PRODUCT
    ========================================================
    */

    const handleSave =
        async (
            event
        ) => {

            event.preventDefault();


            if (
                saving ||
                uploadingImage
            ) {

                return;

            }


            setSaving(
                true
            );


            setError(
                ""
            );


            setSuccess(
                ""
            );


            try {

                const price =
                    Number(
                        formData.price
                    );


                const oldPrice =
                    formData.old_price ===
                        ""
                        ? null
                        : Number(
                            formData.old_price
                        );


                if (
                    !formData.name
                        .trim() ||
                    !formData.slug
                        .trim() ||
                    !formData.category_id
                ) {

                    throw new Error(
                        text.requiredFields
                    );

                }


                if (
                    !Number.isFinite(
                        price
                    ) ||
                    price <
                        0
                ) {

                    throw new Error(
                        text.validPrice
                    );

                }


                if (
                    oldPrice !==
                        null &&
                    (
                        !Number.isFinite(
                            oldPrice
                        ) ||
                        oldPrice <
                            0
                    )
                ) {

                    throw new Error(
                        text.validOldPrice
                    );

                }


                const imageUrl =
                    await uploadProductImage();


                const payload = {

                    name:
                        formData.name
                            .trim(),

                    name_ar:
                        formData.name_ar
                            .trim() ||
                        null,

                    slug:
                        formData.slug
                            .trim(),

                    brand:
                        formData.brand
                            .trim() ||
                        null,

                    brand_ar:
                        formData.brand_ar
                            .trim() ||
                        null,

                    description:
                        formData.description
                            .trim() ||
                        null,

                    description_ar:
                        formData.description_ar
                            .trim() ||
                        null,

                    category_id:
                        formData.category_id,

                    price,

                    old_price:
                        oldPrice,

                    badge_text:
                        formData.badge_text
                            .trim() ||
                        null,

                    badge_text_ar:
                        formData.badge_text_ar
                            .trim() ||
                        null,

                    image_url:
                        imageUrl,

                    prescription_required:
                        formData.prescription_required,

                    featured:
                        formData.featured,

                    is_active:
                        formData.is_active,

                    updated_at:
                        new Date()
                            .toISOString()

                };


                /*
                ============================================
                UPDATE
                ============================================
                */

                if (
                    formData.id
                ) {

                    const {
                        error:
                            updateError
                    } =
                        await supabase
                            .from(
                                "products"
                            )
                            .update(
                                payload
                            )
                            .eq(
                                "id",
                                formData.id
                            );


                    if (
                        updateError
                    ) {

                        throw updateError;

                    }


                    setSuccess(
                        text.productUpdated
                    );

                }


                /*
                ============================================
                INSERT
                ============================================
                */

                else {

                    const {
                        error:
                            insertError
                    } =
                        await supabase
                            .from(
                                "products"
                            )
                            .insert(
                                payload
                            );


                    if (
                        insertError
                    ) {

                        throw insertError;

                    }


                    setSuccess(
                        text.productCreated
                    );

                }


                revokeLocalPreview(
                    imagePreview
                );


                setImageFile(
                    null
                );


                setImagePreview(
                    ""
                );


                await loadData();


                setModalOpen(
                    false
                );


                setFormData({
                    ...EMPTY_FORM
                });

            } catch (
                saveError
            ) {

                console.error(
                    "Save product error:",
                    saveError
                );


                if (
                    saveError?.code ===
                    "23505"
                ) {

                    setError(
                        text.duplicateSlug
                    );

                } else {

                    setError(
                        isArabic
                            ? (
                                saveError?.message?.includes(
                                    "column"
                                )
                                    ? text.saveError
                                    : (
                                        saveError?.message ||
                                        text.saveError
                                    )
                            )
                            : (
                                saveError?.message ||
                                text.saveError
                            )
                    );

                }

            } finally {

                setSaving(
                    false
                );


                setUploadingImage(
                    false
                );

            }

        };


    /*
    ========================================================
    ACTIVATE / DEACTIVATE
    ========================================================
    */

    const toggleProductStatus =
        async (
            product
        ) => {

            setError(
                ""
            );


            setSuccess(
                ""
            );


            try {

                const {
                    error:
                        statusError
                } =
                    await supabase
                        .from(
                            "products"
                        )
                        .update({

                            is_active:
                                !product.is_active,

                            updated_at:
                                new Date()
                                    .toISOString()

                        })
                        .eq(
                            "id",
                            product.id
                        );


                if (
                    statusError
                ) {

                    throw statusError;

                }


                const name =
                    displayProductName(
                        product
                    );


                setSuccess(
                    replaceText(
                        product.is_active
                            ? text.productDeactivated
                            : text.productActivated,
                        {
                            name
                        }
                    )
                );


                await loadData();

            } catch (
                statusError
            ) {

                console.error(
                    "Product status error:",
                    statusError
                );


                setError(
                    isArabic
                        ? text.statusError
                        : (
                            statusError?.message ||
                            text.statusError
                        )
                );

            }

        };


    /*
    ========================================================
    PAGE
    ========================================================
    */

    return (

        <main
            className="admin-products-page"
            dir={
                isArabic
                    ? "rtl"
                    : "ltr"
            }
        >

            <div className="container">


                {/* =========================================
                    HEADER
                ========================================= */}

                <header className="admin-products-header">

                    <div>

                        <span>

                            {
                                text.productManagement
                            }

                        </span>


                        <h1>

                            {
                                text.pharmacyProducts
                            }

                        </h1>


                        <p>

                            {
                                text.pageDescription
                            }

                        </p>

                    </div>


                    <button
                        type="button"
                        className="admin-products-add"
                        onClick={
                            openAddModal
                        }
                    >

                        <Plus
                            size={18}
                        />

                        {
                            text.addProduct
                        }

                    </button>

                </header>


                {/* =========================================
                    STATUS MESSAGES
                ========================================= */}

                {
                    success && (

                        <div className="admin-products-success">

                            <Check
                                size={17}
                            />

                            {
                                success
                            }

                        </div>

                    )
                }


                {
                    error &&
                    !modalOpen && (

                        <div className="admin-products-error">

                            {
                                error
                            }

                        </div>

                    )
                }


                {/* =========================================
                    TOOLBAR
                ========================================= */}

                <div className="admin-products-toolbar">

                    <div className="admin-products-search">

                        <Search
                            size={18}
                        />


                        <input
                            type="search"
                            placeholder={
                                text.searchPlaceholder
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

                    </div>


                    <button
                        type="button"
                        className="admin-products-refresh"
                        onClick={
                            loadData
                        }
                    >

                        <RefreshCw
                            size={17}
                        />

                        {
                            text.refresh
                        }

                    </button>

                </div>


                {/* =========================================
                    TABLE
                ========================================= */}

                {
                    loading
                        ? (

                            <div className="admin-products-loading">

                                <RefreshCw
                                    size={34}
                                    className="admin-products-spinner"
                                />

                                {
                                    text.loadingProducts
                                }

                            </div>

                        )
                        : (

                            <div className="admin-products-table-wrapper">

                                <table className="admin-products-table">

                                    <thead>

                                        <tr>

                                            <th>
                                                {text.product}
                                            </th>

                                            <th>
                                                {text.category}
                                            </th>

                                            <th>
                                                {text.price}
                                            </th>

                                            <th>
                                                {text.featured}
                                            </th>

                                            <th>
                                                {text.status}
                                            </th>

                                            <th>
                                                {text.actions}
                                            </th>

                                        </tr>

                                    </thead>


                                    <tbody>

                                        {
                                            filteredProducts.map(
                                                product => (

                                                    <tr
                                                        key={
                                                            product.id
                                                        }
                                                    >

                                                        <td>

                                                            <div className="admin-product-name">

                                                                <div className="admin-product-thumbnail">

                                                                    {
                                                                        product.image_url
                                                                            ? (

                                                                                <img
                                                                                    src={
                                                                                        product.image_url
                                                                                    }
                                                                                    alt={
                                                                                        displayProductName(
                                                                                            product
                                                                                        )
                                                                                    }
                                                                                    loading="lazy"
                                                                                />

                                                                            )
                                                                            : (

                                                                                <Package
                                                                                    size={21}
                                                                                />

                                                                            )
                                                                    }

                                                                </div>


                                                                <div className="admin-product-name-text">

                                                                    <strong>

                                                                        {
                                                                            displayProductName(
                                                                                product
                                                                            )
                                                                        }

                                                                    </strong>


                                                                    <span>

                                                                        {
                                                                            displayProductBrand(
                                                                                product
                                                                            )
                                                                        }

                                                                    </span>

                                                                </div>

                                                            </div>

                                                        </td>


                                                        <td>

                                                            {
                                                                displayCategory(
                                                                    product.categories
                                                                )
                                                            }

                                                        </td>


                                                        <td>

                                                            <strong>

                                                                {
                                                                    formatPrice(
                                                                        product.price
                                                                    )
                                                                }

                                                            </strong>

                                                        </td>


                                                        <td>

                                                            <span
                                                                className={
                                                                    product.featured
                                                                        ? "admin-product-featured yes"
                                                                        : "admin-product-featured"
                                                                }
                                                            >

                                                                {
                                                                    product.featured
                                                                        ? text.yesFeatured
                                                                        : text.no
                                                                }

                                                            </span>

                                                        </td>


                                                        <td>

                                                            <span
                                                                className={
                                                                    product.is_active
                                                                        ? "admin-product-status active"
                                                                        : "admin-product-status inactive"
                                                                }
                                                            >

                                                                {
                                                                    product.is_active
                                                                        ? text.active
                                                                        : text.inactive
                                                                }

                                                            </span>

                                                        </td>


                                                        <td>

                                                            <div className="admin-product-actions">

                                                                <button
                                                                    type="button"
                                                                    onClick={() =>
                                                                        openEditModal(
                                                                            product
                                                                        )
                                                                    }
                                                                >

                                                                    <Edit3
                                                                        size={15}
                                                                    />

                                                                    {
                                                                        text.edit
                                                                    }

                                                                </button>


                                                                <button
                                                                    type="button"
                                                                    className={
                                                                        product.is_active
                                                                            ? "deactivate"
                                                                            : "activate"
                                                                    }
                                                                    onClick={() =>
                                                                        toggleProductStatus(
                                                                            product
                                                                        )
                                                                    }
                                                                >

                                                                    {
                                                                        product.is_active
                                                                            ? text.deactivate
                                                                            : text.activate
                                                                    }

                                                                </button>

                                                            </div>

                                                        </td>

                                                    </tr>

                                                )
                                            )
                                        }

                                    </tbody>

                                </table>


                                {
                                    filteredProducts.length ===
                                    0 && (

                                        <div className="admin-products-empty">

                                            {
                                                text.noProducts
                                            }

                                        </div>

                                    )
                                }

                            </div>

                        )
                }

            </div>


            {/* =============================================
                PRODUCT MODAL
            ============================================= */}

            <AnimatePresence>

                {
                    modalOpen && (

                        <motion.div

                            className="admin-product-modal-backdrop"

                            initial={{
                                opacity: 0
                            }}

                            animate={{
                                opacity: 1
                            }}

                            exit={{
                                opacity: 0
                            }}

                            onMouseDown={
                                event => {

                                    if (
                                        event.target ===
                                        event.currentTarget
                                    ) {

                                        closeModal();

                                    }

                                }
                            }

                        >

                            <motion.div

                                className="admin-product-modal"

                                initial={{
                                    opacity: 0,
                                    y: 25,
                                    scale: 0.98
                                }}

                                animate={{
                                    opacity: 1,
                                    y: 0,
                                    scale: 1
                                }}

                                exit={{
                                    opacity: 0,
                                    y: 15,
                                    scale: 0.98
                                }}

                            >

                                {/* HEADER */}

                                <div className="admin-product-modal-header">

                                    <div>

                                        <span>

                                            {
                                                formData.id
                                                    ? text.editProduct
                                                    : text.newProduct
                                            }

                                        </span>


                                        <h2>

                                            {
                                                formData.id
                                                    ? (
                                                        isArabic
                                                            ? (
                                                                formData.name_ar ||
                                                                formData.name
                                                            )
                                                            : formData.name
                                                    )
                                                    : text.addPharmacyProduct
                                            }

                                        </h2>

                                    </div>


                                    <button
                                        type="button"
                                        onClick={
                                            closeModal
                                        }
                                        aria-label={
                                            text.close
                                        }
                                    >

                                        <X
                                            size={20}
                                        />

                                    </button>

                                </div>


                                <form
                                    onSubmit={
                                        handleSave
                                    }
                                >

                                    <div className="admin-product-form-grid">


                                        {/* =================================
                                            IMAGE
                                        ================================= */}

                                        <div className="admin-product-field admin-product-field-full">

                                            <label>

                                                {
                                                    text.productPhoto
                                                }

                                            </label>


                                            <div className="admin-product-image-upload">

                                                <div className="admin-product-image-preview">

                                                    {
                                                        imagePreview
                                                            ? (

                                                                <img
                                                                    src={
                                                                        imagePreview
                                                                    }
                                                                    alt={
                                                                        text.productPreview
                                                                    }
                                                                />

                                                            )
                                                            : (

                                                                <div className="admin-product-image-placeholder">

                                                                    <ImagePlus
                                                                        size={34}
                                                                    />


                                                                    <strong>

                                                                        {
                                                                            text.noProductPhoto
                                                                        }

                                                                    </strong>


                                                                    <span>

                                                                        {
                                                                            text.chooseImageBelow
                                                                        }

                                                                    </span>

                                                                </div>

                                                            )
                                                    }

                                                </div>


                                                <div className="admin-product-image-controls">

                                                    <label className="admin-product-upload-button">

                                                        <Upload
                                                            size={17}
                                                        />

                                                        {
                                                            text.chooseProductPhoto
                                                        }


                                                        <input
                                                            type="file"
                                                            accept="image/jpeg,image/png,image/webp"
                                                            onChange={
                                                                handleImageChange
                                                            }
                                                        />

                                                    </label>


                                                    <p>

                                                        {
                                                            text.imageRequirements
                                                        }

                                                    </p>


                                                    {
                                                        imagePreview && (

                                                            <button
                                                                type="button"
                                                                className="admin-product-remove-image"
                                                                onClick={
                                                                    removeSelectedImage
                                                                }
                                                            >

                                                                <X
                                                                    size={15}
                                                                />

                                                                {
                                                                    text.removePhoto
                                                                }

                                                            </button>

                                                        )
                                                    }

                                                </div>

                                            </div>

                                        </div>


                                        {/* =================================
                                            ENGLISH SECTION TITLE
                                        ================================= */}

                                        <div className="admin-product-language-heading admin-product-field-full">

                                            <strong>

                                                {
                                                    text.englishContent
                                                }

                                            </strong>


                                            <span>

                                                {
                                                    text.englishContentHelp
                                                }

                                            </span>

                                        </div>


                                        {/* ENGLISH NAME */}

                                        <div className="admin-product-field">

                                            <label>

                                                {
                                                    text.productNameEnglish
                                                }

                                            </label>


                                            <input
                                                name="name"
                                                value={
                                                    formData.name
                                                }
                                                onChange={
                                                    handleChange
                                                }
                                                placeholder={
                                                    text.productNameEnglishPlaceholder
                                                }
                                                dir="ltr"
                                                required
                                            />

                                        </div>


                                        {/* SLUG */}

                                        <div className="admin-product-field">

                                            <label>

                                                {
                                                    text.slug
                                                }

                                            </label>


                                            <input
                                                name="slug"
                                                value={
                                                    formData.slug
                                                }
                                                onChange={
                                                    handleChange
                                                }
                                                placeholder={
                                                    text.slugPlaceholder
                                                }
                                                dir="ltr"
                                                required
                                            />

                                        </div>


                                        {/* ENGLISH BRAND */}

                                        <div className="admin-product-field admin-product-field-full">

                                            <label>

                                                {
                                                    text.brandEnglish
                                                }

                                            </label>


                                            <input
                                                name="brand"
                                                value={
                                                    formData.brand
                                                }
                                                onChange={
                                                    handleChange
                                                }
                                                placeholder={
                                                    text.brandEnglishPlaceholder
                                                }
                                                dir="ltr"
                                            />

                                        </div>


                                        {/* ENGLISH BADGE */}

                                        <div className="admin-product-field admin-product-field-full">

                                            <label>

                                                {
                                                    text.badgeEnglish
                                                }

                                            </label>


                                            <input
                                                name="badge_text"
                                                value={
                                                    formData.badge_text
                                                }
                                                onChange={
                                                    handleChange
                                                }
                                                placeholder={
                                                    text.badgeEnglishPlaceholder
                                                }
                                                dir="ltr"
                                            />

                                        </div>


                                        {/* ENGLISH DESCRIPTION */}

                                        <div className="admin-product-field admin-product-field-full">

                                            <label>

                                                {
                                                    text.descriptionEnglish
                                                }

                                            </label>


                                            <textarea
                                                name="description"
                                                rows="5"
                                                value={
                                                    formData.description
                                                }
                                                onChange={
                                                    handleChange
                                                }
                                                placeholder={
                                                    text.descriptionEnglishPlaceholder
                                                }
                                                dir="ltr"
                                            />

                                        </div>


                                        {/* =================================
                                            ARABIC SECTION
                                        ================================= */}

                                        <div className="admin-product-language-heading arabic admin-product-field-full">

                                            <strong>

                                                {
                                                    text.arabicContent
                                                }

                                            </strong>


                                            <span>

                                                {
                                                    text.arabicContentHelp
                                                }

                                            </span>

                                        </div>


                                        {/* ARABIC NAME */}

                                        <div className="admin-product-field admin-product-field-full">

                                            <label>

                                                {
                                                    text.productNameArabic
                                                }

                                            </label>


                                            <input
                                                name="name_ar"
                                                value={
                                                    formData.name_ar
                                                }
                                                onChange={
                                                    handleChange
                                                }
                                                placeholder={
                                                    text.productNameArabicPlaceholder
                                                }
                                                dir="rtl"
                                            />

                                        </div>


                                        {/* ARABIC BRAND */}

                                        <div className="admin-product-field admin-product-field-full">

                                            <label>

                                                {
                                                    text.brandArabic
                                                }

                                            </label>


                                            <input
                                                name="brand_ar"
                                                value={
                                                    formData.brand_ar
                                                }
                                                onChange={
                                                    handleChange
                                                }
                                                placeholder={
                                                    text.brandArabicPlaceholder
                                                }
                                                dir="rtl"
                                            />

                                        </div>


                                        {/* ARABIC BADGE */}

                                        <div className="admin-product-field admin-product-field-full">

                                            <label>

                                                {
                                                    text.badgeArabic
                                                }

                                            </label>


                                            <input
                                                name="badge_text_ar"
                                                value={
                                                    formData.badge_text_ar
                                                }
                                                onChange={
                                                    handleChange
                                                }
                                                placeholder={
                                                    text.badgeArabicPlaceholder
                                                }
                                                dir="rtl"
                                            />

                                        </div>


                                        {/* ARABIC DESCRIPTION */}

                                        <div className="admin-product-field admin-product-field-full">

                                            <label>

                                                {
                                                    text.descriptionArabic
                                                }

                                            </label>


                                            <textarea
                                                name="description_ar"
                                                rows="5"
                                                value={
                                                    formData.description_ar
                                                }
                                                onChange={
                                                    handleChange
                                                }
                                                placeholder={
                                                    text.descriptionArabicPlaceholder
                                                }
                                                dir="rtl"
                                            />

                                        </div>


                                        {/* =================================
                                            CATEGORY
                                        ================================= */}

                                        <div className="admin-product-field">

                                            <label>

                                                {
                                                    text.category
                                                }

                                            </label>


                                            <select
                                                name="category_id"
                                                value={
                                                    formData.category_id
                                                }
                                                onChange={
                                                    handleChange
                                                }
                                                required
                                            >

                                                <option value="">

                                                    {
                                                        text.selectCategory
                                                    }

                                                </option>


                                                {
                                                    categories.map(
                                                        category => (

                                                            <option
                                                                key={
                                                                    category.id
                                                                }
                                                                value={
                                                                    category.id
                                                                }
                                                            >

                                                                {
                                                                    displayCategory(
                                                                        category
                                                                    )
                                                                }

                                                            </option>

                                                        )
                                                    )
                                                }

                                            </select>

                                        </div>


                                        {/* PRICE */}

                                        <div className="admin-product-field">

                                            <label>

                                                {
                                                    text.price
                                                }

                                            </label>


                                            <input
                                                name="price"
                                                type="number"
                                                min="0"
                                                step="0.01"
                                                value={
                                                    formData.price
                                                }
                                                onChange={
                                                    handleChange
                                                }
                                                placeholder="0.00"
                                                dir="ltr"
                                                required
                                            />

                                        </div>


                                        {/* OLD PRICE */}

                                        <div className="admin-product-field admin-product-field-full">

                                            <label>

                                                {
                                                    text.oldPrice
                                                }

                                            </label>


                                            <input
                                                name="old_price"
                                                type="number"
                                                min="0"
                                                step="0.01"
                                                value={
                                                    formData.old_price
                                                }
                                                onChange={
                                                    handleChange
                                                }
                                                placeholder={
                                                    text.optional
                                                }
                                                dir="ltr"
                                            />

                                        </div>

                                    </div>


                                    {/* =====================================
                                        SWITCHES
                                    ===================================== */}

                                    <div className="admin-product-switches">

                                        <label>

                                            <input
                                                type="checkbox"
                                                name="featured"
                                                checked={
                                                    formData.featured
                                                }
                                                onChange={
                                                    handleChange
                                                }
                                            />

                                            <span>

                                                {
                                                    text.featuredProduct
                                                }

                                            </span>

                                        </label>


                                        <label>

                                            <input
                                                type="checkbox"
                                                name="prescription_required"
                                                checked={
                                                    formData.prescription_required
                                                }
                                                onChange={
                                                    handleChange
                                                }
                                            />

                                            <span>

                                                {
                                                    text.prescriptionRequired
                                                }

                                            </span>

                                        </label>


                                        <label>

                                            <input
                                                type="checkbox"
                                                name="is_active"
                                                checked={
                                                    formData.is_active
                                                }
                                                onChange={
                                                    handleChange
                                                }
                                            />

                                            <span>

                                                {
                                                    text.activeProduct
                                                }

                                            </span>

                                        </label>

                                    </div>


                                    {/* ERROR */}

                                    {
                                        error && (

                                            <div className="admin-products-error">

                                                {
                                                    error
                                                }

                                            </div>

                                        )
                                    }


                                    {/* ACTIONS */}

                                    <div className="admin-product-modal-actions">

                                        <button
                                            type="button"
                                            onClick={
                                                closeModal
                                            }
                                            disabled={
                                                saving ||
                                                uploadingImage
                                            }
                                        >

                                            {
                                                text.cancel
                                            }

                                        </button>


                                        <button
                                            type="submit"
                                            className="save"
                                            disabled={
                                                saving ||
                                                uploadingImage
                                            }
                                        >

                                            {
                                                uploadingImage
                                                    ? (

                                                        <RefreshCw
                                                            size={17}
                                                            className="admin-products-spinner"
                                                        />

                                                    )
                                                    : (

                                                        <ShieldCheck
                                                            size={17}
                                                        />

                                                    )
                                            }


                                            {
                                                uploadingImage
                                                    ? text.uploadingPhoto
                                                    : saving
                                                        ? text.saving
                                                        : text.saveProduct
                                            }

                                        </button>

                                    </div>

                                </form>

                            </motion.div>

                        </motion.div>

                    )
                }

            </AnimatePresence>

        </main>

    );

}


export default AdminProducts;