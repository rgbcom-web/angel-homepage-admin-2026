export const LANG_LIST = {
  ko: '국문',
  en: '영문',
};

export const NEWSROOM_CATEGORY_LIST = ['news', 'sns'];

export const DOWNLOAD_CATEGORY_LIST = ['medi', 'suit', 'gear', 'kit'];

export const CONTACT_CATEGORY_LIST = {
  ko: ['제품 문의', '구매 문의', '기타 문의'],
  en: ['Purchase', 'Partnership', 'Others'],
};

export const CONTACT_PRODUCT_LIST = {
  ko: ['angel legs m20', 'angel suit h10', '기타 제품'],
  en: ['angel legs m20', 'angel suit h10', 'Others'],
};

export const ANGEL_STORY_COLOR_LIST = ['blue', 'mint', 'orange', 'pink', 'gray'];

export const ANGEL_STORY_CATEGORY_LIST = [
  {
    name: 'Angel Insight',
    color: ANGEL_STORY_COLOR_LIST[0],
    fixed: true,
  },
  {
    name: 'SNS',
    color: ANGEL_STORY_COLOR_LIST[1],
    fixed: true,
  },
  {
    name: '직무소개',
    color: ANGEL_STORY_COLOR_LIST[2],
    fixed: true,
  },
  {
    name: '직접입력',
    color: ANGEL_STORY_COLOR_LIST[3],
    fixed: false,
  },
];
