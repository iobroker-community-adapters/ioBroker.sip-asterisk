echo Create TLS certificate
read -p "Please enter IP address: " ipAddress
mkdir cert
cd cert
openssl genrsa -out ca.key 4096
openssl req -x509 -new -nodes -key ca.key -sha256 -subj '/CN=ioBroker Root CA/O=HHN/C=DE' -days 3650 -out ca.crt
openssl genrsa -out ioBroker.key 2048
cat > csr.cnf <<-EOF
[req]
basicConstraints = CA:FALSE
keyUsage = digitalSignature, keyEncipherment
subjectAltName = IP:$ipAddress
EOF
openssl req -new -sha256 -key ioBroker.key -subj '/CN='$ipAddress -out ioBroker.csr
openssl x509 -req -in ioBroker.csr -CA ca.crt -CAkey ca.key -CAcreateserial -out ioBroker.crt -days 800 -sha256 -extensions req -extfile csr.cnf
echo Certificate successfully created.
echo Please update the ioBroker configuration.
echo You can find the CA certificate at \'cert/ca.crt\'. Please import it into the web browsers you want to use ioBroker with.
