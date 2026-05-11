export class EntityManager {
  constructor() {
    this.entities = new Set();
  }

  add(entity) {
    this.entities.add(entity);
    return entity;
  }

  update(delta, context) {
    for (const entity of this.entities) {
      entity.update?.(delta, context);
    }
  }

  findByType(type) {
    return [...this.entities].filter(entity => entity.type === type);
  }

  clear() {
    for (const entity of this.entities) {
      entity.dispose?.();
    }
    this.entities.clear();
  }
}
