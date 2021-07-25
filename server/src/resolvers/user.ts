import {
    Resolver,
    Mutation,
    Ctx,
    Arg,
    InputType,
    Field,
    ObjectType,
    Query,
} from "type-graphql";
import { User } from "../entities/User";
import { MyContext } from "../types";
import argon2 from "argon2";

@InputType()
class UsernamePasswordInput {
    @Field()
    username: string;
    @Field()
    password: string;
}

@ObjectType()
class FieldError {
    @Field()
    field: string;

    @Field()
    message: string;
}

@ObjectType()
class UserResponse {
    @Field(() => [FieldError], { nullable: true })
    errors?: FieldError[];

    @Field(() => User, { nullable: true })
    user?: User;
}

@Resolver()
export class UserResolver {
    @Query(()=> User , { nullable : true })
    me(
        @Ctx() { req , em } : MyContext
    ){

        console.log('request session값 : ' , req.session);
        // 로그인 하지 않은 상태면 null
        if(!req.session.userId){
            return null 
        }

        // session에서 userId가져옴
        const user = em.findOne(User , {id : req.session.userId});
        return user;
    }

    @Mutation(() => UserResponse)
    async register(
        @Arg("options") options: UsernamePasswordInput,
        @Ctx() { em, req }: MyContext
    ): Promise<UserResponse> {
        if (options.username.length <= 2) {
            return {
                errors: [
                    {
                        field: "username",
                        message: "length must be greater than 2",
                    },
                ],
            };
        }

        if (options.password.length <= 3) {
            return {
                errors: [
                    {
                        field: "password",
                        message: "length must be greater than 3",
                    },
                ],
            };
        }
        const hashedPassword = await argon2.hash(options.password);
        const user = em.create(User, {
            username: options.username,
            password: hashedPassword,
        });

        try {
            await em.persistAndFlush(user);
        } catch (error) {
            console.error("[Error] message : ", error.message);
            if (
                error.code === "23505" ||
                error.detail.includes("already exists")
            ) {
                // 유저 중복 에러
                return {    
                    errors: [
                        {
                            field: "username",
                            message: "username already taken",
                        },
                    ],
                };
            }
        }

        // 회원가입 시 user id를 session에 저장
        // store user id session을 선택하면 사용자에게 쿠키가 설정됩니다.
        // logged in 상태로 유지합니다.
        req.session.userId = user.id;
        return { user };
    }

    // ObjectType으로 type을 정의해 return의 타입으로 받을 수 있음.
    @Mutation(() => UserResponse)
    async login(
        @Arg("options") options: UsernamePasswordInput,
        @Ctx() { em , req }: MyContext
    ): Promise<UserResponse> {
        const user = await em.findOne(User, { username: options.username });
        if (!user) {
            return {
                errors: [
                    {
                        field: "username",
                        message: "that username doesn't  exist",
                    },
                ],
            };
        }
        const valid = await argon2.verify(user.password, options.password);

        if (!valid) {
            return {
                errors: [
                    {
                        field: "password",
                        message: "incorrect password!",
                    },
                ],
            };
        }

        /**
         * uesr 객체를 session으로 request에 담아 보낼수 있다. user타입은 type.ts에서 타입 정의를 해줘야함.
         */
        // req.session.user = user;
        req.session.userId = user.id;
        return { user };
    }
}
