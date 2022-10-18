const express = require("express");
const { increment, sequelize } = require("../models/mystore");
const router = express.Router();
const myStore = require("../models/mystore");


router.get("/:userId", async(req, res, next) => {
    try{

        const store = await myStore.findOne({
            where: {id: Number(req.params.userId)},
        })
        console.log('qwer', store);
        if (store) return res.status(200).send(store);
    } catch (error) {
        console.error(error);
        next(error);
    }
});

router.post("/:userId", async(req, res, next) => {
    try{ 
        const {sellCount, introduce, button, createdAt } = req.body;
        await myStore.update(
            {sellCount: sellCount, introduce: introduce, button: button, createdAt: createdAt},
            {where: {id: Number(req.params.userId)}},
        );

    }catch(error){
        console.log(error);
        next(error);
    }
})

router.post("/button/:userId", async(req, res, next) => {
    try{ 
        const {button} = req.body;
        await myStore.update(
            {button: button},
            {where: {id: Number(req.params.userId)}},
        );
    }catch(error){
        console.log(error);
        next(error);
    }
})

router.patch("/:userId", async(req, res, next) => {
    try{ 
        await myStore.update(
            {sellCount: sequelize.literal('sellCount + 1')},
            {where: {id: Number(req.params.userId)}},
        );
    }catch(error){
        console.log(error);
        next(error);
    }
})

module.exports = router;