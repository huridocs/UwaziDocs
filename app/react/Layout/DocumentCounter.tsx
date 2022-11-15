import React from 'react';
import { Translate } from 'app/I18N';

export interface EntityCounterProps {
  selectedEntitiesCount: number;
  entityListCount: number;
  entityTotal: number;
  totalConnectionsCount?: number;
  hitsTotalRelation: string;
}

export const DocumentCounter = (props: EntityCounterProps) => {
  const {
    totalConnectionsCount,
    selectedEntitiesCount,
    entityListCount,
    entityTotal,
    hitsTotalRelation,
  } = props;
  const totalEntitiesValue = <b> {`${entityTotal}${hitsTotalRelation === 'gte' ? '+' : ''}`} </b>;
  const entityCounter = (
    <>
      {selectedEntitiesCount > 0 && (
        <>
          <b> {selectedEntitiesCount} </b> <Translate>selected of</Translate>
        </>
      )}
      <b> {entityListCount} </b> <Translate>shown of</Translate>
      {totalEntitiesValue}
      <Translate>entities</Translate>
    </>
  );
  const connectionsCounter = (
    <>
      <Translate>Relationships:</Translate>
      <b> {totalConnectionsCount!}</b>; <Translate>Entities:</Translate>
      <b> {totalEntitiesValue}</b>
    </>
  );

  return <span>{totalConnectionsCount === undefined ? entityCounter : connectionsCounter}</span>;
};
