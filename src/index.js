import express from "express";
import cors from "cors";
import { MongoClient } from "mongodb";
import dotenv from "dotenv";
import Joi from "joi";
import bcrypt from 'bcrypt';
import { v4 as uuid } from 'uuid';
import dayjs from "dayjs";

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
  password: Joi.string().required(),
  records: Joi.required()
});
const loginSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().required()
});
const recordSchema = Joi.object({
  idRecord: Joi.string(),
  description: Joi.string().required(),
  value: Joi.string().required(),
  status: Joi.string().valid("output", "input").required()
});

server.post("/register", async (req,res)=>{
  const user = {
    ...req.body,
    records:[]
  };
  const validation = userSchema.validate(user, { abortEarly: true });

  if (validation.error) {
    console.log(validation.error.details);
    res.sendStatus(422);
    return;
  }

  try{
    const userverify = await db.collection("Users").findOne({email: user.email});
    if(userverify){
      res.status(409).send("Já existe uma conta com este email!");
      return;
    }
    const cryptPassword = bcrypt.hashSync(user.password, 10);
    user.password = cryptPassword;
    await db.collection("Users").insertOne(user);
    res.sendStatus(201);
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
  const login = req.body;
  const validation = loginSchema.validate(login, { abortEarly: true });

  if (validation.error) {
    console.log(validation.error.details);
    res.sendStatus(422);
    return;
  }

  try{
    const user = await db.collection("Users").findOne({email: login.email});
    if(!user){
      res.status(404).send("email errado");
      return;
    }
    const userVerify = bcrypt.compareSync(login.password, user.password);
    if(!userVerify){
      res.status(404).send("senha errada");
      return;
    } 
    const sessionVerify = await db.collection("Sessions").findOne({idUser: user._id});
    if(sessionVerify){
      res.status(200).send(sessionVerify.token);
      return;
    }
    const token = uuid();
    await db.collection("Sessions").insertOne({
      idUser: user._id,
      token: token
    });
    res.status(200).send(token);

  }catch(err){
    res.status(500).send(err);
  }
  //recebe email e senha                            v
  //validar os dados com joi                        v 
  //buscar no sistema o email                       v
  //verificar se a senha e compativel               v
  //criar o token                                   v
  //salvar o token+iduser em outra colecao SESSIONS v
  //responder com status 200 e o token              v
  //Verificar se ja existe uma sessao com o usuario v
});

server.get("/dates", async(req,res)=>{
  const { authorization } = req.headers;
  const token = authorization?.replace('Bearer ', '');
  try{
    const sessionVerify = await db.collection("Sessions").findOne({token: token});
    if(!sessionVerify){
      res.sendStatus(404);
      return;
    }
    const user = await db.collection("Users").findOne({_id: sessionVerify.idUser});
    delete user._id;
    delete user.password;
    res.status(200).send(user);
    
  } catch(err){
    res.status(500).send(err);
  }
  res.send(token);
  //receber token                                     v
  //verificar se existe alguma sessao com esse token  v
  //enviar dados do user correspondente e status 200  v
});

server.post("/registration", async(req,res)=>{
  const { authorization } = req.headers;
  const token = authorization?.replace('Bearer ', '');
  let record = req.body;

  const validation = recordSchema.validate(record, { abortEarly: true });

  if (validation.error) {
    console.log(validation.error.details);
    res.sendStatus(422);
    return;
  }
  try{
    const sessionVerify = await db.collection("Sessions").findOne({token: token});
    if(!sessionVerify){
      res.sendStatus(404);
      return;
    }
    const user = await db.collection("Users").findOne({_id: sessionVerify.idUser});
    record = {
      idRecord: uuid(),
      ...record,
      day: dayjs().format("DD/MM")
    };
    user.records.push(record);
    await db.collection("Users").updateOne({ 
			_id: user._id 
		}, { $set: user });
    res.sendStatus(201);

  }catch(err){
    res.status(500).send(err);
  }
  //receber token, valor, descricao, status v
  //verificar se token existe               v
  //validar os dados recebidos              v
  //buscar os dados do usuario              v
  //gerar um id para o registro             v
  //gerar uma data                          v
  //salvar o registro                       v
  //mandar para o cliente 201               v
});

server.delete("/deleteregister", async(req,res)=>{
  const { authorization } = req.headers;
  const token = authorization?.replace('Bearer ', '');
  let { idRecord } = req.body;
  try{
    const sessionVerify = await db.collection("Sessions").findOne({token: token});
    if(!sessionVerify){
      res.sendStatus(404);
      return;
    }
    const user = await db.collection("Users").findOne({_id: sessionVerify.idUser});
    const newRecords = user.records.filter((date)=> date.idRecord !== idRecord);
    await db.collection("Users").updateOne({ 
			_id: user._id 
		}, { $set: {records: newRecords} });

    res.sendStatus(200);
  }catch(err){
    res.status(500).send(err);
  }
  //receber token e id do registro  v
  //verificar se token existe       v  
  //buscar usuario                  v
  //buscar registro                 v
  //verificar se existe             v
  //deletar registro                v
  //responder com 200               v
});

server.delete("/endsession", async(req,res)=>{
  const { authorization } = req.headers;
  const token = authorization?.replace('Bearer ', '');
  try{
    const sessionVerify = await db.collection("Sessions").findOne({token: token});
    if(!sessionVerify){
      res.sendStatus(404);
      return;
    }
    await db.collection("Sessions").deleteOne({_id: sessionVerify._id});
    res.sendStatus(200);
  }catch(err){
    res.status(500).send(err);
  }
  //receber o token             v
  //verificar se token existe   v
  //delete token                v
  //responde com 200            v
});

server.put("/editregister", async(req,res)=>{
  const { authorization } = req.headers;
  const token = authorization?.replace('Bearer ', '');
  let recordUpdate = req.body;

  const validation = recordSchema.validate(recordUpdate, { abortEarly: true });

  if (validation.error) {
    console.log(validation.error.details);
    res.sendStatus(422);
    return;
  }
  try{
    const sessionVerify = await db.collection("Sessions").findOne({token: token});
    if(!sessionVerify){
      res.sendStatus(404);
      return;
    }

    const user = await db.collection("Users").findOne({_id: sessionVerify.idUser});
    const newRecords = user.records.map((date)=>{
      if(date.idRecord === recordUpdate.idRecord){
        date.value = recordUpdate.value;
        date.description = recordUpdate.description;
      }
      return date;
    });
    await db.collection("Users").updateOne({ 
			_id: user._id 
		}, { $set: {records: newRecords} });
    res.sendStatus(200);
  }catch(err){
    res.status(500).send(err);
  }
});



server.listen(5000, ()=>{
  console.log("Running app in http://localhost:5000");
});