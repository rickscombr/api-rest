const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const mysql = require('../mysql').pool;
const auth = require('../middleware/auth');

let hoje = new Date(Date.now());
hoje = hoje.getFullYear() + '-' + (hoje.getMonth() + 1) + '-' + hoje.getDate();

exports.postUsersLogin = (req, res, next) => {
    mysql.getConnection((error, conn) => {
        if ( error ) { return res.status(500).send({ error: error })}
        const strSQL = `SELECT * FROM FI_USER WHERE USE_STAT = 1 AND USE_USER = ?`;
        conn.query( strSQL, [req.body.usuario], (error, result, filds) => {
            if ( error ) { return res.status(500).send({ error: error })}
            if ( result.length < 1 ) {
                res.status(401).send({
                    code: 401,
                    msg: "Usuário não autenticado"
                })
            }else{
                const id = result[0].USE_PRIM;
                const usuario = result[0].USE_USER;
                const senha = result[0].USE_SENH;
                conn.release();
                bcrypt.compare( req.body.senha, senha, (error, result) => {
                    if (result) {
                        const token = jwt.sign({
                            id: id,
                            usuario: usuario
                        }, 
                        process.env.JWT_KEY,
                        {
                            expiresIn: "1d"
                        });
                        res.status(200).send({
                            code: 200,
                            msg: "Usuário autenticado com sucesso!",
                            token: token
                        });
                    }else{
                        res.status(401).send({
                            code: 401,
                            msg: "Usuário não autenticado"
                        })
                    }
                });
            }
        });
    });
};

exports.getUsers = (req, res, next) => {
    mysql.getConnection( (error, conn) => {
        if ( error ) { return res.status(500).send({ error: error })}
        conn.query(
            `SELECT 
                USE_PRIM as id,
                EMP_PRIM as idEmpresa,
                USE_NOME as nome,
                USE_NCPF as cpf,
                USE_CELU as celular,
                USE_TELE as telefone,
                USE_EMAI as email,
                USE_USER as usuario,
                USE_DTCA as data_cadastro,
                USE_DTLG as data_acesso,
                USE_FOTO as foto,
                USE_STAT as status
            FROM FI_USER WHERE USE_STAT < 9`,
            (error, result, filds) => {
                conn.release();
                if ( error ) { return res.status(500).send({ error: error })}
                const users = result;

                res.status(200).send({
                    code: "SUC-200",
                    msg: "Lista de todos os Usuários",
                    date: hoje,
                    users : users
                });
            }
        );
    });
};

exports.getUsersId = (req, res, next) => {
    mysql.getConnection( (error, conn) =>{
        if ( error ) { return res.status(500).send({ error: error })}
        conn.query(
            `SELECT 
                USE_PRIM as id,
                EMP_PRIM as idEmpresa,
                USE_NOME as nome,
                USE_NCPF as cpf,
                USE_CELU as celular,
                USE_TELE as telefone,
                USE_EMAI as email,
                USE_USER as usuario,
                USE_DTCA as data_cadastro,
                USE_DTLG as data_acesso,
                USE_FOTO as foto,
                USE_STAT as status
            FROM FI_USER WHERE USE_STAT < 9 AND USE_PRIM = ?`,
            [req.params.id],
            (error, result, filds) => {
                conn.release();
                if ( error ) { return res.status(500).send({ error: error })}
                if ( result.length <= 0 ) {
                    res.status(404).send({
                        code: 404,
                        msg: "Nenhum usuário localizado!",
                        date: hoje,
                        user: {}
                    });
                } else {
                    const users = result;
                    res.status(200).send({
                        code: "SUC-200",
                        msg: "Busca de usuário por ID",
                        date: hoje,
                        user: users
                    });
                }
            }
        )
    });
};

