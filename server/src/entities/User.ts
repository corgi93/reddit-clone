import { Entity, PrimaryKey, Property } from "@mikro-orm/core";
import { Field, ObjectType } from "type-graphql";

// type-graphql에서 클래스를 object타입을 데코레이트 해야한다.
/**
 * User : 유저 정보에 대한 table!
 * Property는 db의 컬럼들로 들어감
 */
@ObjectType()
@Entity()
export class User {
    @Field()
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
    @Property({ type: "text" , unique : true })
    username!: string;

    @Field()
    @Property({ type: "text" })
    password!: string;
}
