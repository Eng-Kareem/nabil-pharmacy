function createImage(url) {

    return new Promise(
        (resolve, reject) => {

            const image =
                new Image();


            image.addEventListener(
                "load",
                () => {

                    resolve(image);

                }
            );


            image.addEventListener(
                "error",
                (error) => {

                    reject(error);

                }
            );


            image.setAttribute(
                "crossOrigin",
                "anonymous"
            );


            image.src =
                url;

        }
    );

}


export async function getCroppedImage(
    imageSource,
    pixelCrop
) {

    const image =
        await createImage(
            imageSource
        );


    const canvas =
        document.createElement(
            "canvas"
        );


    const context =
        canvas.getContext(
            "2d"
        );


    if (!context) {

        throw new Error(
            "Could not create image crop canvas."
        );

    }


    /*
    ========================================================
    FINAL PROFILE IMAGE
    ========================================================

    Every saved avatar becomes a square 800 × 800 image.

    This ensures the user's chosen framing appears
    consistently in:

    - Profile page
    - Interactive ID
    - Navbar
    - Mobile navbar
    ========================================================
    */

    const outputSize =
        800;


    canvas.width =
        outputSize;


    canvas.height =
        outputSize;


    context.imageSmoothingEnabled =
        true;


    context.imageSmoothingQuality =
        "high";


    context.drawImage(

        image,

        pixelCrop.x,
        pixelCrop.y,

        pixelCrop.width,
        pixelCrop.height,

        0,
        0,

        outputSize,
        outputSize

    );


    return new Promise(
        (resolve, reject) => {

            canvas.toBlob(
                (blob) => {

                    if (!blob) {

                        reject(
                            new Error(
                                "Could not create cropped profile image."
                            )
                        );


                        return;

                    }


                    resolve(blob);

                },

                "image/jpeg",

                0.92

            );

        }
    );

}