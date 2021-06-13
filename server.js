const express = require('express');
const cors = require('cors');
const cheerio = require('cheerio');
const request = require('request');
const fetch = require('node-fetch');
const { v4: uuidv4 } = require('uuid');


require('dotenv').config();

const app=express();
//process.env.port chooses whatever port 
//the server you are deploying it on, chooses
const port = process.env.PORT||5000;

//MIDDLEWARE
app.use(cors());
app.use(express.json());


app.listen(port, ()=>{
    console.log(`Listening on port ${port}`);
})

app.get('/isstem/:word', async function (req, res) {
    console.log(req.params.word);
    request('https://scrabble.merriam.com/words/start-with/'+req.params.word,(error,response,html)=>
    {
        if(!error && response.statusCode==200){
            
            console.log("Stem exists");  
            res.json(true)
            
        }else{
            console.log("Doesn't exist");
            res.json(false);
        }

    });    
        
});

app.get('/isword/:word', async function (req, res) {

    request('https://scrabble.merriam.com/finder/'+req.params.word,(error,response,html)=>
    {
        console.log(req.params.word);
        if(!error && response.statusCode==200){
            console.log("in here");
            const $=cheerio.load(html);
            const result=$('.play_area').text().trim(); 
            if(result.includes('not')){
                console.log("not playble");
                res.json(false);
            }else{
                console.log("playable");
                res.json(true);
            }
            
        }else{
            console.log("error:");
        }


    });

    
    
        
});

let roomsAvailable=[];

const io = require('socket.io')(5001,{
    cors:{
        origin:['http://localhost:3000']
    }
})

io.on('connection', socket=>{
    
    //When there is user input from one player, send it to the opposing player
    socket.on('userinput',(letter, room)=>{
        console.log(letter);
        console.log(room);
        socket.to(room).emit("receive-letter",letter);
        
    })

    socket.on('join-room',(cb)=>{
        if(roomsAvailable.length==0){
            let room=uuidv4();
            roomsAvailable.push(room);
            socket.join(room);
            cb({yourTurn:true, room:room});
        }else{
            socket.join(roomsAvailable[0]);
            room=roomsAvailable.pop();
            cb({yourTurn:false, room:room});
        }
        
    })
    
})




