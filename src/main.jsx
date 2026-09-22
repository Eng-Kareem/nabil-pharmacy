import {
    StrictMode
} from "react";

import {
    createRoot
} from "react-dom/client";

import {
    BrowserRouter
} from "react-router-dom";


import App
    from "./App.jsx";


import {
    AuthProvider
} from "./context/AuthContext.jsx";


import {
    CartProvider
} from "./context/CartContext.jsx";


import {
    LanguageProvider
} from "./context/LanguageContext.jsx";


import "./styles/variables.css";
import "./styles/global.css";
import "./styles/animations.css";


createRoot(
    document.getElementById(
        "root"
    )
).render(

    <StrictMode>

        <BrowserRouter>

            <LanguageProvider>

                <AuthProvider>

                    <CartProvider>

                        <App />

                    </CartProvider>

                </AuthProvider>

            </LanguageProvider>

        </BrowserRouter>

    </StrictMode>

);