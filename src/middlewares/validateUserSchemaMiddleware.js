import userSchema from '../schemas/userSchema.js';

export function validateUserSchemaMiddleware(req, res, next){
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

  next();
}