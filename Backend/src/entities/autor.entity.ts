// src/entities/autor.entity.ts
import { Entity, PrimaryKey, Property, OneToMany, Collection, Index, Cascade } from '@mikro-orm/core';
import { Libro } from './libro.entity';

@Entity()
export class Autor {
  @PrimaryKey()
  id!: number;

  @Property()
  @Index() // índice para búsquedas rápidas por nombre
  nombre!: string;

  @Property()
  @Index()
  apellido!: string;

  @Property({ length: 500, nullable: true })
  foto?: string; // URL de la foto del autor

  @OneToMany(() => Libro, libro => libro.autor, { cascade: [Cascade.PERSIST, Cascade.REMOVE] })
  libros = new Collection<Libro>(this);

  @Property({ type: 'date', onCreate: () => new Date() })
  createdAt: Date = new Date();

  @Property({ type: 'date', onUpdate: () => new Date(), nullable: true })
  updatedAt?: Date;
}
