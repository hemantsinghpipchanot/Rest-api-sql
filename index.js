const { faker } = require("@faker-js/faker");
const mysql = require("mysql2");
const express=require("express");
const app=express();
const path=require("path");
const port=8080;
const methodOverride = require('method-override');
const { v4: uuidv4 } = require('uuid');
app.use(methodOverride('_method'));
app.use(express.urlencoded({extended:true}));
const connection = mysql.createConnection({
  host: "localhost",
  user: "root",
  database: "delta_app",
  password: "He@20040701",
});
let getrandom = () => {
  return [
    faker.string.uuid(),
    faker.internet.userName(),
    faker.internet.email(),
    faker.internet.password(),
  ];
};
app.set("view engine","ejs");
app.set("views",path.join(__dirname,"/views"));
app.get("/",(req,res)=>{
  let q=`select count(*) from user`;
try{
connection.query(q,(err,result)=>{
  if(err) throw err;
  let count=result[0]["count(*)"];
  res.render("home.ejs",{count});
});
}  
catch(err){
 console.log(err);
 res.send("Some error in the DB");
}
});
app.get("/user",(req,res)=>{
  let q=`select id,username,email from user`;
  try{
    connection.query(q,(err,result)=>{
      if(err) throw err;
      res.render("show.ejs",{result});
    });
  }
  catch(err){
    console.log(err);
    res.send("Some error in the DB");
  }
});
app.get("/user/:id/edit",(req,res)=>{
  let {id}=req.params;
  let q=`select * from user where id='${id}'`;
  connection.query(q,(err,result)=>{
    try{
       if(err) throw err;
       let user=result[0];
       res.render("edit.ejs",{user});
    }
    catch(err){
      console.log(err);
      res.send("Some error in the DB");
    }
  });
});
app.patch("/user/:id",(req,res)=>{
  let {id}=req.params;
  let {username:newusername,password:formpass}=req.body;
  let q=`select password from user where id='${id}'`;
  connection.query(q,(err,result)=>{
    try{
       if(err) throw err;
       let orgpass=result[0].password;
       if(orgpass===formpass){
        let q=`update user set username='${newusername}' where id='${id}'`;
        connection.query(q,(err,result)=>{
             try{
              if(err) throw err;
              res.redirect("/user");
             }
             catch(err){
              console.log(err);
              res.send("Some error in the DB");
             }
        });
       }
       else{
        res.send("wrong password entered!");
       }
    }
    catch(err){
      console.log(err);
      res.send("Some error in the DB");
    }
  });
});
app.get("/user/new",(req,res)=>{
res.render("create.ejs");
});
app.post("/user",(req,res)=>{
    let  id=uuidv4();
    let {username,password,email}=req.body;
    let q=`insert into user (id,username,password,email) values (?,?,?,?)`;
    let user=[id,username,password,email];
    connection.query(q,user,(err,result)=>{
       try{
          if(err) throw err;
          res.redirect("/user");
       }
       catch(err){
        console.log(err);
        res.send("Some error in DB");
       }
    });
});
app.get("/user/:id",(req,res)=>{
  let {id}=req.params;
  res.render("delete.ejs",{id});
});
app.delete("/user/:id",(req,res)=>{
    let {id}=req.params;
    let {password:formpass,email:formemail}=req.body;
    let q=`select * from user where id='${id}'`;
    connection.query(q,(err,result)=>{
      try{
        if(err) throw err;
         let password=result[0].password;
         let email=result[0].email;
         if(password===formpass && formemail===email){
          let q=`delete from user where id='${id}'`;
          connection.query(q,(err,result)=>{
            try{
              if(err) throw err;
              res.redirect("/user");
            }
            catch(err){
              console.log(err);
              res.send("Some error in DB");
            }
          });
         }
         else{
          res.send("invalid password or email");
         }
      }
      catch(err){
        console.log(err);
        res.send("Some error in the DB");
      }
    })
});
app.listen(port,()=>{
  console.log(`server is listening at port ${port}`);
});
