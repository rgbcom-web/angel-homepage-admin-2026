'use server';

import { revalidatePath } from 'next/cache';
import { v4 as uuidv4 } from 'uuid';
import { createAdminClient } from '@/service/db/supabase/server';
import { setPagingIndexes } from '@/features/manage-modules/components/ui';
import { PEDIATRIC_BOARD_META } from '../constants';

/** 자문단 자료실 전용 private 버킷 (메인 홈 public 버킷과 분리) */
const BUCKET_NAME =
  process.env.PEDIATRIC_SUPABASE_STORAGE_BUCKET ||
  process.env.NEXT_PUBLIC_SUPABASE_STORAGE_BUCKET;
/** 행사 이미지 버킷 (public 우선, 없으면 pediatric) — path+bucket 저장 후 표시 시 signed URL */
const EVENT_IMAGE_BUCKET =
  process.env.NEXT_PUBLIC_SUPABASE_STORAGE_BUCKET ||
  process.env.PEDIATRIC_SUPABASE_STORAGE_BUCKET ||
  BUCKET_NAME;
const EVENT_IMAGE_BUCKET_CANDIDATES = [
  ...new Set(
    [
      process.env.NEXT_PUBLIC_SUPABASE_STORAGE_BUCKET,
      process.env.PEDIATRIC_SUPABASE_STORAGE_BUCKET,
      BUCKET_NAME,
    ].filter(Boolean),
  ),
];
const RESOURCE_UPLOAD_PATH = 'advisory_resources';
const EVENT_IMAGE_UPLOAD_PATH = 'advisory_events';
const RESOURCE_MAX_BYTES = 50 * 1024 * 1024;
const EVENT_IMAGE_MAX_BYTES = 10 * 1024 * 1024;
const RESOURCE_ALLOWED_EXT = new Set(['pdf', 'png', 'jpg', 'jpeg', 'gif', 'webp']);
const EVENT_IMAGE_ALLOWED_EXT = new Set(['png', 'jpg', 'jpeg', 'gif', 'webp']);
const EVENT_IMAGE_SIGNED_TTL = 60 * 60 * 24; // 24h (관리자 미리보기용)

function resolveResourceFileType(fileName) {
  const ext = String(fileName || '')
    .split('.')
    .pop()
    ?.toLowerCase();
  if (['png', 'jpg', 'jpeg', 'gif', 'webp'].includes(ext)) return 'image';
  return 'pdf';
}

async function uploadResourceFile(file) {
  if (!file || typeof file === 'string' || !file.size) {
    return { error: '첨부 파일을 선택해 주세요.' };
  }

  if (file.size > RESOURCE_MAX_BYTES) {
    return { error: '파일 크기는 50MB 이하여야 합니다.' };
  }

  const originalName = file.name || 'attachment';
  const extension = originalName.split('.').pop()?.toLowerCase() || '';
  if (!RESOURCE_ALLOWED_EXT.has(extension)) {
    return { error: 'PDF 또는 이미지(png/jpg/gif/webp)만 업로드할 수 있습니다.' };
  }

  if (!BUCKET_NAME) {
    return {
      error:
        '스토리지 버킷 설정(PEDIATRIC_SUPABASE_STORAGE_BUCKET)이 없습니다.',
    };
  }

  const filePath = `${RESOURCE_UPLOAD_PATH}/attachment-${uuidv4()}.${extension}`;
  const supa = await createAdminClient();
  const { error } = await supa.storage.from(BUCKET_NAME).upload(filePath, file, {
    contentType: file.type || undefined,
    upsert: false,
  });

  if (error) {
    console.error('[uploadResourceFile]', error);
    return { error: error.message || '파일 업로드에 실패했습니다.' };
  }

  return {
    file_path: filePath,
    file_name: originalName,
    file_type: resolveResourceFileType(originalName),
  };
}

