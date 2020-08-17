const { Router } = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const authenticate = require("./auth");
const User = require("../models/User");
const Tweet = require("../models/Tweet");
require("dotenv").config;

const router = new Router();

router.get('/', (req, res) => {
    res.send('Ok, conectado');
})

//Criar usuario
router.post('/register', async (req, res, next) => {
    try {
        const { username, password } = req.body;
        // Verificar se username é valido
        const userExists = await User.findOne({ username });

        if (userExists) return res.status(400).send({ error: "Username está em uso." });

        const salt = await bcrypt.genSalt(10);
        const hash = await bcrypt.hash(password, salt);

        //Criar novo usuário no banco
        const user = await User.create({
            username,
            password: hash
        })

        res.status(201).send({
            id: user.id,
            username: user.username
        });
    } catch (err) {
        res.status(400)
        next(err);
    }
})

router.post("/login", async (req, res, next) => {
    try {
        // Verifica se usuario é valido
        const { username, password } = req.body;
        const user = await User.findOne({ username });

        if (!user) return res.status(400).send({ error: "Usuário não encontrado" });

        //Verifica senha
        const validPassword = await bcrypt.compare(password, user.password);

        if (!validPassword) return res.status(400).send({ error: "Senha inálida" });
        
        const token = jwt.sign({ _id: user.id }, process.env.JWT_SECRET);
        res.header('auth-token', token).send(token)


    } catch (err) {
        res.status(400);
        next(err);
    }
})

//Criar Tweet
router.post('/tweets', authenticate, async (req, res, next) => {
    const { content } = req.body;
    try {
        const tweet = await Tweet.create({ owner: User.id, content });

        if (!tweet) return res.status(400).send({ error: 'Tweet não criado' })

        res.status(201).send(tweet);

    } catch (err) {
        res.status(400);
        next(err);
    }
})

//Delete tweet especifico
router.delete('tweets/:id', authenticate, async (req, res, next) => {
    const { id } = req.params;
    try {
        await Tweet.deleteOne(id);
        res.status(200).send({ message: 'Tweet apagado' });
    } catch (err) {
        res.status(400);
        next(err);
    }
})

//Atualizar twee especifico (like/unlike)

router.put('tweets/:id', authenticate, async (req, res, next) => {
    const { id } = req.params;
    try {
        const tweet = Tweet.findById(id);
        if (!tweet) return res.status(400).send({ error: "Tweet não encontrado" });

        if (tweet.owner === req.user._id) return res.status(400).send({ error: "Impossivel atualizar" });

        const tweetAlreadLiked = tweet.likes.some(like => like != req.user._id);
        if (tweetAlreadLiked) {
            tweet.likes = tweet.likes.filter(like => like != req.user._id);
        } else {
            tweet.likes.push(req.user._id);
        }

        (await tweet).save;

        res.status(200).send(tweet);

    } catch (err) {
        res.status(400);
        next(err);
    }
})

//Encontrar usuarios
router.get('/users', authenticate, async (req, res, next) => {
    try {
        const users = await User.find();
        if (!users.length) return res.status(400).send({ error: 'Impossivel ler usuarios' });

        res.status(200).send(users.map(user => (
            {
                _id: user.id,
                username: user.username
            }
        )))
    } catch (err) {
        res.status(400);
        next(err);
    }
})

router.get('/tweets', authenticate, async (req, res, next) => {
    try {
        const tweets = await Tweet.find();
        res.status(200).send(tweets);
    } catch (err) {
        res.status(400);
        next(err);
    }
})

router.get('/tweets/:id', authenticate, async (req, res, next) => {
    const { id } = req.params;
    try {
        const tweet = await Tweet.findById(id);
        if (!tweet) return res.status(400).send({erro: 'Tweet não encontrado'});

        res.status(200).send(tweet);

    } catch (err) {
        res.status(400);
        next(err);
    }

})

module.exports = router