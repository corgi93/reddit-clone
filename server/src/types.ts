import { EntityManager, Connection, IDatabaseDriver } from "@mikro-orm/core";
import { Request, Response } from "express";
import ExpressSession from 'express-session';
// import { User } from "./entities/User";


declare module 'express-session'{
    interface Session {
        userId : number;
        // user: User;
    }
}

export type MyContext = {
    em: EntityManager<any> & EntityManager<IDatabaseDriver<Connection>>;
    req: Request & { session: ExpressSession.Session };
    res: Response;
};
