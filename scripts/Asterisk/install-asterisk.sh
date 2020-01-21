echo Installing and configuring Asterisk...

# save working directory
cwd=$(pwd)

# collect user input
read -p "Please enter IP address: " ipAddress

# install dependencies 
echo Installing dependencies...
apt-get install gcc -y
apt-get install g++ -y
apt-get install make -y
apt-get install patch -y

# install asterisk
echo Installing Asterisk...
cd /usr/local/src
wget https://downloads.asterisk.org/pub/telephony/asterisk/asterisk-17-current.tar.gz
tar -zxvf asterisk-17-current.tar.gz
cd asterisk-17.1.0
contrib/scripts/install_prereq install
./configure
make menuselect.makeopts
menuselect/menuselect --enable codec_opus menuselect.makeopts
menuselect/menuselect --enable CORE-SOUNDS-EN-ULAW  menuselect.makeopts
menuselect/menuselect --enable MOH-OPSOUND-ULAW menuselect.makeopts
make
make install
make config
make install-logrotate

# configure asterisk 
echo Configuring Asterisk...

echo Copy configuration files
cd $cwd
cp config/modules.conf /etc/asterisk/modules.conf 
cp config/http.conf /etc/asterisk/http.conf 
cp config/rtp.conf /etc/asterisk/rtp.conf 
cp config/pjsip.conf /etc/asterisk/pjsip.conf 
cp config/extensions.conf /etc/asterisk/extensions.conf 

echo Create TLS certificate
mkdir /etc/asterisk/cert
cd /etc/asterisk/cert
openssl genrsa -out ca.key 4096
openssl req -x509 -new -nodes -key ca.key -sha256 -subj '/CN=Asterisk Root CA/O=HHN/C=DE' -days 3650 -out ca.crt
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

# return to working directory
cd $cwd

echo Starting Asterisk...
systemctl restart asterisk

echo Asterisk was successfully installed and configured
echo You can find the CA certificate at \'/etc/asterisk/cert/ca.crt\'. Please import it into the web browsers you want to use Asterisk with.