import { config } from 'api/config';
import { Tenant, tenants } from 'api/tenants/tenantContext';
import { appContext } from './AppContext';

const originalCurrentFN = tenants.current.bind(tenants);

let mockedTenant: Partial<Tenant>;

const originalAppContextGet = appContext.get.bind(appContext);

const testingTenants = {
  mockCurrentTenant(tenant: Partial<Tenant>) {
    mockedTenant = tenant;
    mockedTenant.featureFlags = mockedTenant.featureFlags || config.defaultTenant.featureFlags;
    tenants.current = () => <Tenant>mockedTenant;
    jest.spyOn(appContext, 'get').mockImplementation((key: string) => {
      if (key === 'mongoSession') {
        return undefined;
      }
      return originalAppContextGet(key);
    });
  },

  changeCurrentTenant(changes: Partial<Tenant>) {
    mockedTenant = {
      ...mockedTenant,
      ...changes,
    };
  },

  restoreCurrentFn() {
    tenants.current = originalCurrentFN;
  },

  createTenant(partial: Partial<Tenant>) {
    return {
      name: '',
      dbName: '',
      indexName: '',
      uploadedDocuments: '',
      attachments: '',
      customUploads: '',
      activityLogs: '',
      ...partial,
    };
  },
};

export { testingTenants };
