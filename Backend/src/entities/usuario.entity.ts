import { Entity, PrimaryKey, Property, BeforeCreate, BeforeUpdate } from '@mikro-orm/core';
import bcrypt from 'bcrypt';

export enum RolUsuario {
  USUARIO = 'usuario',
  ADMIN = 'admin',
}

@Entity()
export class Usuario {

  @PrimaryKey()
  id!: number;

  @Property()
  email!: string;

  @Property()
  password!: string;

  @Property()
  username!: string;

  @Property({ columnType: 'varchar(20)' })
  rol: RolUsuario = RolUsuario.USUARIO;

  @Property({ nullable: true })
  refreshToken?: string;

  async validatePassword(password: string): Promise<boolean> {
    return bcrypt.compare(password, this.password);
  }

  @BeforeCreate()
  @BeforeUpdate()
  async hashPasswordHook(): Promise<void> {
    // Solo hashea si la password cambió y no está ya hasheada
    if (this.password && !this.password.startsWith('$2b$')) {
      const saltRounds = 10;
      this.password = await bcrypt.hash(this.password, saltRounds);
    }
  }
}
