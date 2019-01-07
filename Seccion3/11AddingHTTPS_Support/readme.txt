Creacion del Certificado SSL

creamos carpeta https y en la linea de comandos nos vamos a esa carpeta y ejecutamos el siguiente comando:

COMANDO CLI:
    openssl req -newkey rsa:2048 -new -nodes -x509 -days 3650 -keyout key.pem -out cert.pem

01 iniciara la creacion de la llave, contestamos las siguientes preguntas

    Generating a 2048 bit RSA private key
    ..........................................+++
    .....................................+++
    writing new private key to 'key.pem'
    -----
    You are about to be asked to enter information that will be incorporated
    into your certificate request.
    What you are about to enter is what is called a Distinguished Name or a DN.
    There are quite a few fields but you can leave some blank
    For some fields there will be a default value,
    If you enter '.', the field will be left blank.
    -----
    Country Name (2 letter code) []:MX
    State or Province Name (full name) []:Veracruz
    Locality Name (eg, city) []:Las Choapas
    Organization Name (eg, company) []:Furiocorp
    Organizational Unit Name (eg, section) []:Furiocorp
    Common Name (eg, fully qualified host name) []:localhost
    Email Address []:engel_zamudio@icloud.com

    NOTA: Para el bien del curso en la pregunta "Common Name" nosotros contestamos "localhost"
          debido a que no tenemos un dominio de produccion , todo lo haremos sobre localhost con puertos diferentes.

02 Listamos el contenido en nuestro directorio 'https' con ls -ltr
    -rwxr-xr-x  1 engel_zamudio  staff  1704 Oct 16 22:49 key.pem
    -rwxr-xr-x  1 engel_zamudio  staff  1346 Oct 16 22:49 cert.pem

  Como podemos ver tenemos 2 nuevos arcvhivos
      key.pem
      cert.pem
