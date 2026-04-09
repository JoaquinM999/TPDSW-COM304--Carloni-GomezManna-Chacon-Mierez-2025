import { Migration } from '@mikro-orm/migrations';

export class Migration20260409103000_add_admin_catalog_soft_delete extends Migration {

  override async up(): Promise<void> {
    this.addSql('alter table `libro` add `created_by_admin` tinyint(1) not null default false, add `activo` tinyint(1) not null default true, add `deleted_at` datetime null;');
    this.addSql('alter table `libro` add index `libro_created_by_admin_index`(`created_by_admin`);');
    this.addSql('alter table `libro` add index `libro_activo_index`(`activo`);');

    this.addSql('alter table `autor` add `created_by_admin` tinyint(1) not null default false, add `activo` tinyint(1) not null default true, add `deleted_at` datetime null;');
    this.addSql('alter table `autor` add index `autor_created_by_admin_index`(`created_by_admin`);');
    this.addSql('alter table `autor` add index `autor_activo_index`(`activo`);');

    // Backfill: considerar administrables los registros locales ya existentes.
    this.addSql("update `libro` set `created_by_admin` = true where (`source` is null or `source` = 'local') and `external_id` is null;");
    this.addSql('update `autor` set `created_by_admin` = true where `google_books_id` is null and `open_library_key` is null;');
  }

  override async down(): Promise<void> {
    this.addSql('alter table `libro` drop index `libro_created_by_admin_index`;');
    this.addSql('alter table `libro` drop index `libro_activo_index`;');
    this.addSql('alter table `libro` drop `created_by_admin`, drop `activo`, drop `deleted_at`;');

    this.addSql('alter table `autor` drop index `autor_created_by_admin_index`;');
    this.addSql('alter table `autor` drop index `autor_activo_index`;');
    this.addSql('alter table `autor` drop `created_by_admin`, drop `activo`, drop `deleted_at`;');
  }

}
