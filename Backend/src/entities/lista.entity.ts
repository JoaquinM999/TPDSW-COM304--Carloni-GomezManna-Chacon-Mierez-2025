import { Entity, PrimaryKey, Property, ManyToOne, OneToMany, Collection } from '@mikro-orm/core';
import { Usuario } from './usuario.entity';
import { Libro } from './libro.entity';

@Entity()
export class Lista {
  @PrimaryKey()
  id!: number;

  @Property()
  nombre!: string;

  @Property()
  ultimaModificacion: Date = new Date();

  @ManyToOne()
  usuario!: Usuario;

  @OneToMany(() => Libro, libro => libro.lista)
  contenidos = new Collection<Libro>(this);
}
