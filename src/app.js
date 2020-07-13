const express = require("express");
const app = express();
const morgan = require('morgan');
const bodyParser = require('body-parser');

const rotaPessoas = require('./routes/pessoas');
const rotaCategorias = require('./routes/categorias');
const rotaUsers = require('./routes/users');

// documentação da API
const swaggerUi = require('swagger-ui-express');
const yamlJs = require('yamljs');
const swgCategorias = yamlJs.load('./src/docs/categorias.yml');
const swgPessoas = yamlJs.load('./src/docs/pessoas.yml');
const swgUsers = yamlJs.load('./src/docs/users.yml');

app.use(morgan('dev'));
app.use(bodyParser.urlencoded( { extended: false } ));
app.use(bodyParser.json());

app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*'); //Aceita requisições de todos o servidores
//    res.header('Access-Control-Allow-Origin', 'http://api.ricks.com.br'); //Aceita requisições apenas deste servidor
    res.header(
        'Access-Control-Allow-Header',
        'Origin, X-Requested-With, Content-Type, Authorization'
    )
    if (req.method === 'OPTIONS'){
        res.header('Access-Control-Allow-Methods', 'GET, POST, PATCH, DELETE');
        return res.status(200).send({});
    }
    next();
});

app.use('/pessoas', rotaPessoas);
app.use('/categorias', rotaCategorias);
app.use('/users', rotaUsers);

app.use('/docs/categorias', swaggerUi.serve, swaggerUi.setup(swgCategorias));
app.use('/docs/pessoas', swaggerUi.serve, swaggerUi.setup(swgPessoas));
app.use('/docs/users', swaggerUi.serve, swaggerUi.setup(swgUsers));

app.use((req, res, next) => {
    const erro = new Error('Rota não encontrada...');
    erro.status = 404;
    erro.code = 404;
    erro.msg = 'Rota não encontrada';
    erro.date = null;

    next(erro)
});
app.use((error, req, res, next) => {
    res.status(error.status || 500);
    return res.send({
        error: {
            code: error.code, 
            msg: error.msg,
            date: error.date
        }
    });
});


module.exports = app;