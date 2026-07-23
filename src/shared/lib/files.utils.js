import Resizer from 'react-image-file-resizer';

/**
 * byte 단위의 파일 사이즈를 단위별로 변환하여 반환
 * @param {number} size : byte 단위의 파일 사이즈
 * @returns {string} : 변환된 파일 사이즈 문자열 ex) "1.23 MB"
 */
export function convertFileSize(size) {
  const units = ['B', 'KB', 'MB', 'GB', 'TB'];
  let unitIndex = 0;
  while (size >= 1024 && unitIndex < units.length - 1) {
    size /= 1024;
    unitIndex++;
  }
  return `${size.toFixed(2)} ${units[unitIndex]}`;
}

/**
 * MB 단위의 숫자를 byte 단위로 변환하여 반환
 * @param {number} mb : MB 단위의 숫자
 * @returns {number} : byte 단위의 숫자
 */
export function getByteSize(mb) {
  return mb * 1024 * 1024;
}

/**
 * 파일 확장자가 extArr에 포함되어 있는지 체크
 * @param {string} fileName : 파일명
 * @param {string[]} extArr : 허용 확장자 배열
 * @returns {boolean} : extArr에 포함되어 있는지 여부
 */
export function checkFileExtention(fileName, extArr) {
  const ext = fileName.split('.').pop();
  return extArr.includes(ext);
}

/**
 * 파일명을 이름과 확장자로 분리하여 반환
 * @param {string} fileName : 파일명
 * @returns {string[]} : [이름, 확장자]
 */
export function splitFileName(fileName) {
  const ext = fileName.split('.').pop();
  const name = fileName.replace(`.${ext}`, '');
  return [name, ext];
}

// 파일명에 현재시간 및 랜덤값을 추가하여 반환
export function markFileName(fileName) {
  const [name, ext] = splitFileName(fileName);
  return `${name}-${Date.now()}-${Math.floor(Math.random() * 1000)}.${ext}`;
}
