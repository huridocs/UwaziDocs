import { useState } from 'react';
import update from 'immutability-helper';
import _ from 'lodash';
import ID from 'shared/uniqueID';
import { IDraggable, ItemTypes } from '../shared/types';

interface RemoveOptions {
  omitSource: boolean;
}
interface IDnDContext {
  type: ItemTypes;
  addItem: (item: IDraggable) => void;
  removeItem: (item: IDraggable, options?: RemoveOptions) => void;
  updateItems: (index: number, values: IDraggable) => void;
  updateActiveItems: (items: IDraggable[]) => void;
  sort: Function;
  activeItems: IDraggable[];
  availableItems: IDraggable[];
  get?: (item: IDraggable) => IDnDContext;
}

const addActiveItem =
  (
    activeItems: IDraggable[],
    setActiveItems: React.Dispatch<React.SetStateAction<IDraggable[]>>,
    availableItems: IDraggable[],
    setAvailableItems: React.Dispatch<React.SetStateAction<IDraggable[]>>
  ) =>
  (newItem: IDraggable, parent?: IDraggable) => {
    if (parent) {
      if (newItem.parent) {
        const indexOfCurrentParent = activeItems.findIndex(ai => ai.id === newItem.parent!.id);

        setActiveItems((prevActiveItems: IDraggable[]) => {
          const index = prevActiveItems[indexOfCurrentParent].items!.findIndex(
            ai => ai.id === newItem.id
          );
          return update(prevActiveItems, {
            [indexOfCurrentParent]: {
              items: { $splice: [[index, 1]] },
            },
          });
        });
      }

      const indexOfParent = activeItems.findIndex(ai => ai.id === parent.id);

      setActiveItems((prevActiveItems: IDraggable[]) =>
        prevActiveItems[indexOfParent].items
          ? update(prevActiveItems, {
              [indexOfParent]: {
                items: {
                  $push: [{ ...newItem, parent }],
                },
              },
            })
          : update(prevActiveItems, {
              [indexOfParent]: {
                items: {
                  $set: [{ ...newItem, parent }],
                },
              },
            })
      );
    } else {
      setActiveItems((prevActiveItems: IDraggable[]) =>
        update(prevActiveItems, {
          $push: [newItem],
        })
      );
    }
    const indexOfSource = availableItems.findIndex(ai => ai.id === newItem.id);

    if (indexOfSource > -1) {
      setAvailableItems(prevAvailableItems =>
        update(prevAvailableItems, { $splice: [[indexOfSource, 1]] })
      );
    }
  };

const removeActiveItem =
  (
    activeItems: IDraggable[],
    setActiveItems: React.Dispatch<React.SetStateAction<IDraggable[]>>,
    setAvailableItems: React.Dispatch<React.SetStateAction<IDraggable[]>>
  ) =>
  (item: IDraggable, options: RemoveOptions = { omitSource: false }) => {
    if (item.parent !== undefined) {
      const indexOfParent = activeItems.findIndex(ai => ai.id === item.parent!.id);
      setActiveItems((prevActiveItems: IDraggable[]) => {
        const index = prevActiveItems[indexOfParent].items!.findIndex(ai => ai.id === item.id);
        return update(prevActiveItems, {
          [indexOfParent]: {
            items: { $splice: [[index, 1]] },
          },
        });
      });
    } else {
      const index = activeItems.findIndex(ai => ai.id === item.id);
      setActiveItems((prevActiveItems: IDraggable[]) =>
        update(prevActiveItems, {
          $splice: [[index, 1]],
        })
      );
    }

    if (!options.omitSource) {
      const availableSubItems = (item.items || []).map(ai => _.omit(ai, ['parent', 'container']));

      setAvailableItems(prevAvailableItems =>
        update(prevAvailableItems, {
          $push: [_.omit(item, ['parent', 'container', 'items']), ...availableSubItems],
        })
      );
    }
  };

const sortActiveitems =
  (activeItems: IDraggable[], setActiveItems: React.Dispatch<React.SetStateAction<IDraggable[]>>) =>
  (currentItem: IDraggable, target: IDraggable, dragIndex: number, hoverIndex: number) => {
    const { parent } = currentItem;

    if (parent !== undefined) {
      const indexOfParent = activeItems.findIndex(item => item.id === parent.id);

      setActiveItems((prevActiveItems: IDraggable[]) =>
        update(prevActiveItems, {
          [indexOfParent]: {
            items: {
              $splice: [
                [dragIndex, 1],
                [hoverIndex, 0, prevActiveItems[indexOfParent].items![dragIndex]],
              ],
            },
          },
        })
      );
    } else {
      setActiveItems((prevActiveItems: IDraggable[]) =>
        update(prevActiveItems, {
          $splice: [
            [dragIndex, 1],
            [hoverIndex, 0, prevActiveItems[dragIndex]],
          ],
        })
      );
    }
  };

const useDnDContext = (
  type: ItemTypes,
  initialItems: IDraggable[] = [],
  sourceItems: IDraggable[] = []
) => {
  const setParent: (items: IDraggable[], parent?: IDraggable) => IDraggable[] = (items, parent) =>
    items.map(item => {
      const id = item.id || ID();
      const itemWithId = { ...item, id, ...(parent ? { parent } : {}) };
      if (item.items && item.items.length > 0) {
        return { ...itemWithId, items: setParent(item.items, itemWithId) };
      }
      return itemWithId;
    });

  const setID = (items: IDraggable[]) => items.map(item => ({ ...item, id: item.id || ID() }));

  const [activeItems, setActiveItems] = useState<IDraggable[]>(setParent(initialItems));
  const [availableItems, setAvailableItems] = useState<IDraggable[]>(setID(sourceItems || []));

  const updateItems = (index: number, values: IDraggable) => {
    setActiveItems((prevActiveItems: IDraggable[]) =>
      update(prevActiveItems, {
        [index]: {
          name: { $set: values.name },
        },
      })
    );
  };

  const dndContext: IDnDContext = {
    type,
    addItem: addActiveItem(activeItems, setActiveItems, availableItems, setAvailableItems),
    removeItem: removeActiveItem(activeItems, setActiveItems, setAvailableItems),
    sort: sortActiveitems(activeItems, setActiveItems),
    updateItems,
    updateActiveItems: (items: IDraggable[]) => {
      setActiveItems(items);
    },
    activeItems,
    availableItems,
  };
  return dndContext;
};

export type { IDnDContext };
export { useDnDContext };
