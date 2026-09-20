import http from "k6/http";


export const options = {

    vus: 1,

    iterations: 1

};


const SUPABASE_URL =
    __ENV.SUPABASE_URL;


const SUPABASE_KEY =
    __ENV.SUPABASE_ANON_KEY;


if (!SUPABASE_URL || !SUPABASE_KEY) {

    throw new Error(
        "Missing SUPABASE_URL or SUPABASE_ANON_KEY"
    );

}


const headers = {

    apikey: SUPABASE_KEY,

    Authorization:
        `Bearer ${SUPABASE_KEY}`,

    "Content-Type":
        "application/json"

};


export default function () {


    console.log(
        "========== PRODUCTS =========="
    );


    const products =
        http.get(

            `${SUPABASE_URL}/rest/v1/products?select=id,name,price&active=eq.true&limit=24`,

            {
                headers
            }

        );


    console.log(
        `STATUS: ${products.status}`
    );


    console.log(
        `BODY: ${products.body}`
    );



    console.log(
        "========== CATEGORIES =========="
    );


    const categories =
        http.get(

            `${SUPABASE_URL}/rest/v1/categories?select=id,name&limit=50`,

            {
                headers
            }

        );


    console.log(
        `STATUS: ${categories.status}`
    );


    console.log(
        `BODY: ${categories.body}`
    );



    console.log(
        "========== SEARCH =========="
    );


    const search =
        http.get(

            `${SUPABASE_URL}/rest/v1/products?select=id,name,price&active=eq.true&name=ilike.*a*&limit=24`,

            {
                headers
            }

        );


    console.log(
        `STATUS: ${search.status}`
    );


    console.log(
        `BODY: ${search.body}`
    );

}