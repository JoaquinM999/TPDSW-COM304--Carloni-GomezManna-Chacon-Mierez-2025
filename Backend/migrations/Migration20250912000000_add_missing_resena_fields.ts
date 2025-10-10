import { Migration } from '@mikro-orm/migrations';

export class Migration20250912000000_add_missing_resena_fields extends Migration {

  override async up(): Promise<void> {
    this.addSql(`alter table \`resena\` modify column \`comentario\` text not null;`);
    this.addSql(`alter table \`resena\` add column \`estado\` enum('pending', 'approved', 'flagged') not null default 'pending';`);
    this.addSql(`alter table \`resena\` add column \`created_at\` datetime not null default current_timestamp;`);
    this.addSql(`alter table \`resena\` add column \`updated_at\` datetime null on update current_timestamp;`);
  }

  override async down(): Promise<void> {
    this.addSql(`alter table \`resena\` drop column \`updated_at\`;`);
    this.addSql(`alter table \`resena\` drop column \`created_at\`;`);
    this.addSql(`alter table \`resena\` drop column \`estado\`;`);
    this.addSql(`alter table \`resena\` modify column \`comentario\` varchar(255) not null;`);
  }

}
