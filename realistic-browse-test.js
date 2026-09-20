import http from "k6/http";
import { check, sleep } from "k6";


export const options = {

    stages: [

        {
            duration: "20s",
            target: 20
        },

        {
            duration: "20s",
            target: 50
        },

        {
            duration: "30s",
            target: 100
        },

        {
            duration: "1m",
            target: 100
        },

        {
            duration: "20s",
            target: 0
        }

    ],

    thresholds: {

        checks: [
            "rate>0.99"
        ],

        http_req_failed: [
            "rate<0.01"
        ],

        http_req_duration: [
            "p(95)<800"
        ]

    }

};


const SUPABASE_URL =
    __ENV.SUPABASE_URL;


const SUPABASE_KEY =
    __ENV.SUPABASE_ANON_KEY;


if (!SUPABASE_URL || !SUPABASE_KEY) {

    throw new Error(
        "Missing SUPABASE_URL or SUPABASE_ANON_KEY."
    );

}


const headers = {

    apikey: SUPABASE_KEY,

    Authorization:
        `Bearer ${SUPABASE_KEY}`,

    "Content-Type":
        "application/json"

};


const searchTerms = [

    "a",
    "e",
    "o",
    "i",
    "m"

];


function parseArray(response) {

    try {

        const data =
            JSON.parse(response.body);

        if (Array.isArray(data)) {

            return data;

        }

        return [];

    }
    catch {

        return [];

    }

}


function randomSleep(min, max) {

    const duration =
        min +
        Math.random() *
        (max - min);

    sleep(duration);

}


export default function () {


    /*
    ==================================================
    1. LOAD CATEGORIES
    ==================================================
    */

    const categoriesResponse =
        http.get(

            `${SUPABASE_URL}/rest/v1/categories?select=id,name&limit=50`,

            {

                headers,

                tags: {
                    endpoint: "categories"
                }

            }

        );


    check(
        categoriesResponse,
        {

            "categories status 200":
                response =>
                    response.status === 200,

            "categories valid array":
                response =>
                    parseArray(response).length >= 0

        }
    );


    randomSleep(
        0.5,
        1.5
    );



    /*
    ==================================================
    2. BROWSE PRODUCTS - PAGE 1
    ==================================================
    */

    const pageOneResponse =
        http.get(

            `${SUPABASE_URL}/rest/v1/products?select=id,name,price&is_active=eq.true&order=name.asc&limit=24&offset=0`,

            {

                headers,

                tags: {
                    endpoint: "products-page-1"
                }

            }

        );


    const pageOneProducts =
        parseArray(
            pageOneResponse
        );


    check(
        pageOneResponse,
        {

            "product page 1 status 200":
                response =>
                    response.status === 200,

            "product page 1 valid array":
                () =>
                    Array.isArray(
                        pageOneProducts
                    )

        }
    );


    randomSleep(
        1,
        2.5
    );



    /*
    ==================================================
    3. CUSTOMER SEARCH
    ==================================================
    */

    const selectedSearchTerm =
        searchTerms[
            Math.floor(
                Math.random() *
                searchTerms.length
            )
        ];


    const searchResponse =
        http.get(

            `${SUPABASE_URL}/rest/v1/products?select=id,name,price&is_active=eq.true&name=ilike.*${selectedSearchTerm}*&order=name.asc&limit=24`,

            {

                headers,

                tags: {
                    endpoint: "search"
                }

            }

        );


    check(
        searchResponse,
        {

            "search status 200":
                response =>
                    response.status === 200,

            "search valid array":
                response =>
                    Array.isArray(
                        parseArray(response)
                    )

        }
    );


    randomSleep(
        1,
        3
    );



    /*
    ==================================================
    4. BROWSE PRODUCTS - PAGE 2
    ==================================================
    */

    const pageTwoResponse =
        http.get(

            `${SUPABASE_URL}/rest/v1/products?select=id,name,price&is_active=eq.true&order=name.asc&limit=24&offset=24`,

            {

                headers,

                tags: {
                    endpoint: "products-page-2"
                }

            }

        );


    check(
        pageTwoResponse,
        {

            "product page 2 status 200":
                response =>
                    response.status === 200,

            "product page 2 valid array":
                response =>
                    Array.isArray(
                        parseArray(response)
                    )

        }
    );


    randomSleep(
        1,
        2.5
    );



    /*
    ==================================================
    5. OPEN INDIVIDUAL PRODUCT
    ==================================================
    */

    if (
        pageOneProducts.length > 0
    ) {

        const randomProduct =
            pageOneProducts[
                Math.floor(
                    Math.random() *
                    pageOneProducts.length
                )
            ];


        const productId =
            encodeURIComponent(
                randomProduct.id
            );


        const productDetailsResponse =
            http.get(

                `${SUPABASE_URL}/rest/v1/products?select=id,name,price&is_active=eq.true&id=eq.${productId}&limit=1`,

                {

                    headers,

                    tags: {
                        endpoint: "product-details"
                    }

                }

            );


        const details =
            parseArray(
                productDetailsResponse
            );


        check(
            productDetailsResponse,
            {

                "product details status 200":
                    response =>
                        response.status === 200,

                "product details returned":
                    () =>
                        details.length === 1

            }
        );

    }


    randomSleep(
        1,
        3
    );

}