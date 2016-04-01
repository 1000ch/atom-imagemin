"use babel";

import path from 'path';
import Imagemin from 'imagemin';
import pngquant from 'imagemin-pngquant';
import mozjpeg from 'imagemin-mozjpeg';
import jpegoptim from 'imagemin-jpegoptim';

export const config = {
  jpegQuality : {
    title   : 'JPEG Quality',
    type    : 'number',
    default : 80,
    minimum : 0,
    maximum : 100
  },
  progressive : {
    title   : 'Progressive',
    type    : 'boolean',
    default : true
  },
  pngQuality : {
    title   : 'PNG Quality',
    type    : 'number',
    default : 80,
    minimum : 0,
    maximum : 100
  },
  interlace : {
    title   : 'Interlace',
    type    : 'boolean',
    default : true
  }
};

const SUPPORTTED_EXTENSIONS = ['.jpg', '.jpeg', '.png', '.gif', '.svg'];

let jpegQuality;
let progressive;
let pngQuality;
let interlace;

export function activate() {
  atom.commands.add('atom-workspace', 'imagemin:minify', () => minify());

  jpegQuality = atom.config.get('imagemin.jpegQuality');
  progressive = atom.config.get('imagemin.progressive');
  pngQuality = atom.config.get('imagemin.pngQuality');
  interlace = atom.config.get('imagemin.interlace');

  atom.config.observe('imagemin.jpegQuality', value => jpegQuality = value);
  atom.config.observe('imagemin.progressive', value => progressive = value);
  atom.config.observe('imagemin.pngQuality', value => pngQuality = value);
  atom.config.observe('imagemin.interlace', value => interlace = value);
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

  const imagemin = new Imagemin();

  switch (extname) {
    case '.jpg':
    case '.jpeg':
      imagemin.use(mozjpeg({
        quality     : jpegQuality,
        progressive : progressive
      }));
      imagemin.use(jpegoptim());
      break;
    case '.png':
      imagemin.use(pngquant({ quality : pngQuality }));
      imagemin.use(Imagemin.optipng());
      break;
    case '.gif':
      imagemin.use(Imagemin.gifsicle({ interlace : interlace }));
      break;
    case '.svgo':
      imagemin.use(Imagemin.svgo());
      break;
    default:
      break;
  }

  imagemin.src(filePath);
  imagemin.dest(dirname);
  imagemin.run();
}
