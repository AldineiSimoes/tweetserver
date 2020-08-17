const jwt = require("jsonwebtoken");

async function validateToken(req, res , next) {
    const token = req.header('auth-token');
    if (!token) {
        return res.status(400).send({
            error: 'Acesso não permitido'
        })
    }
    try {
        const verified = await jwt.verify(token, process.env.JWT_SECRET);
        req.user = verified;
        next();
    } catch (err){
        res.status(400).send({
            error: 'Invalid token'
        })
    }
}

module.exports = validateToken;