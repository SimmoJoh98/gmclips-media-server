const express = require('express')
const app = express()
const PORT = process.env.PORT || 3012
const multer = require('multer')
const upload = multer()
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
    ).catch(err => res.status(403).send('db error'))
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
    ).catch(err => res.status(403).send('db error'))
})

//create a post
app.post('/srvc/post', upload.single('media_payload'), async (req,res) => {
    let {postDesc, user, date, userID} = req.body
    let tmp = req.file
    let file64 = tmp.buffer.toString('base64')

    
    let imgID
    await SQL.query(`
    INSERT INTO "Images"(img_data, img_type)
    VALUES('${file64}', '${tmp.mimetype}')
    RETURNING img_id;
    `).then(
        dbres => {
            imgID = dbres[0]
        }
        ).catch(err => console.log(err))
        
    let postID
    await SQL.query(`
    INSERT INTO "Post"(post_desc, img_id, post_owner)
    VALUES('${postDesc}', ${imgID[0].img_id}, ${userID})
    RETURNING post_id;
    `).then(
        dbres => {
            postID = dbres[0]
        }
        ).catch(err => console.log(err))
    
    await SQL.query(`
    UPDATE "Users"
    SET user_posts = user_posts || ${postID[0].post_id}
    WHERE user_id = ${userID}
    `).then(
        dbres => {
            res.status(200).send(`post created!`)
        }
    ).catch(err => console.log(err))
    
})


app.listen(PORT, () => console.log(`gmcmedia on ${PORT}`))