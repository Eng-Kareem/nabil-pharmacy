import {
    createContext,
    useContext,
    useEffect,
    useMemo,
    useState
} from "react";


const CartContext =
    createContext(null);


const CART_STORAGE_KEY =
    "nabil-pharmacy-cart";


export function CartProvider({
    children
}) {

    const [cartItems, setCartItems] =
        useState(() => {

            try {

                const stored =
                    localStorage.getItem(
                        CART_STORAGE_KEY
                    );


                return stored
                    ? JSON.parse(stored)
                    : [];

            } catch {

                return [];
            }

        });


    useEffect(() => {

        localStorage.setItem(
            CART_STORAGE_KEY,
            JSON.stringify(cartItems)
        );

    }, [cartItems]);


    const addToCart = (
        product,
        quantity = 1
    ) => {

        if (
            !product ||
            !product.inStock
        ) {
            return;
        }


        setCartItems(
            currentItems => {

                const existingItem =
                    currentItems.find(
                        item =>
                            item.id ===
                            product.id
                    );


                if (existingItem) {

                    return currentItems.map(
                        item => {

                            if (
                                item.id !==
                                product.id
                            ) {
                                return item;
                            }


                            return {
                                ...item,

                                quantity:
                                    Math.min(
                                        item.quantity +
                                            quantity,
                                        20
                                    )
                            };

                        }
                    );
                }


                return [
                    ...currentItems,
                    {
                        ...product,
                        quantity:
                            Math.min(
                                quantity,
                                20
                            )
                    }
                ];
            }
        );
    };


    const removeFromCart = (
        productId
    ) => {

        setCartItems(
            currentItems =>
                currentItems.filter(
                    item =>
                        item.id !==
                        productId
                )
        );
    };


    const updateQuantity = (
        productId,
        quantity
    ) => {

        const safeQuantity =
            Math.max(
                1,
                Math.min(
                    quantity,
                    20
                )
            );


        setCartItems(
            currentItems =>
                currentItems.map(
                    item =>
                        item.id ===
                        productId
                            ? {
                                ...item,
                                quantity:
                                    safeQuantity
                            }
                            : item
                )
        );
    };


    const clearCart = () => {
        setCartItems([]);
    };


    const cartCount =
        useMemo(
            () =>
                cartItems.reduce(
                    (
                        total,
                        item
                    ) =>
                        total +
                        item.quantity,
                    0
                ),
            [cartItems]
        );


    const subtotal =
        useMemo(
            () =>
                cartItems.reduce(
                    (
                        total,
                        item
                    ) =>
                        total +
                        (
                            item.price *
                            item.quantity
                        ),
                    0
                ),
            [cartItems]
        );


    const value = {
        cartItems,
        cartCount,
        subtotal,

        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart
    };


    return (
        <CartContext.Provider
            value={value}
        >
            {children}
        </CartContext.Provider>
    );
}


export function useCart() {

    const context =
        useContext(
            CartContext
        );


    if (!context) {

        throw new Error(
            "useCart must be used inside CartProvider"
        );
    }


    return context;
}