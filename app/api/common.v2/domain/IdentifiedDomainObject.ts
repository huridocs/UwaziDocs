export type IdentifiedDomainObjectProps = {
  id: string;
};

export abstract class IdentifiedDomainObject {
  id: string;

  constructor({ id }: IdentifiedDomainObjectProps) {
    this.id = id;
  }
}
