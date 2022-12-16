import crypto from "crypto";

require('dotenv').config()
import express from 'express'
import bodyParser from 'body-parser'
import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()
const port = process.env.PORT || 3000
const sha256 = process.env.SHA256 || "secret"

const app = express()
app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json())
app.use(express.static('wwwroot'))

const verify_token = function (req : express.Request, res : express.Response, next : express.NextFunction) {
    if (!req.headers.hasOwnProperty("apitoken")) return res.sendStatus(403)

    const token = req.headers['apitoken'] as string
    if (crypto.createHash("sha256").update(token).digest("hex") === sha256) {
        next()
    } else {
        res.sendStatus(403)
    }
}


app.post('/api/data', async (req, res) => {
    const data = req.body
    await prisma.user.create({
        data: {
            name: data.name,
            email: data.email,
        }
    })
    res.sendStatus(200)
})

app.get('/api/data', verify_token, async (req, res) => {
    const result = await prisma.user.findMany()
    res.json(result)
})


// -----------------------------------
// LISTEN
// -----------------------------------
app.listen(port, () => {
    console.log(`App listening at http://localhost:${port}`)
})
// -----------------------------------
