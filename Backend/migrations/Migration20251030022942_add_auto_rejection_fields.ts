import { Migration } from '@mikro-orm/migrations';

export class Migration20251030022942_add_auto_rejection_fields extends Migration {

  override async up(): Promise<void> {
    this.addSql(`alter table \`resena\` add \`auto_rejected\` tinyint(1) null, add \`rejection_reason\` text null, add \`deleted_at\` date null;`);
  }

  override async down(): Promise<void> {
    this.addSql(`alter table \`resena\` drop column \`auto_rejected\`, drop column \`rejection_reason\`, drop column \`deleted_at\`;`);
  }

}
