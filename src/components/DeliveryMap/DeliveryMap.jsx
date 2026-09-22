import {
    Crosshair,
    LoaderCircle,
    MapPin,
    Navigation,
    Search,
    X
} from "lucide-react";

import {
    MapContainer,
    Marker,
    TileLayer,
    useMap,
    useMapEvents
} from "react-leaflet";

import {
    divIcon
} from "leaflet";

import {
    useEffect,
    useMemo,
    useRef,
    useState
} from "react";

import {
    useLanguage
} from "../../context/LanguageContext.jsx";

import checkoutTranslations
    from "../../i18n/checkoutTranslations.js";

import "leaflet/dist/leaflet.css";
import "./DeliveryMap.css";


const DEFAULT_POSITION = [
    30.0444,
    31.2357
];


const EGYPT_COUNTRY_CODE =
    "eg";


/*
========================================================
TEXT HELPERS
========================================================
*/

function normalizeText(
    value
) {

    return String(
        value ||
        ""
    )
        .trim()
        .toLowerCase();

}


/*
========================================================
CHECK LANDMARK / BUSINESS
========================================================
*/

function isLandmarkLike(
    value,
    address = {},
    result = {}
) {

    const normalizedValue =
        normalizeText(
            value
        );


    if (
        !normalizedValue
    ) {

        return false;

    }


    const landmarkValues = [

        result.name,

        address.shop,

        address.amenity,

        address.office,

        address.tourism,

        address.attraction,

        address.leisure,

        address.historic,

        address.building,

        address.house_name,

        address.commercial

    ]
        .map(
            normalizeText
        )
        .filter(
            Boolean
        );


    return landmarkValues
        .includes(
            normalizedValue
        );

}


/*
========================================================
DETECT CITY
========================================================
*/

function detectCity(
    address = {}
) {

    return (

        address.city ||

        address.town ||

        address.village ||

        address.municipality ||

        address.county ||

        ""

    );

}


/*
========================================================
DETECT AREA
========================================================
*/

function detectArea(
    address = {},
    result = {}
) {

    const city =
        detectCity(
            address
        );


    const candidates = [

        address.suburb,

        address.city_district,

        address.district,

        address.quarter,

        address.neighbourhood,

        address.hamlet,

        address.state_district

    ]
        .filter(
            Boolean
        );


    for (
        const candidate
        of candidates
    ) {

        if (
            normalizeText(
                candidate
            ) ===
            normalizeText(
                city
            )
        ) {

            continue;

        }


        if (
            isLandmarkLike(
                candidate,
                address,
                result
            )
        ) {

            continue;

        }


        return candidate;

    }


    return "";

}


/*
========================================================
DETECT STREET
========================================================
*/

function detectStreet(
    address = {}
) {

    const streetName =

        address.road ||

        address.street ||

        address.pedestrian ||

        address.residential ||

        address.highway ||

        "";


    return [

        address.house_number,

        streetName

    ]
        .filter(
            Boolean
        )
        .join(
            " "
        )
        .trim();

}


/*
========================================================
MAP CLICK
========================================================
*/

function MapClickHandler({
    onLocationPicked
}) {

    useMapEvents({

        click(
            event
        ) {

            const {
                lat,
                lng
            } =
                event.latlng;


            onLocationPicked(
                lat,
                lng
            );

        }

    });


    return null;

}


/*
========================================================
AUTO MOVE MAP
========================================================
*/

function MapAutoMove({
    position
}) {

    const map =
        useMap();


    useEffect(
        () => {

            if (
                !position ||
                position.length !==
                2
            ) {

                return;

            }


            const latitude =
                Number(
                    position[0]
                );


            const longitude =
                Number(
                    position[1]
                );


            if (
                !Number.isFinite(
                    latitude
                ) ||
                !Number.isFinite(
                    longitude
                )
            ) {

                return;

            }


            map.flyTo(

                [
                    latitude,
                    longitude
                ],

                17,

                {
                    duration:
                        1.35
                }

            );

        },
        [
            map,
            position
        ]
    );


    return null;

}


