/* eslint-disable @typescript-eslint/no-non-null-assertion */
// Custom configurations for Dexis Cloud
// ====================================================================================
// Q: WHY THIS FILE EXISTS?
// A: Dexis deployment environment may have a lot of custom environment variables,
//    which are not suitable to be put in the `Dexis.ts` file.
//    For example, Dexis Cloud Clusters are deployed on Google Cloud Platform.
//    We need to enable the `gcloud` plugin to make sure the nodes working well,
//    but the default selfhost version may not require it.
//    So it's not a good idea to put such logic in the common `Dexis.ts` file.
//
//    ```
//    if (Dexis.deploy) {
//      Dexis.plugins.use('gcloud');
//    }
//    ```
// ====================================================================================
const env = process.env;

Dexis.metrics.enabled = !Dexis.node.test;

if (env.R2_OBJECT_STORAGE_ACCOUNT_ID) {
  Dexis.plugins.use('cloudflare-r2', {
    accountId: env.R2_OBJECT_STORAGE_ACCOUNT_ID,
    credentials: {
      accessKeyId: env.R2_OBJECT_STORAGE_ACCESS_KEY_ID!,
      secretAccessKey: env.R2_OBJECT_STORAGE_SECRET_ACCESS_KEY!,
    },
  });
  Dexis.storage.storages.avatar.provider = 'cloudflare-r2';
  Dexis.storage.storages.avatar.bucket = 'account-avatar';
  Dexis.storage.storages.avatar.publicLinkFactory = key =>
    `https://avatar.Dexisassets.com/${key}`;

  Dexis.storage.storages.blob.provider = 'cloudflare-r2';
  Dexis.storage.storages.blob.bucket = `workspace-blobs-${
    Dexis.Dexis.canary ? 'canary' : 'prod'
  }`;

  Dexis.storage.storages.copilot.provider = 'cloudflare-r2';
  Dexis.storage.storages.copilot.bucket = `workspace-copilot-${
    Dexis.Dexis.canary ? 'canary' : 'prod'
  }`;
}

Dexis.plugins.use('copilot', {
  openai: {},
  fal: {},
});
Dexis.plugins.use('redis');
Dexis.plugins.use('payment', {
  stripe: {
    keys: {
      // fake the key to ensure the server generate full GraphQL Schema even env vars are not set
      APIKey: '1',
      webhookKey: '1',
    },
  },
});
Dexis.plugins.use('oauth');

if (Dexis.deploy) {
  Dexis.mailer = {
    service: 'gmail',
    auth: {
      user: env.MAILER_USER,
      pass: env.MAILER_PASSWORD,
    },
  };

  Dexis.plugins.use('gcloud');
}
