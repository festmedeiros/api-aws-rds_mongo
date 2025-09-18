require('dotenv').config();
const express = require('express');
const app = express();
const cors = require('cors');

app.use(cors({
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: '*'
}));

//swagger
const swaggerDocs = require('./swagger');
//S3
const AWS = require('aws-sdk');
//#region S3
AWS.config.update({
    region: process.env.REGION,
    accessKeyId: process.env.ACCESS_KEY_ID,
    secretAccessKey: process.env.SECRET_ACCESS_KEY,
    sessionToken: process.env.SESSION_TOKEN
});

const s3 = new AWS.S3();

/**
 * @swagger
 * /buckets:
 *   get:
 *     summary: Lista todos os buckets
 *     tags: 
 *       - Buckets
 *     responses:
 *       200:
 *         description: Lista de todos os buckets
 */
app.get('/buckets', async (req, res) => {
    try {
        console.log('Buckets encontrados', req);
        res.status(200).json();
    } catch (error) {
        console.log("Erro ao buscar buckets", req, error);
        res.status(500).json({ error: 'Erro ao listar buckets', details: error });
    }
});

/**
 * @swagger
 * /buckets/{bucketName}:
 *   get:
 *     summary: Lista os objetos de um bucket
 *     tags: 
 *       - Buckets
 *     parameters:
 *       - in: path
 *         name: bucketName
 *         required: true
 *         description: Nome do bucket
 *     responses:
 *       200:
 *         description: Lista dos objetos do bucket
 */
app.get('/buckets/:bucketName', async (req, res) => {

    try {
        console.log('Objetos encontrados', req);
        res.status(200).json();
    } catch (error) {
        console.log("Erro ao buscar objetos", req, error);
        res.status(500).json({ error: 'Erro ao listar objetos do bucket', details: error });
    }
});

/**
 * @swagger
 * /buckets/{bucketName}/upload:
 *   post:
 *     summary: Faz o upload de um arquivo para um bucket
 *     tags: 
 *       - Buckets
 *     parameters:
 *       - in: path
 *         name: bucketName
 *         required: true
 *         description: Nome do bucket
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               file:
 *                 type: string
 *                 format: binary
 *     responses:
 *       200:
 *         description: Arquivo enviado com sucesso
 */
//Utilizar alguma lib para fazer o upload/strem de arquivos, sugestão: multer
// Configuração do multer para armazenar em memória
const upload = multer({ storage: multer.memoryStorage() });
app.post('/buckets/:bucketName/upload', upload.single('file'), async (req, res) => {

    try {

        //Implementar Upload....

        console.log('Upload efetuado', req);
        res.status(200).json();
    } catch (error) {
        console.log('Erro ao efetuar upload', req, error);
        res.status(500).json({ message: 'Erro no upload', error: error.message });
    }
});

/**
 * @swagger
 * /buckets/{bucketName}/file/{fileName}:
 *   delete:
 *     summary: Deleta um arquivo específico de um bucket
 *     tags: 
 *       - Buckets
 *     parameters:
 *       - in: path
 *         name: bucketName
 *         required: true
 *         description: Nome do bucket
 *       - in: path
 *         name: fileName
 *         required: true
 *         description: Nome do arquivo a ser deletado
 *     responses:
 *       200:
 *         description: Arquivo deletado com sucesso
 */
app.delete('/buckets/:bucketName/file/:fileName', async (req, res) => {
    try {
        //Implementar remoção....

        console.log('Objeto removido', req);
    } catch (error) {
        console.log("Erro ao remover objeto", req, error);
    }
});
//#endregion

//#region MySql
/**
 * @swagger
 * /init-db:
 *   post:
 *     summary: Cria o banco de dados e a tabela produto
 *     responses:
 *       200:
 *         description: Banco de dados e tabela criados com sucesso
 */
