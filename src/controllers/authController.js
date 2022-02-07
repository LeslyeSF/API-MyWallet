import bcrypt from 'bcrypt';
import { v4 as uuid } from 'uuid';
import db from "../db.js";

export async function signUp(req,res){
  const user = {
    ...req.body,
    records:[]
  };
  
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
}
export async function signIn(req,res){
  const login = req.body;

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
      res.status(200).send({token: sessionVerify.token});
      return;
    }
    const token = uuid();
    await db.collection("Sessions").insertOne({
      idUser: user._id,
      token: token
    });
    res.status(200).send({token: token});

  }catch(err){
    res.status(500).send(err);
    console.log(err);
  }
}