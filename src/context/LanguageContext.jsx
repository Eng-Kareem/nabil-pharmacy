import {
    createContext,
    useContext,
    useEffect,
    useMemo,
    useState
} from "react";

import translations
    from "../i18n/translations.js";


const LanguageContext =
    createContext(null);


export function LanguageProvider({
    children
}) {

    const [
        language,
        setLanguage
    ] = useState(
        () => {

            if (
                typeof window ===
                "undefined"
            ) {

                return "en";

            }


            const saved =
                window.localStorage
                    .getItem(
                        "nabil-language"
                    );


            if (
                saved === "en" ||
                saved === "ar"
            ) {

                return saved;

            }


            return "en";

        }
    );


    useEffect(
        () => {

            const isArabic =
                language ===
                "ar";


            document.documentElement.lang =
                isArabic
                    ? "ar"
                    : "en";


            document.documentElement.dir =
                isArabic
                    ? "rtl"
                    : "ltr";


            document.body.dir =
                isArabic
                    ? "rtl"
                    : "ltr";


            window.localStorage
                .setItem(
                    "nabil-language",
                    language
                );

        },
        [
            language
        ]
    );


    const t = (
        key,
        replacements = {}
    ) => {

        let value =
            translations[
                language
            ]?.[
                key
            ] ??
            translations.en[
                key
            ] ??
            key;


        Object.entries(
            replacements
        ).forEach(
            ([
                replacementKey,
                replacementValue
            ]) => {

                value =
                    value.replaceAll(
                        `{${replacementKey}}`,
                        String(
                            replacementValue ??
                            ""
                        )
                    );

            }
        );


        return value;

    };


    const localize = (
        item,
        field,
        fallback = ""
    ) => {

        if (
            !item
        ) {

            return fallback;

        }


        if (
            language ===
            "ar"
        ) {

            const arabic =
                item[
                    `${field}_ar`
                ];


            if (
                typeof arabic ===
                    "string" &&
                arabic.trim()
            ) {

                return arabic;

            }

        }


        const normal =
            item[
                field
            ];


        if (
            typeof normal ===
                "string" &&
            normal.trim()
        ) {

            return normal;

        }


        return fallback;

    };


    const toggleLanguage =
        () => {

            setLanguage(
                current =>
                    current === "en"
                        ? "ar"
                        : "en"
            );

        };


    const value =
        useMemo(
            () => ({

                language,

                isArabic:
                    language ===
                    "ar",

                setLanguage,

                toggleLanguage,

                localize,

                t

            }),
            [
                language
            ]
        );


    return (

        <LanguageContext.Provider
            value={
                value
            }
        >

            {
                children
            }

        </LanguageContext.Provider>

    );

}


export function useLanguage() {

    const context =
        useContext(
            LanguageContext
        );


    if (
        !context
    ) {

        throw new Error(
            "useLanguage must be used inside LanguageProvider."
        );

    }


    return context;

}