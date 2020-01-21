cd cert
read -p "Please enter IP address: " ipAddress
openssl genrsa -out ioBroker.key 2048
cat > csr.cnf <<-EOF
[req]
basicConstraints = CA:FALSE
keyUsage = digitalSignature, keyEncipherment
subjectAltName = IP:$ipAddress
EOF
openssl req -new -sha256 -key ioBroker.key -subj '/CN='$ipAddress -out ioBroker.csr
openssl x509 -req -in ioBroker.csr -CA ca.crt -CAkey ca.key -CAcreateserial -out ioBroker.crt -days 800 -sha256 -extensions req -extfile csr.cnf
echo Certificate successfully renewed. 
echo Please update the ioBroker configuration.