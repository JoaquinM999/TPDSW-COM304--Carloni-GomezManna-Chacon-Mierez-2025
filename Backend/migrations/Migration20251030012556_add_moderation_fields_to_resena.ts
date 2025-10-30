import { Migration } from '@mikro-orm/migrations';

export class Migration20251030012556_add_moderation_fields_to_resena extends Migration {

  override async up(): Promise<void> {
    this.addSql(`alter table \`resena\` add \`moderation_score\` int null, add \`moderation_reasons\` text null, add \`auto_moderated\` tinyint(1) null;`);
  }

  override async down(): Promise<void> {
    this.addSql(`alter table \`resena\` drop column \`moderation_score\`, drop column \`moderation_reasons\`, drop column \`auto_moderated\`;`);
  }

}
