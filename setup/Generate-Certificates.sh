#!/bin/bash

#  GenerateCertificates.sh
#  
#
#  Created by Eli Winkelman on 7/29/20.
#

create_development_server_ca(){

    # create an ec key
    openssl ecparam -name prime256v1 -genkey -noout -out ca.key
    
    # create a CA
    openssl req -config /Users/eliwinkelman/OPEnS/MongoServer/secrets/config.txt -new -key ca.key -x509 -days 10000 -out ca.crt

}

create_development_server_certificate()
{
    # generate a new key
    openssl genrsa -out server-key.pem 2048
    echo Created Key
    
    # generate a new CSR which uses this key and output to server.csr
    openssl req -new -sha256 -key server-key.pem -out CSR.csr -subj "/C=US/ST=Oregon/L=Corvallis/O=OPEnS Lab/OU=R&D/CN=localhost"
    echo Created CSR
    # generate a new certificate with the csr that is signed by the certificate authority
    openssl x509 -req -in CSR.csr -CA ca.crt -CAkey ca.key -CAcreateserial -out server-crt.pem -days 365
}

# create secrets directory
mkdir secrets
cd secrets
create_development_server_ca
create_development_server_certificate
