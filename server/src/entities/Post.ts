import { Entity, PrimaryKey , Property } from '@mikro-orm/core';

/**
 * Post : 유저들 게시글에 대한 table!
 * Property는 db의 컬럼들로 들어감
 */
 @Entity()
 export class Post {
 
   @PrimaryKey()
   id!: number;
 
   @Property({type: "date"})
   createdAt = new Date();
   
   // hoc 
   @Property({ type: "date", onUpdate : () => new Date() })
   updatedAt = new Date();
 
   @Property( {type : "text"})
   title!: string;
 
 }