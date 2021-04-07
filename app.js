const express = require("express");
const app = express();
const redisClient = require('./redis-client');
const bodyParser = require("body-parser");
const cors = require("cors");

function getTime(){
    const nTime = new Date();
    let fTime = nTime.getFullYear() + "/" + nTime.getMonth() + "/" + nTime.getDate() + " " +
                nTime.getHours() + ":" + nTime.getMinutes() + ":" + nTime.getSeconds();
    return fTime;
}

function getDifTime(getData, i){
    let timeStored = getData[i].split(" ")[1].split(":");
    let timeNow = getTime().split(" ")[1].split(":");

    let difTime = Math.abs(((((parseInt(timeNow[0]) - parseInt(timeStored[0])) * 60 * 60) + 
                ((parseInt(timeNow[1]) - parseInt(timeStored[1])) * 60))) - timeStored[2]);
    if(difTime != timeStored[2]) difTime += parseInt(timeNow[2]);
    else difTime = parseInt(timeNow[2]) - parseInt(timeStored[2]);

    return difTime;
}

app
    .use(cors())
    .use(bodyParser.json())
    .use(bodyParser.urlencoded({ extended: true }))
    .post("/setviewer", async (req, res)=>{
        const { state } = req.body;
        await redisClient.setAsync(state, getTime()) + "";
        res.json({status: "Added viewer"});
    })

    .post("/getviewer", async (req, res)=>{
        const { state, timeState } = req.body;
        const getData = await redisClient.getAsync(state, 0, -1);

        console.log(getData.length)

        if(getData.length == 0) res.json({count: 0})
        let count = 0;
        for(let i=0;i<getData.length;++i){
            let difTime = getDifTime(getData, i);
            if(difTime < timeState) count++;
            if(i == getData.length-1) res.json({count});
        }
    })

    .post("/delviewer", async (req, res)=>{
        const { state, timeState } = req.body;
        const getData = await redisClient.getAsync(state, 0, -1);

        for(let i=0;i<getData.length;++i){
            let difTime = getDifTime(getData, i);
            
            if(difTime > timeState){
                await redisClient.delAsync(state, 0, i);
                if(i == getData.length-1) await redisClient.delAsync(state, 1, 2);
            };
            if(i == getData.length-1) res.json({status: "Deleted viewer"});
        }
    })
    .listen(91, ()=>console.log(`> App running`));