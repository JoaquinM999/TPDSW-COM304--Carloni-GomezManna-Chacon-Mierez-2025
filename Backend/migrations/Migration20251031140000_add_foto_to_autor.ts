import { Migration } from '@mikro-orm/migrations';

export class Migration20251031140000_add_foto_to_autor extends Migration {
  async up(): Promise<void> {
    // Agregar campo foto a tabla autor
    this.addSql('ALTER TABLE `autor` ADD `foto` VARCHAR(500) NULL;');
  }

  async down(): Promise<void> {
    // Revertir cambios
    this.addSql('ALTER TABLE `autor` DROP COLUMN `foto`;');
  }
}
