import loginSchema from "../schemas/loginSchema.js";

export function validateLoginSchemaMiddleware(req,res, next){
  const login = req.body;
  const validation = loginSchema.validate(login, { abortEarly: true });

  if (validation.error) {
    console.log(validation.error.details);
    res.sendStatus(422);
    return;
  }

  next();
}