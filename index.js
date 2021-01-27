const exec = require('shelljs.exec');
const shellescape = require('shell-escape');
const shell = require('shelljs');

const action = require('./lib/action');

function KilatS3() { }

KilatS3.makeBucket = function makeBucket(bucketName) {
  return new Promise((resolve, reject) => {
    bucketName = shellescape([bucketName]);
    const results = exec(`s3cmd mb s3://${bucketName}`);
    if (results.code === 0) {
      resolve(results.stdout);
    } else {
      reject(new Error(results.error));
    }
  });
};

KilatS3.removeBucket = function removeBucket(bucketName) {
  return new Promise((resolve, reject) => {
    bucketName = shellescape([bucketName]);
    const results = exec(`s3cmd rb s3://${bucketName}`);
    if (results.code === 0) {
      resolve(results.stdout);
    } else {
      reject(new Error(results.error));
    }
  });
};

KilatS3.listBuckets = function listBuckets() {
  return new Promise((resolve, reject) => {
    const results = exec('s3cmd ls', { silent: true });
    if (results.code === 0) {
      const echo = results.stdout.split('\n');
      resolve(echo);
    } else {
      reject(new Error(results.error));
    }
  });
};

KilatS3.listAllObject = function listAllObject() {
  return new Promise((resolve, reject) => {
    const results = exec('s3cmd la');
    if (results.code === 0) {
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
        bucketName = shellescape([bucketName]);
        pathFile = shellescape([pathFile]);
        const results = exec(`s3cmd put -P ${pathFile} s3://${finalBucketName} --acl-private`);
        if (results.code === 0) {
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
        bucketName = shellescape([bucketName]);
        pathFile = shellescape([pathFile]);
        const results = exec(`s3cmd put -P ${pathFile} s3://${finalBucketName} --acl-public`);
        if (results.code === 0) {
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
    bucketName = shellescape([bucketName]);
    localDirPath = shellescape([localDirPath]);
    shell.exec(`s3cmd sync --acl-public --no-mime-magic ${localDirPath} s3://${bucketPath}`, (code, output, err) => {
      if (code === 0) {
        resolve();
      } else {
        reject(new Error(err));
      }
    });
  });
};

KilatS3.downloadObject = function downloadObject(bucketPath, localDirPath) {
  return new Promise((resolve, reject) => {
    bucketName = shellescape([bucketName]);
    localDirPath = shellescape([localDirPath]);
    const results = exec(`s3cmd get s3://${bucketPath} ${localDirPath}`);
    if (results.code === 0) {
      resolve(results.stdout);
    } else {
      reject(new Error(results.error));
    }
  });
};

KilatS3.removeObject = function removeObject(bucketPath) {
  return new Promise((resolve, reject) => {
    bucketName = shellescape([bucketName]);
    const results = exec(`s3cmd del s3://${bucketPath}`);
    if (results.code === 0) {
      resolve(results.stdout);
    } else {
      reject(new Error(results.error));
    }
  });
};

KilatS3.listObject = function listObject(bucketName) {
  return new Promise((resolve, reject) => {
    bucketName = shellescape([bucketName]);
    const results = exec(`s3cmd ls s3://${bucketName}`);
    if (results.code === 0) {
      const echo = results.stdout.split('\n');
      resolve(echo);
    } else {
      reject(new Error(results.error));
    }
  });
};

KilatS3.existsObject = function existsObject(bucketName, fileName) {
  return new Promise((resolve, reject) => {
    bucketName = shellescape([bucketName]);
    fileName = shellescape([fileName]);
    const results = exec(`s3cmd ls s3://${bucketName}/${fileName} | wc -l`);
    if (results.code === 0) {
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
      const results = exec('s3cmd du');
      if (results.code === 0) {
        resolve(results.stdout);
      } else {
        reject(new Error(results.error));
      }
    } else {
      bucketName = shellescape([bucketName]);
      const results = exec(`s3cmd du s3://${bucketName}`);
      if (results.code === 0) {
        resolve(results.stdout);
      } else {
        reject(new Error(results.error));
      }
    }
  });
};

module.exports = KilatS3;
