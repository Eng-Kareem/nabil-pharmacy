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

import "./AdminProducts.css";


const EMPTY_FORM = {
    id: null,
    name: "",
    slug: "",
    brand: "",
    description: "",
    category_id: "",
    price: "",
    old_price: "",
    badge_text: "",
    image_url: "",
    prescription_required: false,
    featured: false,
    is_active: true
};


function AdminProducts() {

    const [
        products,
        setProducts
    ] = useState([]);


    const [
        categories,
        setCategories
    ] = useState([]);


    const [
        loading,
        setLoading
    ] = useState(true);


    const [
        saving,
        setSaving
    ] = useState(false);


    const [
        uploadingImage,
        setUploadingImage
    ] = useState(false);


    const [
        error,
        setError
    ] = useState("");


    const [
        success,
        setSuccess
    ] = useState("");


    const [
        searchTerm,
        setSearchTerm
    ] = useState("");


    const [
        modalOpen,
        setModalOpen
    ] = useState(false);


    const [
        formData,
        setFormData
    ] = useState({
        ...EMPTY_FORM
    });


    const [
        imageFile,
        setImageFile
    ] = useState(null);


    const [
        imagePreview,
        setImagePreview
    ] = useState("");


    /*
    ========================================================
    LOAD PRODUCTS + CATEGORIES
    ========================================================
    */

    const loadData = async () => {

        setLoading(true);
        setError("");


        try {

            const [
                productsResponse,
                categoriesResponse
            ] = await Promise.all([

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
                            name
                        )
                    `)
                    .order(
                        "created_at",
                        {
                            ascending: false
                        }
                    ),


                supabase
                    .from("categories")
                    .select(`
                        id,
                        name,
                        slug
                    `)
                    .eq(
                        "is_active",
                        true
                    )
                    .order("name")

            ]);


            if (productsResponse.error) {
                throw productsResponse.error;
            }


            if (categoriesResponse.error) {
                throw categoriesResponse.error;
            }


            setProducts(
                productsResponse.data || []
            );


            setCategories(
                categoriesResponse.data || []
            );

        } catch (error) {

            console.error(
                "Admin products load error:",
                error
            );


            setError(
                error?.message ||
                "Could not load product management data."
            );

        } finally {

            setLoading(false);
        }
    };


    useEffect(() => {

        loadData();

    }, []);


    /*
    ========================================================
    FILTER PRODUCTS
    ========================================================
    */

    const filteredProducts =
        useMemo(
            () => {

                const term =
                    searchTerm
                        .trim()
                        .toLowerCase();


                if (!term) {
                    return products;
                }


                return products.filter(
                    product =>
                        [
                            product.name,
                            product.brand,
                            product.categories?.name
                        ]
                            .filter(Boolean)
                            .join(" ")
                            .toLowerCase()
                            .includes(term)
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

        return value
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
    NORMAL INPUT CHANGE
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
        } = event.target;


        setFormData(
            current => {

                const updated = {
                    ...current,

                    [name]:
                        type === "checkbox"
                            ? checked
                            : value
                };


                if (
                    name === "name" &&
                    !current.id
                ) {

                    updated.slug =
                        createSlug(value);
                }


                return updated;
            }
        );
    };


    /*
    ========================================================
    CLEAN LOCAL IMAGE PREVIEW
    ========================================================
    */

    const revokeLocalPreview = (
        preview
    ) => {

        if (
            preview &&
            preview.startsWith("blob:")
        ) {

            URL.revokeObjectURL(
                preview
            );
        }
    };


    /*
    ========================================================
    IMAGE SELECTION
    ========================================================
    */

    const handleImageChange = (
        event
    ) => {

        setError("");


        const file =
            event.target.files?.[0];


        if (!file) {
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

            event.target.value = "";

            setError(
                "Only JPG, PNG and WEBP images are allowed."
            );

            return;
        }


        const maxFileSize =
            5 * 1024 * 1024;


        if (
            file.size > maxFileSize
        ) {

            event.target.value = "";

            setError(
                "Product image must be smaller than 5 MB."
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


        setImageFile(file);

        setImagePreview(
            preview
        );
    };


    /*
    ========================================================
    REMOVE IMAGE FROM FORM
    ========================================================
    */

    const removeSelectedImage = () => {

        revokeLocalPreview(
            imagePreview
        );


        setImageFile(null);

        setImagePreview("");


        setFormData(
            current => ({
                ...current,
                image_url: ""
            })
        );
    };


    /*
    ========================================================
    UPLOAD IMAGE TO SUPABASE STORAGE
    ========================================================
    */

    const uploadProductImage =
        async () => {

            /*
            If admin did not choose a new image,
            keep the existing image.
            */

            if (!imageFile) {

                return (
                    formData.image_url ||
                    null
                );
            }


            setUploadingImage(true);


            try {

                const extension =
                    imageFile.name
                        .split(".")
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
                    error: uploadError
                } =
                    await supabase.storage
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


                if (uploadError) {
                    throw uploadError;
                }


                const {
                    data
                } =
                    supabase.storage
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
                        "Could not create product image URL."
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
    OPEN ADD PRODUCT
    ========================================================
    */

    const openAddModal = () => {

        revokeLocalPreview(
            imagePreview
        );


        setFormData({
            ...EMPTY_FORM
        });


        setImageFile(null);

        setImagePreview("");

        setError("");

        setSuccess("");

        setModalOpen(true);
    };


    /*
    ========================================================
    OPEN EDIT PRODUCT
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
                product.name || "",

            slug:
                product.slug || "",

            brand:
                product.brand || "",

            description:
                product.description || "",

            category_id:
                product.category_id || "",

            price:
                product.price ?? "",

            old_price:
                product.old_price ?? "",

            badge_text:
                product.badge_text || "",

            image_url:
                product.image_url || "",

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


        setImageFile(null);


        setImagePreview(
            product.image_url ||
            ""
        );


        setError("");

        setSuccess("");

        setModalOpen(true);
    };


    /*
    ========================================================
    CLOSE MODAL
    ========================================================
    */

    const closeModal = () => {

        if (
            saving ||
            uploadingImage
        ) {
            return;
        }


        revokeLocalPreview(
            imagePreview
        );


        setModalOpen(false);

        setImageFile(null);

        setImagePreview("");


        setFormData({
            ...EMPTY_FORM
        });


        setError("");
    };


    /*
    ========================================================
    SAVE PRODUCT
    ========================================================
    */

    const handleSave = async (
        event
    ) => {

        event.preventDefault();

        setSaving(true);

        setError("");

        setSuccess("");


        try {

            const price =
                Number(
                    formData.price
                );


            const oldPrice =
                formData.old_price === ""
                    ? null
                    : Number(
                        formData.old_price
                    );


            if (
                !formData.name.trim() ||
                !formData.slug.trim() ||
                !formData.category_id
            ) {

                throw new Error(
                    "Name, slug and category are required."
                );
            }


            if (
                !Number.isFinite(price) ||
                price < 0
            ) {

                throw new Error(
                    "Enter a valid product price."
                );
            }


            if (
                oldPrice !== null &&
                (
                    !Number.isFinite(
                        oldPrice
                    ) ||
                    oldPrice < 0
                )
            ) {

                throw new Error(
                    "Enter a valid old price."
                );
            }


            /*
            Upload the image first.
            If there is no new image,
            this returns the old image URL.
            */

            const imageUrl =
                await uploadProductImage();


            const payload = {

                name:
                    formData.name.trim(),

                slug:
                    formData.slug.trim(),

                brand:
                    formData.brand.trim() ||
                    null,

                description:
                    formData.description.trim() ||
                    null,

                category_id:
                    formData.category_id,

                price,

                old_price:
                    oldPrice,

                badge_text:
                    formData.badge_text.trim() ||
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
            EDIT EXISTING PRODUCT
            */

            if (
                formData.id
            ) {

                const {
                    error
                } =
                    await supabase
                        .from("products")
                        .update(payload)
                        .eq(
                            "id",
                            formData.id
                        );


                if (error) {
                    throw error;
                }


                setSuccess(
                    "Product updated successfully."
                );

            }


            /*
            CREATE NEW PRODUCT
            */

            else {

                const {
                    error
                } =
                    await supabase
                        .from("products")
                        .insert(payload);


                if (error) {
                    throw error;
                }


                setSuccess(
                    "Product created successfully."
                );
            }


            revokeLocalPreview(
                imagePreview
            );


            setImageFile(null);

            setImagePreview("");


            await loadData();


            setModalOpen(
                false
            );


            setFormData({
                ...EMPTY_FORM
            });

        } catch (error) {

            console.error(
                "Save product error:",
                error
            );


            if (
                error?.code ===
                "23505"
            ) {

                setError(
                    "A product with this slug already exists."
                );

            } else {

                setError(
                    error?.message ||
                    "Could not save the product."
                );
            }

        } finally {

            setSaving(false);

            setUploadingImage(
                false
            );
        }
    };


    /*
    ========================================================
    ACTIVATE / DEACTIVATE PRODUCT
    ========================================================
    */

    const toggleProductStatus =
        async (
            product
        ) => {

            setError("");

            setSuccess("");


            try {

                const {
                    error
                } =
                    await supabase
                        .from("products")
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


                if (error) {
                    throw error;
                }


                setSuccess(

                    product.is_active
                        ? `${product.name} deactivated.`
                        : `${product.name} activated.`
                );


                await loadData();

            } catch (error) {

                console.error(
                    "Product status error:",
                    error
                );


                setError(
                    error?.message ||
                    "Could not update product status."
                );
            }
        };


    /*
    ========================================================
    UI
    ========================================================
    */

    return (

        <main className="admin-products-page">

            <div className="container">


                {/* HEADER */}

                <header className="admin-products-header">

                    <div>

                        <span>
                            Product Management
                        </span>


                        <h1>
                            Pharmacy Products
                        </h1>


                        <p>
                            Add products, photos, prices,
                            categories and control which
                            products appear on the website.
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

                        Add Product

                    </button>

                </header>



                {/* STATUS */}

                {
                    success && (

                        <div className="admin-products-success">

                            <Check
                                size={17}
                            />

                            {success}

                        </div>

                    )
                }


                {
                    error &&
                    !modalOpen && (

                        <div className="admin-products-error">

                            {error}

                        </div>

                    )
                }



                {/* TOOLBAR */}

                <div className="admin-products-toolbar">

                    <div className="admin-products-search">

                        <Search
                            size={18}
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

                        Refresh

                    </button>

                </div>



                {/* PRODUCTS TABLE */}

                {
                    loading
                        ? (

                            <div className="admin-products-loading">

                                <RefreshCw
                                    size={34}
                                    className="admin-products-spinner"
                                />

                                Loading products...

                            </div>

                        )
                        : (

                            <div className="admin-products-table-wrapper">

                                <table className="admin-products-table">

                                    <thead>

                                        <tr>

                                            <th>
                                                Product
                                            </th>

                                            <th>
                                                Category
                                            </th>

                                            <th>
                                                Price
                                            </th>

                                            <th>
                                                Featured
                                            </th>

                                            <th>
                                                Status
                                            </th>

                                            <th>
                                                Actions
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
                                                                                        product.name
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
                                                                            product.name
                                                                        }

                                                                    </strong>


                                                                    <span>

                                                                        {
                                                                            product.brand ||
                                                                            "No brand"
                                                                        }

                                                                    </span>

                                                                </div>

                                                            </div>

                                                        </td>


                                                        <td>

                                                            {
                                                                product.categories?.name ||
                                                                "Uncategorized"
                                                            }

                                                        </td>


                                                        <td>

                                                            <strong>

                                                                EGP{" "}

                                                                {
                                                                    Number(
                                                                        product.price
                                                                    )
                                                                        .toLocaleString()
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
                                                                        ? "Featured"
                                                                        : "No"
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
                                                                        ? "Active"
                                                                        : "Inactive"
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

                                                                    Edit

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
                                                                            ? "Deactivate"
                                                                            : "Activate"
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

                                            No products found.

                                        </div>

                                    )
                                }

                            </div>

                        )
                }

            </div>



            {/* =====================================================
                ADD / EDIT PRODUCT MODAL
            ===================================================== */}

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

                                <div className="admin-product-modal-header">

                                    <div>

                                        <span>

                                            {
                                                formData.id
                                                    ? "Edit Product"
                                                    : "New Product"
                                            }

                                        </span>


                                        <h2>

                                            {
                                                formData.id
                                                    ? formData.name
                                                    : "Add Pharmacy Product"
                                            }

                                        </h2>

                                    </div>


                                    <button
                                        type="button"
                                        onClick={
                                            closeModal
                                        }
                                        aria-label="Close"
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


                                        {/* PRODUCT IMAGE */}

                                        <div className="admin-product-field admin-product-field-full">

                                            <label>
                                                Product Photo
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
                                                                    alt="Product preview"
                                                                />

                                                            )
                                                            : (

                                                                <div className="admin-product-image-placeholder">

                                                                    <ImagePlus
                                                                        size={34}
                                                                    />

                                                                    <strong>
                                                                        No product photo
                                                                    </strong>

                                                                    <span>
                                                                        Choose an image below
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

                                                        Choose Product Photo

                                                        <input
                                                            type="file"
                                                            accept="image/jpeg,image/png,image/webp"
                                                            onChange={
                                                                handleImageChange
                                                            }
                                                        />

                                                    </label>


                                                    <p>
                                                        JPG, PNG or WEBP.
                                                        Maximum file size 5 MB.
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

                                                                Remove Photo

                                                            </button>

                                                        )
                                                    }

                                                </div>

                                            </div>

                                        </div>



                                        {/* PRODUCT NAME */}

                                        <div className="admin-product-field">

                                            <label>
                                                Product Name
                                            </label>

                                            <input
                                                name="name"
                                                value={
                                                    formData.name
                                                }
                                                onChange={
                                                    handleChange
                                                }
                                                placeholder="Example: Vitamin C"
                                                required
                                            />

                                        </div>



                                        {/* SLUG */}

                                        <div className="admin-product-field">

                                            <label>
                                                Slug
                                            </label>

                                            <input
                                                name="slug"
                                                value={
                                                    formData.slug
                                                }
                                                onChange={
                                                    handleChange
                                                }
                                                placeholder="vitamin-c"
                                                required
                                            />

                                        </div>



                                        {/* BRAND */}

                                        <div className="admin-product-field">

                                            <label>
                                                Brand
                                            </label>

                                            <input
                                                name="brand"
                                                value={
                                                    formData.brand
                                                }
                                                onChange={
                                                    handleChange
                                                }
                                                placeholder="Brand name"
                                            />

                                        </div>



                                        {/* CATEGORY */}

                                        <div className="admin-product-field">

                                            <label>
                                                Category
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
                                                    Select category
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
                                                                    category.name
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
                                                Price
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
                                                required
                                            />

                                        </div>



                                        {/* OLD PRICE */}

                                        <div className="admin-product-field">

                                            <label>
                                                Old Price
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
                                                placeholder="Optional"
                                            />

                                        </div>



                                        {/* BADGE */}

                                        <div className="admin-product-field admin-product-field-full">

                                            <label>
                                                Badge
                                            </label>

                                            <input
                                                name="badge_text"
                                                value={
                                                    formData.badge_text
                                                }
                                                onChange={
                                                    handleChange
                                                }
                                                placeholder="Example: 15% OFF, NEW, SPECIAL"
                                            />

                                        </div>



                                        {/* DESCRIPTION */}

                                        <div className="admin-product-field admin-product-field-full">

                                            <label>
                                                Description
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
                                                placeholder="Product description..."
                                            />

                                        </div>

                                    </div>



                                    {/* SWITCHES */}

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
                                                Featured Product
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
                                                Prescription Required
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
                                                Active
                                            </span>

                                        </label>

                                    </div>



                                    {/* MODAL ERROR */}

                                    {
                                        error && (

                                            <div className="admin-products-error">

                                                {error}

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

                                            Cancel

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
                                                    ? "Uploading Photo..."
                                                    : saving
                                                        ? "Saving..."
                                                        : "Save Product"
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