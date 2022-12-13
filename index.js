const express = require('express')
const { download } = require('express/lib/response')
const app = express()
const PORT = process.env.PORT || 3000
const router = express.Router()
const axios = require('axios')
const Fs = require('fs')
const Path = require('path')
const uuid = require('uuid')
const { env } = require('process')
const sharp = require('sharp')

router.use((req, res, next) => {
    loggingToConsole("==== DEBUG ROUTE ====")
    loggingToConsole(req.hostname)
    loggingToConsole(req.ip)
    loggingToConsole(req.method)
    loggingToConsole(req.params)
    loggingToConsole(req.path)
    next()
})

router.get('/', async (req, res) => {
    try {
        const { width, height, url } = req.query
        if(!width || !height || !url) { 
            return res.status(400).send()
        }
        const file = await downloadURL(url, width, height)
        // const result = await resize(file, width, height)
        // await Fs.promises.unlink(file)
        return res.contentType('image/jpeg').send(file)
    } catch (err) {
        console.log(err)
        return res.status(400).end()
    }
})

// function to download image file or attempt to download file
async function downloadURL(url, width, height) {
    const path = Path.resolve(__dirname, 'caches', `file-${uuid.v4()}`)
    if (process.env.DEBUG) {
        console.log("=== resolved path ===")
        console.log(path)
    }
    return new Promise(async (resolve, reject) => {
        axios.get(url, { responseType: 'arraybuffer', maxContentLength: 520000000000000 })
        .then(response => {
            return sharp(response.data)
            .resize({
                width: Number(width),
                height: Number(height),
                fit: sharp.fit.fit,
                background: { r: 255, g: 255, b: 255, alpha: 1.0 }
            })
            .png()
            .toBuffer()
        })
        .then(image => {
            resolve(image)
        })
        .catch(err => {
            reject(err)
        })
    })
}

async function resize(path, width, height) {
    return new Promise((resolve, reject) => {
        sharp(path)
        .resize({
            width: Number(width),
            height: Number(height),
            fit: sharp.fit.fit,
            background: { r: 255, g: 255, b: 255, alpha: 1.0 }
        })
        .jpeg({ mozjpeg: true })
        .toBuffer()
        .then(data => { resolve(data) })
        .catch(err => { reject(err) })
    })
}

function loggingToConsole(data) {
    if (process.env.DEBUG) {
        console.log(data)
    }
}

app.use('/', router)
app.listen(PORT, () => {
    console.log(`Up and running on port ${PORT}`)
})