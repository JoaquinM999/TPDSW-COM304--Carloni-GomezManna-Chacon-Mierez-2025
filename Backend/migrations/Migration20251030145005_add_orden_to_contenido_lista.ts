import { Migration } from '@mikro-orm/migrations';

export class Migration20251030145005_add_orden_to_contenido_lista extends Migration {

  override async up(): Promise<void> {
    this.addSql(`alter table \`contenido_lista\` add \`orden\` int null;`);
  }

  override async down(): Promise<void> {
    this.addSql(`alter table \`contenido_lista\` drop column \`orden\`;`);
  }

}
