import express from "express";
import cors from "cors";
import { MongoClient } from "mongodb";
import dotenv from "dotenv";
import Joi from "joi";
import bcrypt from 'bcrypt';

const server = express();
server.use(cors());
server.use(express.json());
dotenv.config();

const mongoClient = new MongoClient (process.env.MONGO_URI);
let db;
mongoClient.connect(()=>{
  db = mongoClient.db("MyWallet");
});

const userSchema = Joi.object({
  name: Joi.string().required(),
  email: Joi.string().email().required(),
  password: Joi.string().required()
});

server.post("/register", async (req,res)=>{
  const user = req.body;
  const validation = userSchema.validate(user, { abortEarly: true });

  if (validation.error) {
    console.log(validation.error.details);
    res.sendStatus(422);
  }

  try{
    const userverify = await db.collection("Users").findOne({email: user.email});
    if(userverify){
      res.status(409).send("Já existe uma conta com este email!");
    }
    const cryptPassword = bcrypt.hashSync(user.password, 10);
    user.password = cryptPassword;
    await db.collection("Users").insertOne(user);
    res.sendStatus(201);
    //console.log(bcrypt.compareSync(user.password, cryptPassword));
  } catch(err){
    res.status(500).send(err);
  }
  //validacao dos dados com joi         
  //verificar se o email ja esta em uso 
  //criptografar a senha                
  //salvar no banco o cadastro colecao USERS
  //responder com 201
});

server.post("/login", async(req,res)=>{
  //recebe email e senha 
  //validar os dados com joi
  //buscar no sistema o email
  //verificar se a senha e compativel
  //criar o token
  //salvar o token+iduser em outra colecao SESSIONS
  //responder com status 200 e o token
});
server.get("/dates", async(req,res)=>{
  //receber token
  //verificar se existe alguma sessao com esse token
  //enviar dados do user correspondente e status 200
});
server.post("/registration", async(req,res)=>{
  //receber token, valor, descricao, status
  //verificar se token existe 
  //validar os dados recebidos
  //buscar os dados do usuario
  //gerar um id para o registro
  //gerar uma data
  //salvar o registro
  //mandar para o cliente 201
});
server.delete("/deleteregister", async(req,res)=>{
  //receber token e id do registro
  //verificar se token existe 
  //buscar usuario
  //buscar registro
  //verificar se existe
  //deletar registro
  //responder com 200
});
server.delete("/endsession", async(req,res)=>{
  //receber o token
  //verificar se token existe
  //delete token
  //responde com 200
});
server.put("/editregister", async(req,res)=>{
  //receber o token, id do registro, valor, descricao e status
  //verificar se o token existe
  //validar os dados recebidos
  //busca o usuaro
  //busca o registro
  //atualiza os dados do registro
  //responde com status 200
});



server.listen(5000, ()=>{
  console.log("Running app in http://localhost:5000");
});