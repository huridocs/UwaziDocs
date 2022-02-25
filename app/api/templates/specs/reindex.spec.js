import db from 'api/utils/testing_db';
import { search } from 'api/search';
import { propertyTypes } from 'shared/propertyTypes';
import templates from '../templates';
import { checkIfReindex } from '../reindex';
import fixtures, { templateWithContents, pageSharedId } from './fixtures/fixtures';

const getAndUpdateTemplate = async props => {
  const [template] = await templates.get({ _id: templateWithContents });
  Object.keys(props).forEach(key => {
    template[key] = props[key];
  });
  return { reindex: await checkIfReindex(template), template };
};

describe('reindex', () => {
  beforeEach(async () => {
    await db.setupFixturesAndContext(fixtures, 'reindex');
    spyOn(search, 'indexEntities').and.returnValue({});
  });

  afterAll(async () => {
    await db.disconnect();
  });

  describe('Not Reindex', () => {
    it('should not reindex if name has changed', async () => {
      const { reindex, template } = await getAndUpdateTemplate({ name: 'Updated name' });

      expect(reindex).toEqual(false);

      await templates.save(template, 'en', reindex);
      expect(search.indexEntities).not.toHaveBeenCalled();
    });

    it('should not reindex if entityViewPage has changed', async () => {
      const { reindex, template } = await getAndUpdateTemplate({ entityViewPage: pageSharedId });

      expect(reindex).toEqual(false);

      await templates.save(template, 'en', reindex);
      expect(search.indexEntities).not.toHaveBeenCalled();
    });
    it('should not reindex if color has changed', async () => {
      const { reindex, template } = await getAndUpdateTemplate({ color: '#222222' });

      expect(reindex).toEqual(false);

      await templates.save(template, 'en', reindex);
      expect(search.indexEntities).not.toHaveBeenCalled();
    });
    describe('Properties', () => {
      const getAndUpdateTemplateProps = async props => {
        const [template] = await templates.get({ _id: templateWithContents });
        Object.keys(props).forEach(key => {
          template.properties[0][key] = props[key];
        });
        return { reindex: await checkIfReindex(template), template };
      };
      it('should not reindex if use as filter is checked', async () => {
        const { reindex, template } = await getAndUpdateTemplateProps({ filter: true });

        expect(reindex).toEqual(false);

        await templates.save(template, 'en', reindex);
        expect(search.indexEntities).not.toHaveBeenCalled();
      });
      it('should not reindex if default filter is checked', async () => {
        const { reindex, template } = await getAndUpdateTemplateProps({ defaultfilter: true });

        expect(reindex).toEqual(false);

        await templates.save(template, 'en', reindex);
        expect(search.indexEntities).not.toHaveBeenCalled();
      });
      it('should not reindex if hide label is checked', async () => {
        const { reindex, template } = await getAndUpdateTemplateProps({ noLabel: true });

        expect(reindex).toEqual(false);

        await templates.save(template, 'en', reindex);
        expect(search.indexEntities).not.toHaveBeenCalled();
      });
      it('should not reindex if show in card is checked', async () => {
        const { reindex, template } = await getAndUpdateTemplateProps({ showInCard: true });

        expect(reindex).toEqual(false);

        await templates.save(template, 'en', reindex);
        expect(search.indexEntities).not.toHaveBeenCalled();
      });
      it('should not reindex if required property is checked', async () => {
        const { reindex, template } = await getAndUpdateTemplateProps({ required: true });

        expect(reindex).toEqual(false);

        await templates.save(template, 'en', reindex);
        expect(search.indexEntities).not.toHaveBeenCalled();
      });
      it('should not reindex if image full width is checked', async () => {
        const { reindex, template } = await getAndUpdateTemplateProps({ fullWidth: true });

        expect(reindex).toEqual(false);

        await templates.save(template, 'en', reindex);
        expect(search.indexEntities).not.toHaveBeenCalled();
      });
      it('should not reindex if image style is changed', async () => {
        const { reindex, template } = await getAndUpdateTemplateProps({ style: 'cover' });

        expect(reindex).toEqual(false);

        await templates.save(template, 'en', reindex);
        expect(search.indexEntities).not.toHaveBeenCalled();
      });
      it('should not reindex if nested properties is changed', async () => {
        const { reindex, template } = await getAndUpdateTemplateProps({
          nestedProperties: ['something'],
        });

        expect(reindex).toEqual(false);

        await templates.save(template, 'en', reindex);
        expect(search.indexEntities).not.toHaveBeenCalled();
      });
    });
    describe('commonProperties', () => {
      it('should not reindex if priority sorting has changed', async () => {
        const [template] = await templates.get({ _id: templateWithContents });
        template.commonProperties[0].prioritySorting = true;

        const reindex = await checkIfReindex(template);

        expect(reindex).toEqual(false);

        await templates.save(template, 'en', reindex);
        expect(search.indexEntities).not.toHaveBeenCalled();
      });
    });
  });

  describe('Reindex', () => {
    describe('Property', () => {
      it('should reindex if a property has been deleted', async () => {
        const [template] = await templates.get({ _id: templateWithContents });
        template.properties = [template.properties[1], template.properties[2]];
        const reindex = await checkIfReindex(template);
        expect(reindex).toEqual(true);

        await templates.save(template, 'en', reindex);
        expect(search.indexEntities).toHaveBeenCalled();
      });
      it('should reindex when a property name has been changed', async () => {
        const [template] = await templates.get({ _id: templateWithContents });
        template.properties[0].name = 'New property name';
        const reindex = await checkIfReindex(template);
        expect(reindex).toEqual(true);

        await templates.save(template, 'en', reindex);
        expect(search.indexEntities).toHaveBeenCalled();
      });
      it('has a new property added', async () => {
        const [template] = await templates.get({ _id: templateWithContents });
        template.properties.push({ type: propertyTypes.text, label: 'text' });

        const reindex = await checkIfReindex(template);
        expect(reindex).toEqual(true);

        await templates.save(template, 'en', reindex);
        expect(search.indexEntities).toHaveBeenCalled();
      });
    });
    describe('commonProperty', () => {
      it('should reindex if commonProperty name has changed', async () => {
        const [template] = await templates.get({ _id: templateWithContents });
        template.commonProperties[0].label = 'Label Changed';
        const reindex = await checkIfReindex(template);
        expect(reindex).toEqual(true);

        await templates.save(template, 'en', reindex);
        expect(search.indexEntities).toHaveBeenCalled();
      });
    });
  });
});
