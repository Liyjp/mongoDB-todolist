'use strict';
const HTTP = require('http');
const FS = require('fs');
const MONGO_CLIENT = require('mongodb').MongoClient;
const DB_URL = "mongodb://localhost:27017/todolist";

let dbClient;

MONGO_CLIENT.connect(DB_URL, {useNewUrlParser: true}, function (err, db) {
    if (err) throw err;
    console.log("数据库已创建!");
    dbClient = db.db("todolist");
});

let server = HTTP.createServer(function (request, response) {
    console.log(request.method + ': ' + request.url);
    if (request.url === '/') {
        FS.readFile('index.html', (err, info) => {
            response.write(info);
            response.end();
        });
    } else if (request.url.startsWith('/statics')) {
        FS.readFile(__dirname + request.url, (err, info) => {
            response.write(info);
            response.end();
        });
    } else if (request.url === '/todo') {
        let data = "";
        switch (request.method) {
            case 'POST':
                console.log("post");
                break;
            case 'GET':
                console.log("get");
                findlist(response);
                break;
            case 'PUT':
                data = "";
                console.log("put");
                request.on("data" , (chunk)=>{
                    data += chunk;
                });
                request.on("end" , ()=>{
                    data = JSON.parse(data);
                    oplist(response,data);
                });
                break;
            case 'DELETE':
                console.log("delete");
                break;
        }
    }
});

function oplist(response,data){
    if (data.opt === "todo"){
        dbClient.collection("todo").insertOne({'data': data.data}, function (err, result) {
            if (err) throw err;
            console.log("Inserted into todo successfully");
            response.end();
        })
    } else if (data.opt === "done"){
        dbClient.collection("done").insertOne({'data':data.data}, function (err, result) {
            if (err) throw err;
            dbClient.collection("todo").deleteOne({'data':data.data}, function (err,result) {
                if (err) throw err;
                console.log("One todo change to done");
                response.end();
            })
        })
    } else if (data.opt === "delete"){
        dbClient.collection("todo").deleteOne({'data':data.data},function (err,result) {
            if (err) throw err;
            console.log("Delete one todo");
            response.end();
        })
    } else if (data.opt === "clear"){
        dbClient.collection("done").deleteMany({}, function (err,result) {
            if (err) throw err;
            console.log("Delete all done");
            response.end();
        })
    } else if (data.opt === "reset"){
        dbClient.collection("done").deleteOne({'data':data.data},function (err,result) {
            if (err) throw err;
            dbClient.collection("todo").insertOne({'data':data.data}, function (err,result) {
                if (err) throw err;
                console.log("Reset one done");
                response.end();
            })
        })
    }
}

function findlist(response){
    dbClient.collection("todo").find({},{'project':{'_id':0}}).toArray( (err ,todo)=> {
        if (err) throw err;
        dbClient.collection("done").find({},{'project':{'_id':0}}).toArray( (err,done)=>{
            if (err)throw err;
            response.end(JSON.stringify(
                {'todo':todo.map( (ele)=> {
                        return Object.values(ele)[0]
                    },
                    {'done':done.map( (ele)=>{
                        return Object.values(ele)[0]
                        })})}))
        })
    })
}

// 让服务器监听8080端口:
server.listen(8080);

console.log('Server is running at http://127.0.0.1:8080/');