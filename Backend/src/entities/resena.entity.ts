// src/entities/resena.entity.ts
import {
  Entity,
  PrimaryKey,
  Property,
  ManyToOne,
  OneToMany,
  Collection,
  Enum,
} from '@mikro-orm/core';
import { Usuario } from './usuario.entity';
import { Libro } from './libro.entity';
import { Reaccion } from './reaccion.entity';

export enum EstadoResena {
  PENDING = 'pending',
  APPROVED = 'approved',
  FLAGGED = 'flagged',
}

@Entity()
export class Resena {
  @PrimaryKey({ autoincrement: true })
  id!: number;

  @Property({ type: 'text' })
  comentario!: string;

  @Property()
  estrellas!: number; // validar rango 0–5 en servicio antes de persistir

  @Enum(() => EstadoResena)
  estado: EstadoResena = EstadoResena.PENDING;

  @Property({ type: 'date', onCreate: () => new Date() })
  fechaResena!: Date;

  @ManyToOne(() => Usuario, { nullable: false })
  usuario!: Usuario;

  @ManyToOne(() => Libro, { nullable: false })
  libro!: Libro;

  @OneToMany(() => Reaccion, (reaccion) => reaccion.resena)
  reacciones = new Collection<Reaccion>(this);

  // Self-referencing for nested replies
  @ManyToOne(() => Resena, { nullable: true, deleteRule: 'cascade' })
  resenaPadre?: Resena;

  @OneToMany(() => Resena, (child) => child.resenaPadre)
  respuestas = new Collection<Resena>(this);

  @Property({ type: 'date', onCreate: () => new Date() })
  createdAt!: Date;

  @Property({ type: 'date', onUpdate: () => new Date(), nullable: true })
  updatedAt?: Date;
}
