'use babel';

import fs from 'fs';
import path from 'path';
import tempy from 'tempy';
import { minify } from '..';

describe('CSSO plugin for Atom', () => {
  const tmp = tempy.directory();
  const beforePng = path.join(__dirname, 'fixture.png');
  const beforeJpg = path.join(__dirname, 'fixture.jpg');
  const beforeGif = path.join(__dirname, 'fixture.gif');
  const afterPng = path.join(tmp, 'fixture.png');
  const afterJpg = path.join(tmp, 'fixture.jpg');
  const afterGif = path.join(tmp, 'fixture.gif');

  beforeEach(() => {
    fs.createReadStream(beforePng).pipe(fs.createWriteStream(afterPng));
    fs.createReadStream(beforeJpg).pipe(fs.createWriteStream(afterJpg));
    fs.createReadStream(beforeGif).pipe(fs.createWriteStream(afterGif));
    atom.workspace.destroyActivePaneItem();

    waitsForPromise(() => {
      return Promise.all([
        atom.packages.activatePackage('image-view')
      ]);
    });
  });

  describe('define functions', () => {
    it('have minify()', () => {
      expect(typeof minify).toEqual('function');
    });
  });

  describe('process fixture.png and', () => {
    it('minify', () => {
      waitsForPromise(() => {
        return atom.workspace.open(afterPng)
          .then(() => minify(atom.workspace.getActivePaneItem()))
          .then(() => {
            const before = fs.readFileSync(beforePng).length;
            const after = fs.readFileSync(afterPng).length;
            expect(before > after).toBe(true);
          });
      });
    });
  });

  describe('process fixture.jpg and', () => {
    it('minify', () => {
      waitsForPromise(() => {
        return atom.workspace.open(afterJpg)
          .then(() => minify(atom.workspace.getActivePaneItem()))
          .then(() => {
            const before = fs.readFileSync(beforeJpg).length;
            const after = fs.readFileSync(afterJpg).length;
            expect(before > after).toBe(true);
          });
      });
    });
  });

  describe('process fixture.gif and', () => {
    it('minify', () => {
      waitsForPromise(() => {
        return atom.workspace.open(afterGif)
          .then(() => minify(atom.workspace.getActivePaneItem()))
          .then(() => {
            const before = fs.readFileSync(beforeGif).length;
            const after = fs.readFileSync(afterGif).length;
            expect(before > after).toBe(true);
          });
      });
    });
  });
});
