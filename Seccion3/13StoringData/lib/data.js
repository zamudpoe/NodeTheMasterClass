/**
          L i b r e r i a    P a r a    A l m a c e n a r
                          Y
                E d i t a r    D a t o s
**/

//                                                      D E P E N D E N C I A S
var fs   = require ('fs')
var path = require('path')

// Contenedor para el modulo (que sera exportado)
var lib         = {}
// DIRECTORIO BASE DE DATOS
lib.baseDir = path.join(__dirname,'/../.data/');

//                                            E S C R I B I R - datos a un archivo.
lib.create = function (dir, file, data, callback) {
  // ABRIR el archivo para escritura.
  fs.open(lib.baseDir+dir+'/'+file+'.json' , 'wx', function (err, fileDescriptor) {
    if(!err && fileDescriptor){
      // Convertimos la 'data' a 'string'
      var stringData = JSON.stringify(data);

      console.log('fileDescriptor: ', fileDescriptor)

      // Escribimosen al archivo y lo cerramos!.
      fs.writeFile(fileDescriptor, stringData, function (err) {
        if (!err) {
          fs.close(fileDescriptor, function(err) {
            if (!err) {
              callback(false);
            } else {
              callback('[Error] Cerrando Nuevo Archivo!');
            }
          });
        } else {
          callback('[Error] Escribiendo Nuevo Archivo!.');
        }
      });
    } else {
      callback('No puede ser creaddo un Nuevo Archivo, si ya existe!');
    }
  });
};

//                                                L E E R -  data desde un archivo.
lib.read = function ( dir, file, callback) {
  fs.readFile(lib.baseDir+dir+'/'+file+'.json', 'utf8', function(err,data){
    callback(err,data);
  });
};

//                                      A C T U A L I Z A R  -  data en un Archivo.
lib.update = function (dir, file, data, callback) {

  // A B R I R  el arvhico para escritura
  fs.open(lib.baseDir+dir+'/'+file+'.json', 'r+', function (err, fileDescriptor) {
    if (!err && fileDescriptor) {
      // CONVERT DATA-STRING
      var stringData = JSON.stringify(data);

      // Truncate the file
      fs.truncate(fileDescriptor, function (err) {
        if (!err) {
          // Write to file and close it
          fs.writeFile(fileDescriptor, stringData, function (err) {
            if (!err) {
              fs.close(fileDescriptor, function (err) {
                if (!err) {
                  callback(false);
                } else {
                  callback('Error closing existing file');
                }
              });
            } else {
              callback('Error writing to existing file');
            }
          });
        } else {
          callback('Error truncating file');
        }
      });
    } else {
      callback('Could not open file for updating, it may not exist yet');
    }
  });

};

//                                                        B O R R A R - un Archivo.
lib.delete = function (dir, file, callback) {
  // Desvincula el archivo
  fs.unlink(lib.baseDir + dir + '/' + file + '.json',  function (err) {
    err==false ? console.log(lib.baseDir + dir + '/' + file + '.json ha sido borrado') : callback(err)
  })





}

// Exportamos el modulo
module.exports = lib;


