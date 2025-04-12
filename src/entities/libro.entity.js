var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
import { Entity, PrimaryKey, Property } from '@mikro-orm/core';
let Libro = class Libro {
};
__decorate([
    PrimaryKey(),
    __metadata("design:type", Number)
], Libro.prototype, "id", void 0);
__decorate([
    Property(),
    __metadata("design:type", String)
], Libro.prototype, "title", void 0);
__decorate([
    Property(),
    __metadata("design:type", String)
], Libro.prototype, "author", void 0);
__decorate([
    Property(),
    __metadata("design:type", Number)
], Libro.prototype, "publicationYear", void 0);
__decorate([
    Property({ nullable: true }),
    __metadata("design:type", String)
], Libro.prototype, "genre", void 0);
Libro = __decorate([
    Entity()
], Libro);
export { Libro };
export { Libro as Book }; // Aquí exportamos Libro como Book
