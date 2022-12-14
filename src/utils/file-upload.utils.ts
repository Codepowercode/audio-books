import { extname } from 'path';

export const imageFileFilter = (req, file, callback) => {
  if (!file.originalname.match(/\.(jpg|jpeg|png|gif)$/)) {
    return callback(new Error('Only image files are allowed!'), false);
  }
  callback(null, true);
};

export const audioFileFilter = (req, file, callback) => {
  if (!file.originalname.match(/\.(mp3|wav)$/)) {
    return callback(new Error('Only auido files are allowed!'), false);
  }
  callback(null, true);
};

export const pdfFileFilter = (req, file, callback) => {
  if (!file.originalname.match(/\.(pdf)$/)) {
    return callback(new Error('Only pdf files are allowed!'), false);
  }
  callback(null, true);
};

export const editFileName = (req, file, callback) => {
  // const name = file.originalname.split('.')[0];
  const fileExtName = extname(file.originalname);
  const randomName = Array(10)
    .fill(null)
    .map(() => Math.round(Math.random() * 16).toString(16))
    .join('');
  callback(null, `${randomName}-${fileExtName}`);
};

export const editBookImageName = (req, file, callback) => {
  // const name = file.originalname.split('.')[0];
  const fileExtName = extname(file.originalname);
  const randomName = Array(10)
    .fill(null)
    .map(() => Math.round(Math.random() * 16).toString(16))
    .join('');
  callback(null, `${randomName}-${req.params.id}${fileExtName}`);
};
