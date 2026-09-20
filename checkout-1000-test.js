import http from "k6/http";
import { check } from "k6";
import { Rate, Counter } from "k6/metrics";


/*
==================================================
CUSTOM METRICS
==================================================
*/

const orderSuccess =
    new Rate("order_success");

const failed400 =
    new Counter("failed_400");

const failed401 =
    new Counter("failed_401");

const failed403 =
    new Counter("failed_403");

const failed409 =
    new Counter("failed_409");

const failed429 =
    new Counter("failed_429");

const failed5xx =
    new Counter("failed_5xx");

const failedOther =
    new Counter("failed_other");


/*
==================================================
1000 USERS - ONE ORDER EACH
==================================================
*/

export const options = {

    scenarios: {

        checkout_spike: {

            executor:
                "per-vu-iterations",

            vus:
                1000,

            iterations:
                1,

            maxDuration:
                "3m"

        }

    },


    thresholds: {

        checks: [
            "rate>0.99"
        ],

        order_success: [
            "rate>0.99"
        ],

        http_req_failed: [
            "rate<0.01"
        ],

        http_req_duration: [
            "p(95)<2000"
        ]

    }

};


/*
==================================================
CONFIGURATION
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
UUID GENERATOR
==================================================
*/

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

Runs once before the 1000 users begin.
Finds the test product.
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
                        "find-test-product"
                }
            }

        );


    if (
        response.status !== 200
    ) {

        throw new Error(
            `Could not load test product. Status: ${response.status}. Body: ${response.body}`
        );

    }


    let products;


    try {

        products =
            JSON.parse(
                response.body
            );

    }
    catch {

        throw new Error(
            "Could not parse test product response."
        );

    }


    if (
        !Array.isArray(products) ||
        products.length !== 1
    ) {

        throw new Error(
            "Test product was not found."
        );

    }


    const product =
        products[0];


    if (
        product.is_active !== true
    ) {

        throw new Error(
            "Test product is not active."
        );

    }


    console.log(
        "=========================================="
    );

    console.log(
        "TEST PRODUCT FOUND"
    );

    console.log(
        "ID:",
        product.id
    );

    console.log(
        "NAME:",
        product.name
    );

    console.log(
        "PRICE:",
        product.price
    );

    console.log(
        "Starting 1000 simultaneous checkouts..."
    );

    console.log(
        "=========================================="
    );


    return {

        productId:
            product.id

    };

}


/*
==================================================
EACH VIRTUAL USER PLACES EXACTLY ONE ORDER
==================================================
*/

export default function (data) {

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
            `K6 Customer ${__VU}`,


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
            `K6_LOAD_TEST_1000_VU_${__VU}`,


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


    orderSuccess.add(
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


    /*
    ==================================================
    CLASSIFY FAILURES
    ==================================================
    */

    if (!success) {

        if (
            response.status === 400
        ) {

            failed400.add(1);

        }

        else if (
            response.status === 401
        ) {

            failed401.add(1);

        }

        else if (
            response.status === 403
        ) {

            failed403.add(1);

        }

        else if (
            response.status === 409
        ) {

            failed409.add(1);

        }

        else if (
            response.status === 429
        ) {

            failed429.add(1);

        }

        else if (
            response.status >= 500
        ) {

            failed5xx.add(1);

        }

        else {

            failedOther.add(1);

        }


        /*
        Only print a few error responses.
        Prevents the terminal from printing
        hundreds of lines if many fail.
        */

        if (
            __VU <= 10
        ) {

            console.error(
                `VU ${__VU} FAILED`
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