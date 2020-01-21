cd cert
read -p "Please enter IP address: " ipAddress
openssl genrsa -out asterisk.key 2048
cat > csr.cnf <<-EOF
[req]
basicConstraints = CA:FALSE
keyUsage = digitalSignature, keyEncipherment
subjectAltName = IP:$ipAddress
EOF
openssl req -new -sha256 -key asterisk.key -subj '/CN='$ipAddress -out asterisk.csr
openssl x509 -req -in asterisk.csr -CA ca.crt -CAkey ca.key -CAcreateserial -out asterisk.crt -days 800 -sha256 -extensions req -extfile csr.cnf
openssl pkcs8 -topk8 -inform PEM -outform PEM -nocrypt -in asterisk.key -out asterisk.pem
cat asterisk.crt >> asterisk.pem
echo Restarting Asterisk now...
systemctl restart asterisk
echo Certificate successfully renewed.