import { appContext } from 'api/utils/AppContext';
import testingDB, { DBFixture } from 'api/utils/testing_db';
import { testingTenants } from 'api/utils/testingTenants';
import { elasticTesting } from 'api/utils/elastic_testing';
import { UserInContextMockFactory } from 'api/utils/testingUserInContext';
import { setupTestUploadedPaths } from 'api/files';
import { UserSchema } from 'shared/types/userType';

const originalAppContextGet = appContext.get.bind(appContext);

const testingEnvironment = {
  userInContextMockFactory: new UserInContextMockFactory(),

  async setUp(fixtures?: DBFixture, elasticIndex?: string) {
    await this.setTenant();
    this.setPermissions();
    this.setFakeContext();
    await this.setFixtures(fixtures);
    await this.setElastic(elasticIndex);
  },

  async setTenant(name?: string) {
    testingTenants.mockCurrentTenant({
      name: name || testingDB.dbName || 'defaultDB',
      dbName: testingDB.dbName || name || 'defaultDB',
      indexName: 'index',
    });
    await setupTestUploadedPaths();
  },

  setFakeContext() {
    jest.spyOn(appContext, 'get').mockImplementation((key: string) => {
      if (key === 'mongoSession') {
        return undefined;
      }
      return originalAppContextGet(key);
    });
    jest.spyOn(appContext, 'set').mockImplementation(() => {});
  },

  unsetFakeContext() {
    appContext.get.mockRestore();
    appContext.set.mockRestore();
  },

  async setFixtures(fixtures?: DBFixture) {
    if (fixtures) {
      await testingDB.setupFixturesAndContext(fixtures);
    }
  },

  async setElastic(elasticIndex?: string) {
    if (elasticIndex) {
      testingTenants.changeCurrentTenant({ indexName: elasticIndex });
      await elasticTesting.reindex();
    }
  },

  setPermissions(user?: UserSchema) {
    if (!user) {
      this.userInContextMockFactory.mockEditorUser();
    } else {
      this.userInContextMockFactory.mock(user);
    }
  },

  resetPermissions() {
    this.userInContextMockFactory.restore();
  },

  setRequestId(requestId: string = '1234') {
    jest
      .spyOn(appContext, 'get')
      .mockImplementation(key => (key === 'requestId' ? requestId : null));
  },

  async tearDown() {
    await testingDB.disconnect();
  },
};

export { testingEnvironment };
