const mysql = require('../mysql').pool;
const auth = require('../middleware/auth');

let hoje = new Date(Date.now());
hoje = hoje.getFullYear() + '-' + (hoje.getMonth() + 1) + '-' + hoje.getDate();

exports.getPessoas = (req, res, next) => {
    mysql.getConnection( (error, conn) => {
        if ( error ) { return res.status(500).send({ error: error })}
        conn.query(
            'SELECT * FROM FI_TIPO_PESSOA WHERE TPP_STAT < 9',
            (error, result, filds) => {
                conn.release();
                if ( error ) { return res.status(500).send({ error: error })}
                const pessoas = result;

                res.status(200).send({
                    code: "SUC-200",
                    msg: "Lista de todos os Tipos de Pessoas",
                    date: hoje,
                    pessoas : pessoas
                });
            }
        );
    });
};

exports.getPessoasId = (req, res, next) => {
    mysql.getConnection( (error, conn) =>{
        if ( error ) { return res.status(500).send({ error: error })}
        conn.query(
            'SELECT * FROM FI_TIPO_PESSOA WHERE TPP_STAT < 9 AND TPP_PRIM = ?',
            [req.params.id],
            (error, result, filds) => {
                conn.release();
                if ( error ) { return res.status(500).send({ error: error })}
                const pessoas = result;

                res.status(200).send({
                    code: "SUC-200",
                    msg: "Busca de Tipos de Pessoas por ID",
                    date: hoje,
                    pessoas: pessoas
                });
            }
        )
    });
};

exports.postPessoas = (req, res, next) => {
    mysql.getConnection( (error, conn) => {
        if ( error ) { return res.status(500).send({ error: error })}
        conn.query(
            'INSERT INTO FI_TIPO_PESSOA (TPP_NOME, TPP_SIGL, TPP_STAT) VALUES (?,?,?)',
            [req.body.nome, req.body.sigla, req.body.status],
            (error, result, filds) => {
                conn.release();
                if ( error ) { return res.status(500).send({ error: error })}
                const pessoas = {
                    id: result.insertId,
                    nome: req.body.nome,
                    sigla: req.body.sigla,
                    status: req.body.status
                }
                res.status(201).send({
                    code: "SUC-201",
                    msg: "Tipo de Pessoa cadastrado com Sucesso!",
                    date: hoje,
                    pessoas: pessoas
                });
            }
        );
    });
};

exports.patchPessoas = (req, res, next) => {
    mysql.getConnection( (error, conn) => {
        if ( error ) { return res.status(500).send({ error: error })}
        conn.query(
            `UPDATE FI_TIPO_PESSOA SET 
                TPP_NOME = ?, 
                TPP_SIGL = ?, 
                TPP_STAT = ? 
            WHERE TPP_PRIM = ?`,
            [req.body.nome, req.body.sigla, req.body.status, req.body.id],
            (error, result, filds) => {
                conn.release();
                if ( error ) { return res.status(500).send({ error: error })}
                const pessoas = {
                    id: req.body.id,
                    nome: req.body.nome,
                    sigla: req.body.sigla,
                    status: req.body.status
                }
                res.status(202).send({
                    code: "SUC-202",
                    msg: "Tipo de Pessoa atualizado com Sucesso!",
                    date: hoje,
                    pessoas: pessoas
                });
            }
        );
    });
};

exports.deletePessoas = (req, res, next) => {
    mysql.getConnection( (error, conn) => {
        if ( error ) { return res.status(500).send({ error: error })}
        conn.query(
            `DELETE FROM FI_TIPO_PESSOA WHERE TPP_PRIM = ?`,
            [req.body.id],
            (error, result, filds) => {
                conn.release();
                if ( error ) { return res.status(500).send({ 
                    code: "ERR-500",
                    msg: "Ocorreu um erro interno na sua solicitação, tente mais tarde. Se o problema persistir, contate o administrador"
                 })}
                const pessoas = {
                    id: req.body.id
                }
                res.status(202).send({
                    code: "SUC-202",
                    msg: "Tipo de Pessoa excluído com Sucesso!",
                    date: hoje,
                    pessoas: pessoas
                });
            }
        );
    });
};