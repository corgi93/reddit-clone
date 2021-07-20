import { Entity, PrimaryKey, Property } from "@mikro-orm/core";
import { Field, Int, ObjectType } from "type-graphql";

// type-graphql에서 클래스를 object타입을 데코레이트 해야한다.
/**
 * Post : 유저들 게시글에 대한 table!
 * Property는 db의 컬럼들로 들어감
 */
@ObjectType()
@Entity()
export class Post {
    @Field(() => Int)
    @PrimaryKey()
    id!: number;

    @Field(() => String)
    @Property({ type: "date" })
    createdAt = new Date();

    // hoc
    @Field(() => String)
    @Property({ type: "date", onUpdate: () => new Date() })
    updatedAt = new Date();

    @Field()
    @Property({ type: "text" })
    title!: string;
}
