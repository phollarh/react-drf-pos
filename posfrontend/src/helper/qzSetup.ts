import axios from "axios";
import qz from "qz-tray";
import { BASE_URL_ACCOUNT } from "../congif";

// Give QZ our public certificate.
qz.security.setCertificatePromise((resolve, reject) => {
    fetch("/qz/digital-certificate.txt", {
        cache: "no-store",
    })
        .then((response) => {
            if (!response.ok) {
                throw new Error("Unable to load the QZ certificate.");
            }

            return response.text();
        })
        .then(resolve)
        .catch(reject);
});

qz.security.setSignatureAlgorithm("SHA512");


qz.security.setSignaturePromise((message: string) => {
    return (resolve, reject) => {
        axios
            .post(
                `${BASE_URL_ACCOUNT}/qz/sign/`,
                { message },
                { withCredentials: true }
            )
            .then((response) => {
                const signature = response.data.signature;

                if (typeof signature !== "string" || !signature) {
                    throw new Error("Django returned an invalid QZ signature.");
                }

                resolve(signature);
            })
            .catch(reject);
    };
});

export default qz;