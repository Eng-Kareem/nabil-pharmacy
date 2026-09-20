import {
    AlertTriangle,
    Boxes,
    Check,
    Minus,
    Package,
    Plus,
    RefreshCw,
    Save,
    Search,
    Warehouse,
    Wifi
} from "lucide-react";

import {
    useEffect,
    useMemo,
    useState
} from "react";

import {
    supabase
} from "../../lib/supabase.js";

import "./AdminInventory.css";


function AdminInventory() {

    const [
        products,
        setProducts
    ] = useState([]);


    const [
        branches,
        setBranches
    ] = useState([]);


    const [
        selectedBranch,
        setSelectedBranch
    ] = useState("");


    const [
        stockValues,
        setStockValues
    ] = useState({});


    const [
        searchTerm,
        setSearchTerm
    ] = useState("");


    const [
        loading,
        setLoading
    ] = useState(true);


    const [
        savingProductId,
        setSavingProductId
    ] = useState(null);


    const [
        error,
        setError
    ] = useState("");


    const [
        success,
        setSuccess
    ] = useState("");


    const [
        realtimeConnected,
        setRealtimeConnected
    ] = useState(false);


    /*
    ========================================================
    LOAD INVENTORY
    ========================================================
    */

    const loadInventory =
        async (
            showLoading = true
        ) => {

            if (showLoading) {
                setLoading(true);
            }

            setError("");


            try {

                const [
                    branchesResponse,
                    productsResponse,
                    stockResponse
                ] = await Promise.all([

                    supabase
                        .from("branches")
                        .select(`
                            id,
                            name,
                            area,
                            city,
                            is_active
                        `)
                        .eq(
                            "is_active",
                            true
                        )
                        .order("name"),


                    supabase
                        .from("products")
                        .select(`
                            id,
                            name,
                            brand,
                            price,
                            image_url,
                            is_active,
                            category_id,
                            categories (
                                id,
                                name
                            )
                        `)
                        .order(
                            "name",
                            {
                                ascending: true
                            }
                        ),


                    supabase
                        .from("branch_stock")
                        .select(`
                            id,
                            branch_id,
                            product_id,
                            quantity
                        `)

                ]);


                if (
                    branchesResponse.error
                ) {
                    throw branchesResponse.error;
                }


                if (
                    productsResponse.error
                ) {
                    throw productsResponse.error;
                }


                if (
                    stockResponse.error
                ) {
                    throw stockResponse.error;
                }


                const loadedBranches =
                    branchesResponse.data || [];


                const loadedProducts =
                    productsResponse.data || [];


                const loadedStock =
                    stockResponse.data || [];


                setBranches(
                    loadedBranches
                );


                setProducts(
                    loadedProducts
                );


                const stockMap = {};


                loadedStock.forEach(
                    row => {

                        stockMap[
                            `${row.branch_id}-${row.product_id}`
                        ] =
                            Number(
                                row.quantity
                            ) || 0;

                    }
                );


                setStockValues(
                    stockMap
                );


                if (
                    loadedBranches.length > 0
                ) {

                    setSelectedBranch(
                        current =>
                            current ||
                            loadedBranches[0].id
                    );
                }

            } catch (error) {

                console.error(
                    "Inventory loading error:",
                    error
                );


                setError(
                    error?.message ||
                    "Could not load inventory."
                );

            } finally {

                if (showLoading) {
                    setLoading(false);
                }
            }
        };


    /*
    ========================================================
    INITIAL LOAD
    ========================================================
    */

    useEffect(() => {

        loadInventory();

    }, []);


    /*
    ========================================================
    REALTIME INVENTORY
    ========================================================
    */

    useEffect(() => {

        const channel =
            supabase
                .channel(
                    "admin-inventory-live"
                )
                .on(
                    "postgres_changes",
                    {
                        event: "*",
                        schema: "public",
                        table: "branch_stock"
                    },
                    payload => {

                        console.log(
                            "Inventory realtime change:",
                            payload
                        );


                        /*
                        Reload silently whenever stock changes.

                        This means:
                        sale happens
                              ↓
                        branch_stock changes
                              ↓
                        this page refreshes automatically
                        */

                        loadInventory(false);
                    }
                )
                .subscribe(
                    status => {

                        setRealtimeConnected(
                            status ===
                            "SUBSCRIBED"
                        );
                    }
                );


        return () => {

            supabase.removeChannel(
                channel
            );
        };

    }, []);


    /*
    ========================================================
    GET PRODUCT STOCK
    ========================================================
    */

    const getStock = (
        productId
    ) => {

        if (
            !selectedBranch
        ) {
            return 0;
        }


        const key =
            `${selectedBranch}-${productId}`;


        return (
            Number(
                stockValues[key]
            ) || 0
        );
    };


    /*
    ========================================================
    CHANGE LOCAL STOCK
    ========================================================
    */

    const changeStock = (
        productId,
        quantity
    ) => {

        const numericValue =
            Number(quantity);


        const safeQuantity =
            Number.isFinite(
                numericValue
            )
                ? Math.max(
                    0,
                    Math.floor(
                        numericValue
                    )
                )
                : 0;


        const key =
            `${selectedBranch}-${productId}`;


        setStockValues(
            current => ({

                ...current,

                [key]:
                    safeQuantity
            })
        );
    };


    const increaseStock = (
        productId
    ) => {

        changeStock(
            productId,
            getStock(productId) + 1
        );
    };


    const decreaseStock = (
        productId
    ) => {

        changeStock(
            productId,
            Math.max(
                0,
                getStock(productId) - 1
            )
        );
    };


    /*
    ========================================================
    SAVE MANUAL STOCK CHANGE
    ========================================================
    */

    const saveStock =
        async (
            product
        ) => {

            if (
                !selectedBranch
            ) {

                setError(
                    "Select a branch first."
                );

                return;
            }


            setSavingProductId(
                product.id
            );


            setError("");
            setSuccess("");


            try {

                const quantity =
                    getStock(
                        product.id
                    );


                const {
                    error
                } =
                    await supabase
                        .from(
                            "branch_stock"
                        )
                        .upsert(
                            {
                                branch_id:
                                    selectedBranch,

                                product_id:
                                    product.id,

                                quantity,

                                updated_at:
                                    new Date()
                                        .toISOString()
                            },
                            {
                                onConflict:
                                    "branch_id,product_id"
                            }
                        );


                if (error) {
                    throw error;
                }


                setSuccess(
                    `${product.name} stock updated to ${quantity}.`
                );


                window.setTimeout(
                    () => {

                        setSuccess("");

                    },
                    2500
                );

            } catch (error) {

                console.error(
                    "Stock update error:",
                    error
                );


                setError(
                    error?.message ||
                    "Could not update stock."
                );

            } finally {

                setSavingProductId(
                    null
                );
            }
        };


    /*
    ========================================================
    PRODUCT SEARCH
    ========================================================
    */

    const filteredProducts =
        useMemo(
            () => {

                const search =
                    searchTerm
                        .trim()
                        .toLowerCase();


                if (!search) {
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
                            .includes(search)
                );

            },
            [
                products,
                searchTerm
            ]
        );


    /*
    ========================================================
    INVENTORY SUMMARY
    ========================================================
    */

    const inventorySummary =
        useMemo(
            () => {

                if (
                    !selectedBranch
                ) {

                    return {
                        products: 0,
                        units: 0,
                        inStock: 0,
                        lowStock: 0,
                        outOfStock: 0
                    };
                }


                let units = 0;

                let inStock = 0;

                let lowStock = 0;

                let outOfStock = 0;


                products.forEach(
                    product => {

                        const key =
                            `${selectedBranch}-${product.id}`;


                        const quantity =
                            Number(
                                stockValues[key]
                            ) || 0;


                        units += quantity;


                        if (
                            quantity === 0
                        ) {

                            outOfStock += 1;

                        } else if (
                            quantity <= 5
                        ) {

                            lowStock += 1;

                        } else {

                            inStock += 1;
                        }

                    }
                );


                return {

                    products:
                        products.length,

                    units,

                    inStock,

                    lowStock,

                    outOfStock
                };

            },
            [
                products,
                stockValues,
                selectedBranch
            ]
        );


    /*
    ========================================================
    STOCK STATUS
    ========================================================
    */

    const getStockStatus = (
        quantity
    ) => {

        if (
            quantity === 0
        ) {

            return {

                className:
                    "out",

                text:
                    "Out of Stock"
            };
        }


        if (
            quantity <= 5
        ) {

            return {

                className:
                    "low",

                text:
                    "Low Stock"
            };
        }


        return {

            className:
                "good",

            text:
                "In Stock"
        };
    };


    const currentBranch =
        branches.find(
            branch =>
                branch.id ===
                selectedBranch
        );


    return (

        <main className="admin-inventory-page">

            <div className="container">


                {/* HEADER */}

                <header className="admin-inventory-header">

                    <div>

                        <span>
                            Inventory Management
                        </span>


                        <h1>
                            Pharmacy Stock
                        </h1>


                        <p>
                            Inventory automatically updates
                            when product stock changes.
                        </p>

                    </div>


                    <div className="admin-inventory-header-actions">

                        <div
                            className={
                                realtimeConnected
                                    ? "admin-realtime-status connected"
                                    : "admin-realtime-status"
                            }
                        >

                            <Wifi
                                size={15}
                            />

                            {
                                realtimeConnected
                                    ? "Live Inventory"
                                    : "Connecting..."
                            }

                        </div>


                        <button
                            type="button"
                            className="admin-inventory-refresh"
                            onClick={() =>
                                loadInventory()
                            }
                        >

                            <RefreshCw
                                size={17}
                            />

                            Refresh

                        </button>

                    </div>

                </header>



                {/* MESSAGES */}

                {
                    success && (

                        <div className="admin-inventory-success">

                            <Check
                                size={17}
                            />

                            {success}

                        </div>

                    )
                }


                {
                    error && (

                        <div className="admin-inventory-error">

                            <AlertTriangle
                                size={17}
                            />

                            {error}

                        </div>

                    )
                }



                {/* BRANCH */}

                <section className="admin-inventory-branch-card">

                    <div className="admin-inventory-branch-icon">

                        <Warehouse
                            size={24}
                        />

                    </div>


                    <div className="admin-inventory-branch-info">

                        <span>
                            Managing Inventory For
                        </span>


                        <strong>

                            {
                                currentBranch?.name ||
                                "Select a Branch"
                            }

                        </strong>


                        {
                            (
                                currentBranch?.area ||
                                currentBranch?.city
                            ) && (

                                <small>

                                    {
                                        currentBranch?.area
                                    }

                                    {
                                        currentBranch?.area &&
                                        currentBranch?.city
                                            ? ", "
                                            : ""
                                    }

                                    {
                                        currentBranch?.city
                                    }

                                </small>

                            )
                        }

                    </div>


                    <select
                        value={
                            selectedBranch
                        }
                        onChange={
                            event =>
                                setSelectedBranch(
                                    event.target.value
                                )
                        }
                    >

                        {
                            branches.map(
                                branch => (

                                    <option
                                        key={
                                            branch.id
                                        }
                                        value={
                                            branch.id
                                        }
                                    >

                                        {
                                            branch.name
                                        }

                                    </option>

                                )
                            )
                        }

                    </select>

                </section>



                {/* SUMMARY */}

                <section className="admin-inventory-summary">


                    <div className="admin-inventory-summary-card">

                        <Package />

                        <div>

                            <span>
                                Products
                            </span>

                            <strong>

                                {
                                    inventorySummary.products
                                }

                            </strong>

                        </div>

                    </div>


                    <div className="admin-inventory-summary-card">

                        <Boxes />

                        <div>

                            <span>
                                Total Units
                            </span>

                            <strong>

                                {
                                    inventorySummary.units
                                }

                            </strong>

                        </div>

                    </div>


                    <div className="admin-inventory-summary-card good">

                        <Check />

                        <div>

                            <span>
                                In Stock
                            </span>

                            <strong>

                                {
                                    inventorySummary.inStock
                                }

                            </strong>

                        </div>

                    </div>


                    <div className="admin-inventory-summary-card low">

                        <AlertTriangle />

                        <div>

                            <span>
                                Low Stock
                            </span>

                            <strong>

                                {
                                    inventorySummary.lowStock
                                }

                            </strong>

                        </div>

                    </div>


                    <div className="admin-inventory-summary-card out">

                        <AlertTriangle />

                        <div>

                            <span>
                                Out of Stock
                            </span>

                            <strong>

                                {
                                    inventorySummary.outOfStock
                                }

                            </strong>

                        </div>

                    </div>

                </section>



                {/* SEARCH */}

                <div className="admin-inventory-toolbar">

                    <div className="admin-inventory-search">

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

                </div>



                {/* TABLE */}

                {
                    loading
                        ? (

                            <div className="admin-inventory-loading">

                                <RefreshCw
                                    className="admin-inventory-spinner"
                                    size={34}
                                />

                                <span>
                                    Loading inventory...
                                </span>

                            </div>

                        )
                        : (

                            <div className="admin-inventory-table-wrapper">

                                <table className="admin-inventory-table">

                                    <thead>

                                        <tr>

                                            <th>
                                                Product
                                            </th>

                                            <th>
                                                Category
                                            </th>

                                            <th>
                                                Status
                                            </th>

                                            <th>
                                                Quantity
                                            </th>

                                            <th>
                                                Save
                                            </th>

                                        </tr>

                                    </thead>


                                    <tbody>

                                        {
                                            filteredProducts.map(
                                                product => {

                                                    const quantity =
                                                        getStock(
                                                            product.id
                                                        );


                                                    const status =
                                                        getStockStatus(
                                                            quantity
                                                        );


                                                    return (

                                                        <tr
                                                            key={
                                                                product.id
                                                            }
                                                        >

                                                            <td>

                                                                <div className="admin-inventory-product">

                                                                    <div className="admin-inventory-product-icon">

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
                                                                                    />

                                                                                )
                                                                                : (

                                                                                    <Package
                                                                                        size={19}
                                                                                    />

                                                                                )
                                                                        }

                                                                    </div>


                                                                    <div>

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

                                                                <span
                                                                    className={
                                                                        `admin-inventory-status ${status.className}`
                                                                    }
                                                                >

                                                                    {
                                                                        status.text
                                                                    }

                                                                </span>

                                                            </td>


                                                            <td>

                                                                <div className="admin-stock-control">

                                                                    <button
                                                                        type="button"
                                                                        onClick={() =>
                                                                            decreaseStock(
                                                                                product.id
                                                                            )
                                                                        }
                                                                        disabled={
                                                                            quantity <= 0
                                                                        }
                                                                    >

                                                                        <Minus
                                                                            size={15}
                                                                        />

                                                                    </button>


                                                                    <input
                                                                        type="number"
                                                                        min="0"
                                                                        step="1"
                                                                        value={
                                                                            quantity
                                                                        }
                                                                        onChange={
                                                                            event =>
                                                                                changeStock(
                                                                                    product.id,
                                                                                    event.target.value
                                                                                )
                                                                        }
                                                                    />


                                                                    <button
                                                                        type="button"
                                                                        onClick={() =>
                                                                            increaseStock(
                                                                                product.id
                                                                            )
                                                                        }
                                                                    >

                                                                        <Plus
                                                                            size={15}
                                                                        />

                                                                    </button>

                                                                </div>

                                                            </td>


                                                            <td>

                                                                <button
                                                                    type="button"
                                                                    className="admin-inventory-save"
                                                                    onClick={() =>
                                                                        saveStock(
                                                                            product
                                                                        )
                                                                    }
                                                                    disabled={
                                                                        savingProductId ===
                                                                        product.id
                                                                    }
                                                                >

                                                                    {
                                                                        savingProductId ===
                                                                        product.id
                                                                            ? (

                                                                                <RefreshCw
                                                                                    size={16}
                                                                                    className="admin-inventory-spinner"
                                                                                />

                                                                            )
                                                                            : (

                                                                                <Save
                                                                                    size={16}
                                                                                />

                                                                            )
                                                                    }


                                                                    {
                                                                        savingProductId ===
                                                                        product.id
                                                                            ? "Saving"
                                                                            : "Save"
                                                                    }

                                                                </button>

                                                            </td>

                                                        </tr>

                                                    );
                                                }
                                            )
                                        }

                                    </tbody>

                                </table>


                                {
                                    filteredProducts.length ===
                                    0 && (

                                        <div className="admin-inventory-empty">

                                            No products found.

                                        </div>

                                    )
                                }

                            </div>

                        )
                }

            </div>

        </main>
    );
}


export default AdminInventory;