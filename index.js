const http = require('http');
const path = require('path');
const fs = require ('fs');
const {Client} = require('pg');
const client = new Client({
    user: "postgres",
    password: "5570358735Adg",
    host: "localhost",
    database: "mainbase"
})



const server = http.createServer((req, res) => {
    let filePath = path.join(__dirname,
         '',
          req.url === '/' ? 'index.html' : req.url
        );

    let extname = path.extname(filePath);

    let contentType = 'text/html';

    switch(extname){
        case '.js':
            contentType = 'text/javascript';
            break;
        case '.css':
            contentType = 'text/css';
            break;
        case '.json':
            contentType = 'application/json';
            break;
        case '.png':
            contentType = 'image/png';
            break;
        case '.jpg':
            contentType = 'image/jpg';
            break;
    }

    
    
    fs.readFile(filePath, (err, content) => {
        if (err){
            if (err.code == 'ENOENT'){
                fs.readFile(path.join(__dirname, '', '404.html'), (err, content) => {
                   res.writeHead(200, { 'Content-Type': 'text/html' });
                   res.end(content, 'utf8');
                });
            }
            else {
                res.writeHead(500);
                res.end('Server error: ' + err.code);
            }
        }
        else{
            res.writeHead(200, {'Content-Type': contentType});
            res.end(content, 'utf8');
            console.log(filePath, contentType);
        }
    });
});

// const {Client} = require('pg');

// const client = new Client({
//     user: "postgres",
//     password: "5570358735Adg",
//     host: "localhost",
//     database: "mainbase"
// })


// async function register(){
//     var name = document.getElementById("name").value;
//     alert(name);
//     try{
//     await client.connect();
    
//     alert("add");
//     await client.query("insert into test value ("+name+")");
//     }
//     catch(ex){
//         console.log("Error: " + ex);
//         alert("error");
//     }
//     finally{
//         await client.end();
//         console.log("Client disconnected.");
//         alert("finally");
//     }
// }




const PORT = process.env.PORT || 5000;

server.listen(PORT , () => console.log('Server running on port ' + PORT));


async function register(){
    try{
    await client.connect();
    console.log("Connected succ");
    const results = await client.query("select * from test");
    console.table(results.rows);
    }
    catch (ex){
        console.log("MISTAKE IS:" + ex);
    }
    finally{
        await client.end();
        console.log ("Disconnected");
    }
}

module.exports.register = register;