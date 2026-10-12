import z from 'zod'
import {AppError} from "../gobalErrorHandler/appError.js";

 export function validateBody(dto,body) {
    const result = dto.safeParse(body)
     if (result.success === false) {
         const errMessage = result.error.issues.map(issue => `${issue.path[0]} : ${issue.message}`)
         const error =  new AppError(errMessage.join(',') , 401);
         error.errMessage = errMessage;
         throw error;
     }
     return result.data;
 }