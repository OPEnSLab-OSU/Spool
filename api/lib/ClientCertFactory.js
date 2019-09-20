/** @module ClientCertFactory */

const node_ssl = require("node-openssl-cert");
const ASN1 = require("asn1js");
const Crypto = require("crypto");

/**
 * @param {...any[]} arguments The arguments to the openSSL function, minus the callback at the end.
 * @returns {Promise} A tuple with the result of the function in the first spot, and
 * the OpenSSL comment used in the second. The promise will reject if the OpenSSL command fails.
 */
function promisifyOpenSSL() {
    const functionPtr = arguments[0];
    const otherArgs = Array.prototype.slice.call(arguments, 1);
    return new Promise((resolve, reject) =>
        functionPtr.apply(null, 
            otherArgs.concat([(err, key, cmd) => err ? reject(err) : resolve([key, cmd])])));
}

/**
 * Remove the `-----BEGIN ...-----` statements and newlines from a PEM file.
 * @param {string} pem a PEM file
 * @returns {string} a raw base64 string
 */
function stripPEM(pem) {
    return pem.replace(/-----[A-Z,\s]+-----/g, "").replace(/\r?\n|\r/g, "");
}

/**
 * Convert a PEM file with `-----BEGIN ...-----` padding into a base64 buffer, to be parsed for data.
 * @param {string} pem a ASN1 structure in PEM format
 * @returns {ArrayBuffer} An ArrayBuffer containing the data. 
 */
function PEM2BUF(pem) {
    const nodeBuf = Buffer.from(stripPEM(pem), "base64");
    return nodeBuf.buffer.slice(nodeBuf.byteOffset, nodeBuf.byteOffset + nodeBuf.byteLength);
}

class ClientCertFactory {

    /**
     * ClientCertFactory properties.
     * This function will throw an exception if the OpenSSL binary is not found.
     * @param {string} binpath A path to the OpenSSL binary, global if falsey 
     * @param {string} root_cert The PEM string representing the root certificate authority.
     * @param {[string]} domains An array of DNS names to allow the certificates to authenticate.
     * @param {string} hash A string representing the hash function to sign the certificate with (ex. sha256)
     * @param {string} curve The name of the eliptical curve to use (from `openssl ecparam -list_curves`).
     * Different curves may or may not be supported by the version of OpenSSL you are using.
     * @param {number} lifetime_days The number of days to issue certificates for. 
     * Certificates will automatically be valid from the time issued
     * @param {{ countryName: string, stateOrProvinceName: string, organizationName: string }} subjectBase An object
     * specifiying some information to put on all the certificates.
     */
    constructor(    binpath,
                    root_cert,
                    domains = [],
                    hash = "sha256",
                    curve = "prime256v1",
                    lifetime_days = 200, 
                    subject_base = {
                        countryName: "US",
                        stateOrProvinceName: "Oregon",
                        organizationName: "Open Sensing Lab",
                    }) {
        
        // Initialize the OpenSSL wrapper with OpenSSL
        try {
            this.openssl = new node_ssl({ binpath });
        } catch (e) {
            throw new Error(`Invalid OpenSSL binpath: ${binpath}`);
        }
        // store the hash, lifetime, subject and domains to add to the
        // client certificate later on
        this.root_cert = root_cert;
        this.hash = hash;
        this.curve = curve;
        this.lifetime_days = lifetime_days;
        this.subjectBase = subject_base;
        this.domains = domains;
    }

    /**
     * Create a client certificate.
     * @param {string} root_priv_key The private key of the root certificate provided in the constructor, in PEM format.
     * This argument is passed here instead of the constructor to allow removing the key from memory when it is not in use.
     * @param {string} common_name Common name to use for the certificate, should be something unique/generated
     * @param {boolean} use_extensions Whether or not to use extensions restricting the use of the issued certificate.
     * @returns {{cert: string, key: string, key_raw: string, fingerprint: string}} An object with all of the generated values.
     * key is the private key in PEM format, key_raw is just the private key in base64, and fingerprint is the sha256 fingerprint
     * of the client certificate, in the format provided by the nodejs TLS engine.
     */
    async create_cert(root_priv_key, common_name, use_extensions = true) {
        // generate a unique private key
        const [key] = await promisifyOpenSSL(this.openssl.generateECCPrivateKey, { "curve" : this.curve });
        // create the properties required for a CSR
        const csr_opts = {
            hash: this.hash,
            days: this.lifetime_days,
            subject: Object.assign(this.subjectBase, { commonName: common_name }),
            extensions: use_extensions ? {
                basicConstraints: {
                    critical: true,
                    CA: false,
                    pathlen: 1
                },
                SANs: {
                    DNS: this.domains
                }
            } : undefined,
        };
        // use those properties to create a CSR
        const [csr] = await promisifyOpenSSL(this.openssl.generateCSR, csr_opts, key, null);
        // and use that CSR to create a certificate!
        const [cert] = await promisifyOpenSSL(this.openssl.CASignCSR, csr, csr_opts, false, this.root_cert, root_priv_key, null);
        // extract the actual private key from the PEM private key for the embdedded device
        const asn1_key = ASN1.fromBER(PEM2BUF(key));
        let key_raw;
        if (asn1_key.offset !== -1) {
            const decoded_priv_key = asn1_key.result.valueBlock.value[1].valueBlock.valueHex;
            key_raw = Buffer.from(decoded_priv_key).toString("base64");
        }
        else throw new Error(`Unable to extract the private key from the following PEM: ${key}`);
        // and finally calculate the fingerprint of the client cert for use later
        const cert_der = Buffer.from(stripPEM(cert), "base64");
        const hash = Crypto.createHash("sha256");
        hash.update(cert_der);
        const fingerprint = Array.from(new Uint8Array(hash.digest().buffer)).map(v => v.toString(16).padStart(2, "0")).join(":").toUpperCase();
        // return all of the generated strings!
        return {
            certificate: cert,
            key: key,
            key_raw: key_raw,
            fingerprint: fingerprint
        }
    }
}

module.exports = ClientCertFactory;