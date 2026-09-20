import http from "k6/http";
import { check, sleep } from "k6";
import { Rate, Counter } from "k6/metrics";


/*
==================================================
CUSTOM METRICS
==================================================
*/

const checkoutSuccess =
    new Rate("checkout_success");

const checkoutFailures =
    new Counter("checkout_failures");


/*
==================================================
TEST CONFIGURATION

900 users browse continuously.
100 users place one order each.

Maximum simultaneous users = 1000.
==================================================
*/

export const options = {

    scenarios: {

        browsing_users: {

            executor:
                "constant-vus",

            exec:
                "browseUser",

            vus:
                900,

            duration:
                "2m"

        },


        checkout_users: {

            executor:
                "per-vu-iterations",

            exec:
                "checkoutUser",

            vus:
                100,

            iterations:
                1,

            startTime:
                "30s",

            maxDuration:
                "2m"

        }

    },


    thresholds: {

        checks: [
            "rate>0.99"
        ],

        http_req_failed: [
            "rate<0.01"
        ],

        "http_req_duration{endpoint:browse}": [
            "p(95)<800"
        ],

        "http_req_duration{endpoint:place-order}": [
            "p(95)<2000"
        ],

        checkout_success: [
            "rate>0.99"
        ]

    }

};


/*
==================================================
SUPABASE CONFIGURATION
==================================================
*/

const SUPABASE_URL =
    __ENV.SUPABASE_URL;


const SUPABASE_KEY =
    __ENV.SUPABASE_ANON_KEY;


const TEST_PRODUCT_NAME =
    "K6 LOAD TEST PRODUCT - DELETE AFTER";


if (
    !SUPABASE_URL ||
    !SUPABASE_KEY
) {

    throw new Error(
        "Missing SUPABASE_URL or SUPABASE_ANON_KEY."
    );

}


const headers = {

    apikey:
        SUPABASE_KEY,

    Authorization:
        `Bearer ${SUPABASE_KEY}`,

    "Content-Type":
        "application/json"

};


/*
==================================================
HELPERS
==================================================
*/

function parseArray(response) {

    try {

        const data =
            JSON.parse(
                response.body
            );

        return Array.isArray(data)
            ? data
            : [];

    }
    catch {

        return [];

    }

}


function randomSleep(min, max) {

    sleep(
        min +
        Math.random() *
        (max - min)
    );

}


function createUuid() {

    return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx"
        .replace(
            /[xy]/g,
            function (character) {

                const random =
                    Math.random() * 16 | 0;

                const value =
                    character === "x"
                        ? random
                        : (
                            random & 0x3 |
                            0x8
                        );

                return value.toString(16);

            }
        );

}


/*
==================================================
SETUP

Find the dedicated load-test product once.
==================================================
*/

export function setup() {

    const encodedName =
        encodeURIComponent(
            TEST_PRODUCT_NAME
        );


    const response =
        http.get(

            `${SUPABASE_URL}/rest/v1/products?select=id,name,price,is_active&name=eq.${encodedName}&limit=1`,

            {
                headers,

                tags: {
                    endpoint:
                        "setup"
                }
            }

        );


    if (
        response.status !== 200
    ) {

        throw new Error(
            `Could not find test product. Status ${response.status}: ${response.body}`
        );

    }


    const products =
        parseArray(
            response
        );


    if (
        products.length !== 1
    ) {

        throw new Error(
            "Test product was not found."
        );

    }


    if (
        products[0].is_active !== true
    ) {

        throw new Error(
            "Test product is not active."
        );

    }


    console.log(
        "============================================"
    );

    console.log(
        "REALISTIC 1000 USER TEST"
    );

    console.log(
        "900 browsing users"
    );

    console.log(
        "100 checkout users"
    );

    console.log(
        "Test product:",
        products[0].name
    );

    console.log(
        "============================================"
    );


    return {

        productId:
            products[0].id

    };

}


/*
==================================================
900 BROWSING USERS
==================================================
*/

export function browseUser(data) {

    /*
    ------------------------------
    Categories
    ------------------------------
    */

    const categories =
        http.get(

            `${SUPABASE_URL}/rest/v1/categories?select=id,name&limit=50`,

            {

                headers,

                tags: {
                    endpoint:
                        "browse"
                }

            }

        );


    check(
        categories,
        {

            "categories loaded":
                response =>
                    response.status === 200

        }
    );


    randomSleep(
        0.5,
        1.5
    );


    /*
    ------------------------------
    Products page
    ------------------------------
    */

    const products =
        http.get(

            `${SUPABASE_URL}/rest/v1/products?select=id,name,price&is_active=eq.true&order=name.asc&limit=24&offset=0`,

            {

                headers,

                tags: {
                    endpoint:
                        "browse"
                }

            }

        );


    check(
        products,
        {

            "products loaded":
                response =>
                    response.status === 200

        }
    );


    randomSleep(
        1,
        2
    );


    /*
    ------------------------------
    Search
    ------------------------------
    */

    const searchLetters = [
        "a",
        "e",
        "m",
        "o",
        "p",
        "s"
    ];


    const searchTerm =
        searchLetters[
            Math.floor(
                Math.random() *
                searchLetters.length
            )
        ];


    const search =
        http.get(

            `${SUPABASE_URL}/rest/v1/products?select=id,name,price&is_active=eq.true&name=ilike.*${searchTerm}*&limit=24`,

            {

                headers,

                tags: {
                    endpoint:
                        "browse"
                }

            }

        );


    check(
        search,
        {

            "search loaded":
                response =>
                    response.status === 200

        }
    );


    randomSleep(
        1,
        2.5
    );


    /*
    ------------------------------
    Product details
    ------------------------------
    */

    const productDetails =
        http.get(

            `${SUPABASE_URL}/rest/v1/products?select=id,name,price&is_active=eq.true&id=eq.${encodeURIComponent(data.productId)}&limit=1`,

            {

                headers,

                tags: {
                    endpoint:
                        "browse"
                }

            }

        );


    check(
        productDetails,
        {

            "product details loaded":
                response =>
                    response.status === 200

        }
    );


    randomSleep(
        1,
        3
    );

}


/*
==================================================
100 CHECKOUT USERS
==================================================
*/

export function checkoutUser(data) {

    const checkoutToken =
        createUuid();


    const payload = {

        p_items: [

            {

                product_id:
                    data.productId,

                quantity:
                    1

            }

        ],


        p_full_name:
            `K6 Mixed Customer ${__VU}`,


        p_phone:
            "01000000000",


        p_delivery_method:
            "pickup",


        p_payment_method:
            "cash",


        p_checkout_token:
            checkoutToken,


        p_email:
            null,


        p_address:
            null,


        p_area:
            null,


        p_city:
            null,


        p_latitude:
            null,


        p_longitude:
            null,


        p_notes:
            `K6_LOAD_TEST_MIXED_${__VU}`,


        p_branch_id:
            null

    };


    const response =
        http.post(

            `${SUPABASE_URL}/rest/v1/rpc/place_order`,

            JSON.stringify(
                payload
            ),

            {

                headers,

                tags: {
                    endpoint:
                        "place-order"
                }

            }

        );


    const success =
        response.status === 200;


    checkoutSuccess.add(
        success
    );


    check(
        response,
        {

            "checkout successful":
                () =>
                    success

        }
    );


    if (!success) {

        checkoutFailures.add(1);


        if (
            __VU <= 10
        ) {

            console.error(
                `CHECKOUT FAILED - VU ${__VU}`
            );

            console.error(
                `STATUS: ${response.status}`
            );

            console.error(
                `BODY: ${response.body}`
            );

        }

    }

}