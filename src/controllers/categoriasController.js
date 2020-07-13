const mysql = require('../mysql').pool;

let hoje = new Date(Date.now());
hoje = hoje.getFullYear() + '-' + (hoje.getMonth() + 1) + '-' + hoje.getDate();

exports.getCategorias = (req, res, next) => {
    mysql.getConnection( (error, conn) => {
        if ( error ) { return res.status(500).send({ error: error })}
        conn.query(
            'SELECT * FROM FI_TIPO_CATEGORIA WHERE TPC_STAT < 9',
            (error, result, filds) => {
                conn.release();
                if ( error ) { return res.status(500).send({ error: error })}
                const categorias = result;

                res.status(200).send({
                    code: "SUC-200",
                    msg: "Lista de todas as categorias",
                    date: hoje,
                    categorias: categorias
                });
            }
        );
    });
};

exports.getCategoriasId = (req, res, next) => {
    mysql.getConnection( (error, conn) =>{
        if ( error ) { return res.status(500).send({ error: error })}
        conn.query(
            'SELECT * FROM FI_TIPO_CATEGORIA WHERE TPC_STAT < 9 AND TPC_PRIM = ?',
            [req.params.id],
            (error, result, filds) => {
                conn.release();
                if ( error ) { return res.status(500).send({ error: error })}
                const categoria = result;

                res.status(200).send({
                    code: "SUC-200",
                    msg: "Busca de categorias por ID",
                    date: hoje,
                    categorias: categoria
                });
            }
        )
    });
};

exports.postCategorias = (req, res, next) => {
    mysql.getConnection( (error, conn) => {
        if ( error ) { return res.status(500).send({ error: error })}
        conn.query(
            'INSERT INTO FI_TIPO_CATEGORIA (TPC_NOME, TPC_STAT) VALUES (?,?)',
            [req.body.nome, req.body.status],
            (error, result, filds) => {
                conn.release();
                if ( error ) { return res.status(500).send({ error: error })}
                const categoria = {
                    id: result.insertId,
                    nome: req.body.nome,
                    status: req.body.status
                }
                res.status(201).send({
                    code: "SUC-201",
                    msg: "Categoria cadastrada com Sucesso!",
                    date: hoje,
                    categoria: categoria
                });
            }
        );
    });
};

exports.patchCategorias = (req, res, next) => {
    mysql.getConnection( (error, conn) => {
        if ( error ) { return res.status(500).send({ error: error })}
        conn.query(
            `UPDATE FI_TIPO_CATEGORIA SET 
                TPC_NOME = ?, 
                TPC_STAT = ? 
            WHERE TPC_PRIM = ?`,
            [req.body.nome, req.body.status, req.body.id],
            (error, result, filds) => {
                conn.release();
                if ( error ) { return res.status(500).send({ error: error })}
                const categorias = {
                    id: req.body.id,
                    nome: req.body.nome,
                    status: req.body.status
                }
                res.status(202).send({
                    code: "SUC-202",
                    msg: "Categoria atualizada com Sucesso!",
                    date: hoje,
                    categorias: categorias
                });
            }
        );
    });
};

exports.deleteCategorias = (req, res, next) => {
    mysql.getConnection( (error, conn) => {
        if ( error ) { return res.status(500).send({ error: error })}
        conn.query(
            `DELETE FROM FI_TIPO_CATEGORIA WHERE TPC_PRIM = ?`,
            [req.body.id],
            (error, result, filds) => {
                conn.release();
                if ( error ) { return res.status(500).send({ 
                    code: "ERR-500",
                    msg: "Ocorreu um erro interno na sua solicitação, tente mais tarde. Se o problema persistir, contate o administrador"
                 })}
                const categorias = {
                    id: req.body.id
                }
                res.status(202).send({
                    code: "SUC-202",
                    msg: "Categoria excluída com Sucesso!",
                    date: hoje,
                    categorias: categorias
                });
            }
        );
    });
};