"use babel";

import fs from 'fs';
import path from 'path';
import pify from 'pify';
import filesize from 'filesize';
import imagemin from 'imagemin';
import pngquant from 'imagemin-pngquant';
import optipng from 'imagemin-optipng';
import mozjpeg from 'imagemin-mozjpeg';
import jpegoptim from 'imagemin-jpegoptim';
import gifsicle from 'imagemin-gifsicle';
import svgo from 'imagemin-svgo';

const fsP = pify(fs);

const SUPPORTTED_EXTENSIONS = new Set([
  '.jpg',
  '.jpeg',
  '.png',
  '.gif',
  '.svg'
]);

export function activate() {
  atom.commands.add('atom-workspace', 'imagemin:minify', () => {
    minify(atom.workspace.getActivePaneItem());
  });
}

function minify(activePaneItem) {
  if (!activePaneItem.file) {
    return;
  }

  const filePath = activePaneItem.file.path;
  const extname = path.extname(filePath);
  const dirname = path.dirname(filePath);

  if (!SUPPORTTED_EXTENSIONS.has(extname)) {
    return;
  }

  const plugins = [];
  switch (extname) {
    case '.jpg':
    case '.jpeg':
      plugins.push(mozjpeg({
        quality: atom.config.get('imagemin.jpegQuality'),
        progressive: atom.config.get('imagemin.progressive')
      }));
      plugins.push(jpegoptim());
      break;
    case '.png':
      plugins.push(pngquant({
        quality: atom.config.get('imagemin.pngQuality')
      }));
      plugins.push(optipng());
      break;
    case '.gif':
      plugins.push(gifsicle({
        interlace: atom.config.get('imagemin.interlace')
      }));
      break;
    case '.svgo':
      plugins.push(svgo());
      break;
    default:
      break;
  }

  let before = 0;
  let after = 0;
  fsP.readFile(filePath).then(buffer => {
    before = buffer.length;
    return imagemin.buffer(buffer, {
      plugins: plugins
    });
  }).then(buffer => {
    after = buffer.length;
    return fsP.writeFile(filePath, buffer);
  }).then(() => {
    if (before > after) {
      atom.notifications.addSuccess(`${filesize(before - after)} reduced`);
    } else {
      atom.notifications.addInfo(`Cannot improve upon ${filesize(before)}`);
    }
  });
}
