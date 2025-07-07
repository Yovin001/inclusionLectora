var express = require('express');
var router = express.Router();
let jwt = require('jsonwebtoken');
const multer = require('multer');
const path = require('path');
const uuid = require('uuid');
let maxFileSize = 3 * 1024 * 1024; // Inicialmente 2 MB
const rateLimit = require('express-rate-limit');
const upload = multer();

const { body, validationResult,isDate } = require('express-validator');
const RolController = require('../controls/RolController');
var rolController = new RolController();
const EntidadController = require('../controls/EntidadController');
var entidadController = new EntidadController();
const CuentaController = require('../controls/CuentaController');
var cuentaController = new CuentaController();
const RolEntidadController = require('../controls/RolEntidadController');
var rolEntidadController = new RolEntidadController();
const DocumentoController = require("../controls/DocumnetoController");
var documentoController = new DocumentoController();
const AudioController = require("../controls/AudioController");
var audioController = new AudioController();
const PeticionController = require('../controls/PeticionController');
const peticionController = new PeticionController();
const IAController = require('../controls/IAController');
const iAController = new IAController();

/* GET users listing. */
router.get('/', function(req, res, next) {
  res.send('respond with a resource');
});
const auth = (options = { checkAdmin: false }) => async (req, res, next) => {
  const token = req.headers['x-api-token'];
  if (!token) {
    return res.status(401).json({
      msg: "No existe token",
      code: 401,
    });
  }

  try {
    require('dotenv').config();
    const llave = process.env.KEY;
    const decoded = jwt.verify(token, llave);
    req.decoded = decoded;

    const models = require('../models');
    const cuenta = models.cuenta;
    const rolEntidad = models.rol_entidad;

    // Verifica que la cuenta existe
    const user = await cuenta.findOne({
      where: { external_id: req.decoded.external },
    });

    if (!user) {
      return res.status(401).json({
        msg: "Token no válido o expirado",
        code: 401,
      });
    }

    // Si se requiere verificar si es admin
    if (options.checkAdmin) {
      const isAdmin = await rolEntidad.findOne({
        where: {
          id_entidad: user.id_entidad,
          id_rol: 1, // ID de administrador
        },
      });

      if (!isAdmin) {
        return res.status(403).json({
          msg: "Acceso denegado: No tiene permisos de administrador",
          code: 403,
        });
      }
    }

    next();
  } catch (err) {
    return res.status(401).json({
      msg: "Token no válido",
      code: 401,
    });
  }
};

// GUARDAR IMAGENES 

// Función para crear configuraciones de almacenamiento de multer
const createStorage = (folderPath) => {
  return multer.diskStorage({
    destination: path.join(__dirname, folderPath),
    filename: (req, file, cb) => {
      console.log(file);
      const parts = file.originalname.split('.');
      const extension = parts[parts.length - 1];
      cb(null, uuid.v4() + "." + extension);
    }
  });
};

// Método para validar las extensiones de las fotografías
const extensionesAceptadasFoto = (req, file, cb) => {
  const allowedExtensions = ['.jpeg', '.jpg', '.png'];
  console.log(file);
  const ext = path.extname(file.originalname).toLowerCase();
  if (allowedExtensions.includes(ext)) {
    cb(null, true);
  } else {
    cb(new Error('Solo se permiten archivos JPEG, JPG y PNG.'), false);
  }
};

const extensionesAceptadasDocumentos = (req, file, cb) => {
  const allowedExtensions = ['.pdf', '.doc', '.txt'];
  console.log(file);
  const ext = path.extname(file.originalname).toLowerCase();
  if (allowedExtensions.includes(ext)) {
    cb(null, true);
  } else {
    cb(new Error('Solo se permiten archivos pdf, doc y text.'), false);
  }
};

// Configuración de Multer con control de tamaño y tipo de archivo
// Middleware dinámico para Multer
const uploadFotoPersona = (req, res, next) => {
  const storage = createStorage('../public/images/users');
  const upload = multer({
    storage: storage,
    fileFilter: extensionesAceptadasFoto,
    limits: { fileSize: maxFileSize }, // Lee el tamaño actual de maxFileSize
  }).single('foto');
  upload(req, res, next);
};

const uploadDocumento = (req, res, next) => {
  const storage = createStorage('../public/documentos');
  const upload = multer({
    storage: storage,
    fileFilter: extensionesAceptadasDocumentos,
    limits: { fileSize: maxFileSize }, // Lee el tamaño actual de maxFileSize
  }).single('documento');
  upload(req, res, next);
};


//Global configs
router.get('/config/tamano/:zize',  auth({ checkAdmin: true }),(req, res) => {
  const size = parseInt(req.params.zize);

  if (!size || isNaN(size) || size <= 0) {
    return res.status(400).json({
      msg: "Debe proporcionar un tamaño válido en MB.",
      code: 400,
    });
  }

  maxFileSize = size * 1024 * 1024; // Convertir MB a bytes
  res.status(200).json({
    msg: `Tamaño máximo de archivo actualizado a ${size} MB.`,
    code: 200, info: size,
  });
});
router.get('/config/tamano',  auth({ checkAdmin: true }),(req, res) => {
  res.status(200).json({code: 200,
    info: maxFileSize / (1024 * 1024),
  });
});

router.post(  '/documentos/eliminar/todos',  auth({ checkAdmin: true }), [
  body('key','Ingrese una clave valida').exists().not().isEmpty() ],  documentoController.eliminarTodos);


