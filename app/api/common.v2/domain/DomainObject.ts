import { IdentifiedDomainObject, IdentifiedDomainObjectProps } from './IdentifiedDomainObject';

type DomainObjectProps = IdentifiedDomainObjectProps;

export abstract class DomainObject extends IdentifiedDomainObject {}

export type { DomainObjectProps };
