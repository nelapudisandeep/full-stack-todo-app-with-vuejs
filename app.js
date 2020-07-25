const express = require('express');
const cors = require('cors');
const app = express();
const port = process.env.PORT || 3000;
const Datastore = require('nedb');
const db = new Datastore({filename: 'data.db',autoload:true}); // this will create a database instance and auto load the database for me to work with!
const dateFn = require('date-fns');
const {formatDistance,subDays} = dateFn;

app.listen(port,()=>console.log('listeing on port : ',port));

// middlewares
app.use(cors());
app.use(express.json());
app.use(express.static('client'));

// routes
app.get('/',(req,res)=>{
    res.json({
        message:'status good!',
    });
});

// add a todo from the client to the database
app.post('/todo',(req,res)=>{
    // /console.log(req.body);
    // inserting into the database!
    const data = req.body;
    const timeStamp = Date.now();
    // console.log(req.body,timeStamp);
    data.timeStamp = timeStamp;
    data.badgeText = formatDistance(new Date(timeStamp), new Date());
    // console.log(data);
    db.insert(data,(err,newDoc)=>{
        if(err){
            res.statusCode = 500;
            res.end
            return
        }else{
            res.json(newDoc);
        }
    });
});

app.get('/all',(req,res)=>{
    db.find({})
    .sort({timeStamp : 1})
    .exec((err,docs)=>{
        if(err){
            res.statusCode = 500;
            res.end;
            return
        }else{
            // console.log(docs);
            docs.forEach(doc=>{
                doc.badgeText = formatDistance(new Date(doc.timeStamp),new Date());
            }); 
            res.json(JSON.stringify(docs));
        }
    });
});

// update a todo with the id sent from client
app.post('/updateTodo',(req,res)=>{
    db.update({_id : req.body.id},{$set : {status : req.body.status}},{ multi: false },(err,numReplaced)=>{
        if(err){
            res.statusCode = 500;
            res.end
            return
        }else{
            res.json({
                message:'Update successful!',
                replace : numReplaced
            });
        }
    });
}); 

// delete all todos
app.get('/deleteAll',(req,res)=>{
    db.remove({}, { multi: true }, (err, numRemoved)=>{
        if(err){
            res.statusCode = 500;
            res.end;
            return;}
        else{
            res.json({
                message:'Deleted all successfully!',
                numRemoved : numRemoved
            });
        }
    });
});


// delete particular todo
app.post('/deleteTodo',(req,res)=>{
    db.remove({ _id: req.body.id }, {multi : true}, (err, numRemoved) => {
        if(err){
            res.statusCode = 500;
            res.end;
            return
        }else{
            res.json({
                message : 'Delete success!',
                numRemoved : numRemoved
            })
        }
      });
});
