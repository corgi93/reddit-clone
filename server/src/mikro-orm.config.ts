import { __prod__ } from "./constants";
import { Post } from "./entities/Post";
import { MikroORM } from '@mikro-orm/core';
import path from 'path';
import { User } from './entities/User';

/**
 * Parameters의 첫번째 ele로 해당 object로 세팅을 넘겨주도록 하는 듯.
 */

export default {
    migrations : {
        path: path.join(__dirname ,'./migrations'), // path to the folder with migrations
        pattern: /^[\w-]+\d+\.[tj]s$/, // regex pattern for the migration files
    },
    entities: [Post, User],
    dbName: "gurwl", 
    password : "5118586",
    type: "postgresql",
    debug: !__prod__,
} as Parameters<typeof MikroORM.init>[0];