async function uploadEventImages(fileList) {
  const files = Array.from(fileList || []).filter(
    (file) => file && typeof file !== 'string' && file.size,
  );
  if (!files.length) {
    return { images: [] };
  }

  if (!EVENT_IMAGE_BUCKET) {
    return {
      error:
        '스토리지 버킷 설정(NEXT_PUBLIC_SUPABASE_STORAGE_BUCKET 또는 PEDIATRIC_SUPABASE_STORAGE_BUCKET)이 없습니다.',
    };
  }

  const supa = await createAdminClient();
  const images = [];

  for (const file of files) {
    if (file.size > EVENT_IMAGE_MAX_BYTES) {
      return { error: '이미지 파일은 각 10MB 이하여야 합니다.' };
    }

    const originalName = file.name || 'image';
    const extension = originalName.split('.').pop()?.toLowerCase() || '';
    if (!EVENT_IMAGE_ALLOWED_EXT.has(extension)) {
      return { error: '이미지(png/jpg/gif/webp)만 업로드할 수 있습니다.' };
    }

    const filePath = `${EVENT_IMAGE_UPLOAD_PATH}/image-${uuidv4()}.${extension}`;
    const { error } = await supa.storage.from(EVENT_IMAGE_BUCKET).upload(filePath, file, {
      contentType: file.type || undefined,
      upsert: false,
    });

    if (error) {
      console.error('[uploadEventImages]', error);
      for (const uploaded of images) {
        await removeEventImageFile(uploaded.path, uploaded.bucket);
      }
      return { error: error.message || '이미지 업로드에 실패했습니다.' };
    }

    const {
      data: { publicUrl },
    } = supa.storage.from(EVENT_IMAGE_BUCKET).getPublicUrl(filePath);

    const { data: signed } = await supa.storage
      .from(EVENT_IMAGE_BUCKET)
      .createSignedUrl(filePath, EVENT_IMAGE_SIGNED_TTL);

    images.push({
      path: filePath,
      name: originalName,
      bucket: EVENT_IMAGE_BUCKET,
      url: signed?.signedUrl || publicUrl,
    });
  }

  return { images };
}

