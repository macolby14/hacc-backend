/* eslint-disable import/prefer-default-export */
export function convertLabelToDbFormat(label: string) {
  return label.replace(new RegExp('\\s', 'g'), '_').toLowerCase();
}

export function convertValueStrFormat(label: string) {
  return `'${label}'`;
}

export function urlToFileName(url: string): string {
  // regex to just match last part of filename
  const re = /\/\/.+\/(.+)?\.pdf/;
  const match = url.match(re);
  if (match === null || match.length < 1) { throw new Error('filename invalid'); }
  const fileName = match[1];
  return fileName;
}
