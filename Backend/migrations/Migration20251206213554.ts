import { Migration } from '@mikro-orm/migrations';

export class Migration20251206213554 extends Migration {

  override async up(): Promise<void> {
    this.addSql(`create table \`newsletter\` (\`id\` int unsigned not null auto_increment primary key, \`email\` varchar(255) not null, \`nombre\` varchar(255) null, \`fecha_suscripcion\` datetime not null, \`activo\` tinyint(1) not null default true, \`fecha_baja\` datetime null) default character set utf8mb4 engine = InnoDB;`);

    this.addSql(`create table \`password_reset_token\` (\`id\` int unsigned not null auto_increment primary key, \`usuario_id\` int unsigned not null, \`token\` varchar(255) not null, \`fecha_creacion\` datetime not null, \`fecha_expiracion\` datetime not null, \`usado\` tinyint(1) not null default false) default character set utf8mb4 engine = InnoDB;`);
    this.addSql(`alter table \`password_reset_token\` add index \`password_reset_token_usuario_id_index\`(\`usuario_id\`);`);

    this.addSql(`alter table \`password_reset_token\` add constraint \`password_reset_token_usuario_id_foreign\` foreign key (\`usuario_id\`) references \`usuario\` (\`id\`) on update cascade;`);
  }

  override async down(): Promise<void> {
    this.addSql(`drop table if exists \`newsletter\`;`);

    this.addSql(`drop table if exists \`password_reset_token\`;`);
  }

}
