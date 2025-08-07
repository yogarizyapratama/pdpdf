import { File } from 'formidable';

// Helper function to safely extract filepath from formidable File object
export function getFilePath(file: File | File[] | undefined): string {
  if (!file) {
    throw new Error('No file provided');
  }
  
  const singleFile = Array.isArray(file) ? file[0] : file;
  return singleFile.filepath;
}

// Helper function to safely extract field value
export function getFieldValue(field: string | string[] | undefined, defaultValue: string = ''): string {
  if (!field) {
    return defaultValue;
  }
  
  return Array.isArray(field) ? field[0] : field;
}
