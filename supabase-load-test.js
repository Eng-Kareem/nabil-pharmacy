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

        http_req_failed: [
            "rate<0.01"
        ],

        http_req_duration: [
            "p(95)<1000"
        ],

        checks: [
            "rate>0.99"
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


function isJsonArray(response) {

    try {

        const data =
            JSON.parse(response.body);

        return Array.isArray(data);

    }
    catch {

        return false;

    }

}


export default function () {


    /*
    =============================================
    PRODUCTS
    =============================================
    */

    const products =
        http.get(

            `${SUPABASE_URL}/rest/v1/products?select=id,name,price&is_active=eq.true&limit=24`,

            {
                headers,
                tags: {
                    name: "products"
                }
            }

        );


    check(
        products,
        {

            "products status is 200":
                response =>
                    response.status === 200,

            "products response is array":
                response =>
                    isJsonArray(response)

        }
    );


    sleep(1);



    /*
    =============================================
    CATEGORIES
    =============================================
    */

    const categories =
        http.get(

            `${SUPABASE_URL}/rest/v1/categories?select=id,name&limit=50`,

            {
                headers,
                tags: {
                    name: "categories"
                }
            }

        );


    check(
        categories,
        {

            "categories status is 200":
                response =>
                    response.status === 200,

            "categories response is array":
                response =>
                    isJsonArray(response)

        }
    );


    sleep(1);



    /*
    =============================================
    PRODUCT SEARCH
    =============================================
    */

    const search =
        http.get(

            `${SUPABASE_URL}/rest/v1/products?select=id,name,price&is_active=eq.true&name=ilike.*a*&limit=24`,

            {
                headers,
                tags: {
                    name: "product-search"
                }
            }

        );


    check(
        search,
        {

            "search status is 200":
                response =>
                    response.status === 200,

            "search response is array":
                response =>
                    isJsonArray(response)

        }
    );


    sleep(2);

}