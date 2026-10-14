import { sendError } from '../utils/apiResponse.js';

export const validateRequest = (schema) => {
  return async (req, res, next) => {
    try {
      if (schema.body) {
        req.body = await schema.body.parseAsync(req.body);
      }
      if (schema.query) {
        req.query = await schema.query.parseAsync(req.query);
      }
      if (schema.params) {
        req.params = await schema.params.parseAsync(req.params);
      }
      next();
    } catch (error) {
      if (error.errors) {
        const details = error.errors.map((e) => ({
          path: e.path.join('.'),
          message: e.message
        }));
        return sendError(res, 'VALIDATION_ERROR', 'Please correct the submitted fields', details, 400);
      }
      return sendError(res, 'VALIDATION_ERROR', error.message, [], 400);
    }
  };
};
