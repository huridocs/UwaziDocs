import { Entity } from 'api/entities.v2/model/Entity';
import { GraphQueryResult } from '../GraphQueryResult';
import { EntityPointer, Relationship } from '../Relationship';

const path = [
  new Entity('1', 'en', '1', '1', {}),
  new Relationship('2', new EntityPointer('1'), new EntityPointer('3'), '2'),
  new Entity('3', 'en', '3', '3', {}),
  new Relationship('4', new EntityPointer('3'), new EntityPointer('5'), '4'),
  new Entity('5', 'en,', '5', '5', {}),
];

const result = new GraphQueryResult(path);

describe('when construting from a query matched path', () => {
  it('should segregate the contents by type', () => {
    expect(result.path).toBe(path);
    expect(result.entities).toEqual([path[0], path[2], path[4]]);
    expect(result.relationships).toEqual([path[1], path[3]]);
  });
});

describe('when calling leaf()', () => {
  it('should return the entity at the end of the path', () => {
    expect(result.leaf()).toBe(path[4]);
  });
});
