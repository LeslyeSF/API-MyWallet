import recordSchema from "../schemas/recordSchema.js";

export function validateRecordSchemaMiddleware(req,res, next){
  const record = req.body;

  const validation = recordSchema.validate(record, { abortEarly: true });

  if (validation.error) {
    console.log(validation.error.details);
    res.sendStatus(422);
    return;
  }

  next();
}