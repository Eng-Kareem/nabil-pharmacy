import http from "k6/http";
import {
    check,
    sleep
} from "k6";


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
            "p(95)<1500"
        ]

    }

};


const BASE_URL =
    "https://nabil-pharmacy.vercel.app";


export default function () {

    const homeResponse =
        http.get(
            `${BASE_URL}/`
        );


    check(
        homeResponse,
        {
            "home status is 200":
                response =>
                    response.status === 200
        }
    );


    sleep(
        1
    );


    const productsResponse =
        http.get(
            `${BASE_URL}/products`
        );


    check(
        productsResponse,
        {
            "products status is 200":
                response =>
                    response.status === 200
        }
    );


    sleep(
        2
    );


    const accountResponse =
        http.get(
            `${BASE_URL}/account`
        );


    check(
        accountResponse,
        {
            "account status is 200":
                response =>
                    response.status === 200
        }
    );


    sleep(
        1
    );


    const cartResponse =
        http.get(
            `${BASE_URL}/cart`
        );


    check(
        cartResponse,
        {
            "cart status is 200":
                response =>
                    response.status === 200
        }
    );


    sleep(
        2
    );

}