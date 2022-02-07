import db from "../db.js";

export async function verifyTokenMiddleware(req,res, next){
  const { authorization } = req.headers;
  const token = authorization?.replace('Bearer ', '');
  try{
    const sessionVerify = await db.collection("Sessions").findOne({token: token});
    if(!sessionVerify){
      res.sendStatus(404);
      return;
    }
    res.locals.sessionVerify = sessionVerify;
  } catch(err){
    res.status(500).send(err);
    return;
  }
  

  next();
}