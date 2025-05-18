const nodemailer = require('nodemailer');
require('dotenv').config();
var models = require('../models')
var cuenta = models.cuenta;
const uuid = require('uuid');

const { validationResult } = require('express-validator');

const bcrypt = require('bcrypt');
const saltRounds = 8;

let jwt = require('jsonwebtoken');
const { Op } = require('sequelize');

// Transportador con Gmail
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.GMAIL,
        pass: process.env.GMAIL_PASSWORD
    }
});


const esClaveValida = function (clave, claveUser) {
    return bcrypt.compareSync(claveUser, clave);
}
class CuentaController {

    async sesion(req, res) {

        try {
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return res.status(400).json({
                    msg: "FALTAN DATOS",
                    code: 400,
                    errors: errors.array()
                });
            }
            var login = await cuenta.findOne({
                where: {
                    correo: req.body.correo
                },
                include: [{
                    model: models.entidad,
                    as: "entidad"
                }]
            });
            if (!login)
                return res.status(400).json({
                    msg: "CUENTA NO ENCONTRADA",
                    code: 400
                })
            var rol = await models.rol_entidad.findOne({
                where: {
                    id_entidad: login.entidad.id
                }
            });


            if (!login.estado) {
                return res.status(400).json({
                    msg: "CUENTA DESACTIVADA",
                    code: 400
                });
            }
            if (esClaveValida(login.clave, req.body.clave)) {
                const tokenData = {
                    external: login.external_id,
                    email: login.correo,
                    check: true
                };

                require('dotenv').config();
                const llave = process.env.KEY;
                const token = jwt.sign(
                    tokenData,
                    llave,
                    {
                        expiresIn: '12h'
                    });
                return res.status(200).json({
                    msg: "Bievenido " + login.entidad.nombres,
                    info: {
                        token: token,
                        user: {
                            correo: login.correo,
                            nombres: login.entidad.nombres,
                            apellidos: login.entidad.apellidos,
                            user: login.entidad,
                            rol: rol.id_rol,
                            external_cuenta: login.external_id,
                        },
                    },
                    code: 200
                })
            } else {
                return res.status(401).json({
                    msg: "CLAVE INCORRECTA",
                    code: 401
                })
            }

        } catch (error) {
            console.log(error);
            if (error.errors && error.errors[0].message) {
                return res.status(400).json({
                    msg: error.errors[0].message,
                    code: 400
                });
            } else {
                return res.status(400).json({
                    msg: "Ha ocurrido un error en el servidor",
                    code: 400
                });
            }
        }
    }

    async obtenerCuenta(req, res) {
        try {
            if (!req.params.nombreCompleto) {
                return res.status(400).json({
                    msg: "FALTA EL NOMBRE COMPLETO O PARCIAL EN LA SOLICITUD",
                    code: 400
                });
            }
            const nombreCompleto = req.params.nombreCompleto.trim();
            const condicionesBusqueda = {
                [Op.or]: [
                    {
                        nombres: {
                            [Op.like]: `%${nombreCompleto}%`
                        }
                    },
                    {
                        apellidos: {
                            [Op.like]: `%${nombreCompleto}%`
                        }
                    }
                ]
            };
            var cuentasEncontradas = await models.entidad.findAll({
                where: condicionesBusqueda,
                limit: 10 // Limitar los resultados a 10
            });

            if (cuentasEncontradas.length === 0) {
                return res.status(404).json({
                    msg: "NO SE ENCONTRARON USUARIOS",
                    code: 404
                });
            }
            const cuentasInfo = cuentasEncontradas.map(entidad => ({
                nombres: entidad.nombres,
                apellidos: entidad.apellidos,
                id: entidad.id,
                foto: entidad.foto
            }));

            return res.status(200).json({
                msg: "Usuarios Encontrados",
                info: cuentasInfo,
                code: 200
            });
        } catch (error) {
            console.log(error);
            return res.status(500).json({
                msg: "Error en el servidor",
                code: 500
            });
        }
    }
    async cambioClave(req, res) {
        try {
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return res.status(400).json({
                    msg: "FALTAN DATOS",
                    code: 400,
                    errors: errors.array()
                });
            }
            const id_cuenta = req.params.external_id;
            const cuenta = await models.cuenta.findOne({ where: { external_id: id_cuenta } });

            if (!cuenta) {
                return res.status(404).json({
                    msg: "CUENTA NO ENCONTRADA",
                    code: 404
                });
            }
            const salt = bcrypt.genSaltSync(saltRounds);
            if (esClaveValida(cuenta.clave, req.body.clave_vieja)) {
                const claveHash_nueva = bcrypt.hashSync(req.body.clave_nueva, salt);
                cuenta.clave = claveHash_nueva;
                cuenta.external_id=uuid.v4();
                const cuantaActualizada = await cuenta.save();
                if (!cuantaActualizada) {
                    return res.status(400).json({ msg: "NO SE HAN MODIFICADO SUS DATOS, VUELVA A INTENTAR", code: 400 });
                } else {
                    return res.status(200).json({ msg: "CLAVE MODIFICADA CON ÉXITO", code: 200 });
                }
            } else {
                return res.status(401).json({
                    msg: "CLAVE INCORRECTA",
                    code: 401
                });
            }
        } catch (error) {
            console.log(error);
            return res.status(500).json({
                msg: "Error en el servidor",
                code: 500
            });
        }
    }
    async cambioClaveSoloNueva(req, res) {
        try {
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return res.status(400).json({
                    msg: "FALTAN DATOS",
                    code: 400,
                    errors: errors.array()
                });
            }

            const id_cuenta = req.params.external_id;
            const cuenta = await models.cuenta.findOne({ where: { external_id: id_cuenta } });

            if (!cuenta) {
                return res.status(404).json({
                    msg: "CUENTA NO ENCONTRADA",
                    code: 404
                });
            }

            const salt = bcrypt.genSaltSync(saltRounds);
            const claveHash_nueva = bcrypt.hashSync(req.body.clave_nueva, salt);
            cuenta.clave = claveHash_nueva;
            cuenta.external_id=uuid.v4();
            const cuentaActualizada = await cuenta.save();

            if (!cuentaActualizada) {
                return res.status(400).json({
                    msg: "NO SE HAN MODIFICADO SUS DATOS, VUELVA A INTENTAR",
                    code: 400
                });
            }
            console.log('CLaves');
            return res.status(200).json({
                msg: "CLAVE MODIFICADA CON ÉXITO",
                code: 200
            });

        } catch (error) {
            console.log(error);
            return res.status(500).json({
                msg: "Error en el servidor",
                code: 500
            });
        }
    }

    async solicitudCambioClaveAutomatica(req, res) {
        try {
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return res.status(400).json({
                    msg: "FALTAN DATOS",
                    code: 400,
                    errors: errors.array()
                });
            }

            const cuenta = await models.cuenta.findOne({
                where: { correo: req.body.correo, estado: "ACEPTADO" }, include: [
                    {
                        model: models.entidad,
                        as: 'entidad',
                        attributes: ['nombres', 'apellidos'],
                    },
                ],
            });

            if (!cuenta) {
                return res.status(200).json({
                    code: 200,
                    msg: "Cuenta no encontrada o no aceptada"
                });
            }

            // Genera el token
            const tokenData = {
                external: cuenta.external_id,
                email: cuenta.correo,
                check: true
            };
            const token = jwt.sign(tokenData, process.env.KEY, { expiresIn: '10m' });

            // Construye el enlace de restablecimiento
            const enlace = `${process.env.URL_APP}cambio/clave/restablecer/${cuenta.external_id}/${token}`;
            const nombreUsuario = cuenta.entidad.nombres + " " + cuenta.entidad.apellidos || 'usuario';

            // Envía el correo
            const mailOptions = {
                from: `"Inclusión Lectora" <${process.env.EMAIL_USER}>`,
                to: cuenta.correo,
                subject: 'Solicitud de cambio de clave',
                html: `
                    <h3>Hola, ${nombreUsuario}</h3>
                    <p>Hemos recibido una solicitud para cambiar tu contraseña.</p>
                    <p>Puedes restablecer tu clave haciendo clic en el siguiente enlace:</p>
                    <a href="${enlace}">${enlace}</a>
                    <p>Este enlace expirará en 10 minutos.</p>
                    <p>Si no realizaste esta solicitud, ignora este mensaje.</p>
                `
            };

            await transporter.sendMail(mailOptions);

            return res.status(200).json({
                code: 200,
                msg: "Correo enviado con el enlace de restablecimiento"
            });

        } catch (error) {
            console.error("Error en solicitud de cambio de clave:", error);
            return res.status(500).json({
                msg: "Error en el servidor",
                code: 500
            });
        }
    }

}
module.exports = CuentaController;