async function removeStorageFile(filePath) {
  if (!filePath || !BUCKET_NAME || /^https?:\/\//i.test(filePath)) return;
  try {
    const supa = await createAdminClient();
    await supa.storage.from(BUCKET_NAME).remove([filePath]);
  } catch (error) {
    console.error('[removeStorageFile]', error);
  }
}

async function removeEventImageFile(filePath, bucketHint) {
  if (!filePath || /^https?:\/\//i.test(filePath)) return;
  try {
    const supa = await createAdminClient();
    const buckets = [
      ...new Set([bucketHint, ...EVENT_IMAGE_BUCKET_CANDIDATES].filter(Boolean)),
    ];
    for (const bucket of buckets) {
      const { error } = await supa.storage.from(bucket).remove([filePath]);
      if (!error) return;
    }
  } catch (error) {
    console.error('[removeEventImageFile]', error);
  }
}

function normalizeEventImages(value) {
  if (!value) return [];
  if (Array.isArray(value)) return value.filter((item) => item?.url || item?.path);
  if (typeof value === 'string') {
    try {
      const parsed = JSON.parse(value);
      return Array.isArray(parsed) ? parsed.filter((item) => item?.url || item?.path) : [];
    } catch {
      return [];
    }
  }
  return [];
}

function parseKeepEventImages(formData) {
  return formData
    .getAll('keep_images')
    .map((value) => {
      try {
        const parsed = JSON.parse(String(value || ''));
        if (parsed && (parsed.path || parsed.url)) return parsed;
      } catch {
        /* ignore */
      }
      return null;
    })
    .filter(Boolean);
}

function isSameEventImage(a, b) {
  if (a?.path && b?.path && a.path === b.path) return true;
  if (a?.url && b?.url && a.url === b.url) return true;
  return false;
}

async function withFreshEventImageUrls(images) {
  const list = normalizeEventImages(images);
  if (!list.length) return [];

  const supa = await createAdminClient();
  const resolved = [];

  for (const image of list) {
    if (!image.path) {
      if (image.url) resolved.push(image);
      continue;
    }

    const buckets = [
      ...new Set([image.bucket, ...EVENT_IMAGE_BUCKET_CANDIDATES].filter(Boolean)),
    ];
    let url = image.url || '';
    let bucket = image.bucket || '';

    for (const candidate of buckets) {
      const { data, error } = await supa.storage
        .from(candidate)
        .createSignedUrl(image.path, EVENT_IMAGE_SIGNED_TTL);
      if (!error && data?.signedUrl) {
        url = data.signedUrl;
        bucket = candidate;
        break;
      }
    }

    if (!url) continue;
    resolved.push({
      path: image.path,
      name: image.name || 'image',
      bucket: bucket || undefined,
      url,
    });
  }

  return resolved;
}

export async function getBoardList(boardKey, searchParams = {}, itemsPerPage = 15) {
  const meta = PEDIATRIC_BOARD_META[boardKey];
  if (!meta) {
    return { data: [], count: 0, errors: { message: '알 수 없는 게시판입니다.' } };
  }

  try {
    const { search, page } = searchParams;
    const { startIndex, endIndex } = setPagingIndexes(page, itemsPerPage);
    const supa = await createAdminClient();

    const orderColumn =
      boardKey === 'events' || boardKey === 'surveys' ? 'start_date' : 'created_at';

    let query = supa
      .from(meta.tableName)
      .select('*', { count: 'exact' })
      .range(startIndex, endIndex)
      .order(orderColumn, { ascending: false });

    if (search) {
      query = query.ilike('title', `%${search}%`);
    }

    const { data, count, error } = await query;
    if (error) throw error;

    const list = await Promise.all(
      (data || []).map(async (item, i) => {
        const base = {
          ...item,
          no: count - startIndex - i,
        };
        if (boardKey !== 'events') return base;
        return {
          ...base,
          images: await withFreshEventImageUrls(item.images),
        };
      }),
    );

    return { data: list, count: count || 0 };
  } catch (error) {
    console.error(error);
    return {
      data: [],
      count: 0,
      errors: { message: error.message || '게시글 목록을 불러오지 못했습니다.' },
    };
  }
}

export async function createBoardItem(boardKey, formData) {
  const meta = PEDIATRIC_BOARD_META[boardKey];
  if (!meta) {
    return { success: false, message: '알 수 없는 게시판입니다.' };
  }

  try {
    const title = String(formData.get('title') || '').trim();
    const description = String(formData.get('description') || '').trim();
    const isNotice = formData.get('is_notice') === 'on';
    const showInNotice = formData.get('show_in_notice') === 'on';

    if (!title) {
      return { success: false, message: '제목을 입력해 주세요.' };
    }

    let payload = {
      title,
      description,
      is_notice: isNotice,
      show_in_notice: showInNotice,
    };

    if (boardKey === 'resources') {
      const file = formData.get('file');
      const uploaded = await uploadResourceFile(file);
      if (uploaded.error) {
        return { success: false, message: uploaded.error };
      }

      payload = {
        ...payload,
        views: 0,
        file_path: uploaded.file_path,
        file_name: uploaded.file_name,
        file_type: uploaded.file_type,
      };
    } else if (boardKey === 'events') {
      const category = String(formData.get('category') || '').trim().slice(0, 3);
      const subtitle = String(formData.get('subtitle') || '').trim();
      const location = String(formData.get('location') || '').trim();
      const startDate = String(formData.get('start_date') || '').trim();
      const endDate = String(formData.get('end_date') || '').trim() || startDate;

      if (!category) return { success: false, message: '카테고리를 입력해 주세요. (최대 3글자)' };
      if (!location) return { success: false, message: '장소를 입력해 주세요.' };
      if (!startDate) return { success: false, message: '시작일을 입력해 주세요.' };
      if (endDate < startDate) {
        return { success: false, message: '종료일은 시작일 이후여야 합니다.' };
      }

      const uploadedImages = await uploadEventImages(formData.getAll('images'));
      if (uploadedImages.error) {
        return { success: false, message: uploadedImages.error };
      }

      payload = {
        title,
        subtitle,
        category,
        location,
        description,
        start_date: startDate,
        end_date: endDate,
        year: Number(startDate.slice(0, 4)),
        show_in_notice: showInNotice,
        is_notice: false,
        views: 0,
        images: uploadedImages.images,
      };
    } else if (boardKey === 'surveys') {
      const startDate = String(formData.get('start_date') || '').trim();
      const endDate = String(formData.get('end_date') || '').trim() || startDate;
      const googleFormUrl = String(formData.get('google_form_url') || '').trim();

      if (!startDate) return { success: false, message: '설문 시작일을 입력해 주세요.' };
      if (endDate < startDate) {
        return { success: false, message: '종료일은 시작일 이후여야 합니다.' };
      }
      if (!googleFormUrl) {
        return { success: false, message: '구글폼 URL을 입력해 주세요.' };
      }
      if (!/^https?:\/\//i.test(googleFormUrl)) {
        return { success: false, message: '구글폼 URL은 http(s):// 로 시작해야 합니다.' };
      }

      payload = {
        title,
        description,
        start_date: startDate,
        end_date: endDate,
        google_form_url: googleFormUrl,
        questions: [],
        show_in_notice: showInNotice,
        is_notice: false,
        views: 0,
      };
    } else {
      payload.views = 0;
    }

    const supa = await createAdminClient();
    const { error } = await supa.from(meta.tableName).insert(payload);
    if (error) {
      if (boardKey === 'resources' && payload.file_path) {
        await removeStorageFile(payload.file_path);
      }
      if (boardKey === 'events' && Array.isArray(payload.images)) {
        for (const image of payload.images) {
          await removeEventImageFile(image.path, image.bucket);
        }
      }
      if (
        boardKey === 'events' &&
        /images['"]?\s*column|schema cache/i.test(String(error.message || ''))
      ) {
        return {
          success: false,
          message:
            'DB에 images 컬럼이 없습니다. Supabase에서 sql/advisory_events.sql 의 alter 문을 실행해 주세요.',
        };
      }
      throw error;
    }

    revalidatePath(`/pediatric/boards/${boardKey}`);
    revalidatePath('/pediatric/dashboard');
    return { success: true };
  } catch (error) {
    console.error(error);
    return { success: false, message: error.message || '등록에 실패했습니다.' };
  }
}

export async function deleteBoardItem(boardKey, id) {
  const meta = PEDIATRIC_BOARD_META[boardKey];
  if (!meta) {
    return { success: false, message: '알 수 없는 게시판입니다.' };
  }

  try {
    const supa = await createAdminClient();

    let filePath = null;
    let eventImages = [];
    if (boardKey === 'resources') {
      const { data: existing } = await supa
        .from(meta.tableName)
        .select('file_path')
        .eq('id', id)
        .maybeSingle();
      filePath = existing?.file_path || null;
    }
    if (boardKey === 'events') {
      const { data: existing } = await supa
        .from(meta.tableName)
        .select('images')
        .eq('id', id)
        .maybeSingle();
      eventImages = normalizeEventImages(existing?.images);
    }

    const { error } = await supa.from(meta.tableName).delete().eq('id', id);
    if (error) throw error;

    if (filePath) {
      await removeStorageFile(filePath);
    }
    for (const image of eventImages) {
      await removeEventImageFile(image.path, image.bucket);
    }

    revalidatePath(`/pediatric/boards/${boardKey}`);
    revalidatePath('/pediatric/dashboard');
    return { success: true };
  } catch (error) {
    console.error(error);
    return { success: false, message: error.message || '삭제에 실패했습니다.' };
  }
}

export async function toggleBoardFlag(boardKey, id, field, value) {
  const meta = PEDIATRIC_BOARD_META[boardKey];
  if (!meta) {
    return { success: false, message: '알 수 없는 게시판입니다.' };
  }
  if (!['is_notice', 'show_in_notice'].includes(field)) {
    return { success: false, message: '잘못된 필드입니다.' };
  }

  try {
    const supa = await createAdminClient();
    const { error } = await supa.from(meta.tableName).update({ [field]: value }).eq('id', id);
    if (error) throw error;

    revalidatePath(`/pediatric/boards/${boardKey}`);
    return { success: true };
  } catch (error) {
    console.error(error);
    return { success: false, message: error.message || '변경에 실패했습니다.' };
  }
}

export async function updateBoardItem(boardKey, id, formData) {
  const meta = PEDIATRIC_BOARD_META[boardKey];
  if (!meta) {
    return { success: false, message: '알 수 없는 게시판입니다.' };
  }

  try {
    const title = String(formData.get('title') || '').trim();
    const description = String(formData.get('description') || '').trim();
    const isNotice = formData.get('is_notice') === 'on';
    const showInNotice = formData.get('show_in_notice') === 'on';

    if (!title) {
      return { success: false, message: '제목을 입력해 주세요.' };
    }

    const supa = await createAdminClient();
    let payload = {};
    let oldFilePath = null;
    let newFilePath = null;
    let removedEventImages = [];

    if (boardKey === 'resources') {
      payload = {
        title,
        description,
        is_notice: isNotice,
        show_in_notice: showInNotice,
      };

      const file = formData.get('file');
      if (file && typeof file !== 'string' && file.size) {
        const { data: existing } = await supa
          .from(meta.tableName)
          .select('file_path')
          .eq('id', id)
          .maybeSingle();
        oldFilePath = existing?.file_path || null;

        const uploaded = await uploadResourceFile(file);
        if (uploaded.error) {
          return { success: false, message: uploaded.error };
        }
        payload.file_path = uploaded.file_path;
        payload.file_name = uploaded.file_name;
        payload.file_type = uploaded.file_type;
        newFilePath = uploaded.file_path;
      }
    } else if (boardKey === 'events') {
      const category = String(formData.get('category') || '').trim().slice(0, 3);
      const subtitle = String(formData.get('subtitle') || '').trim();
      const location = String(formData.get('location') || '').trim();
      const startDate = String(formData.get('start_date') || '').trim();
      const endDate = String(formData.get('end_date') || '').trim() || startDate;

      if (!category) return { success: false, message: '카테고리를 입력해 주세요. (최대 3글자)' };
      if (!location) return { success: false, message: '장소를 입력해 주세요.' };
      if (!startDate) return { success: false, message: '시작일을 입력해 주세요.' };
      if (endDate < startDate) {
        return { success: false, message: '종료일은 시작일 이후여야 합니다.' };
      }

      payload = {
        title,
        subtitle,
        category,
        location,
        description,
        start_date: startDate,
        end_date: endDate,
        year: Number(startDate.slice(0, 4)),
        show_in_notice: showInNotice,
        is_notice: false,
      };

      const { data: existing } = await supa
        .from(meta.tableName)
        .select('images')
        .eq('id', id)
        .maybeSingle();
      const previousImages = normalizeEventImages(existing?.images);
      const manageImages = formData.get('manage_images') === '1';
      const files = formData.getAll('images');
      const hasNewImages = files.some((file) => file && typeof file !== 'string' && file.size);

      if (manageImages) {
        const keepItems = parseKeepEventImages(formData);
        const keptImages = previousImages.filter((image) =>
          keepItems.some((keep) => isSameEventImage(image, keep)),
        );
        removedEventImages = previousImages.filter(
          (image) => !keepItems.some((keep) => isSameEventImage(image, keep)),
        );

        let nextImages = keptImages.map((image) => ({
          path: image.path || undefined,
          name: image.name || 'image',
          bucket: image.bucket || undefined,
          url: image.url || undefined,
        }));

        if (hasNewImages) {
          const uploadedImages = await uploadEventImages(files);
          if (uploadedImages.error) {
            return { success: false, message: uploadedImages.error };
          }
          nextImages = [...nextImages, ...uploadedImages.images];
          newFilePath = uploadedImages.images.map((image) => image.path).join('|') || null;
        }

        payload.images = nextImages;
      } else if (hasNewImages) {
        const uploadedImages = await uploadEventImages(files);
        if (uploadedImages.error) {
          return { success: false, message: uploadedImages.error };
        }

        payload.images = uploadedImages.images;
        removedEventImages = previousImages;
        newFilePath = uploadedImages.images.map((image) => image.path).join('|') || null;
      }
    } else if (boardKey === 'surveys') {
      const startDate = String(formData.get('start_date') || '').trim();
      const endDate = String(formData.get('end_date') || '').trim() || startDate;
      const googleFormUrl = String(formData.get('google_form_url') || '').trim();

      if (!startDate) return { success: false, message: '설문 시작일을 입력해 주세요.' };
      if (endDate < startDate) {
        return { success: false, message: '종료일은 시작일 이후여야 합니다.' };
      }
      if (!googleFormUrl) {
        return { success: false, message: '구글폼 URL을 입력해 주세요.' };
      }
      if (!/^https?:\/\//i.test(googleFormUrl)) {
        return { success: false, message: '구글폼 URL은 http(s):// 로 시작해야 합니다.' };
      }

      payload = {
        title,
        description,
        start_date: startDate,
        end_date: endDate,
        google_form_url: googleFormUrl,
        show_in_notice: showInNotice,
        is_notice: false,
      };
    } else {
      return { success: false, message: '수정할 수 없는 게시판입니다.' };
    }

    const { error } = await supa.from(meta.tableName).update(payload).eq('id', id);
    if (error) {
      if (boardKey === 'resources' && newFilePath) await removeStorageFile(newFilePath);
      if (boardKey === 'events' && Array.isArray(payload.images) && newFilePath) {
        for (const image of payload.images) {
          if (image.path && String(newFilePath).split('|').includes(image.path)) {
            await removeEventImageFile(image.path, image.bucket);
          }
        }
      }
      if (
        boardKey === 'events' &&
        /images['"]?\s*column|schema cache/i.test(String(error.message || ''))
      ) {
        return {
          success: false,
          message:
            'DB에 images 컬럼이 없습니다. Supabase에서 sql/advisory_events.sql 의 alter 문을 실행해 주세요.',
        };
      }
      throw error;
    }

    if (boardKey === 'resources' && oldFilePath && newFilePath && oldFilePath !== newFilePath) {
      await removeStorageFile(oldFilePath);
    }
    if (boardKey === 'events' && removedEventImages.length) {
      for (const image of removedEventImages) {
        await removeEventImageFile(image.path, image.bucket);
      }
    }

    revalidatePath(`/pediatric/boards/${boardKey}`);
    revalidatePath('/pediatric/dashboard');
    if (boardKey === 'surveys') {
      revalidatePath(`/pediatric/boards/surveys/${id}`);
    }
    return { success: true };
  } catch (error) {
    console.error(error);
    return { success: false, message: error.message || '수정에 실패했습니다.' };
  }
}

/** 자료실 파일 열람용 URL (다운로드 Disposition 아님 — 뷰어 inline) */
export async function getResourceViewUrl(id) {
  try {
    const meta = PEDIATRIC_BOARD_META.resources;
    const supa = await createAdminClient();
    const { data, error } = await supa
      .from(meta.tableName)
      .select('file_path, file_name, file_type, title')
      .eq('id', id)
      .maybeSingle();

    if (error) throw error;
    if (!data?.file_path) {
      return { success: false, message: '등록된 파일이 없습니다.' };
    }

    const filePath = data.file_path;
    if (/^https?:\/\//i.test(filePath)) {
      return {
        success: true,
        url: filePath,
        fileName: data.file_name || '',
        fileType: data.file_type || 'pdf',
        title: data.title || '',
      };
    }

    if (!BUCKET_NAME) {
      return {
        success: false,
        message: '스토리지 버킷 설정(PEDIATRIC_SUPABASE_STORAGE_BUCKET)이 없습니다.',
      };
    }

    const legacyBucket = process.env.NEXT_PUBLIC_SUPABASE_STORAGE_BUCKET;
    let signed = null;
    let signError = null;

    ({ data: signed, error: signError } = await supa.storage
      .from(BUCKET_NAME)
      .createSignedUrl(filePath, 60 * 30));

    if (
      (signError || !signed?.signedUrl) &&
      legacyBucket &&
      legacyBucket !== BUCKET_NAME
    ) {
      ({ data: signed, error: signError } = await supa.storage
        .from(legacyBucket)
        .createSignedUrl(filePath, 60 * 30));
    }

    if (signError || !signed?.signedUrl) {
      return {
        success: false,
        message:
          signError?.message ||
          '열람 URL을 만들지 못했습니다. 스토리지 버킷이 private인지 확인해 주세요.',
      };
    }

    return {
      success: true,
      url: signed.signedUrl,
      fileName: data.file_name || '',
      fileType: data.file_type || 'pdf',
      title: data.title || '',
    };
  } catch (error) {
    console.error('[getResourceViewUrl]', error);
    return { success: false, message: error.message || '열람 URL 조회에 실패했습니다.' };
  }
}
