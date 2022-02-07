import { v4 as uuid } from 'uuid';
import dayjs from "dayjs";
import db from "../db.js";

export async function getData(req,res){
  const { authorization } = req.headers;
  const token = authorization?.replace('Bearer ', '');
  const {sessionVerify} = res.locals;
  try{
    const user = await db.collection("Users").findOne({_id: sessionVerify.idUser});
    delete user._id;
    delete user.password;
    res.status(200).send(user);
    
  } catch(err){
    res.status(500).send(err);
  }
  res.send(token);
}
export async function inputRecord(req,res){
  const { authorization } = req.headers;
  const token = authorization?.replace('Bearer ', '');
  let record = req.body;
  const {sessionVerify} = res.locals;
  try{
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
}
export async function deleteRecord(req,res){
  const { authorization } = req.headers;
  const token = authorization?.replace('Bearer ', '');
  let idRecord = req.query.idRecord;
  const {sessionVerify} = res.locals;
  try{
    const user = await db.collection("Users").findOne({_id: sessionVerify.idUser});
    const newRecords = user.records.filter((date)=> date.idRecord !== idRecord);
    await db.collection("Users").updateOne({ 
			_id: user._id 
		}, { $set: {records: newRecords} });

    res.sendStatus(200);
  }catch(err){
    res.status(500).send(err);
  }
}
export async function endSession(req,res){
  const { authorization } = req.headers;
  const token = authorization?.replace('Bearer ', '');
  const {sessionVerify} = res.locals;
  try{
    await db.collection("Sessions").deleteOne({_id: sessionVerify._id});
    res.sendStatus(200);
  }catch(err){
    res.status(500).send(err);
  }
}
export async function editRecord(req,res){
  const { authorization } = req.headers;
  const token = authorization?.replace('Bearer ', '');
  let recordUpdate = req.body;
  const {sessionVerify} = res.locals;

  try{
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
}