exports.postUsers = (req, res, next) => {
    mysql.getConnection( (error, conn) => {
        if ( error ) { return res.status(500).send({ error: error })}
        conn.query(
            'SELECT * FROM FI_USER WHERE USE_NCPF = ? OR USE_USER = ?',
            [req.body.cpf, req.body.usuario],
            (error, result) => {
                if ( error ) { return res.status(500).send({ error: error })}
                if ( result.length > 0 ) {
                    res.status(409).send({
                        code: 409,
                        msg: "Usuário já cadastrado, reveja os dados enviados abaixo",
                        date: hoje,
                        user: {
                            idEmpresa: req.body.idEmpresa, 
                            nome: req.body.nome, 
                            cpf: req.body.cpf, 
                            celular: req.body.celular, 
                            telefone: req.body.telefone, 
                            email: req.body.email, 
                            usuario: req.body.usuario, 
                            foto: req.body.foto, 
                            status: 0
                        }
                    });
                } else {
                    bcrypt.hash(req.body.senha, 10, (errBcrypt, hash) => {
                        if ( errBcrypt ) { return res.status(500).send({ error: errBcrypt })}
                        conn.query(
                            `INSERT INTO FI_USER (
                                EMP_PRIM, 
                                USE_NOME, 
                                USE_NCPF, 
                                USE_CELU, 
                                USE_TELE, 
                                USE_EMAI, 
                                USE_USER, 
                                USE_SENH, 
                                USE_DTCA, 
                                USE_DTLG, 
                                USE_FOTO, 
                                USE_STAT
                            ) VALUES (?,?,?,?,?,?,?,?,?,?,?,?)`,
                            [
                                req.body.idEmpresa, 
                                req.body.nome, 
                                req.body.cpf, 
                                req.body.celular, 
                                req.body.telefone, 
                                req.body.email, 
                                req.body.usuario, 
                                hash, 
                                hoje, 
                                hoje, 
                                req.body.foto, 
                                0
                            ],
                            (error, result) => {
                                conn.release();
                                if ( error ) { return res.status(500).send({ error: error })}
                                const usuario = {
                                    id: result.insertId,
                                    idEmpresa: req.body.idEmpresa,
                                    nome: req.body.nome,
                                    cpf: req.body.cpf,
                                    celular: req.body.celular,
                                    telefone: req.body.telefone,
                                    email: req.body.email,
                                    data_cadastro: hoje,
                                    data_acesso: hoje,
                                    foto: req.body.foto,
                                    status: 0
                                }
                                res.status(201).send({
                                    code: 201,
                                    msg: "Usuário cadastrado com Sucesso!",
                                    date: hoje,
                                    user: usuario
                                });
                            }
                        )
                    })
                }
            }
        );
    });
};

exports.patchUsers = (req, res, next) => {
    mysql.getConnection( (error, conn) => {
        if ( error ) { return res.status(500).send({ error: error })}
        bcrypt.hash(req.body.senha, 10, (errBcrypt, hash) => {
            if ( errBcrypt ) { return res.status(500).send({ error: errBcrypt })}
            conn.query(
                `UPDATE FI_USER SET 
                    USE_NOME = ?,
                    USE_NCPF = ?,
                    USE_CELU = ?,
                    USE_TELE = ?,
                    USE_EMAI = ?,
                    USE_USER = ?,
                    USE_SENH = ?,
                    USE_FOTO = ?,
                    USE_STAT = ?
                WHERE USE_PRIM = ?`,
                [
                    req.body.nome, 
                    req.body.cpf, 
                    req.body.celular, 
                    req.body.telefone, 
                    req.body.email, 
                    req.body.usuario, 
                    hash, 
                    req.body.foto, 
                    req.body.status, 
                    req.body.id
                ],
                (error, result, filds) => {
                    conn.release();
                    if ( error ) { return res.status(500).send({ error: error })}
                    const users = {
                        id: req.body.id,
                        nome: req.body.nome,
                        cpf: req.body.cpf,
                        celular: req.body.celular,
                        telefone: req.body.telefone,
                        email: req.body.email,
                        usuario: req.body.usuario,
                        foto: req.body.foto,
                        status: req.body.status
                    }
                    res.status(202).send({
                        code: "SUC-202",
                        msg: "Usuário atualizado com Sucesso!",
                        date: hoje,
                        users: users
                    });
                }
            );
        });
    });
};

exports.deleteUsers = (req, res, next) => {
    mysql.getConnection( (error, conn) => {
        if ( error ) { return res.status(500).send({ error: error })}
        conn.query(
            `DELETE FROM FI_USER WHERE USE_PRIM = ?`,
            [req.body.id],
            (error, result, filds) => {
                conn.release();
                if ( error ) { return res.status(500).send({ 
                    code: "ERR-500",
                    msg: "Ocorreu um erro interno na sua solicitação, tente mais tarde. Se o problema persistir, contate o administrador"
                 })}
                const users = {
                    id: req.body.id
                }
                res.status(202).send({
                    code: "SUC-202",
                    msg: "Usuário excluído com Sucesso!",
                    date: hoje,
                    users: users
                });
            }
        );
    });
};