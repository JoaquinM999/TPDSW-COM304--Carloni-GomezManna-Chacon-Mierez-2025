// src/entities/seguimiento.entity.ts
import { Entity, PrimaryKey, ManyToOne, Property } from '@mikro-orm/core';
import { Usuario } from './usuario.entity';

@Entity()
export class Seguimiento {
  @PrimaryKey()
  id!: number;

  @ManyToOne(() => Usuario)
  seguidor!: Usuario;

  @ManyToOne(() => Usuario)
  seguido!: Usuario;

  @Property()
  fechaSeguido: Date = new Date();
}
