'use client';

import { useRouter, useSearchParams, usePathname } from 'next/navigation';

export function useQueryString() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const _URLSearchParams = (params = searchParams) => new URLSearchParams(params);

  const _route = (searchParams, action = 'push', options) => {
    const path = `${pathname}?${searchParams.toString()}`;

    if (action === 'push') {
      router.push(path, options);
    } else if (action === 'replace') {
      router.replace(path, options);
    }
  };

  /**
   * @description : queryString에서 key에 해당하는 value 반환
   * @param {string} key 반환받을 query string의 key
   * @returns key에 해당하는 value 반환
   */
  const get = (key) => _URLSearchParams().get(key);

  /**
   * @description : queryString에서 key에 해당하는 value들 반환
   * @param  {...string} keys 반환받을 query string의 key (배열로 전달하면 해당 key들의 value를 반환, 전달하지 않으면 모든 key들의 value를 반환)
   * @returns key에 해당하는 value들 반환
   */
  const getValues = (...keys) => {
    const params = _URLSearchParams();
    let result = {};

    if (!keys[0]) {
      params.forEach((value, key) => {
        result[key] = value;
      });
    } else {
      params.forEach((value, key) => {
        if (!keys.includes(key)) return;
        result[key] = value;
      });
    }

    return result;
  };

  /**
   * @description : queryString에 key와 value 설정
   * @param {object} paramsToSet 설정할 key와 value를 가진 객체
   * @param {string} action push : 기존 history를 남기고 업데이트, replace : 기존 history를 남기지 않고 업데이트
   * @returns queryString 업데이트
   */
  const set = (paramsToSet, action = 'push', options) => {
    const params = _URLSearchParams();

    for (let key in paramsToSet) {
      params.set(key, paramsToSet[key] || '');
    }

    _route(params, action, options);
  };

  /**
   * @description : queryString에서 key에 해당하는 value 제거
   * @param {string | array} removeKeys 제거할 key
   * @param {string} action push : 기존 history를 남기고 업데이트, replace : 기존 history를 남기지 않고 업데이트
   * @returns queryString 업데이트
   */
  const remove = (removeKeys, action = 'push', options) => {
    const params = _URLSearchParams();

    if (typeof removeKeys === 'string') {
      params.delete(removeKeys);
    } else if (Array.isArray(removeKeys)) {
      removeKeys.forEach((key) => {
        params.delete(key);
      });
    }

    _route(params, action, options);
  };

  /**
   * @description : queryString 초기화
   * @param {string} action push : 기존 history를 남기고 업데이트, replace : 기존 history를 남기지 않고 업데이트
   * @returns queryString 업데이트
   */
  const clear = (action = 'push', options) => {
    if (action === 'push') {
      router.push(pathname, options);
    } else if (action === 'replace') {
      router.replace(pathname, options);
    }
  };

  /**
   * @description : queryString은 유지한 채로 전달된 path로 이동
   * @param {string} path 이동할 path
   * @param {string} action push : 기존 history를 남기고 이동, replace : 기존 history를 남기지 않고 이동
   * @returns path로 이동
   */
  const routeTo = ({ path, paramsToSet, action = 'push', options, hash }) => {
    const params = _URLSearchParams();

    if (paramsToSet) {
      for (let key in paramsToSet) {
        if (paramsToSet[key] !== null) {
          params.set(key, paramsToSet[key]);
        }
      }
    }

    const to = `${path}/${params.size ? `?${params.toString()}` : ''}${hash ? `#${hash}` : ''}`;

    if (action === 'push') {
      router.push(to, options);
    } else if (action === 'replace') {
      router.replace(to, options);
    }
  };

  /**
   * @description : searchParams 객체를 query string으로 변환
   * @param {object} searchParams 변환할 searchParams 객체
   * @returns query string
   */
  const toString = (searchParams) => {
    const params = _URLSearchParams(searchParams);

    return params.toString();
  };

  /**
   * @description : pathname과 query string을 합쳐 전체 URL 반환
   * @param {object} option query string으로 변환할 객체
   * @returns 전체 URL
   */
  const toFullURL = (option) => `${pathname}?${toString(option)}`;

  /**
   * searchParams를 객체로 변환하여 반환
   * @returns {object}
   */
  const toObject = (sp = searchParams) => {
    const params = {};

    for (const [key, value] of sp.entries()) {
      params[key] = value;
    }

    return params;
  };

  return {
    searchParams,
    get,
    getValues,
    set,
    remove,
    clear,
    routeTo,
    toString,
    toFullURL,
    toObject,
  };
}