//INICIO DE SESION
router.post('/sesion', [
  body('correo', 'Ingrese un correo valido').exists().not().isEmpty().isEmail(),
  body('clave', 'Ingrese una clave valido').exists().not().isEmpty(),
], cuentaController.sesion)

//GET-ROL
router.get('/rol/listar',  auth({ checkAdmin: true }), rolController.listar);

//POST ROL
router.post('/rol/guardar',  auth({ checkAdmin: true }), rolController.guardar);

/*****ENTIDAD****/
router.post('/entidad/guardar', (req, res, next) => {
  uploadFotoPersona(req, res, (error) => {
    if (error) {
      if (error instanceof multer.MulterError && error.code === 'LIMIT_FILE_SIZE') {
        return res.status(413).json({
          msg: `El archivo es demasiado grande. Por favor, sube un archivo de menos de ${maxFileSize / (1024 * 1024)} MB.`,
          code: 413,
        });
      }
      return res.status(400).json({
        msg: "Error al cargar el archivo: " + error.message,
        code: 400,
      });
    }
    entidadController.guardar(req, res, next);
  });
});

router.post('/documento',auth(),  (req, res, next) => {
  uploadDocumento(req, res, (error) => {
    if (error) {
      if (error instanceof multer.MulterError && error.code === 'LIMIT_FILE_SIZE') {
        return res.status(413).json({
          msg: `El archivo es demasiado grande. Por favor, sube un archivo de menos de ${maxFileSize / (1024 * 1024)} MB.`,
          code: 413,
        });
      }
      return res.status(400).json({
        msg: "Error al cargar el archivo: " + error.message,
        code: 400,
      });
    }
    documentoController.guardar(req, res, next);
  });
});


router.get('/documento/:external_id', auth(),documentoController.obtener);
router.get('/documento/one/:external_id', auth(),documentoController.obtenerOneDoc);
router.delete('/documento/:external_id',auth(), documentoController.eliminar);
router.get('/documento/entidad/:id_entidad/:nombre',auth(), documentoController.exist);

router.get('/audio/descargar/:filename', (req, res) => {
  const filePath = path.join(__dirname, '../public/audio/completo/', req.params.filename); 
  res.download(filePath, (err) => {
      if (err) {
          console.error('Error al descargar el archivo', err);
          res.status(500).send('Error al descargar el archivo');
      }
  });
});

router.get('/pdf2docx/:filename', documentoController.convertirPdfADocx);

router.get('/docx/descargar/:filename', (req, res) => {
  const filePath = path.join(__dirname, '../public/documentos/', req.params.filename); 
  res.download(filePath, (err) => {
      if (err) {
          console.error('Error al descargar el archivo', err);
          res.status(500).send('Error al descargar el archivo');
      }
  });
});


router.put('/modificar/entidad', auth(),(req, res, next) => {
  uploadFotoPersona.single('foto')(req, res, (error) => {
    if (error) {
      if (error instanceof multer.MulterError && error.code === 'LIMIT_FILE_SIZE') {
        return res.status(413).json({
          msg: "El archivo es demasiado grande. Por favor, sube un archivo de menos de 2 MB.",
          code: 413
        });
      }
      return res.status(400).json({
        msg: "Error al cargar el archivo: " + error.message,
        code: 400
      });
    }
    entidadController.modificar(req, res, next);
  });
});
router.get('/listar/entidad', auth({ checkAdmin: true }),  entidadController.listar);
router.get('/listar/entidad/activos',  auth({ checkAdmin: true }), entidadController.listarActivos);
router.get('/obtener/entidad/:external', auth(), entidadController.obtener);

router.get('/cuenta/:nombreCompleto',auth(),cuentaController.obtenerCuenta);


/** ROL_ENTIDAD */
router.get('/rol/entidad/listar', auth(),rolEntidadController.listar);
router.post('/asignar/lideres',  auth({ checkAdmin: true }), rolEntidadController.asignarLideres);
router.get('/rol/entidad/obtener/lider', rolEntidadController.obtenerLider);
router.get('/rol/entidad/obtener/administrador',  auth({ checkAdmin: true }), rolEntidadController.obtenerAdministrador);

/*    AUDIO  */
router.put('/audio/:external_id', auth(),audioController.guardar);
router.get('/audio/:external_id',auth(), audioController.obtener);
/* CAMBIO CLAVE */
router.put('/cuenta/clave/:external_id',auth(), [
  body('clave_vieja', 'Ingrese una clave valido').exists().not().isEmpty(),
  body('clave_nueva', 'Ingrese una clave valido').exists().not().isEmpty()
], cuentaController.cambioClave)
router.put('/cuenta/restablecer/clave/:external_id', [
  body('clave_nueva', 'Ingrese una clave valido').exists().not().isEmpty()
], cuentaController.cambioClaveSoloNueva)
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
});

router.put('/cuenta/solicitud/cambio/clave',[
  body('correo', 'Ingrese un correo valido').exists().not().isEmpty().isEmail()], cuentaController.solicitudCambioClaveAutomatica)

/** PETICION */
router.get('/peticion/:tipo', peticionController.listarPeticiones);
router.get('/aceptarechazar/peticiones/:external/:estado/:motivo_rechazo/:id_rechazador', /*auth,*/ peticionController.aceptarRechazar);


/** IAController */
router.post(
  '/procesar',
  [
    upload.single('image'),
    body('prompt', 'El prompt es opcional pero debe ser texto')
      .optional()
      .isString()
  ],  iAController.procesarImagenConGemini
);



module.exports = router;  