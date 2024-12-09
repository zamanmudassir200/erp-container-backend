import Joi from 'joi';

export const clientValidation = Joi.object({
  username: Joi.string().min(3).max(30).required(), 
  email: Joi.string().email().required(),
  password: Joi.string()
    .pattern(new RegExp('^(?=.*[A-Z])(?=.*[!@#$%^&*])(?=.*[0-9])(?=.{8,})'))
    .required()
    .messages({
      'string.pattern.base':
        'Password must be at least 8 characters long, include 1 uppercase letter, 1 number, and 1 special character.',
    }),
  confirmPassword: Joi.any()
    .valid(Joi.ref('password'))
    .required()
    .messages({ 'any.only': 'Passwords must match' }),
  phone: Joi.string().pattern(new RegExp('^\\+?[0-9]{10,15}$')).required(),

});

// Login validation schema
export const loginValidation = Joi.object({
  username: Joi.string().required(), // Login with username
  password: Joi.string()
    .pattern(new RegExp('^(?=.*[A-Z])(?=.*[!@#$%^&*])(?=.*[0-9])(?=.{8,})'))
    .required()
    .messages({
      'string.pattern.base':
        'Password must be at least 8 characters long, include 1 uppercase letter, 1 number, and 1 special character.',
    }),
});
