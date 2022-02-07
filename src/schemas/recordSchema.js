import Joi from "joi";

const recordSchema = Joi.object({
  idRecord: Joi.string(),
  description: Joi.string().required(),
  value: Joi.string().required(),
  status: Joi.string().valid("output", "input").required()
});

export default recordSchema;