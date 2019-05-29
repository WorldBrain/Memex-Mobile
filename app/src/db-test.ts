import { createConnection, getRepository, ManyToMany, JoinTable, ManyToOne } from 'typeorm/browser';
import { Entity, Column, PrimaryGeneratedColumn, OneToMany } from "typeorm/browser";
import {EntitySchema} from "typeorm";

export const PostEntity = new EntitySchema({
    name: "post",
    columns: {
        id: {
            type: Number,
            primary: true,
            generated: true
        },
        title: {
            type: String
        },
        text: {
            type: String
        }
    },
});

export async function runDatabaseTest() {
    await createConnection({
        type: 'react-native',
        database: 'test',
        location: 'default',
        logging: ['error', 'query', 'schema'],
        synchronize: true,
        entities: [
            PostEntity as any,
        ]
    });
    
    const postRepository = getRepository(PostEntity as any);
    const result = await postRepository.save({
        title: 'Bla',
        text: 'Body'
    });
    
    console.log("Post has been saved");
    
    const loadedPost = await postRepository.findOne({where: {}});
    
    if (loadedPost) {
        console.log("Post has been loaded: ", loadedPost);
    }
}
