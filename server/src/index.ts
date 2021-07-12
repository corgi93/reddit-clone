import { MikroORM } from "@mikro-orm/core";
// import { Post } from './entities/Post';
import microConfig from './mikro-orm.config';
import express from 'express';
import {ApolloServer} from 'apollo-server-express';
import {buildSchema} from 'type-graphql';

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
     * schema : 
     */
    const apolloServer = new ApolloServer({
       schema: await buildSchema({
           resolvers : [],
           validate : false
       }) 
    })

    app.get('/' , (_ ,res) => {
        res.send('hello');
    })

    app.listen(4000 , () => {
        console.log('server is running on localhost:4000')
    })

    // Post를 DB에 생성해보자
    // const post = orm.em.create(Post, {title : 'my first post!!'})
    // await orm.em.persistAndFlush(post)

    // const posts = await orm.em.find(Post , {})
    // console.log('---- posts ----' , posts);
};

main().catch(err => {
    console.error(err);
});