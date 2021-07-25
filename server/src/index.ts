/**
 * reflect-metadata 패키지로 @Entity 또는 @Column같은 데코레이터와 함께 작동하는
 * typeorm이기 때문에 reflect-metadata는 데코레이터를 구문 분석하고 SQL쿼리를 빌드하는 데 사용
 */
import "reflect-metadata";
import { MikroORM } from "@mikro-orm/core";
import microConfig from "./mikro-orm.config";
// import {Post} from './entities/Post';
import express from "express";
import { ApolloServer } from "apollo-server-express";
import { buildSchema } from "type-graphql";
import { HelloResolver } from "./resolvers/hello";
import { PostResolver } from "./resolvers/post";
import { UserResolver } from "./resolvers/user";

/**
 * redis - cache memory추가
 */
import redis from "redis";
import session from "express-session";
import connectRedis from "connect-redis";
import { __prod__ } from "./constants";
import { MyContext } from "./types";

const main = async () => {
    // MikroORM 초기화
    /**
     * entities : db의 테이블들에 일치한다.
     * debug : production환경이 아닐 경우만x`
     */
    const orm = await MikroORM.init(microConfig);
    await orm.getMigrator().up();

    // exrpess app 할당
    const app = express();

    /**
     * redis 설정 및 미들웨어 추가
     * express 미들웨어는 순서가 중요한데
     * apolloMiddleware 전에 session middleware를 타야된다.
     *
     * disableTouch 속성은 re-saving을 disable하게하고 touch를 사용할 때, TTL을 resetting함. default : fales
     */
    const RedisStore = connectRedis(session);
    const redisClient = redis.createClient();
    app.use(
        session({
            name: "qid",
            store: new RedisStore({
                client: redisClient,
                disableTouch: true,
                disableTTL: true,
            }),
            cookie: {
                maxAge: 1000 * 60 * 60 * 24 * 365 * 10, // 10 years
                httpOnly: true,
                sameSite: "lax", // csrf
                secure: __prod__, //cookie only works in https
            },
            saveUninitialized: false,
            secret: "123qweasdzxc",
            resave: false,
        })
    );

    /**
     * Apollo server 생성!
     * introspection, playground 속성 ture해야 로컬 서버 띄워줌.
     * schema :
     */
    const apolloServer = new ApolloServer({
        introspection: true,
        playground: true,
        schema: await buildSchema({
            resolvers: [HelloResolver, PostResolver, UserResolver],
            validate: false,
        }),
        // context는 실행 컨텍스트 - 실행할 코드에 제공할 환경 정보들을 모아놓은 객체
        context: ({ req, res }): MyContext => ({ em: orm.em, req, res }),
    });
    apolloServer.applyMiddleware({ app, cors: false });

    app.listen(4000, () => {
        console.log("server is running on localhost:4000");
    });

    // Post를 DB에 생성해보자
    // const post = orm.em.create(Post, {title : 'my first post!!'})
    // await orm.em.persistAndFlush(post)

    // const posts = await orm.em.find(Post , {})
    // console.log('---- posts ----' , posts);
};

main().catch((err) => {
    console.error(err);
});
