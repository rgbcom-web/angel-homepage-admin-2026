import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs) {
  return twMerge(clsx(inputs));
}

export function getLabelFromValue(value, list) {
  return list.find((item) => item.value === value)?.label;
}

export function getYearOptions() {
  const fromYear = 2010;
  const currentYear = new Date().getFullYear();

  return Array.from({ length: currentYear - fromYear + 1 }, (_, i) => ({
    label: `${fromYear + i} 년`,
    value: `${fromYear + i}`,
  })).reverse();
}

export function getMonthOptions() {
  return Array.from({ length: 12 }, (_, i) => ({
    label: `${i + 1}월`,
    value: `${i + 1}`,
  }));
}

/**
 * 옵션 리스트를 생성합니다.
 * @param {Array} list - 옵션 리스트
 * @param {boolean} useAll - 전체 옵션 사용 여부
 * @returns {Array} 옵션 리스트
 */
export function arrayToOptions(list, useAll = false, labelTransform) {
  const options = list.map((item) => ({
    label: labelTransform ? labelTransform(item) : item,
    value: item,
  }));

  if (useAll) {
    return [{ label: '전체', value: '' }, ...options];
  }

  return options;
}

export function businessRegistrationNumberFilter(value) {
  const numbersOnly = value.replace(/\D/g, '');

  if (numbersOnly.length <= 10) {
    return numbersOnly.replace(/(\d{3})(\d{0,2})(\d{0,5})/, (match, p1, p2, p3) =>
      [p1, p2, p3].filter(Boolean).join('-'),
    );
  } else {
    return numbersOnly
      .slice(0, 10)
      .replace(/(\d{3})(\d{0,2})(\d{0,5})/, (match, p1, p2, p3) =>
        [p1, p2, p3].filter(Boolean).join('-'),
      );
  }
}

export function telFilter(val) {
  // 숫자만 추출
  const numbersOnly = val.replace(/\D/g, '');

  // 빈 문자열 처리
  if (!numbersOnly) return '';

  // 1. 대표번호 (15xx, 16xx, 18xx 등)
  if (/^1[5678]\d{2}/.test(numbersOnly)) {
    return numbersOnly.replace(/(\d{4})(\d{0,4})/, (match, p1, p2) => (p2 ? `${p1}-${p2}` : p1));
  }

  // 2. 서울 지역번호 (02)
  if (numbersOnly.startsWith('02')) {
    // 02-xxxx-xxxx (최대 10자리) 또는 02-xxx-xxxx (최대 9자리)
    if (numbersOnly.length <= 10) {
      // 국번이 3자리인 경우와 4자리인 경우 모두 처리
      if (numbersOnly.length <= 6) {
        // 국번까지만 입력된 경우
        return numbersOnly.replace(/(\d{2})(\d{0,4})/, (match, p1, p2) =>
          p2 ? `${p1}-${p2}` : p1,
        );
      } else {
        // 02-[3~4자리]-[4자리]
        return numbersOnly.replace(/(\d{2})(\d{3,4})(\d{0,4})/, (match, p1, p2, p3) =>
          p3 ? `${p1}-${p2}-${p3}` : `${p1}-${p2}`,
        );
      }
    } else {
      // 최대 길이 제한
      return numbersOnly
        .slice(0, 10)
        .replace(/(\d{2})(\d{4})(\d{0,4})/, (match, p1, p2, p3) =>
          p3 ? `${p1}-${p2}-${p3}` : `${p1}-${p2}`,
        );
    }
  }

  // 3. 휴대폰 (010, 011, 016, 017, 018, 019) 및 인터넷 전화 (070, 050 등)
  if (/^01[0-9]/.test(numbersOnly) || /^0[57]0/.test(numbersOnly)) {
    if (numbersOnly.length <= 11) {
      return numbersOnly.replace(/(\d{3})(\d{0,4})(\d{0,4})/, (match, p1, p2, p3) =>
        p3 ? `${p1}-${p2}-${p3}` : p2 ? `${p1}-${p2}` : p1,
      );
    } else {
      // 최대 길이 제한
      return numbersOnly.slice(0, 11).replace(/(\d{3})(\d{4})(\d{4})/, '$1-$2-$3');
    }
  }

  // 4. 지역번호 3자리 (031, 032 등)
  if (/^0\d{2}/.test(numbersOnly)) {
    // 일반적인, 혹은 짧은 지역 번호 (031-123-4567 또는 031-1234-567)
    if (numbersOnly.length <= 11) {
      // 지역번호만 입력된 경우
      if (numbersOnly.length <= 3) {
        return numbersOnly;
      }
      // 8자리 번호 (031-123-4567 또는 031-1234-567)의 경우
      else if (numbersOnly.length <= 7) {
        return numbersOnly.replace(/(\d{3})(\d{0,4})/, (match, p1, p2) =>
          p2 ? `${p1}-${p2}` : p1,
        );
      } else {
        // 가장 흔한 패턴을 먼저 시도 (3-3-4)
        if (numbersOnly.length === 10) {
          return numbersOnly.replace(/(\d{3})(\d{3})(\d{4})/, '$1-$2-$3');
        }
        // 3-4-4 패턴 (일부 지역)
        else if (numbersOnly.length === 11) {
          return numbersOnly.replace(/(\d{3})(\d{4})(\d{4})/, '$1-$2-$3');
        }
        // 3-4-3 패턴 (일부 지역)
        else if (numbersOnly.length === 10) {
          return numbersOnly.replace(/(\d{3})(\d{4})(\d{3})/, '$1-$2-$3');
        }
        // 기본 패턴
        return numbersOnly.replace(/(\d{3})(\d{3,4})(\d{0,4})/, (match, p1, p2, p3) =>
          p3 ? `${p1}-${p2}-${p3}` : `${p1}-${p2}`,
        );
      }
    } else {
      // 최대 길이 제한
      return numbersOnly.slice(0, 11).replace(/(\d{3})(\d{4})(\d{4})/, '$1-$2-$3');
    }
  }

  // 5. 기타 패턴 (위의 규칙에 맞지 않는 번호들)
  if (numbersOnly.length <= 8) {
    // 8자리 이하의 번호는 4-4 패턴으로 분리
    return numbersOnly.replace(/(\d{4})(\d{0,4})/, (match, p1, p2) => (p2 ? `${p1}-${p2}` : p1));
  } else {
    // 그 외의 패턴은 3-3-4 패턴으로 가정
    return numbersOnly.replace(/(\d{3})(\d{0,3})(\d{0,4})/, (match, p1, p2, p3) =>
      p3 ? `${p1}-${p2}-${p3}` : p2 ? `${p1}-${p2}` : p1,
    );
  }
}

// 이메일 형식인지 확인
export function checkEmail(val) {
  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return regex.test(val);
}

// url 형식인지 확인
export function checkUrl(val) {
  const regex = /^(https?:\/\/)?([\da-z.-]+)\.([a-z.]{2,6})([/\w .-]*)*\/?$/;
  return regex.test(val);
}