/*
========================================================
MAP SIZE FIX
========================================================
*/

function MapSizeFix() {

    const map =
        useMap();


    useEffect(
        () => {

            const timer =
                window.setTimeout(
                    () => {

                        map.invalidateSize();

                    },
                    250
                );


            return () => {

                window.clearTimeout(
                    timer
                );

            };

        },
        [
            map
        ]
    );


    return null;

}


/*
========================================================
CENTER BUTTON
========================================================
*/

function MapController({
    position,
    ariaLabel
}) {

    const map =
        useMap();


    const moveMap = (
        event
    ) => {

        event.stopPropagation();


        map.flyTo(

            position,

            17,

            {
                duration:
                    1.2
            }

        );

    };


    return (

        <button
            type="button"
            className="delivery-map-center-button"
            onClick={
                moveMap
            }
            aria-label={
                ariaLabel
            }
        >

            <Navigation
                size={18}
            />

        </button>

    );

}


/*
========================================================
DELIVERY MAP
========================================================
*/

function DeliveryMap({
    formData,
    setFormData,
    handleChange
}) {

    const {
        language,
        isArabic
    } = useLanguage();


    const text =
        checkoutTranslations[
            language
        ] ||
        checkoutTranslations.en;


    const countryName =
        isArabic
            ? "مصر"
            : "Egypt";


    /*
    ====================================================
    INITIAL POSITION
    ====================================================
    */

    const savedLatitude =
        Number(
            formData.latitude
        );


    const savedLongitude =
        Number(
            formData.longitude
        );


    const hasSavedPosition =

        Number.isFinite(
            savedLatitude
        ) &&

        Number.isFinite(
            savedLongitude
        ) &&

        formData.latitude !==
            null &&

        formData.longitude !==
            null;


    const initialPosition =
        hasSavedPosition
            ? [
                savedLatitude,
                savedLongitude
            ]
            : DEFAULT_POSITION;


    /*
    ====================================================
    STATE
    ====================================================
    */

    const [
        position,
        setPosition
    ] = useState(
        initialPosition
    );


    const [
        locating,
        setLocating
    ] = useState(
        false
    );


    const [
        searching,
        setSearching
    ] = useState(
        false
    );


    const [
        reverseSearching,
        setReverseSearching
    ] = useState(
        false
    );


    const [
        searchResults,
        setSearchResults
    ] = useState(
        []
    );


    const [
        locationError,
        setLocationError
    ] = useState(
        ""
    );


    const [
        searchError,
        setSearchError
    ] = useState(
        ""
    );


    const [
        searchMessage,
        setSearchMessage
    ] = useState(
        ""
    );


    const [
        selectedAddress,
        setSelectedAddress
    ] = useState(
        ""
    );


    const searchAbortControllerRef =
        useRef(
            null
        );


    const reverseAbortControllerRef =
        useRef(
            null
        );


    /*
    ====================================================
    MARKER
    ====================================================
    */

    const markerIcon =
        useMemo(
            () =>
                divIcon({

                    className:
                        "delivery-map-marker-wrapper",

                    html: `
                        <div class="delivery-map-marker">
                            <div class="delivery-map-marker-dot"></div>
                        </div>
                    `,

                    iconSize: [
                        46,
                        55
                    ],

                    iconAnchor: [
                        23,
                        52
                    ]

                }),
            []
        );


    /*
    ====================================================
    UPDATE POSITION
    ====================================================
    */

    const updatePosition = (
        lat,
        lng
    ) => {

        const latitude =
            Number(
                lat
            );


        const longitude =
            Number(
                lng
            );


        if (
            !Number.isFinite(
                latitude
            ) ||
            !Number.isFinite(
                longitude
            )
        ) {

            return;

        }


        setPosition([

            latitude,

            longitude

        ]);


        setFormData(
            current => ({

                ...current,

                latitude,

                longitude

            })
        );

    };


    /*
    ====================================================
    APPLY ADDRESS DATA
    ====================================================
    */

    const applyAddressDetails = ({
        result,
        latitude,
        longitude,
        preserveTypedAddress = false
    }) => {

        const address =
            result?.address ||
            {};


        const detectedCity =
            detectCity(
                address
            );


        const detectedArea =
            detectArea(
                address,
                result
            );


        const detectedStreet =
            detectStreet(
                address
            );


        setSelectedAddress(
            result?.display_name ||
            ""
        );


        setFormData(
            current => {

                const safeExistingArea =
                    isLandmarkLike(

                        current.area,

                        address,

                        result

                    )
                        ? ""
                        : current.area;


                return {

                    ...current,

                    address:
                        preserveTypedAddress &&
                        current.address
                            ?.trim()
                            ? current.address
                            : (
                                detectedStreet ||
                                current.address ||
                                ""
                            ),

                    area:
                        detectedArea ||
                        safeExistingArea ||
                        "",

                    city:
                        detectedCity ||
                        current.city ||
                        "",

                    latitude,

                    longitude

                };

            }
        );

    };


    /*
    ====================================================
    REVERSE GEOCODE
    ====================================================
    */

    const reverseGeocode = async (
        lat,
        lng
    ) => {

        const latitude =
            Number(
                lat
            );


        const longitude =
            Number(
                lng
            );


        if (
            !Number.isFinite(
                latitude
            ) ||
            !Number.isFinite(
                longitude
            )
        ) {

            return;

        }


        if (
            reverseAbortControllerRef.current
        ) {

            reverseAbortControllerRef.current
                .abort();

        }


        const controller =
            new AbortController();


        reverseAbortControllerRef.current =
            controller;


        setReverseSearching(
            true
        );


        setLocationError(
            ""
        );


        try {

            const params =
                new URLSearchParams({

                    format:
                        "jsonv2",

                    lat:
                        String(
                            latitude
                        ),

                    lon:
                        String(
                            longitude
                        ),

                    zoom:
                        "18",

                    addressdetails:
                        "1",

                    "accept-language":
                        isArabic
                            ? "ar,en"
                            : "en"

                });


            const response =
                await fetch(

                    `https://nominatim.openstreetmap.org/reverse?${params.toString()}`,

                    {

                        method:
                            "GET",

                        headers: {

                            Accept:
                                "application/json"

                        },

                        signal:
                            controller.signal

                    }

                );


            if (
                !response.ok
            ) {

                throw new Error(
                    "Reverse address lookup failed."
                );

            }


            const result =
                await response.json();


            applyAddressDetails({

                result,

                latitude,

                longitude,

                preserveTypedAddress:
                    false

            });

        } catch (
            error
        ) {

            if (
                error.name ===
                "AbortError"
            ) {

                return;

            }


            console.error(
                "Reverse geocoding error:",
                error
            );


            setLocationError(
                text.reverseFailed
            );

        } finally {

            setReverseSearching(
                false
            );

        }

    };


    /*
    ====================================================
    MAP LOCATION PICKED
    ====================================================
    */

    const handleLocationPicked =
        async (
            lat,
            lng
        ) => {

            setSearchResults(
                []
            );

            setSearchError(
                ""
            );

            setSearchMessage(
                ""
            );


            updatePosition(
                lat,
                lng
            );


            await reverseGeocode(
                lat,
                lng
            );

        };


    /*
    ====================================================
    DRAG MARKER
    ====================================================
    */

    const handleMarkerDrag =
        async (
            event
        ) => {

            const marker =
                event.target;


            const {
                lat,
                lng
            } =
                marker
                    .getLatLng();


            await handleLocationPicked(
                lat,
                lng
            );

        };


    /*
    ====================================================
    CURRENT LOCATION
    ====================================================
    */

    const useCurrentLocation =
        () => {

            setLocationError(
                ""
            );

            setSearchError(
                ""
            );

            setSearchMessage(
                ""
            );


            if (
                !navigator.geolocation
            ) {

                setLocationError(
                    text.locationUnsupported
                );

                return;

            }


            setLocating(
                true
            );


            navigator
                .geolocation
                .getCurrentPosition(

                    async (
                        positionResult
                    ) => {

                        const {
                            latitude,
                            longitude
                        } =
                            positionResult
                                .coords;


                        updatePosition(
                            latitude,
                            longitude
                        );


                        await reverseGeocode(
                            latitude,
                            longitude
                        );


                        setLocating(
                            false
                        );

                    },


                    () => {

                        setLocationError(
                            text.locationDenied
                        );


                        setLocating(
                            false
                        );

                    },


                    {

                        enableHighAccuracy:
                            true,

                        timeout:
                            10000,

                        maximumAge:
                            30000

                    }

                );

        };


    /*
    ====================================================
    BUILD SEARCH QUERIES
    ====================================================
    */

    const buildSearchQueries =
        () => {

            const street =
                formData.address
                    ?.trim() ||
                "";


            const area =
                formData.area
                    ?.trim() ||
                "";


            const city =
                formData.city
                    ?.trim() ||
                "";


            const queries = [

                [
                    street,
                    city,
                    countryName
                ]
                    .filter(
                        Boolean
                    )
                    .join(
                        ", "
                    ),

                [
                    street,
                    area,
                    city,
                    countryName
                ]
                    .filter(
                        Boolean
                    )
                    .join(
                        ", "
                    ),

                [
                    street,
                    countryName
                ]
                    .filter(
                        Boolean
                    )
                    .join(
                        ", "
                    ),

                [
                    city,
                    countryName
                ]
                    .filter(
                        Boolean
                    )
                    .join(
                        ", "
                    )

            ];


            return [

                ...new Set(
                    queries.filter(
                        query => {

                            const normalized =
                                normalizeText(
                                    query
                                );


                            return (
                                normalized !==
                                normalizeText(
                                    countryName
                                )
                            );

                        }
                    )
                )

            ];

        };


    /*
    ====================================================
    FETCH ADDRESS RESULTS
    ====================================================
    */

    const fetchAddressResults =
        async (
            query,
            signal
        ) => {

            const params =
                new URLSearchParams({

                    q:
                        query,

                    format:
                        "jsonv2",

                    addressdetails:
                        "1",

                    limit:
                        "5",

                    countrycodes:
                        EGYPT_COUNTRY_CODE,

                    dedupe:
                        "1",

                    "accept-language":
                        isArabic
                            ? "ar,en"
                            : "en"

                });


            const response =
                await fetch(

                    `https://nominatim.openstreetmap.org/search?${params.toString()}`,

                    {

                        method:
                            "GET",

                        headers: {

                            Accept:
                                "application/json"

                        },

                        signal

                    }

                );


            if (
                !response.ok
            ) {

                throw new Error(
                    "Address search failed."
                );

            }


            const results =
                await response
                    .json();


            return Array.isArray(
                results
            )
                ? results
                : [];

        };


    /*
    ====================================================
    SELECT RESULT
    ====================================================
    */

    const selectSearchResult = (
        result,
        options = {}
    ) => {

        const {
            keepResults = false
        } =
            options;


        const latitude =
            Number(
                result.lat
            );


        const longitude =
            Number(
                result.lon
            );


        if (
            !Number.isFinite(
                latitude
            ) ||
            !Number.isFinite(
                longitude
            )
        ) {

            return;

        }


        updatePosition(
            latitude,
            longitude
        );


        applyAddressDetails({

            result,

            latitude,

            longitude,

            preserveTypedAddress:
                true

        });


        if (
            !keepResults
        ) {

            setSearchResults(
                []
            );

        }


        setSearchError(
            ""
        );

    };


    /*
    ====================================================
    SEARCH ADDRESS
    ====================================================
    */

    const searchAddress =
        async () => {

            const queries =
                buildSearchQueries();


            if (
                queries.length ===
                0
            ) {

                setSearchError(
                    text.addressRequiredForSearch
                );

                return;

            }


            setSearching(
                true
            );

            setSearchError(
                ""
            );

            setLocationError(
                ""
            );

            setSearchMessage(
                ""
            );

            setSearchResults(
                []
            );


            if (
                searchAbortControllerRef.current
            ) {

                searchAbortControllerRef.current
                    .abort();

            }


            const controller =
                new AbortController();


            searchAbortControllerRef.current =
                controller;


            try {

                let results =
                    [];


                for (
                    const query
                    of queries
                ) {

                    results =
                        await fetchAddressResults(

                            query,

                            controller.signal

                        );


                    if (
                        results.length >
                        0
                    ) {

                        break;

                    }

                }


                if (
                    results.length ===
                    0
                ) {

                    setSearchError(
                        text.addressNotFound
                    );

                    return;

                }


                const bestResult =
                    results[0];


                selectSearchResult(

                    bestResult,

                    {
                        keepResults:
                            results.length >
                            1
                    }

                );


                if (
                    results.length >
                    1
                ) {

                    setSearchResults(
                        results
                    );


                    setSearchMessage(
                        text.bestMatch
                    );

                } else {

                    setSearchResults(
                        []
                    );


                    setSearchMessage(
                        text.addressFound
                    );

                }

            } catch (
                error
            ) {

                if (
                    error.name ===
                    "AbortError"
                ) {

                    return;

                }


                console.error(
                    "Address search error:",
                    error
                );


                setSearchError(
                    text.searchUnavailable
                );

            } finally {

                setSearching(
                    false
                );

            }

        };


    /*
    ====================================================
    ENTER KEY
    ====================================================
    */

    const handleAddressKeyDown = (
        event
    ) => {

        if (
            event.key !==
            "Enter"
        ) {

            return;

        }


        event.preventDefault();


        searchAddress();

    };


    /*
    ====================================================
    FIELD CHANGE
    ====================================================
    */

    const handleDeliveryFieldChange = (
        event
    ) => {

        handleChange(
            event
        );


        setSearchMessage(
            ""
        );


        setSearchError(
            ""
        );

    };


    /*
    ====================================================
    CLEAR RESULTS
    ====================================================
    */

    const clearSearchResults =
        () => {

            setSearchResults(
                []
            );

            setSearchError(
                ""
            );

            setSearchMessage(
                ""
            );

        };


    /*
    ====================================================
    CLEANUP
    ====================================================
    */

    useEffect(
        () => {

            return () => {

                if (
                    searchAbortControllerRef.current
                ) {

                    searchAbortControllerRef.current
                        .abort();

                }


                if (
                    reverseAbortControllerRef.current
                ) {

                    reverseAbortControllerRef.current
                        .abort();

                }

            };

        },
        []
    );


    /*
    ====================================================
    COMPONENT
    ====================================================
    */

    return (

        <div className="delivery-map-wrapper">


            {/* =================================================
                MAP SIDE
            ================================================= */}

            <div className="delivery-map-visual">


                <div className="delivery-map-heading">

                    <div>

                        <span className="section-label">

                            {
                                text.deliveryLocation
                            }

                        </span>


                        <h3>

                            {
                                text.chooseExactLocation
                            }

                        </h3>

                    </div>


                    <button

                        type="button"

                        className="delivery-current-location"

                        onClick={
                            useCurrentLocation
                        }

                        disabled={
                            locating
                        }

                    >

                        {
                            locating
                                ? (

                                    <LoaderCircle
                                        size={17}
                                        className="delivery-map-spinner"
                                    />

                                )
                                : (

                                    <Crosshair
                                        size={17}
                                    />

                                )
                        }


                        {
                            locating
                                ? text.locating
                                : text.useMyLocation
                        }

                    </button>

                </div>


                <p className="delivery-map-help">

                    {
                        text.mapHelp
                    }

                </p>


                {/* =================================================
                    MAP
                ================================================= */}

                <div className="delivery-map-container">

                    <MapContainer

                        center={
                            position
                        }

                        zoom={13}

                        scrollWheelZoom

                        className="delivery-leaflet-map"

                    >

                        <TileLayer

                            attribution={
                                isArabic
                                    ? "© مساهمو OpenStreetMap"
                                    : "© OpenStreetMap contributors"
                            }

                            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"

                        />


                        <MapSizeFix />


                        <MapClickHandler

                            onLocationPicked={
                                handleLocationPicked
                            }

                        />


                        <MapAutoMove

                            position={
                                position
                            }

                        />


                        <MapController

                            position={
                                position
                            }

                            ariaLabel={
                                text.centerMap
                            }

                        />


                        <Marker

                            position={
                                position
                            }

                            icon={
                                markerIcon
                            }

                            draggable

                            eventHandlers={{

                                dragend:
                                    handleMarkerDrag

                            }}

                        />

                    </MapContainer>


                    <div className="delivery-map-instruction">

                        {
                            reverseSearching
                                ? (

                                    <LoaderCircle
                                        size={15}
                                        className="delivery-map-spinner"
                                    />

                                )
                                : (

                                    <MapPin
                                        size={15}
                                    />

                                )
                        }


                        {
                            reverseSearching
                                ? text.readingLocation
                                : text.dragPin
                        }

                    </div>

                </div>


                {
                    locationError && (

                        <div className="delivery-map-error">

                            {
                                locationError
                            }

                        </div>

                    )
                }


                {/* =================================================
                    COORDINATES
                ================================================= */}

                <div className="delivery-map-coordinates">

                    <MapPin
                        size={16}
                    />


                    <span>

                        {
                            text.selectedLocation
                        }

                    </span>


                    <strong
                        dir="ltr"
                    >

                        {
                            Number(
                                position[0]
                            )
                                .toFixed(
                                    5
                                )
                        }

                        ,{" "}

                        {
                            Number(
                                position[1]
                            )
                                .toFixed(
                                    5
                                )
                        }

                    </strong>

                </div>


                {
                    selectedAddress && (

                        <div className="delivery-map-selected-location">

                            <Navigation
                                size={16}
                            />


                            <div>

                                <span>

                                    {
                                        text.mapLocation
                                    }

                                </span>


                                <strong>

                                    {
                                        selectedAddress
                                    }

                                </strong>

                            </div>

                        </div>

                    )
                }

            </div>


            {/* =================================================
                ADDRESS FORM
            ================================================= */}

            <div className="delivery-map-form">

                <span className="section-label">

                    {
                        text.deliveryAddress
                    }

                </span>


                <h3>

                    {
                        text.whereDeliver
                    }

                </h3>


                <p>

                    {
                        text.addressInstructions
                    }

                </p>


                {/* FULL ADDRESS */}

                <div className="delivery-map-field">

                    <label htmlFor="address">

                        <MapPin
                            size={15}
                        />

                        {
                            text.fullAddress
                        }

                    </label>


                    <input

                        id="address"

                        name="address"

                        type="text"

                        value={
                            formData.address
                        }

                        onChange={
                            handleDeliveryFieldChange
                        }

                        onKeyDown={
                            handleAddressKeyDown
                        }

                        placeholder={
                            text.fullAddressPlaceholder
                        }

                        autoComplete="street-address"

                        required

                    />


                    <small className="delivery-map-field-help">

                        {
                            text.fullAddressExample
                        }

                    </small>

                </div>


                {/* AREA + CITY */}

                <div className="delivery-map-form-row">


                    <div className="delivery-map-field">

                        <label htmlFor="area">

                            {
                                text.areaDistrict
                            }

                        </label>


                        <input

                            id="area"

                            name="area"

                            type="text"

                            value={
                                formData.area
                            }

                            onChange={
                                handleDeliveryFieldChange
                            }

                            onKeyDown={
                                handleAddressKeyDown
                            }

                            placeholder={
                                text.areaPlaceholder
                            }

                            autoComplete="address-level3"

                        />


                        <small className="delivery-map-field-help">

                            {
                                text.areaHelp
                            }

                        </small>

                    </div>


                    <div className="delivery-map-field">

                        <label htmlFor="city">

                            {
                                text.city
                            }

                        </label>


                        <input

                            id="city"

                            name="city"

                            type="text"

                            value={
                                formData.city
                            }

                            onChange={
                                handleDeliveryFieldChange
                            }

                            onKeyDown={
                                handleAddressKeyDown
                            }

                            placeholder={
                                text.cityPlaceholder
                            }

                            autoComplete="address-level2"

                            required

                        />

                    </div>

                </div>


                {/* FIND ON MAP */}

                <button

                    type="button"

                    className="delivery-map-search-button"

                    onClick={
                        searchAddress
                    }

                    disabled={
                        searching
                    }

                >

                    {
                        searching
                            ? (

                                <LoaderCircle
                                    size={18}
                                    className="delivery-map-spinner"
                                />

                            )
                            : (

                                <Search
                                    size={18}
                                />

                            )
                    }


                    {
                        searching
                            ? text.findingAddress
                            : text.findOnMap
                    }

                </button>


                {/* SUCCESS */}

                {
                    searchMessage && (

                        <div className="delivery-map-success">

                            <Navigation
                                size={16}
                            />


                            <span>

                                {
                                    searchMessage
                                }

                            </span>

                        </div>

                    )
                }


                {/* SEARCH RESULTS */}

                {
                    searchResults.length >
                    1 && (

                        <div className="delivery-search-results">


                            <div className="delivery-search-results-heading">

                                <div>

                                    <strong>

                                        {
                                            text.otherLocations
                                        }

                                    </strong>


                                    <span>

                                        {
                                            text.otherLocationsDescription
                                        }

                                    </span>

                                </div>


                                <button

                                    type="button"

                                    onClick={
                                        clearSearchResults
                                    }

                                    aria-label={
                                        text.closeSearchResults
                                    }

                                >

                                    <X
                                        size={17}
                                    />

                                </button>

                            </div>


                            <div className="delivery-search-results-list">

                                {
                                    searchResults.map(
                                        (
                                            result,
                                            index
                                        ) => (

                                            <button

                                                type="button"

                                                key={
                                                    result.place_id ||
                                                    `${result.lat}-${result.lon}-${index}`
                                                }

                                                className="delivery-search-result"

                                                onClick={
                                                    () => {

                                                        selectSearchResult(
                                                            result
                                                        );


                                                        setSearchMessage(
                                                            text.locationChanged
                                                        );

                                                    }
                                                }

                                            >

                                                <div className="delivery-search-result-icon">

                                                    <MapPin
                                                        size={17}
                                                    />

                                                </div>


                                                <div>

                                                    <strong>

                                                        {
                                                            result.name ||
                                                            result.display_name
                                                                ?.split(
                                                                    ","
                                                                )[0] ||
                                                            text.location
                                                        }

                                                    </strong>


                                                    <span>

                                                        {
                                                            result.display_name
                                                        }

                                                    </span>

                                                </div>

                                            </button>

                                        )
                                    )
                                }

                            </div>

                        </div>

                    )
                }


                {
                    searchError && (

                        <div className="delivery-map-error">

                            {
                                searchError
                            }

                        </div>

                    )
                }


                {/* =================================================
                    LIVE SUMMARY
                ================================================= */}

                <div className="delivery-map-summary">

                    <div className="delivery-map-summary-icon">

                        <Navigation
                            size={20}
                        />

                    </div>


                    <div>

                        <span>

                            {
                                text.deliveringTo
                            }

                        </span>


                        <strong>

                            {
                                formData.address ||
                                text.chooseLocation
                            }

                        </strong>


                        {
                            (
                                formData.area ||
                                formData.city
                            ) && (

                                <small>

                                    {
                                        formData.area
                                    }


                                    {
                                        formData.area &&
                                        formData.city
                                            ? "، "
                                            : ""
                                    }


                                    {
                                        formData.city
                                    }

                                </small>

                            )
                        }

                    </div>

                </div>

            </div>

        </div>

    );

}


export default DeliveryMap;