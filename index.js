const { spawnSync } = require('child_process');

const action = require('./lib/action');

const CMD = 's3cmd';

function KilatS3() { }

KilatS3.makeBucket = function makeBucket(bucketName) {
  return new Promise((resolve, reject) => {
    const results = spawnSync(CMD, [`mb`, `s3://${bucketName}`]);
    if (results.status === 0) {
      resolve(results.stdout);
    } else {
      reject(new Error(results.error));
    }
  });
};

KilatS3.removeBucket = function removeBucket(bucketName) {
  return new Promise((resolve, reject) => {
    const results = spawnSync(CMD, [`rb`, `s3://${bucketName}`]);
    if (results.status === 0) {
      resolve(results.stdout);
    } else {
      reject(new Error(results.error));
    }
  });
};

KilatS3.listBuckets = function listBuckets() {
  return new Promise((resolve, reject) => {
    const results = spawnSync(CMD, ['ls'], { silent: true });
    if (results.status === 0) {
      const echo = results.stdout.split('\n');
      resolve(echo);
    } else {
      reject(new Error(results.error));
    }
  });
};

KilatS3.listAllObject = function listAllObject() {
  return new Promise((resolve, reject) => {
    const results = spawnSync(CMD, ['la']);
    if (results.status === 0) {
      const echo = results.stdout.split('\n');
      resolve(echo);
    } else {
      reject(new Error(results.error));
    }
  });
};

KilatS3.putObjectPrivate = function putObjectPrivate(pathFile, bucketName) {
  return new Promise((resolve, reject) => {
    action.checkBucketPrefixes(bucketName)
      .then((finalBucketName) => {
        const results = spawnSync(CMD, [`put`, '-P', pathFile, `s3://${finalBucketName}`, `--acl-private`]);
        if (results.status === 0) {
          action.getPublicUrl(results.stdout, finalBucketName)
            .then((publicUrl) => {
              resolve(publicUrl);
            });
        } else {
          reject(new Error(results.error));
        }
      });
  });
};

KilatS3.putObjectPublic = function putObjectPublic(pathFile, bucketName) {
  return new Promise((resolve, reject) => {
    action.checkBucketPrefixes(bucketName)
      .then((finalBucketName) => {
        const results = spawnSync(CMD, [`put`, '-P', pathFile, `s3://${finalBucketName}`, `--acl-public`]);
        if (results.status === 0) {
          action.getPublicUrl(results.stdout, finalBucketName)
            .then((publicUrl) => {
              resolve(publicUrl);
            });
        } else {
          reject(new Error(results.error));
        }
      });
  });
};

KilatS3.syncFolder = function syncFolder(bucketPath, localDirPath) {
  return new Promise((resolve, reject) => {
    const results = spawnSync(CMD, [`sync`, '--acl-public', '--no-mime-magic', localDirPath, `s3://${bucketPath}`]);
    if (results.status === 0) {
      resolve();
    } else {
      reject(new Error(err));
    }
  });
};

KilatS3.downloadObject = function downloadObject(bucketPath, localDirPath) {
  return new Promise((resolve, reject) => {
    const results = spawnSync(CMD, [`get`, `s3://${bucketPath}`, localDirPath]);
    if (results.status === 0) {
      resolve(results.stdout);
    } else {
      reject(new Error(results.error));
    }
  });
};

KilatS3.removeObject = function removeObject(bucketPath) {
  return new Promise((resolve, reject) => {
    const results = spawnSync(CMD, [`del`, `s3://${bucketPath}`]);
    if (results.status === 0) {
      resolve(results.stdout);
    } else {
      reject(new Error(results.error));
    }
  });
};

KilatS3.listObject = function listObject(bucketName) {
  return new Promise((resolve, reject) => {
    const results = spawnSync(CMD, [`ls`, `s3://${bucketName}`]);
    if (results.status === 0) {
      const echo = results.stdout.split('\n');
      resolve(echo);
    } else {
      reject(new Error(results.error));
    }
  });
};

KilatS3.existsObject = function existsObject(bucketName, fileName) {
  return new Promise((resolve, reject) => {
    const results = spawnSync(CMD, [`ls`, `s3://${bucketName}/${fileName}`, '|', 'wc', `-l`]);
    if (results.status === 0) {
      const echo = results.stdout.split('\n');
      const check = echo[0].replace(/\s/g, '');
      if (check === '0') {
        resolve(false);
      } else {
        resolve(true);
      }
    } else {
      reject(new Error(results.error));
    }
  });
};

KilatS3.diskUsage = function diskUsage(bucketName = null) {
  return new Promise((resolve, reject) => {
    if (bucketName === null) {
      const results = spawnSync(CMD, ['du']);
      if (results.status === 0) {
        resolve(results.stdout);
      } else {
        reject(new Error(results.error));
      }
    } else {
      const results = spawnSync(CMD, [`du`, `s3://${bucketName}`]);
      if (results.status === 0) {
        resolve(results.stdout);
      } else {
        reject(new Error(results.error));
      }
    }
  });
};

module.exports = KilatS3;
