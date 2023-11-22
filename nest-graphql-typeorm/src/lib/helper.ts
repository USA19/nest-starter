import { v4 as uuidv4 } from 'uuid';
import * as bcrypt from 'bcrypt';
import { HttpException, HttpStatus } from '@nestjs/common';

export function createToken(): string {
  return uuidv4();
}

export async function createPasswordHash(password: string): Promise<string> {
  return await bcrypt.hash(password, await bcrypt.genSalt());
}

export const fileFilter = (_req, file, callback) => {
  if (!file.originalname.match(/\.(jpeg|jpg|png|pdf|doc|docx)$/)) {
    return callback(
      new HttpException(
        'Only jpeg|jpg|png|svg files are allowed',
        HttpStatus.FORBIDDEN,
      ),
      false,
    );
  }
  callback(null, true);
};

export const mediaFilesInter = (_req, file, callback) => {
  if (file && !file.originalname.match(/\.(jpeg|jpg|png|pdf|doc|docx)$/)) {
    return callback(new HttpException('Only jpeg|jpg|png|svg files are allowed', HttpStatus.FORBIDDEN), false);
  }
  callback(null, true);
}

export const csvFilesFilter = (_req, file, callback) => {
  if (!file.originalname.match(/\.(csv)$/)) {
    return callback(
      new HttpException(
        'Only csv files are allowed',
        HttpStatus.FORBIDDEN,
      ),
      false,
    );
  }
  callback(null, true);
};

/**
 * 
 * @param item 
 * @returns string
 */
export const capitalizeFirstLetter = (item: string): string => item.charAt(0).toUpperCase() + item.toLowerCase().slice(1);
