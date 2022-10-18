const express = require('express')
const { isLoggedIn } = require("./middlewares");
const multer = require('../src/multers');
const Chatcontent = require("../models/chatcontent");
const { Op } = require('sequelize');
const router = express.Router();

router.get('/chatview', async (req, res) => {
    try{
        const chatcontents = await Chatcontent.findAll({
        where:{
            id: req.query.room
        }
      })
      console.log(chatcontents)
    if(chatcontents) res.send(chatcontents);
    }catch (error){
        console.log(error);
        next(error);
        }
    })

router.post('/uploadImg', multer.upload.array('image'), async (req, res) =>{
    let urlArr = [];
    req.files.forEach(async (v) => {
        urlArr.push(v.location)
    })
    res.send(urlArr);
    })


module.exports = router