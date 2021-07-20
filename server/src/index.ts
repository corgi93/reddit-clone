/**
 * reflect-metadata 패키지로 @Entity 또는 @Column같은 데코레이터와 함께 작동하는
 * typeorm이기 때문에 reflect-metadata는 데코레이터를 구문 분석하고 SQL쿼리를 빌드하는 데 사용
 */
import 'reflect-metadata';
import { MikroORM } from "@mikro-orm/core";
import microConfig from "./mikro-orm.config";
import {Post} from './entities/Post';
import express from "express";
import { ApolloServer } from "apollo-server-express";
import { buildSchema } from "type-graphql";
import { HelloResolver } from "./resolvers/hello";
import { PostResolver } from "./resolvers/post";

const main = async () => {
    // MikroORM 초기화
    /**
     * entities : db의 테이블들에 일치한다.
     * debug : production환경이 아닐 경우만
     */
    const orm = await MikroORM.init(microConfig);
    await orm.getMigrator().up();

    // exrpess app 할당
    const app = express();

    /**
     * Apollo server 생성!
     * introspection, playground 속성 ture해야 로컬 서버 띄워줌.
     * schema :
     */
    const apolloServer = new ApolloServer({
        introspection: true,
        playground: true,
        schema: await buildSchema({
            resolvers: [HelloResolver, PostResolver],
            validate: false,
        }),
        context: () => ({ em: orm.em }),
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
