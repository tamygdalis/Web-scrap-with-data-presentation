const jwt = require('jsonwebtoken')

function auth(req, res, next) {
    const token = req.cookies.token;
    if (token == "null") {
        res.status(401).send('Access denied!No token provided!')
    } else {
        try {
            const decoded = jwt.verify(token, 'jwtPrivateKey')
            req.xrhsths = decoded._id;
            next()
        }
        catch (ex) {
            res.status(400).send('Invalid token!')
        }
    }



}
module.exports = auth