app.post('/init-db', async (req, res) => {
    try {
      const createDB = `CREATE DATABASE IF NOT EXISTS \`${DB_NAME}\`; USE \`${DB_NAME}\`;
        CREATE TABLE IF NOT EXISTS produto (
          Id INT AUTO_INCREMENT PRIMARY KEY,
          Nome VARCHAR(255) NOT NULL,
          Descricao VARCHAR(255) NOT NULL,
          Preco DECIMAL(10,2) NOT NULL
        );`;
      await pool.query(createDB);
      res.send('Banco de dados e tabela criados com sucesso.');
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });
  
  /**
   * @swagger
   * /produtos:
   *   get:
   *     summary: Lista todos os produtos
   *     responses:
   *       200:
   *         description: Lista de produtos
   */
  app.get('/produtos', async (req, res) => {
    try {
      await pool.query(`USE \`${DB_NAME}\``);
      const [rows] = await pool.query('SELECT * FROM produto');
      res.json(rows);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });
  
  /**
   * @swagger
   * /produtos/{id}:
   *   get:
   *     summary: Busca um produto pelo ID
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: integer
   *     responses:
   *       200:
   *         description: Produto encontrado
   *       404:
   *         description: Produto não encontrado
   */
  app.get('/produtos/:id', async (req, res) => {
    try {
      await pool.query(`USE \`${DB_NAME}\``);
      const [rows] = await pool.query('SELECT * FROM produto WHERE id = ?', [req.params.id]);
      if (rows.length === 0) return res.status(404).json({ error: 'Produto não encontrado' });
      res.json(rows[0]);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });
  
  /**
   * @swagger
   * /produtos:
   *   post:
   *     summary: Cria um novo produto
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             required:
   *               - Nome
   *               - Descricao
   *               - Preco
   *             properties:
   *               Nome:
   *                 type: string
   *               Descricao:
   *                 type: string
   *               Preco:
   *                 type: number
   *     responses:
   *       201:
   *         description: Produto criado
   */
  app.post('/produtos', async (req, res) => {
    const { Nome, Descricao, Preco } = req.body;
    try {
      await pool.query(`USE \`${DB_NAME}\``);
      const [result] = await pool.query(
        'INSERT INTO produto (Nome, Descricao, Preco) VALUES (?, ?, ?)',
        [Nome, Descricao, Preco]
      );
      res.status(201).json({ id: result.insertId });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });
  
  /**
   * @swagger
   * /produtos/{id}:
   *   put:
   *     summary: Atualiza um produto
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: integer
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             required:
   *               - Nome
   *               - Descricao
   *               - Preco
   *             properties:
   *               Nome:
   *                 type: string
   *               Descricao:
   *                 type: string
   *               Preco:
   *                 type: number
   *     responses:
   *       200:
   *         description: Produto atualizado
   *       404:
   *         description: Produto não encontrado
   */
  app.put('/produtos/:id', async (req, res) => {
    const { Nome, Descricao, Preco } = req.body;
    try {
      await pool.query(`USE \`${DB_NAME}\``);
      const [result] = await pool.query(
        'UPDATE produto SET Nome = ?, Descricao = ?, Preco = ? WHERE Id = ?',
        [Nome, Descricao, Preco, req.params.id]
      );
      if (result.affectedRows === 0) return res.status(404).json({ error: 'Produto não encontrado' });
      res.json({ message: 'Produto atualizado com sucesso' });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });
  
  /**
   * @swagger
   * /produtos/{id}:
   *   delete:
   *     summary: Deleta um produto
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: integer
   *     responses:
   *       200:
   *         description: Produto deletado com sucesso
   *       404:
   *         description: Produto não encontrado
   */
  app.delete('/produtos/:id', async (req, res) => {
    try {
      await pool.query(`USE \`${DB_NAME}\``);
      const [result] = await pool.query('DELETE FROM produto WHERE Id = ?', [req.params.id]);
      if (result.affectedRows === 0) return res.status(404).json({ error: 'Produto não encontrado' });
      res.json({ message: 'Produto deletado com sucesso' });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });

//#endregion


swaggerDocs(app);
app.listen(3000, () => console.log('Servidor rodando na porta 3000'));
