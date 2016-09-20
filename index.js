"use babel";

import { CompositeDisposable } from 'atom';
import fs from 'fs';
import path from 'path';
import pify from 'pify';
import imagemin from 'imagemin';
import pngquant from 'imagemin-pngquant';
import optipng from 'imagemin-optipng';
import mozjpeg from 'imagemin-mozjpeg';
import jpegoptim from 'imagemin-jpegoptim';
import gifsicle from 'imagemin-gifsicle';
import svgo from 'imagemin-svgo';

const fsP = pify(fs);

const SUPPORTTED_EXTENSIONS = ['.jpg', '.jpeg', '.png', '.gif', '.svg'];

let subscriptions;
let jpegQuality;
let progressive;
let pngQuality;
let interlace;

export function activate() {
  atom.commands.add('atom-workspace', 'imagemin:minify', () => minify());

  subscriptions = new CompositeDisposable();
  subscriptions.add(atom.config.observe('imagemin.jpegQuality', value => jpegQuality = value));
  subscriptions.add(atom.config.observe('imagemin.progressive', value => progressive = value));
  subscriptions.add(atom.config.observe('imagemin.pngQuality', value => pngQuality = value));
  subscriptions.add(atom.config.observe('imagemin.interlace', value => interlace = value));
}

export function deactivate() {
  subscriptions.dispose();
}

function minify() {
  const activePaneItem = atom.workspace.getActivePaneItem();

  if (!activePaneItem.file) {
    return;
  }

  const filePath = activePaneItem.file.path;
  const extname = path.extname(filePath);
  const dirname = path.dirname(filePath);

  if (SUPPORTTED_EXTENSIONS.indexOf(extname) === -1) {
    return;
  }

  const plugins = [];
  switch (extname) {
    case '.jpg':
    case '.jpeg':
      plugins.push(mozjpeg({
        quality     : jpegQuality,
        progressive : progressive
      }));
      plugins.push(jpegoptim());
      break;
    case '.png':
      plugins.push(pngquant({
        quality : pngQuality
      }));
      plugins.push(optipng());
      break;
    case '.gif':
      plugins.push(gifsicle({
        interlace : interlace
      }));
      break;
    case '.svgo':
      plugins.push(svgo());
      break;
    default:
      break;
  }

  imagemin([filePath], dirname, {
    plugins : plugins
  }).then(files => {
    return Promise.all(files.map(file => {
      return fsP.writeFile(file.path, file.data);
    }));
  });
}
