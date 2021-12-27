import { Request, Response } from "express";

export default function errorHandler(error: Error, req: Request, res: Response){
    if(error instanceof ResourceNotFoundError){
        res.status(404);
        res.send(error.message);
    }
    else if(error instanceof insufficientFundsError){
        res.status(422);
        res.send(error.message);
    }
    else {
        res.status(500)
        res.send('An unknown error occured');
    }

}

export class ResourceNotFoundError extends Error{
    constructor(message: string,){
        super(message);
    }
}
export class insufficientFundsError extends Error{
    constructor(message: string,){
        super(message);
    }
}