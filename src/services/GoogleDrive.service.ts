import { DISCOVERY_DOC } from '../auth/providers';

export const googleDriveRecover = (token: string, passphraseId: string) =>
  new Promise<string>((resolve, reject) => {
    gapi.load('client', {
      callback: () => {
        const filename = `passphrase_${passphraseId}.txt`;
        gapi.client
          .init({
            discoveryDocs: [DISCOVERY_DOC],
          })
          .then(() => {
            gapi.client.drive.files
              .list({
                spaces: 'appDataFolder',
                oauth_token: token,
                q: `name='${filename}'`,
              })
              .then((list) => {
                const file = list.result.files?.find((f) => f.name === filename);
                if (file?.id) {
                  fetch(`https://www.googleapis.com/drive/v3/files/${file.id}?alt=media`, {
                    headers: {
                      Authorization: `Bearer ${token}`,
                    },
                  })
                    .then(async (res) => {
                      const content = await res.text();
                      resolve(content);
                      return;
                    })
                    .catch(reject);
                } else {
                  throw new Error('not found');
                }
              })
              .catch(reject);
          })
          .catch(reject);
      },
      onerror: reject,
      ontimeout: reject,
      timeout: 5_000,
    });
  });

export const googleDriveBackup = (token: string, passphrase: string, passphraseId: string) =>
  new Promise<void>((resolve, reject) => {
    gapi.load('client', {
      callback: () => {
        gapi.client
          .init({
            discoveryDocs: [DISCOVERY_DOC],
          })
          .then(() => {
            const filename = `passphrase_${passphraseId}.txt`;

            const file = new Blob([passphrase], { type: 'text/plain' });
            const metadata: gapi.client.drive.File = {
              name: filename,
              mimeType: 'text/plain',
              parents: ['appDataFolder'],
            };

            gapi.client.drive.files
              .create({
                oauth_token: token,
                uploadType: 'media',
                resource: metadata,
                fields: 'id',
              })
              .then((create) => {
                if (create.result?.id) {
                  fetch(`https://www.googleapis.com/upload/drive/v3/files/${create.result.id}?uploadType=media`, {
                    method: 'PATCH',
                    headers: {
                      Authorization: `Bearer ${token}`,
                      'Content-Type': metadata.mimeType!,
                      'Content-Length': file.size.toString(),
                    },
                    body: passphrase,
                  })
                    .then(() => {
                      resolve();
                    })
                    .catch(reject);
                } else {
                  reject(new Error('Failed to create file'));
                }
              })
              .catch(reject);
          })
          .catch(reject);
      },
      onerror: reject,
      ontimeout: reject,
      timeout: 5_000,
    });
  });
