const express = require('express')
const app = express()
const PORT = process.env.PORT || 3012
const upload = require('multer')
const Sequelize = require('sequelize')
const cors = require('cors')

require('dotenv').config()
const DBXS = process.env.DBXS
const SQL = new Sequelize(DBXS, {
    dialect: 'postgres',
    dialectOptions: {
        ssl: {
            rejectUnauthorized: false
        }
    }
})

app.use(express.json())
app.use(cors())


//get user posts 
app.get(`/srvc/usrposts`, async (req,res) => {
    let {user, userID} = req.query

    await SQL.query(`
    SELECT * 
    FROM "Post"
    WHERE post_owner = ${userID}
    `).then(
        dbres => {
            res.status(200).send(dbres[0])
        }
    ).catch(err => console.log(err))
})

//gets images for posts.
app.get(`/srvc/images`, async (req,res) => {
    let {imgIds} = req.query

    SQL.query(`
    SELECT * 
    FROM "Images"
    WHERE img_id IN (${imgIds})
    `).then(
        dbres => {
            res.status(200).send(dbres[0])
        }
    ).catch(err => console.log(err))
})



app.listen(PORT, () => console.log(`gmcmedia on ${PORT}`))