'use server';

import { createAdminClient } from '@/service/db/supabase/server';
import { sendmail } from '@/service/api/mailer';
import { revalidatePath } from 'next/cache';

export async function sendAndCreateAnswer(
  data,
  lang = 'ko',
  parentTableName,
  answerTableName,
  pathToRevalidate,
) {
  try {
    const { answer, mailTo, userName, contactId } = data;

    // 유효성 검사
    if (!answer || !mailTo) {
      throw new Error('데이터가 올바르지 않습니다.');
    }

    // 메일 발송
    const mailSubject =
      lang === 'ko'
        ? `[엔젤로보틱스] ${userName}님의 문의에 답변드립니다.`
        : `[Angel Robotics] Hello ${userName}, your inquiry has been answered.`;

    const mailResult = await sendmail(mailTo, mailSubject, getMailBody(data, lang, mailSubject));

    if (!mailResult.success) {
      throw new Error('메일 발송에 실패했습니다.');
    }

    // 답변 DB 저장
    const supa = await createAdminClient();

    const query = supa.from(answerTableName).insert({
      answer,
      parent_id: contactId,
    });

    const parentQuery = supa
      .from(parentTableName)
      .update({
        status: 2,
      })
      .eq('id', contactId);

    const [answerResult, parentResult] = await Promise.all([query, parentQuery]);

    if (answerResult.error || parentResult.error) {
      throw new Error('답변 저장에 실패했습니다.');
    }

    pathToRevalidate && revalidatePath(pathToRevalidate);

    return {
      success: true,
    };
  } catch (error) {
    console.error(error);

    return {
      success: false,
      errors: {
        message: error.message || '서버 오류가 발생했습니다.',
      },
    };
  }
}

function getMailBody(data, lang, mailSubject) {
  const styles = {
    container:
      'max-width: 600px; background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 10px rgba(0,0,0,0.05);',
    header: 'background-color: #f1f5f9; padding: 25px 30px;',
    logo: 'height: 24px; display: block;',
    notificationHeader: 'padding: 25px 30px 15px; border-bottom: 1px solid #e2e8f0;',
    title: 'margin: 0; color: #1e293b; font-size: 22px; font-weight: 700;',
    bodyWrapper: 'padding: 0px 30px;',
    inquiryContent:
      'margin-top: 20px; background-color: #f8fafc; border-radius: 6px; padding: 20px;',
    answerText: 'line-height: 1.6; color: #334155; white-space: pre-wrap;',
    buttonContainer: 'margin-block: 25px; display: flex; gap: 10px;',
    button:
      'display: block; background-color: #2563eb; color: white; font-weight: 600; text-decoration: none; padding: 12px 16px; border-radius: 6px; font-size: 14px; text-align: center; flex: 2;',
    footer:
      'background-color: #f1f5f9; padding: 20px; text-align: center; color: #64748b; font-size: 13px;',
  };

  const texts = {
    en: {
      greeting: `Hello, ${data.name} <br> Your inquiry has been answered.`,
      buttonText: 'Visit Angel Robotics Website',
      logoAlt: 'Angel Robotics Logo',
    },
    ko: {
      greeting: `안녕하세요, ${data.userName} 님 <br> 문의주신사항에 답변드립니다.`,
      buttonText: '엔젤로보틱스 홈페이지',
      logoAlt: '엔젤로보틱스 로고',
    },
  };

  // 기본값으로 영어 텍스트 사용
  const langTexts = texts[lang] || texts.en;

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${mailSubject}</title>
</head>
<body style="margin: 0; padding: 0; background-color: #f7f7f7; font-family: 'Apple SD Gothic Neo', 'Noto Sans KR', 'Malgun Gothic', sans-serif; color: #333333; line-height: 1.5;">
  <div style="${styles.container}">
    <div style="${styles.header}">
      <img src="https://angel-robotics.com/images/common/logo-angel.svg" alt="${langTexts.logoAlt}" style="${styles.logo}">
    </div>
    <div style="${styles.notificationHeader}">
      <h1 style="${styles.title}">${langTexts.greeting}</h1>
    </div>
    <div style="${styles.bodyWrapper}">
      <div style="${styles.inquiryContent}">
        <div style="${styles.answerText}">${data.answer}</div>
      </div>
      <div style="${styles.buttonContainer}">
        <a href="https://angel-robotics.com/${lang}" style="${styles.button}">
          ${langTexts.buttonText}
        </a>
      </div>
    </div>
    <div style="${styles.footer}">
      <p style="margin: 0;">© ANGEL ROBOTICS.</p>
    </div>
  </div>
</body>
</html>
  `;
}
