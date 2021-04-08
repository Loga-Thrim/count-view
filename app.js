const express = require("express");
const app = express();
const redisClient = require('./redis-client');
const bodyParser = require("body-parser");
const cors = require("cors");

app
    .use(cors())
    .use(bodyParser.json())
    .use(bodyParser.urlencoded({ extended: true }))
    .post("/setviewer", async (req, res)=>{
        const { state } = req.body;
        const nTime = new Date();
        await redisClient.setAsync(state, nTime.getTime());
        res.json({status: "Added viewer"});
    })

    .post("/getviewer", async (req, res)=>{
        const { state, timeState } = req.body;
        const getData = await redisClient.getAsync(state, 0, -1);

        const cTime = new Date(Date.now() - (timeState - 1) * 1000).getTime();
        dataFil = getData.filter(timeStored => timeStored > cTime);
        let count = dataFil.length;
        if(getData.length == 0) count = 0
        res.json({count})
    })

    .post("/delviewer", async (req, res)=>{
        const { state, timeState } = req.body;
        const getData = await redisClient.getAsync(state, 0, -1);

        const cTime = new Date(Date.now() - (timeState - 1) * 1000).getTime();
        for(let i=0;i<getData.length;++i){
            if(getData[i] < cTime){
                await redisClient.delAsync(state, 0, i);
                if(i == getData.length-1) await redisClient.delAsync(state, 1, 2);
            };
            if(i == getData.length-1) res.json({status: "Deleted viewer"});
        }
    })
    .listen(91, ()=>console.log(`> App running`));