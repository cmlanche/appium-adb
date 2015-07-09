import chai from 'chai';
import chaiAsPromised from 'chai-as-promised';
import 'mochawait';
import ADB from '../../lib/adb.js';
import path from 'path';
import _fs from 'fs';
import B from 'bluebird';
import { util } from 'appium-support';
import _rimraf from 'rimraf';
import * as utils from '../../lib/utils.js';

const fs = {
  mkdir: B.promisify(_fs.mkdir),
  writeFile: B.promisify(_fs.writeFile),
  readFile: B.promisify(_fs.readFile),
  unlink: B.promisify(_fs.unlink)
};
// All paths below assume tests run under /build/test/ so paths are relative from
// that directory.
const rimraf = B.promisify(_rimraf),
      contactManagerPath = path.resolve(utils.rootDir, 'test',
                                        'fixtures', 'ContactManager.apk'),
      contactMangerSelendroidPath = path.resolve(utils.rootDir, 'test',
                                                 'fixtures', 'ContactManager-selendroid.apk'),
      tmpDir = path.resolve(utils.rootDir, 'test', 'temp'),
      srcManifest = path.resolve(utils.rootDir, 'test', 'fixtures',
                                 'selendroid', 'AndroidManifest.xml'),
      serverPath = path.resolve(utils.rootDir, 'test', 'fixtures',
                                'selendroid', 'selendroid.apk');

chai.use(chaiAsPromised);

describe('Android-manifest', async () => {
  let adb;
  before(async () => {
    adb = await ADB.createADB();
  });
  it('packageAndLaunchActivityFromManifest should parse package and Activity', async () => {
    let {apkPackage, apkActivity} = await adb.packageAndLaunchActivityFromManifest(contactManagerPath);
    apkPackage.should.equal('com.example.android.contactmanager');
    apkActivity.should.equal('com.example.android.contactmanager.ContactManager');
  });
  it('hasInternetPermissionFromManifest should be true', async () => {
    let flag = await adb.hasInternetPermissionFromManifest(contactMangerSelendroidPath);
    flag.should.be.true;
  });
  it('hasInternetPermissionFromManifest should be false', async () => {
    let flag = await adb.hasInternetPermissionFromManifest(contactManagerPath);
    flag.should.be.false;
  });
  // TODO fix this test
  it.skip('should compile and insert manifest', async () => {
    let appPackage = 'com.example.android.contactmanager',
        newServerPath = path.resolve(tmpDir, `selendroid.${appPackage}.apk`),
        newPackage = 'com.example.android.contactmanager.selendroid',
        dstDir = path.resolve(tmpDir, appPackage),
        dstManifest = path.resolve(dstDir, 'AndroidManifest.xml');
    // deleting temp directory if present
    try {
      await rimraf(tmpDir);
    } catch (e) {
      console.log(`Unable to delete temp directory. It might not be present. ${e.message}`);
    }
    await fs.mkdir(tmpDir);
    await fs.mkdir(dstDir);
    await fs.writeFile(dstManifest, await fs.readFile(srcManifest, "utf8"), "utf8");
    await adb.compileManifest(dstManifest, newPackage, appPackage);
    (await util.fileExists(dstManifest)).should.be.true;
    await adb.insertManifest(dstManifest, serverPath, newServerPath);
    (await util.fileExists(newServerPath)).should.be.true;
    // deleting temp directory
    try {
      await rimraf(tmpDir);
    } catch (e) {
      console.log(`Unable to delete temp directory. It might not be present. ${e.message}`);
    }
  });
});

describe.skip('Android-manifest To be implemented methods', () => {
  it('should return correct processFromManifest', async () => { });
});