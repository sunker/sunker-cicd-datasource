import { test, expect } from '@grafana/plugin-e2e';
import { MyDataSourceOptions, MySecureJsonData } from '../src/types';

test('"Save & test" should be successful when configuration is valid', async ({
  createDataSourceConfigPage,
  readProvisionedDataSource,
  page,
}) => {
  const ds = await readProvisionedDataSource<MyDataSourceOptions, MySecureJsonData>({ fileName: 'datasources.yml' });
  const configPage = await createDataSourceConfigPage({ type: ds.type });
  await page.getByRole('textbox', { name: 'Path' }).fill(ds.jsonData.path ?? '');
  await page.getByRole('textbox', { name: 'API Key' }).fill(ds.secureJsonData?.apiKey ?? '');
  await expect(configPage.saveAndTest()).toBeOK();
});

test('"Save & test" should fail when configuration is invalid', async ({
  createDataSourceConfigPage,
  readProvisionedDataSource,
  page,
  grafanaVersion,
}) => {
  const ds = await readProvisionedDataSource<MyDataSourceOptions, MySecureJsonData>({ fileName: 'datasources.yml' });
  const configPage = await createDataSourceConfigPage({ type: ds.type });
  await page.getByRole('textbox', { name: 'Path' }).fill(ds.jsonData.path ?? '');
  await expect(configPage.saveAndTest()).not.toBeOK();
  if (grafanaVersion === '10.0.13') {
    await expect(configPage).toHaveAlert('error', { hasText: 'API key is missings' });
  } else {
    await expect(configPage).toHaveAlert('error', { hasText: 'API key is missing' });
  }
});
