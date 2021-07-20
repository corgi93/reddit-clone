import { Resolver, Query,Mutation, Ctx, Arg, Int } from "type-graphql";
import { Post } from "../entities/Post";
import { MyContext } from "../types";
@Resolver()
export class PostResolver {
    @Query(() => [Post])
    posts(@Ctx() { em }: MyContext): Promise<Post[]> {
        return em.find(Post, {});
    }

    // 옵션으로 nullable true로 null을 리턴할 수 있게. return타입은 Post이거나 없으면 null로 
    @Query(() => Post , {nullable : true})
    post(
        @Arg("id", () => Int) id: number,
        @Ctx() { em }: MyContext
    ): Promise<Post | null> {
        return em.findOne(Post, { id });
    }

    // 생성(Create)
    @Mutation(() => Post)
    async createPost(
        @Arg("title", () => String) title: string,
        @Ctx() { em }: MyContext
    ): Promise<Post> {
        const post = em.create(Post, { title });
        await em.persistAndFlush(post);
        return post;
    }
}
